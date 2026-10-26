# My Portfolio

A personal portfolio built with React + Vite.

## Getting Started

```bash
npm install
npm run dev
```

## Tech Stack

- React
- Vite
- ESLint

## Practical 8: Performance Optimization and Lazy Loading

Route-level pages use `React.lazy` and `Suspense` so Home, Projects, and Contact can be emitted as separate JavaScript chunks and loaded when their routes are visited. Projects and Contact use a 300 ms minimum delay for the route fallback; the reusable page loader shows a spinner and “Loading page...” while a route is loading. The task-status chart is also lazy-loaded inside its own `Suspense` boundary, so its Recharts dependency is fetched only when the Home page needs it.

### Before/After Measurements

Run `npm run build` for build sizes and use the browser Network tab for transferred JavaScript and timing measurements. Fill in the values from comparable runs on the same machine and network profile.

| Metric | Before optimization | After optimization |
| --- | --- | --- |
| Total production bundle size (`npm run build`) | _placeholder_ | _placeholder_ |
| Number of JavaScript chunks (`npm run build`) | _placeholder_ | _placeholder_ |
| Total JavaScript transferred (Network tab) | _placeholder_ | _placeholder_ |
| Load time | _placeholder_ | _placeholder_ |
| Slow 3G load time | _placeholder_ | _placeholder_ |

### Screenshots

Add the captured screenshots under `docs/screenshots/` using these filenames:

![Before optimization production build](docs/screenshots/before-build.png)

![After optimization production build](docs/screenshots/after-build.png)

![Before optimization Network tab](docs/screenshots/before-network.png)

![After optimization Network tab](docs/screenshots/after-network.png)

![Loading fallback under Slow 3G throttling](docs/screenshots/fallback-slow3g.png)

### Analysis

#### a) Initial bundle vs. lazy-loaded chunk

The initial bundle is downloaded as the application starts, because it contains code needed to render the initial route and bootstrap React. A lazy-loaded chunk is requested only when the application reaches the component or route that imports it, such as visiting Projects or rendering the task chart on Home.

#### b) Perceived performance

Lazy loading improves perceived performance by reducing the amount of JavaScript the browser must fetch, parse, and execute before the first route becomes usable. The deferred code is still part of the application and may be downloaded later, so the total code downloaded after visiting every lazy feature can remain similar; the improvement is in when that work happens.

#### c) When lazy loading is not worthwhile

Lazy loading is usually not worthwhile for small components that are needed on the initial screen, since the extra chunk request and loading boundary can add complexity without a meaningful reduction in startup work. It can also hurt navigation when a frequently used feature is deferred and users repeatedly wait for its chunk. Prefer it for substantial, infrequently visited routes or features.

### Errors Faced and Fixes

- Corrected the Projects and Contact dynamic import paths to match the lowercase filenames (`projects.jsx` and `contact.jsx`), avoiding module resolution failures on case-sensitive systems.
- Lazy-loaded pages and components must provide a default export for the direct `React.lazy(() => import(...))` pattern. A missing default export can result in an “Element type is invalid” error; confirm each lazy module's export when diagnosing that error.
- Kept the route fallback inside the route-level `Suspense` boundary and gave the chart its own local boundary, so loading feedback appears at the feature being loaded.

### React Profiler Note

The React Profiler showed that `TaskInsights` re-rendered while typing in Home's new-task input, even though its `tasks` prop had not changed. Wrapping it with `React.memo` skips those draft-only renders and still re-renders it when the task list changes.
