'use client';

import React from 'react';
import { ZakatFormField, ZAKAT_WARNING_TEXT, ZAKAT_UNDERTAKING_TEXT } from '@/lib/constants/zakatFormTemplate';
import { ShieldAlert, Info, UserCheck, Wallet, DollarSign, FileCheck } from 'lucide-react';

interface ZakatFormRendererProps {
  fields: ZakatFormField[];
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  totalCourseFee?: number;
  readOnly?: boolean;
  formTitle?: string;
  formSubtitle?: string;
  warningText?: string;
  undertakingText?: string;
}

export default function ZakatFormRenderer({
  fields,
  values,
  onChange,
  totalCourseFee = 0,
  readOnly = false,
  formTitle,
  formSubtitle,
  warningText,
  undertakingText,
}: ZakatFormRendererProps) {
  const personalFields = fields.filter((f) => f.category === 'personal');
  const financialFields = fields.filter((f) => f.category === 'financial');
  const debtFields = fields.filter((f) => f.category === 'debt');
  const refereeFields = fields.filter((f) => f.category === 'referee');

  const finalWarningText = warningText || ZAKAT_WARNING_TEXT;
  const finalUndertakingText = undertakingText || ZAKAT_UNDERTAKING_TEXT;

  return (
    <div className="space-y-6 font-sans text-slate-800 bg-amber-50/20 p-4 sm:p-6 rounded-2xl border border-amber-200/60">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#064e3b] to-emerald-900 text-white p-4 sm:p-5 rounded-xl shadow-md space-y-2">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-amber-400" />
          <h3 className="text-base sm:text-lg font-bold font-serif">
            {formTitle || "যাকাত ফান্ড ও স্কলারশিপ আবেদন ফরম (Zakat & Scholarship Assessment Form)"}
          </h3>
        </div>
        <p className="text-xs text-emerald-100/90 leading-relaxed">
          {formSubtitle || "আপনার আর্থিক স্বচ্ছলতা না থাকলে আস-সুন্নাহ ফাউন্ডেশন যাকাত ফান্ড অথবা জেনারেল স্কলারশিপ ফান্ড থেকে সহায়তা পেতে নিচের সকল তথ্য নির্ভুলভাবে পূরণ করুন।"}
        </p>
      </div>

      {/* Warning Box */}
      <div className="bg-amber-100/70 border-l-4 border-amber-600 p-4 rounded-r-xl space-y-2 text-amber-950">
        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>বিশেষ সতর্কীকরণ ও দিকনির্দেশনা (Important Notice)</span>
        </div>
        <p className="text-[11px] sm:text-xs leading-relaxed whitespace-pre-line text-amber-900/90">
          {finalWarningText}
        </p>
      </div>

      {/* SECTION 1: Personal & Family Background */}
      {personalFields.length > 0 && (
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-[#064e3b] font-serif border-b border-slate-100 pb-2 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-600" />
            ব্যক্তিগত ও পারিবারিক পরিচিতি
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {personalFields.map((field) => (
              <div key={field.id} className={field.type === 'textarea' ? 'sm:col-span-2 space-y-1' : 'space-y-1'}>
                <label className="block text-xs font-bold text-slate-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    disabled={readOnly}
                    value={values[field.id] || ''}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#064e3b] outline-none disabled:bg-slate-100"
                  >
                    <option value="">-- নির্বাচন করুন --</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    disabled={readOnly}
                    rows={2}
                    placeholder={field.placeholder}
                    value={values[field.id] || ''}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#064e3b] outline-none disabled:bg-slate-100"
                  />
                ) : (
                  <input
                    disabled={readOnly}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={values[field.id] || ''}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-[#064e3b] outline-none disabled:bg-slate-100"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Financial Assets Breakdown */}
      {financialFields.length > 0 && (
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="text-sm font-bold text-[#064e3b] font-serif flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              ১. আবেদনকারীর আর্থিক অবস্থার বিবরণ (Financial Status Details)
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">
              উল্লেখ্য, এখানে নিজ মালিকানাধীন সম্পদের বিবরণ লিখবেন (পিতা, মাতা, স্বামী বা স্ত্রীর সম্পদ নয়)। পরিত্যক্ত সম্পদ বণ্টন থেকে এসে থাকলে তাও অন্তর্ভুক্ত করবেন।
            </p>
          </div>

          <div className="space-y-3">
            {financialFields.map((field) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <label className="md:col-span-2 text-xs font-semibold text-slate-800 leading-snug">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    disabled={readOnly}
                    type={field.type === 'number' ? 'number' : 'text'}
                    placeholder={field.placeholder || 'পরিমাণ'}
                    value={values[field.id] !== undefined ? values[field.id] : ''}
                    onChange={(e) => onChange(field.id, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                    className="w-full text-xs p-2 pr-12 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#064e3b] outline-none disabled:bg-slate-100"
                  />
                  {field.unit && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      {field.unit}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Debt & Liabilities */}
      {debtFields.length > 0 && (
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-red-900 font-serif border-b border-slate-100 pb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-red-600" />
            ২. ঋণ সংক্রান্ত তথ্য (Debts & Liabilities)
          </h4>
          <div className="space-y-3">
            {debtFields.map((field) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 items-center gap-2 p-2.5 bg-red-50/30 rounded-lg border border-red-100/60">
                <label className="md:col-span-2 text-xs font-semibold text-slate-800 leading-snug">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    disabled={readOnly}
                    type={field.type === 'number' ? 'number' : 'text'}
                    placeholder={field.placeholder || 'পরিমাণ'}
                    value={values[field.id] !== undefined ? values[field.id] : ''}
                    onChange={(e) => onChange(field.id, field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                    className="w-full text-xs p-2 pr-12 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-red-600 outline-none disabled:bg-slate-100"
                  />
                  {field.unit && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                      {field.unit}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: Referees / Attesters */}
      {refereeFields.length > 0 && (
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-[#064e3b] font-serif border-b border-slate-100 pb-2 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            ৩. দুইজন সত্যায়নকারীর তথ্য (Attesters / Reference Information)
          </h4>
          <p className="text-[11px] text-slate-500">
            যাদের মাধ্যমে উপরে প্রদত্ত তথ্য যাচাই করা যাবে (যেমন: স্থানীয় ইমাম, আলেম, শিক্ষক বা গণ্যমান্য ব্যক্তি)।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Referee 1 */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-900 block border-b border-slate-200 pb-1">
                সত্যায়নকারী ১ (First Attester)
              </span>
              {refereeFields.filter((f) => f.id.startsWith('referee1')).map((field) => (
                <div key={field.id} className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-700">{field.label}</label>
                  <input
                    disabled={readOnly}
                    type="text"
                    placeholder={field.placeholder}
                    value={values[field.id] || ''}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#064e3b] outline-none disabled:bg-slate-100"
                  />
                </div>
              ))}
            </div>

            {/* Referee 2 */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-900 block border-b border-slate-200 pb-1">
                সত্যায়নকারী ২ (Second Attester)
              </span>
              {refereeFields.filter((f) => f.id.startsWith('referee2')).map((field) => (
                <div key={field.id} className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-700">{field.label}</label>
                  <input
                    disabled={readOnly}
                    type="text"
                    placeholder={field.placeholder}
                    value={values[field.id] || ''}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#064e3b] outline-none disabled:bg-slate-100"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: Undertaking & Declaration */}
      <div className="bg-emerald-900 text-white p-4 sm:p-5 rounded-xl shadow-sm space-y-3">
        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-300">
          <FileCheck className="w-4 h-4 text-amber-400" />
          আবেদনকারীর অঙ্গীকারনামা (Applicant Undertaking)
        </div>
        <p className="text-xs text-emerald-100 leading-relaxed font-sans">
          আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউটের প্রশিক্ষণ, আবাসন ও খাওয়া-দাওয়া বাবদ মোট ফি{' '}
          <strong className="text-amber-300 font-extrabold">{totalCourseFee > 0 ? `${totalCourseFee} টাকা` : 'নির্ধারিত ফি'}</strong>।{' '}
          {finalUndertakingText}
        </p>

        {!readOnly && (
          <label className="flex items-start gap-2 pt-2 border-t border-emerald-800/80 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={values['declaration_accepted'] || false}
              onChange={(e) => onChange('declaration_accepted', e.target.checked)}
              className="mt-0.5 w-4 h-4 text-amber-500 rounded border-emerald-700 focus:ring-amber-400"
            />
            <span className="text-[11px] text-emerald-100 font-semibold leading-tight">
              আমি সজ্ঞানে সাক্ষ্য দিচ্ছি যে, উপর্যুক্ত সকল তথ্য সত্য ও নির্ভুল। আমি আস-সুন্নাহ ফাউন্ডেশনকে আমার প্রতিনিধি হিসেবে ফি গ্রহণের অনুমতি প্রদান করলাম।
            </span>
          </label>
        )}
      </div>

    </div>
  );
}
