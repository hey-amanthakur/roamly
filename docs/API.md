# API Reference

Base URL: `http://localhost:5000/api`

All request/response bodies use `application/json` unless noted otherwise.

## Authentication

### Register

```
POST /api/auth/register
```

**Body:**
```json
{
  "username": "string (required, 3-30 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 chars)"
}
```

**Response (201):** User object without password.

---

### Login

```
POST /api/auth/login
```

**Body:** `{ "username": "...", "password": "..." }`

**Response (200):** User object + JWT token.

---

## Users

### Get User

```
GET /api/users/:id
```

### Update User

```
PUT /api/users/:id
Authorization: Bearer <token>
```

**Body (all optional):** `{ "username", "email", "password", "bio", "profilePic" }`

### Delete User

```
DELETE /api/users/:id
Authorization: Bearer <token>
```

### Follow User

```
PUT /api/users/:id/follow
Authorization: Bearer <token>
```

### Unfollow User

```
PUT /api/users/:id/unfollow
Authorization: Bearer <token>
```

---

## Posts

### Create Post

```
POST /api/posts
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "string (required)",
  "desc": "string (required)",
  "photo": "string (optional)",
  "photos": ["string"] (optional),
  "categories": ["string"] (optional),
  "tags": ["string"] (optional),
  "location": {
    "name": "string",
    "city": "string",
    "country": "string",
    "lat": 48.85,
    "lng": 2.35
  },
  "status": "published | draft"
}
```

### Update Post

```
PUT /api/posts/:id
Authorization: Bearer <token>
```

### Delete Post

```
DELETE /api/posts/:id
Authorization: Bearer <token>
```

### Get Post (increments view count)

```
GET /api/posts/:id
```

**Response includes:** `isLiked`, `isBookmarked`, `views`

### Get All Posts

```
GET /api/posts
```

**Query Parameters:**
| Param    | Type   | Values                     |
|----------|--------|----------------------------|
| `user`   | string | Filter by username         |
| `cat`    | string | Filter by category         |
| `tag`    | string | Filter by tag              |
| `sort`   | string | `popular`, `trending`, `most_discussed` |
| `status` | string | `published` (default), `draft` |
| `page`   | number | Page number                |
| `limit`  | number | Results per page (max 50)  |

### Personalized Feed

```
GET /api/posts/feed/for-you
Authorization: Bearer <token>
```

Returns posts from followed users or matching preferred categories.

### Related Posts

```
GET /api/posts/:id/related
```

Returns up to 5 related posts (same categories, tags, or author).

### User Drafts

```
GET /api/posts/user/drafts
Authorization: Bearer <token>
```

### Like/Unlike

```
PUT /api/posts/:id/like
Authorization: Bearer <token>
```

### Add Comment

```
POST /api/posts/:id/comments
Authorization: Bearer <token>
```

**Body:** `{ "text": "string (required)" }`

### Delete Comment

```
DELETE /api/posts/:postId/comments/:commentId
Authorization: Bearer <token>
```

---

## Search

```
GET /api/search?q=keyword&page=1&limit=10
```

Searches across title, description, tags, categories, and location.

---

## Bookmarks

### Toggle Bookmark

```
PUT /api/bookmarks/posts/:id
Authorization: Bearer <token>
```

### Get Bookmarks

```
GET /api/bookmarks?page=1&limit=10
Authorization: Bearer <token>
```

---

## Reports

### Create Report

```
POST /api/reports
Authorization: Bearer <token>
```

**Body:**
```json
{
  "targetType": "post | comment | user",
  "targetId": "string",
  "reason": "spam | inappropriate | harassment | false-information | copyright | other",
  "description": "string (optional, max 500)"
}
```

---

## Newsletter

### Subscribe

```
POST /api/newsletter
```

**Body:** `{ "email": "string" }`

### Unsubscribe

```
POST /api/newsletter/unsubscribe
```

**Body:** `{ "email": "string" }`

---

## Analytics

### Post Analytics

```
GET /api/analytics/posts/:id
Authorization: Bearer <token>
```

**Response:** `{ "views", "likes", "bookmarks", "comments" }`

### Author Dashboard

```
GET /api/analytics/dashboard?page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "posts": [{ "postId", "title", "status", "views", "likes", "bookmarks", "comments" }],
  "stats": { "totalPosts", "totalViews", "totalLikes", "totalComments" },
  "total": 10,
  "page": 1,
  "pages": 1
}
```

---

## Categories

### Create Category

```
POST /api/categories
```

### Get All Categories

```
GET /api/categories
```

---

## File Upload

### Upload Image

```
POST /api/upload
Content-Type: multipart/form-data
```

**Form Fields:** `file` (image, max 5MB), `name` (filename)

**Response:** `{ "filename": "1234567890-image.jpg" }`
