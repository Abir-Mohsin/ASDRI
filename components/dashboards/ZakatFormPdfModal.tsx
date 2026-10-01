/* eslint-disable */
'use client';

import React, { useRef } from 'react';
import { X, Printer, HeartHandshake, ShieldCheck, UserCheck, DollarSign, AlertCircle, FileCheck, CheckCircle2 } from 'lucide-react';
import { COURSES } from '@/lib/constants/courses';
import { ZAKAT_UNDERTAKING_TEXT, ZAKAT_WARNING_TEXT } from '@/lib/constants/zakatFormTemplate';

interface ZakatFormPdfModalProps {
  application: any;
  onClose: () => void;
}

export default function ZakatFormPdfModal({ application, onClose }: ZakatFormPdfModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const courseInfo = COURSES.find(c => c.id === application.courseId) || {
    title: application.courseTitle || application.courseId?.replace(/_/g, ' ') || 'Special Islamic Studies Program',
    duration: '1 Year',
    type: 'Full-time',
    fees: { admissionFee: 1000, tuitionFee: 5000, accommodationFee: 0, totalFee: 6000, isFree: false }
  };

  const handlePrint = () => {
    window.print();
  };

  const zakat = application.zakatAssessment || {};

  // Resolve custom form fields or default
  const formDataMap: Record<string, any> = {};
  if (Array.isArray(application.customFormData)) {
    application.customFormData.forEach((item: any) => {
      formDataMap[item.label] = Array.isArray(item.value) ? item.value.join(', ') : item.value;
    });
  }

  const phone = application.phone || formDataMap['মোবাইল নম্বর / Phone'] || formDataMap['Phone'] || 'N/A';
  const fatherName = formDataMap['পিতার নাম / Father\'s Name'] || formDataMap['Pita'] || 'N/A';
  const address = zakat.permanent_address || application.address || formDataMap['বর্তমান ঠিকানা / Address'] || formDataMap['Address'] || 'N/A';

  // Format currency numbers safely
  const formatTaka = (amount: any) => {
    if (amount === undefined || amount === null || amount === '') return '০';
    const num = Number(amount);
    return isNaN(num) ? String(amount) : num.toLocaleString('bn-BD');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-zakat-form, #printable-zakat-form * {
            visibility: visible;
          }
          #printable-zakat-form {
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
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-serif text-amber-100">Official Zakat Assessment Form PDF • যাকাত মূল্যায়ন ফরম</h3>
              <p className="text-[11px] text-emerald-300">Al-Azhar Standard Institutional Design • Ready for Download &amp; Printing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-emerald-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body - Al-Azhar Institutional Academic & Shar'i Document */}
        <div className="p-8 overflow-y-auto bg-slate-50/50 space-y-6 text-slate-800" id="printable-zakat-form" ref={printRef}>
          <div className="bg-white p-8 sm:p-10 border-2 border-emerald-900 rounded-xl shadow-xs relative">
            
            {/* Header / Crest & Bismillah */}
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
                    <p className="text-[10px] text-slate-500">Dhaka, Bangladesh • Zakat &amp; Welfare Assessment Board</p>
                  </div>
                </div>

                <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-center min-w-[140px]">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Zakat Serial No.</p>
                  <p className="text-xs font-extrabold text-emerald-900 font-mono">ASDRI-ZKT-{application.id?.slice(0, 8).toUpperCase() || '2026-01'}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Application Date</p>
                  <p className="text-[11px] font-bold text-slate-700">
                    {zakat.submittedAt 
                      ? new Date(zakat.submittedAt).toLocaleDateString() 
                      : (application.createdAt ? new Date(application.createdAt).toLocaleDateString() : new Date().toLocaleDateString())}
                  </p>
                </div>
              </div>

              {/* Title Banner */}
              <div className="mt-6 bg-emerald-900 text-white text-center py-2.5 rounded-md border-y-2 border-amber-400 shadow-xs">
                <h2 className="text-sm sm:text-base font-bold font-serif uppercase tracking-widest text-amber-300">
                  OFFICIAL ZAKAT &amp; SCHOLARSHIP ASSESSMENT FORM • যাকাত ও স্কলারশিপ মূল্যায়ন ফরম
                </h2>
              </div>
            </div>

            {/* Program & Applicant Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="md:col-span-3 space-y-3">
                <div className="bg-emerald-50/60 p-4 rounded-lg border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Applied Academic Program / বিষয়</p>
                    {application.zakatFundStatus === 'approved_zakat' ? (
                      <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-amber-700" /> ১০০% যাকাত ফান্ড অনুমোদিত
                      </span>
                    ) : application.zakatFundStatus === 'approved_general' ? (
                      <span className="text-[10px] font-extrabold bg-blue-100 text-blue-900 px-2 py-0.5 rounded border border-blue-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-700" /> সাধারণ স্কলারশিপ অনুমোদিত
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                        বোর্ড পর্যালোচনার অপেক্ষায় (Under Review)
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-emerald-950 font-serif leading-snug mt-1">
                    {courseInfo.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-600 font-medium">
                    <span><strong>কোর্স ফি:</strong> ৳ {courseInfo.fees?.totalFee || 0}</span>
                    <span>•</span>
                    <span><strong>মেয়াদ:</strong> {courseInfo.duration}</span>
                    <span>•</span>
                    <span><strong>শিক্ষাবর্ষ:</strong> ২০২৬–২০২৭</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Applicant Name / আবেদনকারী</span>
                    <span className="font-bold text-slate-900 text-sm">{application.userName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Contact Email / ইমেইল</span>
                    <span className="font-semibold text-slate-800">{application.userEmail || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Mobile Number / মোবাইল</span>
                    <span className="font-semibold text-slate-800">{phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Father's / Guardian / পিতা</span>
                    <span className="font-semibold text-slate-800">{fatherName}</span>
                  </div>
                </div>
              </div>

              {/* Passport Photo Box */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-28 h-36 border-2 border-dashed border-slate-300 rounded-md bg-slate-50 flex flex-col items-center justify-center text-center p-2 text-slate-400">
                  <span className="text-[10px] font-bold">Passport Size</span>
                  <span className="text-[9px]">Photograph</span>
                  <span className="text-[8px] text-slate-300 mt-1">(35mm x 45mm)</span>
                </div>
                <span className="text-[9px] text-slate-400 mt-1 font-semibold">Attested Photo</span>
              </div>
            </div>

            {/* SECTION 1: Personal & Family Background Table */}
            <div className="mb-6 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 border-b border-emerald-200 pb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                ১. ব্যক্তিগত ও পারিবারিক পরিচিতি (Personal &amp; Family Profile)
              </h4>
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 bg-slate-50 font-bold text-slate-600 w-1/4 border-r border-slate-200">NID / জন্মনিবন্ধন নম্বর</td>
                    <td className="p-2 text-slate-900 font-mono font-bold w-1/4 border-r border-slate-200">{zakat.nid_brn || 'প্রযোজ্য নয়'}</td>
                    <td className="p-2 bg-slate-50 font-bold text-slate-600 w-1/4 border-r border-slate-200">জন্ম তারিখ</td>
                    <td className="p-2 text-slate-800 w-1/4">{zakat.dob || 'প্রযোজ্য নয়'}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 bg-slate-50 font-bold text-slate-600 border-r border-slate-200">পিতা জীবিত কিনা</td>
                    <td className="p-2 text-slate-800 font-medium border-r border-slate-200">{zakat.father_alive || 'N/A'}</td>
                    <td className="p-2 bg-slate-50 font-bold text-slate-600 border-r border-slate-200">মাতা জীবিত কিনা</td>
                    <td className="p-2 text-slate-800 font-medium">{zakat.mother_alive || 'N/A'}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 bg-slate-50 font-bold text-slate-600 border-r border-slate-200">পরিত্যক্ত সম্পদ বণ্টন হয়েছে কিনা</td>
                    <td className="p-2 text-slate-800 font-medium border-r border-slate-200">{zakat.inherited_property_partitioned || 'প্রযোজ্য নয়'}</td>
                    <td className="p-2 bg-slate-50 font-bold text-slate-600 border-r border-slate-200">মাসিক পারিবারিক আয় (Family Income)</td>
                    <td className="p-2 text-emerald-900 font-bold">৳ {formatTaka(zakat.familyIncome || zakat.monthly_income || 0)} / মাস</td>
                  </tr>
                  <tr>
                    <td className="p-2 bg-slate-50 font-bold text-slate-600 border-r border-slate-200">স্থায়ী ঠিকানা (Permanent Address)</td>
                    <td colSpan={3} className="p-2 text-slate-800 leading-snug">{address}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION 2: Assets & Financial Status Details */}
            <div className="mb-6 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 border-b border-emerald-200 pb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                  ২. আবেদনকারীর নিজ মালিকানাধীন আর্থিক অবস্থার বিবরণ (Personal Assets Breakdown)
                </span>
                <span className="text-[10px] text-slate-500 font-normal">মুদ্রা: বাংলাদেশী টাকা (BDT)</span>
              </h4>
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2 border-r border-slate-200 w-8 text-center">নং</th>
                    <th className="p-2 border-r border-slate-200">সম্পদ / ফান্ডের বিবরণ</th>
                    <th className="p-2 text-right w-36">পরিমাণ / বাজারমূল্য</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  <tr>
                    <td className="p-2 text-center bg-slate-50 font-mono">ক</td>
                    <td className="p-2 font-medium">নগদ অর্থ (হাতে থাকা ক্যাশ ও অন্যের কাছে থাকা আমানত সহ)</td>
                    <td className="p-2 text-right font-bold font-mono">৳ {formatTaka(zakat.cash_in_hand)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center bg-slate-50 font-mono">খ</td>
                    <td className="p-2 font-medium">স্বর্ণ ও রূপা (ভরি/ক্যারেট এবং আনুমানিক বাজারমূল্য)</td>
                    <td className="p-2 text-right font-mono">{zakat.gold_silver_val || '০'}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center bg-slate-50 font-mono">গ</td>
                    <td className="p-2 font-medium">অব্যবহৃত/পরিত্যক্ত জমি, বাড়ি বা ফ্ল্যাটের বিক্রয়মূল্য</td>
                    <td className="p-2 text-right font-bold font-mono">৳ {formatTaka(zakat.land_property_val)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center bg-slate-50 font-mono">ঘ</td>
                    <td className="p-2 font-medium">ব্যাংক বা আর্থিক প্রতিষ্ঠানে জমাকৃত অর্থ (সুদ ব্যতীত মূল অংশ)</td>
                    <td className="p-2 text-right font-bold font-mono">৳ {formatTaka(zakat.bank_deposit_val)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center bg-slate-50 font-mono">ঙ</td>
                    <td className="p-2 font-medium">শেয়ার, ব্যবসায়িক স্টক পণ্য বা প্রস্তুত মালামালের পাইকারি মূল্য</td>
                    <td className="p-2 text-right font-bold font-mono">৳ {formatTaka(zakat.stock_goods_val || zakat.business_share_val)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center bg-slate-50 font-mono">চ</td>
                    <td className="p-2 font-medium">ফেরত পাওয়া যাবে এমন প্রদত্ত ঋণ ও বীমার অর্থ</td>
                    <td className="p-2 text-right font-bold font-mono">৳ {formatTaka(zakat.recoverable_loan || zakat.insurance_val)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION 3: Liabilities & Debts Breakdown */}
            <div className="mb-6 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 border-b border-emerald-200 pb-1 flex items-center justify-between">
                <span>৩. ঋণ ও দায়ের বিবরণ (Liabilities &amp; Debt Deductions)</span>
                <span className="text-[10px] text-slate-500 font-normal">আগামী ১ বছরের মধ্যে পরিশোধযোগ্য</span>
              </h4>
              <table className="w-full text-xs text-left border-collapse border border-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2 border-r border-slate-200 w-8 text-center">নং</th>
                    <th className="p-2 border-r border-slate-200">ঋণের খাত</th>
                    <th className="p-2 text-right w-36">দায়ের পরিমাণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  <tr>
                    <td className="p-2 text-center bg-slate-50 font-mono">ক</td>
                    <td className="p-2 font-medium">সাধারণ গৃহীত ঋণ (যা মানুষ আবেদনকারীর নিকট পায়)</td>
                    <td className="p-2 text-right font-bold font-mono">৳ {formatTaka(zakat.general_debt)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center bg-slate-50 font-mono">খ</td>
                    <td className="p-2 font-medium">ব্যবসায়িক বা দীর্ঘমেয়াদী ঋণের ১ বছরের কিস্তি</td>
                    <td className="p-2 text-right font-bold font-mono">৳ {formatTaka(zakat.business_debt_1yr || zakat.longterm_installment_1yr)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center bg-slate-50 font-mono">গ</td>
                    <td className="p-2 font-medium">অনাদায়ী দেনমোহর ও বকেয়া ইউটিলিটি/বাড়িভাড়া</td>
                    <td className="p-2 text-right font-bold font-mono">৳ {formatTaka(zakat.unpaid_mahr_1yr || zakat.unpaid_utility_rent)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION 4: Hardship Statement & Reasoning */}
            <div className="mb-6 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 border-b border-emerald-200 pb-1">
                ৪. আর্থিক অসচ্ছলতার সুনির্দিষ্ট কারণ (Statement of Financial Need)
              </h4>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-800 italic">
                "{zakat.reason || zakat.financial_reason || 'কোর্স ফি ও দ্বীনি শিক্ষা গ্রহণের সার্বিক ব্যয়ভার সম্পূর্ণ বহন করা আমার পক্ষে কষ্টসাধ্য হওয়ায় আস-সুন্নাহ ফাউন্ডেশন যাকাত ও স্কলারশিপ ফান্ড থেকে সহায়তা প্রার্থনা করছি।'}"
              </div>
            </div>

            {/* SECTION 5: Two Local Referees */}
            <div className="mb-6 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 border-b border-emerald-200 pb-1">
                ৫. দুইজন স্থানীয় সত্যায়নকারী / আলেমের তথ্য (Referees / Local References)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/70 space-y-1">
                  <p className="font-bold text-slate-900">সত্যায়নকারী ১:</p>
                  <p><span className="text-slate-500">নাম:</span> <strong>{zakat.referee1_name || 'N/A'}</strong></p>
                  <p><span className="text-slate-500">মোবাইল:</span> <span className="font-mono">{zakat.referee1_mobile || 'N/A'}</span></p>
                  <p><span className="text-slate-500">সম্পর্ক:</span> {zakat.referee1_relation || 'স্থানীয় ইমাম / শিক্ষক'}</p>
                </div>
                <div className="p-3 border border-slate-200 rounded-lg bg-slate-50/70 space-y-1">
                  <p className="font-bold text-slate-900">সত্যায়নকারী ২:</p>
                  <p><span className="text-slate-500">নাম:</span> <strong>{zakat.referee2_name || 'N/A'}</strong></p>
                  <p><span className="text-slate-500">মোবাইল:</span> <span className="font-mono">{zakat.referee2_mobile || 'N/A'}</span></p>
                  <p><span className="text-slate-500">সম্পর্ক:</span> {zakat.referee2_relation || 'প্রতিবেশী / অভিভাবক'}</p>
                </div>
              </div>
            </div>

            {/* SECTION 6: Shar'i Undertaking Declaration */}
            <div className="mb-8 p-3.5 bg-amber-50/50 border border-amber-200 rounded-lg text-[11px] text-amber-950 leading-relaxed space-y-1.5">
              <p className="font-bold text-amber-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                আবেদনকারীর শরয়ি অঙ্গীকারনামা (Shar'i Declaration &amp; Undertaking):
              </p>
              <p className="text-justify text-slate-700">
                {ZAKAT_UNDERTAKING_TEXT}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold pt-1 border-t border-amber-200">
                ঘোষণা গ্রহণ: <span className="text-emerald-800 font-bold">✓ আবেদনকারী ডিজিটালভাবে অঙ্গীকারপত্র গ্রহণ করেছেন ({zakat.submittedAt ? new Date(zakat.submittedAt).toLocaleString() : 'Accepted'})</span>
              </p>
            </div>

            {/* SECTION 7: Official Board Decision & Signatures */}
            <div className="border-t-2 border-emerald-900 pt-6 space-y-6">
              <div className="flex items-center justify-between text-xs border border-emerald-200 p-3 rounded-lg bg-emerald-50/40">
                <span className="font-bold text-emerald-950">বোর্ডের চূড়ান্ত মূল্যায়ন ও অনুদান সিদ্ধান্ত:</span>
                <span className="font-black text-xs px-3 py-1 rounded-md bg-white border border-emerald-300 text-emerald-900">
                  {application.zakatFundStatus === 'approved_zakat' 
                    ? 'অনুমোদিত: ১০০% যাকাত ফান্ড অনুদান (Approved 100% Zakat Scholarship)' 
                    : application.zakatFundStatus === 'approved_general'
                    ? 'অনুমোদিত: সাধারণ স্কলারশিপ ফান্ড (Approved General Scholarship)'
                    : 'যাচাই-বাছাই ও সিদ্ধান্ত প্রক্রিয়াধীন (Under Evaluation)'}
                </span>
              </div>

              <div className="pt-6 grid grid-cols-4 gap-4 text-center text-xs">
                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1 min-h-[32px] flex items-end justify-center font-serif font-bold text-slate-800 text-[11px]">
                    {application.userName}
                  </div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">আবেদনকারীর স্বাক্ষর</p>
                </div>

                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1 min-h-[32px] flex items-end justify-center text-emerald-900 font-bold text-[11px]">
                    {application.zakatFundStatus?.startsWith('approved') ? 'যাচাইকৃত ও অনুমোদিত' : 'পর্যালোচনাধীন'}
                  </div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">যাকাত মূল্যায়ন কর্মকর্তা</p>
                </div>

                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1 min-h-[32px] flex items-end justify-center font-bold text-emerald-900 text-[11px]">
                    হিসাব ও নিরীক্ষা বিভাগ
                  </div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">অর্থ ও হিসাব কর্মকর্তা</p>
                </div>

                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1 min-h-[32px] flex items-end justify-center font-bold font-serif text-emerald-950 text-[11px]">
                    চেয়ারম্যান / মুহতামিম
                  </div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">পরিচালনা পর্ষদ সিলমোহর</p>
                </div>
              </div>
            </div>

            {/* Footer watermark */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 flex justify-between items-center">
              <span>As-Sunnah Dawah &amp; Research Institute • Zakat Assessment Records</span>
              <span>Generated: {new Date().toLocaleString()}</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
