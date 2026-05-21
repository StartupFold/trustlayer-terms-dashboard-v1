# TrustLayer Terms Dashboard — Handoff Summary

## Project
A full-stack SaaS platform where organizations manage Terms & Conditions,
track user acceptance, and maintain policy version history.
Repo: https://github.com/StartupFold/trustlayer-terms-dashboard-v1

## How We Communicate
1. Claude.ai (browser) = planning + crafting prompts ONLY
2. Claude Code (VS Code tab) = building the project
3. I paste prompts from here into Claude Code
4. I screenshot results back here
5. You say keep or fix
6. I commit manually after every completed feature
7. Never ask Claude Code to commit

## Prompt Format (always use this)
- Wrapped in a code block so I can copy easily
- Starts with: Read CLAUDE.md first.
- One task at a time
- Exact file names listed
- Ends with: When done, list every file modified and confirm X

## Environment (Windows)
- Python 3.11.9, venv in project root
- Activate venv: venv\Scripts\activate
- PostgreSQL 18, database: trustlayer, user: postgres/postgres
- bcrypt==4.0.1 (do not upgrade — pinned in Dockerfile too)
- Node.js v24.15.0
- Docker Desktop v29.4.3
- Backend: cd backend → uvicorn app.main:app --reload --port 8000
- Frontend: cd frontend → npm start
- Docker: docker compose -f deployment/docker-compose.yml up --build
- Super Admin: admin@trustlayer.com / SuperAdmin123!
- Test Org: Artin AI (slug: technova-solutions)
- Test Org Admin: admin1@admin.com
- Test User: test1@test.com

## Tech Stack
- Backend: FastAPI, Python 3.11, SQLAlchemy, Alembic, JWT
- Frontend: React, Bootstrap 4.1, Axios, React Router, jwt-decode
- Database: PostgreSQL 18
- Deployment: Docker, Docker Compose, Nginx

## Current Progress
- ✅ Phase 0: Repo setup
- ✅ Phase 1: Database models + migrations
- ✅ Phase 2: JWT Authentication
- ✅ Phase 3: Policy CRUD
- ✅ Phase 4: Policy Versioning
- ✅ Phase 5: Acceptance Tracking
- ✅ Phase 6: Audit Logs
- ✅ Phase 7: All 5 frontend pages built and tested
- ✅ Phase 8: Docker + Nginx complete
- ✅ Phase 9: README complete
- ✅ Phase 11: Role system — organizations table, role + org_id columns, JWT role claims
- ✅ Phase 12: Super admin routes, role guard, org schemas, seed script
- ✅ Phase 13: Admin panel frontend, register page, role-aware dashboard, audit logs URL fix
- ✅ Phase 14: Production Docker + Nginx, .env config, deployment guide
- ✅ Fix: bcrypt compatibility in Docker seed script and Dockerfile

## Role System
- super_admin — full platform control, access to Admin Panel
- org_admin — scoped to their own org (policies, users, audit logs)
- user — end user who accepts policies

## Git Branch Structure
- main ← stable, all phases merged
- feature/role-system ← Phase 11 (merged)
- feature/super-admin ← Phase 12 (merged)
- feature/user-management ← Phase 13 (merged)
- feature/production-deployment ← Phase 14 (merged)

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

## Frontend Pages
- /          → LoginPage
- /register  → RegisterPage
- /dashboard → DashboardPage (role-aware)
- /policies  → PoliciesPage
- /policies/:id/view → PolicyViewPage
- /audit-logs → AuditLogsPage
- /admin     → AdminPage (super_admin only)

## Database Tables
- users (id, email, password_hash, role, org_id, created_at)
- organizations (id, name, slug, is_active, created_at)
- policies (id, org_id, user_id, title, policy_type, is_published, created_at)
- policy_versions (id, policy_id, version_number, content, created_at)
- acceptance_logs (id, policy_id, policy_version_id, ip_address, user_agent, accepted_at)

## Seed Script
- Location: backend/seed_super_admin.py
- Run inside Docker: docker exec -it deployment-backend-1 python seed_super_admin.py
- Run locally: cd backend → python seed_super_admin.py

## Deployment
- Local: docker compose -f deployment/docker-compose.yml up --build
- Visit: http://localhost
- Guide: deployment/README-deployment.md
- .env.example in project root — copy to .env before running
- Provider-agnostic — works on any Linux VPS

## Remaining / Future Phases
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