# TrustLayer — Deployment Guide

Provider-agnostic deployment using Docker Compose. Runs on any Linux VPS
(Ubuntu, Debian, etc.) or locally on any machine with Docker installed.

---

## Architecture

```
Browser
  └── :80  → nginx (reverse proxy)
               ├── /api/* → backend:8000  (FastAPI + uvicorn)
               └── /*     → frontend:3000 (React, served by nginx:alpine)
                              └── db:5432  (PostgreSQL 15)
```

All four containers share a private Docker network (`trustlayer-network`).
Only nginx is exposed to the host on port 80.

---

## 1. Local Deployment with Docker Compose

### Prerequisites

- Docker Desktop (v4+) or Docker Engine + Compose plugin on Linux

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/StartupFold/trustlayer-terms-dashboard-v1.git
cd trustlayer-terms-dashboard-v1

# 2. Create your environment file
cp .env.example .env
# Edit .env and set a strong SECRET_KEY

# 3. Build and start all containers
docker compose -f deployment/docker-compose.yml up --build -d

# 4. Check container status
docker compose -f deployment/docker-compose.yml ps

# 5. View logs
docker compose -f deployment/docker-compose.yml logs -f
```

The app is available at **http://localhost**

### Stopping

```bash
docker compose -f deployment/docker-compose.yml down

# To also remove the database volume (destroys all data):
docker compose -f deployment/docker-compose.yml down -v
```

---

## 2. Running the Seed Script (First Deployment)

After the containers start for the first time, create the super admin account:

```bash
docker compose -f deployment/docker-compose.yml exec backend \
  python seed_super_admin.py
```

This creates:
- **Email:** `admin@trustlayer.com`
- **Password:** `SuperAdmin123!`
- **Role:** `super_admin`

The script is idempotent — safe to run multiple times.

---

## 3. Deploying to a Linux VPS

### Prerequisites on the VPS

```bash
# Install Docker Engine (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh

# Add your user to the docker group (avoid sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker compose version
```

### Deployment Steps

```bash
# 1. SSH into your VPS
ssh user@your-server-ip

# 2. Clone the repo
git clone https://github.com/StartupFold/trustlayer-terms-dashboard-v1.git
cd trustlayer-terms-dashboard-v1

# 3. Create and configure .env
cp .env.example .env
nano .env   # Set real SECRET_KEY, passwords, and DOMAIN

# 4. Start the stack
docker compose -f deployment/docker-compose.yml up --build -d

# 5. Seed the super admin
docker compose -f deployment/docker-compose.yml exec backend \
  python seed_super_admin.py
```

App is live at `http://your-server-ip`

---

## 4. Environment Variables

| Variable | Description | Default |
|---|---|---|
| `SECRET_KEY` | JWT signing key — **generate a strong random value** | — |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT expiry | `30` |
| `DATABASE_URL` | Postgres connection string | `postgresql://postgres:postgres@db:5432/trustlayer` |
| `REACT_APP_API_URL` | API base URL baked into the React build | `http://localhost` |
| `POSTGRES_USER` | Postgres user | `postgres` |
| `POSTGRES_PASSWORD` | Postgres password | `postgres` |
| `POSTGRES_DB` | Database name | `trustlayer` |
| `DOMAIN` | Your domain name (used for HTTPS setup) | `localhost` |

**Generate a secure SECRET_KEY:**

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## 5. Setting a Domain Name

1. Point your domain's A record to the VPS IP in your DNS provider.
2. Set `DOMAIN=yourdomain.com` in `.env`.
3. Set `REACT_APP_API_URL=http://yourdomain.com` in `.env`.
4. Update `nginx.conf`: change `server_name localhost;` to `server_name yourdomain.com;`
5. Rebuild and restart: `docker compose -f deployment/docker-compose.yml up --build -d`

---

## 6. Enabling HTTPS with Let's Encrypt

```bash
# 1. Install certbot on the VPS
sudo apt install certbot

# 2. Stop nginx temporarily (frees port 80 for certbot)
docker compose -f deployment/docker-compose.yml stop nginx

# 3. Obtain the certificate
sudo certbot certonly --standalone -d yourdomain.com

# 4. Copy certs to the deployment folder
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem deployment/nginx/certs/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem deployment/nginx/certs/

# 5. Uncomment the HTTPS server block in deployment/nginx/nginx.conf
#    and add a port-80 → HTTPS redirect block.

# 6. Uncomment "443:443" in the nginx service in docker-compose.yml

# 7. Restart the stack
docker compose -f deployment/docker-compose.yml up -d
```

**Auto-renewal:** Add a cron job to run `certbot renew` and restart nginx.

---

## 7. Updating the Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart (zero-downtime via rolling restart)
docker compose -f deployment/docker-compose.yml up --build -d
```

Database migrations run automatically on backend container startup (`alembic upgrade head`).

---

## 8. Useful Docker Commands

```bash
# View running containers
docker compose -f deployment/docker-compose.yml ps

# Follow logs for a specific service
docker compose -f deployment/docker-compose.yml logs -f backend

# Open a shell in the backend container
docker compose -f deployment/docker-compose.yml exec backend sh

# Connect to the database
docker compose -f deployment/docker-compose.yml exec db \
  psql -U postgres -d trustlayer
```
