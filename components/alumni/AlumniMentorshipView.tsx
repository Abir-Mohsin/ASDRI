'use client';

import React, { useState } from 'react';
import { AlumniProfile, MENTORSHIP_TOPICS } from '@/lib/alumniTypes';
import { 
  HeartHandshake, CheckCircle2, Search, User, 
  Send, Sparkles, X, MessageSquare, GraduationCap,
  Briefcase, MapPin, ShieldCheck
} from 'lucide-react';

interface AlumniMentorshipViewProps {
  alumniList: AlumniProfile[];
  userProfile?: any;
}

export function AlumniMentorshipView({ alumniList, userProfile }: AlumniMentorshipViewProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedMentor, setSelectedMentor] = useState<AlumniProfile | null>(null);
  const [requestNote, setRequestNote] = useState('');
  const [isSent, setIsSent] = useState(false);

  // Filter alumni who offer mentorship
  const mentors = alumniList.filter(a => {
    if (a.status !== 'verified') return false;
    if (!a.mentorshipOffer || a.mentorshipOffer.length === 0) return false;
    if (selectedTopic !== 'all' && !a.mentorshipOffer.includes(selectedTopic)) return false;
    return true;
  });

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    setTimeout(() => {
      setSelectedMentor(null);
      setIsSent(false);
      setRequestNote('');
      alert('Your mentorship request has been successfully transmitted!');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-linear-to-r from-[#064e3b] via-[#043e2f] to-[#022c22] p-6 sm:p-8 rounded-3xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-amber-400/30 inline-flex items-center gap-1.5 mb-2">
            <HeartHandshake className="w-3.5 h-3.5" />
            As-Sunnah Alumni Mentorship Program
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
            Guidance & Mentorship from Senior Scholars & Professionals
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-xl">
            Receive direct academic advice, career guidance, research support, and mentorship from experienced senior alumni.
          </p>
        </div>
      </div>

      {/* Topic Filter Pills */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs space-y-2">
        <label className="block text-xs font-bold text-slate-700">Filter Mentors by Expertise Field:</label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedTopic('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedTopic === 'all'
                ? 'bg-[#064e3b] text-amber-300 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Fields ({alumniList.filter(a => a.mentorshipOffer && a.mentorshipOffer.length > 0).length})
          </button>
          {MENTORSHIP_TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => setSelectedTopic(topic)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedTopic === topic
                  ? 'bg-[#064e3b] text-amber-300 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
          <div
            key={mentor.id}
            className="bg-white rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-4">
              
              {/* Mentor Photo & Header */}
              <div className="flex items-start gap-4">
                <img
                  src={mentor.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                  alt={mentor.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-100 shadow-xs shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {mentor.batch}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 font-serif mt-1 truncate">
                    {mentor.fullName}
                  </h3>
                  <p className="text-xs text-[#064e3b] font-semibold truncate">
                    {mentor.profession}
                  </p>
                </div>
              </div>

              {/* Department & Org */}
              <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">{mentor.program}</span>
                </div>
                {mentor.organization && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{mentor.organization}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{mentor.city}, {mentor.country}</span>
                </div>
              </div>

              {/* Mentorship Topics offered */}
              <div className="space-y-1.5 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
                <p className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold">
                  Mentorship Expertise Offered:
                </p>
                <div className="flex flex-wrap gap-1">
                  {mentor.mentorshipOffer?.map((topic) => (
                    <span key={topic} className="text-[10px] bg-white text-emerald-900 px-2 py-0.5 rounded font-medium border border-emerald-200">
                      ✓ {topic}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Request Connect CTA */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedMentor(mentor)}
                className="w-full py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <HeartHandshake className="w-4 h-4" />
                Connect For Mentorship
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Connect Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="bg-linear-to-r from-[#064e3b] to-[#043e2f] px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-base text-amber-300">
                  Mentorship Request
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMentor(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-emerald-200 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isSent ? (
              <form onSubmit={handleSendRequest} className="p-6 space-y-4 text-xs">
                <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                  <img
                    src={selectedMentor.photoUrl}
                    alt={selectedMentor.fullName}
                    className="w-12 h-12 rounded-xl object-cover border border-emerald-300"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 font-serif">{selectedMentor.fullName}</h4>
                    <p className="text-emerald-800 text-[11px] font-semibold">{selectedMentor.profession}</p>
                    <p className="text-slate-500 text-[10px]">{selectedMentor.batch}</p>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Which area do you seek advice/guidance in? *
                  </label>
                  <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600">
                    {selectedMentor.mentorshipOffer?.map(topic => (
                      <option key={topic} value={topic}>{topic}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Introduction & Message *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    placeholder="Describe your current status and what specific advice or guidance you hope to receive..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send Mentorship Request
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-[#064e3b]">Request Sent Successfully!</h4>
                <p className="text-xs text-slate-500">Your message has been delivered to the mentor.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
