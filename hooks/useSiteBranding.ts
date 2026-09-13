'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DEFAULT_BRANDING, SiteBrandingData } from '@/lib/branding';

let cachedBranding: SiteBrandingData = DEFAULT_BRANDING;
let hasLoadedOnce = false;

export function useSiteBranding() {
  const [branding, setBranding] = useState<SiteBrandingData>(cachedBranding);
  const [isLoading, setIsLoading] = useState(!hasLoadedOnce);

  useEffect(() => {
    // Subscribe to site_pages/branding in real-time
    const unsub = onSnapshot(
      doc(db, 'site_pages', 'branding'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<SiteBrandingData>;
          const merged: SiteBrandingData = {
            ...DEFAULT_BRANDING,
            ...data,
          };
          cachedBranding = merged;
          hasLoadedOnce = true;
          setBranding(merged);
        } else {
          // If document doesn't exist yet, keep default branding
          hasLoadedOnce = true;
          setBranding(DEFAULT_BRANDING);
        }
        setIsLoading(false);
      },
      (error) => {
        console.warn('Could not fetch site branding from Firestore, using default:', error.message);
        setIsLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { branding, isLoading };
}
