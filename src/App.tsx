import { useState, useEffect } from 'react';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Exercises from './components/Exercises';
import Download from './components/Download';
import Footer from './components/Footer';
import Navigation from './components/Navigation';

function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation scrolled={scrolled} />
      <Hero />
      <Features />
      <HowItWorks />
      <Exercises />
      <Download />
      <Footer />
    </div>
  );
}

export default App;
