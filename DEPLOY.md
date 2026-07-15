Deployment Guide

This repository contains a Node/Express backend and a Vite + React frontend. Below are quick options to deploy locally using Docker, and notes for common cloud providers.

Prerequisites
- Docker & Docker Compose installed

Local Docker (recommended quick deploy)

1. From the repository root build and start services:

```bash
docker-compose up -d --build
```

2. Open the app:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

Notes:
- The `docker-compose.yml` maps the SQLite DB file at `backend/bookwormd.sqlite` into the backend container so data persists between restarts.
- Nginx in the frontend container proxies `/api/*` to the backend service name `backend` so the app works without CORS issues.

Pushing to production

- Vercel / Netlify: Deploy the `frontend` folder directly (Vite project). Point API calls to your backend URL (update `vite.config.js` or set `VITE_API_URL`).
- Render / Fly / Heroku: Use the provided `Dockerfile`s to deploy both services. On Render you can create a web service from a Dockerfile and set the build context to the appropriate subfolder.

Tips
- To run migrations or seed data, run any scripts inside the `backend` folder before or after starting. Example:

```bash
docker-compose exec backend node seed.js
```

- To tail logs:

```bash
docker-compose logs -f
```

If you'd like, I can run `docker-compose up` here to start containers and verify the deployed endpoints. Confirm and I'll proceed.