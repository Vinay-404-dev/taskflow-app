# TaskFlow — Task Manager

A full-stack task manager web application built with **Node.js + Express** backend and **Vanilla HTML/CSS/JS** frontend.

🌐 **Live Demo:** [kaleidoscopic-creponne-017bea.netlify.app](https://kaleidoscopic-creponne-017bea.netlify.app)  
⚙️ **API Base URL:** [taskflow-api-l76n.onrender.com](https://taskflow-api-l76n.onrender.com)

---

## Features

- Create, Read, Update, Delete tasks
- Toggle task status — Pending ↔ Completed
- Filter tasks — All / Pending / Completed
- Edit tasks via modal
- Toast notifications for all actions
- Input validation — empty title blocked
- Persistent storage via JSON file
- Premium dark-mode UI with animations

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| Backend | Node.js, Express.js |
| Database | JSON file (fs module) |
| Hosting (Frontend) | Netlify |
| Hosting (Backend) | Render |

---

## Project Structure

```
taskflow-app/
├── backend/
│   ├── server.js
│   ├── routes/
│   │   └── tasks.js
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── .gitignore
└── README.md
```

---

## Getting Started (Local)

### 1. Clone the repo
```bash
git clone https://github.com/Vinay-404-dev/taskflow-app.git
cd taskflow-app
```

### 2. Start the Backend
```bash
cd backend
npm install
node server.js
```
Server runs at: `http://localhost:3000`

### 3. Open the Frontend
Open `frontend/index.html` directly in your browser.

---

## API Reference

**Base URL (Local):** `http://localhost:3000/api`  
**Base URL (Production):** `https://taskflow-api-l76n.onrender.com/api`

### Task Object
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk and eggs",
  "status": "pending",
  "created_at": "2026-03-20T07:00:00.000Z"
}
```

---

### `GET /api/tasks`
Returns all tasks, newest first.

```bash
curl https://taskflow-api-l76n.onrender.com/api/tasks
```

**Response:** `200 OK`
```json
[
  {
    "id": 2,
    "title": "Write report",
    "description": "",
    "status": "pending",
    "created_at": "2026-03-20T07:05:50.693Z"
  }
]
```

---

### `POST /api/tasks`
Create a new task.

```bash
curl -X POST https://taskflow-api-l76n.onrender.com/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk and eggs"}'
```

**Body:**
| Field | Type | Required |
|-------|------|----------|
| `title` | string | ✅ Yes |
| `description` | string | ❌ No |

**Response:** `201 Created`  
**Error:** `400` if title is empty

```json
{ "error": "Title is required and cannot be empty." }
```

---

### `PUT /api/tasks/:id`
Update a task's title, description, or status.

```bash
curl -X PUT https://taskflow-api-l76n.onrender.com/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated title", "description": "New desc"}'
```

**Body (all optional):**
| Field | Type | Validation |
|-------|------|------------|
| `title` | string | Cannot be empty |
| `description` | string | — |
| `status` | string | Must be `"pending"` or `"completed"` |

**Response:** `200 OK` — updated task  
**Error:** `400` for validation, `404` if not found

---

### `PATCH /api/tasks/:id/toggle`
Toggle status between `pending` and `completed`.

```bash
curl -X PATCH https://taskflow-api-l76n.onrender.com/api/tasks/1/toggle
```

**Response:** `200 OK` — updated task  
**Error:** `404` if not found

---

### `DELETE /api/tasks/:id`
Delete a task permanently.

```bash
curl -X DELETE https://taskflow-api-l76n.onrender.com/api/tasks/1
```

**Response:** `200 OK`
```json
{ "message": "Task 1 deleted successfully." }
```
**Error:** `404` if not found

---

### `GET /api/health`
Health check endpoint.

```bash
curl https://taskflow-api-l76n.onrender.com/api/health
```
```json
{ "status": "ok", "timestamp": "2026-03-20T07:00:00.000Z" }
```

---

## Validation Rules

| Rule | Status Code |
|------|------------|
| `title` missing or empty on POST | `400` |
| `title` is empty string on PUT | `400` |
| `status` is invalid value on PUT | `400` |
| Task ID not found | `404` |

---

## Deployment

### Backend — Render
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`

### Frontend — Netlify
- **Base Directory:** `frontend`
- **Build Command:** *(none)*
- **Publish Directory:** `frontend`

---

## License

MIT
