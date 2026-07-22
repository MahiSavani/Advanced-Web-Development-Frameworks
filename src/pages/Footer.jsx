function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <p>&copy; {year} Mahi Savani.   All rights reserved.</p>
      <div className="social-links">
        <a href="https://github.com/MahiSavani" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://www.linkedin.c0m/in/mahi-savani-7b2821327/" target="_blank" rel="noreferrer">LinkedIn</a>
        <a href="mailto:mahisavani29@gmail.com">Email</a>
      </div>
    </footer>
  )
}

export default Footer