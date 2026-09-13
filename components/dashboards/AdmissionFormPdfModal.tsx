/* eslint-disable */
'use client';

import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle, ShieldCheck, Award } from 'lucide-react';
import { COURSES } from '@/lib/constants/courses';

interface AdmissionFormPdfModalProps {
  application: any;
  onClose: () => void;
}

export default function AdmissionFormPdfModal({ application, onClose }: AdmissionFormPdfModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const courseInfo = COURSES.find(c => c.id === application.courseId) || {
    title: application.courseId?.replace(/_/g, ' ') || 'Special Islamic Studies Program',
    duration: '1 Year',
    type: 'Full-time',
    eligibility: 'General Qualification / ন্যূনতম যোগ্যতা',
    fees: { admissionFee: 1000, tuitionFee: 5000, accommodationFee: 0, totalFee: 6000, isFree: false }
  };

  const handlePrint = () => {
    window.print();
  };

  // Resolve custom form fields or default
  const formDataMap: Record<string, any> = {};
  if (Array.isArray(application.customFormData)) {
    application.customFormData.forEach((item: any) => {
      formDataMap[item.label] = Array.isArray(item.value) ? item.value.join(', ') : item.value;
    });
  }

  const phone = application.phone || formDataMap['মোবাইল নম্বর / Phone'] || formDataMap['Phone'] || 'N/A';
  const fatherName = formDataMap['পিতার নাম / Father\'s Name'] || formDataMap['Pita'] || 'N/A';
  const education = application.education || formDataMap['সর্বশেষ শিক্ষাগত যোগ্যতা / Education'] || formDataMap['Education'] || 'N/A';
  const address = application.address || formDataMap['বর্তমান ঠিকানা / Address'] || formDataMap['Address'] || 'N/A';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-admission-form, #printable-admission-form * {
            visibility: visible;
          }
          #printable-admission-form {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div className="p-4 bg-emerald-950 text-white flex justify-between items-center border-b border-emerald-900 no-print shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-serif text-amber-100">Official Admission Form PDF</h3>
              <p className="text-[11px] text-emerald-300">Al-Azhar Standard Institutional Design • Ready for Download & Printing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-emerald-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body - Designed as a formal Al-Azhar Style Academic Document */}
        <div className="p-8 overflow-y-auto bg-slate-50/50 space-y-6 text-slate-800" id="printable-admission-form" ref={printRef}>
          <div className="bg-white p-8 sm:p-10 border-2 border-emerald-900 rounded-xl shadow-xs relative">
            
            {/* Header / Watermark border */}
            <div className="border-b-2 border-amber-500 pb-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-900 text-amber-400 flex items-center justify-center font-serif text-2xl font-black border-2 border-amber-400 shadow-md">
                    AS
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-amber-700 tracking-widest uppercase">بسم الله الرحمن الرحيم</p>
                    <h1 className="text-xl sm:text-2xl font-black text-emerald-950 font-serif leading-tight">
                      AS-SUNNAH DAWAH &amp; RESEARCH INSTITUTE
                    </h1>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউট</p>
                    <p className="text-[10px] text-slate-500">Dhaka, Bangladesh • Affiliated Educational &amp; Research Wing</p>
                  </div>
                </div>

                <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-center min-w-[130px]">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Form Serial No.</p>
                  <p className="text-xs font-extrabold text-emerald-900 font-mono">ASDRI-{application.id?.slice(0, 8).toUpperCase() || '2026-99'}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Date</p>
                  <p className="text-[11px] font-bold text-slate-700">
                    {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Title Banner */}
              <div className="mt-6 bg-emerald-900 text-white text-center py-2.5 rounded-md border-y-2 border-amber-400 shadow-xs">
                <h2 className="text-sm sm:text-base font-bold font-serif uppercase tracking-widest text-amber-300">
                  OFFICIAL STUDENT ADMISSION FORM • ভর্তি ফরম
                </h2>
              </div>
            </div>

            {/* Applicant Profile & Program Box */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="md:col-span-3 space-y-3">
                <div className="bg-emerald-50/60 p-4 rounded-lg border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Applied Academic Program / বিষয়</p>
                  <h3 className="text-lg font-black text-emerald-950 font-serif leading-snug">{courseInfo.title}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-600 font-medium">
                    <span><strong>Duration:</strong> {courseInfo.duration}</span>
                    <span>•</span>
                    <span><strong>Program Type:</strong> {courseInfo.type}</span>
                    <span>•</span>
                    <span><strong>Academic Year:</strong> 2026-2027</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Applicant Name</span>
                    <span className="font-bold text-slate-900 text-sm">{application.userName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Contact Email</span>
                    <span className="font-semibold text-slate-800">{application.userEmail || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Mobile Number</span>
                    <span className="font-semibold text-slate-800">{phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Father's / Guardian's Name</span>
                    <span className="font-semibold text-slate-800">{fatherName}</span>
                  </div>
                </div>
              </div>

              {/* Passport Photo Frame */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-28 h-36 border-2 border-dashed border-slate-300 rounded-md bg-slate-50 flex flex-col items-center justify-center text-center p-2 text-slate-400">
                  <span className="text-[10px] font-bold">Passport Size</span>
                  <span className="text-[9px]">Photograph</span>
                  <span className="text-[8px] text-slate-300 mt-1">(35mm x 45mm)</span>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 font-semibold">Attested Photo</span>
              </div>
            </div>

            {/* Academic & Address Information Table */}
            <div className="mb-8 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 border-b border-emerald-200 pb-1">
                Academic Background &amp; Address / শিক্ষাগত যোগ্যতা ও ঠিকানা
              </h4>
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 bg-slate-50 font-bold text-slate-600 w-1/3 border-r border-slate-200">Education Qualification (সর্বশেষ শিক্ষা)</td>
                    <td className="p-2.5 text-slate-800 font-semibold">{education}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 bg-slate-50 font-bold text-slate-600 border-r border-slate-200">Present Address (বর্তমান ঠিকানা)</td>
                    <td className="p-2.5 text-slate-800">{address}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 bg-slate-50 font-bold text-slate-600 border-r border-slate-200">Eligibility Status</td>
                    <td className="p-2.5 text-emerald-800 font-semibold">{courseInfo.eligibility}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Admission Fee & Scholarship / Zakat Approval Section */}
            <div className="mb-8 border border-slate-200 rounded-lg p-5 bg-emerald-50/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 border-b border-emerald-200 pb-2 mb-3 flex items-center justify-between">
                <span>Fee Breakdown &amp; Financial Assessment / ফি ও স্কলারশিপ অনুমোদন</span>
                {application.zakatFundStatus === 'approved_zakat' ? (
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 font-extrabold">
                    Zakat Fund Granted • যাকাত ফান্ড অনুমোদিত
                  </span>
                ) : application.zakatFundStatus === 'approved_general' ? (
                  <span className="text-[10px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded border border-blue-300 font-extrabold">
                    General Fund Granted • সাধারণ স্কলারশিপ অনুমোদিত
                  </span>
                ) : courseInfo.fees?.isFree ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300 font-extrabold">
                    Free Program • সম্পূর্ণ ফ্রি
                  </span>
                ) : null}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-4">
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block">Admission Fee</span>
                  <span className="text-xs font-bold text-slate-800">৳ {courseInfo.fees?.admissionFee || 0}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block">Tuition Fee</span>
                  <span className="text-xs font-bold text-slate-800">৳ {courseInfo.fees?.tuitionFee || 0}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block">Accommodation Fee</span>
                  <span className="text-xs font-bold text-slate-800">৳ {courseInfo.fees?.accommodationFee || 0}</span>
                </div>
                <div className="bg-emerald-900 text-white p-2.5 rounded border border-emerald-950">
                  <span className="text-[10px] font-bold text-amber-300 block">Total Payable</span>
                  <span className="text-xs font-extrabold text-amber-400">
                    {courseInfo.fees?.isFree || application.zakatFundStatus?.startsWith('approved') ? '৳ 0 (Waived)' : `৳ ${courseInfo.fees?.totalFee || 0}`}
                  </span>
                </div>
              </div>

              {/* Zakat Assessment Form summary if submitted */}
              {application.zakatAssessment && (
                <div className="bg-white p-3.5 rounded-lg border border-amber-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-amber-950">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" /> Submitted Zakat Assessment Details
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      Family Income: <strong>৳ {application.zakatAssessment.familyIncome}</strong> / month
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed italic bg-slate-50 p-2 rounded border border-slate-100">
                    "{application.zakatAssessment.reason}"
                  </p>
                  {application.grantedFundType && (
                    <div className="text-[11px] font-bold text-emerald-900 pt-1 border-t border-slate-100">
                      Approved Decision: <span className="text-emerald-700">{application.grantedFundType === 'zakat_fund' ? '100% Granted from Zakat Assistance Fund (যাকাত ফান্ড)' : 'Granted from Institution Waiver Fund (সাধারণ স্কলারশিপ ফান্ড)'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Declaration */}
            <div className="mb-10 text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200 text-justify">
              <p className="font-bold text-slate-900 mb-1">অঙ্গীকারনামা (Applicant Declaration):</p>
              আমি এই মর্মে অঙ্গীকার করছি যে, উপরে প্রদত্ত সমস্ত তথ্য সত্য ও নির্ভুল। আমি আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউটের সমস্ত নিয়ম-শৃঙ্খলা মেনে চলতে বাধ্য থাকব। প্রতিষ্ঠানের নীতি-বিরোধী কোনো কর্মকাণ্ডে লিপ্ত হব না।
            </div>

            {/* Official Signatures Section */}
            <div className="pt-12 grid grid-cols-3 gap-6 text-center text-xs">
              <div>
                <div className="border-b border-slate-400 pb-1 mb-1 min-h-[30px] flex items-end justify-center font-serif font-bold text-slate-800">
                  {application.userName}
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Student Signature</p>
              </div>

              <div>
                <div className="border-b border-slate-400 pb-1 mb-1 min-h-[30px] flex items-end justify-center text-emerald-800 font-bold">
                  {application.status === 'approved' ? 'VERIFIED & SEALED' : 'UNDER REVIEW'}
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Academic Officer / Registrar</p>
              </div>

              <div>
                <div className="border-b border-slate-400 pb-1 mb-1 min-h-[30px] flex items-end justify-center font-bold font-serif text-emerald-950">
                  Prof. Dr. Director
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Executive Director / Principal</p>
              </div>
            </div>

            {/* Footer watermark */}
            <div className="mt-10 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 flex justify-between items-center">
              <span>As-Sunnah Dawah &amp; Research Institute • Official Records</span>
              <span>Generated on: {new Date().toLocaleString()}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
