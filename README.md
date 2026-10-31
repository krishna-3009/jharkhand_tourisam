# Jharkhand Tourism

React frontend with an Express API, MySQL account and per-user saved-trip storage, and Express sessions persisted in MySQL. The frontend and backend have separate npm projects; install and run them from their own folders.

## Structure

```text
jharkhand-main/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/env.js
│   │   ├── controllers/auth.controller.js
│   │   ├── database/              # MySQL pool and session store
│   │   ├── middleware/
│   │   └── routes/
│   ├── sql/schema.sql
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── api/                    # Vercel same-origin API proxy
│   ├── src/
│   ├── public/
│   ├── .env.example
│   └── package.json
├── render.yaml
└── .gitignore
```

## Local development

Install each application's dependencies:

```sh
cd backend && npm ci
cp .env.example .env
```

In a second terminal:

```sh
cd frontend && npm ci
cp .env.example .env.local
npm run dev
```

The frontend example leaves `VITE_API_BASE_URL` blank so Vite proxies `/api` to `http://localhost:3001`. Run the API in another terminal:

```sh
cd backend && npm start
```

Set `DB_PASSWORD` and generate `SESSION_SECRET` with `openssl rand -base64 48`. Local MySQL defaults to `DB_SSL_MODE=disabled`. For Aiven locally, set `DB_SSL_MODE=verify-ca` and provide its CA certificate using `DB_SSL_CA_PATH` or `DB_SSL_CA`.

Apply the idempotent schema as a MySQL administrator from the project root, including when updating an existing database:

```sh
mysql -u root -p < backend/sql/schema.sql
```

The schema script creates the `saved_trips` table with a foreign key to `users`; it does not remove existing users or tables. Existing account and session tables are retained.

## Authentication behavior

- Passwords are hashed with bcrypt; passwords and hashes are never returned to the frontend.
- Login and registration regenerate the session, set its user ID, and wait for MySQL session storage before responding.
- `/api/auth/me` returns `{ "user": null }` for a confirmed signed-out session and the user record for a valid session.
- React uses one shared authentication provider so the header and account page update together. A temporary `/me` network/database failure preserves an already-loaded account state.
- Session cookies are HTTP-only, secure in production, and persist for seven days. “Keep me signed in” extends a login to 30 days.
- Logout deletes the server-side session, clears its cookie, updates shared frontend state, and returns to the home page.

## My trips

- Saved destinations and attractions are stored in MySQL `saved_trips`, linked to the user ID from the authenticated Express session.
- `GET`, `POST`, `PUT`, and `DELETE /api/trips` routes require a valid session. Each query filters by `req.session.userId`; clients cannot choose an owner ID.
- The trip planner loads after authentication is restored, so a refresh or a later login shows that account's saved trips.
- Existing browser-only trip lists may have been shared between users on that device. They are left untouched in browser storage but are not imported into an account because their original owner cannot be determined safely. Save the intended places again while signed in.
- After deploying this update to an existing database, apply `backend/sql/schema.sql` before starting the new API version.

## Deploy the API to Render

The included `render.yaml` describes a Node web service rooted at `backend/`. In Render, create a Blueprint from the repository and supply the variables marked as unsynchronized:

| Variable | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `COOKIE_SAME_SITE` | `none` |
| `COOKIE_SECURE` | `true` |
| `FRONTEND_ORIGINS` | Comma-separated exact origins: `https://krishna-3009.github.io,https://jharkhand-tourisam.vercel.app` |
| `DB_HOST` | Aiven service host |
| `DB_PORT` | Aiven service port |
| `DB_NAME` | `defaultdb` |
| `DB_USER` | `avnadmin` or a restricted application user |
| `DB_PASSWORD` | Aiven password |
| `DB_SSL_MODE` | `verify-ca` |
| `DB_SSL_CA` | CA certificate PEM downloaded from Aiven |
| `SESSION_SECRET` | Fresh random value from `openssl rand -base64 48` |

Render supplies `PORT`; the server binds to it and to `0.0.0.0`. It also identifies Render through `RENDER_SERVICE_ID` and trusts the single Render proxy hop for client IP rate limiting and secure session cookies. Keep `NODE_ENV=production` set in the Render service. Do not set a changing session secret at each deploy: all instances and restarts need the same `SESSION_SECRET` or signed cookies become invalid. `DB_SSL_CA` is a public CA certificate, not a private key. The API verifies it in `verify-ca` mode.

After the first deployment, copy the API's `https://…onrender.com` origin into `frontend/.env.production.local`:

```sh
VITE_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com
```

Build and publish the frontend from `frontend/`:

```sh
npm run deploy
```

For GitHub Pages, `VITE_API_BASE_URL` must be present at build time and point to Render. For Vercel, set the project Root Directory to `frontend` so it deploys `frontend/api/[...path].js`, then use that same-origin proxy: leave `VITE_API_BASE_URL` unset, set Vercel's server-side `API_ORIGIN` to the Render API origin (it defaults to the service name in `render.yaml`), and include the Vercel production origin in Render's `FRONTEND_ORIGINS`. The `*.vercel.app` hostname automatically uses the proxy; set `VITE_USE_SAME_ORIGIN_API=true` for a custom Vercel domain. Redeploy both services after changing environment variables.

## Cookie and browser notes

GitHub Pages and a Render API are cross-site, so browsers may block their session cookies. The Vercel API function forwards `/api` through the frontend's own origin to avoid third-party cookie restrictions. The Render API still uses `SameSite=None; Secure`, credentialed requests, exact-origin CORS, and trusted proxy settings. Render environment variables must be updated when the frontend origin changes.

Locally, use `NODE_ENV=development`, `COOKIE_SAME_SITE=lax`, `COOKIE_SECURE=false`, and the localhost origins from `backend/.env.example`. Keep `backend/.env`, `.env.local`, and deployment secrets out of Git.

## Verification and troubleshooting

- `GET /api/health` checks API-to-database connectivity and is also Render's health-check endpoint.
- `GET /api/auth/me` should return an object with `user` set to `null` or the current account.
- In browser DevTools, inspect the login/register response for `Set-Cookie`, then check that later `/api/auth/me` requests include the `jh.sid` cookie. `HttpOnly` means frontend JavaScript cannot read it.
- If the browser shows CORS errors, compare the request's `Origin` with `FRONTEND_ORIGINS` exactly.
- If no cookie is stored, verify HTTPS, `COOKIE_SAME_SITE=none`, `secure=true`, and the `Set-Cookie` response. If the cookie is sent but `user` is null, check that the session row with that session ID exists in Aiven and that the `SESSION_SECRET` is unchanged.
- Ensure the GitHub Pages build points to the deployed Render API, not `localhost`.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | API and database health check |
| `GET` | `/api/auth/me` | Current session user, or `null` |
| `POST` | `/api/auth/register` | Create account and session |
| `POST` | `/api/auth/login` | Authenticate and create session |
| `POST` | `/api/auth/logout` | Destroy session and clear cookie |
