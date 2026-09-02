import React, { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './pages/Header.jsx'
import Footer from './pages/Footer.jsx'
import Home from './pages/Home.jsx'
const Projects = lazy(() => import('./pages/Projects'))
const Contact = lazy(() => import('./pages/Contact'))
import './App.css'

function DelayedFallback() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 300)
    return () => window.clearTimeout(timer)
  }, [])

  return visible ? <div>Loading page...</div> : null
}

function App() {
  return (
    <div className="app">
      <Header />

      <main className="page-content">
        <Suspense fallback={<DelayedFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}

export default App