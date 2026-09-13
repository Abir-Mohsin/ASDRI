/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { collection, query, orderBy, getDocs, doc, updateDoc, addDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChevronLeft, CheckCircle, XCircle, Clock, Eye, Search, HeartHandshake, FileText, ShieldAlert, X } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ApplicationDetailsModal from '@/components/dashboards/ApplicationDetailsModal';
import AdmissionFormPdfModal from '@/components/dashboards/AdmissionFormPdfModal';

export default function AdminApplicationsPage() {
  const { role } = useAuthStore();
  const params = useParams();
  const locale = params?.locale as string;
  
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected, zakat
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [pdfApp, setPdfApp] = useState<any | null>(null);
  const [zakatReviewApp, setZakatReviewApp] = useState<any | null>(null);

  // Keep track of selected roles to assign upon approval
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});

  const fetchApplications = async () => {
    if (role !== 'admin' && role !== 'super_admin') return;
    
    try {
      const q = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const appsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(appsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [role]);

  const handleUpdateStatus = async (applicationId: string, newStatus: string, userId?: string, extraFields = {}) => {
    try {
      const assignedRole = selectedRoles[applicationId] || 'student';
      const appRef = doc(db, 'applications', applicationId);
      
      const app = applications.find(a => a.id === applicationId);

      const updatePayload: any = {
        status: newStatus,
        ...extraFields
      };

      if (newStatus === 'approved') {
        updatePayload.assignedRole = assignedRole;
      }

      await updateDoc(appRef, updatePayload);
      
      if (newStatus === 'approved' && userId) {
        const userRef = doc(db, 'users', userId);
        
        let resolvedName = app?.userName || 'Unknown';
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            resolvedName = userData.name || userData.displayName || resolvedName;
          }
        } catch (e) {
          console.error("Error fetching fallback name on approval:", e);
        }

        await setDoc(userRef, { 
          role: assignedRole,
          status: 'approved',
          name: resolvedName,
          email: app?.userEmail || '',
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        if (app && app.courseId) {
          await addDoc(collection(db, 'enrollments'), {
            userId: userId,
            courseId: app.courseId,
            enrolledAt: new Date().toISOString(),
            status: 'active',
            studentName: resolvedName,
            studentEmail: app.userEmail || ''
          });
        }
      }
      
      fetchApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update status.');
    }
  };

  const handleApproveZakatFund = async (fundType: 'zakat_fund' | 'general_fund') => {
    if (!zakatReviewApp) return;
    
    const zakatFundStatus = fundType === 'zakat_fund' ? 'approved_zakat' : 'approved_general';
    await handleUpdateStatus(zakatReviewApp.id, 'approved', zakatReviewApp.userId, {
      zakatFundStatus,
      grantedFundType: fundType,
      approvedZakatBy: role,
      zakatApprovedAt: new Date().toISOString()
    });

    setZakatReviewApp(null);
    alert(fundType === 'zakat_fund' 
      ? 'যাকাত ফান্ড থেকে ১০০% স্কলারশিপ অনুমোদন সম্পন্ন হয়েছে!' 
      : 'ইনস্টিটিউট সাধারণ স্কলারশিপ ফান্ড থেকে আবেদন অনুমোদন করা হয়েছে!');
  };

  if (role !== 'admin' && role !== 'super_admin') {
    return <div className="p-8 text-center">Unauthorized access</div>;
  }

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.courseId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'zakat') {
      return matchesSearch && (app.zakatAssessment || app.zakatFundStatus);
    }
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/${locale}/dashboard`} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-[#064e3b] transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manage Admissions &amp; Zakat Fund Requests</h2>
          <p className="text-slate-500 text-sm">Review student applications, fee structures, and zakat assessment forms.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or program..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#064e3b] outline-none text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'zakat', label: '★ Zakat Requests' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                  filterStatus === tab.id 
                    ? 'bg-[#064e3b] text-amber-300 border-[#064e3b]' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Applicant</th>
                <th className="px-4 py-3 font-semibold">Program</th>
                <th className="px-4 py-3 font-semibold">Zakat / Scholarship</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Assign Role</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading applications...</td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">No applications found.</td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900">{app.userName}</div>
                      <div className="text-xs text-slate-500">{app.userEmail}</div>
                      <div className="text-xs text-slate-500">{app.phone}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-[#064e3b] uppercase text-[10px] bg-emerald-50 px-2 py-1 rounded inline-block">
                        {app.courseId?.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 truncate max-w-[180px]">{app.education}</div>
                    </td>

                    {/* Zakat Assessment Badge */}
                    <td className="px-4 py-4">
                      {app.zakatFundStatus === 'pending_review' ? (
                        <button
                          onClick={() => setZakatReviewApp(app)}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md text-xs font-bold border border-amber-300 flex items-center gap-1 animate-pulse"
                        >
                          <HeartHandshake className="w-3.5 h-3.5 text-amber-700" /> Review Request
                        </button>
                      ) : app.zakatFundStatus === 'approved_zakat' ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 block w-fit">
                          Zakat Fund Approved
                        </span>
                      ) : app.zakatFundStatus === 'approved_general' ? (
                        <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-300 block w-fit">
                          General Fund Approved
                        </span>
                      ) : app.zakatAssessment ? (
                        <button
                          onClick={() => setZakatReviewApp(app)}
                          className="text-xs text-slate-500 hover:underline flex items-center gap-1"
                        >
                          <HeartHandshake className="w-3.5 h-3.5" /> View Details
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Regular Fee</span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {app.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-800 rounded-md uppercase">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {app.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md uppercase">
                          <CheckCircle className="w-3 h-3" /> Approved
                        </span>
                      )}
                      {app.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 bg-red-100 text-red-800 rounded-md uppercase">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {app.status === 'pending' ? (
                        <select
                          value={selectedRoles[app.id] || 'student'}
                          onChange={(e) => setSelectedRoles(prev => ({ ...prev, [app.id]: e.target.value }))}
                          className="border border-slate-300 rounded text-xs px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white font-medium text-slate-800"
                        >
                          <option value="student">Student / শিক্ষার্থী</option>
                          <option value="applicant">Applicant / আবেদনকারী</option>
                          <option value="guest">Guest / ভিজিটর</option>
                          <option value="teacher">Teacher / শিক্ষক</option>
                          <option value="guardian">Guardian / অভিভাবক</option>
                          <option value="researcher">Researcher / গবেষক</option>
                          <option value="academic_officer">Academic Officer</option>
                        </select>
                      ) : (
                        <span className="text-xs text-slate-600 font-semibold capitalize bg-slate-100 px-2.5 py-1.5 rounded-md border border-slate-200 inline-block">
                          {app.assignedRole || 'student'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setPdfApp(app)}
                        className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors"
                        title="Download PDF Form"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                        title="View Form Answers"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {app.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleUpdateStatus(app.id, 'approved', app.userId)}
                            className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(app.id, 'rejected', app.userId)}
                            className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Standard Details Modal */}
      {selectedApp && (
        <ApplicationDetailsModal 
          application={selectedApp} 
          onClose={() => setSelectedApp(null)} 
        />
      )}

      {/* PDF Admission Form Modal */}
      {pdfApp && (
        <AdmissionFormPdfModal
          application={pdfApp}
          onClose={() => setPdfApp(null)}
        />
      )}

      {/* Admin Zakat Assessment Review Modal */}
      {zakatReviewApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 text-xs border border-slate-200 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-amber-600" /> Zakat Assessment Evaluation
                </h3>
                <p className="text-slate-500 text-[11px]">Applicant: {zakatReviewApp.userName} ({zakatReviewApp.userEmail})</p>
              </div>
              <button onClick={() => setZakatReviewApp(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Monthly Household Income</span>
                  <span className="font-bold text-slate-900">৳ {zakatReviewApp.zakatAssessment?.familyIncome || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Dependent Members</span>
                  <span className="font-bold text-slate-900">{zakatReviewApp.zakatAssessment?.dependents || 'N/A'} Persons</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Housing Condition</span>
                  <span className="font-semibold text-slate-800">{zakatReviewApp.zakatAssessment?.housingStatus || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">Reference Contact</span>
                  <span className="font-semibold text-slate-800">{zakatReviewApp.zakatAssessment?.referenceContact || 'N/A'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-400 font-bold block text-[10px] mb-1">Reason for Application:</span>
                <p className="text-slate-800 bg-white p-2.5 rounded border border-slate-200 italic leading-relaxed text-[11px]">
                  "{zakatReviewApp.zakatAssessment?.reason}"
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <p className="font-bold text-slate-800">Admin Decision Options:</p>
              
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => handleApproveZakatFund('zakat_fund')}
                  className="w-full py-2.5 bg-emerald-900 hover:bg-emerald-950 text-amber-300 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle className="w-4 h-4 text-amber-400" /> 1. Approve 100% Scholarship from Zakat Fund
                </button>

                <button
                  onClick={() => handleApproveZakatFund('general_fund')}
                  className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-blue-200 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle className="w-4 h-4 text-blue-400" /> 2. Approve Scholarship from General Institute Fund
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
