# Richardson Maturity Model — Task Management API Evaluation

**Course:** Advanced Web Development Frameworks (ITUE301)  
**Assignment:** Week 4 — A1  
**API:** Task Manager API (Practical 4)

---

## 1. Richardson Maturity Model — Overview

The Richardson Maturity Model (RMM) classifies REST APIs into four levels of maturity:

| Level | Name | Core Idea |
|-------|------|-----------|
| 0 | The Swamp of POX | Single endpoint, all operations via POST |
| 1 | Resources | Separate URLs per resource, but verbs/status codes ignored |
| 2 | HTTP Verbs + Status Codes | Correct HTTP verbs AND meaningful status codes |
| 3 | HATEOAS | Responses include hypermedia links guiding the client |

---

## 2. Evaluation Table

| Level | Criterion | Does our API satisfy this? | Evidence |
|-------|-----------|---------------------------|----------|
| **0** | All requests go to a single endpoint | ✅ Surpassed | We have multiple distinct endpoints — well beyond Level 0 |
| **1** | Separate URL per resource | ✅ Yes | `/tasks` for the collection; `/tasks/:id` for individual tasks |
| **2a** | Correct HTTP verbs per operation | ✅ Yes | `GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id` |
| **2b** | Meaningful HTTP status codes | ✅ Yes | `200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `415 Unsupported Media Type`, `500 Internal Server Error` |
| **3** | HATEOAS — hypermedia links in response | ❌ Not implemented | Responses do not include `_links`; see Section 4 for awareness example |

### Conclusion

> **The Task Management API satisfies Richardson Maturity Level 2.**
>
> It uses separate resource URLs (Level 1) AND applies the correct HTTP verbs with meaningful status codes on every endpoint (Level 2). It does not implement HATEOAS (Level 3), which is intentional for this stage.

---

## 3. Level 2 Violations Found & Fixed

No violations were present in the final `server.js`. The following points were verified during evaluation:

| Check | Status | Notes |
|-------|--------|-------|
| `GET /tasks` returns `200` | ✅ Pass | Always returns array, even if empty |
| `POST /tasks` returns `201` on success | ✅ Pass | Uses `res.status(201).json(...)` |
| `PUT /tasks/:id` returns `200` on success, `404` if missing | ✅ Pass | Correct verbs and codes |
| `DELETE /tasks/:id` returns `200` on success, `404` if missing | ✅ Pass | Correct verbs and codes |
| No operation uses `GET` to mutate data | ✅ Pass | All mutations use POST/PUT/DELETE |
| No operation returns `200` for an error condition | ✅ Pass | All errors use 4xx/5xx |

---

## 4. HATEOAS Awareness (Level 3 Example)

At Level 3, every task response would embed `_links` to guide the client to the next meaningful actions — without the client needing to hard-code URLs.

```json
{
  "id": "123",
  "title": "Submit lab report",
  "description": "Upload PDF to the portal",
  "completed": false,
  "createdAt": "2026-07-28T10:00:00.000Z",
  "_links": {
    "self":   { "href": "/tasks/123", "method": "GET" },
    "update": { "href": "/tasks/123", "method": "PUT" },
    "delete": { "href": "/tasks/123", "method": "DELETE" },
    "all":    { "href": "/tasks",     "method": "GET" }
  }
}
```

> **No code implementation is required** for awareness-level credit. The JSON structure above illustrates the concept only.

---

## 5. Why Most Production APIs Stop at Level 2

Most production APIs are built to Level 2 and never advance to Level 3 for several practical reasons:

**Complexity vs. benefit trade-off:** Implementing HATEOAS requires every response to carry a dynamic set of links. This significantly increases payload size, server-side link generation logic, and client-side parsing complexity — with marginal gain for most use cases.

**Client coupling remains in practice:** In theory, HATEOAS lets clients discover all actions at runtime. In practice, client developers still read API documentation and hard-code the URL patterns, so the self-discovery benefit is rarely realised.

**Tooling and framework support:** Most REST frameworks (Express, FastAPI, Spring) do not enforce or generate HATEOAS links automatically, making Level 3 an opt-in effort that teams deprioritise.

**Level 2 is "good enough" for most consumers:** A well-designed Level 2 API — with consistent resource URLs, correct HTTP verbs, and meaningful status codes — is predictable, easy to consume, and easy to test. The incremental value of Level 3 does not justify the engineering overhead for the majority of applications.

---

## 6. References

- Richardson, L. & Ruby, S. (2007). *RESTful Web Services*. O'Reilly Media.
- Fowler, M. (2010). [Richardson Maturity Model](https://martinfowler.com/articles/richardsonMaturityModel.html). martinfowler.com
- IBM: Node.js & MongoDB — Developing Back-end Database Applications, Week 4, Module 1.
