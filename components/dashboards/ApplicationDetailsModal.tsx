import React from 'react';
import { X } from 'lucide-react';

interface ApplicationDetailsModalProps {
  application: any;
  onClose: () => void;
}

export default function ApplicationDetailsModal({ application, onClose }: ApplicationDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-100 shadow-2xl flex flex-col max-h-[90vh] animate-slideIn">
        <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50 rounded-t-2xl">
          <div>
            <h3 className="text-base font-bold text-slate-950 font-serif">
              Application Details
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Applicant information and submitted form data.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">User Name</p>
              <p className="text-sm font-semibold text-slate-800">{application.userName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
              <p className="text-sm font-semibold text-slate-800">{application.userEmail}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Applied Course</p>
              <p className="text-sm font-semibold text-slate-800">{application.courseTitle || application.courseId?.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payment / Funding</p>
              <p className="text-sm font-bold text-[#064e3b]">
                {application.fundingOption === 'scholarship_zakat' ? (
                  <span className="text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-xs border border-amber-200">
                    Scholarship / Zakat Applicant
                  </span>
                ) : (
                  <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-xs border border-emerald-200">
                    Self-Funded (Full Fee)
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date Applied</p>
              <p className="text-sm font-semibold text-slate-800">{new Date(application.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Zakat Assessment Details */}
          {application.hasZakatAssessment && application.zakatAssessment && (
            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-3">
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide border-b border-amber-200 pb-1.5 flex items-center justify-between">
                <span>Zakat & Scholarship Assessment Form</span>
                <span className="text-[10px] font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                  Zakat Requested
                </span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {Object.entries(application.zakatAssessment).map(([key, value]: [string, any]) => (
                  <div key={key} className="bg-white p-2.5 rounded-lg border border-amber-100">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">{key}</span>
                    <span className="font-semibold text-slate-800">{String(value || 'N/A')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {application.customFormData && Array.isArray(application.customFormData) && application.customFormData.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-emerald-900 border-b border-slate-100 pb-2 mb-4">Form Responses</h4>
              <div className="space-y-4">
                {application.customFormData.map((item: any, index: number) => (
                  <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 mb-1">{item.label}</p>
                    <p className="text-sm text-slate-800 font-medium">
                      {Array.isArray(item.value) ? item.value.join(', ') : (item.value as React.ReactNode) || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!application.customFormData || (Array.isArray(application.customFormData) && application.customFormData.length === 0) || Object.keys(application.customFormData).length === 0) && (
            <div>
              <h4 className="text-sm font-bold text-emerald-900 border-b border-slate-100 pb-2 mb-4">Legacy Data</h4>
              <div className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 mb-1">Phone</p>
                  <p className="text-sm text-slate-800 font-medium">{application.phone || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 mb-1">Education</p>
                  <p className="text-sm text-slate-800 font-medium">{application.education || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 mb-1">Address</p>
                  <p className="text-sm text-slate-800 font-medium">{application.address || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
