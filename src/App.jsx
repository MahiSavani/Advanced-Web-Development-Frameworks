import { Routes, Route } from 'react-router-dom'
import Header from './pages/Header.jsx'
import Footer from './pages/Footer.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Contact from './pages/contact.jsx'
import Projects from './pages/projects.jsx'
import Skills from './pages/Skills.jsx'
import Certificates from './pages/Certificates.jsx'
import './App.css'

function App() {
  return (
    <div className="app">
      <Header />

      <main className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App