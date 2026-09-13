'use client';

import { Suspense } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { ApplicantDashboard } from '@/components/dashboards/ApplicantDashboard';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { StudentDashboard } from '@/components/dashboards/StudentDashboard';
import { TeacherDashboard } from '@/components/dashboards/TeacherDashboard';
import { GuardianDashboard } from '@/components/dashboards/GuardianDashboard';
import { ResearcherDashboard } from '@/components/dashboards/ResearcherDashboard';
import { LibraryStaffDashboard } from '@/components/dashboards/LibraryStaffDashboard';
import { FinanceOfficerDashboard } from '@/components/dashboards/FinanceOfficerDashboard';
import { AlumniDashboard } from '@/components/dashboards/AlumniDashboard';
import { AlumniAdminManager } from '@/components/dashboards/AlumniAdminManager';
import { BookOpen, Calendar, Users, TrendingUp } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function DashboardContent() {
  const { role, status, user } = useAuthStore();
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab');

  if (tab === 'alumni_portal') {
    return <AlumniDashboard user={user} />;
  }

  if (tab === 'alumni_admin') {
    return <AlumniAdminManager />;
  }

  if (status === 'pending' && role && role !== 'applicant' && role !== 'guest' && role !== 'alumni') {
    return (
      <div className="space-y-6 flex items-center justify-center min-h-[50vh]">
        <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-center max-w-md w-full">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Approval Pending</h2>
          <p className="text-slate-500 text-sm mb-6">
            You are currently logged in as <strong>{user?.email}</strong>.<br/>
            Your request for the role <strong>{role || 'student'}</strong> is currently under review by the administration. You will be granted access once approved.
          </p>
          <button className="w-full px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-200 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  if (role === 'admin' || role === 'super_admin') {
    return <AdminDashboard />;
  }
  
  if (role === 'alumni') {
    return <AlumniDashboard user={user} />;
  }

  if (role === 'teacher' || role === 'academic_officer') {
    return <TeacherDashboard />;
  }
  
  if (role === 'applicant' || role === 'guest' || !role) {
    return <ApplicantDashboard />;
  }
  
  if (role === 'student') {
    return <StudentDashboard />;
  }

  if (role === 'guardian') {
    return <GuardianDashboard />;
  }

  if (role === 'researcher') {
    return <ResearcherDashboard />;
  }

  if (role === 'library_staff') {
    return <LibraryStaffDashboard />;
  }

  if (role === 'finance_officer') {
    return <FinanceOfficerDashboard />;
  }

  return (
    <div className="space-y-6 flex items-center justify-center min-h-[50vh]">
      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-center max-w-md w-full">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Welcome to ASDRI</h2>
        <p className="text-slate-500 text-sm mb-6">
          You are currently logged in as {user?.email}. Your account role is pending assignment or you are a guest.
        </p>
        <button className="w-full px-4 py-2 bg-slate-100 text-slate-600 text-sm font-bold rounded-lg hover:bg-slate-200 transition-colors">
          Contact Support
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-sm">ড্যাশবোর্ড লোড হচ্ছে...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
