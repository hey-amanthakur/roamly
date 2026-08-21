# AGENTS.md

## Tech Stack
- **Frontend**: React 17, React Router v5, TypeScript.
- **Backend**: Node.js, Express, TypeScript, Mongoose.
- **Database**: MongoDB 5 with GridFS for image storage.

## Developer Commands

### Server
- Install: `cd server && npm install`
- Dev: `cd server && npm run dev`
- Build: `cd server && npm run build`
- Test: `cd server && npm test`

### Client
- Install: `cd client && npm install`
- Dev: `cd client && npm start`
- Build: `cd client && npm run build`
- Test: `cd client && npm test`

### Full Stack (Docker)
- Setup env: `cp .env.example .env`
- Start: `docker compose up --build`

## Architecture Notes
- **Monorepo**: Separated into `/client` and `/server`.
- **Image Storage**: Images are stored in MongoDB using GridFS, not the local filesystem.
- **API Base**: `http://localhost:5001/api`
- **Images Base**: `http://localhost:5001/api/images`

## Key Constraints
- **Auth**: JWT with 3-day expiry, bcrypt (10 rounds).
- **Validation**: Input sanitization is handled in `server/utils/sanitize.ts`.
- **Middleware**: Custom boxes used for idempotency, locking, and rate limiting (see `server/middleware/`).
