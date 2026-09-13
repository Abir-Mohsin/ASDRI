'use client';

import React, { useState } from 'react';
import { AlumniEvent, AlumniEventRegistration, generateTicketCode } from '@/lib/alumniTypes';
import { 
  Calendar, Clock, MapPin, Users, Ticket, 
  CheckCircle2, Sparkles, AlertCircle, X, QrCode, 
  Download, Printer, Share2, Video, Building
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';

interface AlumniEventsViewProps {
  events: AlumniEvent[];
  userProfile?: any;
  onEventRegistered?: () => void;
}

export function AlumniEventsView({ events, userProfile, onEventRegistered }: AlumniEventsViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<AlumniEvent | null>(null);
  const [regForm, setRegForm] = useState({
    name: userProfile?.fullName || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    batch: userProfile?.batch || '1st Batch (2021)',
    alumniId: userProfile?.alumniId || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState<AlumniEventRegistration | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setIsSubmitting(true);

    try {
      const ticketCode = generateTicketCode();
      const registrationData: AlumniEventRegistration = {
        id: '',
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        eventDate: selectedEvent.date,
        alumniId: regForm.alumniId || 'GUEST-ALUMNI',
        alumniName: regForm.name,
        alumniEmail: regForm.email,
        alumniPhone: regForm.phone,
        batch: regForm.batch,
        ticketCode: ticketCode,
        attendance: false,
        registeredAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'alumni_event_registrations'), registrationData);
      registrationData.id = docRef.id;

      // Update event registered count if document exists in Firestore
      try {
        const eventRef = doc(db, 'alumni_events', selectedEvent.id);
        await updateDoc(eventRef, {
          registeredCount: increment(1)
        });
      } catch (err) {
        // Safe fallback if local mock
      }

      setTicketResult(registrationData);
      if (onEventRegistered) onEventRegistered();
    } catch (error) {
      console.error('Error registering for event:', error);
      alert('Failed to complete registration. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-linear-to-r from-[#064e3b] to-[#043e2f] p-6 sm:p-8 rounded-3xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-amber-400/30 inline-flex items-center gap-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5" />
            As-Sunnah Alumni Events & Reunions
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
            Upcoming Conferences & Gatherings
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-xl">
            Participate in academic exchanges, spiritual fellowship, and networking events for graduates.
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const isFull = event.registeredCount >= event.registrationLimit;
          const percentage = Math.min(Math.round((event.registeredCount / event.registrationLimit) * 100), 100);

          return (
            <div
              key={event.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Event Cover Image */}
              <div className="relative h-48 w-full overflow-hidden bg-emerald-950">
                <img
                  src={event.coverImage || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80'}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Event Type Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full text-white shadow-xs flex items-center gap-1 ${
                    event.type === 'online' ? 'bg-blue-600' : event.type === 'hybrid' ? 'bg-purple-600' : 'bg-[#064e3b]'
                  }`}>
                    {event.type === 'online' ? <Video className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                    {event.type === 'online' ? 'Online Zoom' : event.type === 'hybrid' ? 'Hybrid' : 'On-Campus'}
                  </span>
                </div>

                {/* Date Ribbon */}
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs text-slate-900 px-3 py-1 rounded-xl shadow-xs text-right">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Date</p>
                  <p className="text-xs font-bold text-[#064e3b] font-serif">{event.date}</p>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-serif line-clamp-2 leading-snug">
                  {event.title}
                </h3>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Reg. Deadline: <strong>{event.registrationDeadline}</strong></span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>

                {/* Progress Bar of seats */}
                <div className="space-y-1.5 pt-2 border-t border-slate-50">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Registered Seats:</span>
                    <span className="font-bold text-[#064e3b]">{event.registeredCount} / {event.registrationLimit}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                <button
                  type="button"
                  disabled={isFull}
                  onClick={() => {
                    setSelectedEvent(event);
                    setTicketResult(null);
                  }}
                  className={`w-full py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                    isFull
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-[#064e3b] hover:bg-emerald-900 text-amber-300 shadow-emerald-900/10'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  {isFull ? 'Seats Full' : 'Register Free Online'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Registration & Ticket Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="bg-linear-to-r from-[#064e3b] to-[#043e2f] px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-base text-amber-300">
                  Event Registration & E-Pass
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedEvent(null);
                  setTicketResult(null);
                }}
                className="p-1.5 rounded-full hover:bg-white/10 text-emerald-200 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {!ticketResult ? (
              <form onSubmit={handleRegister} className="p-6 sm:p-8 space-y-4">
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold">Event Title:</p>
                  <h4 className="text-sm font-bold font-serif text-[#064e3b]">{selectedEvent.title}</h4>
                  <p className="text-xs text-slate-600">Date: {selectedEvent.date} | Time: {selectedEvent.time}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / Phone *</label>
                    <input
                      type="tel"
                      required
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      placeholder="+880 1XXXXXXXXX"
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Graduation Batch</label>
                    <input
                      type="text"
                      value={regForm.batch}
                      onChange={(e) => setRegForm({ ...regForm, batch: e.target.value })}
                      placeholder="1st Batch (2021)"
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Alumni ID (Optional)</label>
                    <input
                      type="text"
                      value={regForm.alumniId}
                      onChange={(e) => setRegForm({ ...regForm, alumniId: e.target.value })}
                      placeholder="ASDRI-ALM-..."
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 text-xs font-bold rounded-2xl transition-all cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Processing...' : 'Confirm Registration & Get Pass'}
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              /* Digital Event Ticket / Pass Result */
              <div className="p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200 text-center">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-lg font-bold font-serif text-[#064e3b]">
                    Registration Completed Successfully!
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your digital entry pass and check-in QR code have been generated below.
                  </p>
                </div>

                {/* Ticket Card */}
                <div className="bg-linear-to-br from-[#064e3b] to-[#022c22] text-white p-5 rounded-3xl border-2 border-amber-400/40 text-left space-y-4 shadow-md relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-emerald-700/60 pb-3">
                    <div>
                      <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Official Event Pass</p>
                      <h4 className="text-xs font-bold text-white truncate max-w-[200px]">{ticketResult.eventTitle}</h4>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                      CONFIRMED
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 items-center">
                    <div className="col-span-2 space-y-1 text-xs">
                      <p><span className="text-emerald-300/80 text-[10px]">Attendee:</span> <strong className="text-white block truncate">{ticketResult.alumniName}</strong></p>
                      <p><span className="text-emerald-300/80 text-[10px]">Batch:</span> <span className="text-emerald-100">{ticketResult.batch}</span></p>
                      <p><span className="text-emerald-300/80 text-[10px]">Ticket Code:</span> <strong className="font-mono text-amber-300 block">{ticketResult.ticketCode}</strong></p>
                    </div>

                    <div className="col-span-1 flex flex-col items-center justify-center bg-white p-1.5 rounded-xl">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(ticketResult.ticketCode)}&color=064e3b`} 
                        alt="QR Ticket"
                        className="w-16 h-16"
                      />
                      <span className="text-[8px] text-slate-700 font-bold mt-0.5">Check-in QR</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-5 py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Ticket
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEvent(null);
                      setTicketResult(null);
                    }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
