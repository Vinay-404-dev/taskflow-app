const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DB_PATH = path.join(__dirname, '..', 'tasks.json');

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ nextId: 1, tasks: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

router.get('/', (req, res) => {
  try {
    const { tasks } = readDB();
    res.json([...tasks].reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  const { title, description = '' } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and cannot be empty.' });
  }

  try {
    const db = readDB();
    const newTask = {
      id:          db.nextId++,
      title:       title.trim(),
      description: description.trim(),
      status:      'pending',
      created_at:  new Date().toISOString(),
    };
    db.tasks.push(newTask);
    writeDB(db);
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { title, description, status } = req.body;

  try {
    const db = readDB();
    const idx = db.tasks.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ error: `Task ${id} not found.` });

    if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
      return res.status(400).json({ error: 'Title cannot be empty.' });
    }
    const validStatuses = ['pending', 'completed'];
    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be "pending" or "completed".` });
    }

    const task = db.tasks[idx];
    if (title       !== undefined) task.title       = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status      !== undefined) task.status      = status;

    writeDB(db);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/toggle', (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const db = readDB();
    const task = db.tasks.find(t => t.id === id);
    if (!task) return res.status(404).json({ error: `Task ${id} not found.` });

    task.status = task.status === 'pending' ? 'completed' : 'pending';
    writeDB(db);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const db = readDB();
    const idx = db.tasks.findIndex(t => t.id === id);
    if (idx === -1) return res.status(404).json({ error: `Task ${id} not found.` });

    db.tasks.splice(idx, 1);
    writeDB(db);
    res.json({ message: `Task ${id} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
