import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  onSnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { MediaItem, WatchStatus } from '../types';

const PAGE_SIZE = 20;

export function useMedia(userId: string | undefined) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const lastDoc = useRef<QueryDocumentSnapshot | null>(null);

  // Initial fetch
  useEffect(() => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      return;
    }

    const fetchInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        // We remove the orderBy('createdAt') to ensure visibility of old documents
        // that might be missing this field. Firestore queries with orderBy(field)
        // exclude documents where that field is missing.
        const q = query(
          collection(db, 'media'),
          where('userId', '==', userId),
          limit(PAGE_SIZE)
        );

        const snapshot = await getDocs(q);
        const mediaItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as MediaItem[];

        // Sort in memory for the current page to maintain some order
        mediaItems.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        setItems(mediaItems);
        lastDoc.current = snapshot.docs[snapshot.docs.length - 1] || null;
        setHasMore(snapshot.docs.length === PAGE_SIZE);
      } catch (err) {
        console.error("Firestore error: ", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();

    // Optional: Keep real-time updates for the FIRST page only to ensure UI is snappy
    // but for true scalability with 10k items, you wouldn't use real-time on everything.
    // We'll stick to a hybrid or manual refresh for now for simplicity and scalability.
  }, [userId]);

  const loadMore = useCallback(async () => {
    if (!userId || !hasMore || loadingMore || !lastDoc.current) return;

    setLoadingMore(true);
    try {
      const q = query(
        collection(db, 'media'),
        where('userId', '==', userId),
        startAfter(lastDoc.current),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(q);
      const newItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as MediaItem[];

      setItems(prev => [...prev, ...newItems]);
      lastDoc.current = snapshot.docs[snapshot.docs.length - 1] || null;
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error("Error loading more: ", err);
    } finally {
      setLoadingMore(false);
    }
  }, [userId, hasMore, loadingMore]);

  const addMedia = useCallback(async (newItem: Omit<MediaItem, 'id' | 'createdAt' | 'userId'>) => {
    if (!userId) return;
    const docRef = await addDoc(collection(db, 'media'), {
      ...newItem,
      userId,
      createdAt: Date.now()
    });
    
    // Optimistic update or manual refresh
    const addedItem = { id: docRef.id, ...newItem, userId, createdAt: Date.now() } as MediaItem;
    setItems(prev => [addedItem, ...prev]);
    return docRef;
  }, [userId]);

  const updateMedia = useCallback(async (id: string, updates: Partial<MediaItem>) => {
    const docRef = doc(db, 'media', id);
    await updateDoc(docRef, updates);
    
    // Update local state
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const removeMedia = useCallback(async (id: string) => {
    const docRef = doc(db, 'media', id);
    await deleteDoc(docRef);
    
    // Update local state
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateStatus = useCallback(async (id: string, status: WatchStatus) => {
    return await updateMedia(id, { status });
  }, [updateMedia]);

  return { 
    items, 
    loading, 
    loadingMore,
    hasMore,
    error, 
    loadMore,
    addMedia, 
    updateMedia, 
    removeMedia, 
    updateStatus 
  };
}
