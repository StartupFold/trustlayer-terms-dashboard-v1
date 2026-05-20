# TrustLayer Terms Dashboard — Claude Code Instructions

## Project Overview
A multi-tenant SaaS platform where organizations can manage Terms & Conditions, 
track user acceptance, and maintain policy version history.

## Tech Stack
- Backend: FastAPI, Python 3.11, SQLAlchemy ORM, Alembic, JWT
- Frontend: React, Bootstrap 4.1, Axios, React Router
- Database: PostgreSQL 18
- Deployment: Docker, Docker Compose, Nginx

## Repo Structure
See the /backend and /frontend folders. Follow the existing structure strictly.
Do not create new folders or files outside the defined structure without being asked.

## Database Rules
- ORM only — never write raw SQL
- All schema changes go through Alembic migrations
- Models live in backend/app/models/

## Code Rules
- Never hardcode passwords, secrets, or API keys
- All config loaded from .env via config.py
- Keep files small and modular
- Add a comment block at the top of every new file explaining its purpose

## Auth
- JWT-based authentication
- Single users table with role field: `admin` or `user`
- Users belong to an organization via organization_id FK
- Passwords truncated to 72 chars before bcrypt hashing

## Environment
- Python 3.11.9 (use `py -3.11` on Windows)
- Virtual environment: venv/ in project root
- Activate with: venv\Scripts\activate
- PostgreSQL 18 running on localhost:5432
- Database name: trustlayer
- DB user: postgres / password: postgres
- bcrypt version: 4.0.1 (do not upgrade)
- Node.js LTS installed

## Running the Backend
- Always activate venv first
- cd backend
- uvicorn app.main:app --reload --port 8000
- API docs at http://127.0.0.1:8000/docs

## Running the Frontend
- cd frontend
- npm start
- Runs on http://localhost:3000

## Task Rules (IMPORTANT)
- Complete ONE task at a time
- Do not move to the next task until the current one is done
- If something is unclear, stop and ask — do not assume
- Do not install packages not listed in requirements.txt without asking first

## Current Progress
- ✅ Phase 0: Repo setup
- ✅ Phase 1a: Monorepo scaffold complete
- ✅ Phase 1b: All 5 database models implemented
- ✅ Phase 1c: database.py and config.py implemented
- ✅ Phase 1d: Alembic migrations — all 5 tables live in PostgreSQL
- ✅ Phase 2: JWT Authentication (register + login tested and working)
- ✅ Phase 3: Policy CRUD (all 5 endpoints tested and working)
- ✅ Phase 4: Policy Versioning (auto-increments on update, tested)
- ✅ Phase 5: Acceptance Tracking (public endpoint, stores IP + user agent)
- ✅ Phase 6: Audit Logs (admin only, returns all acceptance logs)
- ⬜ Phase 7: Frontend pages
- ⬜ Phase 8: Docker + Nginx
- ⬜ Phase 9: Polish + README

## API Endpoints (All Working)
- POST /api/register
- POST /api/login
- POST /api/token (OAuth2 form login)
- GET /api/policies
- POST /api/policies
- PUT /api/policies/{id}
- DELETE /api/policies/{id}
- POST /api/policies/{id}/publish
- GET /api/policies/{id}/versions
- POST /api/policies/{id}/accept (public)
- GET /api/audit-logs (admin only)

## Frontend Pages To Build
- LoginPage.js — email/password login form
- DashboardPage.js — total policies, total acceptances, recent activity
- PoliciesPage.js — list policies, create, edit, delete
- PolicyViewPage.js — public policy page with "I Agree" button
- AuditLogsPage.js — table of acceptance logs

## Next Step
Node.js LTS is installed. Run npm install in frontend/ folder
then build all 5 React pages one by one.