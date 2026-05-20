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

## Running the Backend
- Always activate venv first
- cd backend
- uvicorn app.main:app --reload --port 8000
- API docs at http://127.0.0.1:8000/docs

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
- ⬜ Phase 3: Policy CRUD
- ⬜ Phase 4: Policy Versioning
- ⬜ Phase 5: Acceptance Tracking
- ⬜ Phase 6: Audit Logs
- ⬜ Phase 7: Frontend pages
- ⬜ Phase 8: Docker + Nginx
- ⬜ Phase 9: Polish + README

## Next Step
Implement Policy CRUD in backend/app/routes/policy_routes.py 
and backend/app/services/policy_service.py with these endpoints:
GET /api/policies — list all policies for the organization
POST /api/policies — create a new policy
PUT /api/policies/{id} — edit a policy
DELETE /api/policies/{id} — delete a policy
POST /api/policies/{id}/publish — publish a policy