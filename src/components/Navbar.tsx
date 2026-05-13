import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" id="navbar">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <Logo className="w-14 h-14" />
            <span className="text-2xl font-bold tracking-tight text-white leading-none">3CSValeting</span>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-[0.2em]">
            <a href="#services" className="text-slate-400 hover:text-blue-400 transition-colors">Services</a>
            <a href="#about" className="text-slate-400 hover:text-blue-400 transition-colors">About</a>
            <button 
              onClick={() => document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-2 bg-white text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/10"
            >
              Book Now
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-black border-b border-white/10 px-4 pt-2 pb-6 flex flex-col gap-4 text-center"
        >
          <a href="#services" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white py-2">Services</a>
          <a href="#about" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white py-2">About</a>
          <button 
            onClick={() => {
              setIsOpen(false);
              document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white text-black px-6 py-3 rounded-none font-bold uppercase tracking-widest"
          >
            Book Now
          </button>
        </motion.div>
      )}
    </nav>
  );
}
