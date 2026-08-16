import { useState, useEffect, useCallback } from "react";

// 👇 Change this to your GitHub username
const GITHUB_USERNAME = "MahiSavani";

// Optional: repos to hide from the portfolio (by name)
const EXCLUDED_REPOS = [];

// GitHub PAT from .env — gives 5,000 req/hr instead of 60
// Token has NO scopes so it only reads public data
const GH_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

function ghFetch(url) {
  const headers = { Accept: "application/vnd.github+json" };
  if (GH_TOKEN && GH_TOKEN !== "paste_your_token_here") {
    headers["Authorization"] = `Bearer ${GH_TOKEN}`;
  }
  return fetch(url, { headers });
}

// ── Language colour map (extend as needed) ───────────────────────────────────
const LANG_COLORS = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python:     "#3572A5",
  HTML:       "#e34c26",
  CSS:        "#563d7c",
  Java:       "#b07219",
  "C++":      "#f34b7d",
  C:          "#555555",
  "C#":       "#178600",
  Ruby:       "#701516",
  Go:         "#00ADD8",
  Rust:       "#dea584",
  PHP:        "#4F5D95",
  Shell:      "#89e051",
  Kotlin:     "#A97BFF",
  Swift:      "#F05138",
  Dart:       "#00B4AB",
  Vue:        "#41b883",
  Svelte:     "#ff3e00",
  Dockerfile: "#384d54",
  SCSS:       "#c6538c",
};

function langColor(name) {
  return LANG_COLORS[name] || "#8b949e";
}

// ── Spinner Component ────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="spinner-wrapper" role="status" aria-label="Loading">
      <div className="spinner"></div>
      <p className="spinner-text">Fetching repositories…</p>
    </div>
  );
}

// ── ErrorMessage Component ───────────────────────────────────────────────────
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-box" role="alert">
      <p className="error-title">⚠ Failed to load repositories</p>
      <p className="error-detail">{message}</p>
      <button className="btn primary retry-btn" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}

// ── LanguageBar Component ────────────────────────────────────────────────────
// Renders a segmented bar + legend for all languages in a repo
function LanguageBar({ languages }) {
  if (!languages || Object.keys(languages).length === 0) return null;

  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1]);

  return (
    <div className="lang-section">
      {/* Segmented bar */}
      <div className="lang-bar" title="Language breakdown">
        {entries.map(([lang, bytes]) => (
          <span
            key={lang}
            className="lang-bar-segment"
            style={{
              width: `${((bytes / total) * 100).toFixed(1)}%`,
              backgroundColor: langColor(lang),
            }}
            title={`${lang}: ${((bytes / total) * 100).toFixed(1)}%`}
          />
        ))}
      </div>

      {/* Legend pills */}
      <div className="lang-legend">
        {entries.map(([lang, bytes]) => (
          <span key={lang} className="lang-pill">
            <span
              className="lang-dot"
              style={{ backgroundColor: langColor(lang) }}
            />
            {lang}
            <span className="lang-pct">
              {((bytes / total) * 100).toFixed(0)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── RepoCard Component ───────────────────────────────────────────────────────
function RepoCard({ repo }) {
  const [languages, setLanguages] = useState(null);

  useEffect(() => {
    ghFetch(repo.languages_url)
      .then((r) => r.json())
      .then((data) => setLanguages(data))
      .catch(() => setLanguages({})); // silent fail — card still renders
  }, [repo.languages_url]);

  return (
    <div className="project-card">
      <h3>{formatRepoName(repo.name)}</h3>

      <p className="repo-description">
        {repo.description || "No description provided."}
      </p>

      {/* Language breakdown bar */}
      {languages === null ? (
        <p className="lang-loading">Loading languages…</p>
      ) : (
        <LanguageBar languages={languages} />
      )}

      <div className="repo-meta">
        <span className="repo-stars" title="Stars">⭐ {repo.stargazers_count}</span>
        {repo.forks_count > 0 && (
          <span className="repo-forks" title="Forks">🍴 {repo.forks_count}</span>
        )}
      </div>

      <a
        className="repo-link"
        href={repo.html_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        View on GitHub →
      </a>
    </div>
  );
}

// ── RepoList Component ───────────────────────────────────────────────────────
function RepoList({ data }) {
  if (data.length === 0) {
    return <p className="no-results">No repositories match your search.</p>;
  }

  return (
    <div className="project-container">
      {data.map((repo) => (
        <RepoCard key={repo.id} repo={repo} />
      ))}
    </div>
  );
}

// ── Projects Page ────────────────────────────────────────────────────────────
function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await ghFetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`
      );

      if (!res.ok) {
        throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      const filtered = data
        .filter((repo) => !repo.fork)
        .filter((repo) => !EXCLUDED_REPOS.includes(repo.name))
        .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));

      setRepos(filtered);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="projects">
      <h2>Projects</h2>

      {!loading && !error && (
        <div className="search-bar-wrapper">
          <input
            className="search-bar"
            type="text"
            placeholder="Filter repositories by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Filter repositories"
          />
        </div>
      )}

      {loading && <Spinner />}
      {error && <ErrorMessage message={error} onRetry={fetchRepos} />}
      {!loading && !error && <RepoList data={filteredRepos} />}
    </section>
  );
}

// "Advanced-Web-Development-Frameworks" → "Advanced Web Development Frameworks"
function formatRepoName(name) {
  return name.replace(/[-_]/g, " ");
}

export default Projects;
