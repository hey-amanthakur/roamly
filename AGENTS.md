# AGENTS.md

## Tech Stack
- **Frontend**: React 18, React Router v5, TypeScript 5, react-scripts (CRA) 5.
- **Backend**: Node.js 22+, Express 5, TypeScript 5, Mongoose 8.
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
- **Auth**: JWT with 3-day expiry, bcryptjs (10 rounds) — hashes are compatible with native bcrypt.
- **Validation**: Input sanitization is handled in `server/utils/sanitize.ts`.
- **Middleware**: Custom boxes used for idempotency, locking, and rate limiting (see `server/middleware/`). Rate limiting runs after CORS so rejected requests keep CORS headers; OPTIONS preflights are exempt.
- **Security**: helmet is enabled (CSP off for swagger-ui; CORP `cross-origin` so the client can embed GridFS images).
- **TypeScript**: No explicit `any` annotations — narrow with `unknown`, mongoose `FilterQuery`/`PipelineStage`/`UpdateQuery`, etc.
- **Lockfiles**: npm only — do not commit `yarn.lock` alongside `package-lock.json`.
