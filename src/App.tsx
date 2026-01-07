import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Events from './pages/Events';
import Speakers from './pages/Speakers';
import About from './pages/About';
import Contact from './pages/Contact';

import Venues from './pages/Venues';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import TestButtonPage from './pages/TestButtonPage';
import TestEventCardPage from './pages/TestEventCardPage';
import Sponsors from './pages/Sponsors';

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <main className="!pt-20">
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/speakers" element={<Speakers />} />
        <Route path="/sponsors" element={<Sponsors />} />
        <Route path="/bars" element={<Venues />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/test" element={<TestButtonPage />} />
        <Route path="/test-event-card" element={<TestEventCardPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      </Routes>
      {!isAdmin && <Footer />}
    </main>
  );
}

export default App;
