# TrustLayer Terms Dashboard

A multi-tenant SaaS platform for managing Terms & Conditions, tracking user acceptance, and maintaining policy version history. Built for organizations that need a reliable audit trail of who accepted which policy version and when.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | FastAPI, Python 3.11, SQLAlchemy ORM, Alembic, JWT |
| Frontend | React, Bootstrap 4.1, Axios, React Router |
| Database | PostgreSQL 18 |
| Deployment | Docker, Docker Compose, Nginx |

---

## Features

- **JWT Authentication** — Secure login with role-based access (`super_admin` / `org_admin`)
- **Email Policy Delivery** — Send policy acceptance requests via email with unique acceptance tokens
- **Policy Management** — Create, edit, delete, and publish Terms & Conditions policies
- **Policy Versioning** — Every published policy generates an immutable version snapshot
- **Acceptance Tracking** — Record and query which users accepted which policy version
- **Audit Logs** — Full audit trail of all policy and acceptance events across the organization
- **Multi-Tenant** — Organizations are isolated; each user belongs to exactly one organization

---

## Screenshots

![Login Page](screenshots/login.png)
![Dashboard](screenshots/dashboard.png)
![Admin Panel](screenshots/admin-panel.png)
![Policies Page](screenshots/policies.png)
![Audit Logs](screenshots/audit-logs.png)

---

## Project Structure

```
trustlayer-terms-dashboard-v1/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app entry point
│   │   ├── config.py         # Settings loaded from .env
│   │   ├── database.py       # SQLAlchemy engine and session
│   │   ├── models/           # ORM models (User, Organization, Policy, etc.)
│   │   ├── routes/           # API route handlers
│   │   ├── services/         # Business logic layer
│   │   └── schemas/          # Pydantic request/response schemas
│   ├── requirements.txt
│   └── alembic/              # Database migrations
├── frontend/
│   ├── src/
│   │   ├── pages/            # LoginPage, DashboardPage, PoliciesPage, etc.
│   │   ├── components/       # Reusable UI components
│   │   ├── api/api.js        # Axios API client
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── deployment/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx/nginx.conf
├── .env                      # Local environment variables (not committed)
└── CLAUDE.md
```

---

## Getting Started — Local Development

### Prerequisites

- Python 3.11
- Node.js v18+
- PostgreSQL 18 running locally

### 1. Clone the repo

```bash
git clone https://github.com/StartupFold/trustlayer-terms-dashboard-v1.git
cd trustlayer-terms-dashboard-v1
```

### 2. Set up the backend

```bash
# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/trustlayer
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email delivery (required for Send via Email feature)
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your@gmail.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587

# Base URL shown in email links (no trailing slash)
FRONTEND_URL=http://localhost:3000
```

> **Email setup tip:** For Gmail, enable 2FA and generate an App Password at  
> `myaccount.google.com → Security → App passwords`.

### 4. Set up the database and run migrations

```bash
# Create the database in PostgreSQL
createdb -U postgres trustlayer

# Run Alembic migrations
cd backend
alembic upgrade head
cd ..
```

### 5. Run the backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

API is available at `http://localhost:8000`  
Interactive docs at `http://localhost:8000/docs`

### 6. Run the frontend

```bash
cd frontend
npm install
npm start
```

Frontend is available at `http://localhost:3000`

---

## Getting Started — Docker

### Prerequisites

- Docker Desktop (v4.0+)

### Run all services with one command

```bash
docker compose -f deployment/docker-compose.yml up --build
```

This starts three containers:

| Container | Role | Port |
|-----------|------|------|
| backend | FastAPI + uvicorn | 8000 |
| frontend | React build served by nginx | 3000 |
| nginx | Reverse proxy | **80** |

The app is available at **http://localhost:80**

To stop all containers:

```bash
docker compose -f deployment/docker-compose.yml down
```

---

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/register` | Register a new user | No |
| POST | `/api/login` | Login and receive JWT token | No |
| POST | `/api/token` | OAuth2 token endpoint | No |
| GET | `/api/policies` | List all policies for org | Yes |
| POST | `/api/policies` | Create a new policy | Yes |
| PUT | `/api/policies/{id}` | Update a policy | Yes |
| DELETE | `/api/policies/{id}` | Delete a policy | Yes |
| POST | `/api/policies/{id}/publish` | Publish a policy (creates version) | Yes |
| GET | `/api/policies/{id}/versions` | Get all versions of a policy | Yes |
| POST | `/api/policies/{id}/accept` | Record user acceptance (supports `?token=`) | No |
| POST | `/api/policies/{id}/send` | Send policy acceptance email to recipients | Yes (admin) |
| GET | `/api/admin/audit-logs` | Acceptance log (org-scoped for org_admin) | Yes |
| POST | `/api/admin/organizations` | Create org + admin user account | Yes (super_admin) |

Full interactive API documentation is available at `http://localhost:8000/docs` when the backend is running.

---

## Test Credentials

A default test account is available for development:

```
Email:    test@test.com
Password: password123
```

---

## Deployment

For full deployment instructions (Docker Compose, VPS setup, HTTPS, seed script, environment variables), see:

**[deployment/README-deployment.md](deployment/README-deployment.md)**

Quick start with Docker:

```bash
cp .env.example .env   # configure your SECRET_KEY
docker compose -f deployment/docker-compose.yml up --build -d
```

App available at **http://localhost**

---

## Future Features

- Email notifications when a new policy version is published
- Bulk acceptance reports and CSV export
- Policy expiration dates and reminders
- SSO / SAML integration for enterprise organizations
- Webhook support for acceptance events
- Public policy acceptance page (no login required)
