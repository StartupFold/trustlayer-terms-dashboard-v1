# TrustLayer Terms Dashboard — CLAUDE.md

## Project Overview
Multi-tenant SaaS platform where organizations can manage Terms & Conditions,
track user acceptance, and maintain policy version history.

## Repo
https://github.com/StartupFold/trustlayer-terms-dashboard-v1

## HOW WE WORK
- Prompts are crafted in Claude.ai first, then pasted into Claude Code
- One task at a time — never combine unrelated features
- Screenshot results back to Claude.ai after every task
- Commit manually after every completed and tested feature
- Never ask Claude Code to commit
- Commit format: "Phase X: Feature name implemented and tested"

## Tech Stack
- Backend: FastAPI, Python 3.11, SQLAlchemy ORM, Alembic, JWT
- Frontend: React, Bootstrap 4.1, Axios, React Router
- Database: PostgreSQL 18
- Deployment: Docker, Docker Compose, Nginx

## Environment (Windows)
- Python 3.11.9, venv in project root
- Activate venv: venv\Scripts\activate
- PostgreSQL 18, database: trustlayer, user: postgres/postgres
- bcrypt==4.0.1 (do not upgrade)
- Node.js v24.15.0 installed
- Backend runs: cd backend → uvicorn app.main:app --reload --port 8000
- Frontend runs: cd frontend → npm start
- Docker Desktop v29.4.3 installed and running

## Repo Structure
trustlayer-terms-dashboard-v1/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── schemas/
│   ├── requirements.txt
│   └── alembic/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── deployment/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx/nginx.conf
└── CLAUDE.md

## Database Rules
- ORM only — never write raw SQL
- All schema changes go through Alembic migrations
- Models live in backend/app/models/

## Code Rules
- Never hardcode passwords, secrets, or API keys
- All config loaded from .env via config.py
- Keep files small and modular
- Add a comment block at the top of every new file

## Auth
- JWT-based authentication
- Single users table with role field: admin or user
- Users belong to an organization via organization_id FK
- Passwords truncated to 72 chars before bcrypt hashing
- Test user: test@test.com / password123

## API Endpoints (All Working)
- POST /api/register
- POST /api/login
- POST /api/token
- GET /api/policies
- POST /api/policies
- PUT /api/policies/{id}
- DELETE /api/policies/{id}
- POST /api/policies/{id}/publish
- GET /api/policies/{id}/versions
- POST /api/policies/{id}/accept
- GET /api/audit-logs

## Current Progress
- ✅ Phase 0: Repo setup
- ✅ Phase 1a: Monorepo scaffold
- ✅ Phase 1b: All 5 database models
- ✅ Phase 1c: database.py and config.py
- ✅ Phase 1d: Alembic migrations
- ✅ Phase 2: JWT Authentication
- ✅ Phase 3: Policy CRUD
- ✅ Phase 4: Policy Versioning
- ✅ Phase 5: Acceptance Tracking
- ✅ Phase 6: Audit Logs
- ✅ Phase 7: All 5 frontend pages built and tested
- 🔄 Phase 8: Docker + Nginx (in progress)
- ⬜ Phase 9: README + Polish

## Phase 8 Status
Files created:
- deployment/Dockerfile.backend ← needs fix (see below)
- deployment/Dockerfile.frontend ✅
- deployment/nginx/nginx.conf ✅
- deployment/docker-compose.yml ✅

CURRENT BUG TO FIX:
In deployment/Dockerfile.backend, fix these lines:
  WRONG:  COPY alembic.ini .
  WRONG:  COPY alembic ./alembic
  RIGHT:  COPY backend/alembic.ini .
  RIGHT:  COPY backend/alembic ./alembic

## Next Step
1. Fix Dockerfile.backend paths (see above)
2. Run: docker compose -f deployment/docker-compose.yml up --build --force-recreate
3. Verify all 3 containers start successfully
4. Test app at http://localhost:80