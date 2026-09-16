'use client';

import { useEffect, useRef } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { useAuthStore, UserRole } from '@/lib/store/useAuthStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setRole, setStatus, setLoading } = useAuthStore();
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;
    let isMounted = true;

    const setupUserDocListener = (firebaseUser: User) => {
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }

      const isSuperAdminEmail = firebaseUser.email === 'abirmohsin02@gmail.com';

      // Instantly grant super_admin state for abirmohsin02@gmail.com
      if (isSuperAdminEmail) {
        setRole('super_admin');
        setStatus('approved');
      }

      const userDocRef = doc(db, 'users', firebaseUser.uid);

      unsubscribeUserDoc = onSnapshot(
        userDocRef,
        async (userDoc) => {
          if (!isMounted) return;

          if (userDoc.exists()) {
            const data = userDoc.data();

            if (isSuperAdminEmail && (data.role !== 'super_admin' || data.status !== 'approved')) {
              try {
                await setDoc(
                  userDocRef,
                  {
                    role: 'super_admin',
                    status: 'approved',
                  },
                  { merge: true }
                );
                return;
              } catch (e) {
                console.warn('Super admin Firestore role sync postponed:', e);
              }
            }

            if (isSuperAdminEmail) {
              setRole('super_admin');
              setStatus('approved');
            } else {
              setRole((data.role as UserRole) || 'guest');
              setStatus(data.status || 'approved');
            }
            setLoading(false);
          } else {
            // Auto-create document if missing
            try {
              await setDoc(userDocRef, {
                name: firebaseUser.displayName || (isSuperAdminEmail ? 'Abir Mohsin' : 'User'),
                email: firebaseUser.email,
                role: isSuperAdminEmail ? 'super_admin' : 'guest',
                status: 'approved',
                createdAt: new Date().toISOString(),
              });
            } catch (e) {
              console.warn('Initial user doc creation postponed:', e);
            }

            if (isSuperAdminEmail) {
              setRole('super_admin');
              setStatus('approved');
            } else {
              setRole('guest');
              setStatus('approved');
            }
            setLoading(false);
          }
        },
        async (error) => {
          if (!isMounted) return;

          // Graceful handling for permission sync or initial connection race condition
          console.warn('User document listener sync notice:', error.message || error);

          if (isSuperAdminEmail) {
            setRole('super_admin');
            setStatus('approved');
          } else {
            // Attempt fallback one-time read
            try {
              const snap = await getDoc(userDocRef);
              if (snap.exists()) {
                const d = snap.data();
                setRole((d.role as UserRole) || 'guest');
                setStatus(d.status || 'approved');
              } else {
                setRole('guest');
                setStatus('approved');
              }
            } catch {
              setRole('guest');
              setStatus('approved');
            }
          }
          setLoading(false);

          // Retry attaching snapshot after 2 seconds if connection token was propagating
          if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
          retryTimeoutRef.current = setTimeout(() => {
            if (isMounted && auth.currentUser?.uid === firebaseUser.uid) {
              setupUserDocListener(firebaseUser);
            }
          }, 2000);
        }
      );
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      if (firebaseUser) {
        setUser(firebaseUser);
        setupUserDocListener(firebaseUser);
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
      isMounted = false;
      unsubscribeAuth();
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [setUser, setRole, setStatus, setLoading]);

  return <>{children}</>;
}
