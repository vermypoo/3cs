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
import { Instagram, Facebook, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import Logo from './components/Logo';

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
import { Service, Review, GalleryItem } from './types';
import { 
  seedServicesIfEmpty, subscribeToServices, 
  subscribeToReviews, seedReviewsIfEmpty,
  subscribeToGallery
} from './lib/services';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdminView, setIsAdminView] = useState(false);
  const [services, setServices] = useState<Service[] | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

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
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  if (authLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
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
                <span className="font-bold text-2xl tracking-tight">3CSValeting</span>
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

