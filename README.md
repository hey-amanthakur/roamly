<div align="center">

# Travel Experience Sharing Platform

**A full-stack web application for sharing travel experiences, stories, and photos with the world.**

[![React](https://img.shields.io/badge/React-17-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

---

[Quick Start](#quick-start) | [Features](#features) | [API Reference](docs/API.md) | [Architecture](docs/ARCHITECTURE.md) | [Contributing](docs/CONTRIBUTING.md)

</div>

---

## Overview

TravelExperience is a platform where travelers share their adventures through stories, photos, and location-tagged posts. Users can discover trending destinations, follow fellow travelers, bookmark inspiring content, and engage through comments and likes.

## Features

### Core

| Feature | Description |
|---------|-------------|
| **JWT Authentication** | Secure register/login with bcrypt hashing and token-based auth |
| **CRUD Posts** | Create, edit, delete travel stories with multi-image uploads |
| **Comments & Likes** | Engage with posts through comments and like/unlike |
| **Bookmarks** | Save posts to read later |
| **Follow Users** | Build a social graph — follow/unfollow travelers |
| **User Profiles** | Profile pictures, bios, follower/following counts |

### Discovery

| Feature | Description |
|---------|-------------|
| **Full-text Search** | Search across titles, descriptions, tags, categories, and locations |
| **Tag System** | Flexible tagging (`#budget`, `#europe`, `#hiking`) alongside categories |
| **Trending Posts** | Posts from the last 3 days ranked by engagement |
| **Personalized Feed** | Posts from followed users and preferred categories |
| **Related Posts** | "You might also like" based on tags, categories, and author |
| **Sort Options** | Latest, Popular, Trending, Most Discussed |

### Travel-Specific

| Feature | Description |
|---------|-------------|
| **Photo Galleries** | Multi-image uploads with lightbox viewer and navigation |
| **Location Tagging** | Tag posts with preset or custom locations (city, country, coordinates) |
| **Travel Categories** | Organize by Adventure, Budget, Luxury, Solo, etc. |

### UX

| Feature | Description |
|---------|-------------|
| **Draft Posts** | Save without publishing — publish when ready |
| **Dark Mode** | System-preference-aware theme toggle, persisted in localStorage |
| **Responsive Design** | Mobile hamburger menu, adaptive layouts |
| **Pagination** | Server-side pagination on all list views |

### Trust & Safety

| Feature | Description |
|---------|-------------|
| **Report Content** | Report posts/comments/users with 6 reason categories |
| **Input Validation** | Server + client validation on all endpoints |
| **Secure Uploads** | File type filtering, size limits, randomized filenames |

### Growth

| Feature | Description |
|---------|-------------|
| **Newsletter Subscription** | Email subscription via sidebar widget |
| **Share to Social** | Web Share API with clipboard fallback |
| **Author Analytics** | Dashboard with views, likes, comments, and post stats |

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Client** | React 17, React Router v5, Axios, Context API |
| **Server** | Node.js, Express, Mongoose, Multer, JWT, bcrypt |
| **Database** | MongoDB 5 |
| **DevOps** | Docker, Docker Compose |
| **Auth** | JWT (3-day expiry), bcrypt (10 rounds) |

## Quick Start

### Prerequisites

- [Docker & Docker Compose](https://docs.docker.com/get-docker/) (recommended)
- **Or** Node.js 16+ and MongoDB running locally

### With Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/<your-username>/travel-experience-sharing-platform.git
cd travel-experience-sharing-platform

# Configure environment
cp .env.example .env

# Start all services
docker compose up --build
```

### Without Docker

```bash
# Terminal 1 — Server
cd server
cp .env.example .env
# Edit .env: set MONGO_URL=mongodb://localhost:27017/travel-blog
npm install
npm run dev

# Terminal 2 — Client
cd client
npm install
npm start
```

### Access

| Service | URL |
|---------|-----|
| **Client** | http://localhost:3000 |
| **API** | http://localhost:5001/api |
| **MongoDB** | mongodb://localhost:27017 |

### Seed Categories

```bash
curl -X POST http://localhost:5001/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Adventure"}'

curl -X POST http://localhost:5001/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Budget"}'

curl -X POST http://localhost:5001/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Solo"}'

curl -X POST http://localhost:5001/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Luxury"}'
```

## Project Structure

```
travel-experience-sharing-platform/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── header/              # Hero banner
│   │   │   ├── locationInput/       # Location picker with presets
│   │   │   ├── newsletter/          # Newsletter signup widget
│   │   │   ├── photoGallery/        # Multi-image lightbox gallery
│   │   │   ├── post/                # Post card component
│   │   │   ├── posts/               # Post grid layout
│   │   │   ├── reportModal/         # Content reporting modal
│   │   │   ├── shareButton/         # Share/Web Share API
│   │   │   ├── sidebar/             # Categories + newsletter sidebar
│   │   │   ├── singlePost/          # Full post view + comments
│   │   │   └── topbar/              # Nav + search + dark mode
│   │   ├── context/                 # React Context (auth + theme)
│   │   ├── pages/
│   │   │   ├── bookmarks/           # Saved posts
│   │   │   ├── dashboard/           # Author analytics
│   │   │   ├── homepage/            # Feed with sort/filter
│   │   │   ├── login/               # Login page
│   │   │   ├── profile/             # User profile + follow
│   │   │   ├── register/            # Registration page
│   │   │   ├── settings/            # Account settings
│   │   │   ├── single/              # Single post page
│   │   │   ├── trending/            # Trending posts
│   │   │   └── write/               # Create/edit posts
│   │   ├── config.js                # API URL configuration
│   │   ├── App.js                   # Router setup
│   │   └── index.js                 # Entry point
│   └── Dockerfile
├── server/                          # Express API
│   ├── middleware/
│   │   └── auth.js                  # JWT verification middleware
│   ├── models/
│   │   ├── Category.js              # Category schema
│   │   ├── Newsletter.js            # Newsletter subscription schema
│   │   ├── Post.js                  # Post schema (tags, gallery, location, comments, likes, bookmarks, views)
│   │   ├── Report.js                # Content report schema
│   │   └── User.js                  # User schema (followers, bookmarks, preferences)
│   ├── routes/
│   │   ├── analytics.js             # Author dashboard + post analytics
│   │   ├── auth.js                  # Register + login
│   │   ├── bookmarks.js             # Toggle + list bookmarks
│   │   ├── categories.js            # CRUD categories
│   │   ├── newsletter.js            # Subscribe + unsubscribe
│   │   ├── posts.js                 # CRUD + like + comment + feed + related + drafts
│   │   ├── reports.js               # Content reporting
│   │   ├── search.js                # Full-text search
│   │   └── users.js                 # CRUD + follow/unfollow
│   ├── images/                      # Uploaded images (git-ignored)
│   ├── index.js                     # Server entry point
│   └── Dockerfile
├── docs/
│   ├── API.md                       # Full API reference
│   ├── ARCHITECTURE.md              # System design + data models
│   ├── CONTRIBUTING.md              # Dev setup + conventions
│   └── DOCKER.md                    # Docker troubleshooting
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Overview

<details>
<summary><strong>Authentication</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |

</details>

<details>
<summary><strong>Posts</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/posts` | Yes | Create a post |
| GET | `/api/posts` | No | List posts (pagination, sort, filter) |
| GET | `/api/posts/:id` | No | Get single post (increments views) |
| PUT | `/api/posts/:id` | Yes | Update a post |
| DELETE | `/api/posts/:id` | Yes | Delete a post |
| PUT | `/api/posts/:id/like` | Yes | Like/unlike a post |
| POST | `/api/posts/:id/comments` | Yes | Add a comment |
| DELETE | `/api/posts/:postId/comments/:commentId` | Yes | Delete a comment |
| GET | `/api/posts/:id/related` | No | Get related posts |
| GET | `/api/posts/feed/for-you` | Yes | Personalized feed |
| GET | `/api/posts/user/drafts` | Yes | User's draft posts |

</details>

<details>
<summary><strong>Users</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/:id` | No | Get user profile |
| PUT | `/api/users/:id` | Yes | Update profile |
| DELETE | `/api/users/:id` | Yes | Delete account |
| PUT | `/api/users/:id/follow` | Yes | Follow a user |
| PUT | `/api/users/:id/unfollow` | Yes | Unfollow a user |

</details>

<details>
<summary><strong>Other</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/search?q=` | No | Full-text search |
| PUT | `/api/bookmarks/posts/:id` | Yes | Toggle bookmark |
| GET | `/api/bookmarks` | Yes | List bookmarks |
| POST | `/api/reports` | Yes | Report content |
| POST | `/api/newsletter` | No | Subscribe to newsletter |
| POST | `/api/newsletter/unsubscribe` | No | Unsubscribe |
| GET | `/api/analytics/dashboard` | Yes | Author analytics dashboard |
| GET | `/api/analytics/posts/:id` | Yes | Single post analytics |
| POST | `/api/upload` | Yes | Upload image |
| POST | `/api/categories` | No | Create category |
| GET | `/api/categories` | No | List categories |

</details>

> Full documentation with request/response examples: [docs/API.md](docs/API.md)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017/travel-blog` |
| `JWT_SECRET` | Secret key for JWT signing | — (required) |
| `PORT` | Server port | `5001` |
| `REACT_APP_API_URL` | API base URL for client | `http://localhost:5001/api` |
| `REACT_APP_IMAGES_URL` | Images base URL for client | `http://localhost:5001/images` |

## Contributing

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for development setup, branch strategy, commit conventions, and PR process.

## License

ISC
