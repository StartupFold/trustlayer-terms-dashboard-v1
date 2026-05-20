# TrustLayer Terms Dashboard — Claude Code Instructions

## Project Overview
A multi-tenant SaaS platform where organizations can manage Terms & Conditions, 
track user acceptance, and maintain policy version history.

## Tech Stack
- Backend: FastAPI, Python 3.11, SQLAlchemy ORM, Alembic, JWT
- Frontend: React, Bootstrap 4.1, Axios, React Router
- Database: PostgreSQL
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

## Task Rules (IMPORTANT)
- Complete ONE task at a time
- Do not move to the next task until the current one is done
- If something is unclear, stop and ask — do not assume
- Do not install packages not listed in requirements.txt without asking first