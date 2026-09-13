'use client';

import React, { useState } from 'react';
import { X, HeartHandshake, Send, CheckCircle2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ZakatFormRenderer from './ZakatFormRenderer';
import { DEFAULT_ZAKAT_FORM_FIELDS } from '@/lib/constants/zakatFormTemplate';

interface ZakatAssessmentModalProps {
  application: any;
  course: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ZakatAssessmentModal({ application, course, onClose, onSuccess }: ZakatAssessmentModalProps) {
  const [zakatFormData, setZakatFormData] = useState<Record<string, any>>(application?.zakatAssessment || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const zakatFields = course?.zakatFormFields && course.zakatFormFields.length > 0 
    ? course.zakatFormFields 
    : DEFAULT_ZAKAT_FORM_FIELDS;

  const handleFieldChange = (fieldId: string, value: any) => {
    setZakatFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zakatFormData['declaration_accepted']) {
      alert('অনুগ্রহ করে অঙ্গীকারনামা বাক্সে টিক দিন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const appRef = doc(db, 'applications', application.id);
      await updateDoc(appRef, {
        zakatFundStatus: 'pending_review',
        zakatAssessment: {
          ...zakatFormData,
          submittedAt: new Date().toISOString()
        }
      });

      setIsDone(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error) {
      console.error('Error submitting zakat assessment:', error);
      alert('আবেদন জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-100 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden my-auto">
        <div className="p-5 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-amber-100">যাকাত এসেসমেন্ট ও স্কলারশিপ ফরম</h3>
              <p className="text-xs text-emerald-200">আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউট যাকাত ফান্ড সহযোগিতা আবেদন</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-emerald-300 hover:text-white rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isDone ? (
          <div className="p-8 text-center space-y-4 my-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">যাকাত এসেসমেন্ট আবেদন সফলভাবে গৃহীত হয়েছে!</h4>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              আপনার তথ্য প্রতিষ্ঠানের পরিচালনা পর্ষদ ও স্কলারশিপ বোর্ডের নিকট পর্যালোচনার জন্য পাঠানো হয়েছে। শীঘ্রই সিদ্ধান্ত জানানো হবে।
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            <ZakatFormRenderer
              fields={zakatFields}
              values={zakatFormData}
              onChange={handleFieldChange}
              totalCourseFee={course?.fees?.totalFee || 0}
              formTitle={course?.zakatFormTitle}
              formSubtitle={course?.zakatFormSubtitle}
              warningText={course?.zakatWarningText}
              undertakingText={course?.zakatUndertakingText}
            />

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 sticky bottom-0 bg-white py-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-900 hover:bg-emerald-950 text-amber-400 font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> {isSubmitting ? 'প্রসেসিং...' : 'সম্পূর্ণ যাকাত আবেদন জমা দিন'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
