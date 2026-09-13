/* eslint-disable */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  DEFAULT_BRANDING, 
  SiteBrandingData, 
  LogoSourceType, 
  LogoShape, 
  LogoBackground,
  parseGoogleDriveImageUrl, 
  compressImageFile 
} from '@/lib/branding';
import { 
  Upload, Link as LinkIcon, Image as ImageIcon, 
  Save, CheckCircle2, RefreshCw, AlertCircle, 
  HelpCircle, Eye, Shield, Sparkles, Check, 
  Trash2, Sliders, ExternalLink, ArrowLeft,
  FileCheck, Globe, Info
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

interface SiteBrandingManagerProps {
  locale?: string;
  onBack?: () => void;
}

// Curated high quality authentic emblems for instant testing
const PRESET_LOGOS = [
  {
    name: 'Islamic Geometric Crest',
    url: 'https://images.unsplash.com/photo-1542816417-0983cbe33577?auto=format&fit=crop&w=200&h=200&q=80',
    desc: 'Traditional Islamic dome & geometric medallion'
  },
  {
    name: 'Manuscript Calligraphy Seal',
    url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=200&h=200&q=80',
    desc: 'Classical Arabic manuscript illumination crest'
  },
  {
    name: 'Academic Knowledge Medallion',
    url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=200&h=200&q=80',
    desc: 'Golden open book & scholars insignia'
  }
];

export function SiteBrandingManager({ locale = 'en', onBack }: SiteBrandingManagerProps) {
  const [formData, setFormData] = useState<SiteBrandingData>(DEFAULT_BRANDING);
  const [activeSourceTab, setActiveSourceTab] = useState<LogoSourceType>('upload');
  
  // Direct file upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [fileStats, setFileStats] = useState<{ originalSize: number; compressedSize: number } | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Google Drive state
  const [driveInput, setDriveInput] = useState<string>('');
  const [driveParsed, setDriveParsed] = useState<{ isDrive: boolean; directUrl: string; fileId: string | null; error?: string } | null>(null);

  // External URL state
  const [urlInput, setUrlInput] = useState<string>('');

  // UI status
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);

  // Load existing branding on mount
  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'site_pages', 'branding'));
        if (snap.exists() && isMounted) {
          const data = snap.data() as Partial<SiteBrandingData>;
          const merged: SiteBrandingData = {
            ...DEFAULT_BRANDING,
            ...data,
          };
          setFormData(merged);
          setActiveSourceTab(merged.sourceType || 'upload');
          if (merged.rawDriveUrl) {
            setDriveInput(merged.rawDriveUrl);
            setDriveParsed(parseGoogleDriveImageUrl(merged.rawDriveUrl));
          } else if (merged.sourceType === 'drive' && merged.logoUrl) {
            setDriveInput(merged.logoUrl);
            setDriveParsed(parseGoogleDriveImageUrl(merged.logoUrl));
          }
          if (merged.sourceType === 'url') {
            setUrlInput(merged.logoUrl || '');
          }
          if (merged.sourceType === 'upload' && merged.logoUrl) {
            setUploadPreview(merged.logoUrl);
          }
        }
      } catch (err: any) {
        console.error('Failed to load branding data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadSettings();
    return () => { isMounted = false; };
  }, []);

  // Handle Google Drive link input change
  const handleDriveUrlChange = (value: string) => {
    setDriveInput(value);
    setPreviewError(false);
    if (!value.trim()) {
      setDriveParsed(null);
      setFormData(prev => ({ ...prev, logoUrl: '', rawDriveUrl: '' }));
      return;
    }
    const result = parseGoogleDriveImageUrl(value);
    setDriveParsed(result);
    if (result.isDrive && result.directUrl) {
      setFormData(prev => ({
        ...prev,
        logoUrl: result.directUrl,
        rawDriveUrl: value.trim(),
        sourceType: 'drive'
      }));
    }
  };

  // Handle direct file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    await processFile(file);
  };

  // Handle drag and drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);
    setPreviewError(false);

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, SVG, or WebP). Transparent PNG is recommended.');
      return;
    }

    // Validate size (max 8MB before compression)
    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('Image size is too large. Please select an image under 8MB.');
      return;
    }

    try {
      setIsProcessingFile(true);
      setUploadFile(file);
      const result = await compressImageFile(file, 512);
      setUploadPreview(result.dataUrl);
      setFileStats({
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
      });
      setFormData(prev => ({
        ...prev,
        logoUrl: result.dataUrl,
        sourceType: 'upload'
      }));
    } catch (err: any) {
      console.error('File compression failed:', err);
      setErrorMessage('Failed to process image file. Please try a different image.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Handle external URL input
  const handleUrlChange = (value: string) => {
    setUrlInput(value);
    setPreviewError(false);
    setFormData(prev => ({
      ...prev,
      logoUrl: value.trim(),
      sourceType: 'url'
    }));
  };

  // Pick Preset
  const handleSelectPreset = (presetUrl: string) => {
    setUrlInput(presetUrl);
    setPreviewError(false);
    setFormData(prev => ({
      ...prev,
      logoUrl: presetUrl,
      sourceType: 'url'
    }));
  };

  // Reset to Default Monogram
  const handleResetToDefault = () => {
    if (!window.confirm('Are you sure you want to restore the default ASDRI monogram logo?')) {
      return;
    }
    setUploadPreview('');
    setUploadFile(null);
    setFileStats(null);
    setDriveInput('');
    setDriveParsed(null);
    setUrlInput('');
    setPreviewError(false);
    setFormData({
      ...DEFAULT_BRANDING,
      logoUrl: '',
      rawDriveUrl: '',
      sourceType: 'default',
    });
  };

  // Save changes to Firestore
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const payload: SiteBrandingData = {
        ...formData,
        sourceType: activeSourceTab,
        updatedAt: serverTimestamp(),
        updatedBy: 'Admin',
      };

      await setDoc(doc(db, 'site_pages', 'branding'), payload, { merge: true });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Error saving branding settings:', err);
      setErrorMessage(err.message || 'Failed to save branding settings. Please ensure you have admin privileges.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs flex flex-col items-center justify-center min-h-[300px]">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
        <p className="text-slate-600 text-sm font-semibold">Loading Site Identity & Branding Settings...</p>
      </div>
    );
  }

  // Active logo to show in preview
  const currentLogoUrl = formData.logoUrl;
  const isDefaultLogo = !currentLogoUrl || formData.sourceType === 'default' || previewError;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-all mr-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}
              <span className="text-xs font-bold text-slate-500">Site Identity & Branding</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Live Sync Enabled
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
              Site Logo & Brand Studio
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Upload your official institute logo directly or connect a Google Drive image link. Changes will synchronize immediately across the Navbar, Footer, Dashboard Sidebar, and Authentication pages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl shadow-2xs transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset to Default
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={clsx(
                "px-6 py-2.5 text-slate-950 text-xs font-extrabold rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer",
                saveSuccess 
                  ? "bg-emerald-500 text-white" 
                  : "bg-amber-500 hover:bg-amber-400 active:scale-95"
              )}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Saved Successfully!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Branding Settings
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {saveSuccess && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Branding updated successfully! All visitors and pages now display your updated logo in real time.</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Logo Upload & Source Selection (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step 1: Choose Logo Source Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-serif flex items-center gap-2">
                  <Upload className="w-5 h-5 text-emerald-700" />
                  1. Logo Input Source (লগো নির্বাচন বা আপলোড)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose how you want to provide your institution's logo.
                </p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg">
                Required
              </span>
            </div>

            {/* Source Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100/90 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setActiveSourceTab('upload');
                  setFormData(prev => ({ ...prev, sourceType: 'upload', logoUrl: uploadPreview || prev.logoUrl }));
                }}
                className={clsx(
                  "py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2",
                  activeSourceTab === 'upload'
                    ? "bg-white text-emerald-900 shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                )}
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Direct Upload</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSourceTab('drive');
                  setFormData(prev => ({ 
                    ...prev, 
                    sourceType: 'drive', 
                    logoUrl: driveParsed?.directUrl || prev.logoUrl,
                    rawDriveUrl: driveInput 
                  }));
                }}
                className={clsx(
                  "py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2",
                  activeSourceTab === 'drive'
                    ? "bg-white text-emerald-900 shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                )}
              >
                <LinkIcon className="w-4 h-4 text-amber-600" />
                <span>Google Drive Link</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSourceTab('url');
                  setFormData(prev => ({ ...prev, sourceType: 'url', logoUrl: urlInput || prev.logoUrl }));
                }}
                className={clsx(
                  "py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2",
                  activeSourceTab === 'url'
                    ? "bg-white text-emerald-900 shadow-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                )}
              >
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Web URL / Preset</span>
              </button>
            </div>

            {/* TAB CONTENT A: Direct Upload */}
            {activeSourceTab === 'upload' && (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className={clsx(
                    "border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all",
                    uploadPreview
                      ? "border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70"
                      : "border-slate-300 bg-slate-50/60 hover:bg-emerald-50/30 hover:border-emerald-400"
                  )}
                >
                  {isProcessingFile ? (
                    <div className="py-6 flex flex-col items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
                      <p className="text-xs font-bold text-slate-700">Compressing and optimizing logo image...</p>
                    </div>
                  ) : uploadPreview ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 p-2 shadow-sm flex items-center justify-center mb-3">
                        <img 
                          src={uploadPreview} 
                          alt="Uploaded Logo Preview" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-xs font-bold text-emerald-900">
                        {uploadFile ? uploadFile.name : 'Active Uploaded Logo'}
                      </p>
                      {fileStats && (
                        <p className="text-[11px] text-slate-500 mt-1">
                          Original: {(fileStats.originalSize / 1024).toFixed(1)} KB → Optimized: {(fileStats.compressedSize / 1024).toFixed(1)} KB (High Speed)
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-emerald-700 font-bold underline hover:text-emerald-800">
                          Click to select a different image
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadPreview('');
                            setUploadFile(null);
                            setFileStats(null);
                            setFormData(prev => ({ ...prev, logoUrl: '', sourceType: 'default' }));
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors ml-2"
                          title="Remove uploaded image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3 shadow-2xs">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-extrabold text-slate-800 font-serif">
                        Click to browse or drag & drop logo here
                      </p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        Supports PNG, SVG, JPG, or WebP. Transparent PNG (512x512) recommended for pristine results across all backgrounds.
                      </p>
                      <span className="mt-4 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-all shadow-2xs">
                        Choose File from Device
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT B: Google Drive Link */}
            {activeSourceTab === 'drive' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Google Drive Public Sharing Link (গুগল ড্রাইভ লিংক)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={driveInput}
                      onChange={(e) => handleDriveUrlChange(e.target.value)}
                      placeholder="https://drive.google.com/file/d/1ABCXYZ.../view?usp=sharing"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-mono"
                    />
                    <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {/* Drive Detection Status */}
                {driveParsed && (
                  <div className={clsx(
                    "p-3.5 rounded-2xl border text-xs leading-relaxed flex items-start gap-3",
                    driveParsed.isDrive && driveParsed.fileId && !driveParsed.error
                      ? "bg-emerald-50/90 border-emerald-200 text-emerald-900"
                      : "bg-amber-50 border-amber-200 text-amber-900"
                  )}>
                    {driveParsed.isDrive && driveParsed.fileId && !driveParsed.error ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Google Drive File Detected & Auto-Converted!</p>
                          <p className="text-[11px] text-emerald-800 mt-0.5">
                            File ID: <span className="font-mono font-semibold">{driveParsed.fileId}</span>
                          </p>
                          <p className="text-[11px] text-emerald-700 mt-0.5">
                            Direct CDN stream URL generated successfully. View preview on the right.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Notice regarding link format:</p>
                          <p className="text-[11px] mt-0.5">
                            {driveParsed.error || 'Please make sure you copy a link to an image file, not a folder.'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Google Drive Guide Box */}
                <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs font-serif">
                    <Info className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>How to get a public Google Drive logo link (সহজ নিয়মাবলী):</span>
                  </div>
                  <ol className="list-decimal list-inside text-xs text-amber-900/90 space-y-1 pl-1 leading-relaxed">
                    <li>Upload your logo file (PNG / JPG) to Google Drive.</li>
                    <li>Right click the file, select <strong>Share</strong> &gt; <strong>Share</strong>.</li>
                    <li>Under General Access, change from &quot;Restricted&quot; to <strong>&quot;Anyone with the link&quot; (viewer)</strong>.</li>
                    <li>Click <strong>&quot;Copy link&quot;</strong> and paste it into the box above.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* TAB CONTENT C: Web URL / Presets */}
            {activeSourceTab === 'url' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Direct Image Web URL (যেকোনো অনলাইন ইমেজ লিংক)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="https://example.com/images/institute-logo.png"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white font-mono"
                    />
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                {/* Presets */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    Or select an institutional emblem preset:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PRESET_LOGOS.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectPreset(preset.url)}
                        className={clsx(
                          "p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-2.5",
                          urlInput === preset.url
                            ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        )}
                      >
                        <img 
                          src={preset.url} 
                          alt={preset.name} 
                          className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{preset.name}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{preset.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Appearance, Geometry & Dimensions Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-serif flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-700" />
                  2. Logo Geometry & Visual Styling (সাইজ ও ফ্রেম স্টাইল)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customize the frame shape, dimensions, and container background.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Shape Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Logo Frame Shape (ফ্রেমের আকার)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'rounded', label: 'Rounded Square', desc: '12px Radius (Modern)' },
                    { id: 'circle', label: 'Circular', desc: 'Full Round (Emblem)' },
                    { id: 'square', label: 'Sharp Square', desc: '0px Radius (Classic)' },
                    { id: 'original', label: 'Original Ratio', desc: 'Natural Uncropped' },
                  ].map((shape) => (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logoShape: shape.id as LogoShape }))}
                      className={clsx(
                        "p-3 rounded-2xl border text-left transition-all",
                        formData.logoShape === shape.id
                          ? "border-emerald-700 bg-emerald-50/70 text-emerald-950 font-bold ring-2 ring-emerald-600/20"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                      )}
                    >
                      <span className="block text-xs font-extrabold">{shape.label}</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">{shape.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Tint on Dark/Light Bars */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Container Background Tint (লগোর পেছনের ব্যাকগ্রাউন্ড)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'amber', label: 'Amber Tint', desc: 'Gold Islamic Theme' },
                    { id: 'white', label: 'Solid White', desc: 'Bright Card Frame' },
                    { id: 'transparent', label: 'Transparent', desc: 'Clear Background' },
                    { id: 'dark', label: 'Deep Emerald', desc: 'Dark Institution' },
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, logoBackground: bg.id as LogoBackground }))}
                      className={clsx(
                        "p-3 rounded-2xl border text-left transition-all",
                        formData.logoBackground === bg.id
                          ? "border-emerald-700 bg-emerald-50/70 text-emerald-950 font-bold ring-2 ring-emerald-600/20"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                      )}
                    >
                      <span className="block text-xs font-extrabold">{bg.label}</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">{bg.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Height Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">
                  Logo Display Height (লগোর ডিসপ্লে উচ্চতা)
                </label>
                <span className="text-xs font-mono font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  {formData.logoHeight || 40} px
                </span>
              </div>
              <input
                type="range"
                min="32"
                max="64"
                step="4"
                value={formData.logoHeight || 40}
                onChange={(e) => setFormData(prev => ({ ...prev, logoHeight: parseInt(e.target.value, 10) }))}
                className="w-full accent-emerald-700 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>Compact (32px)</span>
                <span>Standard (40px)</span>
                <span>Prominent (48px)</span>
                <span>Extra Large (64px)</span>
              </div>
            </div>
          </div>

          {/* Step 3: Brand Text Customization */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 font-serif flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-700" />
                3. Institute Name & Tagline Text (ইনস্টিটিউটের নাম ও ট্যাগলাইন)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage the display titles rendered adjacent to the logo in headers and footers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Brand Name (English)
                </label>
                <input
                  type="text"
                  value={formData.shortName}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortName: e.target.value }))}
                  placeholder="e.g. ASDRI"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subtitle / Tagline (English)
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="e.g. Dawah & Research"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Short Brand Name (বাংলা)
                </label>
                <input
                  type="text"
                  value={formData.shortNameBn || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, shortNameBn: e.target.value }))}
                  placeholder="e.g. আসরী (ASDRI)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subtitle / Tagline (বাংলা)
                </label>
                <input
                  type="text"
                  value={formData.subtitleBn || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitleBn: e.target.value }))}
                  placeholder="e.g. দাওয়াহ অ্যান্ড রিসার্চ"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Institutional Title (English)
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="e.g. As-Sunnah Dawah & Research Institute"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Multi-Surface Live Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-24 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-extrabold text-slate-900 font-serif">
                    Live Multi-Surface Preview
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-full">
                  Real-Time
                </span>
              </div>

              {/* Surface 1: Public Top Navbar Mockup */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  1. Public Website Navbar
                </span>
                <div className="bg-[#064e3b] rounded-2xl p-4 text-white shadow-sm flex items-center justify-between border border-emerald-800">
                  <div className="flex items-center gap-3">
                    {/* Visual Logo Render */}
                    <div 
                      style={{ width: `${formData.logoHeight || 40}px`, height: `${formData.logoHeight || 40}px` }}
                      className={clsx(
                        "flex items-center justify-center shrink-0 shadow-xs overflow-hidden transition-all",
                        formData.logoShape === 'circle' ? 'rounded-full' :
                        formData.logoShape === 'square' ? 'rounded-none' :
                        formData.logoShape === 'original' ? 'rounded-md' : 'rounded-xl',
                        currentLogoUrl && !previewError ? (
                          formData.logoBackground === 'white' ? 'bg-white p-0.5' :
                          formData.logoBackground === 'dark' ? 'bg-emerald-950 p-0.5' :
                          formData.logoBackground === 'amber' ? 'bg-amber-500/20 p-0.5 border border-amber-400/40' : 'bg-transparent'
                        ) : 'bg-amber-500 text-emerald-950'
                      )}
                    >
                      {currentLogoUrl && !previewError ? (
                        <img 
                          src={currentLogoUrl} 
                          alt="Logo Preview" 
                          referrerPolicy="no-referrer"
                          onError={() => setPreviewError(true)}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="font-serif font-extrabold text-lg sm:text-xl text-emerald-950">
                          {formData.monogramText || 'A'}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="font-bold text-sm leading-tight block text-white font-serif">
                        {formData.shortName || 'ASDRI'}
                      </span>
                      <span className="text-emerald-300 text-[10px] uppercase tracking-widest block font-medium">
                        {formData.subtitle || 'Dawah & Research'}
                      </span>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 text-[11px] text-emerald-100/70">
                    <span className="px-2 py-1 rounded-lg bg-emerald-900/60 text-emerald-200">Home</span>
                    <span className="px-2 py-1">About</span>
                    <span className="px-2 py-1">Courses</span>
                  </div>
                </div>
              </div>

              {/* Surface 2: Admin / Student Dashboard Sidebar Mockup */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  2. Dashboard Sidebar Brand Header
                </span>
                <div className="bg-[#043d2e] rounded-2xl p-4 text-white shadow-sm border border-emerald-800/80">
                  <div className="flex items-center gap-3">
                    <div 
                      style={{ width: `${Math.max(40, (formData.logoHeight || 40))}px`, height: `${Math.max(40, (formData.logoHeight || 40))}px` }}
                      className={clsx(
                        "flex items-center justify-center shrink-0 shadow-inner overflow-hidden transition-all",
                        formData.logoShape === 'circle' ? 'rounded-full' :
                        formData.logoShape === 'square' ? 'rounded-none' :
                        formData.logoShape === 'original' ? 'rounded-md' : 'rounded-2xl',
                        currentLogoUrl && !previewError ? (
                          formData.logoBackground === 'white' ? 'bg-white p-0.5' :
                          formData.logoBackground === 'dark' ? 'bg-emerald-950 p-0.5' :
                          formData.logoBackground === 'amber' ? 'bg-amber-500/20 p-0.5' : 'bg-transparent'
                        ) : 'bg-[#78350f] text-amber-200'
                      )}
                    >
                      {currentLogoUrl && !previewError ? (
                        <img 
                          src={currentLogoUrl} 
                          alt="Logo Sidebar Preview" 
                          referrerPolicy="no-referrer"
                          onError={() => setPreviewError(true)}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Shield className="w-5 h-5 fill-amber-200/20 stroke-amber-200" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-white font-extrabold text-sm tracking-tight font-serif truncate">
                        {formData.fullName || 'As-Sunnah Institute'}
                      </h4>
                      <p className="text-emerald-200/80 text-[10px] font-medium tracking-wide truncate">
                        {formData.subtitle || 'Dawah & Research Hub'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Surface 3: Clean Light Background (Documents / Certificates) */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  3. Official Letterhead / Light Card (শ্বেত ব্যাকগ্রাউন্ড)
                </span>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      style={{ width: `${formData.logoHeight || 40}px`, height: `${formData.logoHeight || 40}px` }}
                      className={clsx(
                        "flex items-center justify-center shrink-0 shadow-2xs overflow-hidden border border-slate-200",
                        formData.logoShape === 'circle' ? 'rounded-full' :
                        formData.logoShape === 'square' ? 'rounded-none' :
                        formData.logoShape === 'original' ? 'rounded-md' : 'rounded-xl',
                        currentLogoUrl && !previewError ? 'bg-white p-0.5' : 'bg-emerald-800 text-amber-400'
                      )}
                    >
                      {currentLogoUrl && !previewError ? (
                        <img 
                          src={currentLogoUrl} 
                          alt="Light Mode Preview" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="font-serif font-extrabold text-lg">
                          {formData.monogramText || 'A'}
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="font-extrabold text-sm leading-tight block text-slate-900 font-serif">
                        {formData.fullName || 'As-Sunnah Dawah and Research Institute'}
                      </span>
                      <span className="text-emerald-800 text-[10px] uppercase tracking-wider block font-bold">
                        Academic Affairs & Research Board
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Card in Sidebar */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving Branding Settings...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save & Apply Logo Everywhere
                    </>
                  )}
                </button>

                <div className="mt-3 text-center">
                  <Link
                    href={`/${locale}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
                  >
                    <span>View Public Homepage</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
