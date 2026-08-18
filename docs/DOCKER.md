# Docker Development Setup

## Overview

Docker Compose runs 3 services for local development:

| Service  | Image                | Port  | Purpose              |
|----------|----------------------|-------|----------------------|
| `client` | node:18-alpine       | 3000  | React dev server     |
| `server` | node:18-alpine       | 5000  | Express API          |
| `mongo`  | mongo:5              | 27017 | MongoDB database     |

## Quick Start

```bash
# Clone and setup
git clone <repo-url>
cd travel-experience-sharing-platform
cp .env.example .env

# Build and start
docker compose up --build

# Or run in background
docker compose up -d --build
```

## Common Commands

```bash
# Start all services
docker compose up

# Start in background
docker compose up -d

# Stop all services
docker compose down

# Stop and remove volumes (fresh database)
docker compose down -v

# Rebuild after dependency changes
docker compose up --build

# View logs
docker compose logs -f
docker compose logs -f server
docker compose logs -f client

# Access a container shell
docker compose exec server sh
docker compose exec mongo mongosh
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
MONGO_URL=mongodb://mongo:27017/travel-blog
JWT_SECRET=your-secret-key-change-this
PORT=5000
```

> When running in Docker, the MongoDB hostname is `mongo` (the service name),
> not `localhost`. The `.env.example` is pre-configured for Docker.

## Volumes

| Mount               | Container Path      | Purpose              |
|---------------------|---------------------|----------------------|
| `./server`          | `/app/server`       | Hot-reload server    |
| `./client/src`      | `/app/client/src`   | Hot-reload client    |
| `mongo-data`        | `/data/db`          | Persist database     |

## Networking

All services communicate on the `travel-net` Docker network.

- Client → Server: `http://server:5000`
- Server → Mongo: `mongodb://mongo:27017`
- External access: `localhost:3000` (client), `localhost:5000` (API)

## Troubleshooting

### Port already in use

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
lsof -ti:27017 | xargs kill -9
```

### MongoDB connection refused

```bash
# Ensure mongo container is running
docker compose ps
docker compose logs mongo
```

### Client not connecting to API

Check `client/package.json` proxy setting — it should point to `http://localhost:5000` for local Docker dev. The Dockerfile handles this automatically.

### Fresh start (reset database)

```bash
docker compose down -v
docker compose up --build
```

### Container build cache issues

```bash
docker compose build --no-cache
```
