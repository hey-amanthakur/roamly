# Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────┐
│                  Docker Network                  │
│                                                  │
│  ┌──────────┐   HTTP    ┌───────────┐   Mongoose │
│  │  Client   │──────────│  Server   │────────────│
│  │  :3000    │  proxy   │  :5001    │            │
│  │  (React)  │          │ (Express) │   ┌──────┐ │
│  └──────────┘          └───────────┘   │ Mongo│ │
│                                         │ :27017│ │
│                                         └──────┘ │
└─────────────────────────────────────────────────┘
```

## Data Models

### User

```
User {
  _id:          ObjectId (auto)
  username:     String (unique, required)
  email:        String (unique, required)
  password:     String (bcrypt hashed, required)
  profilePic:   String (default: "")
  createdAt:    Date (auto)
  updatedAt:    Date (auto)
}
```

### Post

```
Post {
  _id:          ObjectId (auto)
  title:        String (unique, required)
  desc:         String (required)
  photo:        String (optional)
  username:     String (required)          ← ref to User.username
  categories:   [String] (optional)
  likes:        [String] (user IDs)
  comments:     [Comment]
  createdAt:    Date (auto)
  updatedAt:    Date (auto)
}

Comment {
  username:     String
  text:         String
  createdAt:    Date
}
```

### Category

```
Category {
  _id:          ObjectId (auto)
  name:         String (unique, required)
  createdAt:    Date (auto)
  updatedAt:    Date (auto)
}
```

## Authentication Flow

```
1. Client sends POST /api/auth/login with { username, password }
2. Server validates credentials with bcrypt
3. Server generates JWT token (expires 3d)
4. Client stores token in localStorage
5. Client sends token in Authorization header on protected routes
6. Server middleware verifies token and attaches user to req.user
```

## Request Lifecycle

```
Client Request
      │
      ▼
  Express Router
      │
      ▼
  Auth Middleware (if protected route)
      │
      ▼
  Validation Middleware
      │
      ▼
  Route Handler
      │
      ▼
  Mongoose Model → MongoDB
      │
      ▼
  JSON Response → Client
```

## File Upload Flow

```
1. Client sends POST /api/upload with FormData (file + name)
2. Multer middleware saves file to server/images/
3. Returns filename to client
4. Client includes filename in post/user payload
5. Static middleware serves /images/* files
```

## Frontend State Management

```
React Context (AuthState)
├── user:        Current logged-in user object | null
├── isFetching:  Loading state for auth operations
├── error:       Error state for auth operations
└── dispatch:    Action dispatcher

Actions:
├── LOGIN_START / LOGIN_SUCCESS / LOGIN_FAILURE
├── UPDATE_START / UPDATE_SUCCESS / UPDATE_FAILURE
└── LOGOUT
```

## Route Protection

| Path         | Unauthenticated    | Authenticated |
|------------- |-------------------|---------------|
| `/`          | Homepage           | Homepage      |
| `/login`     | Login page         | Redirect → `/`|
| `/register`  | Register page      | Redirect → `/`|
| `/write`     | Redirect → `/register` | Write page |
| `/settings`  | Redirect → `/register` | Settings |
| `/post/:id`  | Single post        | Single post   |
