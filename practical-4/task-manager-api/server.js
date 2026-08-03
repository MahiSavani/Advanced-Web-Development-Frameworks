const express = require('express');
const path = require('path');
const app = express();
const PORT = 5000;

// ─── Serve Static Frontend ───────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── Body Parser ────────────────────────────────────────────────────────────
// Must come first so req.body is available on all POST/PUT routes.
app.use(express.json());

// ─── Middleware 1: Request Logger ────────────────────────────────────────────
// Logs HTTP method, URL, and timestamp for every incoming request.
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Middleware 2: Content-Type guard for POST / PUT ─────────────────────────
// Supplementary Problem 1 — reject API requests that are missing the header.
app.use((req, res, next) => {
  if (['POST', 'PUT'].includes(req.method) && req.path.startsWith('/tasks')) {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        message: 'Content-Type must be application/json for POST and PUT requests.',
      });
    }
  }
  next();
});

// ─── In-Memory Data Store ────────────────────────────────────────────────────
let tasks = [];
let nextId = 1;

// ─── Route-specific Middleware: ID Validator ─────────────────────────────────
// Supplementary Problem 2 — validates that :id is a positive integer.
const validateId = (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: `Task ID must be a positive integer. Received: "${req.params.id}"`,
    });
  }
  req.taskId = id; // attach parsed id for downstream handlers
  next();
};

// ─── CRUD Routes ─────────────────────────────────────────────────────────────

// GET /tasks — return all tasks
app.get('/tasks', (req, res) => {
  res.status(200).json({ tasks });
});

// POST /tasks — create a new task
app.post('/tasks', (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Bad Request', message: 'title is required.' });
    }
    const task = {
      id: nextId++,
      title,
      description: description || '',
      completed: false,
      createdAt: new Date().toISOString(),
    };
    tasks.push(task);
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
});

// PUT /tasks/:id — update an existing task
app.put('/tasks/:id', validateId, (req, res, next) => {
  try {
    const task = tasks.find((t) => t.id === req.taskId);
    if (!task) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with id ${req.taskId} does not exist.`,
      });
    }
    const { title, description, completed } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;
    res.status(200).json({ task });
  } catch (err) {
    next(err);
  }
});

// DELETE /tasks/:id — remove a task
app.delete('/tasks/:id', validateId, (req, res, next) => {
  try {
    const index = tasks.findIndex((t) => t.id === req.taskId);
    if (index === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with id ${req.taskId} does not exist.`,
      });
    }
    const [deleted] = tasks.splice(index, 1);
    res.status(200).json({ message: 'Task deleted successfully.', task: deleted });
  } catch (err) {
    next(err);
  }
});

// ─── TEMPORARY: Crash Test Route ──────────────────────────────────────────────
   app.get('/crash-test', (req, res) => {
     const x = undefined;
     x.crash();
   });
// ─── 404 Handler for Undefined Routes ────────────────────────────────────────
// Supplementary Problem 3 — structured JSON response for unknown paths.
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} does not exist on this server.`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must be defined LAST — Express identifies it by the 4-argument signature.
// Logs the full stack internally but never exposes it to the client.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Task Manager API running on http://localhost:${PORT}`);
});
