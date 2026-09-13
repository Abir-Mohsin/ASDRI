'use client';

import { useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuthStore, UserRole } from '@/lib/store/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setRole, setStatus, setLoading } = useAuthStore();

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Listen to user document changes in real-time
        unsubscribeUserDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), (userDoc) => {
          if (userDoc.exists()) {
            const data = userDoc.data();
            setRole((data.role as UserRole) || 'guest');
            setStatus(data.status || 'approved');
          } else {
            setRole('guest'); // Default role if no document
            setStatus('approved');
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user doc:", error);
          setRole('guest');
          setStatus('approved');
          setLoading(false);
        });

      } else {
        if (unsubscribeUserDoc) {
          unsubscribeUserDoc();
          unsubscribeUserDoc = null;
        }
        setUser(null);
        setRole(null);
        setStatus(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) {
        (unsubscribeUserDoc as () => void)();
      }
    };
  }, [setUser, setRole, setStatus, setLoading]);

  return <>{children}</>;
}
