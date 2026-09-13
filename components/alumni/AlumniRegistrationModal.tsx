'use client';

import React, { useState } from 'react';
import { 
  X, CheckCircle2, User, Mail, Phone, MapPin, 
  Briefcase, GraduationCap, Award, Shield, Sparkles, 
  ArrowRight, ArrowLeft, HeartHandshake, Lock
} from 'lucide-react';
import { 
  ALUMNI_PROGRAMS, ALUMNI_BATCHES, MENTORSHIP_TOPICS, 
  POPULAR_SKILLS, generateAlumniId 
} from '@/lib/alumniTypes';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc, getDocs, query, where } from 'firebase/firestore';

interface AlumniRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AlumniRegistrationModal({ isOpen, onClose, onSuccess }: AlumniRegistrationModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [assignedAlumniId, setAssignedAlumniId] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    studentId: '',
    program: ALUMNI_PROGRAMS[0],
    batch: ALUMNI_BATCHES[ALUMNI_BATCHES.length - 1],
    graduationYear: 2026,
    email: '',
    phone: '',
    profession: '',
    organization: '',
    designation: '',
    city: 'Dhaka',
    country: 'Bangladesh',
    skills: ['Hadith Research', 'Public Speaking'] as string[],
    bio: '',
    facebook: '',
    linkedin: '',
    website: '',
    privacy: 'public' as 'public' | 'alumni_only' | 'private',
    mentorshipOffer: ['Career & Employment Guidance'] as string[],
    mentorshipNeed: [] as string[]
  });

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    if (formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
    } else {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
  };

  const toggleMentorship = (topic: string) => {
    if (formData.mentorshipOffer.includes(topic)) {
      setFormData({ ...formData, mentorshipOffer: formData.mentorshipOffer.filter(t => t !== topic) });
    } else {
      setFormData({ ...formData, mentorshipOffer: [...formData.mentorshipOffer, topic] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Calculate total alumni count to generate incremental unique ID
      const snapshot = await getDocs(collection(db, 'alumni_profiles'));
      const count = snapshot.size + 1;
      const newAlumniId = generateAlumniId(formData.graduationYear, count + 120);
      setAssignedAlumniId(newAlumniId);

      const payload = {
        fullName: formData.fullName,
        photoUrl: formData.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        alumniId: newAlumniId,
        studentId: formData.studentId || `ST-${formData.graduationYear}-${count}`,
        program: formData.program,
        batch: formData.batch,
        graduationYear: Number(formData.graduationYear),
        email: formData.email,
        phone: formData.phone,
        profession: formData.profession,
        organization: formData.organization,
        designation: formData.designation,
        city: formData.city,
        country: formData.country,
        skills: formData.skills,
        bio: formData.bio,
        socialLinks: {
          facebook: formData.facebook,
          linkedin: formData.linkedin,
          website: formData.website
        },
        status: 'pending',
        privacy: formData.privacy,
        mentorshipOffer: formData.mentorshipOffer,
        mentorshipNeed: formData.mentorshipNeed,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'alumni_profiles'), payload);

      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting alumni registration:', error);
      alert('Failed to register. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-linear-to-r from-[#064e3b] to-[#043e2f] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif text-amber-300">
                Alumni Network Registration
              </h2>
              <p className="text-xs text-emerald-100">
                As-Sunnah Dawah & Research Institute Graduate Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-emerald-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => s < step && setStep(s)}
                    className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                      step === s 
                        ? 'bg-[#064e3b] text-amber-300 ring-2 ring-emerald-600'
                        : step > s
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <span className="text-xs font-bold text-slate-500">
                {step === 1 && '1. Academic & Personal'}
                {step === 2 && '2. Contact & Location'}
                {step === 3 && '3. Profession & Skills'}
                {step === 4 && '4. Mentorship & Privacy'}
              </span>
            </div>

            {/* Step 1: Academic & Basic */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g., Maulana Mahmud Hasan"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:bg-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department / Program *
                    </label>
                    <select
                      value={formData.program}
                      onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:bg-white outline-none"
                    >
                      {ALUMNI_PROGRAMS.map((prog) => (
                        <option key={prog} value={prog}>{prog}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Graduation Batch *
                    </label>
                    <select
                      value={formData.batch}
                      onChange={(e) => {
                        const yr = e.target.value.match(/\d{4}/)?.[0] || '2026';
                        setFormData({ ...formData, batch: e.target.value, graduationYear: Number(yr) });
                      }}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:bg-white outline-none"
                    >
                      {ALUMNI_BATCHES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Student / Roll ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      placeholder="e.g., ST-2022-045"
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Profile Photo URL
                    </label>
                    <input
                      type="url"
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:bg-white outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact & Location */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+880 17XXXXXXXX"
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Current City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g., Dhaka, Chittagong, London"
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="e.g., Bangladesh"
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:bg-white outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Profession & Skills */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Current Occupation *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.profession}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      placeholder="e.g., Khatib / Researcher / Teacher"
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Organization / Institute
                    </label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="e.g., Central Jame Masjid"
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g., Chief Khatib"
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select Skills & Specializations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SKILLS.map((skill) => {
                      const selected = formData.skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            selected
                              ? 'bg-[#064e3b] text-amber-300 shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {selected ? '✓ ' : '+ '} {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Short Biography (Bio)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Brief description of your research and professional journey..."
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-600 focus:bg-white outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Mentorship & Privacy */}
            {step === 4 && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Areas Where You Can Offer Mentorship To Juniors:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MENTORSHIP_TOPICS.map((topic) => {
                      const selected = formData.mentorshipOffer.includes(topic);
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => toggleMentorship(topic)}
                          className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between border cursor-pointer ${
                            selected
                              ? 'bg-emerald-50 text-[#064e3b] border-emerald-300 font-bold'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span>{topic}</span>
                          {selected && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Directory & Profile Privacy Setting *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'public', label: 'Public (Everyone)', desc: 'Visible to all visitors' },
                      { id: 'alumni_only', label: 'Alumni Only', desc: 'Logged-in alumni' },
                      { id: 'private', label: 'Private (Hidden)', desc: 'Admin view only' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, privacy: p.id as any })}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          formData.privacy === p.id 
                            ? 'bg-[#064e3b] text-white border-emerald-800'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <p className="text-xs font-bold leading-tight">{p.label}</p>
                        <p className={`text-[10px] mt-0.5 ${formData.privacy === p.id ? 'text-emerald-200' : 'text-slate-400'}`}>{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
              ) : <div></div>}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>

          </form>
        ) : (
          /* Registration Success Screen */
          <div className="p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-800">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold font-serif text-[#064e3b]">
                Registration Submitted Successfully
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Your alumni profile has been created and is awaiting institutional verification by the Central Alumni Administration.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 max-w-sm mx-auto text-center">
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                Assigned Alumni Registration ID
              </p>
              <p className="text-base font-mono font-extrabold text-[#064e3b] mt-1">
                {assignedAlumniId}
              </p>
              <p className="text-[10px] text-amber-700 mt-1 font-medium">
                Once approved, you will be able to download your Smart Digital Alumni ID Card.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
              >
                Return to Portal
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
