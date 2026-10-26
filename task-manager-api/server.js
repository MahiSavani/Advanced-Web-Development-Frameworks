const express = require('express');
const cors = require('cors');
const path = require('path');
const cache = require('./cache');
const seedTasks = require('./seed');
const eventBus = require('./events/eventBus');
const { getActivity, getFailedActivity } = require('./events/activityStore');
require('./events/listeners/emailListener');
require('./events/listeners/activityLogListener');
require('./events/listeners/cacheListener');
const app = express();
const PORT = process.env.PORT || 5000;
const CACHE_ENABLED = !['false', '0', 'no'].includes(
  (process.env.CACHE_ENABLED || 'true').toLowerCase()
);

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors());

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
let tasks = seedTasks;
let nextId = tasks.length + 1;

function publishTaskEvent(eventName, task) {
  eventBus.emit(eventName, {
    task: { ...task },
    timestamp: new Date().toISOString(),
  });
}

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
app.get('/tasks', async (req, res) => {
  const startedAt = process.hrtime.bigint();
  const responseTasks = CACHE_ENABLED ? cache.get('all_tasks') : undefined;
  const setResponseTime = () => {
    const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    res.setHeader('X-Response-Time', `${elapsedMs.toFixed(3)}ms`);
  };

  if (responseTasks !== undefined) {
    setResponseTime();
    return res.status(200).json({ tasks: responseTasks });
  }

  if (!CACHE_ENABLED) {
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  if (CACHE_ENABLED) cache.set('all_tasks', tasks);
  setResponseTime();
  res.status(200).json({ tasks });
});

// GET /debug/cache-stats — expose in-memory cache statistics
app.get('/debug/cache-stats', (req, res) => {
  const { hits, misses } = cache.getStats();
  res.status(200).json({ hits, misses });
});

// GET /api/activity — return recent task and email activity
app.get('/api/activity', (req, res) => {
  res.status(200).json({ activity: getActivity() });
});

// GET /api/activity/failed — return listeners that exhausted their retries
app.get('/api/activity/failed', (req, res) => {
  res.status(200).json({ failed: getFailedActivity() });
});

// GET /tasks/:id — return a task by ID
app.get('/tasks/:id', validateId, (req, res) => {
  const key = `task_${req.taskId}`;
  const cachedTask = CACHE_ENABLED ? cache.get(key) : undefined;
  if (cachedTask !== undefined) {
    return res.status(200).json({ task: cachedTask });
  }

  const task = tasks.find((item) => item.id === req.taskId);
  if (!task) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Task with id ${req.taskId} does not exist.`,
    });
  }

  if (CACHE_ENABLED) cache.set(key, task);
  res.status(200).json({ task });
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
    publishTaskEvent('task.created', task);
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
    const wasCompleted = task.completed;
    const { title, description, completed } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;
    publishTaskEvent('task.updated', task);
    if (!wasCompleted && task.completed) publishTaskEvent('task.completed', task);
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
    publishTaskEvent('task.deleted', deleted);
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
