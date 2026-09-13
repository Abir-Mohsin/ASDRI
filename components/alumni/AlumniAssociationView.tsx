'use client';

import React, { useState, useEffect } from 'react';
import { 
  CommitteeMember, AssociationWing, GlobalChapter, MembershipTier,
  INITIAL_ADVISORS, INITIAL_EXECUTIVE_COMMITTEE, INITIAL_ASSOCIATION_WINGS,
  INITIAL_GLOBAL_CHAPTERS, INITIAL_MEMBERSHIP_TIERS
} from '@/lib/alumniAssociationTypes';
import { 
  Users, Award, ShieldCheck, HeartHandshake, 
  Globe, BookOpen, CheckCircle2, ChevronRight, 
  Sparkles, Mail, Phone, ExternalLink, HandHeart, 
  Landmark, ArrowUpRight, FileText, Check, X
} from 'lucide-react';

interface AlumniAssociationViewProps {
  initialSubTab?: 'committee' | 'wings' | 'chapters' | 'membership' | 'constitution';
}

export function AlumniAssociationView({ initialSubTab = 'committee' }: AlumniAssociationViewProps) {
  const [subTab, setSubTab] = useState<'committee' | 'wings' | 'chapters' | 'membership' | 'constitution'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [selectedMember, setSelectedMember] = useState<CommitteeMember | null>(null);
  const [isApplyingModalOpen, setIsApplyingModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  // Form state
  const [applicantName, setApplicantName] = useState('');
  const [applicantAlumniId, setApplicantAlumniId] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantNote, setApplicantNote] = useState('');

  const handleOpenApply = (tier: MembershipTier) => {
    setSelectedTier(tier);
    setApplicationSuccess(false);
    setIsApplyingModalOpen(true);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setApplicationSuccess(true);
    setTimeout(() => {
      // Auto close after 2.5s
      setTimeout(() => {
        setIsApplyingModalOpen(false);
        setApplicationSuccess(false);
      }, 2500);
    }, 500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Association Header & Mission Card */}
      <div className="bg-linear-to-r from-[#064e3b] via-[#043e2f] to-[#022c22] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-emerald-800">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-amber-300 text-xs font-bold">
            <Landmark className="w-3.5 h-3.5" />
            As-Sunnah Alumni Association (ASAA)
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold font-serif text-white leading-tight">
            United in Islamic Fellowship, Authentic Knowledge & Community Service
          </h1>

          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed max-w-3xl">
            The central alumni association connecting graduates across all batches of As-Sunnah Dawah & Research Institute. Our mission is to build a knowledge-driven society, support graduate careers, sponsor academic research, and foster mutual welfare among alumni.
          </p>
        </div>
      </div>

      {/* Sub-tab 1: Executive Committee & Advisors */}
      {subTab === 'committee' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Section: Advisory Council */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-serif text-[#064e3b] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  Advisory Council
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Senior scholars and academic leaders guiding the vision of the Institute and Alumni Association
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {INITIAL_ADVISORS.map((adv) => (
                <div 
                  key={adv.id}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center gap-4 group"
                >
                  <img
                    src={adv.photoUrl}
                    alt={adv.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-600/30 group-hover:scale-105 transition-transform shrink-0"
                  />
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900">
                      {adv.designation}
                    </span>
                    <h3 className="text-base font-bold font-serif text-slate-900 truncate">
                      {adv.name}
                    </h3>
                    <p className="text-xs text-emerald-800 font-semibold truncate">
                      {adv.currentProfession}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {adv.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Central Executive Committee */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold font-serif text-[#064e3b] flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-700" />
                  Central Executive Council 2026–2028
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Elected and nominated central leaders for the biennial term
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Tenure: 2026–2028
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {INITIAL_EXECUTIVE_COMMITTEE.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs hover:shadow-md transition-all space-y-4 group flex flex-col justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-600/30 group-hover:scale-105 transition-transform shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 block w-fit truncate">
                        {member.designation}
                      </span>
                      <h3 className="text-sm font-bold font-serif text-slate-900 truncate">
                        {member.name}
                      </h3>
                      <p className="text-[11px] text-amber-700 font-bold">
                        {member.batch}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <p className="truncate">
                      <strong className="text-slate-800">Profession:</strong> {member.currentProfession}
                    </p>
                    <p className="truncate">
                      <strong className="text-slate-800">Organization:</strong> {member.organization}
                    </p>
                    <p className="truncate">
                      <strong className="text-slate-800">Department:</strong> {member.department}
                    </p>
                  </div>

                  {member.email && (
                    <div className="pt-2">
                      <a
                        href={`mailto:${member.email}`}
                        className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-[#064e3b] text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Official Email
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Sub-tab 2: Specialized Wings & Welfare Fund */}
      {subTab === 'wings' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-lg sm:text-xl font-bold font-serif text-[#064e3b]">
              Specialized Executive Wings & Initiatives
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Three main active branches dedicated to research publication, member welfare, and career placements
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {INITIAL_ASSOCIATION_WINGS.map((wing) => (
              <div 
                key={wing.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={wing.leadPhoto}
                      alt={wing.leadName}
                      className="w-12 h-12 rounded-xl object-cover border border-emerald-600/30 shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-bold font-serif text-slate-900">
                        {wing.name}
                      </h3>
                      <p className="text-[11px] text-emerald-700 font-semibold">
                        Lead: {wing.leadName}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {wing.description}
                  </p>

                  {/* Metrics bar */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    {wing.stats.map((st, i) => (
                      <div key={i} className="space-y-0.5">
                        <p className="text-[10px] text-slate-500 font-medium truncate">{st.label}</p>
                        <p className="text-xs font-bold font-serif text-[#064e3b] truncate">{st.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Key activities */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-800">Key Activities:</p>
                    <ul className="space-y-1.5">
                      {wing.activities.map((act, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSubTab('membership')}
                    className="w-full py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <HandHeart className="w-3.5 h-3.5" />
                    Contribute or Support Fund
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab 3: Global Chapters */}
      {subTab === 'chapters' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-[#064e3b] flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-700" />
                International & Regional Global Chapters
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Local networks of As-Sunnah graduates located across different regions worldwide
              </p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              4 Active Chapters
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {INITIAL_GLOBAL_CHAPTERS.map((ch) => (
              <div 
                key={ch.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{ch.flag}</span>
                    <div>
                      <h3 className="text-base font-bold font-serif text-slate-900">
                        {ch.city}
                      </h3>
                      <p className="text-xs font-semibold text-emerald-700">
                        {ch.country}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                    {ch.membersCount} Members
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-700">
                  <p>
                    <strong>Coordinator:</strong> {ch.coordinatorName}
                  </p>
                  <p>
                    <strong>Established:</strong> {ch.establishedYear}
                  </p>
                  <p className="text-slate-600 italic">
                    &quot;{ch.recentActivity}&quot;
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <a
                    href={`mailto:${ch.coordinatorContact}`}
                    className="text-xs font-bold text-[#064e3b] hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Contact Chapter Coordinator
                  </a>
                  <span className="text-[11px] font-mono text-slate-400">
                    {ch.coordinatorContact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab 4: Membership Tiers & Application */}
      {subTab === 'membership' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Membership Plans & Privileges
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#064e3b]">
              Alumni Association Membership Tiers
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Choose a membership tier aligned with your involvement and support the lifelong mission of the Institute.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {INITIAL_MEMBERSHIP_TIERS.map((tier) => (
              <div
                key={tier.id}
                className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-6 relative ${
                  tier.recommended 
                    ? 'border-2 border-amber-400 shadow-lg scale-102 ring-4 ring-amber-400/10' 
                    : 'border-slate-100 shadow-2xs hover:shadow-md'
                }`}
              >
                {tier.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-extrabold rounded-full shadow-xs uppercase tracking-wider">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold font-serif text-slate-900">
                      {tier.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {tier.subtitle}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xl font-bold font-serif text-[#064e3b]">
                      {tier.fee}
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      Validity: {tier.validity}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <p className="text-xs font-bold text-slate-800">Privileges & Benefits:</p>
                    <ul className="space-y-2">
                      {tier.benefits.map((b, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenApply(tier)}
                  className={`w-full py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                    tier.recommended
                      ? 'bg-[#064e3b] hover:bg-emerald-900 text-amber-300'
                      : 'bg-slate-100 hover:bg-[#064e3b] text-slate-800 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Apply For Membership
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab 5: Constitution & Objectives */}
      {subTab === 'constitution' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold font-serif text-[#064e3b] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              As-Sunnah Alumni Association Charter & Objectives
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Institutional constitution formulated under the principles and ethics of the Institute
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
              <h3 className="text-sm font-bold font-serif text-[#064e3b] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">1</span>
                Core Objectives & Vision
              </h3>
              <p>
                1. Promote dawah and authentic Islamic research based on the Quran and authentic Sunnah across personal, social, and academic spheres.
              </p>
              <p>
                2. Foster strong spiritual brotherhood, continuous academic collaboration, and professional connectivity among all graduates.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
              <h3 className="text-sm font-bold font-serif text-[#064e3b] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">2</span>
                Welfare & Research Endowment Fund
              </h3>
              <p>
                1. Provide emergency financial relief, medical grants, and interest-free micro-loans (Qard Hasana) for alumni facing hardships.
              </p>
              <p>
                2. Award research grants and scholarships for higher academic studies, PhD dissertations, and publication of authentic Islamic research.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
              <h3 className="text-sm font-bold font-serif text-[#064e3b] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">3</span>
                Organizational Governance
              </h3>
              <p>
                1. The Association shall operate as a non-political, institutional non-profit dedicated exclusively to academic and social welfare.
              </p>
              <p>
                2. Biennial elections and consultative selection (Shura) shall determine the leadership of the Central Executive Committee every 2 years.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
              <h3 className="text-sm font-bold font-serif text-[#064e3b] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">4</span>
                Global Chapters & Representation
              </h3>
              <p>
                1. International chapters may be established in countries with more than 10 residing alumni upon central committee approval.
              </p>
              <p>
                2. Represent the Institute internationally through scholar exchanges, academic conferences, and global dawah initiatives.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Membership Application Modal */}
      {isApplyingModalOpen && selectedTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200">
            
            <button
              type="button"
              onClick={() => setIsApplyingModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {applicationSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-serif text-[#064e3b]">
                  Application Submitted Successfully!
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  Your application for <strong>{selectedTier.name}</strong> has been received by the Central Committee. Our administrative officer will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                    {selectedTier.name}
                  </span>
                  <h3 className="text-lg font-bold font-serif text-slate-900 mt-1">
                    Membership Application Form
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fee: <strong>{selectedTier.fee}</strong> ({selectedTier.validity})
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Alumni ID / Student ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ASDRI-ALM-2024-00123"
                      value={applicantAlumniId}
                      onChange={(e) => setApplicantAlumniId(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+880 1XXXXXXXXX"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Special Interests (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Briefly describe your proposed contribution to the association..."
                      value={applicantNote}
                      onChange={(e) => setApplicantNote(e.target.value)}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsApplyingModalOpen(false)}
                    className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
