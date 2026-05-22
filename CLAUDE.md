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
- New features always on a new branch, never directly on main

## Tech Stack
- Backend: FastAPI, Python 3.11, SQLAlchemy ORM, Alembic, JWT
- Frontend: React, Bootstrap 4.1, Axios, React Router, jwt-decode
- Database: PostgreSQL 18
- Deployment: Docker, Docker Compose, Nginx
- Tunnel: Cloudflare Tunnel (cloudflared) for public access

## Environment (Windows)
- Python 3.11.9, venv in project root
- Activate venv: venv\Scripts\activate
- PostgreSQL 18, database: trustlayer, user: postgres/postgres
- bcrypt==4.0.1 (do not upgrade — pinned in Dockerfile too)
- Node.js v24.15.0
- Docker Desktop v29.4.3
- Backend runs: cd backend → uvicorn app.main:app --reload --port 8000
- Frontend runs: cd frontend → npm start
- Docker: docker compose -f deployment/docker-compose.yml up --build

## Daily Startup Routine
Terminal 1 (app):
  cd "C:\Users\artin\OneDrive\Desktop\Project 0\trustlayer-terms-dashboard-v1"
  docker compose -f deployment/docker-compose.yml up

Terminal 2 (public tunnel):
  cloudflared tunnel --url http://localhost:80

Copy the trycloudflare.com URL from Terminal 2 and share it.

## Accounts & Credentials
- Super Admin:  admin@trustlayer.com / SuperAdmin123!
- Org:          Artin AI (slug: technova-solutions)
- Org Admin:    admin1@admin.com / (your password)
- Test User:    test1@test.com

## Repo Structure
trustlayer-terms-dashboard-v1/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py        ← role guard (require_role)
│   │   ├── models/
│   │   │   ├── user.py            ← role + org_id columns
│   │   │   ├── organization.py    ← NEW: organizations table
│   │   │   ├── policy.py          ← org_id column
│   │   │   ├── policy_version.py
│   │   │   └── acceptance_log.py
│   │   ├── routes/
│   │   │   ├── auth_routes.py
│   │   │   ├── policy_routes.py
│   │   │   └── admin_routes.py    ← super admin endpoints
│   │   ├── services/
│   │   │   ├── policy_service.py
│   │   │   └── audit_service.py
│   │   └── schemas/
│   │       ├── policy_schema.py
│   │       ├── user_schema.py
│   │       └── organization_schema.py  ← NEW
│   ├── seed_super_admin.py        ← run once after first deploy
│   ├── requirements.txt
│   └── alembic/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js    ← NEW
│   │   │   ├── DashboardPage.js   ← role-aware
│   │   │   ├── PoliciesPage.js
│   │   │   ├── PolicyViewPage.js
│   │   │   ├── AuditLogsPage.js
│   │   │   └── AdminPage.js       ← NEW: super admin panel
│   │   ├── components/
│   │   │   ├── Navbar.js          ← role-aware
│   │   │   ├── PolicyForm.js
│   │   │   ├── PolicyTable.js
│   │   │   └── AuditTable.js
│   │   ├── api/
│   │   │   └── api.js             ← relative baseURL (works with any domain)
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── deployment/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── README-deployment.md
│   └── nginx/
│       └── nginx.conf             ← updated for tunnel compatibility
├── screenshots/                   ← add screenshots here
├── .env                           ← never commit (in .gitignore)
├── .env.example                   ← safe to commit
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

## Role System
- super_admin → full platform control, access to /admin
- org_admin   → scoped to their own org only
- user        → can accept policies

## API Endpoints (All Working)
### Auth
- POST /api/register
- POST /api/login
- POST /api/token

### Policies
- GET    /api/policies
- POST   /api/policies
- PUT    /api/policies/{id}
- DELETE /api/policies/{id}
- POST   /api/policies/{id}/publish
- GET    /api/policies/{id}/versions
- POST   /api/policies/{id}/accept

### Admin (super_admin only)
- GET    /api/admin/organizations
- POST   /api/admin/organizations
- DELETE /api/admin/organizations/{id}
- GET    /api/admin/users
- POST   /api/admin/users
- DELETE /api/admin/users/{id}
- GET    /api/admin/audit-logs
- GET    /api/admin/policies

## Frontend Routes
- /           → LoginPage
- /register   → RegisterPage
- /dashboard  → DashboardPage (role-aware)
- /policies   → PoliciesPage
- /policies/:id/view → PolicyViewPage
- /audit-logs → AuditLogsPage
- /admin      → AdminPage (super_admin only)

## Seed Script
- Location: backend/seed_super_admin.py
- Run inside Docker: docker exec -it deployment-backend-1 python seed_super_admin.py
- Run locally: cd backend → python seed_super_admin.py
- Must be run once after every fresh Docker database

## Current Progress
- ✅ Phase 0:  Repo setup
- ✅ Phase 1:  Database models + migrations
- ✅ Phase 2:  JWT Authentication
- ✅ Phase 3:  Policy CRUD
- ✅ Phase 4:  Policy Versioning
- ✅ Phase 5:  Acceptance Tracking
- ✅ Phase 6:  Audit Logs
- ✅ Phase 7:  All frontend pages built and tested
- ✅ Phase 8:  Docker + Nginx
- ✅ Phase 9:  README complete
- ✅ Phase 11: Role system — organizations table, role + org_id, JWT role claims
- ✅ Phase 12: Super admin routes, role guard, org schemas, seed script
- ✅ Phase 13: Admin panel frontend, register page, role-aware dashboard
- ✅ Phase 14: Production Docker + Nginx, .env config, deployment guide
- ✅ Fix:      bcrypt compatibility in Docker seed script and Dockerfile
- ✅ Fix:      API baseURL changed to relative path for tunnel/domain compatibility
- ✅ Fix:      Nginx updated for Cloudflare tunnel compatibility

## Git Branch Structure
- main ← stable, all phases merged
- feature/role-system           ← Phase 11 (merged)
- feature/super-admin           ← Phase 12 (merged)
- feature/user-management       ← Phase 13 (merged)
- feature/production-deployment ← Phase 14 (merged)

## Current Version
- Tag: v1.0.0
- Status: Live and accessible via Cloudflare Tunnel

## Deployment
- Local:  docker compose -f deployment/docker-compose.yml up
- Public: cloudflared tunnel --url http://localhost:80
- Guide:  deployment/README-deployment.md
- .env.example in project root — copy to .env before running
- Provider-agnostic — works on any Linux VPS

## Future Phases
- Phase 15: Org admin user management panel
- Phase 15: Email notifications (SendGrid/Mailgun)
- Phase 16: VPS deployment with real domain
- Phase 16: HTTPS via Let's Encrypt / Certbot
- Phase 17: Subscription billing ($10/month per org)

## Git Workflow
- Never ask Claude Code to commit
- Commit manually after every feature
- Format: "Phase X: Feature name implemented and tested"
- Always: git add . → git commit -m "..." → git push
- New features always on a new branch, never directly on main