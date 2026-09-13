'use client';

import { useAuthStore } from '@/lib/store/useAuthStore';
import { useRouter, useParams, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { 
  Menu, LogOut, Bell, Search, User as UserIcon, Globe,
  PieChart, ArrowUpRight, ArrowDownRight, CreditCard, Users, HandCoins, 
  Landmark, ShoppingCart, Calculator, BookOpen, FileSpreadsheet, History, ChevronDown, LayoutDashboard,
  Calendar as CalendarIcon, Video, Download, FileText, Award, Book, Plus, TrendingUp, MessageSquare, Clock,
  Shield, Settings, Sparkles, MessageCircle, CheckCircle2, ChevronRight, BookMarked,
  HeartHandshake, ShieldCheck, GraduationCap, Image as ImageIcon
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { NotificationCenter } from '@/components/NotificationCenter';
import { BrandLogo } from '@/components/BrandLogo';

function SidebarNavContent({ locale, role, status }: { locale: string; role: string | null; status: string | null }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get('tab') || '';
  const activeSubtab = searchParams?.get('subtab') || '';
  const activeModule = searchParams?.get('module') || 'dashboard';
  const activePage = searchParams?.get('page') || 'home';
  const [isPagesExpanded, setIsPagesExpanded] = useState(true);
  const [isAlumniExpanded, setIsAlumniExpanded] = useState(true);

  // Check if a path or tab is currently active
  const isAdminOrSuper = role === 'admin' || role === 'super_admin';

  // Site pages definitions for admin sub-menu
  const sitePages = [
    { id: 'branding', label: '0. Site Identity & Logo', icon: ImageIcon },
    { id: 'home', label: '1. Home Page', icon: LayoutDashboard },
    { id: 'about', label: '2. About Us', icon: FileText },
    { id: 'courses', label: '3. Courses & Programs', icon: BookOpen },
    { id: 'admission', label: '4. Admission Guide', icon: Award },
    { id: 'research', label: '5. Research & Publications', icon: FileSpreadsheet },
    { id: 'faculty', label: '6. Faculty & Scholars', icon: GraduationCap },
    { id: 'library', label: '7. Digital Library', icon: Book },
    { id: 'gallery', label: '8. Photo Gallery', icon: Sparkles },
    { id: 'alumni', label: '9. Alumni Network', icon: Users },
    { id: 'privacy_policy', label: '10. Privacy Policy', icon: Shield },
    { id: 'terms_of_service', label: '11. Terms of Service', icon: Clock },
  ];

  // Alumni portal sub-pages for sidebar sub-menu
  const alumniSubPages = [
    { id: 'profile', label: '1. My Profile & Info', icon: UserIcon, subtab: 'profile' },
    { id: 'card', label: '2. Smart ID Card', icon: Award, subtab: 'card' },
    { id: 'committee', label: '3. Executive Committee', icon: Landmark, subtab: 'committee' },
    { id: 'wings', label: '4. Specialized Wings & Funds', icon: HeartHandshake, subtab: 'wings' },
    { id: 'chapters', label: '5. Global Chapters', icon: Globe, subtab: 'chapters' },
    { id: 'membership', label: '6. Membership & Privileges', icon: ShieldCheck, subtab: 'membership' },
    { id: 'constitution', label: '7. Constitution & Objectives', icon: BookOpen, subtab: 'constitution' },
    { id: 'directory', label: '8. Alumni Directory', icon: Users, subtab: 'directory' },
    { id: 'events', label: '9. Events & Tickets', icon: CalendarIcon, subtab: 'events' },
    { id: 'jobs', label: '10. Career & Job Board', icon: CreditCard, subtab: 'jobs' },
    { id: 'mentorship', label: '11. Mentorship Hub', icon: HandCoins, subtab: 'mentorship' },
    { id: 'alumni_admin', label: '12. Central Alumni Admin', icon: Shield, isDirectTab: true, tab: 'alumni_admin' },
  ];

  // Admin Nav items
  const adminNavItems = [
    { 
      id: 'overview', 
      label: 'Overview Dashboard', 
      href: `/${locale}/dashboard`, 
      icon: LayoutDashboard,
      isActive: pathname === `/${locale}/dashboard` && (!activeTab || activeTab === 'overview')
    },
    { 
      id: 'courses', 
      label: 'Courses & Form Builder', 
      href: `/${locale}/dashboard/courses`, 
      icon: BookOpen,
      isActive: Boolean(pathname?.includes('/courses'))
    },
    { 
      id: 'applications', 
      label: 'Admissions & Payments', 
      href: `/${locale}/dashboard/applications`, 
      icon: CreditCard,
      badge: 'New',
      isActive: Boolean(pathname?.includes('/applications'))
    },
    { 
      id: 'library', 
      label: 'Library & Publications', 
      href: `/${locale}/dashboard/library`, 
      icon: BookMarked,
      isActive: Boolean(pathname?.includes('/library'))
    },
    { 
      id: 'users', 
      label: 'Users & Permissions', 
      href: `/${locale}/dashboard/users`, 
      icon: Users,
      isActive: Boolean(pathname?.includes('/users'))
    },
  ];

  // Student Nav items
  const studentNavItems = [
    { id: 'overview', label: 'Overview Dashboard', href: `/${locale}/dashboard?tab=overview`, icon: LayoutDashboard, isActive: !activeTab || activeTab === 'overview' },
    { id: 'online_classes', label: 'Video & Live Classes', href: `/${locale}/dashboard?tab=online_classes`, icon: Video, isActive: activeTab === 'online_classes', badge: 'Live' },
    { id: 'classes', label: 'Class Routine & Schedule', href: `/${locale}/dashboard?tab=classes`, icon: CalendarIcon, isActive: activeTab === 'classes' },
    { id: 'materials', label: 'Lecture Materials & Sheets', href: `/${locale}/dashboard?tab=materials`, icon: Download, isActive: activeTab === 'materials' },
    { id: 'assignments', label: 'Assignments & Homework', href: `/${locale}/dashboard?tab=assignments`, icon: FileText, isActive: activeTab === 'assignments' },
    { id: 'attendance', label: 'Attendance & Class Log', href: `/${locale}/dashboard?tab=attendance`, icon: Users, isActive: activeTab === 'attendance' },
    { id: 'marks', label: 'Results & Certificates', href: `/${locale}/dashboard?tab=marks`, icon: Award, isActive: activeTab === 'marks' },
    { id: 'library', label: 'Digital Library', href: `/${locale}/dashboard?tab=library`, icon: Book, isActive: activeTab === 'library' },
  ];

  // Teacher Nav items
  const teacherNavItems = [
    { id: 'overview', label: 'Teacher Dashboard', href: `/${locale}/dashboard?tab=overview`, icon: LayoutDashboard, isActive: !activeTab || activeTab === 'overview' },
    { id: 'schedules', label: 'Class Routines & Schedule', href: `/${locale}/dashboard?tab=schedules`, icon: CalendarIcon, isActive: activeTab === 'schedules' },
    { id: 'assignments', label: 'Assignments & Grading', href: `/${locale}/dashboard?tab=assignments`, icon: FileText, isActive: activeTab === 'assignments' },
    { id: 'materials', label: 'Upload Materials', href: `/${locale}/dashboard?tab=materials`, icon: Download, isActive: activeTab === 'materials' },
    { id: 'attendance', label: 'Attendance Register', href: `/${locale}/dashboard?tab=attendance`, icon: Users, isActive: activeTab === 'attendance' },
    { id: 'videos', label: 'Upload Video Lectures', href: `/${locale}/dashboard?tab=videos`, icon: Video, isActive: activeTab === 'videos' },
    { id: 'research', label: 'Research & Thesis Review', href: `/${locale}/dashboard?tab=research`, icon: Award, isActive: activeTab === 'research' },
    { id: 'library', label: 'Digital Library', href: `/${locale}/dashboard?tab=library`, icon: Book, isActive: activeTab === 'library' },
  ];

  // Researcher Nav items
  const researcherNavItems = [
    { id: 'overview', label: 'Research Dashboard', href: `/${locale}/dashboard?tab=overview`, icon: LayoutDashboard, isActive: !activeTab || activeTab === 'overview' },
    { id: 'submissions', label: 'My Research Papers', href: `/${locale}/dashboard?tab=submissions`, icon: FileText, isActive: activeTab === 'submissions' },
    { id: 'submit', label: 'Submit New Paper', href: `/${locale}/dashboard?tab=submit`, icon: Plus, isActive: activeTab === 'submit', badge: 'New' },
    { id: 'live', label: 'Published Journals', href: `/${locale}/dashboard?tab=live`, icon: BookOpen, isActive: activeTab === 'live' },
    { id: 'library', label: 'Reference Library', href: `/${locale}/dashboard?tab=library`, icon: Book, isActive: activeTab === 'library' },
  ];

  // Library Staff Nav items
  const libraryStaffNavItems = [
    { id: 'books', label: 'Book Catalog & Entry', href: `/${locale}/dashboard?tab=books`, icon: Book, isActive: !activeTab || activeTab === 'books' },
    { id: 'loans', label: 'Book Circulation & Loans', href: `/${locale}/dashboard?tab=loans`, icon: Clock, isActive: activeTab === 'loans' },
  ];

  // Alumni Nav items (Sidebar options for Alumni role)
  const alumniNavItems = [
    { 
      id: 'profile', 
      label: '1. My Profile & Settings', 
      href: `/${locale}/dashboard?tab=alumni_portal&subtab=profile`, 
      icon: UserIcon, 
      isActive: (!activeTab || activeTab === 'overview' || activeTab === 'alumni_portal') && (!activeSubtab || activeSubtab === 'profile') 
    },
    { 
      id: 'card', 
      label: '2. Smart ID Card', 
      href: `/${locale}/dashboard?tab=alumni_portal&subtab=card`, 
      icon: Award, 
      isActive: activeTab === 'card' || (activeTab === 'alumni_portal' && activeSubtab === 'card') 
    },
    { 
      id: 'committee', 
      label: '3. Executive Committee', 
      href: `/${locale}/dashboard?tab=alumni_portal&subtab=committee`, 
      icon: Landmark, 
      isActive: activeTab === 'committee' || (activeTab === 'alumni_portal' && (activeSubtab === 'committee' || activeSubtab === 'association')) 
    },
    { 
      id: 'wings', 
      label: '4. Specialized Wings & Funds', 
      href: `/${locale}/dashboard?tab=alumni_portal&subtab=wings`, 
      icon: HeartHandshake, 
      isActive: activeTab === 'wings' || (activeTab === 'alumni_portal' && activeSubtab === 'wings') 
    },
    { 
      id: 'chapters', 
      label: '5. Global Chapters', 
      href: `/${locale}/dashboard?tab=alumni_portal&subtab=chapters`, 
      icon: Globe, 
      isActive: activeTab === 'chapters' || (activeTab === 'alumni_portal' && activeSubtab === 'chapters') 
    },
    { 
      id: 'membership', 
      label: '6. Membership & Privileges', 
      href: `/${locale}/dashboard?tab=alumni_portal&subtab=membership`, 
      icon: ShieldCheck, 
      isActive: activeTab === 'membership' || (activeTab === 'alumni_portal' && activeSubtab === 'membership') 
    },
    { 
      id: 'constitution', 
      label: '7. Constitution & Objectives', 
      href: `/${locale}/dashboard?tab=alumni_portal&subtab=constitution`, 
      icon: BookOpen, 
      isActive: activeTab === 'constitution' || (activeTab === 'alumni_portal' && activeSubtab === 'constitution') 
    },
    { 
      id: 'directory', 
      label: '8. Alumni Directory', 
      href: `/${locale}/dashboard?tab=alumni_portal&subtab=directory`, 
      icon: Users, 
      isActive: activeTab === 'directory' || (activeTab === 'alumni_portal' && activeSubtab === 'directory') 
    },
    { 
      id: 'events', 
      label: '9. Events & Tickets', 
      href: `/${locale}/dashboard?tab=alumni_portal&subtab=events`, 
      icon: CalendarIcon, 
      isActive: activeTab === 'events' || (activeTab === 'alumni_portal' && activeSubtab === 'events') 
    },
    { 
      id: 'jobs', 
      label: '10. Career & Job Board', 
      href: `/${locale}/dashboard?tab=alumni_portal&subtab=jobs`, 
      icon: CreditCard, 
      isActive: activeTab === 'jobs' || (activeTab === 'alumni_portal' && activeSubtab === 'jobs') 
    },
    { 
      id: 'mentorship', 
      label: '11. Mentorship Hub', 
      href: `/${locale}/dashboard?tab=alumni_portal&subtab=mentorship`, 
      icon: HandCoins, 
      isActive: activeTab === 'mentorship' || (activeTab === 'alumni_portal' && activeSubtab === 'mentorship') 
    },
  ];

  // Applicant Nav items
  const applicantNavItems = [
    { id: 'overview', label: 'Application Dashboard', href: `/${locale}/dashboard`, icon: LayoutDashboard, isActive: pathname === `/${locale}/dashboard` },
    { id: 'apply', label: 'Apply for New Course', href: `/${locale}/dashboard/apply`, icon: Plus, isActive: Boolean(pathname?.includes('/apply')), badge: 'Apply' },
    { id: 'profile', label: 'Profile & Information', href: `/${locale}/dashboard/profile`, icon: UserIcon, isActive: Boolean(pathname?.includes('/profile')) },
  ];

  // Guardian Nav items
  const guardianNavItems = [
    { id: 'overview', label: "Student's Progress Overview", href: `/${locale}/dashboard?tab=overview`, icon: LayoutDashboard, isActive: !activeTab || activeTab === 'overview' },
    { id: 'progress', label: 'Academic Progress & Grades', href: `/${locale}/dashboard?tab=progress`, icon: TrendingUp, isActive: activeTab === 'progress' },
    { id: 'comments', label: 'Teacher Feedback & Notes', href: `/${locale}/dashboard?tab=comments`, icon: MessageSquare, isActive: activeTab === 'comments' },
    { id: 'fees', label: 'Fees & Payment Records', href: `/${locale}/dashboard?tab=fees`, icon: CreditCard, isActive: activeTab === 'fees' },
  ];

  // Finance Officer Nav items
  const financeOfficerNavItems = [
    { id: 'dashboard', label: 'Overview Dashboard', href: `/${locale}/dashboard?module=dashboard`, icon: PieChart, isActive: activeModule === 'dashboard' },
    { id: 'income', label: 'Income & Receipts', href: `/${locale}/dashboard?module=income`, icon: ArrowUpRight, isActive: activeModule === 'income' },
    { id: 'expenses', label: 'Expenses & Vouchers', href: `/${locale}/dashboard?module=expenses`, icon: ArrowDownRight, isActive: activeModule === 'expenses' },
    { id: 'payments', label: 'Payments & Cheques', href: `/${locale}/dashboard?module=payments`, icon: CreditCard, isActive: activeModule === 'payments' },
    { id: 'student_accounts', label: 'Student Accounts', href: `/${locale}/dashboard?module=student_accounts`, icon: Users, isActive: activeModule === 'student_accounts' },
    { id: 'salary_honorarium', label: 'Salaries & Honorariums', href: `/${locale}/dashboard?module=salary_honorarium`, icon: HandCoins, isActive: activeModule === 'salary_honorarium' },
    { id: 'cash_bank', label: 'Cash & Bank Balances', href: `/${locale}/dashboard?module=cash_bank`, icon: Landmark, isActive: activeModule === 'cash_bank' },
    { id: 'purchase_suppliers', label: 'Purchases & Suppliers', href: `/${locale}/dashboard?module=purchase_suppliers`, icon: ShoppingCart, isActive: activeModule === 'purchase_suppliers' },
    { id: 'budget', label: 'Budgeting & Planning', href: `/${locale}/dashboard?module=budget`, icon: Calculator, isActive: activeModule === 'budget' },
    { id: 'accounts', label: 'Accounting & Ledgers', href: `/${locale}/dashboard?module=accounts`, icon: BookOpen, isActive: activeModule === 'accounts' },
    { id: 'reports', label: 'Financial Reports', href: `/${locale}/dashboard?module=reports`, icon: FileSpreadsheet, isActive: activeModule === 'reports' },
    { id: 'audit_log', label: 'Audit Trail Logs', href: `/${locale}/dashboard?module=audit_log`, icon: History, isActive: activeModule === 'audit_log' },
  ];

  if (isAdminOrSuper) {
    return (
      <nav className="space-y-1.5 py-1">
        {/* Main Admin Navigation Items */}
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs sm:text-[13px] transition-all font-sans ${
                isActive
                  ? 'bg-white text-emerald-950 font-extrabold shadow-sm'
                  : 'text-emerald-100/80 hover:bg-emerald-800/40 hover:text-white font-semibold'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-950' : 'text-emerald-300'}`} />
              <span className="truncate">{item.label}</span>
              {item.badge && (
                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-emerald-100 text-emerald-900' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Alumni Portal Parent Group with Collapsible Sub-menu */}
        <div className="pt-2 pb-1 border-t border-emerald-800/50 mt-2">
          <button
            type="button"
            onClick={() => setIsAlumniExpanded(!isAlumniExpanded)}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'alumni_portal' || activeTab === 'alumni_admin'
                ? 'text-amber-300 bg-emerald-800/50'
                : 'text-amber-300 hover:text-white hover:bg-emerald-800/30'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Alumni Portal & Wings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">12 Modules</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAlumniExpanded ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Sub-menu of all 8 alumni sub-pages */}
          {isAlumniExpanded && (
            <div className="space-y-1 pl-3 pt-1.5 pr-1 border-l-2 border-emerald-700/60 ml-3">
              {alumniSubPages.map((sub) => {
                const isSubActive = sub.isDirectTab 
                  ? activeTab === sub.tab 
                  : (activeTab === 'alumni_portal' && (activeSubtab === sub.subtab || (!activeSubtab && sub.subtab === 'profile')));
                const SubIcon = sub.icon;
                const subHref = sub.isDirectTab 
                  ? `/${locale}/dashboard?tab=${sub.tab}` 
                  : `/${locale}/dashboard?tab=alumni_portal&subtab=${sub.subtab}`;

                return (
                  <Link
                    key={sub.id}
                    href={subHref}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all font-sans ${
                      isSubActive
                        ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                        : 'text-emerald-100/70 hover:bg-emerald-800/50 hover:text-white font-medium'
                    }`}
                  >
                    <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-slate-950' : 'text-emerald-300'}`} />
                    <span className="truncate">{sub.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Page Content Editor Parent Group with Collapsible Sub-menu */}
        <div className="pt-2 pb-1 border-t border-emerald-800/50 mt-2">
          <button
            type="button"
            onClick={() => setIsPagesExpanded(!isPagesExpanded)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-amber-300 hover:text-white hover:bg-emerald-800/30 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-amber-300" />
              <span>Page Content Editor</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300">{sitePages.length} Pages</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isPagesExpanded ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Sub-menu of site pages */}
          {isPagesExpanded && (
            <div className="space-y-1 pl-3 pt-1.5 pr-1 border-l-2 border-emerald-700/60 ml-3">
              {sitePages.map((page) => {
                const isPageActive = activeTab === 'content_manager' && activePage === page.id;
                const PageIcon = page.icon;

                return (
                  <Link
                    key={page.id}
                    href={`/${locale}/dashboard?tab=content_manager&page=${page.id}`}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all font-sans ${
                      isPageActive
                        ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                        : 'text-emerald-100/70 hover:bg-emerald-800/50 hover:text-white font-medium'
                    }`}
                  >
                    <PageIcon className={`w-3.5 h-3.5 shrink-0 ${isPageActive ? 'text-slate-950' : 'text-emerald-300'}`} />
                    <span className="truncate">{page.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    );
  }


  // Choose the active list based on other roles
  let currentNavItems = studentNavItems;
  if (role === 'alumni') currentNavItems = alumniNavItems;
  else if (role === 'teacher' || role === 'academic_officer') currentNavItems = teacherNavItems;
  else if (role === 'researcher') currentNavItems = researcherNavItems;
  else if (role === 'library_staff') currentNavItems = libraryStaffNavItems;
  else if (role === 'applicant' || role === 'guest') currentNavItems = applicantNavItems;
  else if (role === 'guardian') currentNavItems = guardianNavItems;
  else if (role === 'finance_officer') currentNavItems = financeOfficerNavItems;

  return (
    <nav className="space-y-1.5 py-1">
      {currentNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.isActive;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-xs sm:text-[13px] transition-all font-sans ${
              isActive
                ? 'bg-white text-emerald-950 font-extrabold shadow-sm'
                : 'text-emerald-100/80 hover:bg-emerald-800/40 hover:text-white font-semibold'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-950' : 'text-emerald-300'}`} />
            <span className="truncate">{item.label}</span>
            {item.badge && (
              <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isActive ? 'bg-emerald-100 text-emerald-900' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, role, status, isLoading } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as string) || 'bn';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const switchDashboardLocale = (newLocale: string) => {
    if (!pathname) return `/${newLocale}/dashboard`;
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && ['en', 'bn', 'ar'].includes(segments[0])) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    const newPath = `/${segments.join('/')}`;
    const queryString = typeof window !== 'undefined' ? window.location.search : '';
    return queryString ? `${newPath}${queryString}` : newPath;
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(`/${locale}/login`);
    } else if (!isLoading && user && status === 'pending') {
      const currentPath = window.location.pathname;
      const allowedPaths = [
        `/${locale}/dashboard`, 
        `/${locale}/dashboard/profile`,
        `/${locale}/dashboard/apply`
      ];
      if (!allowedPaths.includes(currentPath)) {
        router.push(`/${locale}/dashboard`);
      }
    }
  }, [user, isLoading, router, locale, status]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.push(`/${locale}`);
  };

  // Get user role display label
  const getRoleDisplayName = (r: string | null) => {
    if (r === 'super_admin' || r === 'admin') return 'Chief Admin';
    if (r === 'alumni') return 'Alumni Scholar';
    if (r === 'teacher' || r === 'academic_officer') return 'Teacher / Academic Officer';
    if (r === 'student') return 'Student';
    if (r === 'researcher') return 'Researcher / Scholar';
    if (r === 'library_staff') return 'Librarian';
    if (r === 'finance_officer') return 'Finance Officer';
    if (r === 'guardian') return 'Guardian';
    return 'User';
  };

  // Get user initial
  const getUserInitial = () => {
    if (user?.displayName) return user.displayName[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return 'N';
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      
      {/* Main Left Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 rtl:left-auto rtl:right-0 bg-[#064e3b] w-72 text-white transform transition-transform duration-200 ease-in-out z-30 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'
        } md:translate-x-0 rtl:md:translate-x-0 md:static md:inset-0 md:flex md:flex-col shadow-xl`}
      >
        
        {/* Brand Top Header with Dynamic Brand Logo */}
        <div className="p-6 pb-5">
          <BrandLogo variant="sidebar" locale={locale} />
        </div>
        
        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-thin scrollbar-thumb-emerald-800">
          <Suspense fallback={<div className="p-3 text-xs text-emerald-300">লোড হচ্ছে...</div>}>
            <SidebarNavContent locale={locale} role={role} status={status} />
          </Suspense>
        </div>

        {/* Bottom User Profile Section with Initial & Green Dot */}
        <div className="p-4 mt-auto border-t border-emerald-800/40 bg-[#043d2e]/80">
          
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-black/20 border border-emerald-800/60 mb-2.5">
            {/* Dark Circle with User Initial */}
            <div className="w-10 h-10 rounded-full bg-black/60 border border-emerald-700/60 flex items-center justify-center font-extrabold text-white text-sm shrink-0 font-serif shadow-xs">
              {getUserInitial()}
            </div>
            
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-bold truncate">
                {getRoleDisplayName(role)}
              </p>
              <p className="text-emerald-300/80 text-[11px] truncate font-mono">
                {user.email || 'user@institute.org'}
              </p>
            </div>

            {/* Glowing Active Green Dot */}
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full ring-4 ring-emerald-400/20 shrink-0" title="Active Online" />
          </div>

          <div className="flex items-center gap-2">
            <Link 
              href={`/${locale}`}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-bold rounded-xl text-emerald-100 bg-emerald-800/40 hover:bg-emerald-800 hover:text-white transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              Main Website
            </Link>
            
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center p-2 text-emerald-200 bg-emerald-800/40 hover:bg-red-900/60 hover:text-red-200 rounded-xl transition-colors"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </aside>

      {/* Main Content View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 z-20 shadow-2xs">
          
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden text-slate-600 hover:text-slate-900 focus:outline-none mr-3 rtl:mr-0 rtl:ml-3 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            
            {/* Language Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-[10px] font-bold items-center border border-slate-200/80">
              <Globe className="w-3.5 h-3.5 ml-2 mr-1 text-emerald-800 shrink-0 hidden sm:inline" />
              <Link href={switchDashboardLocale('bn')} className={`px-2.5 py-1 rounded-lg transition-all ${locale === 'bn' ? 'bg-white shadow-xs text-emerald-900 font-extrabold' : 'text-slate-500 hover:text-emerald-700'}`}>বাংলা</Link>
              <Link href={switchDashboardLocale('en')} className={`px-2.5 py-1 rounded-lg transition-all ${locale === 'en' ? 'bg-white shadow-xs text-emerald-900 font-extrabold' : 'text-slate-500 hover:text-emerald-700'}`}>EN</Link>
              <Link href={switchDashboardLocale('ar')} className={`px-2.5 py-1 rounded-lg transition-all font-arabic ${locale === 'ar' ? 'bg-white shadow-xs text-emerald-900 font-extrabold' : 'text-slate-500 hover:text-emerald-700'}`}>العربية</Link>
            </div>

            {/* Real-time Notification Center */}
            <NotificationCenter />

            {/* User Profile avatar */}
            <Link 
              href={`/${locale}/dashboard/profile`}
              className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-2"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                {getUserInitial()}
              </div>
            </Link>

          </div>
        </header>

        {/* Dynamic Main Body Section */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        
        {/* Floating WhatsApp Action Button */}
        <a
          href="https://wa.me/8801700000000"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
          title="সরাসরি হোয়াটসঅ্যাপ সাপোর্ট"
        >
          <MessageCircle className="w-6 h-6 fill-white stroke-none" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-bold pl-0 group-hover:pl-2">
            হেল্পলাইন
          </span>
        </a>

      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

    </div>
  );
}
