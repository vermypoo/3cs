import { motion } from 'motion/react';
import { ArrowRight, ChevronDown } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-slate-background" id="hero">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=2074&auto=format&fit=crop"
          alt="Premium Car Detailing"
          className="w-full h-full object-cover opacity-20 contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-background via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-blue-400 uppercase tracking-[0.4em] text-xs mb-6 font-bold"
        >
          Local Service In Aylesbury
        </motion.p>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl font-extrabold text-white mb-8 tracking-tighter leading-tight"
        >
          THE ULTIMATE <br />
          <span className="gradient-text">SHOWROOM SHINE</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed"
        >
          We bring professional-grade detailing directly to your doorstep in Aylesbury and surrounding areas. From essential valets, we restore every vehicle to perfection.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button 
            onClick={() => document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="group bg-blue-600 text-white px-10 py-5 text-sm font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20"
          >
            Secure Session
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            className="glass text-white px-10 py-5 text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
          >
            Our Services
          </button>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 animate-bounce"
      >
        <ChevronDown size={32} />
      </motion.div>
    </section>
  );
}
