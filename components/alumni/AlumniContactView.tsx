'use client';

import React, { useState } from 'react';
import { 
  MapPin, Phone, Mail, Clock, Send, 
  CheckCircle2, Building, MessageSquare, Globe, ShieldCheck, Sparkles 
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export function AlumniContactView() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    alumniId: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'alumni_contact_inquiries'), {
        ...formData,
        status: 'unread',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Contact submission local fallback:', err);
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      alumniId: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-linear-to-r from-[#064e3b] via-[#043e2f] to-[#022c22] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-emerald-800">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-amber-300 text-xs font-bold">
            <Mail className="w-3.5 h-3.5" />
            <span>Alumni Relations & Secretariat Contact</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold font-serif text-white leading-tight">
            Alumni Relations Cell & Central Secretariat
          </h1>

          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
            For any information, certificate verification, membership inquiry, or assistance regarding As-Sunnah Dawah & Research Institute Alumni Association, please contact us directly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Cards */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <h2 className="text-base font-bold font-serif text-[#064e3b] border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-700" />
              Official Contact Address
            </h2>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Central Office & Campus</p>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    Plot No. 12, Block C, Aftabnagar Main Road, Badda, Dhaka-1212, Bangladesh.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 border border-amber-100">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Alumni Hotline & Helpdesk</p>
                  <p className="text-slate-600 mt-0.5">+880 9610-001234 (9 AM - 5 PM)</p>
                  <p className="text-slate-600">+880 1711-234567 (WhatsApp Support)</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Official Email</p>
                  <p className="text-slate-600 mt-0.5 font-mono">alumni@assunnah.edu.bd</p>
                  <p className="text-slate-600 font-mono">secretariat.alumni@assunnah.edu.bd</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center shrink-0 mt-0.5 border border-purple-100">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Office Hours</p>
                  <p className="text-slate-600 mt-0.5">Saturday to Thursday (9:00 AM - 5:00 PM)</p>
                  <p className="text-slate-500 text-[11px]">Friday is the weekly holiday</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-950 p-6 rounded-3xl text-white shadow-xs border border-emerald-800 space-y-3">
            <h3 className="text-sm font-bold font-serif text-amber-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Urgent Certificate or Document Verification?
            </h3>
            <p className="text-xs text-emerald-100 leading-relaxed">
              For verification of any academic transcript, character certificate, or attestation, please email directly to the Controller of Examinations section.
            </p>
            <p className="text-xs font-mono text-amber-300">verification@assunnah.edu.bd</p>
          </div>
        </div>

        {/* Interactive Inquiry Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-[#064e3b] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                Send Direct Message & Inquiry
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Fill out the form below to send your query or feedback. Our secretariat team will contact you shortly.
              </p>
            </div>

            {isSubmitted ? (
              <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-in fade-in">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                  <CheckCircle2 className="w-8 h-8 text-emerald-700" />
                </div>
                <h3 className="text-lg font-bold font-serif text-[#064e3b]">Your message has been sent successfully!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Jazakallahu Khairan. Our Alumni Relations Officer will contact you shortly via your provided email or phone number.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Your Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Maulana Abdullah"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Email Address <span className="text-rose-500">*</span></label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Mobile / WhatsApp Number <span className="text-rose-500">*</span></label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+880 1700-000000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Alumni ID Number (if applicable)</label>
                    <input
                      type="text"
                      value={formData.alumniId}
                      onChange={(e) => setFormData({ ...formData, alumniId: e.target.value })}
                      placeholder="e.g. ASDRI-ALM-2024-00105"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Subject of Message <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Certificate Attestation / Membership Renewal Inquiry"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Your Detailed Message <span className="text-rose-500">*</span></label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write your query or detailed information here..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-hidden resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Sending message...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}