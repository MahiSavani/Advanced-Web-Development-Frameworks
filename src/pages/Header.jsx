import { NavLink } from 'react-router-dom'

function Header() {
  const navLinkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')

  return (
    <header className="header">
      <div className="logo">My Portfolio</div>

      <nav className="navbar">
        <NavLink to="/" end className={navLinkClass}>Home</NavLink>
        <NavLink to="/about" className={navLinkClass}>About</NavLink>
        <NavLink to="/skills" className={navLinkClass}>Skills</NavLink>
        <NavLink to="/projects" className={navLinkClass}>Projects</NavLink>
        <NavLink to="/certificates" className={navLinkClass}>Certificates</NavLink>
        <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
      </nav>
    </header>
  )
}

export default Header