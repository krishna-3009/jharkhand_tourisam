import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './database/pool.js';
import { MySQLSessionStore } from './database/mysql-session-store.js';

const sessionStore = new MySQLSessionStore(pool);

try {
  await Promise.all([
    pool.query('SELECT 1 FROM users LIMIT 0'),
    sessionStore.ready,
  ]);
} catch (error) {
  if (error.code === 'ER_DBACCESS_DENIED_ERROR' || error.code === 'ER_TABLEACCESS_DENIED_ERROR') {
    const databaseName = env.database.name.replaceAll('`', '``');
    const mysqlUser = env.database.user.replaceAll("'", "''");
    console.error(`MySQL user '${env.database.user}' does not have access to database '${env.database.name}'.`);
    console.error('Connect to MySQL as an administrator and run:');
    console.error(`GRANT SELECT, INSERT, UPDATE, DELETE ON \`${databaseName}\`.* TO '${mysqlUser}'@'localhost';`);
    console.error('Then run FLUSH PRIVILEGES; and restart the API.');
  } else if (error.code === 'ER_NO_SUCH_TABLE') {
    console.error('The required MySQL tables are missing.');
    console.error('From backend/, run: mysql -u root -p < sql/schema.sql');
    console.error('From the project root, run: mysql -u root -p < backend/sql/schema.sql');
  } else if (error.code === 'ER_NO_DB_ERROR' || error.code === 'ER_BAD_DB_ERROR') {
    console.error(`MySQL database '${env.database.name}' does not exist on ${env.database.host}:${env.database.port}.`);
    console.error('Create the database and required tables from the project root with:');
    console.error('mysql -u root -p < backend/sql/schema.sql');
    console.error('Then make sure DB_NAME in backend/.env matches the database name in backend/sql/schema.sql.');
  } else if (error.code === 'HANDSHAKE_SSL_ERROR' || error.code === 'ERR_SSL_TLSV1_ALERT_PROTOCOL_VERSION') {
    console.error(`TLS negotiation with MySQL at ${env.database.host}:${env.database.port} failed.`);
    console.error(`Current DB_SSL_MODE: ${env.database.sslMode}.`);
    console.error('For Aiven, verify the service host and port. For certificate verification, set DB_SSL_MODE=verify-ca and provide the CA certificate with DB_SSL_CA or DB_SSL_CA_PATH.');
    if (error.message) console.error(`TLS detail: ${error.message}`);
  } else if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
    console.error(`Could not resolve MySQL host '${env.database.host}'. Copy DB_HOST exactly from Aiven's service connection information and check DNS/network access.`);
  } else {
    console.error(`Could not verify the MySQL database (${error.code || 'connection error'}). Check MySQL is reachable and DB_* settings in backend/.env are correct.`);
  }
  await pool.end().catch(() => {});
  process.exit(1);
}

const app = createApp(sessionStore);
const server = app.listen(env.port, '0.0.0.0', () => {
  console.log(`Jharkhand Tourism API listening on port ${env.port}`);
});

const cleanupTimer = setInterval(() => {
  pool.execute('DELETE FROM sessions WHERE expires <= ?', [Date.now()])
    .catch((error) => console.error('Session cleanup failed:', error.message));
}, 60 * 60 * 1000);
cleanupTimer.unref();

async function shutdown() {
  clearInterval(cleanupTimer);
  server.close(async () => {
    await pool.end().catch(() => {});
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
