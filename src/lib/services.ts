import { 
  collection, query, orderBy, onSnapshot, 
  doc, setDoc, deleteDoc, getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Service, Review, GalleryItem } from '../types';
import { handleFirestoreError, OperationType } from './firebase-utils';

const SERVICES_COLLECTION = 'services';
const REVIEWS_COLLECTION = 'reviews';
const GALLERY_COLLECTION = 'gallery';

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
