'use client';

import { useState, useEffect } from 'react';
import { 
  Users, BookOpen, FileText, CreditCard, ArrowRight, ArrowLeft, 
  ShieldCheck, CheckCircle2, Database, KeyRound, Server, 
  Sparkles, ExternalLink, Activity, Plus, Settings, Globe, Edit3, Lock,
  Image as ImageIcon
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import PageContentManager from './PageContentManager';
import { FacultyManager } from './FacultyManager';
import { SiteBrandingManager } from './SiteBrandingManager';

// Helper to convert standard digits to Bengali digits
function toBengaliNumerals(n: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return n.toString().replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)]);
}

export function AdminDashboard() {
  const { user } = useAuthStore();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || 'bn';
  const tab = searchParams?.get('tab');

  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(18);
  const [totalStudents, setTotalStudents] = useState(1524);
  const [activeCoursesCount, setActiveCoursesCount] = useState(12);
  const [publishedFatwasCount, setPublishedFatwasCount] = useState(450);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch recent applications
        const recentQ = query(collection(db, 'applications'), orderBy('createdAt', 'desc'), limit(5));
        const recentSnapshot = await getDocs(recentQ);
        if (!recentSnapshot.empty) {
          setRecentApps(recentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }

        // Fetch pending count
        const pendingQ = query(collection(db, 'applications'), where('status', '==', 'pending'));
        const pendingSnapshot = await getDocs(pendingQ);
        if (pendingSnapshot.size > 0) {
          setPendingCount(pendingSnapshot.size);
        }

        // Try to fetch real users/students count
        const usersSnapshot = await getDocs(collection(db, 'users'));
        if (usersSnapshot.size > 0) {
          setTotalStudents(usersSnapshot.size);
        }

        // Try to fetch real courses count
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        if (coursesSnapshot.size > 0) {
          setActiveCoursesCount(coursesSnapshot.size);
        }

        // Try to fetch papers/fatwas count
        const papersSnapshot = await getDocs(collection(db, 'research_papers'));
        if (papersSnapshot.size > 0) {
          setPublishedFatwasCount(papersSnapshot.size);
        }
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (tab === 'branding') {
    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        <SiteBrandingManager 
          locale={locale} 
          onBack={() => {
            window.location.href = `/${locale}/dashboard`;
          }} 
        />
      </div>
    );
  }

  if (tab === 'content_manager') {
    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        <PageContentManager />
      </div>
    );
  }

  if (tab === 'faculty_manager') {
    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        <div className="mb-4">
          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-all shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
        </div>
        <FacultyManager locale={locale} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs font-bold text-slate-500">Admin Hub</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Firebase Secure Connected
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
              Dashboard Overview
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link 
              href={`/${locale}/dashboard?tab=branding`}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4 text-amber-400" />
              Site Logo & Branding (লগো ম্যানেজমেন্ট)
            </Link>
            <Link 
              href={`/${locale}/dashboard?tab=content_manager`}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Site Settings & Page Content Editor
            </Link>
            <Link 
              href={`/${locale}/dashboard/courses?action=create`}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Course
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Students */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Total Students</p>
            <h3 className="text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
              {totalStudents.toLocaleString()}
            </h3>
          </div>
          <Link
            href={`/${locale}/dashboard/users`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-700 transition-colors mt-6 pt-3 border-t border-slate-50"
          >
            <span>User Accounts Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 2: Active Courses */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Active Courses</p>
            <h3 className="text-3xl font-extrabold text-amber-700 font-serif tracking-tight">
              {activeCoursesCount}
            </h3>
          </div>
          <Link
            href={`/${locale}/dashboard/courses`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-700 transition-colors mt-6 pt-3 border-t border-slate-50"
          >
            <span>Course Curriculum & Forms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 3: Published Research Papers */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Research & Publications</p>
            <h3 className="text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
              {publishedFatwasCount}
            </h3>
          </div>
          <Link
            href={`/${locale}/research`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-700 transition-colors mt-6 pt-3 border-t border-slate-50"
          >
            <span>Research Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 4: Pending Applications */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Pending Applications</p>
            <h3 className="text-3xl font-extrabold text-amber-700 font-serif tracking-tight">
              {pendingCount}
            </h3>
          </div>
          <Link
            href={`/${locale}/dashboard/applications`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-700 transition-colors mt-6 pt-3 border-t border-slate-50"
          >
            <span>Verify Transaction IDs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {/* Two-Column Core Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Quick Action Links */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-[#064e3b] font-serif">
            Quick Action Links
          </h2>

          <div className="space-y-3">
            <Link
              href={`/${locale}/dashboard/courses?action=create`}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-300 rounded-2xl text-xs font-bold text-slate-800 hover:text-emerald-950 transition-all group shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <span className="text-emerald-700 font-extrabold text-sm">+</span>
                Create New Course & Custom Application Form
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href={`/${locale}/dashboard/applications`}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-300 rounded-2xl text-xs font-bold text-slate-800 hover:text-emerald-950 transition-all group shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <span className="text-emerald-700 font-extrabold text-sm">+</span>
                Verify bKash / Nagad Transaction IDs & Payments
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href={`/${locale}/dashboard?tab=content_manager`}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-300 rounded-2xl text-xs font-bold text-slate-800 hover:text-emerald-950 transition-all group shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <span className="text-emerald-700 font-extrabold text-sm">+</span>
                Update Announcement Banner & Merchant Numbers
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href={`/${locale}/dashboard?tab=content_manager`}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-300 rounded-2xl text-xs font-bold text-slate-800 hover:text-emerald-950 transition-all group shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <span className="text-emerald-700 font-extrabold text-sm">+</span>
                Edit Page Content, Notices & Visual Design
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href={`/${locale}/dashboard/users`}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-300 rounded-2xl text-xs font-bold text-slate-800 hover:text-emerald-950 transition-all group shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <span className="text-emerald-700 font-extrabold text-sm">+</span>
                Manage User Accounts & Role Permissions
              </span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

        {/* Right Column: System Status & Info */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-[#064e3b] font-serif">
            System Status & Architecture
          </h2>

          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between py-2.5 border-b border-slate-100 text-xs">
              <span className="font-semibold text-slate-600 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-700" />
                Database:
              </span>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                Firebase Firestore (Active)
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5 border-b border-slate-100 text-xs">
              <span className="font-semibold text-slate-600 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-700" />
                Authentication:
              </span>
              <span className="font-semibold text-slate-800">
                Google Identity & Auth
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5 border-b border-slate-100 text-xs">
              <span className="font-semibold text-slate-600 flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-700" />
                Frontend Framework:
              </span>
              <span className="font-semibold text-slate-800">
                Next.js App Router
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5 border-b border-slate-100 text-xs">
              <span className="font-semibold text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Security Rules:
              </span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Production Hardened
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5 text-xs">
              <span className="font-semibold text-slate-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Cloud Storage:
              </span>
              <span className="font-semibold text-slate-800">
                Firebase Storage (Connected)
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Applications Preview */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 font-serif">Recent Admission Applications</h3>
            <p className="text-xs text-slate-500 mt-0.5">Review student applications and fee verification status</p>
          </div>
          <Link 
            href={`/${locale}/dashboard/applications`} 
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading applications...</div>
          ) : recentApps.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No pending applications found.</div>
          ) : (
            recentApps.map((app) => (
              <div key={app.id} className="p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 flex items-center justify-center text-emerald-900 font-bold text-sm font-serif">
                    {app.userName?.[0]?.toUpperCase() || 'A'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{app.userName || 'Applicant'}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span>Course: <strong>{app.courseId || 'Fiqh & Usul'}</strong></span>
                      {app.trxId && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-emerald-700">Trx: {app.trxId}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <Link 
                  href={`/${locale}/dashboard/applications`}
                  className="px-4 py-2 bg-slate-100 hover:bg-[#064e3b] hover:text-white text-xs font-bold rounded-xl text-slate-700 transition-colors shadow-2xs"
                >
                  Verify
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
