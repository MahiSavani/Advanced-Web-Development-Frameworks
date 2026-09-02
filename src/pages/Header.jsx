import { NavLink } from 'react-router-dom'

function Header() {
  const navLinkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')

  return (
    <header className="header">
      <div className="logo">Taskflow</div>

      <nav className="navbar">
        <NavLink to="/" end className={navLinkClass}>Home</NavLink>
        <NavLink to="/projects" className={navLinkClass}>Projects</NavLink>
        <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
      </nav>
    </header>
  )
}

export default Header