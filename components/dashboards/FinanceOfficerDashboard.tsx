'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  DollarSign, TrendingUp, TrendingDown, Users, FileText, PieChart, Wallet, 
  CreditCard, ArrowUpRight, ArrowDownRight, Plus, CheckCircle, XCircle, Clock, 
  Filter, Search, Download, ShieldCheck, Landmark, BookOpen, Layers, Calculator, 
  AlertTriangle, ChevronRight, RefreshCw, Printer, Calendar, Tag, Check, Eye, 
  ChevronDown, UserCheck, Percent, HelpCircle, Building, Receipt, Scale, FileSpreadsheet,
  History, ArrowRightLeft, HandCoins, Award, ShoppingCart, Lock, Stamp
} from 'lucide-react';
import { collection, query, getDocs, addDoc, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PrintableVoucherModal, { VoucherType, VoucherData, VOUCHER_DEFINITIONS } from './PrintableVoucherModal';

// Interfaces
interface IncomeItem {
  id: string;
  source: 'student_fees' | 'donations' | 'course_income' | 'other_income';
  title: string;
  amount: number;
  payerName: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'bKash' | 'Nagad' | 'Check';
  date: string;
  referenceNo: string;
  notes?: string;
  createdAt: string;
}

interface ExpenseItem {
  id: string;
  category: string;
  title: string;
  amount: number;
  payeeName: string;
  requestedBy: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
  receiptNo?: string;
  notes?: string;
  approvedBy?: string;
  createdAt: string;
}

interface StudentAccountRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseName: string;
  totalFee: number;
  paidAmount: number;
  dueAmount: number;
  discount: number;
  scholarship: number;
  status: 'Paid' | 'Partial' | 'Due';
  lastPaymentDate?: string;
}

interface JournalEntry {
  id: string;
  entryNo: string;
  date: string;
  accountHead: string;
  accountType: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  debit: number;
  credit: number;
  description: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  module: string;
  performedBy: string;
  amount?: number;
  timestamp: string;
  details: string;
}

export function FinanceOfficerDashboard() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  
  // Navigation Search Parameters
  const searchModule = searchParams?.get('module');
  const searchTab = searchParams?.get('tab');

  // Local fallback state
  const [localModule, setLocalModule] = useState<string>('dashboard');
  const [localIncomeTab, setLocalIncomeTab] = useState<string>('student_fees');
  const [localExpenseTab, setLocalExpenseTab] = useState<string>('expense_entry');
  const [localPaymentTab, setLocalPaymentTab] = useState<string>('pending_payments');
  const [localStudentAccountTab, setLocalStudentAccountTab] = useState<string>('fee_collection');
  const [localCashBankTab, setLocalCashBankTab] = useState<string>('cash_book');
  const [localAccountsTab, setLocalAccountsTab] = useState<string>('chart_of_accounts');
  const [localReportsTab, setLocalReportsTab] = useState<string>('income_report');

  // Derived active tabs
  const activeModule = searchModule || localModule;
  const incomeTab = (searchModule === 'income' && searchTab) ? searchTab : localIncomeTab;
  const expenseTab = (searchModule === 'expenses' && searchTab) ? searchTab : localExpenseTab;
  const paymentTab = (searchModule === 'payments' && searchTab) ? searchTab : localPaymentTab;
  const studentAccountTab = (searchModule === 'student_accounts' && searchTab) ? searchTab : localStudentAccountTab;
  const cashBankTab = (searchModule === 'cash_bank' && searchTab) ? searchTab : localCashBankTab;
  const accountsTab = (searchModule === 'accounts' && searchTab) ? searchTab : localAccountsTab;
  const reportsTab = (searchModule === 'reports' && searchTab) ? searchTab : localReportsTab;

  const setActiveModule = (mod: string) => {
    setLocalModule(mod);
    router.push(`/${locale}/dashboard?module=${mod}`, { scroll: false });
  };

  const setIncomeTab = (tab: any) => {
    setLocalIncomeTab(tab);
    router.push(`/${locale}/dashboard?module=income&tab=${tab}`, { scroll: false });
  };

  const setExpenseTab = (tab: any) => {
    setLocalExpenseTab(tab);
    router.push(`/${locale}/dashboard?module=expenses&tab=${tab}`, { scroll: false });
  };

  const setPaymentTab = (tab: any) => {
    setLocalPaymentTab(tab);
    router.push(`/${locale}/dashboard?module=payments&tab=${tab}`, { scroll: false });
  };

  const setStudentAccountTab = (tab: any) => {
    setLocalStudentAccountTab(tab);
    router.push(`/${locale}/dashboard?module=student_accounts&tab=${tab}`, { scroll: false });
  };

  const setCashBankTab = (tab: any) => {
    setLocalCashBankTab(tab);
    router.push(`/${locale}/dashboard?module=cash_bank&tab=${tab}`, { scroll: false });
  };

  const setAccountsTab = (tab: any) => {
    setLocalAccountsTab(tab);
    router.push(`/${locale}/dashboard?module=accounts&tab=${tab}`, { scroll: false });
  };

  const setReportsTab = (tab: any) => {
    setLocalReportsTab(tab);
    router.push(`/${locale}/dashboard?module=reports&tab=${tab}`, { scroll: false });
  };

  // Loading & Filter States
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // Modal States
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);

  // Voucher Printing Modal States
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherModalType, setVoucherModalType] = useState<VoucherType>('debit');
  const [voucherModalData, setVoucherModalData] = useState<Partial<VoucherData> | undefined>(undefined);

  const openVoucherModal = (type: VoucherType, data?: Partial<VoucherData>) => {
    setVoucherModalType(type);
    setVoucherModalData(data);
    setShowVoucherModal(true);
  };

  // Firestore & Demo Data States
  const [incomes, setIncomes] = useState<IncomeItem[]>([
    { id: 'inc-1', source: 'student_fees', title: 'Hifz Course Semester Fee', amount: 12000, payerName: 'Abdur Rahman', paymentMethod: 'bKash', date: '2026-08-10', referenceNo: 'TRX-99821', createdAt: '2026-08-10T10:00:00Z' },
    { id: 'inc-2', source: 'donations', title: 'Library Endowment Fund', amount: 50000, payerName: 'Al-Haj Muhammad Abdullah', paymentMethod: 'Bank Transfer', date: '2026-08-09', referenceNo: 'IBBL-33019', createdAt: '2026-08-09T14:30:00Z' },
    { id: 'inc-3', source: 'course_income', title: 'Hadith Diploma Registration', amount: 25000, payerName: 'Multiple Students (Batch 4)', paymentMethod: 'Cash', date: '2026-08-08', referenceNo: 'REC-00412', createdAt: '2026-08-08T11:15:00Z' },
    { id: 'inc-4', source: 'other_income', title: 'Publication & Book Sales', amount: 8500, payerName: 'ASDRI Research Press', paymentMethod: 'Cash', date: '2026-08-07', referenceNo: 'REC-00411', createdAt: '2026-08-07T16:00:00Z' }
  ]);

  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: 'exp-1', category: 'Library & Research Books', title: 'Purchase of Classical Fiqh Manuscripts', amount: 18500, payeeName: 'Maktabat Al-Iman', requestedBy: 'Dr. Tariq Mahmood', status: 'Approved', date: '2026-08-08', receiptNo: 'INV-8831', approvedBy: 'Admin Officer', createdAt: '2026-08-08T09:00:00Z' },
    { id: 'exp-2', category: 'Campus Utilities', title: 'Internet & Server Hosting Renewal', amount: 6500, payeeName: 'BD Fiber Net', requestedBy: 'IT Manager', status: 'Pending', date: '2026-08-10', receiptNo: 'INV-9022', createdAt: '2026-08-10T12:00:00Z' },
    { id: 'exp-3', category: 'Teacher Honorarium', title: 'Guest Scholar Lecture Fee - Arabic Syntax', amount: 15000, payeeName: 'Shaykh Ahmadullah', requestedBy: 'Academic Dean', status: 'Pending', date: '2026-08-11', receiptNo: 'HON-102', createdAt: '2026-08-11T08:30:00Z' }
  ]);

  const [studentAccounts, setStudentAccounts] = useState<StudentAccountRecord[]>([
    { id: 'stu-1', studentId: 'STD-1001', studentName: 'Mohammad Farhan', courseName: 'Higher Islamic Studies Diploma', totalFee: 20000, paidAmount: 15000, dueAmount: 5000, discount: 0, scholarship: 0, status: 'Partial', lastPaymentDate: '2026-08-01' },
    { id: 'stu-2', studentId: 'STD-1002', studentName: 'Usman Ghani', courseName: 'Quranic Tafseer Intensive', totalFee: 15000, paidAmount: 15000, dueAmount: 0, discount: 0, scholarship: 0, status: 'Paid', lastPaymentDate: '2026-08-05' },
    { id: 'stu-3', studentId: 'STD-1003', studentName: 'Zubair Hossain', courseName: 'Arabic Language Mastery', totalFee: 18000, paidAmount: 6000, dueAmount: 8000, discount: 2000, scholarship: 2000, status: 'Partial', lastPaymentDate: '2026-07-28' },
    { id: 'stu-4', studentId: 'STD-1004', studentName: 'Hamza Al-Mani', courseName: 'Hifzul Quran Course', totalFee: 12000, paidAmount: 0, dueAmount: 12000, discount: 0, scholarship: 0, status: 'Due', lastPaymentDate: '-' }
  ]);

  const [journals, setJournals] = useState<JournalEntry[]>([
    { id: 'j-1', entryNo: 'JV-2026-001', date: '2026-08-01', accountHead: 'Cash at Bank (Islami Bank)', accountType: 'Asset', debit: 50000, credit: 0, description: 'Donation Received for Library' },
    { id: 'j-2', entryNo: 'JV-2026-001', date: '2026-08-01', accountHead: 'Donation Income Account', accountType: 'Revenue', debit: 0, credit: 50000, description: 'Donation Received for Library' },
    { id: 'j-3', entryNo: 'JV-2026-002', date: '2026-08-05', accountHead: 'Library Expenses', accountType: 'Expense', debit: 18500, credit: 0, description: 'Classical Fiqh Manuscripts Purchase' },
    { id: 'j-4', entryNo: 'JV-2026-002', date: '2026-08-05', accountHead: 'Cash in Hand', accountType: 'Asset', debit: 0, credit: 18500, description: 'Classical Fiqh Manuscripts Purchase' }
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    { id: 'log-1', action: 'Income Entry Added', module: 'Income', performedBy: user?.email || 'finance@asdri.org', amount: 12000, timestamp: '2026-08-10 10:00 AM', details: 'Collected Student Fee TRX-99821' },
    { id: 'log-2', action: 'Expense Approved', module: 'Expenses', performedBy: user?.email || 'finance@asdri.org', amount: 18500, timestamp: '2026-08-08 09:15 AM', details: 'Approved Fiqh Manuscripts Purchase' },
    { id: 'log-3', action: 'Fee Discount Granted', module: 'Student Accounts', performedBy: user?.email || 'finance@asdri.org', amount: 2000, timestamp: '2026-08-02 02:20 PM', details: 'Granted merit discount to STD-1003' }
  ]);

  // Form Input States
  const [newIncome, setNewIncome] = useState({
    source: 'student_fees' as string,
    customSource: '',
    title: '',
    amount: '',
    payerName: '',
    paymentMethod: 'Cash' as 'Cash' | 'Bank Transfer' | 'bKash' | 'Nagad' | 'Check',
    referenceNo: '',
    notes: ''
  });

  const [newExpense, setNewExpense] = useState({
    category: 'General Supplies',
    customCategory: '',
    title: '',
    amount: '',
    payeeName: '',
    notes: ''
  });

  const [feeForm, setFeeForm] = useState({
    studentId: '',
    amount: '',
    paymentMethod: 'bKash' as 'Cash' | 'Bank Transfer' | 'bKash' | 'Nagad' | 'Check',
    referenceNo: '',
    discount: '0',
    scholarship: '0'
  });
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  const [journalForm, setJournalForm] = useState({
    date: new Date().toISOString().split('T')[0],
    accountHead: 'Cash in Hand',
    accountType: 'Asset' as 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense',
    debit: '',
    credit: '',
    description: ''
  });

  // Calculate High-level Totals
  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalApprovedExpenses = expenses.filter(e => e.status === 'Approved').reduce((sum, item) => sum + item.amount, 0);
  const pendingExpensesCount = expenses.filter(e => e.status === 'Pending').length;
  const totalStudentDues = studentAccounts.reduce((sum, item) => sum + item.dueAmount, 0);
  const netSurplus = totalIncome - totalApprovedExpenses;

  // Audit Logging Helper
  const logAudit = (action: string, module: string, details: string, amount?: number) => {
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      action,
      module,
      performedBy: user?.email || 'finance@asdri.org',
      amount,
      timestamp: new Date().toLocaleString(),
      details
    };
    setAuditLogs(prev => [entry, ...prev]);
  };

  // Handlers
  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncome.title || !newIncome.amount) return;

    const amt = parseFloat(newIncome.amount);
    const resolvedSource = newIncome.source === 'custom'
      ? (newIncome.customSource.trim() || 'other_income')
      : newIncome.source;

    const item: IncomeItem = {
      id: `inc-${Date.now()}`,
      source: (resolvedSource as any),
      title: newIncome.title,
      amount: amt,
      payerName: newIncome.payerName || 'Anonymous',
      paymentMethod: newIncome.paymentMethod,
      date: new Date().toISOString().split('T')[0],
      referenceNo: newIncome.referenceNo || `REF-${Math.floor(Math.random() * 90000 + 10000)}`,
      notes: newIncome.notes,
      createdAt: new Date().toISOString()
    };

    setIncomes(prev => [item, ...prev]);
    logAudit('New Income Entry Recorded', 'Income', `${item.title} (${item.paymentMethod})`, amt);
    setShowIncomeModal(false);
    setNewIncome({
      source: 'student_fees',
      customSource: '',
      title: '',
      amount: '',
      payerName: '',
      paymentMethod: 'Cash',
      referenceNo: '',
      notes: ''
    });
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;

    const amt = parseFloat(newExpense.amount);
    const resolvedCategory = newExpense.category === 'custom'
      ? (newExpense.customCategory.trim() || 'General Supplies')
      : newExpense.category;

    const item: ExpenseItem = {
      id: `exp-${Date.now()}`,
      category: resolvedCategory,
      title: newExpense.title,
      amount: amt,
      payeeName: newExpense.payeeName || 'Vendor',
      requestedBy: user?.displayName || user?.email || 'Finance Officer',
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      receiptNo: `EXP-${Math.floor(Math.random() * 9000 + 1000)}`,
      notes: newExpense.notes,
      createdAt: new Date().toISOString()
    };

    setExpenses(prev => [item, ...prev]);
    logAudit('New Expense Claim Submitted', 'Expenses', `Claim: ${item.title}`, amt);
    setShowExpenseModal(false);
    setNewExpense({
      category: 'General Supplies',
      customCategory: '',
      title: '',
      amount: '',
      payeeName: '',
      notes: ''
    });
  };

  const handleApproveExpense = (id: string) => {
    setExpenses(prev => prev.map(exp => {
      if (exp.id === id) {
        logAudit('Expense Claim Approved', 'Expenses', `Approved ${exp.title}`, exp.amount);
        return { ...exp, status: 'Approved', approvedBy: user?.email || 'Finance Officer' };
      }
      return exp;
    }));
  };

  const handleRejectExpense = (id: string) => {
    setExpenses(prev => prev.map(exp => {
      if (exp.id === id) {
        logAudit('Expense Claim Rejected', 'Expenses', `Rejected ${exp.title}`, exp.amount);
        return { ...exp, status: 'Rejected' };
      }
      return exp;
    }));
  };

  const handleCollectStudentFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeForm.studentId || !feeForm.amount) return;

    const paidAmt = parseFloat(feeForm.amount);
    const discAmt = parseFloat(feeForm.discount) || 0;
    const scholAmt = parseFloat(feeForm.scholarship) || 0;

    setStudentAccounts(prev => prev.map(account => {
      if (account.studentId === feeForm.studentId || account.studentName.toLowerCase().includes(feeForm.studentId.toLowerCase())) {
        const newPaid = account.paidAmount + paidAmt;
        const newDiscount = account.discount + discAmt;
        const newScholarship = account.scholarship + scholAmt;
        const newDue = Math.max(0, account.totalFee - newPaid - newDiscount - newScholarship);
        
        return {
          ...account,
          paidAmount: newPaid,
          discount: newDiscount,
          scholarship: newScholarship,
          dueAmount: newDue,
          status: newDue === 0 ? 'Paid' : 'Partial',
          lastPaymentDate: new Date().toISOString().split('T')[0]
        };
      }
      return account;
    }));

    // Record as Income as well
    const incomeItem: IncomeItem = {
      id: `inc-fee-${Date.now()}`,
      source: 'student_fees',
      title: `Student Fee - ${feeForm.studentId}`,
      amount: paidAmt,
      payerName: feeForm.studentId,
      paymentMethod: feeForm.paymentMethod,
      date: new Date().toISOString().split('T')[0],
      referenceNo: feeForm.referenceNo || `FEE-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString()
    };
    setIncomes(prev => [incomeItem, ...prev]);

    logAudit('Student Fee Collected', 'Student Accounts', `Collected BDT ${paidAmt} for ${feeForm.studentId}`, paidAmt);
    setShowFeeModal(false);
    setFeeForm({
      studentId: '',
      amount: '',
      paymentMethod: 'bKash',
      referenceNo: '',
      discount: '0',
      scholarship: '0'
    });
  };

  const handleAddJournalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalForm.accountHead) return;

    const deb = parseFloat(journalForm.debit) || 0;
    const cred = parseFloat(journalForm.credit) || 0;

    const entry: JournalEntry = {
      id: `j-${Date.now()}`,
      entryNo: `JV-${new Date().getFullYear()}-${Math.floor(Math.random() * 900 + 100)}`,
      date: journalForm.date,
      accountHead: journalForm.accountHead,
      accountType: journalForm.accountType,
      debit: deb,
      credit: cred,
      description: journalForm.description || 'Manual Journal Adjustment'
    };

    setJournals(prev => [entry, ...prev]);
    logAudit('Journal Entry Posted', 'Accounts', `Journal Entry ${entry.entryNo} for ${entry.accountHead}`, deb || cred);
    setShowJournalModal(false);
    setJournalForm({
      date: new Date().toISOString().split('T')[0],
      accountHead: 'Cash in Hand',
      accountType: 'Asset',
      debit: '',
      credit: '',
      description: ''
    });
  };

  // Navigation Tree state for collapsible sidebar
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    vouchers: true,
    income: true,
    expenses: true,
    payments: true,
    student_accounts: true,
    cash_bank: true,
    accounts: true,
    reports: true
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Navigation Tree config matching the official Finance & Accounts hierarchy
  const financeNavigationTree = [
    { id: 'dashboard', label: 'Dashboard', icon: PieChart },
    { 
      id: 'vouchers', 
      label: 'Vouchers & Receipts', 
      icon: Stamp,
      subItems: [
        { id: 'debit', label: 'Debit Voucher (ডেবিট ভাউচার)' },
        { id: 'credit', label: 'Credit Voucher (ক্রেডিট ভাউচার)' },
        { id: 'student_fee', label: 'Student Fee Receipt (ফি রসিদ)' },
        { id: 'journal', label: 'Journal Voucher (JV)' },
        { id: 'salary', label: 'Salary Voucher (বেতন ভাউচার)' },
        { id: 'requisition', label: 'Expense Requisition' },
        { id: 'donation', label: 'Donation & Waqf Receipt' }
      ]
    },
    { 
      id: 'income', 
      label: 'Income', 
      icon: ArrowUpRight,
      subItems: [
        { id: 'student_fees', label: 'Student Fees' },
        { id: 'donations', label: 'Donations & Waqf' },
        { id: 'course_income', label: 'Course Income' },
        { id: 'other_income', label: 'Other Income' }
      ]
    },
    { 
      id: 'expenses', 
      label: 'Expenses', 
      icon: ArrowDownRight,
      badge: pendingExpensesCount,
      subItems: [
        { id: 'expense_entry', label: 'Expense Entry' },
        { id: 'expense_categories', label: 'Expense Categories' },
        { id: 'expense_approval', label: 'Expense Approval' }
      ]
    },
    { 
      id: 'payments', 
      label: 'Payments', 
      icon: CreditCard,
      subItems: [
        { id: 'pending_payments', label: 'Pending Payments' },
        { id: 'salary', label: 'Salary' },
        { id: 'honorarium', label: 'Honorarium' },
        { id: 'supplier_payment', label: 'Supplier Payment' },
        { id: 'advance', label: 'Advance' }
      ]
    },
    { 
      id: 'student_accounts', 
      label: 'Student Accounts', 
      icon: Users,
      subItems: [
        { id: 'fee_collection', label: 'Fee Collection' },
        { id: 'due', label: 'Due' },
        { id: 'discount', label: 'Discount' },
        { id: 'scholarship', label: 'Scholarship' },
        { id: 'refund', label: 'Refund' }
      ]
    },
    { id: 'salary_honorarium', label: 'Salary & Honorarium', icon: HandCoins },
    { 
      id: 'cash_bank', 
      label: 'Cash & Bank', 
      icon: Landmark,
      subItems: [
        { id: 'cash_book', label: 'Cash Book' },
        { id: 'bank_accounts', label: 'Bank Accounts' },
        { id: 'bank_reconciliation', label: 'Bank Reconciliation' }
      ]
    },
    { id: 'purchase_suppliers', label: 'Purchase & Suppliers', icon: ShoppingCart },
    { id: 'budget', label: 'Budget', icon: Calculator },
    { 
      id: 'accounts', 
      label: 'Accounts', 
      icon: BookOpen,
      subItems: [
        { id: 'chart_of_accounts', label: 'Chart of Accounts' },
        { id: 'ledger', label: 'Ledger' },
        { id: 'trial_balance', label: 'Trial Balance' },
        { id: 'journal', label: 'Journal' }
      ]
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: FileSpreadsheet,
      subItems: [
        { id: 'income_report', label: 'Income Report' },
        { id: 'expense_report', label: 'Expense Report' },
        { id: 'cash_flow', label: 'Cash Flow' },
        { id: 'due_report', label: 'Due Report' },
        { id: 'budget_vs_actual', label: 'Budget vs Actual' },
        { id: 'financial_statements', label: 'Financial Statements' }
      ]
    },
    { id: 'audit_log', label: 'Audit Log', icon: History },
  ];

  const handleSelectSubItem = (moduleId: string, subItemId: string) => {
    setActiveModule(moduleId);
    if (moduleId === 'vouchers') {
      openVoucherModal(subItemId as VoucherType);
    }
    if (moduleId === 'income') setIncomeTab(subItemId as any);
    if (moduleId === 'expenses') setExpenseTab(subItemId as any);
    if (moduleId === 'payments') setPaymentTab(subItemId as any);
    if (moduleId === 'student_accounts') setStudentAccountTab(subItemId as any);
    if (moduleId === 'cash_bank') setCashBankTab(subItemId as any);
    if (moduleId === 'accounts') setAccountsTab(subItemId as any);
    if (moduleId === 'reports') setReportsTab(subItemId as any);
    setMobileSidebarOpen(false);
  };

  const handleSelectModule = (moduleId: string) => {
    setActiveModule(moduleId);
    setExpandedMenus(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
    setMobileSidebarOpen(false);
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs font-bold text-slate-500">Finance & Accounts Hub (Finance Directorate)</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shadow-2xs">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Firebase Secure Connected
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
              Accounting Dashboard Overview
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button 
              onClick={() => openVoucherModal('debit')}
              className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Voucher / ভাউচার প্রিন্ট
            </button>
            <button 
              onClick={() => setShowIncomeModal(true)}
              className="px-4 py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-white text-xs font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              + Income Entry
            </button>
            <button 
              onClick={() => setShowExpenseModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              + Expense Requisition
            </button>
            <button 
              onClick={() => setShowFeeModal(true)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              Collect Fee
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Full Width */}
      <div className="space-y-6 w-full">

      {/* MODULE 1: MAIN DASHBOARD OVERVIEW */}
      {activeModule === 'dashboard' && (
        <div className="space-y-6">
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Total Revenue (Income)</p>
                <h3 className="text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
                  BDT {totalIncome.toLocaleString()}
                </h3>
              </div>
              <button
                onClick={() => setActiveModule('income')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-700 transition-colors mt-6 pt-3 border-t border-slate-50 text-left"
              >
                <span>Income Records & Fees →</span>
              </button>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Approved Expenses</p>
                <h3 className="text-3xl font-extrabold text-rose-700 font-serif tracking-tight">
                  BDT {totalApprovedExpenses.toLocaleString()}
                </h3>
              </div>
              <button
                onClick={() => setActiveModule('expenses')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-700 transition-colors mt-6 pt-3 border-t border-slate-50 text-left"
              >
                <span>Expense Claims & Vouchers →</span>
              </button>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  <Wallet className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Net Reserve / Surplus</p>
                <h3 className={`text-3xl font-extrabold font-serif tracking-tight ${netSurplus >= 0 ? 'text-[#064e3b]' : 'text-rose-700'}`}>
                  BDT {netSurplus.toLocaleString()}
                </h3>
              </div>
              <button
                onClick={() => setActiveModule('cash_bank')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-700 transition-colors mt-6 pt-3 border-t border-slate-50 text-left"
              >
                <span>Cash & Bank Ledgers →</span>
              </button>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Outstanding Student Dues</p>
                <h3 className="text-3xl font-extrabold text-amber-700 font-serif tracking-tight">
                  BDT {totalStudentDues.toLocaleString()}
                </h3>
              </div>
              <button
                onClick={() => setActiveModule('student_accounts')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-700 transition-colors mt-6 pt-3 border-t border-slate-50 text-left"
              >
                <span>Student Dues & Collections →</span>
              </button>
            </div>

          </div>

          {/* Graphical Summary & Pending Approvals Alert Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Income vs Expense Breakdowns */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-emerald-800" /> Income & Expense Allocation
                </h3>
                <span className="text-xs text-slate-500">Fiscal Year 2026</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                  <p className="text-xs font-bold text-slate-600 uppercase">Income Sources</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span>Student Fees</span><span className="font-bold">60%</span></div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden"><div className="bg-emerald-600 h-full w-[60%]"></div></div>
                    
                    <div className="flex justify-between pt-1"><span>Donations & Waqf</span><span className="font-bold">25%</span></div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden"><div className="bg-amber-500 h-full w-[25%]"></div></div>

                    <div className="flex justify-between pt-1"><span>Course Income</span><span className="font-bold">15%</span></div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden"><div className="bg-indigo-600 h-full w-[15%]"></div></div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                  <p className="text-xs font-bold text-slate-600 uppercase">Expense Distribution</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between"><span>Library & Manuscripts</span><span className="font-bold">40%</span></div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden"><div className="bg-blue-600 h-full w-[40%]"></div></div>
                    
                    <div className="flex justify-between pt-1"><span>Teacher Honorarium</span><span className="font-bold">35%</span></div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden"><div className="bg-purple-600 h-full w-[35%]"></div></div>

                    <div className="flex justify-between pt-1"><span>Utilities & Tech</span><span className="font-bold">25%</span></div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden"><div className="bg-rose-500 h-full w-[25%]"></div></div>
                  </div>
                </div>
              </div>

              {/* Recent Financial Stream */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Recent Financial Activity</h4>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {incomes.slice(0, 3).map(inc => (
                    <div key={inc.id} className="flex items-center justify-between p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100 text-xs">
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-800">{inc.title}</p>
                          <p className="text-[10px] text-slate-500">{inc.payerName} • {inc.paymentMethod} • Ref: {inc.referenceNo}</p>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-700">+BDT {inc.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {expenses.slice(0, 2).map(exp => (
                    <div key={exp.id} className="flex items-center justify-between p-2.5 bg-rose-50/50 rounded-lg border border-rose-100 text-xs">
                      <div className="flex items-center gap-2">
                        <ArrowDownRight className="w-4 h-4 text-rose-600 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-800">{exp.title}</p>
                          <p className="text-[10px] text-slate-500">{exp.category} • {exp.payeeName} • [{exp.status}]</p>
                        </div>
                      </div>
                      <span className="font-bold text-rose-700">-BDT {exp.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pending Approvals & Notifications */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" /> Pending Approvals
                  </h3>
                  <span className="bg-amber-100 text-amber-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                    {pendingExpensesCount} Action Required
                  </span>
                </div>

                {pendingExpensesCount === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">All expense claims have been processed!</p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {expenses.filter(e => e.status === 'Pending').map(item => (
                      <div key={item.id} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-800">{item.title}</span>
                          <span className="font-black text-amber-800">BDT {item.amount.toLocaleString()}</span>
                        </div>
                        <p className="text-[10px] text-slate-500">Requested by: <strong>{item.requestedBy}</strong> ({item.category})</p>
                        <div className="flex gap-2 pt-1">
                          <button 
                            onClick={() => handleApproveExpense(item.id)}
                            className="flex-1 py-1 bg-emerald-700 text-white rounded font-bold hover:bg-emerald-800 transition-colors text-[10px] flex items-center justify-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button 
                            onClick={() => handleRejectExpense(item.id)}
                            className="px-2 py-1 bg-rose-100 text-rose-700 rounded font-bold hover:bg-rose-200 transition-colors text-[10px]"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Institutional Account Status */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-slate-400">Primary Bank Account</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-emerald-700" /> Islami Bank (IBBL) #9012
                  </span>
                  <span className="font-extrabold text-emerald-800">BDT 450,000</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODULE 2: INCOME */}
      {activeModule === 'income' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-emerald-600" /> Income Management
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Track Student Fees, Donations, Course Revenue & Other Receipts</p>
            </div>
            <button 
              onClick={() => setShowIncomeModal(true)}
              className="px-4 py-2 bg-[#064e3b] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-emerald-800 transition-colors"
            >
              <Plus className="w-4 h-4" /> New Income Entry
            </button>
          </div>

          {/* Income Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
            {[
              { id: 'student_fees', label: 'Student Fees' },
              { id: 'donations', label: 'Donations & Waqf' },
              { id: 'course_income', label: 'Course Income' },
              { id: 'other_income', label: 'Other Income' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setIncomeTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  incomeTab === tab.id 
                    ? 'bg-emerald-100 text-[#064e3b] border border-emerald-300' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Income Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3">Reference No</th>
                  <th className="p-3">Title / Description</th>
                  <th className="p-3">Payer Name</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Amount (BDT)</th>
                  <th className="p-3 text-center">Voucher / রসিদ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomes.filter(i => i.source === incomeTab).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">No income records registered under this category yet.</td>
                  </tr>
                ) : (
                  incomes.filter(i => i.source === incomeTab).map(inc => (
                    <tr key={inc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-700">{inc.referenceNo}</td>
                      <td className="p-3 font-bold text-slate-900">{inc.title}</td>
                      <td className="p-3 text-slate-600">{inc.payerName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {inc.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{inc.date}</td>
                      <td className="p-3 text-right font-black text-emerald-700">+{inc.amount.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => openVoucherModal(
                            inc.source === 'donations' ? 'donation' : (inc.source === 'student_fees' ? 'student_fee' : 'credit'),
                            {
                              type: inc.source === 'donations' ? 'donation' : (inc.source === 'student_fees' ? 'student_fee' : 'credit'),
                              voucherNo: inc.referenceNo || 'CR-' + inc.id,
                              date: inc.date,
                              payeeOrPayerName: inc.payerName,
                              amount: inc.amount,
                              paymentMethod: inc.paymentMethod,
                              chequeOrTrxNo: inc.referenceNo,
                              particulars: inc.title,
                              headOfAccount: inc.source === 'student_fees' ? 'Student Tuition Accounts (4001)' : inc.source === 'donations' ? 'Waqf & Zakat Endowment Fund (3010)' : (inc.title || 'Institutional Revenue Collection'),
                              notes: `Collection Ref: ${inc.referenceNo} • Method: ${inc.paymentMethod}`,
                              studentName: inc.source === 'student_fees' ? inc.payerName : undefined,
                              tuitionFee: inc.source === 'student_fees' ? inc.amount : undefined,
                              amountPaid: inc.source === 'student_fees' ? inc.amount : undefined,
                              donationCategory: inc.source === 'donations' ? 'Research & Academic Endowment' : undefined
                            }
                          )}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold inline-flex items-center gap-1 transition-colors"
                          title="Print Official Voucher / Receipt"
                        >
                          <Printer className="w-3 h-3" />
                          Print
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODULE 3: EXPENSES */}
      {activeModule === 'expenses' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5 text-rose-600" /> Expense Management & Approval
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Submit Claims, Manage Expense Categories & Review Approvals</p>
            </div>
            <button 
              onClick={() => setShowExpenseModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Submit Expense Claim
            </button>
          </div>

          {/* Expense Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            {[
              { id: 'expense_entry', label: 'Expense Entry' },
              { id: 'expense_categories', label: 'Expense Categories' },
              { id: 'expense_approval', label: `Expense Approval (${pendingExpensesCount})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setExpenseTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  expenseTab === tab.id 
                    ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub tab content */}
          {expenseTab === 'expense_categories' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Library & Research Books', 'Campus Utilities', 'Teacher Honorarium', 'IT & Server Hosting', 'Office Stationery', 'Maintenance'].map((cat, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800">{cat}</span>
                  <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold">Active</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="p-3">Receipt No</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Requested By</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Amount (BDT)</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-slate-600">{exp.receiptNo || 'N/A'}</td>
                      <td className="p-3 font-bold text-slate-900">{exp.title}</td>
                      <td className="p-3 text-slate-600">{exp.category}</td>
                      <td className="p-3 text-slate-600">{exp.requestedBy}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          exp.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                          exp.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {exp.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-black text-rose-700">-BDT {exp.amount.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <button 
                            onClick={() => openVoucherModal('debit', {
                              type: 'debit',
                              voucherNo: exp.receiptNo || 'DEB-' + exp.id,
                              date: exp.date,
                              payeeOrPayerName: exp.payeeName || exp.requestedBy,
                              beneficiaryRole: exp.requestedBy ? `Requested by: ${exp.requestedBy}` : 'Payee / Supplier',
                              amount: exp.amount,
                              particulars: exp.title,
                              headOfAccount: exp.category,
                              paymentMethod: 'Cash',
                              notes: `Approval Status: ${exp.status}${exp.notes ? ' • ' + exp.notes : ''}`,
                              approvedBy: exp.approvedBy || (exp.status === 'Approved' ? 'Dr. Director / Principal' : '')
                            })}
                            className="px-2 py-1 bg-slate-100 hover:bg-rose-50 text-rose-800 border border-rose-200 rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                            title="Print Debit Voucher"
                          >
                            <Printer className="w-3 h-3" />
                            Voucher
                          </button>

                          {exp.status === 'Pending' && (
                            <>
                              <button 
                                onClick={() => handleApproveExpense(exp.id)}
                                className="px-2 py-1 bg-emerald-700 text-white rounded text-[10px] font-bold hover:bg-emerald-800"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleRejectExpense(exp.id)}
                                className="px-2 py-1 bg-rose-100 text-rose-700 rounded text-[10px] font-bold hover:bg-rose-200"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODULE 4: PAYMENTS */}
      {activeModule === 'payments' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" /> Payments & Disbursements
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage Pending Disbursements, Salaries, Supplier Payments & Advances</p>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
            {[
              { id: 'pending_payments', label: 'Pending Payments' },
              { id: 'salary', label: 'Salary' },
              { id: 'honorarium', label: 'Honorarium' },
              { id: 'supplier_payment', label: 'Supplier Payment' },
              { id: 'advance', label: 'Advance Advances' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setPaymentTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  paymentTab === tab.id 
                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-300' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <p className="text-xs font-bold text-slate-700">Scheduled Payout List ({paymentTab.replace('_', ' ').toUpperCase()})</p>
            <div className="divide-y divide-slate-200">
              <div className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">August 2026 Faculty & Scholar Honorariums</p>
                  <p className="text-[10px] text-slate-500">12 Senior Lecturers & Researchers</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-900">BDT 180,000</span>
                  <button className="px-3 py-1 bg-indigo-600 text-white font-bold rounded text-[11px]">Process Payout</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 5: STUDENT ACCOUNTS */}
      {activeModule === 'student_accounts' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-800" /> Student Financial Accounts
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Collect Fees, Track Student Dues, Manage Discounts & Scholarships</p>
            </div>
            <button 
              onClick={() => setShowFeeModal(true)}
              className="px-4 py-2 bg-[#064e3b] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-emerald-800 transition-colors"
            >
              <Receipt className="w-4 h-4" /> Record Fee Collection
            </button>
          </div>

          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
            {[
              { id: 'fee_collection', label: 'Fee Collection' },
              { id: 'due', label: 'Dues Ledger' },
              { id: 'discount', label: 'Discount Allocation' },
              { id: 'scholarship', label: 'Scholarship Grants' },
              { id: 'refund', label: 'Fee Refund Manager' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStudentAccountTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  studentAccountTab === tab.id 
                    ? 'bg-emerald-100 text-[#064e3b] border border-emerald-300' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3">Student ID</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Course</th>
                  <th className="p-3 text-right">Total Fee</th>
                  <th className="p-3 text-right">Paid</th>
                  <th className="p-3 text-right">Discount / Schol.</th>
                  <th className="p-3 text-right">Due Amount</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Receipt / রসিদ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentAccounts.map(stu => (
                  <tr key={stu.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-700">{stu.studentId}</td>
                    <td className="p-3 font-bold text-slate-900">{stu.studentName}</td>
                    <td className="p-3 text-slate-600">{stu.courseName}</td>
                    <td className="p-3 text-right font-bold text-slate-800">BDT {stu.totalFee.toLocaleString()}</td>
                    <td className="p-3 text-right font-bold text-emerald-700">BDT {stu.paidAmount.toLocaleString()}</td>
                    <td className="p-3 text-right text-slate-500">BDT {(stu.discount + stu.scholarship).toLocaleString()}</td>
                    <td className="p-3 text-right font-black text-amber-700">BDT {stu.dueAmount.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        stu.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        stu.status === 'Partial' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {stu.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => openVoucherModal('student_fee', {
                          type: 'student_fee',
                          voucherNo: 'MFR-' + stu.studentId,
                          date: stu.lastPaymentDate && stu.lastPaymentDate !== '-' ? stu.lastPaymentDate : new Date().toISOString().split('T')[0],
                          studentId: stu.studentId,
                          studentName: stu.studentName,
                          payeeOrPayerName: stu.studentName,
                          courseName: stu.courseName,
                          headOfAccount: 'Academic Tuition Fees',
                          particulars: `Semester Fee Collection - ${stu.courseName}`,
                          amount: stu.paidAmount > 0 ? stu.paidAmount : stu.totalFee,
                          totalPayable: stu.totalFee,
                          amountPaid: stu.paidAmount,
                          balanceDue: stu.dueAmount,
                          discountOrWaiver: stu.discount + stu.scholarship,
                          paymentMethod: 'Cash'
                        })}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold inline-flex items-center gap-1 transition-colors"
                        title="Print 2-Part Student Fee Receipt"
                      >
                        <Printer className="w-3 h-3" />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODULE 6: SALARY & HONORARIUM */}
      {activeModule === 'salary_honorarium' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <HandCoins className="w-5 h-5 text-indigo-700" /> Salary & Honorarium Administration
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Faculty Payroll, Scholar Honorarium Slips & Disbursemets</p>
            </div>
            <button className="px-4 py-2 bg-indigo-700 text-white text-xs font-bold rounded-lg hover:bg-indigo-800">
              Generate Monthly Payroll
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <h3 className="font-bold text-xs text-slate-800">Faculty Monthly Salary Sheet</h3>
              <p className="text-xs text-slate-500">Regular Academic & Administrative Staff Payroll</p>
              <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-200">
                <span className="font-bold">Total Allocation: BDT 320,000</span>
                <span className="text-emerald-700 font-bold">Status: Ready</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <h3 className="font-bold text-xs text-slate-800">Islamic Scholar Honorariums</h3>
              <p className="text-xs text-slate-500">Visiting Muhaddith, Mufassir & Seminar Speakers</p>
              <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-200">
                <span className="font-bold">Total Allocation: BDT 75,000</span>
                <span className="text-emerald-700 font-bold">Status: Approved</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 7: CASH & BANK */}
      {activeModule === 'cash_bank' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-700" /> Cash & Bank Management
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Cash Book, Bank Account Statements & Reconciliation Statements</p>
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            {[
              { id: 'cash_book', label: 'Cash Book' },
              { id: 'bank_accounts', label: 'Bank Accounts' },
              { id: 'bank_reconciliation', label: 'Bank Reconciliation' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCashBankTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  cashBankTab === tab.id 
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Primary Bank</span>
              <h3 className="font-black text-slate-900 text-base">Islami Bank Bangladesh PLC</h3>
              <p className="text-xs text-slate-600">Account No: 2050-10293-88219</p>
              <p className="text-lg font-black text-emerald-800 pt-2">BDT 450,000.00</p>
            </div>

            <div className="p-5 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Vault & Petty Cash</span>
              <h3 className="font-black text-slate-900 text-base">Institute Cash in Hand</h3>
              <p className="text-xs text-slate-600">Main Office Safe / Vault</p>
              <p className="text-lg font-black text-emerald-800 pt-2">BDT 38,500.00</p>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 8: PURCHASE & SUPPLIERS */}
      {activeModule === 'purchase_suppliers' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-700" /> Purchase & Suppliers
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Procurement Orders, Vendor Ledgers & Equipment Acquisitions</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900">Maktabat Al-Iman Press</p>
                <p className="text-slate-500 text-[10px]">Supplier of Classical Arabic Books & Manuscripts</p>
              </div>
              <span className="font-bold text-slate-700">Total Purchases: BDT 85,000</span>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 9: BUDGET */}
      {activeModule === 'budget' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-700" /> Annual & Departmental Budget
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Departmental Allocations vs Actual Spending Ratios</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 border border-slate-200 rounded-lg space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Research & Publication Wing</span>
                <span>BDT 120,000 / BDT 200,000 (60% Used)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-[60%]"></div>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Digital Library & Tech Infrastructure</span>
                <span>BDT 45,000 / BDT 80,000 (56% Used)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-[56%]"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 10: ACCOUNTS */}
      {activeModule === 'accounts' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-800" /> General Accounts & Double-Entry Ledger
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Chart of Accounts, General Ledger, Trial Balance & Journal Entries</p>
            </div>
            <button 
              onClick={() => setShowJournalModal(true)}
              className="px-4 py-2 bg-[#064e3b] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-emerald-800 transition-colors"
            >
              <Plus className="w-4 h-4" /> Post Journal Entry
            </button>
          </div>

          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
            {[
              { id: 'chart_of_accounts', label: 'Chart of Accounts' },
              { id: 'ledger', label: 'General Ledger' },
              { id: 'trial_balance', label: 'Trial Balance' },
              { id: 'journal', label: 'Journal Entries' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setAccountsTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  accountsTab === tab.id 
                    ? 'bg-emerald-100 text-[#064e3b] border border-emerald-300' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {accountsTab === 'journal' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="p-3">Entry No</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Account Head</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Debit (BDT)</th>
                    <th className="p-3 text-right">Credit (BDT)</th>
                    <th className="p-3 text-center">Print JV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {journals.map(j => (
                    <tr key={j.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-700">{j.entryNo}</td>
                      <td className="p-3 text-slate-500">{j.date}</td>
                      <td className="p-3 font-bold text-slate-900">{j.accountHead}</td>
                      <td className="p-3 text-slate-600">{j.accountType}</td>
                      <td className="p-3 text-slate-500">{j.description}</td>
                      <td className="p-3 text-right font-bold text-emerald-700">{j.debit > 0 ? j.debit.toLocaleString() : '-'}</td>
                      <td className="p-3 text-right font-bold text-indigo-700">{j.credit > 0 ? j.credit.toLocaleString() : '-'}</td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={() => openVoucherModal('journal', {
                            type: 'journal',
                            voucherNo: j.entryNo,
                            date: j.date,
                            particulars: j.description,
                            amount: j.debit || j.credit,
                            headOfAccount: j.accountHead,
                            payeeOrPayerName: 'Internal Transfer / Adjustments',
                            paymentMethod: 'Adjusted',
                            journalEntries: [
                              {
                                accountCode: 'ACC-' + j.id,
                                accountHead: j.accountHead,
                                description: j.description,
                                debit: j.debit,
                                credit: j.credit
                              }
                            ]
                          })}
                          className="px-2 py-1 bg-slate-100 hover:bg-purple-50 text-purple-800 border border-purple-200 rounded text-[10px] font-bold inline-flex items-center gap-1 transition-colors"
                          title="Print Journal Voucher"
                        >
                          <Printer className="w-3 h-3" />
                          JV
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
              <p className="font-bold text-slate-800 uppercase">Standard Shariah Chart of Accounts</p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li><strong>1000 - Assets:</strong> Cash in Hand, Bank Balances, Library Collections, Property & Equipment</li>
                <li><strong>2000 - Liabilities:</strong> Supplier Payables, Pending Salaries, Deferred Fees</li>
                <li><strong>3000 - Equity & Waqf:</strong> Capital Reserve, Waqf Funds, Endowment Reserves</li>
                <li><strong>4000 - Revenue:</strong> Student Tuition Fees, General Donations, Course Income</li>
                <li><strong>5000 - Expenses:</strong> Academic Salaries, Utilities, Research Grants, Book Purchasing</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* MODULE 11: REPORTS */}
      {activeModule === 'reports' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-700" /> Financial Reports & Statements
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Generate Balance Sheet, Income vs Expense, Cash Flow & Audit Reports</p>
            </div>
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print Statement
            </button>
          </div>

          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
            {[
              { id: 'income_report', label: 'Income Statement' },
              { id: 'expense_report', label: 'Expense Statement' },
              { id: 'cash_flow', label: 'Cash Flow' },
              { id: 'due_report', label: 'Dues Report' },
              { id: 'budget_vs_actual', label: 'Budget vs Actual' },
              { id: 'financial_statements', label: 'Balance Sheet' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setReportsTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  reportsTab === tab.id 
                    ? 'bg-blue-100 text-blue-900 border border-blue-300' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 border border-slate-200 rounded-xl bg-slate-50 space-y-4">
            <div className="text-center border-b border-slate-200 pb-4">
              <h3 className="font-bold text-base text-slate-900">AS-SUNNAH DAWAH AND RESEARCH INSTITUTE</h3>
              <p className="text-xs text-slate-500 uppercase font-semibold">Official Financial Statement ({reportsTab.replace('_', ' ').toUpperCase()})</p>
              <p className="text-[10px] text-slate-400 mt-0.5">As of {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}</p>
            </div>

            <div className="max-w-md mx-auto space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-semibold text-slate-700">Gross Recognized Revenue:</span>
                <span className="font-bold text-emerald-800">BDT {totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="font-semibold text-slate-700">Total Operating Expenses:</span>
                <span className="font-bold text-rose-800">BDT {totalApprovedExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-800 font-black text-sm">
                <span>Net Surplus / (Deficit):</span>
                <span className={netSurplus >= 0 ? 'text-emerald-800' : 'text-rose-800'}>
                  BDT {netSurplus.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 12: AUDIT LOG */}
      {activeModule === 'audit_log' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-amber-700" /> Shariah & Financial Audit Logs
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Immutable Activity Record of All Financial Transactions and Approvals</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Performed By</th>
                  <th className="p-3">Details</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-500 text-[11px]">{log.timestamp}</td>
                    <td className="p-3 font-bold text-slate-900">{log.action}</td>
                    <td className="p-3 text-slate-600">{log.module}</td>
                    <td className="p-3 text-slate-600">{log.performedBy}</td>
                    <td className="p-3 text-slate-500">{log.details}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800">
                      {log.amount ? `BDT ${log.amount.toLocaleString()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODULE: VOUCHERS & RECEIPTS HUB */}
      {activeModule === 'vouchers' && (
        <div className="space-y-6">
          {/* Header Summary Card */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-emerald-200">
                  <Stamp className="w-3.5 h-3.5" />
                  Official Auditable Voucher & Receipt System
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-serif">
                  Vouchers & Receipts Center (ভাউচার ও রসিদ ব্যবস্থাপনা)
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
                  Generate, customize, and print audit-compliant financial vouchers, dual-copy student fee receipts, salary disbursement slips, and Shariah Waqf/Donation receipts.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button 
                  onClick={() => openVoucherModal('debit')}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  + Create Debit Voucher
                </button>
                <button 
                  onClick={() => openVoucherModal('student_fee')}
                  className="px-4 py-2.5 bg-white text-emerald-950 hover:bg-emerald-50 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Fee Receipt (2-Copy)
                </button>
              </div>
            </div>
          </div>

          {/* Grid of 7 Essential Vouchers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {VOUCHER_DEFINITIONS.map(v => (
              <div 
                key={v.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-800">
                      {v.category}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700 font-bold">
                      {v.id.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-emerald-800 transition-colors">
                    {v.nameEn}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700 font-serif mb-2">
                    {v.nameBn}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {v.desc}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openVoucherModal(v.id)}
                    className="w-full py-2 bg-slate-900 hover:bg-[#064e3b] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Generate & Print
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Print from Recent Transactions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-700" /> Quick-Print from Registered Records
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any transaction below to instantly load and print its corresponding official voucher
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent Incomes */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 uppercase">Recent Income / Receipts</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">{incomes.length} records</span>
                </div>
                <div className="space-y-2">
                  {incomes.slice(0, 3).map(inc => (
                    <div key={inc.id} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-2 hover:border-emerald-300 transition-colors">
                      <div className="text-xs">
                        <p className="font-bold text-slate-900">{inc.title}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{inc.referenceNo} • {inc.payerName}</p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="text-xs font-extrabold text-emerald-700 font-mono">BDT {inc.amount.toLocaleString()}</span>
                        <button
                          onClick={() => openVoucherModal(
                            inc.source === 'donations' ? 'donation' : (inc.source === 'student_fees' ? 'student_fee' : 'credit'),
                            {
                              type: inc.source === 'donations' ? 'donation' : (inc.source === 'student_fees' ? 'student_fee' : 'credit'),
                              voucherNo: inc.referenceNo || 'CR-' + inc.id,
                              date: inc.date,
                              payeeOrPayerName: inc.payerName,
                              amount: inc.amount,
                              paymentMethod: inc.paymentMethod,
                              chequeOrTrxNo: inc.referenceNo,
                              particulars: inc.title,
                              headOfAccount: inc.source === 'student_fees' ? 'Student Tuition Accounts (4001)' : inc.source === 'donations' ? 'Waqf & Zakat Endowment Fund (3010)' : (inc.title || 'Institutional Revenue Collection'),
                              notes: `Ref: ${inc.referenceNo} • ${inc.paymentMethod}`,
                              studentName: inc.source === 'student_fees' ? inc.payerName : undefined,
                              tuitionFee: inc.source === 'student_fees' ? inc.amount : undefined,
                              amountPaid: inc.source === 'student_fees' ? inc.amount : undefined,
                              donationCategory: inc.source === 'donations' ? 'Endowment Fund' : undefined
                            }
                          )}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded border border-emerald-200 text-xs font-bold transition-colors"
                          title="Print Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Expenses */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-900 uppercase">Recent Expense Claims</span>
                  <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">{expenses.length} records</span>
                </div>
                <div className="space-y-2">
                  {expenses.slice(0, 3).map(exp => (
                    <div key={exp.id} className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-2 hover:border-rose-300 transition-colors">
                      <div className="text-xs">
                        <p className="font-bold text-slate-900">{exp.title}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{exp.receiptNo || 'N/A'} • {exp.payeeName || exp.requestedBy}</p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="text-xs font-extrabold text-rose-700 font-mono">-BDT {exp.amount.toLocaleString()}</span>
                        <button
                          onClick={() => openVoucherModal('debit', {
                            type: 'debit',
                            voucherNo: exp.receiptNo || 'DEB-' + exp.id,
                            date: exp.date,
                            payeeOrPayerName: exp.payeeName || exp.requestedBy,
                            beneficiaryRole: exp.requestedBy ? `Requested by: ${exp.requestedBy}` : 'Payee / Supplier',
                            amount: exp.amount,
                            particulars: exp.title,
                            headOfAccount: exp.category,
                            paymentMethod: 'Cash',
                            notes: `Approval Status: ${exp.status}${exp.notes ? ' • ' + exp.notes : ''}`,
                            approvedBy: exp.approvedBy || (exp.status === 'Approved' ? 'Dr. Director / Principal' : '')
                          })}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded border border-rose-200 text-xs font-bold transition-colors"
                          title="Print Debit Voucher"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>

      {/* MODAL 1: ADD INCOME */}
      {showIncomeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-700" /> Record New Income Entry
              </h3>
              <button onClick={() => setShowIncomeModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddIncome} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Income Category / Source *</label>
                <select 
                  value={newIncome.source}
                  onChange={(e) => setNewIncome({...newIncome, source: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none"
                >
                  <option value="student_fees">Student Tuition & Admission Fees</option>
                  <option value="donations">Donations & Waqf Endowment Fund</option>
                  <option value="course_income">Short Courses & Special Workshops</option>
                  <option value="other_income">Publications & Book Sales</option>
                  <option value="research_grant">Research Grants & Sponsorships</option>
                  <option value="custom">✏️ + Enter Custom Category (কাস্টম খাত)...</option>
                </select>

                {newIncome.source === 'custom' && (
                  <div className="mt-2">
                    <input 
                      type="text"
                      required
                      placeholder="Type custom income category (e.g. Media Production, Halal Cert)"
                      value={newIncome.customSource}
                      onChange={(e) => setNewIncome({...newIncome, customSource: e.target.value})}
                      className="w-full p-2 border border-emerald-300 rounded-lg bg-emerald-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-700 outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Title / Particulars *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Hifz Course Semester Fee"
                  value={newIncome.title}
                  onChange={(e) => setNewIncome({...newIncome, title: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Amount (BDT) *</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    placeholder="5000"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({...newIncome, amount: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                  <select 
                    value={newIncome.paymentMethod}
                    onChange={(e) => setNewIncome({...newIncome, paymentMethod: e.target.value as any})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Check">Check</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Payer Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Abdur Rahman"
                  value={newIncome.payerName}
                  onChange={(e) => setNewIncome({...newIncome, payerName: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Transaction Ref / TRX ID</label>
                <input 
                  type="text"
                  placeholder="e.g. TRX-102938 or Bank A/C Slip"
                  value={newIncome.referenceNo}
                  onChange={(e) => setNewIncome({...newIncome, referenceNo: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none font-mono uppercase"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowIncomeModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-[#064e3b] text-white font-bold rounded-lg hover:bg-emerald-800"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD EXPENSE CLAIM */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-600" /> Submit Expense Requisition
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Expense Category *</label>
                <select 
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  <option value="Library & Research Books">Library & Research Books</option>
                  <option value="Campus Utilities">Campus Utilities & Bills</option>
                  <option value="Teacher Honorarium">Teacher & Guest Honorarium</option>
                  <option value="IT & Server Hosting">IT, Software & Server Hosting</option>
                  <option value="General Supplies">General Supplies & Maintenance</option>
                  <option value="Printing & Publications">Printing & Publication Costs</option>
                  <option value="Events & Seminars">Events & Seminars</option>
                  <option value="Student Aid & Scholarships">Student Aid & Scholarships</option>
                  <option value="custom">✏️ + Enter Custom Category (কাস্টম ব্যয় খাত)...</option>
                </select>

                {newExpense.category === 'custom' && (
                  <div className="mt-2">
                    <input 
                      type="text"
                      required
                      placeholder="Type custom expense category (e.g. Campus Renovation)"
                      value={newExpense.customCategory}
                      onChange={(e) => setNewExpense({...newExpense, customCategory: e.target.value})}
                      className="w-full p-2 border border-amber-300 rounded-lg bg-amber-50/50 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Expense Title / Particulars *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Manuscript Archiving & Binding Software"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Amount (BDT) *</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    placeholder="3500"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payee / Vendor</label>
                  <input 
                    type="text"
                    placeholder="Vendor / Payee Name"
                    value={newExpense.payeeName}
                    onChange={(e) => setNewExpense({...newExpense, payeeName: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Additional Notes (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. Approved in Academic Council meeting"
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({...newExpense, notes: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowExpenseModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-600 shadow-sm"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: COLLECT STUDENT FEE */}
      {showFeeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-700" /> Record Student Fee Collection
                </h3>
                <p className="text-[11px] text-slate-500">Search student ID or select from enrolled student accounts</p>
              </div>
              <button onClick={() => setShowFeeModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectStudentFee} className="space-y-3 text-xs">
              {/* Student Search & Quick Select Filter */}
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-emerald-700" />
                    Search Student ID / Name / Course
                  </span>
                  {studentSearchTerm && (
                    <button 
                      type="button" 
                      onClick={() => setStudentSearchTerm('')} 
                      className="text-[10px] text-slate-400 hover:text-slate-600"
                    >
                      Clear Search
                    </button>
                  )}
                </label>

                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Type student ID (e.g. STD-1001), name or course..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                {/* Dropdown with filtered results */}
                <div className="pt-1">
                  <label className="font-semibold text-slate-600 block mb-1 text-[11px]">Select Matching Student Record *</label>
                  <select 
                    required
                    value={feeForm.studentId}
                    onChange={(e) => {
                      const selId = e.target.value;
                      setFeeForm({...feeForm, studentId: selId});
                      const found = studentAccounts.find(s => s.studentId === selId);
                      if (found && found.dueAmount > 0) {
                        setFeeForm(prev => ({ ...prev, studentId: selId, amount: String(found.dueAmount) }));
                      }
                    }}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-700 outline-none"
                  >
                    <option value="">-- Choose Student from List --</option>
                    {studentAccounts
                      .filter(s => {
                        if (!studentSearchTerm) return true;
                        const term = studentSearchTerm.toLowerCase();
                        return (
                          s.studentName.toLowerCase().includes(term) ||
                          s.studentId.toLowerCase().includes(term) ||
                          s.courseName.toLowerCase().includes(term)
                        );
                      })
                      .map(s => (
                        <option key={s.id} value={s.studentId}>
                          {s.studentName} [{s.studentId}] — {s.courseName} | Due: BDT {s.dueAmount.toLocaleString()}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Selected Student Account Snapshot Card */}
                {feeForm.studentId && (() => {
                  const sel = studentAccounts.find(s => s.studentId === feeForm.studentId);
                  if (!sel) return null;
                  return (
                    <div className="mt-2 p-2.5 bg-emerald-50/80 rounded-lg border border-emerald-200 text-emerald-950 text-[11px] space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{sel.studentName} ({sel.studentId})</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          sel.dueAmount === 0 ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                        }`}>
                          {sel.status}
                        </span>
                      </div>
                      <p className="text-emerald-800 text-[10px]">{sel.courseName}</p>
                      <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] border-t border-emerald-200">
                        <div>Total: <strong>৳{sel.totalFee.toLocaleString()}</strong></div>
                        <div>Paid: <strong className="text-emerald-700">৳{sel.paidAmount.toLocaleString()}</strong></div>
                        <div>Due: <strong className="text-rose-700">৳{sel.dueAmount.toLocaleString()}</strong></div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Fee & Payment Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fee Amount Paid (BDT) *</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    placeholder="5000"
                    value={feeForm.amount}
                    onChange={(e) => setFeeForm({...feeForm, amount: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                  <select 
                    value={feeForm.paymentMethod}
                    onChange={(e) => setFeeForm({...feeForm, paymentMethod: e.target.value as any})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Cash">Cash in Hand</option>
                    <option value="Bank Transfer">Bank Transfer (IBBL)</option>
                    <option value="Check">Bank Cheque</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Special Discount (BDT)</label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="0"
                    value={feeForm.discount}
                    onChange={(e) => setFeeForm({...feeForm, discount: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Scholarship / Zakat (BDT)</label>
                  <input 
                    type="number"
                    min="0"
                    placeholder="0"
                    value={feeForm.scholarship}
                    onChange={(e) => setFeeForm({...feeForm, scholarship: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Payment Reference / TrxID / Receipt No</label>
                <input 
                  type="text"
                  placeholder="e.g. bKash TRX-883921 / Bank Deposit Slip"
                  value={feeForm.referenceNo}
                  onChange={(e) => setFeeForm({...feeForm, referenceNo: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-700 outline-none font-mono uppercase"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowFeeModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-[#064e3b] text-white font-bold rounded-lg hover:bg-emerald-800 shadow-sm"
                >
                  Collect & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: JOURNAL ENTRY */}
      {showJournalModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Post Double-Entry Journal Voucher</h3>
              <button onClick={() => setShowJournalModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddJournalEntry} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Account Head</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Cash at Bank (Islami Bank)"
                  value={journalForm.accountHead}
                  onChange={(e) => setJournalForm({...journalForm, accountHead: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Debit Amount (BDT)</label>
                  <input 
                    type="number"
                    placeholder="0"
                    value={journalForm.debit}
                    onChange={(e) => setJournalForm({...journalForm, debit: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Credit Amount (BDT)</label>
                  <input 
                    type="number"
                    placeholder="0"
                    value={journalForm.credit}
                    onChange={(e) => setJournalForm({...journalForm, credit: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description / Particulars</label>
                <input 
                  type="text"
                  placeholder="e.g. Manual Adjustment for End-of-month Bank Charges"
                  value={journalForm.description}
                  onChange={(e) => setJournalForm({...journalForm, description: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowJournalModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-[#064e3b] text-white font-bold rounded-lg hover:bg-emerald-800"
                >
                  Post Journal Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE 7-TYPE PRINTABLE VOUCHER & RECEIPT MODAL */}
      <PrintableVoucherModal
        isOpen={showVoucherModal}
        onClose={() => setShowVoucherModal(false)}
        initialType={voucherModalType}
        initialData={voucherModalData}
      />

    </div>
  );
}
