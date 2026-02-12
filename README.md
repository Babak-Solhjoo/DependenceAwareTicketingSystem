# Dependency Aware Ticketing System

Fullstack TODO app with React + TypeScript frontend and Node.js + Express + TypeScript backend. Includes JWT auth, recurring tasks, dependencies, and a MySQL database with local file uploads for profile photos.

## Quick Start (Docker)
1. Copy `.env.example` to `.env` and update secrets.
2. Run `docker compose up --build`.
3. Run migrations from the backend container:
   - `docker compose exec backend npm run prisma:migrate`

Frontend: http://localhost:5173
Backend: http://localhost:4000

## Local Development
1. Create `.env` from `.env.example` and update `DATABASE_URL` for your local MySQL.
2. Backend:
   - `cd backend`
   - `npm install`
   - `npm run prisma:generate`
   - `npm run prisma:migrate`
   - `npm run dev`
3. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`

## Tests
- Backend: `cd backend` then `npm test`
- Frontend: `cd frontend` then `npm test`

## Profile Photo Storage
Profile photos are stored locally under `uploads/` and served by the backend.


# Contacts:
- Linkedin: https://www.linkedin.com/in/babak-solhjoo-533938a2/
- Webpage: https://babak-solhjoo.com/ 
