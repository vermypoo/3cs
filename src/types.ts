export enum ServiceType {
  BASIC_VALET = 'Basic Valeting',
  FULL_VALET = 'Full Valeting',
  INTERIOR_DEEP_CLEAN = 'Interior Deep Clean',
  PAINT_CORRECTION = 'Paint Correction',
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  image?: string;
  order: number;
  isVisible?: boolean;
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Booking {
  id?: string;
  customerName: string;
  email: string;
  phone: string;
  carModel: string;
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  source: 'web' | 'phone';
}

export interface Review {
  id?: string;
  author: string;
  rating: number;
  content: string;
  date?: string;
  order: number;
  isVisible?: boolean;
}

export interface GalleryItem {
  id?: string;
  url: string;
  caption?: string;
  categoryId?: string;
  order: number;
  isVisible?: boolean;
  createdAt?: any;
}

export interface GalleryCategory {
  id?: string;
  name: string;
  order: number;
  isVisible?: boolean;
}

export interface FAQ {
  id?: string;
  question: string;
  answer: string;
  order: number;
  isVisible?: boolean;
}

export interface AppSettings {
  logoUrl?: string;
  siteName?: string;
  faviconUrl?: string;
}
