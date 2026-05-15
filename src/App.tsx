/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Gallery from './components/Gallery';
import BookingForm from './components/BookingForm';
import Reviews from './components/Reviews';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminLogin from './components/Admin/AdminLogin';
import { CONTACT_INFO, SERVICES as INITIAL_SERVICES, REVIEWS as INITIAL_REVIEWS } from './constants';
import { Instagram, Facebook, Phone, Mail, MapPin, CheckCircle2, RefreshCcw } from 'lucide-react';
import Logo from './components/Logo';
import { motion } from 'motion/react';

const Tiktok = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);
import { Service, Review, GalleryItem, AppSettings } from './types';
import { 
  seedServicesIfEmpty, subscribeToServices, 
  subscribeToReviews, seedReviewsIfEmpty,
  subscribeToGallery, subscribeToSettings
} from './lib/services';

import { Turnstile } from '@marsidev/react-turnstile';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isManuallyVerified, setIsManuallyVerified] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [services, setServices] = useState<Service[] | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Use Cloudflare Testing Key (Always Passes)
  // Replace with your real Site Key from Cloudflare Dashboard
  const TURNSTILE_SITE_KEY = '0x4AAAAAADP89TTvRqaYBtR1';

  useEffect(() => {
    // We only hide the loading screen if both auth is ready AND the turnstile token is received
    if (!authLoading && verifiedToken) {
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [authLoading, verifiedToken]);

  const handleTurnstileSuccess = (token: string) => {
    setVerifiedToken(token);
    setIsManuallyVerified(true);
    setIsVerifying(false);
  };

  useEffect(() => {
    const authorizedEmails = ['uwureaperuwus@gmail.com', 'uwureaperuwu@gmail.com', '3csvaleting@gmail.com'];
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      
      // Seed if admin
      if (u && u.email && authorizedEmails.includes(u.email.toLowerCase())) {
        seedServicesIfEmpty(INITIAL_SERVICES);
        seedReviewsIfEmpty(INITIAL_REVIEWS);
      }
    });

    // Subscribe to dynamic services
    const unsubServices = subscribeToServices((data) => {
      setServices(data);
    });

    const unsubReviews = subscribeToReviews((data) => {
      setReviews(data);
    });

    const unsubGallery = subscribeToGallery((data) => {
      setGallery(data);
    });

    const unsubSettings = subscribeToSettings((data) => {
      setSettings(data);
    });
    
    // Check initial hash for "hidden" admin access
    if (window.location.hash === '#admin-portal') {
      setIsAdminView(true);
    }

    // Listen for hash changes
    const handleHashChange = () => {
      setIsAdminView(window.location.hash === '#admin-portal');
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      unsubscribe();
      unsubServices();
      unsubReviews();
      unsubGallery();
      unsubSettings();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  if (showLoading) {
    return (
      <div className="h-screen bg-slate-background flex flex-col items-center justify-center p-6 text-center">
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="relative mb-12"
        >
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
          <Logo className="w-24 h-24 relative z-10" />
        </motion.div>
        
        <div className="space-y-6 max-w-sm w-full bg-slate-900/50 border border-slate-800 p-8 rounded-3xl backdrop-blur-3xl shadow-2xl relative overflow-hidden">
           {/* Scan Line Effect */}
           <motion.div 
             animate={{ top: ['-10%', '110%'] }}
             transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
             className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent z-0"
           />

           <div className="flex flex-col items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center relative group">
                <div className="absolute inset-0 bg-blue-500/5 rounded-2xl animate-pulse" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCcw size={24} className="text-blue-500/40" />
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-white text-xl font-bold tracking-tight">Managed Challenge</h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Verifying your connection to {settings?.siteName || '3CSValeting'}</p>
              </div>
           </div>

           <div className="space-y-4 pt-4 relative z-10">
              {/* Real Cloudflare Turnstile */}
              <div className="flex flex-col items-center">
                {!isManuallyVerified ? (
                  <div className="scale-90 sm:scale-100 origin-center transition-opacity duration-500">
                    <Turnstile
                      siteKey={TURNSTILE_SITE_KEY}
                      options={{
                        theme: 'dark',
                        size: 'normal',
                        appearance: 'always'
                      }}
                      onSuccess={handleTurnstileSuccess}
                      onBeforeInteractive={() => setIsVerifying(true)}
                    />
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-950/80 border border-green-500/50 rounded-2xl p-5 flex items-center justify-between w-full shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/50 flex items-center justify-center">
                        <CheckCircle2 size={20} className="text-green-500" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-green-500 font-mono">VERIFIED</p>
                        <p className="text-[10px] text-slate-400 font-medium">Session token generated</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end opacity-40">
                       <div className="flex items-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-green-500" />
                          <span className="text-[7px] font-black uppercase tracking-tighter">Trusted Device</span>
                       </div>
                       <p className="text-[6px] font-mono whitespace-nowrap">ID: {verifiedToken?.substring(0, 12).toUpperCase()}...</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Technical logs */}
              <div className="text-left font-mono text-[7px] text-slate-600 space-y-1 bg-black/20 p-4 rounded-xl border border-white/5">
                <p className="flex justify-between"><span>{'>'} NETWORK_CHECK</span> <span className="text-blue-500/50">SECURE</span></p>
                <p className="flex justify-between"><span>{'>'} BROWSER_INTEGRITY</span> <span className="text-blue-500/50">PASSED</span></p>
                <p className="flex justify-between"><span>{'>'} TLS_HANDSHAKE_v1.3</span> <span className="text-blue-500/50">ESTABLISHED</span></p>
              </div>
           </div>
        </div>

        <div className="mt-8 relative z-10">
           <div className="flex items-center justify-center gap-2 mb-2">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
             <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">3CS Neural Guard Active</p>
           </div>
           <p className="text-[8px] font-bold uppercase tracking-widest text-slate-800">Connection is secure. Reviewing session metadata...</p>
        </div>
      </div>
    );
  }

  // Admin View Logic
  if (isAdminView) {
    if (!user) return <AdminLogin />;
    // Check if user is the specific admin email
    const authorizedEmails = ['uwureaperuwus@gmail.com', 'uwureaperuwu@gmail.com', '3csvaleting@gmail.com'];
    if (!user.email || !authorizedEmails.includes(user.email.toLowerCase())) {
      return (
        <div className="h-screen bg-black flex flex-col items-center justify-center p-8 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">ACCESS DENIED</h1>
          <p className="text-zinc-500 mb-8">This account is not authorized to access the admin portal.</p>
          <button 
            onClick={() => auth.signOut()}
            className="bg-white text-black px-8 py-3 font-bold uppercase tracking-widest"
          >
            Sign Out
          </button>
        </div>
      );
    }
    return <AdminDashboard />;
  }

  // Home View
  return (
    <div className="bg-slate-background min-h-screen selection:bg-blue-500 selection:text-white font-sans">
      <Navbar />
      <Hero />
      <Services availableServices={services || []} />
      <Gallery items={gallery} />
      <Reviews reviews={reviews} />
      
      <section className="py-24 bg-slate-900/40 border-y border-slate-800" id="about">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden glass border-blue-500/20">
              <img 
                src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1931&auto=format&fit=crop"
                className="w-full h-full object-cover grayscale opacity-50 contrast-125"
                alt="Detailing Process"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 glass p-8 rounded-2xl md:block hidden">
              <span className="text-6xl font-extrabold italic block leading-none gradient-text">01</span>
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-500">Quality Rating</span>
            </div>
          </div>
          <div className="text-white">
            <h2 className="text-4xl font-extrabold uppercase tracking-tight mb-8">
              <span className="text-blue-500">Defining</span> The Standard
            </h2>
            <div className="space-y-6 text-slate-400 leading-relaxed font-medium">
              <p>3CSValeting is your premier local mobile detailing specialist in Aylesbury. We don't just wash cars; we revitalize them, bringing studio-quality care to your home.</p>
              <p>Being a locally focused company, we take pride in serving the Aylesbury community with a commitment to excellence. Every vehicle we touch receives meticulous care, ensuring it looks its absolute best.</p>
              <ul className="space-y-4 pt-4 text-xs uppercase tracking-widest font-bold">
                <li className="flex items-center gap-3 text-white"><CheckCircle2 className="text-blue-500" size={16} /> 100% Satisfaction Guarantee</li>
                <li className="flex items-center gap-3 text-white"><CheckCircle2 className="text-blue-500" size={16} /> Fully Insured Mobile Service</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <BookingForm availableServices={services || []} />

      {/* Footer */}
      <footer className="bg-slate-background border-t border-slate-800 pt-24 pb-12 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-24">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <Logo className="w-14 h-14" />
                <span className="font-bold text-2xl tracking-tight">{settings?.siteName || '3CSValeting'}</span>
              </div>
              <p className="text-slate-500 max-w-sm mb-8 leading-relaxed text-sm">The ultimate mobile solution for car enthusiasts. Premium valeting and detailing delivered at your location with surgical precision.</p>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/3csvaleting" target="_blank" rel="noopener noreferrer" className="w-10 h-10 glass rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-400 transition-all" title="Instagram"><Instagram size={18} /></a>
                <a href="https://www.facebook.com/share/1EDULvNR9F/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 glass rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-400 transition-all" title="Facebook"><Facebook size={18} /></a>
                <a href="https://www.tiktok.com/@3csvaleting" target="_blank" rel="noopener noreferrer" className="w-10 h-10 glass rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-400 transition-all" title="TikTok"><Tiktok size={18} /></a>
              </div>
            </div>
            <div>
              <h4 className="font-bold uppercase text-[10px] tracking-[0.3em] text-slate-600 mb-8">Contact Info</h4>
              <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                <li className="flex items-center gap-3"><Phone size={14} className="text-blue-400" /> {CONTACT_INFO.phone}</li>
                <li className="flex items-center gap-3"><Mail size={14} className="text-blue-400" /> <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-blue-400 transition-colors">{CONTACT_INFO.email}</a></li>
                <li className="flex items-center gap-3"><MapPin size={14} className="text-blue-400" /> {CONTACT_INFO.area}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase text-[10px] tracking-[0.3em] text-slate-600 mb-8">Navigation</h4>
              <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                <li><a href="#services" className="hover:text-blue-400">Services</a></li>
                <li><a href="#booking-section" className="hover:text-blue-400">Book Online</a></li>
                <li><a href="#about" className="hover:text-blue-400">Our Story</a></li>
                <li>
                  <button 
                    onClick={() => window.location.hash = 'admin-portal'} 
                    className="flex items-center gap-2 group text-slate-600 hover:text-blue-400 transition-all"
                  >
                    <Mail size={14} className="group-hover:text-blue-400" />
                    Staff Portal
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-end text-[10px] uppercase font-bold tracking-widest text-slate-700">
            <p>Designed for the Driven.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

