import React from 'react';
import { FormField } from './FormBuilder';

interface DynamicFormRendererProps {
  fields: FormField[];
  formData: Record<string, any>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

export default function DynamicFormRenderer({ fields, formData, setFormData }: DynamicFormRendererProps) {
  const handleChange = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id: string, option: string, checked: boolean) => {
    const currentValues = formData[id] || [];
    if (checked) {
      handleChange(id, [...currentValues, option]);
    } else {
      handleChange(id, currentValues.filter((val: string) => val !== option));
    }
  };

  return (
    <div className="space-y-4">
      {fields.map(field => (
        <div key={field.id} className="space-y-1">
          <label className="block text-sm font-semibold text-slate-700">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          
          {field.type === 'text' && (
            <input
              type="text"
              required={field.required}
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          )}

          {field.type === 'textarea' && (
            <textarea
              required={field.required}
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
            />
          )}

          {field.type === 'date' && (
            <input
              type="date"
              required={field.required}
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          )}

          {field.type === 'dropdown' && (
            <select
              required={field.required}
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
            >
              <option value="">Select {field.label}</option>
              {field.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}

          {field.type === 'radio' && (
            <div className="space-y-2 mt-2">
              {field.options?.map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field.id}
                    value={opt}
                    checked={formData[field.id] === opt}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    required={field.required}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {field.type === 'checkbox' && (
            <div className="space-y-2 mt-2">
              {field.options?.map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={opt}
                    checked={(formData[field.id] || []).includes(opt)}
                    onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-slate-700">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {field.type === 'file' && (
            <input
              type="file"
              required={field.required}
              onChange={(e) => {
                 // In a real app we'd upload this file to Firebase Storage. 
                 // For now, just store the file name to simulate
                 const file = e.target.files?.[0];
                 if(file) handleChange(field.id, file.name);
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
          )}

        </div>
      ))}
    </div>
  );
}
