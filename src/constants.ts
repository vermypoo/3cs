import { Service, ServiceType } from './types';

export const SERVICES: Service[] = [
  {
    id: ServiceType.BASIC_VALET,
    name: 'Basic Valeting',
    description: 'A thorough exterior wash, dry, and interior vacuum. Perfect for regular maintenance.',
    price: '£40',
    duration: '1.5 Hours',
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=1931&auto=format&fit=crop',
    order: 0,
  },
  {
    id: ServiceType.FULL_VALET,
    name: 'Full Valeting',
    description: 'Comprehensive interior and exterior deep clean. Includes wax protection and leather conditioning.',
    price: '£85',
    duration: '3-4 Hours',
    image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d59085?q=80&w=2070&auto=format&fit=crop',
    order: 1,
  },
  {
    id: ServiceType.INTERIOR_DEEP_CLEAN,
    name: 'Interior Deep Clean',
    description: 'Steam cleaning, shampooed carpets, and surface decontamination. Like a factory reset for your car.',
    price: '£60',
    duration: '2 Hours',
    image: 'https://images.unsplash.com/photo-1599256621730-535171e28e50?q=80&w=2071&auto=format&fit=crop',
    order: 2,
  },
];

export const CONTACT_INFO = {
  phone: '+44 07858 53851',
  email: '3csvaleting@gmail.com',
  area: 'Local Service In Aylesbury',
};

export const REVIEWS = [
  {
    author: "Robert Fletcher",
    rating: 5,
    content: "Spotless finish on my SUV. These guys really know their stuff - the interior smells like a new car again. Friendly service and worth every penny.",
    date: "12 May 2024",
    order: 0
  },
  {
    author: "Thomas Wright",
    rating: 5,
    content: "Professional, punctual, and precise. They treated my vehicle with extreme care. The best valeting experience I've had in the Aylesbury area.",
    date: "05 May 2024",
    order: 1
  }
];

export const FAQS = [
  {
    question: "Do you come to my location?",
    answer: "Yes! We are a 100% mobile service. We provide valeting and detailing at your home or workplace in Aylesbury and surrounding areas.",
    order: 0
  },
  {
    question: "Do you need access to water or electricity?",
    answer: "We carry our own professional equipment, but having access to a standard electrical socket and an outdoor tap is preferred for the best possible results. However, please let us know if neither is available so we can prepare accordingly.",
    order: 1
  },
  {
    question: "How long does a full valet take?",
    answer: "A full valet typically takes between 3 to 4 hours, depending on the condition and size of the vehicle. We take our time to ensure every detail is perfect.",
    order: 2
  }
];

