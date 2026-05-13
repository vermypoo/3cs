import React, { useState } from 'react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { BookingStatus, Service } from '../types';
import { Calendar, Clock, Car, User, Mail, Phone, Send, CheckCircle2 } from 'lucide-react';
import Logo from './Logo';

interface BookingFormProps {
  availableServices: Service[];
}

export default function BookingForm({ availableServices }: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    carModel: '',
    serviceId: '',
    date: '',
    time: '',
    notes: '',
  });

  React.useEffect(() => {
    if (availableServices.length > 0 && !formData.serviceId) {
      setFormData(prev => ({ ...prev, serviceId: availableServices[0].id }));
    }
  }, [availableServices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const bookingsCol = collection(db, 'bookings');
      await addDoc(bookingsCol, {
        ...formData,
        status: BookingStatus.PENDING,
        source: 'web',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSuccess(true);
      setFormData({
        customerName: '',
        email: '',
        phone: '',
        carModel: '',
        serviceId: availableServices[0]?.id || '',
        date: '',
        time: '',
        notes: '',
      });
    } catch (error) {
      console.error("Booking error:", error);
      alert("Something went wrong. Please try again or call us directly.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="py-24 bg-black text-white" id="booking-section">
        <div className="max-w-xl mx-auto px-4 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <CheckCircle2 size={80} className="text-green-500 mb-6" />
            <h2 className="text-4xl font-bold mb-4 uppercase tracking-tighter">Booking Requested!</h2>
            <p className="text-zinc-400 mb-8 max-w-sm">We've received your details. Our team will contact you shortly to confirm the appointment and <span className="text-white font-bold">arrange your non-refundable deposit</span>.</p>
            <button 
              onClick={() => setSuccess(false)}
              className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all"
            >
              Make Another Booking
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-slate-background text-white border-t border-slate-800" id="booking-section">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex items-center gap-4 mb-2">
              <Logo className="w-16 h-16" />
              <h2 className="text-3xl font-extrabold tracking-tight">
                3CSValeting
              </h2>
            </div>
            
            <div className="space-y-4">
              {availableServices.slice(0, 3).map((service, i) => (
                <div key={i} className="glass p-5 rounded-xl border border-slate-800 transition-all cursor-default service-card-hover">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-white text-sm uppercase tracking-tight">{service.name}</h3>
                    <span className="text-blue-400 font-mono text-sm font-bold">{service.price}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{service.description}</p>
                </div>
              ))}
              {availableServices.length === 0 && (
                 <p className="text-slate-500 text-sm font-medium">Synchronizing elite services...</p>
              )}
            </div>

            <div className="mt-8">
              <div className="glass p-6 rounded-2xl">
                <p className="text-sm text-slate-400 mb-4 italic font-medium leading-relaxed">"The best mobile detailing I've ever used. My Porsche looks brand new again!"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">JW</div>
                  <div>
                    <span className="text-[10px] font-bold block uppercase tracking-widest">James Wilson</span>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest">West End</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 glass rounded-3xl p-8 md:p-12 border border-blue-500/10">
            <div className="mb-10">
              <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Secure Your Session</h1>
              <p className="text-slate-400">Select your package and we'll bring the shine to your doorstep.</p>
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6" id="booking-form">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    required
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-slate-800/30 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500 text-white transition-all"
                    value={formData.customerName}
                    onChange={e => setFormData({...formData, customerName: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    required
                    type="tel"
                    placeholder="07XXX XXXXXX"
                    className="w-full bg-slate-800/30 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500 text-white transition-all"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 col-span-full">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    required
                    type="email"
                    placeholder="name@example.com"
                    className="w-full bg-slate-800/30 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500 text-white transition-all"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 col-span-full md:col-span-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Choose Service</label>
                <select 
                  id="service-select"
                  className="w-full bg-slate-800/30 border border-slate-700 rounded-xl py-4 px-4 text-sm focus:outline-none focus:border-blue-500 appearance-none text-white cursor-pointer transition-all"
                  value={formData.serviceId}
                  onChange={e => setFormData({...formData, serviceId: e.target.value})}
                >
                  <option value="" disabled>Select a service</option>
                  {availableServices.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900">{s.name} ({s.price})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2 col-span-full md:col-span-1">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Vehicle Make / Model</label>
                <div className="relative">
                  <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    required
                    type="text"
                    placeholder="e.g. BMW M4 Competition"
                    className="w-full bg-slate-800/30 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500 text-white transition-all"
                    value={formData.carModel}
                    onChange={e => setFormData({...formData, carModel: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Date</label>
                <input 
                  required
                  type="date"
                  className="w-full bg-slate-800/30 border border-slate-700 rounded-xl py-4 px-4 text-sm focus:outline-none focus:border-blue-500 text-white transition-all"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Time</label>
                <input 
                  required
                  type="time"
                  className="w-full bg-slate-800/30 border border-slate-700 rounded-xl py-4 px-4 text-sm focus:outline-none focus:border-blue-500 text-white transition-all"
                  value={formData.time}
                  onChange={e => setFormData({...formData, time: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-2 col-span-full">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em] ml-1">Notes / Location Details</label>
                <textarea 
                  placeholder="Postcode and any specific focus areas..."
                  className="w-full bg-slate-800/30 border border-slate-700 rounded-xl p-4 text-sm h-32 resize-none focus:outline-none focus:border-blue-500 text-white transition-all"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>

              <div className="col-span-full bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Clock className="text-amber-500" size={18} />
                </div>
                <div>
                  <h4 className="text-amber-500 font-bold text-xs uppercase tracking-widest mb-1">Deposit Information</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">Please note that all bookings require a deposit to secure your appointment. <span className="text-amber-500/80 font-bold uppercase">Deposits are strictly non-refundable</span>.</p>
                  <p className="text-[10px] text-amber-500/60 mt-2 italic">* Final price may change based on vehicle size, condition, and location.</p>
                </div>
              </div>
              
              <button 
                disabled={loading}
                className="col-span-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-2xl transition-all shadow-lg shadow-blue-900/40 uppercase tracking-widest text-xs flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Confirm Booking Request"}
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
