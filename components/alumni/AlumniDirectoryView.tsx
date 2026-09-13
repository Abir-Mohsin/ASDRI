'use client';

import React, { useState, useMemo } from 'react';
import { AlumniProfile, ALUMNI_PROGRAMS, ALUMNI_BATCHES } from '@/lib/alumniTypes';
import { 
  Search, Filter, MapPin, Briefcase, GraduationCap, 
  ShieldCheck, HeartHandshake, Eye, Mail, Phone, 
  Globe, ExternalLink, X, User, CheckCircle2, Sparkles, Award
} from 'lucide-react';
import { DigitalAlumniCard } from './DigitalAlumniCard';

interface AlumniDirectoryViewProps {
  alumniList: AlumniProfile[];
  isLoggedInAlumni?: boolean;
}

export function AlumniDirectoryView({ alumniList, isLoggedInAlumni = false }: AlumniDirectoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [onlyMentors, setOnlyMentors] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<AlumniProfile | null>(null);
  const [showIdCardModal, setShowIdCardModal] = useState(false);

  // Extract unique cities
  const uniqueCities = useMemo(() => {
    const cities = new Set<string>();
    alumniList.forEach(a => {
      if (a.city) cities.add(a.city);
    });
    return Array.from(cities);
  }, [alumniList]);

  // Filtered Alumni list
  const filteredAlumni = useMemo(() => {
    return alumniList.filter(alumnus => {
      // Must be verified (or public)
      if (alumnus.status !== 'verified') return false;

      // Privacy check
      if (alumnus.privacy === 'private') return false;
      if (alumnus.privacy === 'alumni_only' && !isLoggedInAlumni) {
        // Can still show basic card without sensitive contacts
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = alumnus.fullName?.toLowerCase().includes(q);
        const matchId = alumnus.alumniId?.toLowerCase().includes(q);
        const matchOrg = alumnus.organization?.toLowerCase().includes(q);
        const matchProf = alumnus.profession?.toLowerCase().includes(q);
        const matchCity = alumnus.city?.toLowerCase().includes(q);
        const matchSkills = alumnus.skills?.some(s => s.toLowerCase().includes(q));
        if (!matchName && !matchId && !matchOrg && !matchProf && !matchCity && !matchSkills) {
          return false;
        }
      }

      // Batch match
      if (selectedBatch !== 'all' && alumnus.batch !== selectedBatch) return false;

      // Program match
      if (selectedProgram !== 'all' && alumnus.program !== selectedProgram) return false;

      // City match
      if (selectedCity !== 'all' && alumnus.city !== selectedCity) return false;

      // Mentorship match
      if (onlyMentors && (!alumnus.mentorshipOffer || alumnus.mentorshipOffer.length === 0)) return false;

      return true;
    });
  }, [alumniList, searchQuery, selectedBatch, selectedProgram, selectedCity, onlyMentors, isLoggedInAlumni]);

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        
        {/* Main Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID (ASDRI-ALM...), organization, occupation, city or skills..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          
          {/* Batch Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">By Batch</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
            >
              <option value="all">All Batches</option>
              {ALUMNI_BATCHES.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Program Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">By Department / Program</label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
            >
              <option value="all">All Departments</option>
              {ALUMNI_PROGRAMS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* City / Location Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">By City / Location</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
            >
              <option value="all">All Cities</option>
              {uniqueCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Mentor Toggle */}
          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={() => setOnlyMentors(!onlyMentors)}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                onlyMentors
                  ? 'bg-emerald-50 border-emerald-500 text-[#064e3b]'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>Mentors Only</span>
              {onlyMentors && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 ml-auto" />}
            </button>
          </div>

        </div>

        {/* Filter Summary & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <p className="text-slate-500 font-medium">
            Total Verified Alumni Found: <strong className="text-[#064e3b] font-bold">{filteredAlumni.length} Member(s)</strong>
          </p>

          {(searchQuery || selectedBatch !== 'all' || selectedProgram !== 'all' || selectedCity !== 'all' || onlyMentors) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedBatch('all');
                setSelectedProgram('all');
                setSelectedCity('all');
                setOnlyMentors(false);
              }}
              className="text-amber-700 hover:text-amber-800 font-bold underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

      </div>

      {/* Alumni Cards Grid */}
      {filteredAlumni.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((alumnus) => (
            <div
              key={alumnus.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              {/* Top Accent Strip */}
              <div className="h-1.5 bg-linear-to-r from-[#064e3b] via-emerald-600 to-amber-400"></div>

              <div className="p-6 space-y-4">
                
                {/* Header: Photo, Name & ID */}
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={alumnus.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                      alt={alumnus.fullName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-100 shadow-xs group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute -bottom-1.5 -right-1 bg-emerald-600 text-white p-0.5 rounded-full ring-2 ring-white">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {alumnus.batch}
                      </span>
                      {alumnus.mentorshipOffer && alumnus.mentorshipOffer.length > 0 && (
                        <span className="text-[10px] text-amber-700 font-bold flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          <HeartHandshake className="w-3 h-3" /> Mentor
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 font-serif mt-1 truncate">
                      {alumnus.fullName}
                    </h3>
                    <p className="text-xs text-[#064e3b] font-semibold truncate">
                      {alumnus.profession || 'Islamic Scholar'}
                    </p>
                  </div>
                </div>

                {/* Organization & Location */}
                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate">{alumnus.program}</span>
                  </div>

                  {alumnus.organization && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{alumnus.designation ? `${alumnus.designation}, ` : ''}{alumnus.organization}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{alumnus.city}, {alumnus.country}</span>
                  </div>
                </div>

                {/* Skills tags */}
                {alumnus.skills && alumnus.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {alumnus.skills.slice(0, 3).map((sk) => (
                      <span key={sk} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {sk}
                      </span>
                    ))}
                    {alumnus.skills.length > 3 && (
                      <span className="text-[10px] bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded">
                        +{alumnus.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}

              </div>

              {/* Card Footer Actions */}
              <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 font-medium truncate max-w-[120px]">
                  {alumnus.alumniId}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedProfile(alumnus)}
                  className="px-3.5 py-1.5 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Details
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center space-y-3">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Alumni Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No matching alumni profiles were found for your search criteria. Try adjusting your query or resetting filters.
          </p>
        </div>
      )}

      {/* Alumni Detail Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            
            {/* Header */}
            <div className="bg-linear-to-r from-[#064e3b] to-[#043e2f] px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-base sm:text-lg text-amber-300">
                  Official Alumni Profile
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedProfile(null);
                  setShowIdCardModal(false);
                }}
                className="p-1.5 rounded-full hover:bg-white/10 text-emerald-200 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {!showIdCardModal ? (
                <>
                  {/* Profile Header Row */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                    <img
                      src={selectedProfile.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                      alt={selectedProfile.fullName}
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-emerald-100 shadow-md"
                    />

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {selectedProfile.alumniId}
                        </span>
                        <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                          {selectedProfile.batch}
                        </span>
                      </div>

                      <h2 className="text-xl font-bold font-serif text-slate-900">
                        {selectedProfile.fullName}
                      </h2>
                      <p className="text-xs text-[#064e3b] font-bold">
                        {selectedProfile.profession}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedProfile.program} ({selectedProfile.graduationYear})
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowIdCardModal(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      Digital ID Card
                    </button>
                  </div>

                  {/* Bio & Success Story */}
                  {selectedProfile.bio && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                      <h4 className="font-bold text-slate-900 mb-1">Biography & Summary:</h4>
                      <p>{selectedProfile.bio}</p>
                    </div>
                  )}

                  {/* Work & Location Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-100 bg-white space-y-2 text-xs">
                      <h4 className="font-bold text-[#064e3b] flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-emerald-700" />
                        Professional Occupation
                      </h4>
                      <p><span className="text-slate-400">Organization:</span> <strong>{selectedProfile.organization || 'Not Specified'}</strong></p>
                      <p><span className="text-slate-400">Designation:</span> <strong>{selectedProfile.designation || 'Not Specified'}</strong></p>
                      <p><span className="text-slate-400">Location:</span> <strong>{selectedProfile.city}, {selectedProfile.country}</strong></p>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-100 bg-white space-y-2 text-xs">
                      <h4 className="font-bold text-[#064e3b] flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-emerald-700" />
                        Contact Details
                      </h4>
                      {selectedProfile.privacy === 'public' || isLoggedInAlumni ? (
                        <>
                          <p><span className="text-slate-400">Email:</span> <a href={`mailto:${selectedProfile.email}`} className="text-emerald-700 hover:underline">{selectedProfile.email}</a></p>
                          <p><span className="text-slate-400">Mobile:</span> <span>{selectedProfile.phone}</span></p>
                        </>
                      ) : (
                        <p className="text-slate-400 italic">Contact details visible to logged-in alumni only.</p>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {selectedProfile.skills && selectedProfile.skills.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-800">Skills & Expertise:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProfile.skills.map(sk => (
                          <span key={sk} className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mentorship Opportunities */}
                  {selectedProfile.mentorshipOffer && selectedProfile.mentorshipOffer.length > 0 && (
                    <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                      <h4 className="font-bold text-[#064e3b] flex items-center gap-2">
                        <HeartHandshake className="w-4 h-4 text-emerald-700" />
                        Available For Mentorship In:
                      </h4>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {selectedProfile.mentorshipOffer.map(topic => (
                          <span key={topic} className="px-2.5 py-1 bg-white text-emerald-900 rounded-lg font-medium border border-emerald-200 shadow-2xs">
                            ✓ {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Digital ID Card Preview */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowIdCardModal(false)}
                      className="text-xs font-bold text-emerald-800 hover:underline"
                    >
                      ← Back to Profile Info
                    </button>
                    <span className="text-xs text-slate-500 font-medium">Official Digital Verification Card</span>
                  </div>
                  <DigitalAlumniCard profile={selectedProfile} />
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedProfile(null);
                  setShowIdCardModal(false);
                }}
                className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
