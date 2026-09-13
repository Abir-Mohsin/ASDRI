'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlumniProfile, AlumniEvent, AlumniJob, AlumniContribution, AlumniNotification,
  INITIAL_ALUMNI_PROFILES, INITIAL_ALUMNI_EVENTS, INITIAL_ALUMNI_JOBS,
  INITIAL_USER_CONTRIBUTIONS, INITIAL_USER_NOTIFICATIONS,
  POPULAR_SKILLS, MENTORSHIP_TOPICS, ALUMNI_PROGRAMS, ALUMNI_BATCHES
} from '@/lib/alumniTypes';
import { 
  User, Users, GraduationCap, Award, Calendar, 
  Briefcase, HeartHandshake, ShieldCheck, 
  CheckCircle2, Edit3, Save, Printer, Eye, 
  Plus, Bell, Search, Filter, Share2, Lock,
  Globe, Mail, Phone, MapPin, ExternalLink, Landmark, 
  ChevronRight, DollarSign, Receipt, Settings, ShieldAlert,
  CreditCard, Sparkles, Check, Clock, AlertCircle
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { DigitalAlumniCard } from '@/components/alumni/DigitalAlumniCard';
import { AlumniDirectoryView } from '@/components/alumni/AlumniDirectoryView';
import { AlumniEventsView } from '@/components/alumni/AlumniEventsView';
import { AlumniJobBoardView } from '@/components/alumni/AlumniJobBoardView';
import { AlumniMentorshipView } from '@/components/alumni/AlumniMentorshipView';
import { AlumniAssociationView } from '@/components/alumni/AlumniAssociationView';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, query, where, getDocs } from 'firebase/firestore';

export type AlumniDashboardTab = 
  | 'profile' 
  | 'card' 
  | 'association'
  | 'committee'
  | 'wings'
  | 'chapters'
  | 'membership'
  | 'constitution'
  | 'directory' 
  | 'events' 
  | 'jobs' 
  | 'mentorship' 
  | 'contributions' 
  | 'notifications' 
  | 'privacy';

interface AlumniDashboardProps {
  user: any;
}

export function AlumniDashboard({ user }: AlumniDashboardProps) {
  const searchParams = useSearchParams();
  const subtabParam = searchParams?.get('subtab') || searchParams?.get('tab');

  const [internalTab, setInternalTab] = useState<AlumniDashboardTab>('profile');

  // Derive active tab
  const validTabs: AlumniDashboardTab[] = [
    'profile', 'card', 'association', 'committee', 'wings', 'chapters',
    'membership', 'constitution', 'directory', 'events', 'jobs', 
    'mentorship', 'contributions', 'notifications', 'privacy'
  ];

  const activeTab = (subtabParam && validTabs.includes(subtabParam as AlumniDashboardTab))
    ? (subtabParam as AlumniDashboardTab)
    : internalTab;

  const setActiveTab = setInternalTab;

  // Current user's profile state
  const [profile, setProfile] = useState<AlumniProfile>(() => {
    return INITIAL_ALUMNI_PROFILES[0];
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Global datasets
  const [allProfiles, setAllProfiles] = useState<AlumniProfile[]>(INITIAL_ALUMNI_PROFILES);
  const [allEvents, setAllEvents] = useState<AlumniEvent[]>(INITIAL_ALUMNI_EVENTS);
  const [allJobs, setAllJobs] = useState<AlumniJob[]>(INITIAL_ALUMNI_JOBS);
  const [contributions, setContributions] = useState<AlumniContribution[]>(INITIAL_USER_CONTRIBUTIONS);
  const [notifications, setNotifications] = useState<AlumniNotification[]>(INITIAL_USER_NOTIFICATIONS);

  // New Contribution Modal State
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [newContribution, setNewContribution] = useState({
    fundName: 'Alumni Welfare Fund' as AlumniContribution['fundName'],
    amount: 5000,
    paymentMethod: 'bKash' as AlumniContribution['paymentMethod'],
    transactionId: '',
    note: ''
  });
  const [contributionSuccess, setContributionSuccess] = useState(false);

  // Sync profile & datasets from Firestore
  useEffect(() => {
    try {
      // 1. Sync profiles
      const qProfiles = collection(db, 'alumni_profiles');
      const unsubProfiles = onSnapshot(qProfiles, (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as AlumniProfile));
          const merged = [...list];
          INITIAL_ALUMNI_PROFILES.forEach(m => {
            if (!merged.some(p => p.alumniId === m.alumniId)) merged.push(m);
          });
          setAllProfiles(merged);

          const found = merged.find(p => p.email === user?.email || p.id === user?.uid);
          if (found) {
            setProfile(found);
          }
        }
      });

      // 2. Sync events
      const qEvents = collection(db, 'alumni_events');
      const unsubEvents = onSnapshot(qEvents, (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as AlumniEvent));
          const merged = [...list];
          INITIAL_ALUMNI_EVENTS.forEach(m => {
            if (!merged.some(e => e.id === m.id)) merged.push(m);
          });
          setAllEvents(merged);
        }
      });

      // 3. Sync jobs
      const qJobs = collection(db, 'alumni_jobs');
      const unsubJobs = onSnapshot(qJobs, (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as AlumniJob));
          const merged = [...list];
          INITIAL_ALUMNI_JOBS.forEach(m => {
            if (!merged.some(j => j.id === m.id)) merged.push(m);
          });
          setAllJobs(merged);
        }
      });

      // 4. Sync contributions
      const qContrib = collection(db, 'alumni_contributions');
      const unsubContrib = onSnapshot(qContrib, (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as AlumniContribution));
          const merged = [...list];
          INITIAL_USER_CONTRIBUTIONS.forEach(m => {
            if (!merged.some(c => c.id === m.id)) merged.push(m);
          });
          setContributions(merged);
        }
      });

      return () => {
        unsubProfiles();
        unsubEvents();
        unsubJobs();
        unsubContrib();
      };
    } catch (err) {
      console.warn('Firestore sync err in AlumniDashboard:', err);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      if (profile.id) {
        const docRef = doc(db, 'alumni_profiles', profile.id);
        await updateDoc(docRef, {
          fullName: profile.fullName,
          photoUrl: profile.photoUrl,
          profession: profile.profession,
          organization: profile.organization,
          designation: profile.designation,
          city: profile.city,
          country: profile.country,
          bio: profile.bio,
          skills: profile.skills,
          mentorshipOffer: profile.mentorshipOffer,
          privacy: profile.privacy,
          updatedAt: new Date().toISOString()
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSkill = (skill: string) => {
    const current = profile.skills || [];
    if (current.includes(skill)) {
      setProfile({ ...profile, skills: current.filter(s => s !== skill) });
    } else {
      setProfile({ ...profile, skills: [...current, skill] });
    }
  };

  const toggleMentorship = (topic: string) => {
    const current = profile.mentorshipOffer || [];
    if (current.includes(topic)) {
      setProfile({ ...profile, mentorshipOffer: current.filter(t => t !== topic) });
    } else {
      setProfile({ ...profile, mentorshipOffer: [...current, topic] });
    }
  };

  const handleCreateContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    const item: AlumniContribution = {
      id: `contrib-${Date.now()}`,
      alumniId: profile.alumniId,
      alumniName: profile.fullName,
      alumniEmail: profile.email || 'alumni@assunnah.edu.bd',
      fundName: newContribution.fundName,
      amount: Number(newContribution.amount),
      paymentMethod: newContribution.paymentMethod,
      transactionId: newContribution.transactionId || `TRX-${Math.floor(100000 + Math.random() * 900000)}`,
      receiptNumber: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      note: newContribution.note
    };

    try {
      await addDoc(collection(db, 'alumni_contributions'), item);
    } catch (err) {
      console.warn('Fallback adding contribution locally:', err);
    }

    setContributions([item, ...contributions]);
    setContributionSuccess(true);
    setTimeout(() => {
      setContributionSuccess(false);
      setIsContributionModalOpen(false);
      setNewContribution({
        fundName: 'Alumni Welfare Fund',
        amount: 5000,
        paymentMethod: 'bKash',
        transactionId: '',
        note: ''
      });
    }, 1800);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const tabs: { id: AlumniDashboardTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'card', label: 'Digital ID', icon: Award },
    { id: 'directory', label: 'Directory', icon: Users },
    { id: 'events', label: 'Events & Reunion', icon: Calendar },
    { id: 'jobs', label: 'Career & Jobs', icon: Briefcase },
    { id: 'mentorship', label: 'Mentorship', icon: HeartHandshake },
    { id: 'contributions', label: 'My Contributions', icon: DollarSign },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount },
    { id: 'membership', label: 'Membership', icon: Landmark },
    { id: 'privacy', label: 'Privacy & Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner */}
      <div className="bg-linear-to-r from-[#064e3b] via-[#043e2f] to-[#022c22] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-emerald-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <img
              src={profile.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
              alt={profile.fullName}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400/80 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  Verified Alumni
                </span>
                <span className="text-[10px] font-mono text-amber-300 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">
                  {profile.batch}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-white">
                {profile.fullName}
              </h1>
              <p className="text-xs text-amber-300 font-semibold">
                {profile.profession} • {profile.organization || 'As-Sunnah Institute'}
              </p>
              <p className="text-[11px] font-mono text-emerald-200">
                Alumni ID: <strong className="text-white">{profile.alumniId}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('card')}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Award className="w-4 h-4" />
              Digital ID Card
            </button>
            <button
              type="button"
              onClick={() => setIsContributionModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-amber-300 border border-amber-400/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              Pay Contribution / Fee
            </button>
          </div>

        </div>
      </div>

      {/* Navigation Subtabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer relative ${
                  isActive
                    ? 'bg-[#064e3b] text-amber-300 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{t.label}</span>
                {t.badge !== undefined && t.badge > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-mono">
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Profile View & Edit */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-[#064e3b]">
                Alumni Profile Management
              </h2>
              <p className="text-xs text-slate-500">
                Keep your academic, personal, and professional information updated
              </p>
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 disabled:bg-slate-100/70"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Current Profession / Title</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.profession}
                onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 disabled:bg-slate-100/70"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Organization / Institution</label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.organization}
                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 disabled:bg-slate-100/70"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">City & Country</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  placeholder="City"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 disabled:bg-slate-100/70"
                />
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.country}
                  onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                  placeholder="Country"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 disabled:bg-slate-100/70"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Biography & Research Interest Overview</label>
              <textarea
                rows={3}
                disabled={!isEditing}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 disabled:bg-slate-100/70 resize-none"
              />
            </div>

            {/* Skills selection */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-700">Expertise & Research Fields (Skills)</label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SKILLS.map((sk) => {
                  const isSelected = profile.skills?.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      disabled={!isEditing}
                      onClick={() => toggleSkill(sk)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#064e3b] text-amber-300 shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      } ${!isEditing && !isSelected ? 'hidden' : ''}`}
                    >
                      {sk}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mentorship topics */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-700">Mentorship Topics Offered to Junior Graduates</label>
              <div className="flex flex-wrap gap-2">
                {MENTORSHIP_TOPICS.map((topic) => {
                  const isSelected = profile.mentorshipOffer?.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      disabled={!isEditing}
                      onClick={() => toggleMentorship(topic)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      } ${!isEditing && !isSelected ? 'hidden' : ''}`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab 2: Digital ID Card */}
      {activeTab === 'card' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold font-serif text-[#064e3b]">
                  Official Digital Alumni Smart ID Card
                </h2>
                <p className="text-xs text-slate-500">
                  Official QR-enabled digital pass for conference, reunion, and library access
                </p>
              </div>
            </div>

            <div className="flex justify-center py-4">
              <DigitalAlumniCard profile={profile} />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Directory */}
      {activeTab === 'directory' && (
        <div className="animate-in fade-in">
          <AlumniDirectoryView alumniList={allProfiles} isLoggedInAlumni={true} />
        </div>
      )}

      {/* Tab 4: Events & Reunion */}
      {activeTab === 'events' && (
        <div className="animate-in fade-in">
          <AlumniEventsView events={allEvents} />
        </div>
      )}

      {/* Tab 5: Jobs */}
      {activeTab === 'jobs' && (
        <div className="animate-in fade-in">
          <AlumniJobBoardView jobs={allJobs} />
        </div>
      )}

      {/* Tab 6: Mentorship */}
      {activeTab === 'mentorship' && (
        <div className="animate-in fade-in">
          <AlumniMentorshipView alumniList={allProfiles} />
        </div>
      )}

      {/* Tab 7: My Contributions */}
      {activeTab === 'contributions' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-[#064e3b] flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-500" />
                My Financial Contributions, Membership Fees & Welfare Fund
              </h2>
              <p className="text-xs text-slate-500">
                Detailed history of your contributions to institute research, scholarship grants, and event funds
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsContributionModalOpen(true)}
              className="px-5 py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer self-start"
            >
              <Plus className="w-4 h-4" />
              Make New Contribution / Fee Payment
            </button>
          </div>

          {/* Contributions List */}
          <div className="space-y-4">
            {contributions.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">No contribution records found.</div>
            ) : (
              contributions.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{c.fundName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        c.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {c.status === 'confirmed' ? 'Approved & Verified' : 'Verification Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Date: {c.date} • Method: {c.paymentMethod} • TrxID: <span className="font-mono">{c.transactionId}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <span className="text-base font-bold font-serif text-[#064e3b]">
                      BDT {c.amount.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => alert(`Money receipt #${c.receiptNumber || c.transactionId || c.id} is ready for download.`)}
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Download Receipt"
                    >
                      <Receipt className="w-4 h-4 text-emerald-700" />
                      Receipt
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 8: Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-[#064e3b] flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                Notifications & Message Center
              </h2>
              <p className="text-xs text-slate-500">
                Real-time updates regarding events, job applications, and alumni association circulars
              </p>
            </div>
            {unreadNotificationsCount > 0 && (
              <button
                type="button"
                onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
              >
                Mark All as Read
              </button>
            )}
          </div>

          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                  n.read ? 'bg-slate-50 border-slate-200/80 text-slate-600' : 'bg-amber-50/40 border-amber-300 text-slate-900 shadow-2xs'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-slate-300' : 'bg-amber-500'}`} />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    <span className="text-[10px] text-slate-400">{n.createdAt}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Association Subtabs: Executive Committee, Specialized Wings, Global Chapters, Membership, Constitution */}
      {['association', 'committee', 'wings', 'chapters', 'membership', 'constitution'].includes(activeTab) && (
        <div className="animate-in fade-in">
          <AlumniAssociationView 
            initialSubTab={
              activeTab === 'wings' ? 'wings' :
              activeTab === 'chapters' ? 'chapters' :
              activeTab === 'membership' ? 'membership' :
              activeTab === 'constitution' ? 'constitution' : 'committee'
            } 
          />
        </div>
      )}

      {/* Tab 10: Privacy & Settings */}
      {activeTab === 'privacy' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold font-serif text-[#064e3b] flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-500" />
              Privacy & Security Settings
            </h2>
            <p className="text-xs text-slate-500">
              Manage your directory profile visibility and account security settings
            </p>
          </div>

          <div className="space-y-5 max-w-2xl">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-800">Directory Profile Visibility Level</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, privacy: 'public' })}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    profile.privacy === 'public'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">Public</span>
                    <Globe className="w-4 h-4 text-emerald-700" />
                  </div>
                  <p className="text-[11px] text-slate-500">Visible to public portal visitors & search engines</p>
                </button>

                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, privacy: 'alumni_only' })}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    profile.privacy === 'alumni_only'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">Alumni Only</span>
                    <Users className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-[11px] text-slate-500">Visible only to logged-in verified alumni members</p>
                </button>

                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, privacy: 'private' })}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    profile.privacy === 'private'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">Private</span>
                    <Lock className="w-4 h-4 text-rose-600" />
                  </div>
                  <p className="text-[11px] text-slate-500">Hidden from public directory listings</p>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>Your personal phone number and email are securely stored and strictly used for institutional verification and official notices.</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-6 py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contribution Modal */}
      {isContributionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold font-serif text-[#064e3b]">
                  Online Contribution / Fee Payment
                </h3>
                <p className="text-xs text-slate-500">Support As-Sunnah Alumni Welfare & Research Funds</p>
              </div>
              <button
                type="button"
                onClick={() => setIsContributionModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {contributionSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
                <h4 className="text-base font-bold text-[#064e3b]">Contribution Submitted Successfully!</h4>
                <p className="text-xs text-slate-600">The administration will verify your transaction and issue an official money receipt shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateContribution} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Fund / Purpose</label>
                  <select
                    value={newContribution.fundName}
                    onChange={(e) => setNewContribution({ ...newContribution, fundName: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="Alumni Welfare Fund">Alumni Welfare Fund</option>
                    <option value="Meritorious Scholarship Fund">Meritorious Scholarship Fund</option>
                    <option value="Research & Publication Grant">Research & Publication Grant</option>
                    <option value="Emergency Assistance Fund">Emergency Assistance Fund</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Amount (BDT)</label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={newContribution.amount}
                      onChange={(e) => setNewContribution({ ...newContribution, amount: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Payment Method</label>
                    <select
                      value={newContribution.paymentMethod}
                      onChange={(e) => setNewContribution({ ...newContribution, paymentMethod: e.target.value as AlumniContribution['paymentMethod'] })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    >
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Bank Transfer">Bank Transfer (IBBL)</option>
                      <option value="Card">Credit/Debit Card</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Transaction ID (TrxID)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9H7B32X1KL"
                    value={newContribution.transactionId}
                    onChange={(e) => setNewContribution({ ...newContribution, transactionId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 uppercase"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                  bKash / Nagad Merchant Number: <strong>01700-000000</strong> (Select &quot;Make Payment&quot; option)
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsContributionModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#064e3b] text-amber-300 text-xs font-bold rounded-xl hover:bg-emerald-900"
                  >
                    Submit Contribution
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
