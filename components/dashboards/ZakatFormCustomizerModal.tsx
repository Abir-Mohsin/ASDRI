'use client';

import React, { useState } from 'react';
import { ZakatFormField, DEFAULT_ZAKAT_FORM_FIELDS, DEFAULT_ZAKAT_FORM_TITLE, DEFAULT_ZAKAT_FORM_SUBTITLE, ZAKAT_WARNING_TEXT, ZAKAT_UNDERTAKING_TEXT } from '@/lib/constants/zakatFormTemplate';
import { X, Plus, Trash2, RotateCcw, Save, MoveUp, MoveDown, FileText, ListOrdered } from 'lucide-react';

interface ZakatFormCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fields: ZakatFormField[];
  formTitle?: string;
  formSubtitle?: string;
  warningText?: string;
  undertakingText?: string;
  onSave: (
    updatedFields: ZakatFormField[],
    texts: { zakatFormTitle: string; zakatFormSubtitle: string; zakatWarningText: string; zakatUndertakingText: string }
  ) => void;
}

export default function ZakatFormCustomizerModal({
  isOpen,
  onClose,
  fields,
  formTitle,
  formSubtitle,
  warningText,
  undertakingText,
  onSave,
}: ZakatFormCustomizerModalProps) {
  const [activeTab, setActiveTab] = useState<'fields' | 'texts'>('fields');
  const [currentFields, setCurrentFields] = useState<ZakatFormField[]>(
    fields && fields.length > 0 ? fields : DEFAULT_ZAKAT_FORM_FIELDS
  );

  const [currentTitle, setCurrentTitle] = useState(formTitle || DEFAULT_ZAKAT_FORM_TITLE);
  const [currentSubtitle, setCurrentSubtitle] = useState(formSubtitle || DEFAULT_ZAKAT_FORM_SUBTITLE);
  const [currentWarning, setCurrentWarning] = useState(warningText || ZAKAT_WARNING_TEXT);
  const [currentUndertaking, setCurrentUndertaking] = useState(undertakingText || ZAKAT_UNDERTAKING_TEXT);

  const [newField, setNewField] = useState<Partial<ZakatFormField>>({
    category: 'financial',
    label: '',
    placeholder: '',
    type: 'number',
    unit: 'BDT',
    required: false,
  });

  if (!isOpen) return null;

  const handleAddField = () => {
    if (!newField.label?.trim()) return;
    const generatedId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fieldToAdd: ZakatFormField = {
      id: generatedId,
      category: newField.category || 'financial',
      label: newField.label.trim(),
      placeholder: newField.placeholder?.trim() || '',
      type: newField.type || 'text',
      unit: newField.unit || '',
      required: !!newField.required,
    };

    setCurrentFields((prev) => [...prev, fieldToAdd]);
    setNewField({
      category: 'financial',
      label: '',
      placeholder: '',
      type: 'number',
      unit: 'BDT',
      required: false,
    });
  };

  const handleDeleteField = (id: string) => {
    setCurrentFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentFields.length) return;
    const list = [...currentFields];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);
    setCurrentFields(list);
  };

  const handleResetToDefault = () => {
    if (confirm('আপনি কি যাকাত ফরমের ফিল্ডসমূহ ও টেক্সট ডিফল্ট ফরমেটে রিসেট করতে চান?')) {
      setCurrentFields(DEFAULT_ZAKAT_FORM_FIELDS);
      setCurrentTitle(DEFAULT_ZAKAT_FORM_TITLE);
      setCurrentSubtitle(DEFAULT_ZAKAT_FORM_SUBTITLE);
      setCurrentWarning(ZAKAT_WARNING_TEXT);
      setCurrentUndertaking(ZAKAT_UNDERTAKING_TEXT);
    }
  };

  const handleSaveAll = () => {
    onSave(currentFields, {
      zakatFormTitle: currentTitle,
      zakatFormSubtitle: currentSubtitle,
      zakatWarningText: currentWarning,
      zakatUndertakingText: currentUndertaking,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-100 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slideIn">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex justify-between items-center bg-[#064e3b] text-white">
          <div>
            <h3 className="text-base font-bold font-serif">
              যাকাত ও স্কলারশিপ ফরম কাস্টমাইজেশন (Customize Zakat Form)
            </h3>
            <p className="text-[11px] text-emerald-100 mt-0.5">
              এডমিন এখান থেকে যাকাত ফরমের প্রশ্ন, শিরোনাম, সতর্কতা ও অঙ্গীকারনামা সম্পূর্ণ পরিবর্তন করতে পারবেন।
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('fields')}
            className={`px-4 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'fields'
                ? 'border-[#064e3b] text-[#064e3b] bg-white rounded-t-lg shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ListOrdered className="w-4 h-4" /> ফরমের ফিল্ড ও প্রশ্ন ({currentFields.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('texts')}
            className={`px-4 py-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'texts'
                ? 'border-[#064e3b] text-[#064e3b] bg-white rounded-t-lg shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" /> শিরোনাম, সতর্কতা ও অঙ্গীকারনামা টেক্সট
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {activeTab === 'fields' ? (
            <div className="space-y-6">
              {/* Add New Field Builder */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
                <h4 className="font-bold text-[#064e3b] flex items-center gap-1.5 text-xs">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  নতুন প্রশ্ন / ফিল্ড যুক্ত করুন (Add Custom Field)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
                    <select
                      value={newField.category}
                      onChange={(e) => setNewField({ ...newField, category: e.target.value as any })}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none"
                    >
                      <option value="personal">ব্যক্তিগত তথ্য (Personal)</option>
                      <option value="financial">আর্থিক অবস্থা (Financial Asset)</option>
                      <option value="debt">ঋণ সংক্রান্ত তথ্য (Debt)</option>
                      <option value="referee">সত্যায়নকারী (Referee)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">ইনপুট টাইপ</label>
                    <select
                      value={newField.type}
                      onChange={(e) => setNewField({ ...newField, type: e.target.value as any })}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none"
                    >
                      <option value="text">টেক্সট (Text)</option>
                      <option value="number">সংখ্যা / টাকা (Number)</option>
                      <option value="textarea">বড় বিবরণ (Textarea)</option>
                      <option value="select">ড্রপডাউন (Select)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">প্রশ্নের লেবেল (Question Title)</label>
                    <input
                      type="text"
                      placeholder="যেমন: মাসিক পারিবারিক আনুমানিক ব্যয়"
                      value={newField.label}
                      onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">প্লেসহোল্ডার / উদাহরণ</label>
                    <input
                      type="text"
                      placeholder="যেমন: ৫০০০ টাকা"
                      value={newField.placeholder}
                      onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newField.required || false}
                        onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                        className="w-4 h-4 text-[#064e3b] rounded"
                      />
                      আবশ্যক (Required)
                    </label>

                    <button
                      type="button"
                      onClick={handleAddField}
                      disabled={!newField.label?.trim()}
                      className="ml-auto px-4 py-2 bg-[#064e3b] hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> ফিল্ড যোগ করুন
                    </button>
                  </div>
                </div>
              </div>

              {/* List of Fields */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs">
                    বর্তমান ফিল্ডসমূহ ({currentFields.length} টি)
                  </h4>
                </div>

                <div className="space-y-2">
                  {currentFields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-sm hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{field.label}</span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="capitalize px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">
                              {field.category}
                            </span>
                            <span>• Type: {field.type}</span>
                            {field.required && (
                              <span className="text-red-600 font-bold">• Required</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'down')}
                          disabled={idx === currentFields.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteField(field.id)}
                          className="p-1 text-red-400 hover:text-red-700 ml-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ফরমের মূল শিরোনাম (Form Title)</label>
                <input
                  type="text"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ফরমের উপশিরোনাম / বিবরণ (Form Subtitle)</label>
                <textarea
                  rows={2}
                  value={currentSubtitle}
                  onChange={(e) => setCurrentSubtitle(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">সতর্কীকরণ ও দিকনির্দেশনা টেক্সট (Warning & Instructions)</label>
                <textarea
                  rows={5}
                  value={currentWarning}
                  onChange={(e) => setCurrentWarning(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none font-medium text-slate-700 leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">অঙ্গীকারনামা টেক্সট (Applicant Undertaking)</label>
                <textarea
                  rows={4}
                  value={currentUndertaking}
                  onChange={(e) => setCurrentUndertaking(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none font-medium text-slate-700 leading-relaxed"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-xs text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 border border-amber-200 bg-amber-50 px-3 py-2 rounded-lg cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> ডিফল্ট ফরমেটে রিসেট করুন
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 bg-[#064e3b] hover:bg-emerald-900 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" /> পরিবর্তনসমূহ সংরক্ষণ করুন
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
