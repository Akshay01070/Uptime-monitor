# AI Development Log — Uptime Monitor

## 1. AI Tech Stack

| Tool | Role |
|------|------|
| **Cursor** | IDE and agent interface for generating, editing, and iterating on code |
| **Claude Sonnet** | Primary model for backend logic, database layer, worker, and API design |
| **ChatGPT** | Supplementary use for architecture questions and prompt refinement |

---

## 2. Prompts Used

Prompts were written incrementally—one feature at a time—rather than as a single mega-prompt. Each phase built on the previous output. Summaries below; full prompt text is preserved in project notes.

### Project Setup

- Scaffolded a monorepo with `/backend`, `/frontend`, and root `docker-compose.yml`.
- Specified stack: Node.js + Express + TypeScript (backend), React + Vite + TypeScript (frontend), SQLite via `better-sqlite3`.
- Requested TypeScript init, `package.json` scripts (`dev`, `build`, `start`), and a root `.gitignore`.
- Backend: `GET /health` returning `{ "status": "ok" }`.
- Frontend: placeholder page titled **Uptime Monitor**.
- Explicitly deferred business logic to later prompts.

### Backend APIs

- Added SQLite storage with auto-init on startup and two tables: `monitored_urls`, `health_checks`.
- Implemented URL management with controller/service separation:
  - `POST /urls` — validate http/https, reject duplicates, return proper errors.
  - `GET /urls` — list URLs with embedded `latest_check`.
  - `GET /urls/:id/history` — full check history, newest first.

### Worker Implementation

- Background monitor running every 60 seconds via `node-cron`.
- Fetches all monitored URLs, sends HTTP GET with 5s timeout, continues on individual failures.
- Persists each check as a new row (no overwrites).
- UP/DOWN rules: 2xx/3xx → UP; 4xx/5xx, DNS, connection, and timeout errors → DOWN.
- Worker starts during application bootstrap in `index.ts`.

### Frontend Dashboard

- URL list with status badges, response time, and last-checked timestamp.
- Form to add new URLs via `POST /urls`.
- Click a row → modal fetches `GET /urls/:id/history` and shows timestamp, status code, response time, and UP/DOWN.
- Auto-refresh every 15 seconds.

### Dockerization

- Multi-stage Dockerfiles for backend (Node) and frontend (Vite build → nginx).
- `docker-compose.yml` with backend on port 4000, frontend on port 3000, and a named volume for SQLite persistence.
- `VITE_API_URL` passed as a build arg so the frontend bundle points at the correct API host.

---

## 3. Course Correction

**Issue:** During Docker setup, the frontend was initially configured to call `http://backend:4000` (the Docker Compose service name). API requests failed in the browser because service names only resolve inside the Docker network—not from the user's machine where the browser runs.

**Fix:** Use `VITE_API_URL=http://localhost:4000` as a build-time variable in `docker-compose.yml`. The browser reaches the published host port; Docker internal DNS is not used for client-side fetch calls. Local development keeps a separate `.env.development` pointing at `http://localhost:3001`.

**Takeaway:** AI often conflates server-side and client-side networking. Environment variables should distinguish *where the code runs* (browser vs container) from *how services are named in Compose*.
