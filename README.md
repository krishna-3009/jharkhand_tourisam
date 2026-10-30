# Jharkhand Tourism

A tourism website with a React frontend, an Express API, and MySQL-backed account storage. The repository uses npm workspaces: install dependencies once at the root, then run each service from the root scripts.

## Project structure

```text
jharkhand-main/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express middleware and route registration
│   │   ├── server.js              # Startup checks, listener, shutdown handling
│   │   ├── config/env.js          # Environment validation and configuration
│   │   ├── controllers/           # Request handlers
│   │   ├── database/              # MySQL pool and session store
│   │   ├── middleware/            # Origin checks, rate limits, error handling
│   │   └── routes/                # Auth and health routes
│   ├── sql/schema.sql             # MySQL database and table definitions
│   ├── .env.example               # Safe configuration template
│   └── package.json
├── frontend/
│   ├── src/                       # React application
│   ├── public/                    # Static assets
│   ├── legacy-html-css/           # Preserved original standalone HTML/CSS version
│   ├── vite.config.js             # Local /api proxy
│   └── package.json
├── .gitignore
├── package.json                  # Workspace commands
└── package-lock.json
```

`backend/server.js` remains as a small compatibility launcher. New backend code belongs under `backend/src/`.

## Requirements

- Node.js compatible with the Vite version in `frontend/package.json`.
- MySQL Server running locally for account registration and login.

## Local setup

### 1. Install dependencies

From the project root:

```sh
npm install
```

### 2. Create the MySQL schema

From the project root, run the schema as a MySQL administrator:

```sh
mysql -u root -p < backend/sql/schema.sql
```

Create an application user with access to the database selected by `DB_NAME` in `backend/.env.example`. For the supplied example configuration:

```sql
CREATE USER IF NOT EXISTS 'jharakhand_database'@'localhost' IDENTIFIED BY 'choose-a-strong-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON `myproject`.* TO 'jharakhand_database'@'localhost';
FLUSH PRIVILEGES;
```

If you change `DB_NAME` or `DB_USER`, update the database/schema and grant command to match. The API user needs read/write access to both `users` and `sessions` tables.

### 3. Configure the backend

Copy the example file and edit the local copy:

```sh
cp backend/.env.example backend/.env
```

Set `DB_PASSWORD` to the password you chose for the MySQL application user. Generate a private session secret with:

```sh
openssl rand -base64 48
```

Put that value in `SESSION_SECRET`. Keep `backend/.env` private; Git ignores it.

### 4. Start both services

Open two terminals in the project root.

Terminal 1 — API:

```sh
npm run server:dev
```

Terminal 2 — website:

```sh
npm run dev
```

Open the frontend URL printed by Vite, usually `http://localhost:5173`. The Vite development server proxies `/api` requests to the API on port 3001.

You can also launch the API while your terminal is in `backend/`:

```sh
node server.js
```

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite frontend |
| `npm run server:dev` | Start the API with file watching |
| `npm run server` | Start the API for production |
| `npm run build` | Build the frontend |
| `npm run preview` | Preview the frontend production build |
| `npm run deploy` | Publish the static frontend using the configured GitHub Pages script |

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check API and database availability |
| `GET` | `/api/auth/me` | Return the current signed-in user |
| `POST` | `/api/auth/register` | Create an account and sign in |
| `POST` | `/api/auth/login` | Sign in with email and password |
| `POST` | `/api/auth/logout` | End the server-side session |

Passwords are hashed with bcrypt before they reach the database. The browser receives an HTTP-only session cookie; it never stores the password. Account rows and session rows are stored in MySQL.

## Troubleshooting MySQL permissions

If the API reports that a MySQL user cannot access its database, run a grant as a MySQL administrator. Use the exact `DB_NAME` and `DB_USER` values from `backend/.env`:

```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON `myproject`.* TO 'jharakhand_database'@'localhost';
FLUSH PRIVILEGES;
```

If it reports missing tables, run the schema from the project root:

```sh
mysql -u root -p < backend/sql/schema.sql
```

## Production deployment

GitHub Pages can serve the static frontend but cannot run this Express API or MySQL. Deploy the API to a Node.js host and MySQL to a database host. Configure the backend environment variables on the API host, set `FRONTEND_ORIGINS` to the exact website origin, and build the frontend with `VITE_API_BASE_URL` set to the API URL.

Use HTTPS for both services. `COOKIE_SAME_SITE=none` requires HTTPS and cross-site cookies may be blocked by browsers; a same-site API/frontend deployment or reverse proxy is more reliable. Before public signup, configure email verification, password reset, account deletion, privacy/terms pages, and monitoring.

## Git and secrets

The root `.gitignore` excludes dependency folders, build output, local environment files, logs, uploads, and editor/OS files. Commit `.env.example`; do not commit `.env`.
