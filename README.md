# TaskFlow — Task Manager API + UI

A full-stack Task Manager with a REST API backend (Express + SQLite) and a premium dark-mode frontend.

---

## 🚀 Getting Started

### 1. Start the Backend

```bash
cd backend
npm install
node server.js
```

Server starts at **http://localhost:3000**

### 2. Open the Frontend

Open `frontend/index.html` directly in your browser (or use VS Code Live Server).

---

## 📡 API Reference

**Base URL:** `http://localhost:3000/api`

### Task Object

```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "pending",
  "created_at": "2026-03-20 06:55:00"
}
```

`status` is either `"pending"` or `"completed"`.

---

### Endpoints

#### `GET /api/tasks`
List all tasks (newest first).

```bash
curl http://localhost:3000/api/tasks
```

**Response:** `200 OK` — array of task objects.

---

#### `POST /api/tasks`
Create a new task.

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread"}'
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | ✅ Yes | Cannot be empty |
| `description` | string | ❌ No | Defaults to `""` |

**Response:** `201 Created` — the new task object.  
**Error:** `400 Bad Request` if `title` is missing or blank.

```json
{ "error": "Title is required and cannot be empty." }
```

---

#### `PUT /api/tasks/:id`
Update a task's title, description, or status.

```bash
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries and fruit", "status": "completed"}'
```

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Cannot be empty if provided |
| `description` | string | Optional |
| `status` | string | Must be `"pending"` or `"completed"` |

**Response:** `200 OK` — updated task.  
**Error:** `400` for validation failure, `404` if task not found.

---

#### `PATCH /api/tasks/:id/toggle`
Toggle a task's status between `pending` and `completed`.

```bash
curl -X PATCH http://localhost:3000/api/tasks/1/toggle
```

**Response:** `200 OK` — updated task.  
**Error:** `404` if task not found.

---

#### `DELETE /api/tasks/:id`
Delete a task permanently.

```bash
curl -X DELETE http://localhost:3000/api/tasks/1
```

**Response:** `200 OK`
```json
{ "message": "Task 1 deleted successfully." }
```
**Error:** `404` if task not found.

---

#### `GET /api/health`
Health check endpoint.

```bash
curl http://localhost:3000/api/health
```
```json
{ "status": "ok", "timestamp": "2026-03-20T07:00:00.000Z" }
```

---

## 🗂 Project Structure

```
pulsing-photosphere/
├── backend/
│   ├── server.js          # Express server + SQLite init
│   ├── routes/
│   │   └── tasks.js       # All CRUD route handlers
│   ├── tasks.db           # Auto-generated SQLite database
│   └── package.json
├── frontend/
│   ├── index.html         # Single-page app
│   ├── style.css          # Dark mode glassmorphism styles
│   └── app.js             # API integration + UI logic
└── README.md
```

---

## ✅ Validation Rules

| Rule | HTTP Status |
|------|------------|
| `title` missing or empty on POST | `400` |
| `title` empty string on PUT | `400` |
| Invalid `status` value on PUT | `400` |
| Task ID not found | `404` |

---

## 🎨 Frontend Features

- **Add tasks** with title and description
- **Toggle complete** — click the circle checkbox
- **Edit tasks** — in-place modal editor
- **Delete tasks** — animated removal
- **Filter tabs** — All / Pending / Completed
- **Toast notifications** for all actions
- **Stats header** showing total and completed counts
