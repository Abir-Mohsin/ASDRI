'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, GraduationCap, Search, Check, 
  X, AlertCircle, RefreshCw, ExternalLink, ArrowUpDown, 
  BookOpen, Mail, Phone, Clock, Image as ImageIcon, ShieldCheck,
  Upload, Sparkles, User, Filter
} from 'lucide-react';
import { 
  collection, getDocs, doc, setDoc, deleteDoc, 
  serverTimestamp, query, orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FacultyMember, INITIAL_FACULTY_MEMBERS } from '@/components/FacultyPageContent';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export function FacultyManager({ locale = 'bn' }: { locale?: string }) {
  const searchParams = useSearchParams();
  const actionParam = searchParams?.get('action');

  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    nameEn: string;
    nameAr: string;
    designation: string;
    designationEn: string;
    designationAr: string;
    department: 'hadith' | 'fiqh' | 'tafsir' | 'dawah' | 'arabic' | 'research';
    education: string;
    educationEn: string;
    educationAr: string;
    photoUrl: string;
    specialization: string;
    bio: string;
    bioEn: string;
    bioAr: string;
    coursesTaught: string;
    publications: string;
    officeHours: string;
    email: string;
    phone: string;
    order: number;
  }>({
    name: '',
    nameEn: '',
    nameAr: '',
    designation: '',
    designationEn: '',
    designationAr: '',
    department: 'hadith',
    education: '',
    educationEn: '',
    educationAr: '',
    photoUrl: '',
    specialization: '',
    bio: '',
    bioEn: '',
    bioAr: '',
    coursesTaught: '',
    publications: '',
    officeHours: '',
    email: '',
    phone: '',
    order: 1,
  });

  // Auto open create form if ?action=create is in URL
  useEffect(() => {
    if (actionParam === 'create') {
      resetForm();
      setIsEditing(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [actionParam]);

  // Fetch faculty from Firestore
  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'faculty_profiles'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const list: FacultyMember[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FacultyMember));
        setFaculty(list);
      } else {
        setFaculty([]);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
      setFaculty([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  // Initialize/Seed default faculty to Firestore
  const handleSeedDefaults = async () => {
    if (!confirm('আপনি কি পূর্বনির্ধারিত ৬ জন প্রথিতযশা শিক্ষকের প্রোফাইল ফায়ারবেস ডাটাবেজে সংরক্ষণ করতে চান?')) return;
    setSubmitting(true);
    try {
      for (const member of INITIAL_FACULTY_MEMBERS) {
        const docRef = doc(db, 'faculty_profiles', member.id);
        await setDoc(docRef, {
          ...member,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        }, { merge: true });
      }
      setFeedback({ type: 'success', message: 'সকল প্রাথমিক শিক্ষক প্রোফাইল সফলভাবে ফায়ারবেসে সিঙ্ক হয়েছে!' });
      await fetchFaculty();
    } catch (error: any) {
      console.error('Error seeding faculty:', error);
      setFeedback({ type: 'error', message: `সংরক্ষণে সমস্যা: ${error.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameEn: '',
      nameAr: '',
      designation: '',
      designationEn: '',
      designationAr: '',
      department: 'hadith',
      education: '',
      educationEn: '',
      educationAr: '',
      photoUrl: '',
      specialization: '',
      bio: '',
      bioEn: '',
      bioAr: '',
      coursesTaught: '',
      publications: '',
      officeHours: '',
      email: '',
      phone: '',
      order: faculty.length + 1,
    });
    setEditingId(null);
    setIsEditing(false);
  };

  const handleEditClick = (member: FacultyMember) => {
    setFormData({
      name: member.name || '',
      nameEn: member.nameEn || '',
      nameAr: member.nameAr || '',
      designation: member.designation || '',
      designationEn: member.designationEn || '',
      designationAr: member.designationAr || '',
      department: member.department || 'hadith',
      education: member.education || '',
      educationEn: member.educationEn || '',
      educationAr: member.educationAr || '',
      photoUrl: member.photoUrl || '',
      specialization: (member.specialization || []).join(', '),
      bio: member.bio || '',
      bioEn: member.bioEn || '',
      bioAr: member.bioAr || '',
      coursesTaught: (member.coursesTaught || []).join(', '),
      publications: (member.publications || []).join('\n'),
      officeHours: member.officeHours || '',
      email: member.email || '',
      phone: member.phone || '',
      order: member.order || 1,
    });
    setEditingId(member.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${name}"-এর প্রোফাইল মুছে ফেলতে চান?`)) return;

    try {
      await deleteDoc(doc(db, 'faculty_profiles', id));
      setFeedback({ type: 'success', message: `"${name}" সফলভাবে মুছে ফেলা হয়েছে।` });
      setFaculty(prev => prev.filter(f => f.id !== id));
    } catch (error: any) {
      console.error('Error deleting faculty:', error);
      setFeedback({ type: 'error', message: `মুছে ফেলা সম্ভব হয়নি: ${error.message}` });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.designation.trim()) {
      setFeedback({ type: 'error', message: 'দয়া করে শিক্ষকের নাম এবং পদবি প্রদান করুন।' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const specArray = formData.specialization
        ? formData.specialization.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const coursesArray = formData.coursesTaught
        ? formData.coursesTaught.split(',').map(c => c.trim()).filter(Boolean)
        : [];
      const pubsArray = formData.publications
        ? formData.publications.split('\n').map(p => p.trim()).filter(Boolean)
        : [];

      const payload: Partial<FacultyMember> = {
        name: formData.name.trim(),
        nameEn: formData.nameEn.trim(),
        nameAr: formData.nameAr.trim(),
        designation: formData.designation.trim(),
        designationEn: formData.designationEn.trim(),
        designationAr: formData.designationAr.trim(),
        department: formData.department,
        education: formData.education.trim(),
        educationEn: formData.educationEn.trim(),
        educationAr: formData.educationAr.trim(),
        photoUrl: formData.photoUrl.trim(),
        specialization: specArray,
        bio: formData.bio.trim(),
        bioEn: formData.bioEn.trim(),
        bioAr: formData.bioAr.trim(),
        coursesTaught: coursesArray,
        publications: pubsArray,
        officeHours: formData.officeHours.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        order: Number(formData.order) || 1,
      };

      const docId = editingId || `faculty_${Date.now()}`;
      const docData: Record<string, any> = {
        ...payload,
        id: docId,
        updatedAt: serverTimestamp(),
      };
      if (!editingId) {
        docData.createdAt = serverTimestamp();
      }

      await setDoc(doc(db, 'faculty_profiles', docId), docData, { merge: true });

      setFeedback({ 
        type: 'success', 
        message: editingId ? 'শিক্ষক প্রোফাইল সফলভাবে আপডেট করা হয়েছে!' : 'নতুন শিক্ষক প্রোফাইল সফলভাবে যুক্ত করা হয়েছে!' 
      });

      resetForm();
      await fetchFaculty();
    } catch (error: any) {
      console.error('Error saving faculty:', error);
      setFeedback({ type: 'error', message: `সংরক্ষণ ব্যর্থ হয়েছে: ${error.message}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      alert('ছবির আকার সর্বোচ্চ ২.৫ মেগাবাইট হতে পারে।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const filtered = faculty.filter(f => {
    if (deptFilter !== 'all' && f.department !== deptFilter) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      f.name.toLowerCase().includes(q) ||
      (f.nameEn && f.nameEn.toLowerCase().includes(q)) ||
      (f.designation && f.designation.toLowerCase().includes(q)) ||
      (f.education && f.education.toLowerCase().includes(q)) ||
      (f.department && f.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Faculty Management Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] font-serif">
              শিক্ষক ও গবেষক পরিষদ ব্যবস্থাপনা
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              ইনস্টিটিউটের সম্মানিত উস্তাদ, গবেষক ও মুফতিগণের প্রোফাইল যোগ, সম্পাদন ও প্রকাশনা নিয়ন্ত্রণ করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/${locale}/faculty`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              পাবলিক পেজ দেখুন
            </Link>

            <button
              type="button"
              onClick={handleSeedDefaults}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all disabled:opacity-50"
              title="ফায়ারবেস ক্লাউডে প্রাথমিক ৬ জন শিক্ষকের ডেটা সিঙ্ক করুন"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
              প্রাথমিক ডেটা সিঙ্ক
            </button>

            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsEditing(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#064e3b] hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                নতুন শিক্ষক যুক্ত করুন
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Form Drawer / Modal when isEditing */}
      {isEditing && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-600/30 shadow-md">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-bold text-[#064e3b] font-serif">
                {editingId ? 'শিক্ষকের প্রোফাইল সম্পাদনা' : 'নতুন শিক্ষকের প্রোফাইল নিবন্ধন'}
              </h2>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Primary Details (3 languages) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  নাম (বাংলা) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="যেমন: প্রফেসর ড. আবু বকর মুহাম্মদ যাকারিয়া"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064e3b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Name (English)
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="e.g. Prof. Dr. Abu Bakar Muhammad Zakaria"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064e3b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم (عربي)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="مثال: أ.د. أبو بكر محمد زكريا"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064e3b] focus:outline-none"
                />
              </div>
            </div>

            {/* Designation & Department */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পদবি (বাংলা) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="যেমন: অধ্যক্ষ ও প্রধান গবেষক"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064e3b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Designation (English)
                </label>
                <input
                  type="text"
                  value={formData.designationEn}
                  onChange={(e) => setFormData({ ...formData, designationEn: e.target.value })}
                  placeholder="e.g. Principal & Chief Researcher"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064e3b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বিভাগ (Department) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064e3b] focus:outline-none bg-white font-semibold"
                >
                  <option value="hadith">হাদিস ও উলূমুল হাদিস বিভাগ (Dept. of Hadith)</option>
                  <option value="fiqh">উচ্চতর ফিকহ ও ইফতা বোর্ড (Dept. of Fiqh)</option>
                  <option value="tafsir">উলূমুল কুরআন ও তাফসির বিভাগ (Dept. of Tafsir)</option>
                  <option value="dawah">দাওয়াহ ও তুলনামূলক ধর্মতত্ত্ব (Dept. of Dawah)</option>
                  <option value="arabic">আরবি ভাষা ও সাহিত্য বিভাগ (Dept. of Arabic)</option>
                  <option value="research">গবেষণা ও প্রকাশনা উইং (Research Wing)</option>
                </select>
              </div>
            </div>

            {/* Education & Academic Qualifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সর্বোচ্চ শিক্ষাগত ডিগ্রি (বাংলা)
                </label>
                <input
                  type="text"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  placeholder="যেমন: পিএইচডি (ইসলামিক স্টাডিজ), ইসলামিক ইউনিভার্সিটি অব মদীনা"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064e3b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Education Details (English)
                </label>
                <input
                  type="text"
                  value={formData.educationEn}
                  onChange={(e) => setFormData({ ...formData, educationEn: e.target.value })}
                  placeholder="e.g. Ph.D. in Islamic Studies, Islamic University of Madinah"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064e3b] focus:outline-none"
                />
              </div>
            </div>

            {/* Photo URL / Upload & Order */}
            <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-700" />
                  <label className="text-xs font-bold text-slate-800">
                    শিক্ষকের ছবি নির্ধারণ (Photo Upload / Link)
                  </label>
                </div>
                <span className="text-[11px] text-slate-500">
                  সরাসরি কম্পিউটার থেকে ছবি আপলোড করুন অথবা ওয়েবসাইটের লিংক দিন
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="md:col-span-2 space-y-3">
                  {/* File Upload Button */}
                  <div>
                    <span className="block text-[11px] font-bold text-slate-600 mb-1">
                      পদ্ধতি ১: ডিভাইস থেকে ছবি আপলোড করুন (Max 2.5 MB)
                    </span>
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-dashed border-emerald-500/50 hover:border-emerald-600 rounded-xl cursor-pointer text-xs font-semibold text-emerald-800 hover:bg-emerald-50/50 transition-all">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <span>কম্পিউটার বা মোবাইল থেকে ছবি নির্বাচন করুন</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* URL Input */}
                  <div>
                    <span className="block text-[11px] font-bold text-slate-600 mb-1">
                      পদ্ধতি ২: অথবা ছবির ওয়েব লিংক দিন (Photo URL)
                    </span>
                    <input
                      type="url"
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-[#064e3b] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Preview & Order */}
                <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border border-slate-200/80 text-center space-y-3">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-600/30 bg-slate-100 shadow-2xs">
                    {formData.photoUrl ? (
                      <img
                        src={formData.photoUrl}
                        alt="Photo Preview"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-[10px]">
                        <User className="w-8 h-8 text-slate-300 mb-1" />
                        ছবি নেই
                      </div>
                    )}
                  </div>
                  {formData.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photoUrl: '' })}
                      className="text-[11px] text-rose-600 hover:underline"
                    >
                      ছবি বাতিল করুন
                    </button>
                  )}

                  <div className="w-full pt-2 border-t border-slate-100">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      প্রদর্শন ক্রম (Order)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                      className="w-full px-2.5 py-1.5 text-center rounded-lg border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-[#064e3b] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Specializations & Courses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  গবেষণা ও পাঠদানের বিশেষত্ব (কমা দিয়ে লিখুন)
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="যেমন: সহীহুল বুখারী, উলূমুল হাদিস, ফিকহুল মুআমালাত"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064e3b] focus:outline-none"
                />
                <span className="text-[11px] text-slate-400">উদাহরণ: তাফসীর, আক্বীদা, তুলনামূলক ধর্মতত্ত্ব</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ইনস্টিটিউটে পাঠদানরত কোর্সসমূহ (কমা দিয়ে লিখুন)
                </label>
                <input
                  type="text"
                  value={formData.coursesTaught}
                  onChange={(e) => setFormData({ ...formData, coursesTaught: e.target.value })}
                  placeholder="যেমন: Advanced Hadith Sciences, Fiqh of Worship"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064e3b] focus:outline-none"
                />
              </div>
            </div>

            {/* Biography in 3 Languages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সংক্ষিপ্ত জীবনী ও পরিচিতি (বাংলা)
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="উস্তাদের শিক্ষাজীবন, শিক্ষকতা ও দাওয়াহ ক্যারিয়ার সম্পর্কে সংক্ষিপ্ত বিবরণ..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064e3b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Biography (English)
                </label>
                <textarea
                  rows={3}
                  value={formData.bioEn}
                  onChange={(e) => setFormData({ ...formData, bioEn: e.target.value })}
                  placeholder="Short bio and scholarly milestones..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064e3b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  النبذة الشخصية (عربي)
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={formData.bioAr}
                  onChange={(e) => setFormData({ ...formData, bioAr: e.target.value })}
                  placeholder="السيرة الذاتية والمؤلفات والإسهامات العلمية..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064e3b] focus:outline-none"
                />
              </div>
            </div>

            {/* Publications (newline separated) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                প্রকাশিত কিতাব ও গবেষণা প্রবন্ধ (প্রতি লাইনে একটি করে লিখুন)
              </label>
              <textarea
                rows={3}
                value={formData.publications}
                onChange={(e) => setFormData({ ...formData, publications: e.target.value })}
                placeholder={'তাফসীরুল মুয়াসসার (বাংলা অনুবাদ ও সম্পাদনা)\nইসলামি আক্বীদা ও সমকালীন বিভ্রান্তি নিরসন'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064e3b] focus:outline-none font-mono"
              />
            </div>

            {/* Contact & Consultation Hours */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  অফিসিয়াল ইমেইল
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="hadith.dept@as-sunnah.institute"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064e3b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ফোন নম্বর (ঐচ্ছিক)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+880 1700 000000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064e3b] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সাক্ষাতের সময়সূচি (Office Hours)
                </label>
                <input
                  type="text"
                  value={formData.officeHours}
                  onChange={(e) => setFormData({ ...formData, officeHours: e.target.value })}
                  placeholder="যেমন: রবিবার ও মঙ্গলবার: সকাল ১০:০০ - দুপুর ১২:৩০"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064e3b] focus:outline-none"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-[#064e3b] hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    সংরক্ষণ হচ্ছে...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {editingId ? 'আপডেট সম্পন্ন করুন' : 'প্রোফাইল সংরক্ষণ করুন'}
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Directory Table View */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        
        {/* Table Controls & Department Filter */}
        <div className="p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="শিক্ষকের নাম বা পদবি দিয়ে খুঁজুন..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#064e3b] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-xs font-bold text-slate-500">
                মোট শিক্ষক সংখ্যা: <span className="text-[#064e3b] font-extrabold">{filtered.length}</span> জন
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsEditing(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#064e3b] hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + নতুন শিক্ষক যোগ করুন
                </button>
              )}
            </div>
          </div>

          {/* Department Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              বিভাগ:
            </span>
            {[
              { id: 'all', label: 'সকল শিক্ষক' },
              { id: 'hadith', label: 'হাদিস বিভাগ' },
              { id: 'fiqh', label: 'ফিকহ ও ইফতা' },
              { id: 'tafsir', label: 'তাফসির বিভাগ' },
              { id: 'dawah', label: 'দাওয়াহ বিভাগ' },
              { id: 'arabic', label: 'আরবি সাহিত্য' },
              { id: 'research', label: 'গবেষণা উইং' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDeptFilter(d.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  deptFilter === d.id
                    ? 'bg-[#064e3b] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 text-center w-16">ক্রম</th>
                <th className="px-5 py-3.5">শিক্ষকের বিবরণ</th>
                <th className="px-5 py-3.5">বিভাগ</th>
                <th className="px-5 py-3.5">ডিগ্রি ও শিক্ষা</th>
                <th className="px-5 py-3.5">কোর্স ও বিশেষত্ব</th>
                <th className="px-5 py-3.5 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4 text-center font-bold text-slate-400">
                    {member.order || '-'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center text-slate-400">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 leading-snug">
                          {member.name}
                        </div>
                        <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                          {member.designation}
                        </div>
                        {member.email && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {member.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-[#064e3b] border border-emerald-200/60">
                      {member.department.toUpperCase()}
                    </span>
                  </td>

                  <td className="px-5 py-4 max-w-xs">
                    <div className="line-clamp-2 text-slate-700">
                      {member.education || 'ডিগ্রি সংযুক্ত নেই'}
                    </div>
                  </td>

                  <td className="px-5 py-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {member.specialization && member.specialization.slice(0, 2).map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(member)}
                        className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors"
                        title="সম্পাদনা করুন"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(member.id, member.name)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700">কোনো শিক্ষক প্রোফাইল পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">অনুসন্ধান ফিল্টার পরিবর্তন করুন অথবা নতুন শিক্ষক প্রোফাইল যুক্ত করুন</p>
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setIsEditing(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#064e3b] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-emerald-900"
                    >
                      <Plus className="w-4 h-4" />
                      নতুন শিক্ষক পরিচিতি যোগ করুন
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
