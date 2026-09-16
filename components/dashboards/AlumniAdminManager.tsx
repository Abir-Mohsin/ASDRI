'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlumniProfile, AlumniEvent, AlumniJob, AlumniAnnouncement,
  AlumniBatchProgram, DigitalIdTemplateSettings, AlumniContribution,
  INITIAL_ALUMNI_PROFILES, INITIAL_ALUMNI_EVENTS, INITIAL_ALUMNI_JOBS,
  INITIAL_ANNOUNCEMENTS, INITIAL_BATCH_PROGRAMS, DEFAULT_DIGITAL_ID_SETTINGS,
  INITIAL_USER_CONTRIBUTIONS, ALUMNI_BATCHES, ALUMNI_PROGRAMS,
  generateAlumniId
} from '@/lib/alumniTypes';
import { 
  INITIAL_EXECUTIVE_COMMITTEE, INITIAL_ADVISORS, INITIAL_GLOBAL_CHAPTERS,
  CommitteeMember, GlobalChapter
} from '@/lib/alumniAssociationTypes';
import { 
  Users, Award, ShieldCheck, CheckCircle2, XCircle, 
  Clock, Plus, Search, Filter, Download, Edit3, 
  Trash2, Eye, Calendar, Briefcase, Bell, 
  Sparkles, Check, AlertCircle, FileSpreadsheet,
  ExternalLink, Mail, Phone, RefreshCw, Landmark,
  Globe, QrCode, BarChart3, Settings, DollarSign,
  HeartHandshake, ChevronRight, Layers, FileText
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc, addDoc } from 'firebase/firestore';

export type AlumniAdminTab = 
  | 'overview'
  | 'members'
  | 'pending'
  | 'committee'
  | 'batches'
  | 'events'
  | 'jobs'
  | 'mentorship'
  | 'announcements'
  | 'digital_id'
  | 'chapters'
  | 'reports';

export function AlumniAdminManager() {
  const [adminTab, setAdminTab] = useState<AlumniAdminTab>('overview');
  
  // Data state
  const [profiles, setProfiles] = useState<AlumniProfile[]>(INITIAL_ALUMNI_PROFILES);
  const [events, setEvents] = useState<AlumniEvent[]>(INITIAL_ALUMNI_EVENTS);
  const [jobs, setJobs] = useState<AlumniJob[]>(INITIAL_ALUMNI_JOBS);
  const [announcements, setAnnouncements] = useState<AlumniAnnouncement[]>(INITIAL_ANNOUNCEMENTS);
  const [committee, setCommittee] = useState<CommitteeMember[]>(INITIAL_EXECUTIVE_COMMITTEE);
  const [chapters, setChapters] = useState<GlobalChapter[]>(INITIAL_GLOBAL_CHAPTERS);
  const [batches, setBatches] = useState<AlumniBatchProgram[]>(INITIAL_BATCH_PROGRAMS);
  const [idSettings, setIdSettings] = useState<DigitalIdTemplateSettings>(DEFAULT_DIGITAL_ID_SETTINGS);
  const [contributions, setContributions] = useState<AlumniContribution[]>(INITIAL_USER_CONTRIBUTIONS);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected item modal state
  const [selectedProfile, setSelectedProfile] = useState<AlumniProfile | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // New Event Modal
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventType, setNewEventType] = useState<'in_person' | 'online' | 'hybrid'>('in_person');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventLimit, setNewEventLimit] = useState(300);

  // New Announcement Modal
  const [isNewAnnModalOpen, setIsNewAnnModalOpen] = useState(false);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnCategory, setNewAnnCategory] = useState<'general' | 'event' | 'career' | 'urgent'>('general');

  // New Batch Modal
  const [isNewBatchModalOpen, setIsNewBatchModalOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchProg, setNewBatchProg] = useState('');
  const [newBatchYear, setNewBatchYear] = useState(2026);
  const [newBatchTotal, setNewBatchTotal] = useState(40);
  const [newBatchCoord, setNewBatchCoord] = useState('');

  // Real-time Firestore Sync
  useEffect(() => {
    try {
      const qProfiles = collection(db, 'alumni_profiles');
      const unsubProfiles = onSnapshot(qProfiles, (snap) => {
        if (!snap.empty) {
          const live = snap.docs.map(d => ({ id: d.id, ...d.data() } as AlumniProfile));
          const merged = [...live];
          INITIAL_ALUMNI_PROFILES.forEach(m => {
            if (!merged.some(p => p.alumniId === m.alumniId)) merged.push(m);
          });
          setProfiles(merged);
        }
      }, (err) => {
        console.warn('AlumniAdminManager profiles listener notice:', err?.message || err);
      });

      const qEvents = collection(db, 'alumni_events');
      const unsubEvents = onSnapshot(qEvents, (snap) => {
        if (!snap.empty) {
          const live = snap.docs.map(d => ({ id: d.id, ...d.data() } as AlumniEvent));
          const merged = [...live];
          INITIAL_ALUMNI_EVENTS.forEach(m => {
            if (!merged.some(e => e.id === m.id)) merged.push(m);
          });
          setEvents(merged);
        }
      }, (err) => {
        console.warn('AlumniAdminManager events listener notice:', err?.message || err);
      });

      const qJobs = collection(db, 'alumni_jobs');
      const unsubJobs = onSnapshot(qJobs, (snap) => {
        if (!snap.empty) {
          const live = snap.docs.map(d => ({ id: d.id, ...d.data() } as AlumniJob));
          const merged = [...live];
          INITIAL_ALUMNI_JOBS.forEach(m => {
            if (!merged.some(j => j.id === m.id)) merged.push(m);
          });
          setJobs(merged);
        }
      }, (err) => {
        console.warn('AlumniAdminManager jobs listener notice:', err?.message || err);
      });


      return () => {
        unsubProfiles();
        unsubEvents();
        unsubJobs();
      };
    } catch (err) {
      console.warn('Firestore sync note:', err);
    }
  }, []);

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Actions
  const handleApproveAlumni = async (profileToApprove: AlumniProfile) => {
    try {
      const updatedYear = profileToApprove.graduationYear || 2026;
      const officialId = profileToApprove.alumniId.includes('PENDING')
        ? generateAlumniId(updatedYear, Math.floor(100 + (Math.random() * 900)))
        : profileToApprove.alumniId;

      const updated = {
        ...profileToApprove,
        alumniId: officialId,
        status: 'verified' as const,
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'Central Admin',
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'alumni_profiles', profileToApprove.id), updated, { merge: true });
      } catch (e) {
        console.warn('Fallback local update:', e);
      }

      setProfiles(prev => prev.map(p => p.id === profileToApprove.id ? updated : p));
      setSelectedProfile(null);
      showNotification(`Application for ${profileToApprove.fullName} approved successfully! Official Alumni ID: ${officialId}`);
    } catch (error) {
      console.error('Error approving alumni:', error);
    }
  };

  const handleRejectAlumni = async (profileToReject: AlumniProfile) => {
    try {
      const updated = {
        ...profileToReject,
        status: 'rejected' as const,
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'alumni_profiles', profileToReject.id), updated, { merge: true });
      } catch (e) {
        console.warn('Fallback local rejection:', e);
      }

      setProfiles(prev => prev.map(p => p.id === profileToReject.id ? updated : p));
      setSelectedProfile(null);
      showNotification(`Application for ${profileToReject.fullName} has been rejected.`);
    } catch (error) {
      console.error('Error rejecting alumni:', error);
    }
  };

  const handleApproveJob = async (jobId: string) => {
    try {
      await updateDoc(doc(db, 'alumni_jobs', jobId), { status: 'approved' });
    } catch (e) {
      console.warn('Fallback local update:', e);
    }
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'approved' } : j));
    showNotification('Job posting has been approved and published!');
  };

  const handleRejectJob = async (jobId: string) => {
    try {
      await updateDoc(doc(db, 'alumni_jobs', jobId), { status: 'rejected' });
    } catch (e) {
      console.warn('Fallback local update:', e);
    }
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'rejected' } : j));
    showNotification('Job posting has been rejected.');
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEv: AlumniEvent = {
      id: `ev-${Date.now()}`,
      title: newEventTitle,
      date: newEventDate,
      time: newEventTime,
      location: newEventLocation,
      type: newEventType,
      description: newEventDesc,
      coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
      registrationDeadline: newEventDate,
      registrationLimit: Number(newEventLimit),
      registeredCount: 0,
      fee: 'Free',
      organizer: 'As-Sunnah Alumni Association',
      status: 'upcoming',
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'alumni_events'), newEv);
    } catch (err) {
      console.warn('Fallback local add event:', err);
    }

    setEvents([newEv, ...events]);
    setIsNewEventModalOpen(false);
    showNotification('New event published successfully!');
    setNewEventTitle('');
    setNewEventDate('');
    setNewEventTime('');
    setNewEventLocation('');
    setNewEventDesc('');
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAnn: AlumniAnnouncement = {
      id: `ann-${Date.now()}`,
      title: newAnnTitle,
      content: newAnnContent,
      category: newAnnCategory,
      isPinned: false,
      publishedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      createdBy: 'Central Admin',
      authorRole: 'Central Secretariat Editor',
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'alumni_announcements'), newAnn);
    } catch (err) {
      console.warn('Fallback local add announcement:', err);
    }

    setAnnouncements([newAnn, ...announcements]);
    setIsNewAnnModalOpen(false);
    showNotification('New notice published successfully!');
    setNewAnnTitle('');
    setNewAnnContent('');
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const item: AlumniBatchProgram = {
      id: `batch-${Date.now()}`,
      batchName: newBatchName,
      programName: newBatchProg,
      department: 'Faculty of Islamic Studies',
      graduationYear: newBatchYear,
      totalGraduates: newBatchTotal,
      activeAlumniCount: 0,
      classRepresentative: newBatchCoord || 'Not Assigned',
      repContact: '+880 1700-000000',
      status: 'active'
    };
    setBatches([...batches, item]);
    setIsNewBatchModalOpen(false);
    showNotification('New batch & program configured!');
    setNewBatchName('');
    setNewBatchProg('');
    setNewBatchCoord('');
  };

  const pendingProfiles = profiles.filter(p => p.status === 'pending');
  const verifiedProfiles = profiles.filter(p => p.status === 'verified');
  const pendingJobs = jobs.filter(j => j.status === 'pending');

  const filteredMembers = profiles.filter(p => {
    const matchSearch = p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.alumniId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchBatch = batchFilter === 'all' || p.batch === batchFilter;
    const matchProgram = programFilter === 'all' || p.program === programFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchBatch && matchProgram && matchStatus;
  });

  const adminNavItems: { id: AlumniAdminTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'overview', label: 'Dashboard Overview', icon: BarChart3 },
    { id: 'members', label: `Alumni Management (${verifiedProfiles.length})`, icon: Users },
    { id: 'pending', label: 'Verification Queue', icon: ShieldCheck, badge: pendingProfiles.length },
    { id: 'committee', label: 'Committee Management', icon: Award },
    { id: 'batches', label: 'Batch & Program', icon: Layers },
    { id: 'events', label: `Events (${events.length})`, icon: Calendar },
    { id: 'jobs', label: `Jobs (${jobs.length})`, icon: Briefcase, badge: pendingJobs.length },
    { id: 'mentorship', label: 'Mentorship Forum', icon: HeartHandshake },
    { id: 'announcements', label: `News/Notices (${announcements.length})`, icon: Bell },
    { id: 'digital_id', label: 'Digital ID Settings', icon: QrCode },
    { id: 'chapters', label: `Chapters (${chapters.length})`, icon: Globe },
    { id: 'reports', label: 'Reports & Analytics', icon: FileSpreadsheet },
  ];

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950 text-amber-300 border border-amber-400/40 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-linear-to-r from-[#064e3b] via-[#043e2f] to-[#022c22] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-emerald-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-amber-300 text-xs font-bold">
              <Landmark className="w-3.5 h-3.5" />
              <span>Executive Admin Control Panel</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-white">
              Alumni Association Central Administration & Management
            </h1>
            <p className="text-xs text-emerald-100/90">
              Registration verification, batch configuration, digital ID templates, and comprehensive reports
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const csv = `AlumniID,FullName,Batch,Program,Phone,Email,Status\n` + 
                  profiles.map(p => `"${p.alumniId}","${p.fullName}","${p.batch}","${p.program}","${p.phone}","${p.email}","${p.status}"`).join('\n');
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `alumni_export_${new Date().toISOString().slice(0,10)}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* 12-Module Admin Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {adminNavItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = adminTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAdminTab(tab.id)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer relative ${
                  isActive
                    ? 'bg-[#064e3b] text-amber-300 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {adminTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <Users className="w-5 h-5 text-emerald-700" />
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">Active</span>
              </div>
              <p className="text-2xl font-bold font-serif text-slate-900">{verifiedProfiles.length}</p>
              <p className="text-xs text-slate-500">Verified Alumni Members</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">Pending</span>
              </div>
              <p className="text-2xl font-bold font-serif text-slate-900">{pendingProfiles.length}</p>
              <p className="text-xs text-slate-500">Pending Verification Queue</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">Events</span>
              </div>
              <p className="text-2xl font-bold font-serif text-slate-900">{events.length}</p>
              <p className="text-xs text-slate-500">Active Events & Conferences</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded">Funds</span>
              </div>
              <p className="text-2xl font-bold font-serif text-slate-900">
                BDT {contributions.reduce((acc, c) => acc + c.amount, 0).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">Total Funds & Fees Collected</p>
            </div>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-serif text-[#064e3b] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  Recent Pending Verification Requests
                </h3>
                <button
                  type="button"
                  onClick={() => setAdminTab('pending')}
                  className="text-xs text-emerald-800 font-bold hover:underline"
                >
                  View All ({pendingProfiles.length})
                </button>
              </div>

              {pendingProfiles.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No pending verification requests</p>
              ) : (
                <div className="space-y-3">
                  {pendingProfiles.slice(0, 3).map((p) => (
                    <div key={p.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900">{p.fullName}</p>
                        <p className="text-[11px] text-slate-500">{p.batch} • {p.program}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApproveAlumni(p)}
                        className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 cursor-pointer"
                      >
                        Approve
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-serif text-[#064e3b] flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  Job & Career Posting Requests
                </h3>
                <button
                  type="button"
                  onClick={() => setAdminTab('jobs')}
                  className="text-xs text-emerald-800 font-bold hover:underline"
                >
                  Job Management ({jobs.length})
                </button>
              </div>

              {pendingJobs.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">All job postings are approved</p>
              ) : (
                <div className="space-y-3">
                  {pendingJobs.slice(0, 3).map((j) => (
                    <div key={j.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900">{j.title}</p>
                        <p className="text-[11px] text-slate-500">{j.organization} • {j.location}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApproveJob(j.id)}
                        className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 cursor-pointer"
                      >
                        Approve
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALUMNI MANAGEMENT (MEMBERS) */}
      {adminTab === 'members' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-[#064e3b]">
                All Registered Alumni Members Directory ({filteredMembers.length})
              </h2>
              <p className="text-xs text-slate-500">
                Manage member profile data, verification status, and digital ID cards
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Name, ID or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
              >
                <option value="all">All Batches</option>
                {ALUMNI_BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Alumni Profile</th>
                  <th className="p-3.5">Alumni ID</th>
                  <th className="p-3.5">Batch & Program</th>
                  <th className="p-3.5">Profession & Org</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                          alt={m.fullName}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{m.fullName}</p>
                          <p className="text-[10px] text-slate-400">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-emerald-900 font-bold">{m.alumniId}</td>
                    <td className="p-3.5">
                      <p className="font-semibold text-slate-800">{m.batch}</p>
                      <p className="text-[10px] text-slate-400">{m.program}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-slate-800">{m.profession}</p>
                      <p className="text-[10px] text-slate-400">{m.organization}</p>
                    </td>
                    <td className="p-3.5 text-slate-600 font-mono text-[11px]">{m.phone}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        m.status === 'verified' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        m.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {m.status === 'verified' ? 'Verified' : m.status === 'pending' ? 'Pending' : 'Rejected'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedProfile(m)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: VERIFICATION QUEUE */}
      {adminTab === 'pending' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-lg font-bold font-serif text-[#064e3b] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              New Registration & Verification Queue ({pendingProfiles.length})
            </h2>
            <p className="text-xs text-slate-500">
              Verify applicant academic records and issue official alumni IDs
            </p>
          </div>

          {pendingProfiles.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Pending Applications!</h3>
              <p className="text-xs text-slate-500">All alumni registration requests have been verified.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingProfiles.map((p) => (
                <div key={p.id} className="p-6 rounded-3xl border border-amber-200 bg-amber-50/30 space-y-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={p.photoUrl}
                      alt={p.fullName}
                      className="w-14 h-14 rounded-2xl object-cover border border-amber-300"
                    />
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900 font-serif">{p.fullName}</h3>
                      <p className="text-xs text-emerald-800 font-semibold">{p.batch} • {p.program}</p>
                      <p className="text-[11px] text-slate-500">Student Roll / ID: {p.studentId || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-100 text-xs space-y-1 text-slate-700">
                    <p><strong>Phone:</strong> {p.phone}</p>
                    <p><strong>Email:</strong> {p.email}</p>
                    <p><strong>Profession:</strong> {p.profession} ({p.organization})</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/60">
                    <button
                      type="button"
                      onClick={() => handleRejectAlumni(p)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveAlumni(p)}
                      className="px-5 py-2 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                    >
                      Approve & Generate ID
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: COMMITTEE MANAGEMENT */}
      {adminTab === 'committee' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-[#064e3b] flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Central Executive Committee & Advisory Panel
              </h2>
              <p className="text-xs text-slate-500">Manage executive membership and roles</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {committee.map((m) => (
              <div key={m.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
                <img
                  src={m.photoUrl}
                  alt={m.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-emerald-200"
                />
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 font-serif">{m.name}</h3>
                  <p className="text-xs text-emerald-800 font-bold">{m.designation}</p>
                  <p className="text-[10px] text-slate-500">{m.batch}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BATCH & PROGRAM MANAGEMENT */}
      {adminTab === 'batches' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-[#064e3b] flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                Batch & Academic Program Management
              </h2>
              <p className="text-xs text-slate-500">Batch directory and class representatives by department</p>
            </div>
            <button
              type="button"
              onClick={() => setIsNewBatchModalOpen(true)}
              className="px-4 py-2 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add New Batch
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {batches.map((b) => (
              <div key={b.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-serif text-[#064e3b] bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                    {b.batchName}
                  </span>
                  <span className="text-xs font-bold text-slate-700">{b.graduationYear}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{b.programName}</h3>
                  <p className="text-xs text-slate-500 mt-1">Class Representative: {b.classRepresentative}</p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Total Graduates: {b.totalGraduates}</span>
                  <span className="text-emerald-800 font-bold">Active ({b.activeAlumniCount})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: EVENTS MANAGEMENT */}
      {adminTab === 'events' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-[#064e3b] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Events & Reunion Management ({events.length})
              </h2>
              <p className="text-xs text-slate-500">Publish and organize conferences, webinars, and reunions</p>
            </div>
            <button
              type="button"
              onClick={() => setIsNewEventModalOpen(true)}
              className="px-4 py-2 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Create New Event
            </button>
          </div>

          <div className="space-y-4">
            {events.map((ev) => (
              <div key={ev.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{ev.title}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {ev.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Date: {ev.date} • Venue: {ev.location} • Registered: {ev.registeredCount}/{ev.registrationLimit || 'Unlimited'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEvents(events.filter(e => e.id !== ev.id));
                      showNotification('Event has been deleted.');
                    }}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: JOBS MANAGEMENT */}
      {adminTab === 'jobs' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-lg font-bold font-serif text-[#064e3b] flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-500" />
              Career & Job Posting Moderation ({jobs.length})
            </h2>
            <p className="text-xs text-slate-500">Review and approve job circulars posted by alumni</p>
          </div>

          <div className="space-y-4">
            {jobs.map((jb) => (
              <div key={jb.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{jb.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      jb.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {jb.status === 'approved' ? 'Approved & Live' : 'Pending Review'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Organization: {jb.organization} • Location: {jb.location} • Salary: {jb.salary || 'Negotiable'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {jb.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleApproveJob(jb.id)}
                      className="px-4 py-1.5 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 cursor-pointer"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setJobs(jobs.filter(j => j.id !== jb.id));
                      showNotification('Job posting deleted.');
                    }}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: MENTORSHIP FORUM */}
      {adminTab === 'mentorship' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-lg font-bold font-serif text-[#064e3b] flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-amber-500" />
              Mentorship & Scholar Forum Management
            </h2>
            <p className="text-xs text-slate-500">Registered mentors and session tracking</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {verifiedProfiles.filter(p => p.mentorshipOffer && p.mentorshipOffer.length > 0).map(m => (
              <div key={m.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-3">
                  <img src={m.photoUrl} alt={m.fullName} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{m.fullName}</h3>
                    <p className="text-[10px] text-emerald-800 font-semibold">{m.profession}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 pt-2">
                  {m.mentorshipOffer?.map(t => (
                    <span key={t} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: ANNOUNCEMENTS */}
      {adminTab === 'announcements' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-[#064e3b] flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                News & Circulars Notice Board ({announcements.length})
              </h2>
              <p className="text-xs text-slate-500">Official announcements, research calls, and press releases</p>
            </div>
            <button
              type="button"
              onClick={() => setIsNewAnnModalOpen(true)}
              className="px-4 py-2 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Publish New Notice
            </button>
          </div>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{ann.title}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      {ann.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{ann.content}</p>
                  <p className="text-[10px] text-slate-400">Date: {ann.publishedDate} • Author: {ann.createdBy}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAnnouncements(announcements.filter(a => a.id !== ann.id));
                    showNotification('Notice has been deleted.');
                  }}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 cursor-pointer self-end md:self-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 10: DIGITAL ID SETTINGS */}
      {adminTab === 'digital_id' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-lg font-bold font-serif text-[#064e3b] flex items-center gap-2">
              <QrCode className="w-5 h-5 text-amber-500" />
              Digital ID Card Template & Configuration
            </h2>
            <p className="text-xs text-slate-500">Smart card prefix, validity years, and authorized signatory settings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Card Title</label>
                <input
                  type="text"
                  value={idSettings.cardTitleBn}
                  onChange={(e) => setIdSettings({ ...idSettings, cardTitleBn: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Authorized Signatory Name</label>
                <input
                  type="text"
                  value={idSettings.authorizedSignatoryName}
                  onChange={(e) => setIdSettings({ ...idSettings, authorizedSignatoryName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Validity Period (Years)</label>
                <input
                  type="number"
                  value={idSettings.validityYears}
                  onChange={(e) => setIdSettings({ ...idSettings, validityYears: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Signatory Title</label>
                <input
                  type="text"
                  value={idSettings.authorizedSignatoryTitle}
                  onChange={(e) => setIdSettings({ ...idSettings, authorizedSignatoryTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="button"
                onClick={() => showNotification('Digital ID settings saved successfully!')}
                className="px-6 py-2.5 bg-[#064e3b] text-amber-300 text-xs font-bold rounded-xl cursor-pointer"
              >
                Save Settings
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase">Verification URL & QR Target:</h4>
              <p className="text-xs font-mono text-emerald-800 bg-white p-3 rounded-xl border border-slate-200">
                {idSettings.verificationBaseUrl}?id=ASDRI-ALM-YYYY-XXXXX
              </p>
              <p className="text-[11px] text-slate-500">
                Scanning the QR code on any printed or digital card will instantly render authentic verification credentials.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 11: CHAPTERS MANAGEMENT */}
      {adminTab === 'chapters' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-lg font-bold font-serif text-[#064e3b] flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-500" />
              Global & Regional Chapters Coordination ({chapters.length})
            </h2>
            <p className="text-xs text-slate-500">International wings, local chapters, and regional representatives</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((ch) => (
              <div key={ch.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-1.5">
                    <span>{ch.flag}</span>
                    <span>{ch.city} ({ch.country})</span>
                  </h3>
                  <span className="text-xs text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                    {ch.membersCount} Members
                  </span>
                </div>
                <p className="text-xs text-slate-600">Coordinator: {ch.coordinatorName}</p>
                <p className="text-[11px] text-slate-500">Contact: {ch.coordinatorContact}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 12: REPORTS & ANALYTICS */}
      {adminTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-lg font-bold font-serif text-[#064e3b] flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-500" />
              Analytics & Executive Reports Dashboard
            </h2>
            <p className="text-xs text-slate-500">Batch distributions, fund collection metrics, and career analytics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase">Batch Member Distribution</h3>
              {ALUMNI_BATCHES.map(b => {
                const count = profiles.filter(p => p.batch === b).length;
                return (
                  <div key={b} className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">{b}</span>
                    <span className="font-bold text-slate-900">{count} Members</span>
                  </div>
                );
              })}
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase">Career & Sector Distribution</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Academia & Research</span>
                  <span className="font-bold text-slate-900">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Islamic Banking & Shariah Audit</span>
                  <span className="font-bold text-slate-900">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">International Post-Doc & PhD</span>
                  <span className="font-bold text-slate-900">20%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Media, Da'wah & Social Trust</span>
                  <span className="font-bold text-slate-900">10%</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase">Fund Summary</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Research & Grants</span>
                  <span className="font-bold text-emerald-800">BDT 4,50,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Reunion Registrations</span>
                  <span className="font-bold text-emerald-800">BDT 3,20,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Welfare Fund</span>
                  <span className="font-bold text-emerald-800">BDT 2,00,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Event */}
      {isNewEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold font-serif text-[#064e3b]">Publish New Event</h3>
              <button type="button" onClick={() => setIsNewEventModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Event Title</label>
                <input required type="text" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700">Date</label>
                  <input required type="text" placeholder="e.g. Mar 15, 2026" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Time</label>
                  <input required type="text" placeholder="10:00 AM" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Venue / Location</label>
                <input required type="text" placeholder="Central Auditorium" value={newEventLocation} onChange={e => setNewEventLocation(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea rows={3} value={newEventDesc} onChange={e => setNewEventDesc(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsNewEventModalOpen(false)} className="px-4 py-2 bg-slate-100 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#064e3b] text-amber-300 text-xs font-bold rounded-xl cursor-pointer">Publish Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Announcement */}
      {isNewAnnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold font-serif text-[#064e3b]">Publish New Notice</h3>
              <button type="button" onClick={() => setIsNewAnnModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Notice Title</label>
                <input required type="text" value={newAnnTitle} onChange={e => setNewAnnTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Category</label>
                <select value={newAnnCategory} onChange={e => setNewAnnCategory(e.target.value as any)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <option value="general">General Notice</option>
                  <option value="event">Events & Conference</option>
                  <option value="career">Career & Research</option>
                  <option value="urgent">Urgent Notice</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Content</label>
                <textarea required rows={4} value={newAnnContent} onChange={e => setNewAnnContent(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsNewAnnModalOpen(false)} className="px-4 py-2 bg-slate-100 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#064e3b] text-amber-300 text-xs font-bold rounded-xl cursor-pointer">Publish Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Batch */}
      {isNewBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold font-serif text-[#064e3b]">Configure New Batch & Program</h3>
              <button type="button" onClick={() => setIsNewBatchModalOpen(false)} className="text-slate-400 cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleCreateBatch} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Batch Name</label>
                <input required placeholder="e.g. 6th Batch (2026)" value={newBatchName} onChange={e => setNewBatchName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Faculty / Program</label>
                <input required placeholder="e.g. Advanced Fiqh & Fatwa Research" value={newBatchProg} onChange={e => setNewBatchProg(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700">Passing Year</label>
                  <input type="number" value={newBatchYear} onChange={e => setNewBatchYear(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Total Students</label>
                  <input type="number" value={newBatchTotal} onChange={e => setNewBatchTotal(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Batch Coordinator / Class Rep</label>
                <input placeholder="e.g. Mufti Ibrahim Khalil" value={newBatchCoord} onChange={e => setNewBatchCoord(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsNewBatchModalOpen(false)} className="px-4 py-2 bg-slate-100 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#064e3b] text-amber-300 text-xs font-bold rounded-xl cursor-pointer">Save Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Full Profile Details */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedProfile.photoUrl}
                  alt={selectedProfile.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-100"
                />
                <div>
                  <h3 className="text-lg font-bold font-serif text-slate-900">{selectedProfile.fullName}</h3>
                  <p className="text-xs text-emerald-800 font-bold">{selectedProfile.profession} • {selectedProfile.organization}</p>
                  <p className="text-xs font-mono text-slate-500">ID: {selectedProfile.alumniId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Batch & Program:</span>
                <span className="font-bold text-slate-900">{selectedProfile.batch} • {selectedProfile.program}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Contact:</span>
                <span className="font-bold text-slate-900">{selectedProfile.phone} | {selectedProfile.email}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl col-span-2">
                <span className="text-slate-500 block">Location:</span>
                <span className="font-bold text-slate-900">{selectedProfile.city}, {selectedProfile.country}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl col-span-2">
                <span className="text-slate-500 block">Short Bio:</span>
                <span className="text-slate-700 leading-relaxed">{selectedProfile.bio || 'No bio provided'}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
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
