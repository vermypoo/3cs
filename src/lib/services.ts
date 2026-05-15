import { 
  collection, query, orderBy, onSnapshot, 
  doc, setDoc, deleteDoc, getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Service, Review, GalleryItem, AppSettings, FAQ, GalleryCategory, Expense } from '../types';
import { handleFirestoreError, OperationType } from './firebase-utils';

const SERVICES_COLLECTION = 'services';
const REVIEWS_COLLECTION = 'reviews';
const GALLERY_COLLECTION = 'gallery';
const SETTINGS_COLLECTION = 'settings';
const FAQS_COLLECTION = 'faqs';
const GALLERY_CATEGORIES_COLLECTION = 'gallery_categories';
const EXPENSES_COLLECTION = 'expenses';

async function compressImage(file: File, maxWidth = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}

export async function uploadToServer(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  
  for (const file of files) {
    try {
      // For very large files, we use more aggressive compression
      const quality = file.size > 2 * 1024 * 1024 ? 0.5 : 0.7;
      const base64 = await compressImage(file, 1200, quality);
      urls.push(base64);
    } catch (error) {
      console.error("Compression failed for file:", file.name, error);
      throw new Error(`Failed to process image ${file.name}`);
    }
  }
  
  return urls;
}

export function subscribeToServices(callback: (services: Service[]) => void) {
  const q = query(collection(db, SERVICES_COLLECTION), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const services = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as Service));
    callback(services);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, SERVICES_COLLECTION);
  });
}

export async function saveService(service: Partial<Service> & { id?: string }) {
  const { id, ...data } = service;
  const path = id ? `${SERVICES_COLLECTION}/${id}` : `${SERVICES_COLLECTION}`;
  try {
    const docRef = id ? doc(db, SERVICES_COLLECTION, id) : doc(collection(db, SERVICES_COLLECTION));
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteService(id: string) {
  const path = `${SERVICES_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, SERVICES_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToReviews(callback: (reviews: Review[]) => void) {
  const q = query(collection(db, REVIEWS_COLLECTION), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const reviews = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as Review));
    callback(reviews);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, REVIEWS_COLLECTION);
  });
}

export async function saveReview(review: Partial<Review> & { id?: string }) {
  const { id, ...data } = review;
  const path = id ? `${REVIEWS_COLLECTION}/${id}` : `${REVIEWS_COLLECTION}`;
  try {
    const docRef = id ? doc(db, REVIEWS_COLLECTION, id) : doc(collection(db, REVIEWS_COLLECTION));
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteReview(id: string) {
  const path = `${REVIEWS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, REVIEWS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToGallery(callback: (items: GalleryItem[]) => void) {
  const q = query(collection(db, GALLERY_COLLECTION), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as GalleryItem));
    callback(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, GALLERY_COLLECTION);
  });
}

export async function saveGalleryItem(item: Partial<GalleryItem> & { id?: string }) {
  const { id, ...data } = item;
  const path = id ? `${GALLERY_COLLECTION}/${id}` : `${GALLERY_COLLECTION}`;
  try {
    const docRef = id ? doc(db, GALLERY_COLLECTION, id) : doc(collection(db, GALLERY_COLLECTION));
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteGalleryItem(id: string) {
  const path = `${GALLERY_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, GALLERY_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function clearGallery() {
  try {
    const snapshot = await getDocs(collection(db, GALLERY_COLLECTION));
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, GALLERY_COLLECTION);
  }
}

// Initial seed data if collection is empty
export async function seedServicesIfEmpty(initialServices: any[]) {
  const snapshot = await getDocs(collection(db, SERVICES_COLLECTION));
  if (snapshot.empty) {
    console.log('Seeding services...');
    for (let i = 0; i < initialServices.length; i++) {
        const s = initialServices[i];
        const { id, ...data } = s;
        const serviceId = id.toLowerCase().replace(/\s+/g, '-');
        await setDoc(doc(db, SERVICES_COLLECTION, serviceId), {
            ...data,
            order: i
        });
    }
  }
}

export async function seedReviewsIfEmpty(initialReviews: any[]) {
  const snapshot = await getDocs(collection(db, REVIEWS_COLLECTION));
  if (snapshot.empty) {
    console.log('Seeding reviews...');
    for (let i = 0; i < initialReviews.length; i++) {
      const review = initialReviews[i];
      await saveReview({ ...review, order: i });
    }
  }
}

export function subscribeToSettings(callback: (settings: AppSettings | null) => void) {
  const docRef = doc(db, SETTINGS_COLLECTION, 'global');
  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as AppSettings);
    } else {
      callback(null);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/global`);
  });
}

export async function saveSettings(settings: Partial<AppSettings>) {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'global');
    await setDoc(docRef, settings, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${SETTINGS_COLLECTION}/global`);
  }
}

export function subscribeToFAQs(callback: (faqs: FAQ[]) => void) {
  const q = query(collection(db, FAQS_COLLECTION), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const faqs = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as FAQ));
    callback(faqs);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, FAQS_COLLECTION);
  });
}

export async function saveFAQ(faq: Partial<FAQ> & { id?: string }) {
  const { id, ...data } = faq;
  const path = id ? `${FAQS_COLLECTION}/${id}` : `${FAQS_COLLECTION}`;
  try {
    const docRef = id ? doc(db, FAQS_COLLECTION, id) : doc(collection(db, FAQS_COLLECTION));
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteFAQ(id: string) {
  const path = `${FAQS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, FAQS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function seedFAQsIfEmpty(initialFAQs: any[]) {
  const snapshot = await getDocs(collection(db, FAQS_COLLECTION));
  if (snapshot.empty) {
    console.log('Seeding FAQs...');
    for (let i = 0; i < initialFAQs.length; i++) {
      const faq = initialFAQs[i];
      await saveFAQ({ ...faq, order: i });
    }
  }
}

export function subscribeToGalleryCategories(callback: (categories: GalleryCategory[]) => void) {
  const q = query(collection(db, GALLERY_CATEGORIES_COLLECTION), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const categories = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as GalleryCategory));
    callback(categories);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, GALLERY_CATEGORIES_COLLECTION);
  });
}

export async function saveGalleryCategory(category: Partial<GalleryCategory> & { id?: string }) {
  const { id, ...data } = category;
  const path = id ? `${GALLERY_CATEGORIES_COLLECTION}/${id}` : `${GALLERY_CATEGORIES_COLLECTION}`;
  try {
    const docRef = id ? doc(db, GALLERY_CATEGORIES_COLLECTION, id) : doc(collection(db, GALLERY_CATEGORIES_COLLECTION));
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteGalleryCategory(id: string) {
  const path = `${GALLERY_CATEGORIES_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, GALLERY_CATEGORIES_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToExpenses(callback: (expenses: Expense[]) => void) {
  const q = query(collection(db, EXPENSES_COLLECTION), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as Expense));
    callback(expenses);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, EXPENSES_COLLECTION);
  });
}

export async function saveExpense(expense: Partial<Expense> & { id?: string }) {
  const { id, ...data } = expense;
  const path = id ? `${EXPENSES_COLLECTION}/${id}` : `${EXPENSES_COLLECTION}`;
  try {
    const docRef = id ? doc(db, EXPENSES_COLLECTION, id) : doc(collection(db, EXPENSES_COLLECTION));
    await setDoc(docRef, { ...data, createdAt: data.createdAt ?? serverTimestamp() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteExpense(id: string) {
  const path = `${EXPENSES_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, EXPENSES_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
