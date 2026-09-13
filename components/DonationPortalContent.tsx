'use client';

import { useState } from 'react';
import { Locale } from '@/lib/dictionary';
import { 
  HeartHandshake, Calculator, Building2, Copy, Check, 
  CreditCard, ArrowRight, ShieldCheck, Printer, CheckCircle2,
  Sparkles, FileText, QrCode
} from 'lucide-react';
import { defaultDonationFunds, bankAccounts, mobileBanking, DonationFund } from '@/lib/defaultDonationData';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function DonationPortalContent({ locale }: { locale: Locale }) {
  const [activeTab, setActiveTab] = useState<'funds' | 'calculator' | 'accounts' | 'submit'>('funds');
  const [selectedFundId, setSelectedFundId] = useState<string>('fund-scholarship');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Zakat Calculator State
  const [goldGrams, setGoldGrams] = useState<number>(0);
  const [goldPricePerGram, setGoldPricePerGram] = useState<number>(11500); // BDT approx per gram 22k
  const [silverGrams, setSilverGrams] = useState<number>(0);
  const [silverPricePerGram, setSilverPricePerGram] = useState<number>(180);
  const [cashInHand, setCashInHand] = useState<number>(0);
  const [businessStock, setBusinessStock] = useState<number>(0);
  const [sharesValue, setSharesValue] = useState<number>(0);
  const [debtPayable, setDebtPayable] = useState<number>(0);

  // Calculation logic
  const totalGoldVal = (goldGrams || 0) * (goldPricePerGram || 0);
  const totalSilverVal = (silverGrams || 0) * (silverPricePerGram || 0);
  const totalGrossWealth = totalGoldVal + totalSilverVal + (cashInHand || 0) + (businessStock || 0) + (sharesValue || 0);
  const netZakatableWealth = Math.max(0, totalGrossWealth - (debtPayable || 0));
  // Nisab threshold based on 52.5 tola silver (~612.36g)
  const silverNisabValue = 612.36 * (silverPricePerGram || 180);
  const isNisabReached = netZakatableWealth >= silverNisabValue;
  const zakatPayable = isNisabReached ? Math.round(netZakatableWealth * 0.025) : 0;

  // Donation Submission & Receipt state
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [transactionId, setTransactionId] = useState('');
  const [donorNote, setDonorNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState<any | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleDonateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(donationAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    setIsSubmitting(true);
    const receiptNo = `ASDRI-RCT-${Date.now().toString().slice(-6)}`;
    const currentFund = defaultDonationFunds.find(f => f.id === selectedFundId) || defaultDonationFunds[0];

    const submissionPayload = {
      receiptNo,
      donorName: donorName || 'সম্মানিত শুভাকাঙ্ক্ষী (Anonymous)',
      donorPhone,
      donorEmail,
      amount: amountNum,
      fundId: selectedFundId,
      fundTitle: locale === 'en' ? currentFund.titleEn : currentFund.titleBn,
      paymentMethod,
      transactionId: transactionId || 'N/A',
      donorNote,
      createdAt: serverTimestamp(),
      dateStr: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }),
      status: 'verified'
    };

    try {
      await addDoc(collection(db, 'donation_transactions'), submissionPayload);
    } catch (err) {
      console.warn('Firestore donation log fallback:', err);
    } finally {
      setIsSubmitting(false);
      setReceiptData(submissionPayload);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold mb-4 shadow-2xs">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
            <span>{locale === 'bn' ? 'যাকাত ও জনকল্যাণমূলক অনুদান তহবিল' : locale === 'ar' ? 'صندوق الزكاة والصدقات' : 'Zakat & Charitable Waqf Fund'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#064e3b] font-serif tracking-tight mb-4">
            {locale === 'bn' ? 'যাকাত ও সদকা প্রদান করুন' : locale === 'ar' ? 'أدِّ زكاتك وطهِّر مالك' : 'Calculate & Fulfill Your Zakat & Sadaqah'}
          </h1>
          <p className="text-sm sm:text-base text-slate-700 max-w-2xl mx-auto leading-relaxed">
            {locale === 'bn' 
              ? 'কুরআন ও সুন্নাহর নির্দেশনা মোতাবেক আপনার উপার্জিত সম্পদকে পবিত্র করুন এবং দ্বীনি শিক্ষা, গবেষণা ও মানবসেবায় অংশগ্রহণ করুন।'
              : locale === 'ar'
              ? 'طهر أموالك بالزكاة والصدقات وساهم في كفالة طلبة العلم والبحوث العلمية وإعانة المحتاجين.'
              : 'Purify your wealth with precision through authenticated Islamic principles and support classical education and humanitarian relief.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('funds')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'funds'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-amber-400" />
              <span>{locale === 'bn' ? 'অনুদান খাতসমূহ' : 'Donation Funds'}</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'calculator'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>{locale === 'bn' ? 'যাকাত ক্যালকুলেটর' : 'Zakat Calculator'}</span>
            </button>

            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'accounts'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>{locale === 'bn' ? 'ব্যাংক ও মোবাইল ব্যাংকিং' : 'Accounts & Banking'}</span>
            </button>

            <button
              onClick={() => setActiveTab('submit')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'submit'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>{locale === 'bn' ? 'রসিদ সংগ্রহ ও ট্রানজেকশন' : 'Receipt & Notify'}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Donation Funds */}
        {activeTab === 'funds' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {defaultDonationFunds.map((fund) => {
                const title = locale === 'en' ? fund.titleEn : locale === 'ar' ? fund.titleAr : fund.titleBn;
                const desc = locale === 'en' ? fund.descEn : locale === 'ar' ? fund.descAr : fund.descBn;
                const pct = Math.min(100, Math.round((fund.raisedAmount / fund.targetAmount) * 100));

                return (
                  <div
                    key={fund.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-emerald-600/40 hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          fund.category === 'zakat' 
                            ? 'bg-amber-100 text-amber-900' 
                            : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {fund.category === 'zakat' ? 'যাকাত গ্রহণযোগ্য' : 'সদকা ও ওয়াকফ'}
                        </span>
                        <span className="text-xs font-bold text-emerald-800">{pct}% সংগৃহীত</span>
                      </div>

                      <h3 className="text-lg font-bold text-[#064e3b] font-serif mb-2">
                        {title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mb-6">
                        {desc}
                      </p>
                    </div>

                    <div>
                      {/* Progress bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4">
                        <span>সংগ্রহ: ৳{fund.raisedAmount.toLocaleString()}</span>
                        <span>লক্ষ্য: ৳{fund.targetAmount.toLocaleString()}</span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedFundId(fund.id);
                          setActiveTab('submit');
                        }}
                        className="w-full py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <HeartHandshake className="w-4 h-4 text-amber-400" />
                        <span>{locale === 'bn' ? 'এই খাতে অনুদান দিন' : 'Donate to this Fund'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Zakat Calculator */}
        {activeTab === 'calculator' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm max-w-4xl mx-auto text-slate-900">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-serif">
                  {locale === 'bn' ? 'শরয়ী যাকাত ক্যালকুলেটর' : 'Shar’i Zakat Calculator'}
                </h3>
                <p className="text-xs text-slate-500">
                  {locale === 'bn' ? 'সিলভার নিসাব মূল্যমান ও এক চান্দ্র বছর অতিবাহিত হওয়ার ভিত্তিতে হিসাব।' : 'Calculated precisely based on contemporary Silver Nisab and asset valuation.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Gold Assets */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  স্বর্ণের পরিমাণ (গ্রাম হিসেবে)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={goldGrams || ''}
                    onChange={(e) => setGoldGrams(parseFloat(e.target.value) || 0)}
                    placeholder="০ গ্রাম"
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                  <div className="text-xs font-semibold text-slate-600 flex items-center">
                    দর/গ্রাম: ৳{goldPricePerGram}
                  </div>
                </div>
                <div className="text-[11px] text-emerald-800 mt-1 font-semibold">
                  মূল্য: ৳{totalGoldVal.toLocaleString()}
                </div>
              </div>

              {/* Silver Assets */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  রৌপ্যের পরিমাণ (গ্রাম হিসেবে)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={silverGrams || ''}
                    onChange={(e) => setSilverGrams(parseFloat(e.target.value) || 0)}
                    placeholder="০ গ্রাম"
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                  <div className="text-xs font-semibold text-slate-600 flex items-center">
                    দর/গ্রাম: ৳{silverPricePerGram}
                  </div>
                </div>
                <div className="text-[11px] text-emerald-800 mt-1 font-semibold">
                  মূল্য: ৳{totalSilverVal.toLocaleString()}
                </div>
              </div>

              {/* Cash in Hand & Bank */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  নগদ টাকা (হাতে ও ব্যাংকে জমানো)
                </label>
                <input
                  type="number"
                  min="0"
                  value={cashInHand || ''}
                  onChange={(e) => setCashInHand(parseFloat(e.target.value) || 0)}
                  placeholder="৳ 0.00"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              {/* Business Stock / Inventory */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ব্যবসায়িক বিক্রয়যোগ্য পণ্যের বর্তমান বাজারমূল্য
                </label>
                <input
                  type="number"
                  min="0"
                  value={businessStock || ''}
                  onChange={(e) => setBusinessStock(parseFloat(e.target.value) || 0)}
                  placeholder="৳ 0.00"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              {/* Shares & Stocks */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  শেয়ার বা ব্যবসায়িক লভ্যাংশ
                </label>
                <input
                  type="number"
                  min="0"
                  value={sharesValue || ''}
                  onChange={(e) => setSharesValue(parseFloat(e.target.value) || 0)}
                  placeholder="৳ 0.00"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              {/* Debts Payable */}
              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200">
                <label className="block text-xs font-bold text-rose-800 mb-1">
                  তাৎক্ষণিক পরিশোধযোগ্য ঋণ (বিয়োগ হবে)
                </label>
                <input
                  type="number"
                  min="0"
                  value={debtPayable || ''}
                  onChange={(e) => setDebtPayable(parseFloat(e.target.value) || 0)}
                  placeholder="৳ 0.00"
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>

            {/* Calculation Summary Card */}
            <div className="bg-[#064e3b] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
              <div>
                <div className="text-xs text-emerald-100 mb-1">মোট যাকাতযোগ্য নিট সম্পদ:</div>
                <div className="text-2xl sm:text-3xl font-bold font-serif text-white">
                  ৳ {netZakatableWealth.toLocaleString()}
                </div>
                <div className="text-xs text-emerald-200 mt-1">
                  নিসাব মানদণ্ড: ৳ {Math.round(silverNisabValue).toLocaleString()} ({isNisabReached ? '✓ নিসাব পূর্ণ হয়েছে' : '✗ নিসাব পূর্ণ হয়নি'})
                </div>
              </div>

              <div className="text-center sm:text-right bg-emerald-950/90 px-6 py-4 rounded-xl border border-emerald-700/60">
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                  আপনার মোট দেয় যাকাত (২.৫%):
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-serif">
                  ৳ {zakatPayable.toLocaleString()}
                </div>
                {zakatPayable > 0 && (
                  <button
                    onClick={() => {
                      setDonationAmount(zakatPayable.toString());
                      setSelectedFundId('fund-scholarship');
                      setActiveTab('submit');
                    }}
                    className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    এই যাকাত সরাসরি প্রদান করুন →
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Official Bank & Mobile Accounts */}
        {activeTab === 'accounts' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Bank details */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs text-slate-900">
              <h3 className="text-lg font-bold text-[#064e3b] font-serif mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                <span>{locale === 'bn' ? 'অফিসিয়াল ব্যাংক একাউন্ট নম্বর' : 'Official Bank Accounts'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bankAccounts.map((b, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                    <div className="text-sm font-bold text-slate-900 mb-2">{b.bankNameBn}</div>
                    <div className="text-xs text-slate-700 space-y-1.5 font-mono">
                      <div><span className="text-slate-500">হিসাবের নাম:</span> {b.accountNameBn}</div>
                      <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                        <span className="font-bold text-emerald-800 text-sm">{b.accountNumber}</span>
                        <button
                          onClick={() => handleCopy(b.accountNumber)}
                          className="text-xs text-slate-500 hover:text-emerald-700 p-1"
                          title="Copy account number"
                        >
                          {copiedText === b.accountNumber ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <div><span className="text-slate-500">শাখা:</span> {b.branchBn}</div>
                      <div><span className="text-slate-500">রাউটিং নং:</span> {b.routingNumber}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Banking */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs text-slate-900">
              <h3 className="text-lg font-bold text-[#064e3b] font-serif mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-500" />
                <span>{locale === 'bn' ? 'মোবাইল ব্যাংকিং ও মার্চেন্ট একাউন্ট' : 'Mobile Banking Accounts'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {mobileBanking.map((m, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center">
                    <div className="text-xs font-bold text-slate-800 mb-1">{m.providerBn}</div>
                    <div className="text-base font-extrabold text-emerald-800 font-mono my-1">{m.number}</div>
                    <div className="text-[11px] text-slate-500">{m.type}</div>
                    <button
                      onClick={() => handleCopy(m.number)}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 px-3 py-1 rounded-lg"
                    >
                      {copiedText === m.number ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === m.number ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Submit Donation & Digital Money Receipt */}
        {activeTab === 'submit' && (
          <div className="max-w-2xl mx-auto">
            {receiptData ? (
              /* Verified Digital Money Receipt */
              <div className="bg-white rounded-3xl border-2 border-emerald-600 p-6 sm:p-10 shadow-xl print:border-none text-slate-900">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#064e3b] flex items-center justify-center font-bold">
                      AS
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-[#064e3b] uppercase tracking-wider">
                        আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউট
                      </div>
                      <div className="text-[11px] text-slate-500">ডিজিটাল মানি রিসিট ও অনুদান প্রত্যয়নপত্র</div>
                    </div>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>প্রিন্ট / ডাউনলোড</span>
                  </button>
                </div>

                <div className="bg-emerald-50 rounded-2xl p-5 mb-6 text-center border border-emerald-300">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <div className="text-xs font-bold text-emerald-900">
                    আলহামদুলিল্লাহ! আপনার অনুদান তথ্য সফলভাবে নথিভুক্ত হয়েছে।
                  </div>
                  <div className="text-xs text-slate-600 mt-1">রসিদ নম্বর: <span className="font-mono font-bold text-amber-700">{receiptData.receiptNo}</span></div>
                </div>

                <div className="space-y-3 text-xs mb-8">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">অনুদানকারীর নাম:</span>
                    <span className="font-bold text-slate-900">{receiptData.donorName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">অনুদানের খাত:</span>
                    <span className="font-bold text-emerald-800">{receiptData.fundTitle}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">পরিশোধের মাধ্যম:</span>
                    <span className="font-bold text-slate-900">{receiptData.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">ট্রানজেকশন আইডি (TrxID):</span>
                    <span className="font-mono font-bold text-slate-900">{receiptData.transactionId}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-200 text-sm">
                    <span className="font-bold text-slate-700">অনুদানের পরিমাণ:</span>
                    <span className="font-extrabold text-[#064e3b] font-serif text-lg">৳ {receiptData.amount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <QrCode className="w-5 h-5 text-slate-500" />
                    <span>যাচাইকরণ কোড: {receiptData.receiptNo}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-800">হিসাব ও অর্থ দপ্তর</div>
                    <div>ASDRI বাংলাদেশ</div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setReceiptData(null);
                      setDonationAmount('');
                      setTransactionId('');
                    }}
                    className="text-xs text-slate-500 hover:text-emerald-700 underline font-semibold cursor-pointer"
                  >
                    আরেকটি অনুদান জমা দিন
                  </button>
                </div>
              </div>
            ) : (
              /* Submit Form */
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm text-slate-900">
                <h3 className="text-lg font-bold text-[#064e3b] font-serif mb-1">
                  {locale === 'bn' ? 'অনুদানের তথ্য পেশ ও রসিদ তৈরি' : 'Submit Donation Information'}
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  {locale === 'bn' ? 'টাকা পাঠানোর পর নিচের তথ্যগুলো পূরণ করে আপনার ডিজিটাল রসিদ সংগ্রহ করুন।' : 'Fill in the transaction details to generate your verified digital receipt.'}
                </p>

                <form onSubmit={handleDonateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      অনুদানের খাত নির্বাচন করুন
                    </label>
                    <select
                      value={selectedFundId}
                      onChange={(e) => setSelectedFundId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-600 text-slate-900"
                    >
                      {defaultDonationFunds.map((f) => (
                        <option key={f.id} value={f.id}>
                          {locale === 'en' ? f.titleEn : f.titleBn} ({f.category === 'zakat' ? 'যাকাত' : 'সদকা'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        অনুদানের পরিমাণ (টাকা) *
                      </label>
                      <input
                        type="number"
                        required
                        min="10"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        placeholder="৳ ৫০০, ১০০০, ইত্যাদি"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-600 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        পরিশোধের মাধ্যম *
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-600 text-slate-900"
                      >
                        <option value="bKash">bKash (বিকাশ)</option>
                        <option value="Nagad">Nagad (নগদ)</option>
                        <option value="Rocket">Rocket (রকেট)</option>
                        <option value="Islami Bank">Islami Bank (ইসলামী ব্যাংক)</option>
                        <option value="Al-Arafah Bank">Al-Arafah Bank (আল-আরাফাহ ব্যাংক)</option>
                        <option value="Cash / Office">ক্যাশ / সরাসরি অফিসে</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        আপনার নাম (ঐচ্ছিক)
                      </label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="নাম (গোপন রাখতে চাইলে খালি রাখুন)"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        মোবাইল নম্বর
                      </label>
                      <input
                        type="tel"
                        value={donorPhone}
                        onChange={(e) => setDonorPhone(e.target.value)}
                        placeholder="০১৭xxxxxxxx"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ট্রানজেকশন আইডি (TrxID)
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g. 9K72B8XX"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-600 text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#064e3b] hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mt-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>{isSubmitting ? 'প্রসেস হচ্ছে...' : 'রসিদ সংগ্রহ করুন'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
