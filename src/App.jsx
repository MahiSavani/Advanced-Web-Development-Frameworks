import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './pages/Header.jsx'
import Footer from './pages/Footer.jsx'
import PageLoader from './components/PageLoader.jsx'
import lazyWithDelay from './utils/lazyWithDelay.js'
import './App.css'

const Home = lazy(() => import('./pages/Home.jsx'))
const Projects = lazyWithDelay(() => import('./pages/projects.jsx'))
const Contact = lazyWithDelay(() => import('./pages/contact.jsx'))

function App() {
  return (
    <div className="app">
      <Header />

      <main className="page-content">
        <Suspense fallback={<PageLoader />}>
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