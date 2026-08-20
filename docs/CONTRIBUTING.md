# Contributing Guide

## Development Setup

### With Docker (recommended)

```bash
cp .env.example .env
docker compose up --build
```

The client hot-reloads on file changes. Server uses nodemon for auto-restart.

### Without Docker

**Prerequisites:** Node.js 16+, MongoDB running locally.

```bash
# Terminal 1 — Server
cd server
cp .env.example .env   # edit MONGO_URL to mongodb://localhost:27017/roamly
npm install
npm run dev

# Terminal 2 — Client
cd client
npm install
npm start
```

## Branch Strategy

```
main          ← production-ready code
├── develop   ← integration branch
│   ├── feature/xxx
│   ├── fix/xxx
│   └── refactor/xxx
```

### Creating a branch

```bash
git checkout develop
git checkout -b feature/add-comments
```

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add comment system to posts
fix: resolve auth crash on null user
refactor: extract validation into middleware
docs: update API reference
chore: add Docker dev environment
```

## Code Style

### Server (Node.js/Express)

- Use `const` by default, `let` only when reassignment is needed
- Async/await for all database operations
- Destructure imports when possible
- Route handlers go in `server/routes/`
- Shared logic goes in `server/middleware/` or `server/utils/`
- Mongoose schemas go in `server/models/`

### Client (React)

- Functional components only (no class components)
- Use React hooks (`useState`, `useEffect`, `useContext`)
- Component files: PascalCase (`SinglePost.jsx`)
- CSS files: lowercase matching component (`singlePost.css`)
- Place new components in `client/src/components/`
- Place new pages in `client/src/pages/`

### Naming

```
Files:      PascalCase.jsx, camelCase.js
Variables:  camelCase
Constants:  UPPER_SNAKE_CASE
Functions:  camelCase
```

## Adding a New API Route

1. Create or edit file in `server/routes/`
2. Import Express router
3. Define route with proper HTTP method
4. Add validation middleware if needed
5. Wire into `server/index.js` with `app.use("/api/<resource>", route)`
6. Update `docs/API.md`

## Adding a New Page

1. Create directory in `client/src/pages/<PageName>/`
2. Create `<PageName>.jsx` and `<PageName>.css`
3. Add route in `client/src/App.js`
4. Update navigation in `TopBar.jsx` if needed

## Testing

```bash
# Server — manual testing with curl or Postman
# See docs/API.md for all endpoints

# Client
cd client
npm test
```

## Pull Request Process

1. Create PR from `feature/xxx` → `develop`
2. Fill in PR description with:
   - What changed
   - Why it changed
   - How to test
3. Ensure no console errors or warnings
4. Request review from a maintainer
5. Squash and merge after approval
