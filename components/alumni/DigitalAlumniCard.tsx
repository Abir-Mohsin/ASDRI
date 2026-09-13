'use client';

import React, { useState } from 'react';
import { AlumniProfile } from '@/lib/alumniTypes';
import { 
  ShieldCheck, Award, QrCode, Download, Printer, 
  RotateCw, Sparkles, CheckCircle2, Building, Globe, 
  Phone, Mail, Calendar, User
} from 'lucide-react';

interface DigitalAlumniCardProps {
  profile: AlumniProfile;
  showActions?: boolean;
}

export function DigitalAlumniCard({ profile, showActions = true }: DigitalAlumniCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Generate public verification link
  const verificationUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/alumni?verifyId=${encodeURIComponent(profile.alumniId)}`
    : `https://asdri.edu.bd/alumni?verifyId=${encodeURIComponent(profile.alumniId)}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(verificationUrl)}&color=064e3b&bgcolor=ffffff`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Interactive Card Container */}
      <div className="relative mx-auto max-w-md w-full">
        <div 
          className={`relative w-full rounded-3xl transition-all duration-500 overflow-hidden shadow-xl border-2 border-amber-400/40 bg-linear-to-br from-[#064e3b] via-[#043e2f] to-[#022c22] text-white p-6 sm:p-7 ${
            isFlipped ? 'ring-2 ring-amber-400' : ''
          }`}
          style={{ minHeight: '380px' }}
        >
          {/* Islamic Subtle Geometric Background Watermark */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          {/* Top Golden Trim Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-amber-400 via-amber-300 to-amber-500"></div>

          {!isFlipped ? (
            /* Card Front Side */
            <div className="flex flex-col justify-between h-full space-y-5 relative z-10">
              
              {/* Header: Institution Crest & Name */}
              <div className="flex items-center justify-between border-b border-emerald-700/60 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-300 font-serif font-bold text-lg shadow-inner">
                    AS
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-amber-300 tracking-wide">
                      معهد السنة للدعوة والبحوث
                    </h3>
                    <p className="text-[10px] text-emerald-100/90 font-medium tracking-tight uppercase">
                      As-Sunnah Dawah & Research Institute
                    </p>
                    <p className="text-[9px] text-amber-400/80 font-bold uppercase tracking-widest">
                      Official Alumni Card
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-[10px] font-bold text-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    VERIFIED
                  </span>
                </div>
              </div>

              {/* Body: Photo, Info & QR */}
              <div className="grid grid-cols-12 gap-4 items-center">
                
                {/* Profile Photo */}
                <div className="col-span-4 flex flex-col items-center">
                  <div className="relative w-24 h-24 sm:w-26 sm:h-26 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-md bg-emerald-950">
                    {profile.photoUrl ? (
                      <img 
                        src={profile.photoUrl} 
                        alt={profile.fullName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-300">
                        <User className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <span className="mt-1.5 text-[9px] font-mono text-amber-300 font-bold px-1.5 py-0.5 bg-emerald-950/80 rounded border border-emerald-700/50">
                    {profile.batch}
                  </span>
                </div>

                {/* Details */}
                <div className="col-span-8 space-y-1.5 pl-1">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white font-serif leading-tight">
                      {profile.fullName}
                    </h2>
                    <p className="text-xs text-amber-300 font-semibold truncate">
                      {profile.profession || 'Islamic Scholar & Researcher'}
                    </p>
                  </div>

                  <div className="space-y-1 text-[11px] text-emerald-100/85">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-300/80 text-[10px]">Department:</span>
                      <span className="font-medium text-white truncate">{profile.program}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-300/80 text-[10px]">Organization:</span>
                      <span className="font-medium text-emerald-100 truncate">{profile.organization || 'As-Sunnah Research Institute'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-300/80 text-[10px]">Location:</span>
                      <span className="font-medium text-emerald-100">{profile.city}, {profile.country}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Strip: ID Number & QR verification */}
              <div className="pt-3 border-t border-emerald-700/60 flex items-center justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-emerald-300/80 font-bold">
                    Alumni ID Number
                  </p>
                  <p className="text-xs sm:text-sm font-mono font-extrabold text-amber-300 tracking-wider">
                    {profile.alumniId || 'ASDRI-ALM-2026-XXXXX'}
                  </p>
                </div>

                {/* Small QR Code Thumbnail */}
                <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-xl border border-emerald-600/40">
                  <img 
                    src={qrImageUrl} 
                    alt="Alumni Verification QR" 
                    className="w-8 h-8 rounded bg-white p-0.5"
                  />
                  <div className="text-[8px] text-left leading-tight text-emerald-100">
                    <p className="font-bold text-amber-300">Scan to Verify</p>
                    <p className="text-emerald-300/80">ASDRI Portal</p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Card Back Side */
            <div className="flex flex-col justify-between h-full space-y-4 relative z-10 text-xs">
              
              {/* Back Header */}
              <div className="flex items-center justify-between border-b border-emerald-700/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-amber-300" />
                  <span className="font-bold text-amber-300 text-xs">Card Usage Terms & Info</span>
                </div>
                <span className="text-[10px] text-emerald-200">ASDRI Official</span>
              </div>

              {/* Back Body */}
              <div className="space-y-2 text-[11px] text-emerald-100/90 leading-relaxed bg-emerald-950/40 p-3 rounded-2xl border border-emerald-800/40">
                <p>• This digital smart card is issued to verified alumni of As-Sunnah Dawah & Research Institute.</p>
                <p>• Scan the embedded QR code to verify validity instantly in the central database.</p>
                <p>• Grants priority access to central research library, seminars, and alumni forums.</p>
              </div>

              {/* QR Code Large + Signature */}
              <div className="grid grid-cols-2 gap-3 items-center pt-2 border-t border-emerald-700/60">
                <div className="flex items-center gap-2.5">
                  <img 
                    src={qrImageUrl} 
                    alt="Alumni Verification QR" 
                    className="w-14 h-14 rounded-xl bg-white p-1 shadow-sm border border-emerald-500/30"
                  />
                  <div className="text-[9px] text-emerald-200 leading-tight">
                    <p className="font-bold text-amber-300">Digital Verification</p>
                    <p className="text-emerald-400 font-mono text-[8px] mt-0.5">Verified Alumni</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block border-b border-amber-400/80 pb-1 text-center font-serif text-amber-300 italic text-xs">
                    Academic Council
                  </div>
                  <p className="text-[9px] text-emerald-300 font-bold uppercase tracking-wider mt-0.5">
                    Registrar & Administration
                  </p>
                  <p className="text-[8px] text-emerald-400/70">ASDRI, Dhaka</p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Action Controls */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <RotateCw className="w-3.5 h-3.5 text-emerald-700" />
            {isFlipped ? 'View Card Front' : 'View Card Back'}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            Print / Download PDF
          </button>
        </div>
      )}
    </div>
  );
}
