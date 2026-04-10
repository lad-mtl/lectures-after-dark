import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css';
import Home from './pages/Home';
import Speakers from './pages/Speakers';
import About from './pages/About';
import Contact from './pages/Contact';

import Venues from './pages/Venues';
import TestEventCardPage from './pages/TestEventCardPage';
import TestCardPage from './pages/TestCardPage';
import Sponsors from './pages/Sponsors';
import NotFound from './pages/NotFound';

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <main className={`appShell ${isHomePage ? 'appShellHome' : 'appShellWithNavbarOffset'}`}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/speakers" element={<Speakers />} />
        <Route path="/sponsors" element={<Sponsors />} />
        <Route path="/bars" element={<Venues />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/test" element={<TestCardPage />} />
        <Route path="/test-event-card" element={<TestEventCardPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </main>
  );
}

export default App;
