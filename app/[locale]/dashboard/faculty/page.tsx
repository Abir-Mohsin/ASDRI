'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { FacultyManager } from '@/components/dashboards/FacultyManager';
import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

function FacultyPageInner() {
  const params = useParams();
  const locale = (params?.locale as string) || 'bn';
  const { role, isLoading } = useAuthStore();

  const isAuthorized = role === 'admin' || role === 'super_admin';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500">Loading Faculty & Scholars module...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xs max-w-xl mx-auto text-center my-12">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800 font-serif mb-2">
          Unauthorized Access
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Only Administrator or Super Administrator accounts are authorized to access this section.
        </p>
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#064e3b] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-emerald-900 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-2">
        <Link
          href={`/${locale}/dashboard`}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-all shadow-2xs hover:bg-slate-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Dashboard</span>
          <span>/</span>
          <span className="font-bold text-emerald-900">Faculty & Scholars Management</span>
        </div>
      </div>

      <FacultyManager locale={locale} />
    </div>
  );
}

export default function FacultyDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-3 border-[#064e3b] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <FacultyPageInner />
    </Suspense>
  );
}
