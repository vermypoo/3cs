import React, { useEffect, useState } from 'react';
import { db, auth } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { Booking, BookingStatus, ServiceType, Service, Review, GalleryItem } from '../../types';
import { SERVICES as INITIAL_SERVICES } from '../../constants';
import { 
  Plus, LogOut, Check, X, Clock, RefreshCcw, 
  Trash2, PhoneCall, Filter, ExternalLink, Calendar, Phone, Mail, Package, Edit2, Save, Trash,
  MessageSquare, Star, Activity, Image as ImageIcon, Upload, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  subscribeToServices, saveService, deleteService, seedServicesIfEmpty, 
  subscribeToReviews, saveReview, deleteReview,
  subscribeToGallery, saveGalleryItem, deleteGalleryItem, clearGallery,
  uploadToServer
} from '../../lib/services';
import { handleFirestoreError, OperationType } from '../../lib/firebase-utils';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'services' | 'reviews' | 'gallery'>('bookings');

  // New Booking State
  const [newBooking, setNewBooking] = useState({
    customerName: '',
    email: '',
    phone: '',
    carModel: '',
    serviceId: '',
    date: '',
    time: '',
    notes: '',
  });

  useEffect(() => {
    if (services.length > 0 && !newBooking.serviceId) {
      setNewBooking(prev => ({ ...prev, serviceId: services[0].id }));
    }
  }, [services]);

  // New/Edit Service State
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);

  // New/Edit Review State
  const [editingReview, setEditingReview] = useState<Partial<Review> | null>(null);

  // New/Edit Gallery State
  const [editingGalleryItem, setEditingGalleryItem] = useState<Partial<GalleryItem> | null>(null);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsubBookings = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        setBookings(data);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'bookings');
        setLoading(false);
      }
    );

    const unsubServices = subscribeToServices((data) => {
      setServices(data);
    });

    const unsubReviews = subscribeToReviews((data) => {
      setReviews(data);
    });

    const unsubGallery = subscribeToGallery((data) => {
      setGallery(data);
    });

    return () => {
      unsubBookings();
      unsubServices();
      unsubReviews();
      unsubGallery();
    };
  }, []);

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    try {
      const docRef = doc(db, 'bookings', id);
      await updateDoc(docRef, { status: newStatus, updatedAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const handleAddPhoneBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'bookings'), {
        ...newBooking,
        status: BookingStatus.CONFIRMED, // Assume phone calls are confirmed
        source: 'phone',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        adminId: auth.currentUser?.uid,
      });
      setShowAddModal(false);
      setNewBooking({
        customerName: '',
        email: '',
        phone: '',
        carModel: '',
        serviceId: services[0]?.id || INITIAL_SERVICES[0].id,
        date: '',
        time: '',
        notes: '',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    try {
      await saveService({
        ...editingService,
        order: editingService.order ?? services.length
      } as Service);
      setEditingService(null);
    } catch (e: any) {
      // Error is already handled/thrown by saveService with details
      alert(`Error saving service: ${e.message}`);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Delete this package? This will not affect existing bookings.')) return;
    try {
      await deleteService(id);
    } catch (e: any) {
      alert(`Error deleting service: ${e.message}`);
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    try {
      await saveReview({
        ...editingReview,
        order: editingReview.order ?? reviews.length
      } as Review);
      setEditingReview(null);
    } catch (e: any) {
      alert(`Error saving review: ${e.message}`);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(id);
    } catch (e: any) {
      alert(`Error deleting review: ${e.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      await deleteDoc(doc(db, 'bookings', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `bookings/${id}`);
    }
  };

  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGalleryItem) return;
    try {
      await saveGalleryItem({
        ...editingGalleryItem,
        order: editingGalleryItem.order ?? gallery.length,
        createdAt: editingGalleryItem.createdAt ?? serverTimestamp()
      } as GalleryItem);
      setEditingGalleryItem(null);
    } catch (e: any) {
      alert(`Error saving gallery item: ${e.message}`);
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!window.confirm('Delete this image from gallery?')) return;
    try {
      await deleteGalleryItem(id);
    } catch (e: any) {
      alert(`Error deleting gallery item: ${e.message}`);
    }
  };

  const handleClearGallery = async () => {
    if (!window.confirm('Are you serious? This will wipe the ENTIRE gallery collection. This cannot be undone.')) return;
    try {
      setLoading(true);
      await clearGallery();
    } catch (e: any) {
      alert(`Error clearing gallery: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'gallery' | 'service') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check file size (max 10MB per file)
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > 10 * 1024 * 1024) {
        alert(`File ${files[i].name} is too large (max 10MB)`);
        e.target.value = '';
        return;
      }
    }

    setUploading(true);
    try {
      const fileList = Array.from(files) as File[];
      const urls = await uploadToServer(fileList);

      if (target === 'gallery') {
        for (let i = 0; i < urls.length; i++) {
          await saveGalleryItem({
            url: urls[i],
            caption: fileList[i].name.split('.')[0].replace(/[-_]/g, ' '),
            order: gallery.length + i,
            createdAt: serverTimestamp()
          } as GalleryItem);
        }
        alert(`Successfully uploaded ${urls.length} photos!`);
      } else if (target === 'service' && editingService) {
        setEditingService({ ...editingService, image: urls[0] });
      }
      e.target.value = '';
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
      e.target.value = '';
    } finally {
      setUploading(false);
    }
  };

  const handleRestoreDefaults = async () => {
    if (!confirm('Re-seed the database with initial service packages? This will not remove your custom ones.')) return;
    try {
      await seedServicesIfEmpty(INITIAL_SERVICES);
    } catch (e) {
      alert('Error seeding services');
    }
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === BookingStatus.PENDING).length,
    confirmed: bookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
    completed: bookings.filter(b => b.status === BookingStatus.COMPLETED).length,
  };

  return (
    <div className="min-h-screen bg-slate-background text-white p-6 md:p-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase flex items-center gap-3">
            <span className="w-1.5 h-8 bg-blue-500 rounded-full"></span>
            Control Centre
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-slate-500 font-medium text-sm">Surgical Precision in Logistics</p>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 font-mono">
              Logged in as: {auth.currentUser?.email} {auth.currentUser?.emailVerified ? '(Verified)' : '(Unverified)'}
            </span>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={16} /> New Call Booking
          </button>
          <button 
            onClick={() => auth.signOut()}
            className="flex items-center justify-center glass px-6 py-3.5 rounded-xl text-slate-400 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-slate-900/50 p-1 rounded-2xl w-full md:w-fit overflow-x-auto no-scrollbar whitespace-nowrap">
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shrink-0 ${activeTab === 'bookings' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Calendar size={14} /> Bookings
        </button>
        <button 
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shrink-0 ${activeTab === 'services' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Package size={14} /> Packages
        </button>
        <button 
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shrink-0 ${activeTab === 'reviews' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Star size={14} /> Reviews
        </button>
        <button 
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shrink-0 ${activeTab === 'gallery' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <ImageIcon size={14} /> Gallery
        </button>
      </div>

      {activeTab === 'bookings' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              { label: 'Total Volume', val: stats.total, color: 'text-white' },
              { label: 'Awaiting Action', val: stats.pending, color: 'text-blue-400' },
              { label: 'Active Sessions', val: stats.confirmed, color: 'text-indigo-400' },
              { label: 'Completed', val: stats.completed, color: 'text-emerald-400' },
            ].map((s, i) => (
              <div key={i} className="glass p-6 rounded-2xl border border-blue-500/5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-2">{s.label}</p>
                <p className={`text-3xl font-black font-mono ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button 
              onClick={() => setFilterStatus('all')}
              className={`px-6 py-2.5 text-[10px] tracking-widest font-black uppercase rounded-lg border transition-all ${filterStatus === 'all' ? 'bg-white text-slate-950 border-white' : 'border-slate-800 text-slate-500 hover:border-slate-700'}`}
            >
              Overview
            </button>
            {Object.values(BookingStatus).map((status) => (
              <button 
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2.5 text-[10px] tracking-widest font-black uppercase rounded-lg border transition-all ${filterStatus === status ? 'bg-white text-slate-950 border-white' : 'border-slate-800 text-slate-500 hover:border-slate-700'}`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block glass rounded-3xl border border-blue-500/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
                    <th className="p-6">Client Identity</th>
                    <th className="p-6">Asset & Scope</th>
                    <th className="p-6">Timeline</th>
                    <th className="p-6">Origin</th>
                    <th className="p-6 text-center">Status</th>
                    <th className="p-6 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {loading ? (
                    <tr><td colSpan={6} className="p-20 text-center text-slate-500 italic font-medium">Synchronizing with encrypted records...</td></tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr><td colSpan={6} className="p-20 text-center text-slate-600 font-bold uppercase tracking-widest text-xs">No active files matching focus.</td></tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-blue-500/[0.02] transition-colors group">
                        <td className="p-6">
                          <div className="font-bold text-white mb-1">{b.customerName}</div>
                          <div className="space-y-1">
                            <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
                               <Phone size={10} className="text-blue-500/50" /> {b.phone}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
                               <Mail size={10} className="text-blue-500/50" /> {b.email}
                            </div>
                            {b.notes && (
                              <div className="text-[9px] text-amber-500/80 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 mt-1 inline-flex items-center gap-1">
                                <MessageSquare size={8} /> {b.notes}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="text-sm font-bold text-slate-300 mb-1">{b.carModel}</div>
                          <div className="text-[9px] uppercase tracking-widest font-black text-blue-500/60 bg-blue-500/5 px-2 py-0.5 rounded inline-block">
                            {services.find(s => s.id === b.serviceId)?.name || b.serviceId}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="text-xs font-bold text-slate-400 flex items-center gap-2 mb-1">
                            <Calendar size={12} className="text-blue-500/50" /> {b.date}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
                            <Clock size={12} className="text-blue-500/50" /> {b.time}
                          </div>
                        </td>
                        <td className="p-6">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${b.source === 'phone' ? 'border-indigo-500/30 text-indigo-400 bg-indigo-500/5' : 'border-slate-800 text-slate-500'}`}>
                            {b.source}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className={`text-center py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em]
                            ${b.status === BookingStatus.PENDING ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : ''}
                            ${b.status === BookingStatus.CONFIRMED ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : ''}
                            ${b.status === BookingStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : ''}
                            ${b.status === BookingStatus.CANCELLED ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : ''}
                          `}>
                            {b.status}
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            {b.status === BookingStatus.PENDING && (
                              <button onClick={() => handleStatusChange(b.id!, BookingStatus.CONFIRMED)} className="p-2.5 glass text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all" title="Approve"><Check size={14} /></button>
                            )}
                            {b.status === BookingStatus.CONFIRMED && (
                              <button onClick={() => handleStatusChange(b.id!, BookingStatus.COMPLETED)} className="p-2.5 glass text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-all" title="Archive"><Check size={14} /></button>
                            )}
                            <button onClick={() => handleDelete(b.id!)} className="p-2.5 glass text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all" title="Purge Record"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Carousel / Cards */}
          <div className="md:hidden space-y-4">
            {loading ? (
              <div className="py-20 text-center text-slate-500 italic font-medium glass rounded-3xl">Synchronizing...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-20 text-center text-slate-600 font-bold uppercase tracking-widest text-xs glass rounded-3xl">No records found</div>
            ) : (
              filteredBookings.map((b) => (
                <div key={b.id} className="glass p-6 rounded-3xl border border-blue-500/5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-white text-lg">{b.customerName}</h4>
                      <div className="space-y-0.5">
                        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
                          <Phone size={10} className="text-blue-500/50" /> {b.phone}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
                          <Mail size={10} className="text-blue-500/50" /> {b.email}
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border
                      ${b.status === BookingStatus.PENDING ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : ''}
                      ${b.status === BookingStatus.CONFIRMED ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}
                      ${b.status === BookingStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}
                      ${b.status === BookingStatus.CANCELLED ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : ''}
                    `}>
                      {b.status}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                      <p className="text-[8px] uppercase tracking-widest text-slate-500 mb-1 font-black">Asset</p>
                      <p className="text-xs font-bold text-slate-300">{b.carModel}</p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                      <p className="text-[8px] uppercase tracking-widest text-slate-500 mb-1 font-black">Scope</p>
                      <p className="text-xs font-bold text-blue-500">
                        {services.find(s => s.id === b.serviceId)?.name || b.serviceId}
                      </p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                      <p className="text-[8px] uppercase tracking-widest text-slate-500 mb-1 font-black">Execution</p>
                      <p className="text-xs font-bold text-slate-300">{b.date}</p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                      <p className="text-[8px] uppercase tracking-widest text-slate-500 mb-1 font-black">Origin</p>
                      <p className="text-xs font-bold text-indigo-400 capitalize">{b.source}</p>
                    </div>
                    {b.notes && (
                      <div className="col-span-2 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                        <p className="text-[8px] uppercase tracking-widest text-amber-500/60 mb-1 font-black">Notes</p>
                        <p className="text-xs text-amber-500/80 italic">"{b.notes}"</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {b.status === BookingStatus.PENDING && (
                      <button onClick={() => handleStatusChange(b.id!, BookingStatus.CONFIRMED)} className="flex-1 py-3 bg-blue-600/10 text-blue-600 border border-blue-600/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Confirm</button>
                    )}
                    {b.status === BookingStatus.CONFIRMED && (
                        <button onClick={() => handleStatusChange(b.id!, BookingStatus.COMPLETED)} className="flex-1 py-3 bg-emerald-600/10 text-emerald-600 border border-emerald-600/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">Complete</button>
                    )}
                    <button onClick={() => handleDelete(b.id!)} className="p-3 glass text-rose-500 rounded-xl border border-rose-500/10"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : activeTab === 'services' ? (
        /* Services Management */
        <div className="grid gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
             <h3 className="text-xl font-bold uppercase tracking-tight">Active Service Packages</h3>
             <div className="flex gap-3 w-full md:w-auto">
               <button 
                  onClick={handleRestoreDefaults}
                  className="flex-1 md:flex-none glass border-slate-800 text-slate-400 hover:text-white px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
               >
                  <RefreshCcw size={14} /> Restore Defaults
               </button>
               <button 
                  onClick={() => setEditingService({ name: '', description: '', price: '', duration: '', image: '', order: services.length })}
                  className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
               >
                  <Plus size={14} /> Add New Package
               </button>
             </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="glass p-6 rounded-3xl border border-blue-500/10 group relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">{service.name}</h4>
                    <span className="text-blue-400 font-mono font-bold text-sm">{service.price}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingService(service)}
                      className="p-2 glass rounded-lg text-slate-400 hover:text-white transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2 glass rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">{service.description}</p>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase text-slate-500 tracking-widest">
                  <span>{service.duration}</span>
                  <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                  <span>Order: {service.order}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'reviews' ? (
        /* Reviews Management */
        <div className="grid gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
             <h3 className="text-xl font-bold uppercase tracking-tight">Customer Testimonials</h3>
             <button 
                onClick={() => setEditingReview({ author: '', rating: 5, content: '', order: reviews.length, date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) })}
                className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
             >
                <Plus size={14} /> Add Review
             </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div key={review.id} className="glass p-6 rounded-3xl border border-blue-500/10 group relative">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">{review.author}</h4>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < review.rating ? "fill-blue-500 text-blue-500" : "text-slate-700"} />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingReview(review)}
                      className="p-2 glass rounded-lg text-slate-400 hover:text-white transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteReview(review.id!)}
                      className="p-2 glass rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4 italic line-clamp-3">"{review.content}"</p>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase text-slate-500 tracking-widest">
                  <span>{review.date}</span>
                  <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                  <span>Order: {review.order}</span>
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="col-span-full py-20 text-center glass border-slate-800 rounded-3xl">
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">No reviews documented yet</p>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'gallery' ? (
        /* Gallery Management */
        <div className="grid gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
             <h3 className="text-xl font-bold uppercase tracking-tight">Showcase Gallery</h3>
             <div className="flex gap-4">
               <button 
                  onClick={handleClearGallery}
                  className="flex-1 md:flex-none glass border-rose-500/20 text-rose-500 hover:text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
               >
                  <Trash size={14} /> Clear All
               </button>
               <div className="relative">
                 <input 
                   type="file" 
                   accept="image/*" 
                   multiple
                   onChange={(e) => handleFileUpload(e, 'gallery')}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                   disabled={uploading}
                 />
                 <button className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
                   {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} 
                   Add Photos
                 </button>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {gallery.map((item) => (
              <div key={item.id} className="glass rounded-3xl border border-blue-500/10 group relative aspect-[4/5] overflow-hidden">
                <img src={item.url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setEditingGalleryItem(item)}
                      className="p-2 glass rounded-lg text-white hover:bg-blue-600 transition-all"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button 
                      onClick={() => handleDeleteGalleryItem(item.id!)}
                      className="p-2 glass rounded-lg text-white hover:bg-rose-600 transition-all"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                  <p className="text-[10px] font-bold text-white uppercase tracking-widest line-clamp-2">{item.caption || 'No Caption'}</p>
                </div>
              </div>
            ))}
            {gallery.length === 0 && (
              <div className="col-span-full py-20 text-center glass border-slate-800 rounded-3xl">
                <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Gallery is empty</p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass border-blue-500/10 p-10 rounded-[2.5rem] w-full max-w-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-10">
                <h2 className="text-3xl font-extrabold tracking-tight uppercase">Log New Intake</h2>
                <p className="text-slate-500 text-sm font-medium">Manual override for phone consultations</p>
              </div>
              
              <form onSubmit={handleAddPhoneBooking} className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Client Name</label>
                  <input required className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none transition-all" placeholder="Enter Full Name" value={newBooking.customerName} onChange={e => setNewBooking({...newBooking, customerName: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Secure Line</label>
                  <input required className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none transition-all" placeholder="Contact Number" value={newBooking.phone} onChange={e => setNewBooking({...newBooking, phone: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Machine Class</label>
                  <input required className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none transition-all" placeholder="e.g. Audi RS6" value={newBooking.carModel} onChange={e => setNewBooking({...newBooking, carModel: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Operational Scope</label>
                  <select className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer" value={newBooking.serviceId} onChange={e => setNewBooking({...newBooking, serviceId: e.target.value as string})}>
                    {services.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Execution Date</label>
                  <input required type="date" className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none transition-all" value={newBooking.date} onChange={e => setNewBooking({...newBooking, date: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Window Time</label>
                  <input required type="time" className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none transition-all" value={newBooking.time} onChange={e => setNewBooking({...newBooking, time: e.target.value})} />
                </div>
                <button type="submit" className="col-span-2 bg-blue-600 text-white font-bold rounded-2xl py-5 mt-4 group hover:bg-blue-500 transition-all uppercase tracking-widest text-[11px] flex items-center justify-center gap-3">
                  Commit Intake Record
                  <PhoneCall size={16} className="group-hover:rotate-12 transition-transform" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Service Edit Modal */}
      <AnimatePresence>
        {editingService && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass border-blue-500/10 p-6 md:p-10 rounded-[2.5rem] w-full max-w-2xl relative my-8"
            >
              <div className="absolute top-0 right-0 p-6 md:p-8">
                <button 
                  onClick={() => {
                    setEditingService(null);
                    setShowGalleryPicker(false);
                  }} 
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-10">
                <h2 className="text-3xl font-extrabold tracking-tight uppercase">{editingService.id ? 'Refine Package' : 'New Package'}</h2>
                <p className="text-slate-500 text-sm font-medium">Configure service parameters</p>
              </div>
              
              <form onSubmit={handleSaveService} className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Package Name</label>
                  <input required className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none transition-all" value={editingService.name || ''} onChange={e => setEditingService({...editingService, name: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Price Point</label>
                  <input required className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none transition-all" value={editingService.price || ''} onChange={e => setEditingService({...editingService, price: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Estimated Time</label>
                  <input required className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none transition-all" value={editingService.duration || ''} onChange={e => setEditingService({...editingService, duration: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Description</label>
                  <textarea required className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm font-medium h-32 focus:border-blue-500 outline-none transition-all resize-none" value={editingService.description || ''} onChange={e => setEditingService({...editingService, description: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2 col-span-2">
                  <div className="flex justify-between items-end ml-1">
                    <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest">Package Image</label>
                    <button 
                      type="button"
                      onClick={() => setShowGalleryPicker(!showGalleryPicker)}
                      className="text-[10px] font-bold uppercase tracking-widest text-blue-500 hover:text-blue-400 flex items-center gap-1.5 transition-colors"
                    >
                      <ImageIcon size={12} />
                      {showGalleryPicker ? 'Close Gallery' : 'Select from Gallery'}
                    </button>
                  </div>
                  
                  {showGalleryPicker ? (
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 max-h-[300px] overflow-y-auto no-scrollbar grid grid-cols-3 gap-3">
                      {gallery.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setEditingService({ ...editingService, image: item.url });
                            setShowGalleryPicker(false);
                          }}
                          className={`aspect-square rounded-xl overflow-hidden border-2 transition-all relative group ${editingService.image === item.url ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-transparent hover:border-slate-700'}`}
                        >
                          <img src={item.url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                          <div className={`absolute inset-0 bg-blue-600/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${editingService.image === item.url ? 'opacity-100' : ''}`}>
                            <Check size={20} className="text-white" />
                          </div>
                        </button>
                      ))}
                      {gallery.length === 0 && (
                        <div className="col-span-full py-8 text-center">
                          <p className="text-[10px] uppercase font-bold text-slate-600 tracking-widest">Gallery is empty</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'service')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={uploading}
                      />
                      <div className={`w-full min-h-24 bg-slate-900/60 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all ${uploading ? 'opacity-50' : 'group-hover:border-blue-500/50 group-hover:bg-slate-900'}`}>
                        {uploading ? (
                          <>
                            <Loader2 size={24} className="text-blue-500 animate-spin" />
                            <p className="text-[10px] uppercase font-bold text-blue-500 tracking-widest">Uploading...</p>
                          </>
                        ) : editingService.image ? (
                          <div className="w-full flex items-center justify-center p-4 gap-4">
                            <img src={editingService.image} className="w-16 h-16 object-cover rounded-lg border border-slate-700" alt="Preview" />
                            <div className="text-left">
                              <p className="text-[10px] uppercase font-bold text-green-500 tracking-widest">Image Ready</p>
                              <p className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">{editingService.image}</p>
                            </div>
                            <Upload size={14} className="text-slate-500 ml-auto" />
                          </div>
                        ) : (
                          <>
                            <Upload size={24} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest text-center">Click or Drag to Upload Package Image</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Or Image URL</label>
                  <input className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none transition-all" value={editingService.image || ''} onChange={e => setEditingService({...editingService, image: e.target.value})} placeholder="https://..." />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Display Order</label>
                  <input type="number" required className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none transition-all" value={editingService.order ?? 0} onChange={e => setEditingService({...editingService, order: parseInt(e.target.value)})} />
                </div>
                <button type="submit" className="col-span-full bg-blue-600 text-white font-bold rounded-2xl py-5 mt-4 group hover:bg-blue-500 transition-all uppercase tracking-widest text-[11px] flex items-center justify-center gap-3">
                  Deploy Package Updates
                  <Save size={16} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Edit Modal */}
      <AnimatePresence>
        {editingReview && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass border-blue-500/10 p-6 md:p-10 rounded-[2.5rem] w-full max-w-2xl relative my-8"
            >
              <div className="absolute top-0 right-0 p-6 md:p-8">
                <button onClick={() => setEditingReview(null)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-10">
                <h2 className="text-3xl font-extrabold tracking-tight uppercase">{editingReview.id ? 'Refine Review' : 'New Review'}</h2>
                <p className="text-slate-500 text-sm font-medium">Customer sentiment management</p>
              </div>
              
              <form onSubmit={handleSaveReview} className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Author Name</label>
                  <input required className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none transition-all" value={editingReview.author || ''} onChange={e => setEditingReview({...editingReview, author: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Rating (1-5)</label>
                  <input required type="number" min="1" max="5" className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none transition-all" value={editingReview.rating || 5} onChange={e => setEditingReview({...editingReview, rating: parseInt(e.target.value)})} />
                </div>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Review Content</label>
                  <textarea required className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm font-medium h-32 focus:border-blue-500 outline-none transition-all resize-none" value={editingReview.content || ''} onChange={e => setEditingReview({...editingReview, content: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Date</label>
                  <input className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none transition-all" value={editingReview.date || ''} onChange={e => setEditingReview({...editingReview, date: e.target.value})} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Display Order</label>
                  <input type="number" required className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none transition-all" value={editingReview.order ?? 0} onChange={e => setEditingReview({...editingReview, order: parseInt(e.target.value)})} />
                </div>
                <button type="submit" className="col-span-full bg-blue-600 text-white font-bold rounded-2xl py-5 mt-4 group hover:bg-blue-500 transition-all uppercase tracking-widest text-[11px] flex items-center justify-center gap-3">
                  Commit Review
                  <Save size={16} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gallery Edit Modal */}
      <AnimatePresence>
        {editingGalleryItem && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass border-blue-500/10 p-6 md:p-10 rounded-[2.5rem] w-full max-w-2xl relative my-8"
            >
              <div className="absolute top-0 right-0 p-6 md:p-8">
                <button onClick={() => setEditingGalleryItem(null)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-10">
                <h2 className="text-3xl font-extrabold tracking-tight uppercase">{editingGalleryItem.id ? 'Refine Photo' : 'New Photo'}</h2>
                <p className="text-slate-500 text-sm font-medium">Showcase gallery management</p>
              </div>
              
              <form onSubmit={handleSaveGalleryItem} className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Upload Photo</label>
                  <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileUpload(e, 'gallery')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={uploading}
                      />
                    <div className={`w-full min-h-32 bg-slate-900/60 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all ${uploading ? 'opacity-50' : 'group-hover:border-blue-500/50 group-hover:bg-slate-900'}`}>
                      {uploading ? (
                        <>
                          <Loader2 size={32} className="text-blue-500 animate-spin" />
                          <p className="text-[10px] uppercase font-bold text-blue-500 tracking-widest">Uploading...</p>
                        </>
                      ) : editingGalleryItem.url ? (
                        <div className="w-full flex items-center justify-center p-4 gap-4">
                          <img src={editingGalleryItem.url} className="w-20 h-20 object-cover rounded-lg border border-slate-700" alt="Preview" />
                          <div className="text-left">
                            <p className="text-[10px] uppercase font-bold text-green-500 tracking-widest">Image Ready</p>
                            <p className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">{editingGalleryItem.url}</p>
                          </div>
                          <Upload size={16} className="text-slate-500 ml-auto" />
                        </div>
                      ) : (
                        <>
                          <Upload size={32} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
                          <div className="text-center">
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Click or Drag to Upload</p>
                            <p className="text-[9px] text-slate-600 mt-1 uppercase">Max 10MB • PNG, JPG</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Or Image URL</label>
                  <input className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none transition-all" value={editingGalleryItem.url || ''} onChange={e => setEditingGalleryItem({...editingGalleryItem, url: e.target.value})} placeholder="https://..." />
                </div>
                <div className="flex flex-col gap-2 col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Caption</label>
                  <input className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none transition-all" value={editingGalleryItem.caption || ''} onChange={e => setEditingGalleryItem({...editingGalleryItem, caption: e.target.value})} placeholder="Describe the result" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Display Order</label>
                  <input type="number" required className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-sm font-medium focus:border-blue-500 outline-none transition-all" value={editingGalleryItem.order ?? 0} onChange={e => setEditingGalleryItem({...editingGalleryItem, order: parseInt(e.target.value)})} />
                </div>
                <button type="submit" className="col-span-full bg-blue-600 text-white font-bold rounded-2xl py-5 mt-4 group hover:bg-blue-500 transition-all uppercase tracking-widest text-[11px] flex items-center justify-center gap-3">
                  {editingGalleryItem.id ? 'Execute Update' : 'Commit to Showcase'}
                  <Save size={16} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
