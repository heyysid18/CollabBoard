# 📡 API Documentation

Base URL: `http://localhost:5001/api`

## 🔐 Authentication

### Register
`POST /auth/register`
- **Body**: `{ "username": "sid", "email": "sid@example.com", "password": "securePass123" }`
- **Response**: `201 Created` + JWT Token

### Login
`POST /auth/login`
- **Body**: `{ "email": "sid@example.com", "password": "securePass123" }`
- **Response**: `200 OK` + JWT Token

---

## 📋 Boards

### Get All Boards
`GET /boards`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
  "owned": [ { "_id": "...", "title": "My Board" } ],
  "shared": [ { "_id": "...", "title": "Team Board" } ]
}
```

### Create Board
`POST /boards`
- **Body**: `{ "title": "New Project" }`
- **Response**: `201 Created`

### Get Single Board
`GET /boards/:id`
- **Response**: Full board object with populated Lists and Members.

###  Invite Member
`POST /boards/:id/invite`
- **Body**: `{ "email": "colleague@example.com" }`
- **Response**: `200 OK`

---

## 📝 Lists & Tasks

### Create List
`POST /lists`
- **Body**: `{ "boardId": "...", "title": "To Do" }`

### Create Task
`POST /tasks`
- **Body**: `{ "boardId": "...", "listId": "...", "title": "Fix Bug", "priority": "High" }`

### Update Task (Move / Edit)
`PUT /tasks/:id`
- **Body**: `{ "listId": "...", "position": 1024, "title": "Updated Title" }`
- **Note**: Triggers `task_moved` or `task_updated` socket event.

### Assign User
`PATCH /tasks/:id/assign`
- **Body**: `{ "assignee": "userId" }` (or `null` to unassign)

### Search Tasks
`GET /tasks?boardId=...&search=keyword&page=1`
- **Query Params**:
    - `search`: Text to search in title/description.
    - `page`: Page number (default 1).
    - `limit`: Items per page (default 50).

---

## 🔍 Activity Logs

### Get Board Activity
`GET /activities/:boardId`
- **Query Params**: `page=1`, `limit=20`
- **Response**: Paginated list of audit logs.
