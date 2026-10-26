# Task API caching

Run `node test-cache.js` against the server on port 3000. Set `TOKEN` if auth is required.
Set `CACHE_ENABLED=false` before starting the server for uncached readings. Caching is enabled by default.
The in-memory task list loads 100 sample tasks from `seed.js` on server startup.

> **Note:** The backend stores tasks in an in-memory array (not MongoDB), so the
> uncached path includes an artificial 200 ms delay to simulate a database query.
> The first cached reading (57 ms) is a cache miss; readings 2 and 3 are hits.

| Run | Reading 1 (ms) | Reading 2 (ms) | Reading 3 (ms) |
| --- | --- | --- | --- |
| Cached | 57.117 | 5.128 | 2.337 |
| Uncached | 306.808 | 212.940 | 203.851 |

**Result:** Cached requests were roughly 40-90x faster than uncached ones
(about 2-5 ms vs about 200-300 ms).

## Why invalidate on every write?

Writes can make cached task lists and details stale, so successful creates, updates, and deletes must invalidate them.
That way, the next read fetches the current data.
Without invalidation, users may see old or deleted tasks until the cache expires.

## What is a reasonable TTL for task management?

A 60-second TTL is a reasonable starting point for task data that changes regularly.
Shorter TTLs limit staleness but increase database reads.
Longer TTLs improve cache reuse but may serve outdated data longer.

## Why is node-cache unsuitable for multi-server deployments?

`node-cache` stores values in one process's memory, so each server has a different cache.
Updates and invalidations on one server do not reach the others.
Use a shared cache such as Redis for multi-server deployments.

## Extra features

- `GET /tasks/:id` is cached separately from the all-tasks list (key `task_<id>`).
- `GET /debug/cache-stats` returns hit and miss counts (test run: 3 hits, 1 miss).

## Observation

The cache is held in server memory and is wiped when the server restarts.
This is a known limitation of the current in-memory cache.