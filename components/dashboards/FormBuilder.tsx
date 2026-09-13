import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Settings } from 'lucide-react';

export type FieldType = 'text' | 'textarea' | 'dropdown' | 'radio' | 'checkbox' | 'file' | 'date';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
}

export const defaultAdmissionFields: FormField[] = [
  { id: 'f_name', label: 'Full Name', type: 'text', required: true },
  { id: 'f_father', label: "Father's Name", type: 'text', required: true },
  { id: 'f_district', label: 'District', type: 'text', required: true },
  { id: 'f_mobile', label: 'Mobile Number', type: 'text', required: true },
  { id: 'f_address', label: 'Address', type: 'textarea', required: true },
  { id: 'f_dob', label: 'Date of Birth', type: 'date', required: true },
  { id: 'f_age', label: 'Age', type: 'text', required: true },
  { id: 'f_blood', label: 'Blood Group', type: 'dropdown', required: true, options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  { id: 'f_education', label: 'Educational Qualification', type: 'dropdown', required: true, options: ['SSC/Dakhil', 'HSC/Alim', 'Bachelor/Fazil', 'Master/Kamil', 'Other'] },
  { id: 'f_cv', label: 'Upload CV / Portfolio', type: 'file', required: false },
];

interface FormBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

export default function FormBuilder({ fields, onChange }: FormBuilderProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addField = () => {
    const newField: FormField = {
      id: 'f_' + Date.now().toString(),
      label: 'New Field',
      type: 'text',
      required: false,
    };
    onChange([...fields, newField]);
    setEditingId(newField.id);
  };

  const removeField = (id: string) => {
    onChange(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    onChange(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newFields = [...fields];
      [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
      onChange(newFields);
    } else if (direction === 'down' && index < fields.length - 1) {
      const newFields = [...fields];
      [newFields[index + 1], newFields[index]] = [newFields[index], newFields[index + 1]];
      onChange(newFields);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900">Custom Admission Form Fields</h4>
        <button
          type="button"
          onClick={addField}
          className="text-xs flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-1 rounded hover:bg-emerald-200 transition-colors font-bold"
        >
          <Plus className="w-3 h-3" /> Add Field
        </button>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="border border-slate-200 rounded-lg bg-slate-50 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                <span className="font-bold text-sm text-slate-800">{field.label}</span>
                <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">{field.type}</span>
                {field.required && <span className="text-[10px] text-red-500 font-bold">*</span>}
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => moveField(index, 'up')} disabled={index === 0} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">↑</button>
                <button type="button" onClick={() => moveField(index, 'down')} disabled={index === fields.length - 1} className="text-slate-400 hover:text-slate-700 disabled:opacity-30">↓</button>
                <button type="button" onClick={() => setEditingId(editingId === field.id ? null : field.id)} className="text-blue-500 hover:text-blue-600">
                  <Settings className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => removeField(field.id)} className="text-red-500 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {editingId === field.id && (
              <div className="mt-3 p-3 bg-white border border-slate-200 rounded-md space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Field Label</label>
                    <input 
                      type="text" 
                      value={field.label} 
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      className="w-full text-xs p-2 border border-slate-300 rounded focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Field Type</label>
                    <select 
                      value={field.type}
                      onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                      className="w-full text-xs p-2 border border-slate-300 rounded focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="text">Short Text</option>
                      <option value="textarea">Paragraph</option>
                      <option value="dropdown">Dropdown</option>
                      <option value="radio">Radio Buttons</option>
                      <option value="checkbox">Checkboxes</option>
                      <option value="date">Date Picker</option>
                      <option value="file">File Upload</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id={`req_${field.id}`} 
                    checked={field.required}
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor={`req_${field.id}`} className="text-xs font-bold text-slate-700">Required Field</label>
                </div>

                {(field.type === 'dropdown' || field.type === 'radio' || field.type === 'checkbox') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Options (comma separated)</label>
                    <input 
                      type="text" 
                      value={field.options?.join(', ') || ''} 
                      onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                      placeholder="e.g. Option 1, Option 2, Option 3"
                      className="w-full text-xs p-2 border border-slate-300 rounded focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
