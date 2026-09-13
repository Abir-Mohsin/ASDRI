'use client';

import React, { useState, useEffect } from 'react';
import { AlumniProfile } from '@/lib/alumniTypes';
import { 
  ShieldCheck, Search, CheckCircle2, XCircle, 
  X, User, GraduationCap, Building, Calendar
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface AlumniDigitalVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialId?: string;
  localList?: AlumniProfile[];
}

export function AlumniDigitalVerificationModal({ 
  isOpen, 
  onClose, 
  initialId = '', 
  localList = [] 
}: AlumniDigitalVerificationModalProps) {
  const [verifyId, setVerifyId] = useState(initialId);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<AlumniProfile | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearchId = async (idToSearch: string) => {
    const cleanId = idToSearch.trim();
    if (!cleanId) return;

    setIsSearching(true);
    setSearched(true);
    setResult(null);

    try {
      // First check local list
      const localMatch = localList.find(a => a.alumniId?.toUpperCase() === cleanId.toUpperCase());
      if (localMatch) {
        setResult(localMatch);
        setIsSearching(false);
        return;
      }

      // Query firestore
      const q = query(
        collection(db, 'alumni_profiles'), 
        where('alumniId', '==', cleanId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setResult({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as AlumniProfile);
      }
    } catch (error) {
      console.error('Error verifying alumni ID:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      setVerifyId(initialId);
      handleSearchId(initialId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-linear-to-r from-[#064e3b] to-[#043e2f] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-serif font-bold text-base text-amber-300">
                Digital Alumni Card Verification
              </h3>
              <p className="text-[11px] text-emerald-100">
                Official ASDRI Digital Credential Verification
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-emerald-200 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-5">
          
          {/* Search Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Enter Digital Alumni ID Number:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={verifyId}
                onChange={(e) => setVerifyId(e.target.value)}
                placeholder="e.g., ASDRI-ALM-2021-00101"
                className="flex-1 text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white font-mono"
              />
              <button
                type="button"
                onClick={() => handleSearchId(verifyId)}
                disabled={isSearching}
                className="px-5 py-3 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                {isSearching ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>

          {/* Verification Result Box */}
          {searched && (
            <div className="animate-in fade-in duration-150">
              {result ? (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs pb-2 border-b border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Valid & Verified Alumni Record Found</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <img
                      src={result.photoUrl}
                      alt={result.fullName}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-400 shadow-xs"
                    />
                    <div>
                      <h4 className="text-base font-bold font-serif text-slate-900">{result.fullName}</h4>
                      <p className="text-xs font-bold text-[#064e3b]">{result.profession}</p>
                      <p className="text-[11px] font-mono text-emerald-700 font-bold mt-0.5">{result.alumniId}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 bg-white/80 p-3 rounded-xl">
                    <p><span className="text-slate-400">Department:</span> <strong>{result.program}</strong></p>
                    <p><span className="text-slate-400">Graduation Batch:</span> <strong>{result.batch}</strong></p>
                    <p><span className="text-slate-400">Organization:</span> <strong>{result.organization || 'As-Sunnah Research Institute'}</strong></p>
                    <p><span className="text-slate-400">Location:</span> <strong>{result.city}, {result.country}</strong></p>
                  </div>

                  <div className="text-[10px] text-emerald-900 bg-emerald-100/70 p-2 rounded-lg text-center font-medium">
                    ✓ This credential is officially registered in the central database of As-Sunnah Dawah & Research Institute.
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 text-center space-y-2">
                  <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
                  <h4 className="text-sm font-bold text-rose-900">No Verified Record Found</h4>
                  <p className="text-xs text-rose-700">
                    Please double-check the Alumni ID number or contact the Institute Registrar.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
