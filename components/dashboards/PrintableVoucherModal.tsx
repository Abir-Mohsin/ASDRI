'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, X, Download, FileText, CheckCircle2, Shield, 
  Building2, Hash, Calendar, DollarSign, User, Tag, 
  FileCheck, Scissors, RefreshCw, Layers, Stamp, Check, Copy
} from 'lucide-react';

export type VoucherType = 
  | 'debit' 
  | 'credit' 
  | 'student_fee' 
  | 'journal' 
  | 'salary' 
  | 'requisition' 
  | 'donation';

export interface VoucherData {
  type: VoucherType;
  voucherNo: string;
  date: string;
  headOfAccount: string;
  payeeOrPayerName: string;
  beneficiaryRole?: string;
  amount: number;
  amountInWords?: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'bKash' | 'Nagad' | 'Check' | 'Adjusted';
  bankName?: string;
  chequeOrTrxNo?: string;
  particulars: string;
  notes?: string;
  
  // Student Specific
  studentId?: string;
  studentName?: string;
  courseName?: string;
  sessionOrSemester?: string;
  admissionFee?: number;
  tuitionFee?: number;
  examFee?: number;
  discountOrWaiver?: number;
  totalPayable?: number;
  amountPaid?: number;
  balanceDue?: number;

  // Salary & Honorarium Specific
  employeeId?: string;
  designation?: string;
  monthYear?: string;
  basicSalary?: number;
  allowances?: number;
  deductions?: number;
  netPayable?: number;

  // Journal Voucher Specific (Dr/Cr lines)
  journalEntries?: Array<{
    accountCode: string;
    accountHead: string;
    description: string;
    debit: number;
    credit: number;
  }>;

  // Donation Specific
  donationCategory?: 'General Donation' | 'Zakat Fund' | 'Waqf Endowment' | 'Mosque Construction' | 'Orphan & Student Aid' | string;
  donorPhone?: string;
  donorAddress?: string;

  // Signatures / Approvals
  preparedBy?: string;
  checkedBy?: string;
  approvedBy?: string;
  receivedBy?: string;
}

interface PrintableVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: VoucherType;
  initialData?: Partial<VoucherData>;
}

// Convert numbers to English words
function numberToEnglishWords(num: number): string {
  if (num === 0) return 'Zero Taka Only';
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
  }

  const integerPart = Math.floor(Math.abs(num));
  return `${inWords(integerPart)} Taka Only`;
}

export const VOUCHER_DEFINITIONS: Array<{
  id: VoucherType;
  nameEn: string;
  nameBn: string;
  desc: string;
  category: string;
  color: string;
}> = [
  {
    id: 'debit',
    nameEn: 'Debit / Payment Voucher',
    nameBn: 'ডেবিট / পেমেন্ট ভাউচার',
    desc: 'Used for recording all cash & bank payments, vendor bills, utilities, and operational costs.',
    category: 'Disbursements',
    color: 'border-rose-300 bg-rose-50/70 text-rose-900'
  },
  {
    id: 'credit',
    nameEn: 'Credit / Money Receipt',
    nameBn: 'ক্রেডিট / জমা রসিদ ভাউচার',
    desc: 'Used for receiving course revenues, book sales, workshop fees, and general collections.',
    category: 'Collections',
    color: 'border-emerald-300 bg-emerald-50/70 text-emerald-900'
  },
  {
    id: 'student_fee',
    nameEn: 'Student Fee Receipt (Dual Copy)',
    nameBn: 'শিক্ষার্থী ফি ও বেতন রসিদ (ছাত্র ও অফিস কপি)',
    desc: 'Official 2-part perforated receipt for tuition, semester fees, admission, and scholarship credits.',
    category: 'Academic Accounts',
    color: 'border-blue-300 bg-blue-50/70 text-blue-900'
  },
  {
    id: 'journal',
    nameEn: 'Journal Voucher (JV)',
    nameBn: 'জার্নাল ভাউচার (সমন্বয় ও ট্রান্সফার)',
    desc: 'Used for non-cash double-entry adjustments, depreciation, inter-fund allocations, and corrections.',
    category: 'Accounting',
    color: 'border-purple-300 bg-purple-50/70 text-purple-900'
  },
  {
    id: 'salary',
    nameEn: 'Salary & Honorarium Pay Voucher',
    nameBn: 'উস্তাদ ও স্টাফ বেতন/হাদিয়া ভাউচার',
    desc: 'Monthly pay slip for faculty, administrative staff, and Islamic visiting scholar honorarium.',
    category: 'Payroll',
    color: 'border-indigo-300 bg-indigo-50/70 text-indigo-900'
  },
  {
    id: 'requisition',
    nameEn: 'Expense Requisition & Advance Voucher',
    nameBn: 'ব্যয় অনুমোদন ও অগ্রিম ভাউচার',
    desc: 'Formal budget approval and petty-cash / project advance slip with multi-tier authorization.',
    category: 'Approvals',
    color: 'border-amber-300 bg-amber-50/70 text-amber-900'
  },
  {
    id: 'donation',
    nameEn: 'Donation & Waqf Fund Receipt',
    nameBn: 'দান, যাকাত ও ওয়াকফ ফান্ড রসিদ',
    desc: 'Official Islamic charity receipt with donor certification for Zakat, Waqf, and general Sadaqah.',
    category: 'Endowments',
    color: 'border-teal-300 bg-teal-50/70 text-teal-900'
  }
];

export default function PrintableVoucherModal({
  isOpen,
  onClose,
  initialType = 'debit',
  initialData
}: PrintableVoucherModalProps) {
  const [selectedType, setSelectedType] = useState<VoucherType>(initialType);
  const [isEditing, setIsEditing] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Default state initialization
  const defaultDate = new Date().toISOString().split('T')[0];
  const generateVoucherNo = (type: VoucherType) => {
    const prefixMap: Record<VoucherType, string> = {
      debit: 'DV',
      credit: 'CR',
      student_fee: 'STU-FEE',
      journal: 'JV',
      salary: 'SAL',
      requisition: 'REQ',
      donation: 'WQF-ZKT'
    };
    const yr = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefixMap[type]}-${yr}-${rand}`;
  };

  const [formData, setFormData] = useState<VoucherData>(() => ({
    type: initialType,
    voucherNo: initialData?.voucherNo || generateVoucherNo(initialType),
    date: initialData?.date || defaultDate,
    headOfAccount: initialData?.headOfAccount || 'General Operating Expense (5010)',
    payeeOrPayerName: initialData?.payeeOrPayerName || 'Darul Uloom Publications Ltd.',
    beneficiaryRole: initialData?.beneficiaryRole || 'Vendor / Supplier',
    amount: initialData?.amount || 15000,
    amountInWords: initialData?.amountInWords || numberToEnglishWords(initialData?.amount || 15000),
    paymentMethod: initialData?.paymentMethod || 'Bank Transfer',
    bankName: initialData?.bankName || 'Islami Bank Bangladesh PLC (IBBL)',
    chequeOrTrxNo: initialData?.chequeOrTrxNo || 'TRX-99381023',
    particulars: initialData?.particulars || 'Procurement of Classical Hadith & Tafsir Reference Books for Library archive.',
    notes: initialData?.notes || 'Approved in Finance Committee meeting.',
    
    // Student Fee
    studentId: initialData?.studentId || 'STD-1002',
    studentName: initialData?.studentName || 'Mohammad Abdullah Al-Mahmud',
    courseName: initialData?.courseName || 'Diploma in Arabic & Usul al-Fiqh',
    sessionOrSemester: initialData?.sessionOrSemester || 'Fall Semester 2026',
    admissionFee: initialData?.admissionFee || 2000,
    tuitionFee: initialData?.tuitionFee || 6000,
    examFee: initialData?.examFee || 1000,
    discountOrWaiver: initialData?.discountOrWaiver || 1000,
    totalPayable: initialData?.totalPayable || 8000,
    amountPaid: initialData?.amountPaid || 8000,
    balanceDue: initialData?.balanceDue || 0,

    // Salary
    employeeId: initialData?.employeeId || 'FAC-202',
    designation: initialData?.designation || 'Senior Muhaddith & Faculty Member',
    monthYear: initialData?.monthYear || 'August 2026',
    basicSalary: initialData?.basicSalary || 35000,
    allowances: initialData?.allowances || 8000,
    deductions: initialData?.deductions || 1000,
    netPayable: initialData?.netPayable || 42000,

    // Journal
    journalEntries: initialData?.journalEntries || [
      { accountCode: '1010', accountHead: 'Cash in Hand (Petty Vault)', description: 'Campus stationery purchase', debit: 0, credit: 4500 },
      { accountCode: '5020', accountHead: 'Office Stationery & Printing', description: 'Academic exam papers & printing', debit: 4500, credit: 0 }
    ],

    // Donation
    donationCategory: initialData?.donationCategory || 'Zakat Fund',
    donorPhone: initialData?.donorPhone || '+880 1711-002233',
    donorAddress: initialData?.donorAddress || 'Dhanmondi, Dhaka',

    // Signatures
    preparedBy: initialData?.preparedBy || 'Md. Rafiqul Islam (Finance Officer)',
    checkedBy: initialData?.checkedBy || 'Accountant / Internal Auditor',
    approvedBy: initialData?.approvedBy || 'Dr. Director / Principal',
    receivedBy: initialData?.receivedBy || ''
  }));

  // Re-sync whenever the modal is opened or initialData/initialType is updated from row click
  useEffect(() => {
    if (isOpen) {
      const type = initialType || initialData?.type || 'debit';
      setSelectedType(type);
      setIsEditing(false);

      const amt = initialData?.amount !== undefined ? initialData.amount : (type === 'salary' ? 42000 : (type === 'donation' ? 50000 : 15000));
      const words = initialData?.amountInWords || numberToEnglishWords(amt);

      setFormData({
        type: type,
        voucherNo: initialData?.voucherNo || generateVoucherNo(type),
        date: initialData?.date || defaultDate,
        headOfAccount: initialData?.headOfAccount || (
          type === 'student_fee' ? 'Student Tuition Accounts (4001)' :
          type === 'donation' ? 'Waqf & Zakat Endowment Fund (3010)' :
          type === 'salary' ? 'Faculty Salary & Honorarium (5001)' :
          type === 'journal' ? 'General Journal Adjustments' :
          type === 'requisition' ? 'Advance & Requisition Fund (1040)' :
          type === 'credit' ? 'Institutional Revenue Collection' :
          'General Operating Expense (5010)'
        ),
        payeeOrPayerName: initialData?.payeeOrPayerName || (
          type === 'student_fee' ? (initialData?.studentName || 'Mohammad Abdullah Al-Mahmud') :
          type === 'salary' ? 'Shaykh Abu Bakr Siddique' :
          type === 'donation' ? 'Al-Hajj Nurul Islam' :
          type === 'credit' ? 'General Public / Student' :
          'Maktabat Al-Iman'
        ),
        beneficiaryRole: initialData?.beneficiaryRole || (type === 'debit' ? 'Vendor / Recipient' : undefined),
        amount: amt,
        amountInWords: words,
        paymentMethod: initialData?.paymentMethod || 'Cash',
        bankName: initialData?.bankName || 'Islami Bank Bangladesh PLC (IBBL)',
        chequeOrTrxNo: initialData?.chequeOrTrxNo || '',
        particulars: initialData?.particulars || (
          type === 'student_fee' ? `Academic Semester Fees - ${initialData?.courseName || 'Islamic Studies'}` :
          type === 'salary' ? 'Monthly Honorarium & Lecture Conveyance' :
          type === 'donation' ? 'Donation for ASDRI Islamic Research & Dawah Fund' :
          type === 'requisition' ? 'Advance requisition for departmental research and seminar' :
          'General institutional operational transaction'
        ),
        notes: initialData?.notes || '',
        
        // Student Fee
        studentId: initialData?.studentId || 'STD-1001',
        studentName: initialData?.studentName || initialData?.payeeOrPayerName || 'Mohammad Abdullah Al-Mahmud',
        courseName: initialData?.courseName || 'Diploma in Arabic & Islamic Studies',
        sessionOrSemester: initialData?.sessionOrSemester || 'Fall Semester 2026',
        admissionFee: initialData?.admissionFee || 0,
        tuitionFee: initialData?.tuitionFee ?? amt,
        examFee: initialData?.examFee || 0,
        discountOrWaiver: initialData?.discountOrWaiver || 0,
        totalPayable: initialData?.totalPayable ?? (initialData?.tuitionFee ?? amt),
        amountPaid: initialData?.amountPaid ?? amt,
        balanceDue: initialData?.balanceDue ?? 0,

        // Salary
        employeeId: initialData?.employeeId || 'FAC-202',
        designation: initialData?.designation || 'Faculty Member / Scholar',
        monthYear: initialData?.monthYear || 'August 2026',
        basicSalary: initialData?.basicSalary ?? (amt * 0.8),
        allowances: initialData?.allowances ?? (amt * 0.2),
        deductions: initialData?.deductions || 0,
        netPayable: initialData?.netPayable ?? amt,

        // Journal
        journalEntries: initialData?.journalEntries && initialData.journalEntries.length > 0 ? initialData.journalEntries : [
          { accountCode: '1010', accountHead: initialData?.headOfAccount || 'Cash / Bank Account', description: initialData?.particulars || 'Transaction Record', debit: amt, credit: 0 },
          { accountCode: '2020', accountHead: 'Contra / Corresponding Ledger', description: (initialData?.particulars || 'Transaction Record') + ' (Contra)', debit: 0, credit: amt }
        ],

        // Donation
        donationCategory: initialData?.donationCategory || 'Zakat & Waqf Fund',
        donorPhone: initialData?.donorPhone || '',
        donorAddress: initialData?.donorAddress || '',

        // Signatures
        preparedBy: initialData?.preparedBy || 'Md. Rafiqul Islam (Finance Officer)',
        checkedBy: initialData?.checkedBy || 'Accountant / Internal Auditor',
        approvedBy: initialData?.approvedBy || 'Dr. Director / Principal',
        receivedBy: initialData?.receivedBy || ''
      });
    }
  }, [isOpen, initialType, initialData]);

  // Handle switching voucher type
  const handleTypeChange = (newType: VoucherType) => {
    setSelectedType(newType);
    setFormData(prev => {
      const newVoucherNo = generateVoucherNo(newType);
      let newHead = prev.headOfAccount;
      let newParticulars = prev.particulars;
      let newPayee = prev.payeeOrPayerName;
      let newAmt = prev.amount;

      if (newType === 'debit') {
        newHead = 'General Operating Expense (5010)';
        newPayee = 'Maktabat Al-Iman Press';
        newParticulars = 'Payment for Academic Course Syllabus Printing & Binding';
        newAmt = 12500;
      } else if (newType === 'credit') {
        newHead = 'Course Registration Revenue (4010)';
        newPayee = 'General Public Enrollment';
        newParticulars = 'Short Course on Ulum al-Quran Admission Fees Collection';
        newAmt = 18000;
      } else if (newType === 'student_fee') {
        newHead = 'Student Tuition Accounts (4001)';
        newPayee = prev.studentName || 'Mohammad Abdullah Al-Mahmud';
        newParticulars = 'Semester Tuition & Library Fee payment for Fall 2026';
        newAmt = 8000;
      } else if (newType === 'salary') {
        newHead = 'Faculty Salary & Honorarium (5001)';
        newPayee = 'Shaykh Abu Bakr Siddique (Visiting Scholar)';
        newParticulars = 'Monthly Honorarium & Lecture conveyance for August 2026';
        newAmt = 42000;
      } else if (newType === 'requisition') {
        newHead = 'Advance for Institutional Seminar (1040)';
        newPayee = 'Department of Hadith Studies';
        newParticulars = 'Advance cash requisition for National Hadith Symposium arrangement.';
        newAmt = 25000;
      } else if (newType === 'donation') {
        newHead = 'Waqf & Zakat Endowment Fund (3010)';
        newPayee = 'Al-Hajj Nurul Islam Chowdhury';
        newParticulars = 'Sadaqah Jariyah for Islamic Research Library Expansion';
        newAmt = 50000;
      }

      return {
        ...prev,
        type: newType,
        voucherNo: newVoucherNo,
        headOfAccount: newHead,
        particulars: newParticulars,
        payeeOrPayerName: newPayee,
        amount: newAmt,
        amountInWords: numberToEnglishWords(newAmt)
      };
    });
  };

  const handlePrint = () => {
    // 1. Try standard window.print()
    try {
      if (typeof window !== 'undefined') {
        window.print();
      }
    } catch (err) {
      console.warn('Standard window.print() failed, trying isolated print window:', err);
    }
  };

  // Dedicated function to open an isolated clean print popup window if iframe print is blocked
  const handlePrintPopup = () => {
    try {
      if (!printAreaRef.current) {
        window.print();
        return;
      }
      const printContents = printAreaRef.current.innerHTML;
      const printWindow = window.open('', '_blank', 'width=900,height=800,top=50,left=50');
      if (!printWindow) {
        window.print();
        return;
      }
      printWindow.document.open();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${formData.voucherNo} - ASDRI Official Voucher</title>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @page { size: A4 portrait; margin: 10mm; }
              body { background-color: #ffffff !important; color: #0f172a !important; font-family: ui-sans-serif, system-ui, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              @media print {
                body { margin: 0; padding: 0; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body class="p-6 bg-white text-slate-900">
            <div class="max-w-4xl mx-auto">
              ${printContents}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.focus();
                  window.print();
                }, 300);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (e) {
      console.error('Popup print failed:', e);
      window.print();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Container Box */}
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-200 flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        
        {/* Header (Hidden on Print) */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-700/80 rounded-lg text-white">
              <Stamp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base text-white flex items-center gap-2">
                Official Voucher & Money Receipt Generator
              </h2>
              <p className="text-xs text-slate-300">
                ইন্সটিটিউটের ৭ ধরনের অফিশিয়াল ভাউচার প্রিন্ট ও আর্কাইভিং সেন্টার
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                isEditing ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {isEditing ? 'Preview Mode' : 'Edit Fields'}
            </button>
            <button 
              onClick={handlePrintPopup}
              title="Open clean print preview window (recommended for iframes)"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              Print Popup
            </button>
            <button 
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              Direct Print
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Voucher Type Tabs (Hidden on Print) */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto print:hidden">
          {VOUCHER_DEFINITIONS.map(def => {
            const isSelected = selectedType === def.id;
            return (
              <button
                key={def.id}
                onClick={() => handleTypeChange(def.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected 
                    ? 'bg-slate-900 text-white shadow-sm ring-2 ring-emerald-700' 
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>{def.nameBn.split(' ')[0]}</span>
                <span className="text-[11px] opacity-80">({def.nameEn.split('/')[0]})</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body: Two columns if editing, or single full-width preview */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 print:bg-white print:p-0 print:overflow-visible">
          
          {/* Quick Edit Form Panel (Hidden on Print) */}
          {isEditing && (
            <div className="mb-6 p-4 bg-white rounded-xl border border-slate-300 shadow-sm print:hidden space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-emerald-700" /> Customize Voucher Details Before Printing
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Editing: {formData.voucherNo}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Voucher / Receipt No</label>
                  <input 
                    type="text"
                    value={formData.voucherNo}
                    onChange={(e) => setFormData({...formData, voucherNo: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Issue Date</label>
                  <input 
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Head of Account</label>
                  <input 
                    type="text"
                    value={formData.headOfAccount}
                    onChange={(e) => setFormData({...formData, headOfAccount: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {selectedType === 'debit' || selectedType === 'salary' ? 'Paid To (Payee)' : 'Received From (Payer)'}
                  </label>
                  <input 
                    type="text"
                    value={formData.payeeOrPayerName}
                    onChange={(e) => setFormData({...formData, payeeOrPayerName: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Amount (BDT)</label>
                  <input 
                    type="number"
                    value={formData.amount}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setFormData({
                        ...formData, 
                        amount: val,
                        amountInWords: numberToEnglishWords(val)
                      });
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                  <select 
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as any})}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Cash">Cash in Hand</option>
                    <option value="Bank Transfer">Bank Transfer (IBBL)</option>
                    <option value="bKash">bKash Merchant</option>
                    <option value="Nagad">Nagad MFS</option>
                    <option value="Check">Bank Cheque</option>
                    <option value="Adjusted">Ledger Adjustment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Particulars / Description</label>
                <textarea 
                  rows={2}
                  value={formData.particulars}
                  onChange={(e) => setFormData({...formData, particulars: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Student Accounts specific fields */}
              {selectedType === 'student_fee' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Student ID</label>
                    <input 
                      type="text" 
                      value={formData.studentId}
                      onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                      className="w-full p-1.5 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Course / Dept</label>
                    <input 
                      type="text" 
                      value={formData.courseName}
                      onChange={(e) => setFormData({...formData, courseName: e.target.value})}
                      className="w-full p-1.5 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Tuition Fee</label>
                    <input 
                      type="number" 
                      value={formData.tuitionFee}
                      onChange={(e) => setFormData({...formData, tuitionFee: parseFloat(e.target.value) || 0})}
                      className="w-full p-1.5 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Due Remaining</label>
                    <input 
                      type="number" 
                      value={formData.balanceDue}
                      onChange={(e) => setFormData({...formData, balanceDue: parseFloat(e.target.value) || 0})}
                      className="w-full p-1.5 border border-slate-300 rounded font-bold text-rose-700"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PRINTABLE VOUCHER PAPER CANVAS */}
          <div 
            ref={printAreaRef}
            className="voucher-print-container bg-white rounded-xl shadow-lg border border-slate-300 p-8 max-w-4xl mx-auto text-slate-900 font-sans print:shadow-none print:border-none print:p-0 print:max-w-none print:rounded-none"
            style={{ minHeight: '680px' }}
          >
            {/* RENDER SPECIFIC VOUCHER LAYOUT */}
            {selectedType === 'student_fee' ? (
              <StudentFeeDualReceipt data={formData} />
            ) : selectedType === 'journal' ? (
              <JournalVoucherLayout data={formData} />
            ) : selectedType === 'salary' ? (
              <SalaryHonorariumLayout data={formData} />
            ) : selectedType === 'donation' ? (
              <DonationReceiptLayout data={formData} />
            ) : selectedType === 'requisition' ? (
              <RequisitionVoucherLayout data={formData} />
            ) : (
              <StandardAccountingVoucherLayout data={formData} type={selectedType} />
            )}
          </div>

        </div>

        {/* Footer info (Hidden on Print) */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 rounded-b-2xl print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Standard Institutional Format • Ready for Legal Audits, Shariah Compliance & Archiving</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrintPopup}
              className="px-3 py-1.5 bg-slate-200 text-slate-800 font-bold rounded-lg hover:bg-slate-300 transition-colors flex items-center gap-1.5"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-700" /> Print Popup Window
            </button>
            <button 
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#064e3b] text-white font-bold rounded-lg hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" /> Direct Print
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 1. STANDARD ACCOUNTING VOUCHER (DEBIT & CREDIT)
// -------------------------------------------------------------
function StandardAccountingVoucherLayout({ data, type }: { data: VoucherData; type: 'debit' | 'credit' }) {
  const isDebit = type === 'debit';
  
  return (
    <div className="space-y-6">
      {/* Institute Header */}
      <InstituteHeader 
        title={isDebit ? 'DEBIT / PAYMENT VOUCHER' : 'CREDIT / MONEY RECEIPT VOUCHER'} 
        subtitleBn={isDebit ? 'ডেবিট ভাউচার (ব্যয় ও প্রদান রশিদ)' : 'ক্রেডিট ভাউচার (আদায় ও জমা রশিদ)'}
        badgeColor={isDebit ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-emerald-50 border-emerald-300 text-emerald-900'}
      />

      {/* Meta Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Voucher No:</span>
          <span className="font-mono font-black text-slate-900">{data.voucherNo}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Date:</span>
          <span className="font-semibold text-slate-800">{data.date}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Head of Account:</span>
          <span className="font-semibold text-slate-800 truncate block">{data.headOfAccount}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Payment Method:</span>
          <span className="font-semibold text-slate-800">{data.paymentMethod} {data.chequeOrTrxNo ? `(${data.chequeOrTrxNo})` : ''}</span>
        </div>
      </div>

      {/* Party Details */}
      <div className="p-4 border border-slate-300 rounded-lg space-y-3 text-xs">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              {isDebit ? 'Paid To (গ্রহীতার নাম ও ঠিকানা):' : 'Received From (প্রদানকারীর নাম ও বিবরণ):'}
            </span>
            <p className="font-bold text-sm text-slate-900">{data.payeeOrPayerName}</p>
            {data.beneficiaryRole && (
              <p className="text-[11px] text-slate-500">Designation / Role: {data.beneficiaryRole}</p>
            )}
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Bank Account / Fund:</span>
            <p className="font-semibold text-slate-800">{data.bankName || 'Institute General Fund'}</p>
          </div>
        </div>

        {/* Particulars & Amount Table */}
        <div className="pt-2">
          <table className="w-full text-left border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-[10px] uppercase font-bold text-slate-700">
                <th className="p-2.5 border-r border-slate-300 w-12 text-center">SL</th>
                <th className="p-2.5 border-r border-slate-300">Description / Particulars (বিবরণ)</th>
                <th className="p-2.5 text-right w-36">Amount (BDT)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border-r border-slate-300 text-center font-mono align-top">01</td>
                <td className="p-3 border-r border-slate-300 align-top space-y-1">
                  <p className="font-bold text-slate-900">{data.particulars}</p>
                  {data.notes && <p className="text-[11px] text-slate-500 italic">Notes: {data.notes}</p>}
                </td>
                <td className="p-3 text-right font-black text-sm align-top">
                  ৳ {data.amount.toLocaleString()}
                </td>
              </tr>
              <tr className="border-t-2 border-slate-400 bg-slate-50 font-bold">
                <td colSpan={2} className="p-2.5 text-right border-r border-slate-300 uppercase text-[11px]">
                  Total Amount (সর্বমোট টাকা):
                </td>
                <td className="p-2.5 text-right font-black text-base text-slate-950">
                  ৳ {data.amount.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* In Words */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs flex items-center justify-between">
          <span className="font-bold text-slate-700">In Words (কথায়):</span>
          <span className="font-bold text-slate-900 italic">{data.amountInWords || numberToEnglishWords(data.amount)}</span>
        </div>
      </div>

      {/* Signature Section */}
      <SignaturesFooter 
        showReceivedBy={true}
        preparedBy={data.preparedBy}
        checkedBy={data.checkedBy}
        approvedBy={data.approvedBy}
        receivedBy={data.receivedBy}
      />
    </div>
  );
}

// -------------------------------------------------------------
// 2. STUDENT FEE MONEY RECEIPT (DUAL COPY: STUDENT + OFFICE COPY)
// -------------------------------------------------------------
function StudentFeeDualReceipt({ data }: { data: VoucherData }) {
  const SingleReceiptCard = ({ copyType }: { copyType: 'STUDENT COPY' | 'OFFICE COPY' }) => (
    <div className="p-4 border border-slate-300 rounded-lg space-y-3 bg-white text-xs">
      <div className="flex justify-between items-start border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs">
            ADRI
          </div>
          <div>
            <h4 className="font-black text-xs text-slate-900 leading-tight">AS-SUNNAH DAWAH & RESEARCH INSTITUTE</h4>
            <p className="text-[9px] text-slate-500">Student Fee Money Receipt • শিক্ষার্থী ফি রসিদ</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
            copyType === 'STUDENT COPY' ? 'bg-blue-100 text-blue-900 border border-blue-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
          }`}>
            {copyType}
          </span>
          <p className="font-mono text-[10px] font-bold text-slate-600 mt-1">Receipt No: {data.voucherNo}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded border border-slate-200">
        <div>
          <span className="text-slate-500">Student Name:</span> <strong>{data.studentName || data.payeeOrPayerName}</strong>
        </div>
        <div>
          <span className="text-slate-500">Student ID:</span> <strong className="font-mono text-emerald-800">{data.studentId}</strong>
        </div>
        <div>
          <span className="text-slate-500">Program:</span> <strong>{data.courseName}</strong>
        </div>
        <div>
          <span className="text-slate-500">Payment Date:</span> <strong>{data.date}</strong>
        </div>
      </div>

      {/* Breakdown */}
      <table className="w-full text-left border-collapse border border-slate-200 text-[11px]">
        <thead>
          <tr className="bg-slate-100 text-[10px] font-bold uppercase text-slate-600">
            <th className="p-1.5 border-r border-slate-200">Fee Particulars</th>
            <th className="p-1.5 text-right">Amount (BDT)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <tr>
            <td className="p-1.5 border-r border-slate-200">Admission / Registration Fee</td>
            <td className="p-1.5 text-right font-mono">৳ {(data.admissionFee || 0).toLocaleString()}</td>
          </tr>
          <tr>
            <td className="p-1.5 border-r border-slate-200">Tuition & Semester Course Fee</td>
            <td className="p-1.5 text-right font-mono">৳ {(data.tuitionFee || data.amount).toLocaleString()}</td>
          </tr>
          {Boolean(data.examFee) && (
            <tr>
              <td className="p-1.5 border-r border-slate-200">Examination & Material Fee</td>
              <td className="p-1.5 text-right font-mono">৳ {(data.examFee || 0).toLocaleString()}</td>
            </tr>
          )}
          {Boolean(data.discountOrWaiver) && (
            <tr className="text-emerald-700 bg-emerald-50/50">
              <td className="p-1.5 border-r border-slate-200">Scholarship / Fee Waiver Credit</td>
              <td className="p-1.5 text-right font-mono">-৳ {(data.discountOrWaiver || 0).toLocaleString()}</td>
            </tr>
          )}
          <tr className="font-bold bg-slate-50 border-t border-slate-300 text-slate-900">
            <td className="p-1.5 border-r border-slate-200 text-right uppercase text-[10px]">Net Paid Amount (জমা):</td>
            <td className="p-1.5 text-right text-emerald-800 font-mono font-black">
              ৳ {data.amount.toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-between items-center text-[10px] text-slate-600 pt-1">
        <span>Payment Method: <strong>{data.paymentMethod} {data.chequeOrTrxNo ? `(${data.chequeOrTrxNo})` : ''}</strong></span>
        <span>Balance Due: <strong className={data.balanceDue ? 'text-rose-700' : 'text-emerald-700'}>BDT {(data.balanceDue || 0).toLocaleString()}</strong></span>
      </div>

      <div className="pt-6 grid grid-cols-2 gap-4 text-center text-[10px]">
        <div className="border-t border-dashed border-slate-300 pt-1 text-slate-500">
          Student / Depositor Signature
        </div>
        <div className="border-t border-dashed border-slate-300 pt-1 font-bold text-slate-800">
          Authorized Accounts Officer
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Student Copy */}
      <SingleReceiptCard copyType="STUDENT COPY" />

      {/* Perforation Cut Line */}
      <div className="flex items-center justify-center gap-2 text-slate-400 py-1 print:py-2">
        <Scissors className="w-4 h-4" />
        <div className="border-b-2 border-dashed border-slate-300 flex-1"></div>
        <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">Tear along perforation (অফিস ও ছাত্র কপি বিভাজন)</span>
        <div className="border-b-2 border-dashed border-slate-300 flex-1"></div>
      </div>

      {/* Office Archive Copy */}
      <SingleReceiptCard copyType="OFFICE COPY" />
    </div>
  );
}

// -------------------------------------------------------------
// 3. JOURNAL VOUCHER (JV)
// -------------------------------------------------------------
function JournalVoucherLayout({ data }: { data: VoucherData }) {
  const entries = data.journalEntries || [
    { accountCode: '1010', accountHead: 'Cash in Hand', description: 'General supplies adjustment', debit: 0, credit: data.amount },
    { accountCode: '5010', accountHead: 'General Operating Expense', description: 'General supplies adjustment', debit: data.amount, credit: 0 }
  ];

  const totalDebit = entries.reduce((acc, curr) => acc + (curr.debit || 0), 0);
  const totalCredit = entries.reduce((acc, curr) => acc + (curr.credit || 0), 0);

  return (
    <div className="space-y-6">
      <InstituteHeader 
        title="JOURNAL VOUCHER (JV)" 
        subtitleBn="জার্নাল ভাউচার (দৈনন্দিন হিসাব সমন্বয় ও স্থানান্তর)"
        badgeColor="bg-purple-50 border-purple-300 text-purple-900"
      />

      <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold">JV No:</span>
          <span className="font-mono font-black text-slate-900">{data.voucherNo}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Posting Date:</span>
          <span className="font-semibold text-slate-800">{data.date}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Transaction Type:</span>
          <span className="font-semibold text-slate-800">Double Entry Adjustment</span>
        </div>
      </div>

      {/* JV Table */}
      <div className="border border-slate-300 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-[10px] uppercase font-bold text-slate-700">
              <th className="p-2.5 border-r border-slate-300 w-24">Account Code</th>
              <th className="p-2.5 border-r border-slate-300">Account Head & Description</th>
              <th className="p-2.5 border-r border-slate-300 text-right w-32">Debit (Dr) BDT</th>
              <th className="p-2.5 text-right w-32">Credit (Cr) BDT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {entries.map((item, idx) => (
              <tr key={idx}>
                <td className="p-2.5 border-r border-slate-300 font-mono text-slate-600 font-bold">{item.accountCode}</td>
                <td className="p-2.5 border-r border-slate-300">
                  <p className="font-bold text-slate-900">{item.accountHead}</p>
                  <p className="text-[11px] text-slate-500">{item.description}</p>
                </td>
                <td className="p-2.5 border-r border-slate-300 text-right font-mono font-bold text-emerald-800">
                  {item.debit > 0 ? `৳ ${item.debit.toLocaleString()}` : '-'}
                </td>
                <td className="p-2.5 text-right font-mono font-bold text-indigo-800">
                  {item.credit > 0 ? `৳ ${item.credit.toLocaleString()}` : '-'}
                </td>
              </tr>
            ))}
            <tr className="bg-slate-100 font-black border-t-2 border-slate-400 text-slate-950">
              <td colSpan={2} className="p-2.5 text-right border-r border-slate-300 uppercase text-[11px]">
                Total Journal Balance (সমানুপাতিক মোট):
              </td>
              <td className="p-2.5 border-r border-slate-300 text-right font-mono text-sm text-emerald-900">
                ৳ {totalDebit.toLocaleString()}
              </td>
              <td className="p-2.5 text-right font-mono text-sm text-indigo-900">
                ৳ {totalCredit.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Narration */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
        <span className="font-bold text-slate-700 block text-[10px] uppercase">Explanation / Narration (ব্যাখ্যা):</span>
        <p className="text-slate-800">{data.particulars}</p>
      </div>

      <SignaturesFooter 
        showReceivedBy={false}
        preparedBy={data.preparedBy}
        checkedBy={data.checkedBy}
        approvedBy={data.approvedBy}
      />
    </div>
  );
}

// -------------------------------------------------------------
// 4. SALARY & HONORARIUM PAY VOUCHER
// -------------------------------------------------------------
function SalaryHonorariumLayout({ data }: { data: VoucherData }) {
  const basic = data.basicSalary || data.amount * 0.8;
  const allowances = data.allowances || data.amount * 0.2;
  const deductions = data.deductions || 0;
  const net = basic + allowances - deductions;

  return (
    <div className="space-y-6">
      <InstituteHeader 
        title="FACULTY SALARY & HONORARIUM PAY VOUCHER" 
        subtitleBn="উস্তাদ ও কর্মকর্তা বেতন / হাদিয়া পে-স্লিপ ভাউচার"
        badgeColor="bg-indigo-50 border-indigo-300 text-indigo-900"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Voucher No:</span>
          <span className="font-mono font-black text-slate-900">{data.voucherNo}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Pay Month:</span>
          <span className="font-semibold text-slate-800">{data.monthYear || 'August 2026'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Payment Date:</span>
          <span className="font-semibold text-slate-800">{data.date}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Payment Mode:</span>
          <span className="font-semibold text-slate-800">{data.paymentMethod}</span>
        </div>
      </div>

      {/* Recipient info */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs grid grid-cols-2 gap-2">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Faculty / Scholar Name:</span>
          <strong className="text-sm text-slate-900">{data.payeeOrPayerName}</strong>
          <p className="text-slate-500 text-[11px]">{data.designation || 'Visiting Scholar / Muhaddith'}</p>
        </div>
        <div className="text-right">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Employee ID / Ref:</span>
          <strong className="font-mono text-emerald-800">{data.employeeId || 'EMP-202'}</strong>
          <p className="text-slate-500 text-[11px]">{data.bankName || 'Islami Bank Bangladesh PLC'}</p>
        </div>
      </div>

      {/* Earnings & Deductions Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Earnings */}
        <div className="border border-slate-300 rounded-lg overflow-hidden">
          <div className="bg-emerald-100/70 p-2 font-bold text-xs text-emerald-950 uppercase border-b border-emerald-300">
            Earnings (উপার্জন / হাদিয়া)
          </div>
          <table className="w-full text-xs">
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-2 text-slate-600">Basic Honorarium / Salary</td>
                <td className="p-2 text-right font-mono font-bold">৳ {basic.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="p-2 text-slate-600">Conveyance & Research Allowance</td>
                <td className="p-2 text-right font-mono font-bold">৳ {allowances.toLocaleString()}</td>
              </tr>
              <tr className="bg-slate-50 font-bold border-t border-slate-200">
                <td className="p-2">Gross Earnings (মোট উপার্জন):</td>
                <td className="p-2 text-right font-mono text-emerald-800">৳ {(basic + allowances).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deductions */}
        <div className="border border-slate-300 rounded-lg overflow-hidden">
          <div className="bg-rose-100/70 p-2 font-bold text-xs text-rose-950 uppercase border-b border-rose-300">
            Deductions (কর্তন)
          </div>
          <table className="w-full text-xs">
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-2 text-slate-600">Advance Salary Adjustment</td>
                <td className="p-2 text-right font-mono font-bold">৳ {deductions.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="p-2 text-slate-600">Provident / Welfare Fund</td>
                <td className="p-2 text-right font-mono font-bold">৳ 0</td>
              </tr>
              <tr className="bg-slate-50 font-bold border-t border-slate-200">
                <td className="p-2">Total Deductions (মোট কর্তন):</td>
                <td className="p-2 text-right font-mono text-rose-800">৳ {deductions.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Net Payable Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-300 block">Net Payable Amount (পরিশোধযোগ্য নিট হাদিয়া):</span>
          <span className="text-xs text-emerald-300 italic font-semibold">{data.amountInWords || numberToEnglishWords(net)}</span>
        </div>
        <span className="text-xl font-black text-emerald-400 font-mono">৳ {net.toLocaleString()}</span>
      </div>

      <SignaturesFooter 
        showReceivedBy={true}
        preparedBy={data.preparedBy}
        checkedBy={data.checkedBy}
        approvedBy={data.approvedBy}
        receivedBy={data.payeeOrPayerName}
      />
    </div>
  );
}

// -------------------------------------------------------------
// 5. EXPENSE REQUISITION & ADVANCE VOUCHER
// -------------------------------------------------------------
function RequisitionVoucherLayout({ data }: { data: VoucherData }) {
  return (
    <div className="space-y-6">
      <InstituteHeader 
        title="EXPENSE REQUISITION & ADVANCE CASH VOUCHER" 
        subtitleBn="ব্যয় অনুমোদন ও অগ্রিম ক্যাশ রিকুইজিশন ভাউচার"
        badgeColor="bg-amber-50 border-amber-300 text-amber-900"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Requisition No:</span>
          <span className="font-mono font-black text-slate-900">{data.voucherNo}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Date of Request:</span>
          <span className="font-semibold text-slate-800">{data.date}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Department / Division:</span>
          <span className="font-semibold text-slate-800">Academic & Research</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Urgency Level:</span>
          <span className="font-bold text-amber-800">Standard / Approved</span>
        </div>
      </div>

      <div className="p-4 border border-slate-300 rounded-lg space-y-3 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicant / Requisitioner (আবেদনকারী):</span>
          <p className="font-bold text-sm text-slate-900">{data.payeeOrPayerName}</p>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Purpose & Justification (ব্যয়ের উদ্দেশ্য ও যৌক্তিকতা):</span>
          <p className="font-semibold text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200 leading-relaxed">
            {data.particulars}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Proposed Budget Head:</span>
            <strong className="text-slate-800">{data.headOfAccount}</strong>
          </div>
          <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-right">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Requested Amount (অনুরোধকৃত অর্থ):</span>
            <strong className="text-lg font-black text-emerald-950 font-mono">৳ {data.amount.toLocaleString()}</strong>
          </div>
        </div>

        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs flex items-center justify-between">
          <span className="font-bold text-slate-700">In Words:</span>
          <span className="font-bold text-slate-900 italic">{data.amountInWords || numberToEnglishWords(data.amount)}</span>
        </div>
      </div>

      {/* Special Approval Matrix */}
      <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs">
        <div className="space-y-1">
          <div className="h-10 flex items-end justify-center font-serif text-slate-400 italic">Signature</div>
          <div className="border-t-2 border-slate-400 pt-1 font-bold text-slate-800">
            {data.payeeOrPayerName}
          </div>
          <p className="text-[10px] text-slate-500">Requisitioner / HoD</p>
        </div>

        <div className="space-y-1">
          <div className="h-10 flex items-end justify-center font-serif text-slate-400 italic">Verified</div>
          <div className="border-t-2 border-slate-400 pt-1 font-bold text-slate-800">
            {data.checkedBy || 'Finance & Accounts Officer'}
          </div>
          <p className="text-[10px] text-slate-500">Budget Verification</p>
        </div>

        <div className="space-y-1">
          <div className="h-10 flex items-end justify-center font-serif text-emerald-700 font-bold">APPROVED</div>
          <div className="border-t-2 border-slate-800 pt-1 font-bold text-slate-950">
            {data.approvedBy || 'Director / Principal'}
          </div>
          <p className="text-[10px] text-slate-500">Final Authorization & Sanction</p>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 6. DONATION, ZAKAT & WAQF CERTIFICATE RECEIPT
// -------------------------------------------------------------
function DonationReceiptLayout({ data }: { data: VoucherData }) {
  return (
    <div className="space-y-6">
      <InstituteHeader 
        title="DONATION, ZAKAT & WAQF ENDOWMENT RECEIPT" 
        subtitleBn="দান, যাকাত ও ওয়াকফ তহবিল অফিশিয়াল প্রাপ্তি রসিদ"
        badgeColor="bg-teal-50 border-teal-300 text-teal-900"
      />

      <div className="text-center py-1">
        <p className="font-arabic text-sm text-emerald-800 font-bold">
          مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ
        </p>
        <p className="text-[10px] text-slate-500 italic mt-0.5">
          "The example of those who spend their wealth in the way of Allah is like a seed of grain which grows seven spikes..." (Al-Baqarah: 261)
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Receipt No:</span>
          <span className="font-mono font-black text-slate-900">{data.voucherNo}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Donation Date:</span>
          <span className="font-semibold text-slate-800">{data.date}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Donation Category:</span>
          <span className="font-bold text-teal-900">{data.donationCategory || 'Zakat Fund'}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block font-bold">Payment Method:</span>
          <span className="font-semibold text-slate-800">{data.paymentMethod}</span>
        </div>
      </div>

      {/* Donor Card */}
      <div className="p-4 border-2 border-teal-200 rounded-xl bg-teal-50/30 space-y-3 text-xs">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Honorable Donor / Muhaqqiq (দানশীল দাতার নাম):</span>
            <p className="font-black text-base text-slate-900">{data.payeeOrPayerName}</p>
            {data.donorPhone && <p className="text-slate-600 text-[11px]">Phone: {data.donorPhone}</p>}
            {data.donorAddress && <p className="text-slate-500 text-[11px]">Address: {data.donorAddress}</p>}
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Designated Purpose:</span>
            <span className="px-2.5 py-1 rounded bg-teal-100 text-teal-900 font-bold text-[11px] inline-block mt-1">
              {data.headOfAccount}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-teal-200">
          <p className="text-[11px] text-slate-700"><strong>Particulars / Note:</strong> {data.particulars}</p>
        </div>

        {/* Amount Box */}
        <div className="p-3 bg-white rounded-lg border border-teal-300 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount Received (প্রাপ্ত অর্থ):</span>
            <p className="font-bold text-slate-800 italic text-xs">{data.amountInWords || numberToEnglishWords(data.amount)}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-teal-900 font-mono">৳ {data.amount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="text-center p-2 bg-slate-50 rounded border border-slate-200">
        <p className="font-arabic text-sm text-slate-800 font-bold">جَزَاكُمُ اللَّهُ خَيْرًا وَبَارَكَ فِيكُمْ وَفِي أَمْوَالِكُمْ</p>
        <p className="text-[10px] text-slate-500">May Allah reward you abundantly and bless your wealth and family. (Ameen)</p>
      </div>

      <SignaturesFooter 
        showReceivedBy={false}
        preparedBy={data.preparedBy}
        checkedBy={data.checkedBy}
        approvedBy={data.approvedBy}
      />
    </div>
  );
}

// -------------------------------------------------------------
// SHARED COMPONENTS: HEADER & SIGNATURES
// -------------------------------------------------------------
function InstituteHeader({ 
  title, 
  subtitleBn, 
  badgeColor 
}: { 
  title: string; 
  subtitleBn: string; 
  badgeColor: string; 
}) {
  return (
    <div className="border-b-2 border-slate-800 pb-4 space-y-2 text-center">
      {/* Bismillah */}
      <p className="font-arabic text-base text-slate-800 font-bold tracking-wide">
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </p>

      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-xl bg-[#064e3b] text-white flex items-center justify-center font-black text-sm shadow-sm">
          ADRI
        </div>
        <div className="text-center flex-1 px-4">
          <h1 className="font-black text-lg sm:text-xl text-slate-950 tracking-tight leading-tight">
            AS-SUNNAH DAWAH AND RESEARCH INSTITUTE
          </h1>
          <p className="text-[11px] text-slate-600 font-bold">
            আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউট • Finance & Accounts Division
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Plot 12, Sector 15, Uttara Model Town, Dhaka-1230 • Contact: +880 9610-000000 • Email: finance@assunnah-dri.org
          </p>
        </div>
        <div className="w-12 h-12 border border-slate-300 rounded-lg flex flex-col items-center justify-center p-1 text-[8px] text-slate-400 font-mono">
          <span>QR CODE</span>
          <span>VERIFIED</span>
        </div>
      </div>

      {/* Voucher Title Badge */}
      <div className="pt-2 flex items-center justify-center gap-2">
        <div className={`px-4 py-1 rounded-full border ${badgeColor} text-center`}>
          <span className="font-black text-xs sm:text-sm tracking-wider uppercase block">{title}</span>
          <span className="text-[10px] font-semibold block">{subtitleBn}</span>
        </div>
      </div>
    </div>
  );
}

function SignaturesFooter({ 
  showReceivedBy = true,
  preparedBy,
  checkedBy,
  approvedBy,
  receivedBy
}: { 
  showReceivedBy?: boolean;
  preparedBy?: string;
  checkedBy?: string;
  approvedBy?: string;
  receivedBy?: string;
}) {
  return (
    <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
      {/* 1. Prepared By */}
      <div className="space-y-1">
        <div className="h-10 flex items-end justify-center font-serif text-slate-400 italic text-[11px]">
          {preparedBy ? 'Confirmed' : ''}
        </div>
        <div className="border-t-2 border-slate-400 pt-1 font-bold text-slate-800">
          {preparedBy || 'Prepared By'}
        </div>
        <p className="text-[10px] text-slate-500">প্রস্তুতকারী (Accounts)</p>
      </div>

      {/* 2. Checked By */}
      <div className="space-y-1">
        <div className="h-10 flex items-end justify-center font-serif text-slate-400 italic text-[11px]">
          {checkedBy ? 'Verified' : ''}
        </div>
        <div className="border-t-2 border-slate-400 pt-1 font-bold text-slate-800">
          {checkedBy || 'Checked & Verified'}
        </div>
        <p className="text-[10px] text-slate-500">যাচাইকারী (Auditor)</p>
      </div>

      {/* 3. Approved By */}
      <div className="space-y-1">
        <div className="h-10 flex items-end justify-center font-serif text-slate-400 italic text-[11px]">
          {approvedBy ? 'Authorized' : ''}
        </div>
        <div className="border-t-2 border-slate-800 pt-1 font-black text-slate-950">
          {approvedBy || 'Director / Principal'}
        </div>
        <p className="text-[10px] text-slate-500">অনুমোদনকারী (Director)</p>
      </div>

      {/* 4. Received By */}
      {showReceivedBy && (
        <div className="space-y-1">
          <div className="h-10 flex items-end justify-center font-serif text-slate-400 italic text-[11px]">
            Signature / Seal
          </div>
          <div className="border-t-2 border-slate-400 pt-1 font-bold text-slate-800">
            {receivedBy || 'Receiver’s Signature'}
          </div>
          <p className="text-[10px] text-slate-500">গ্রহীতার স্বাক্ষর ও তারিখ</p>
        </div>
      )}
    </div>
  );
}
