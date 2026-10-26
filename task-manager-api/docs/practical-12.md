# Practical 12: CI with GitHub Actions

## Objective

Automatically install the Task Manager API dependencies and run endpoint tests whenever a commit is pushed to `main`. GitHub Actions reports the run as successful (green check) only when the test command exits successfully.

## Workflow and tests

The workflow is [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml). It checks out the repository, sets up Node.js 20, runs `npm install` in `task-manager-api`, then runs `npm test`. The API tests use Jest and Supertest to check that `GET /tasks` returns HTTP 200 with a task list and `GET /api/activity` returns HTTP 200 with an activity list.

Run the same checks locally from `task-manager-api`:

```bash
npm install
npm test
```

The Express app is exported for Supertest and only starts a listening server when run directly, so CI tests do not need a separate server process or port.

## Demonstrating a failed run and a passing run

1. Push the workflow and working tests to `main`.
2. Temporarily change the expected status in `test/tasks.test.js` from `200` to `201`, then commit and push that test change to `main`.
3. Open the failed run from the repository's **Actions** tab. The `npm test` step should report the assertion mismatch. Capture a screenshot of the failed run and save it as `docs/screenshots/ci-failed.png`.
4. Change the expected status back to `200`, commit and push the correction, and verify the new run passes. Capture the passing run as `docs/screenshots/ci-passed.png`.

Add the two real screenshots at those paths and include them in the lab journal or README. They are intentionally not fabricated or committed: they must show runs from the repository's GitHub Actions page after the commits are pushed.

## Analysis and viva questions

### What is the difference between CI and CD, and what does this practical demonstrate?

Continuous Integration automatically builds and tests changes as they are integrated into a shared branch. Continuous Delivery/Deployment extends that pipeline to prepare a release or deploy it (automatically in continuous deployment). This practical demonstrates CI: it installs dependencies and tests the API, but does not deploy it.

### Why test on every push instead of only before a release?

Each change is checked soon after it is introduced, making regressions easier to associate with a specific commit. The author and team receive a clear pass/fail result before later changes or a release depend on the broken code.

### What happens if the test file path is incorrect?

The `npm test` step still fails, but Jest reports that it found no tests (or cannot resolve a configured path), rather than reporting a failed assertion. Both failures make the workflow red; the step logs identify different causes.

## Troubleshooting

| Symptom | Cause | Resolution |
| --- | --- | --- |
| Workflow is not listed in Actions | Workflow is not committed under `.github/workflows/` or the push was not to `main` | Verify the exact path and branch trigger, then push the workflow commit |
| `npm test` reports no tests | Test file is missing, misplaced, or named outside Jest's test patterns | Keep the test under `task-manager-api/test/` with a `.test.js` suffix |
| An assertion fails | Actual API response does not match the expected status or shape | Read the Jest assertion output, correct the test or API behavior, and push the fix |
| The job cannot install packages | Dependency or registry/network issue | Inspect the `npm install` step logs and rerun after resolving the reported issue |
