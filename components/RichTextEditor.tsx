/* eslint-disable */
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3, Heading,
  List, ListOrdered, Quote, Code,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Image as ImageIcon, Table as TableIcon,
  Undo, Redo, RemoveFormatting, Eye, Code2,
  Maximize2, Minimize2, Palette, Sparkles, Check, X, Minus
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'এখানে বিস্তারিত তথ্য লিখুন...',
  className = ''
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [htmlSource, setHtmlSource] = useState(value || '');
  
  // Link modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // Image modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageCaption, setImageCaption] = useState('');

  // Table modal state
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Active command states
  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
  });

  // Keep editor content in sync with external value without breaking user typing cursor
  useEffect(() => {
    if (editorRef.current && !isSourceMode) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setHtmlSource(value || '');
  }, [value, isSourceMode]);

  // Update command active states on selection change
  const updateActiveStates = useCallback(() => {
    if (typeof document === 'undefined' || isSourceMode) return;
    try {
      setActiveStates({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
        justifyFull: document.queryCommandState('justifyFull'),
      });
    } catch {
      // Ignore queryCommandState issues in edge cases
    }
  }, [isSourceMode]);

  const exec = (command: string, value: string | undefined = undefined) => {
    if (isSourceMode) return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
      setHtmlSource(content);
    }
    updateActiveStates();
  };

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
      setHtmlSource(content);
    }
    updateActiveStates();
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setHtmlSource(newHtml);
    onChange(newHtml);
    if (editorRef.current) {
      editorRef.current.innerHTML = newHtml;
    }
  };

  const toggleSourceMode = () => {
    if (isSourceMode) {
      // Switching from HTML back to Visual
      if (editorRef.current) {
        editorRef.current.innerHTML = htmlSource;
      }
      setIsSourceMode(false);
    } else {
      // Switching to HTML
      if (editorRef.current) {
        setHtmlSource(editorRef.current.innerHTML);
      }
      setIsSourceMode(true);
    }
  };

  const insertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl) return;
    
    if (linkText) {
      const anchor = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-emerald-700 underline font-medium hover:text-emerald-900">${linkText}</a>`;
      exec('insertHTML', anchor);
    } else {
      exec('createLink', linkUrl);
    }
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
  };

  const insertImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;

    let imgHtml = `<img src="${imageUrl}" alt="${imageAlt || 'Image'}" class="my-4 rounded-xl max-w-full shadow-sm mx-auto" />`;
    if (imageCaption) {
      imgHtml = `<figure class="my-4 text-center"><img src="${imageUrl}" alt="${imageAlt || imageCaption}" class="rounded-xl max-w-full shadow-sm mx-auto inline-block" /><figcaption class="text-xs text-slate-500 mt-2 italic font-serif">${imageCaption}</figcaption></figure>`;
    }
    exec('insertHTML', imgHtml);
    setShowImageModal(false);
    setImageUrl('');
    setImageAlt('');
    setImageCaption('');
  };

  const insertTable = (e: React.FormEvent) => {
    e.preventDefault();
    const rows = Math.max(1, Math.min(tableRows, 20));
    const cols = Math.max(1, Math.min(tableCols, 10));

    let tableHtml = '<div class="overflow-x-auto my-4"><table class="w-full border-collapse border border-slate-300 rounded-lg text-sm text-left">';
    // Header
    tableHtml += '<thead class="bg-slate-100 font-bold border-b border-slate-300"><tr>';
    for (let c = 0; c < cols; c++) {
      tableHtml += `<th class="p-3 border border-slate-300">হেডার ${c + 1}</th>`;
    }
    tableHtml += '</tr></thead><tbody>';

    // Rows
    for (let r = 0; r < rows; r++) {
      tableHtml += `<tr class="${r % 2 === 0 ? 'bg-white' : 'bg-slate-50'}">`;
      for (let c = 0; c < cols; c++) {
        tableHtml += `<td class="p-3 border border-slate-300">তথ্য</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table></div><p><br></p>';

    exec('insertHTML', tableHtml);
    setShowTableModal(false);
  };

  // Preset Colors
  const colors = [
    { label: 'কালো', value: '#0f172a' },
    { label: 'সবুজ', value: '#064e3b' },
    { label: 'হালকা সবুজ', value: '#059669' },
    { label: 'সোনালী', value: '#b45309' },
    { label: 'নীল', value: '#1d4ed8' },
    { label: 'লাল', value: '#b91c1c' },
    { label: 'ধূসর', value: '#64748b' },
  ];

  const highlights = [
    { label: 'হলুদ', value: '#fef08a' },
    { label: 'হালকা সবুজ', value: '#d1fae5' },
    { label: 'হালকা নীল', value: '#e0f2fe' },
    { label: 'হালকা গোলাপী', value: '#ffe4e6' },
    { label: 'মুছুন', value: 'transparent' },
  ];

  // Quick word/char count
  const textContent = htmlSource.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent ? textContent.split(' ').length : 0;
  const charCount = textContent.length;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all ${
      isFullscreen ? 'fixed inset-4 z-50 shadow-2xl border-emerald-600 ring-4 ring-emerald-600/20' : className
    }`}>
      
      {/* Top Main Toolbar */}
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap items-center justify-between gap-1.5 select-none">
        
        {/* Left Toolbar Items */}
        <div className="flex flex-wrap items-center gap-1">
          
          {/* History Actions */}
          <button
            type="button"
            onClick={() => exec('undo')}
            title="পূর্বাবস্থায় ফেরান (Undo)"
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-colors"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => exec('redo')}
            title="পুনরায় করুন (Redo)"
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-colors"
          >
            <Redo className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-slate-200 mx-1" />

          {/* Heading Dropdown */}
          <select
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'p') exec('formatBlock', '<p>');
              else if (val === 'h1') exec('formatBlock', '<h1>');
              else if (val === 'h2') exec('formatBlock', '<h2>');
              else if (val === 'h3') exec('formatBlock', '<h3>');
              else if (val === 'h4') exec('formatBlock', '<h4>');
              else if (val === 'blockquote') exec('formatBlock', '<blockquote>');
              e.target.value = '';
            }}
            disabled={isSourceMode}
            defaultValue=""
            className="h-8 px-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-600 disabled:opacity-30 cursor-pointer"
          >
            <option value="" disabled>হেডিং শৈলী</option>
            <option value="p">সাধারণ অনুচ্ছেদ (Paragraph)</option>
            <option value="h1">প্রধান শিরোনাম (H1)</option>
            <option value="h2">উপ-শিরোনাম (H2)</option>
            <option value="h3">বিভাগীয় শিরোনাম (H3)</option>
            <option value="h4">ছোট শিরোনাম (H4)</option>
            <option value="blockquote">উদ্ধৃতি ব্লক (Quote)</option>
          </select>

          <div className="h-5 w-[1px] bg-slate-200 mx-1" />

          {/* Font Formats */}
          <button
            type="button"
            onClick={() => exec('bold')}
            title="বোল্ড (Bold Ctrl+B)"
            disabled={isSourceMode}
            className={`p-1.5 rounded-lg transition-colors ${
              activeStates.bold ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-200'
            } disabled:opacity-30`}
          >
            <Bold className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => exec('italic')}
            title="ইটালিক (Italic Ctrl+I)"
            disabled={isSourceMode}
            className={`p-1.5 rounded-lg transition-colors ${
              activeStates.italic ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-200'
            } disabled:opacity-30`}
          >
            <Italic className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => exec('underline')}
            title="আন্ডারলাইন (Underline Ctrl+U)"
            disabled={isSourceMode}
            className={`p-1.5 rounded-lg transition-colors ${
              activeStates.underline ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-200'
            } disabled:opacity-30`}
          >
            <Underline className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => exec('strikeThrough')}
            title="স্ট্রাইকথ্রু"
            disabled={isSourceMode}
            className={`p-1.5 rounded-lg transition-colors ${
              activeStates.strikeThrough ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-200'
            } disabled:opacity-30`}
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-slate-200 mx-1" />

          {/* Color & Highlight Dropdowns */}
          <div className="relative group">
            <button
              type="button"
              disabled={isSourceMode}
              title="টেক্সটের রঙ"
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 flex items-center gap-0.5 disabled:opacity-30"
            >
              <Palette className="w-4 h-4 text-emerald-700" />
            </button>
            <div className="hidden group-hover:flex absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-20 gap-1.5">
              {colors.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => exec('foreColor', c.value)}
                  className="w-5 h-5 rounded-full border border-slate-300 transition-transform hover:scale-125"
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="relative group">
            <button
              type="button"
              disabled={isSourceMode}
              title="হাইলাইট কালার"
              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 flex items-center gap-0.5 disabled:opacity-30"
            >
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-yellow-200 text-yellow-900">A</span>
            </button>
            <div className="hidden group-hover:flex absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-20 gap-1.5">
              {highlights.map(h => (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => exec('hiliteColor', h.value)}
                  className="w-5 h-5 rounded-full border border-slate-300 transition-transform hover:scale-125"
                  style={{ backgroundColor: h.value }}
                  title={h.label}
                />
              ))}
            </div>
          </div>

          <div className="h-5 w-[1px] bg-slate-200 mx-1" />

          {/* Alignment */}
          <button
            type="button"
            onClick={() => exec('justifyLeft')}
            title="বামে সারিবদ্ধ"
            disabled={isSourceMode}
            className={`p-1.5 rounded-lg transition-colors ${
              activeStates.justifyLeft ? 'bg-emerald-100 text-emerald-800' : 'text-slate-700 hover:bg-slate-200'
            } disabled:opacity-30`}
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => exec('justifyCenter')}
            title="কেন্দ্রে সারিবদ্ধ"
            disabled={isSourceMode}
            className={`p-1.5 rounded-lg transition-colors ${
              activeStates.justifyCenter ? 'bg-emerald-100 text-emerald-800' : 'text-slate-700 hover:bg-slate-200'
            } disabled:opacity-30`}
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => exec('justifyRight')}
            title="ডানে সারিবদ্ধ"
            disabled={isSourceMode}
            className={`p-1.5 rounded-lg transition-colors ${
              activeStates.justifyRight ? 'bg-emerald-100 text-emerald-800' : 'text-slate-700 hover:bg-slate-200'
            } disabled:opacity-30`}
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => exec('justifyFull')}
            title="উভয় পাশে সমান (Justify)"
            disabled={isSourceMode}
            className={`p-1.5 rounded-lg transition-colors ${
              activeStates.justifyFull ? 'bg-emerald-100 text-emerald-800' : 'text-slate-700 hover:bg-slate-200'
            } disabled:opacity-30`}
          >
            <AlignJustify className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-slate-200 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => exec('insertUnorderedList')}
            title="বুলেট তালিকা"
            disabled={isSourceMode}
            className={`p-1.5 rounded-lg transition-colors ${
              activeStates.insertUnorderedList ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-200'
            } disabled:opacity-30`}
          >
            <List className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => exec('insertOrderedList')}
            title="সংখ্যাযুক্ত তালিকা"
            disabled={isSourceMode}
            className={`p-1.5 rounded-lg transition-colors ${
              activeStates.insertOrderedList ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-slate-700 hover:bg-slate-200'
            } disabled:opacity-30`}
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-slate-200 mx-1" />

          {/* Insert Media / Elements */}
          <button
            type="button"
            onClick={() => setShowLinkModal(true)}
            title="লিঙ্ক যুক্ত করুন"
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 disabled:opacity-30 transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            title="ছবি যুক্ত করুন"
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 disabled:opacity-30 transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowTableModal(true)}
            title="টেবিল যুক্ত করুন"
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 disabled:opacity-30 transition-colors"
          >
            <TableIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => exec('insertHorizontalRule')}
            title="বিভাজক রেখা (Divider)"
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200 disabled:opacity-30 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => exec('removeFormat')}
            title="ফরম্যাট মুছুন (Clear Format)"
            disabled={isSourceMode}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-30 transition-colors"
          >
            <RemoveFormatting className="w-4 h-4" />
          </button>

        </div>

        {/* Right Toolbar Items: Mode Switchers */}
        <div className="flex items-center gap-1.5 ml-auto">
          
          {/* Toggle HTML Source Code Mode */}
          <button
            type="button"
            onClick={toggleSourceMode}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isSourceMode
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
            title={isSourceMode ? 'ভিজ্যুয়াল এডিটরে ফিরে যান' : 'সরাসরি HTML সোর্স কোড এডিট করুন'}
          >
            {isSourceMode ? (
              <>
                <Eye className="w-3.5 h-3.5 text-emerald-700" />
                <span>Visual</span>
              </>
            ) : (
              <>
                <Code2 className="w-3.5 h-3.5 text-amber-700" />
                <span>HTML Code</span>
              </>
            )}
          </button>

          {/* Fullscreen Expand */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
            title={isFullscreen ? 'সাধারণ ভিউ' : 'ফুলস্ক্রিন ভিউ'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* Editor Content Area */}
      <div className={`relative flex-1 bg-white overflow-y-auto ${isFullscreen ? 'min-h-[70vh]' : 'min-h-[320px] max-h-[600px]'}`}>
        
        {isSourceMode ? (
          /* Raw HTML Source Code Editor */
          <div className="p-4 h-full bg-slate-900 text-slate-100 font-mono text-xs">
            <div className="text-[11px] text-amber-400 mb-2 font-sans flex items-center gap-1">
              <Code className="w-3.5 h-3.5" />
              HTML সোর্স কোড মোড সক্রিয় — এখানে যে কোনো কাস্টম HTML বা স্টাইল কোড লিখতে পারেন
            </div>
            <textarea
              value={htmlSource}
              onChange={handleSourceChange}
              placeholder="<p>আপনার HTML কন্টেন্ট লিখুন...</p>"
              className="w-full h-[320px] bg-transparent text-emerald-300 font-mono text-xs p-2 focus:outline-none resize-y"
              spellCheck={false}
            />
          </div>
        ) : (
          /* Live WYSIWYG Visual Canvas */
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onKeyUp={updateActiveStates}
            onMouseUp={updateActiveStates}
            onBlur={handleInput}
            className="p-6 h-full min-h-[320px] focus:outline-none prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-emerald-700 prose-img:rounded-xl prose-img:shadow-sm"
            style={{ minHeight: '300px' }}
          />
        )}

        {/* Empty state hint */}
        {!isSourceMode && (!value || value.trim() === '' || value === '<p></p>' || value === '<p><br></p>') && (
          <div className="absolute top-6 left-6 pointer-events-none text-slate-400 text-sm font-serif select-none">
            {placeholder}
          </div>
        )}

      </div>

      {/* Footer Info Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            ASDRI রিচ টেক্সট স্টুডিও
          </span>
          <span>•</span>
          <span>শব্দ: <strong className="text-slate-700">{wordCount}</strong></span>
          <span>অক্ষর: <strong className="text-slate-700">{charCount}</strong></span>
        </div>
        <div>
          {isSourceMode ? (
            <span className="text-amber-700 font-bold">HTML এডিট মোড</span>
          ) : (
            <span className="text-emerald-700 font-bold">লাইভ ভিউ মোড</span>
          )}
        </div>
      </div>

      {/* Link Insertion Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-emerald-700" />
                হাইপারলিঙ্ক যুক্ত করুন
              </h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={insertLink} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase">লিঙ্ক URL (ওয়েবসাইট বা পেজ ঠিকানা) *</label>
                <input
                  type="url"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com বা /about"
                  className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-700 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase">প্রদর্শন টেক্সট (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="এখানে ক্লিক করুন"
                  className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-700 focus:bg-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 font-bold hover:bg-slate-100 rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-[#064e3b] text-white font-bold rounded-lg hover:bg-emerald-800"
                >
                  যুক্ত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Insertion Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-700" />
                ছবি সন্নিবেশ করুন
              </h4>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={insertImage} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase">ছবির অনলাইন লিংক (Image URL) *</label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... বা https://..."
                  className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-700 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase">ছবির ক্যাপশন / বিবরণ (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="যেমন: ইনস্টিটিউটের মূল অডিটোরিয়াম"
                  className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-700 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase">অল্ট টেক্সট (Alt Text)</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="ছবি সম্পর্কিত কীওয়ার্ড"
                  className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-700 focus:bg-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 font-bold hover:bg-slate-100 rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-[#064e3b] text-white font-bold rounded-lg hover:bg-emerald-800"
                >
                  ছবি যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Insertion Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-emerald-700" />
                টেবিল তৈরি করুন
              </h4>
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={insertTable} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase">সারি সংখ্যা (Rows)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                    className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase">কলাম সংখ্যা (Columns)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                    className="w-full mt-1 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTableModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 font-bold hover:bg-slate-100 rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs bg-[#064e3b] text-white font-bold rounded-lg hover:bg-emerald-800"
                >
                  টেবিল সন্নিবেশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
