import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageLoader from './components/PageLoader';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';
import Story from './pages/Story';
import Menu from './pages/Menu';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';
import Reviews from './pages/Reviews';
import Reservations from './pages/Reservations';
import Team from './pages/Team';
import Franchise from './pages/Franchise';

function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  // Initial Load Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 seconds splash
    return () => clearTimeout(timer);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <AnimatePresence mode="wait">
        {loading && <PageLoader key="loader" />}
      </AnimatePresence>

      <motion.div
        key={location.pathname + "-progress"}
        initial={{ width: "0%", opacity: 1 }}
        animate={{ width: "100%", opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="fixed top-0 left-0 h-1 bg-primary z-[150] shadow-[0_0_10px_rgba(245,158,11,0.5)]"
      />

      {!loading && (
        <>
          <Navbar />
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                <Route path="/story" element={<PageTransition><Story /></PageTransition>} />
                <Route path="/menu" element={<PageTransition><Menu /></PageTransition>} />
                <Route path="/gallery" element={<PageTransition><Gallery /></PageTransition>} />
                <Route path="/reviews" element={<PageTransition><Reviews /></PageTransition>} />
                <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
                <Route path="/reservations" element={<PageTransition><Reservations /></PageTransition>} />
                <Route path="/team" element={<PageTransition><Team /></PageTransition>} />
                <Route path="/franchise" element={<PageTransition><Franchise /></PageTransition>} />
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;