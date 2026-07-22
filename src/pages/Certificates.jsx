// ── Certificate data — edit / add your own entries here ─────────────────────
const CERTIFICATES = [
  {
    id: 1,
    title: "Developing Front-End Apps with React",
    issuer: "IBM / Coursera",
    date: "2024",
    credential: "https://coursera.org",          // replace with your actual link
    badge: "⚛️",
  },
  {
    id: 2,
    title: "Python for Data Science, AI & Development",
    issuer: "IBM / Coursera",
    date: "2024",
    credential: "https://coursera.org",
    badge: "🐍",
  },
  {
    id: 3,
    title: "Introduction to Web Development with HTML, CSS, JavaScript",
    issuer: "IBM / Coursera",
    date: "2023",
    credential: "https://coursera.org",
    badge: "🌐",
  },
  {
    id: 4,
    title: "SQL and Relational Databases",
    issuer: "IBM / Coursera",
    date: "2023",
    credential: "https://coursera.org",
    badge: "🗄️",
  },
];

// ── CertCard Component ───────────────────────────────────────────────────────
function CertCard({ cert }) {
  return (
    <div className="cert-card">
      <div className="cert-badge">{cert.badge}</div>

      <div className="cert-body">
        <h3 className="cert-title">{cert.title}</h3>

        <div className="cert-meta">
          <span className="cert-issuer">{cert.issuer}</span>
          <span className="cert-dot">·</span>
          <span className="cert-date">{cert.date}</span>
        </div>
      </div>

      <a
        className="cert-link btn secondary"
        href={cert.credential}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View certificate: ${cert.title}`}
      >
        View ↗
      </a>
    </div>
  );
}

// ── Certificates Page ────────────────────────────────────────────────────────
function Certificates() {
  return (
    <section className="certificates">
      <h2>Certificates</h2>
      <p className="cert-subtitle">
        Courses and certifications I've completed.
      </p>

      <div className="cert-list">
        {CERTIFICATES.map((cert) => (
          <CertCard key={cert.id} cert={cert} />
        ))}
      </div>
    </section>
  );
}

export default Certificates;
