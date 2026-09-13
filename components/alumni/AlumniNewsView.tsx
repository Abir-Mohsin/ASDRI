'use client';

import React, { useState } from 'react';
import { AlumniAnnouncement, INITIAL_ANNOUNCEMENTS } from '@/lib/alumniTypes';
import { 
  Bell, Pin, Calendar, Tag, Search, Filter, 
  ExternalLink, ChevronRight, Share2, Sparkles, FileText
} from 'lucide-react';

interface AlumniNewsViewProps {
  announcements?: AlumniAnnouncement[];
}

export function AlumniNewsView({ announcements = INITIAL_ANNOUNCEMENTS }: AlumniNewsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItem, setActiveItem] = useState<AlumniAnnouncement | null>(null);

  const filtered = announcements.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'general': return 'General Circular';
      case 'event': return 'Events & Reunion';
      case 'career': return 'Career & Research';
      case 'urgent': return 'Urgent Notice';
      case 'achievement': return 'Achievement News';
      default: return 'Announcement';
    }
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'urgent': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'event': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'career': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-linear-to-r from-[#064e3b] via-[#043e2f] to-[#022c22] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-emerald-800">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-amber-300 text-xs font-bold">
            <Bell className="w-3.5 h-3.5" />
            <span>News, Circulars & Announcements</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold font-serif text-white leading-tight">
            Institute & Alumni Association News & Notice Board
          </h1>

          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
            Official institutional circulars, research grant announcements, academic notices, and alumni news for graduates of As-Sunnah Dawah & Research Institute.
          </p>
        </div>
      </div>

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { id: 'all', label: 'All Notices' },
            { id: 'general', label: 'General' },
            { id: 'event', label: 'Events' },
            { id: 'career', label: 'Career & Research' },
            { id: 'urgent', label: 'Urgent' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-[#064e3b] text-amber-300 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* News / Announcements List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700 font-serif">No Notices Found</h3>
            <p className="text-xs text-slate-500">Try searching with a different keyword or filter.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl border transition-all p-6 sm:p-7 shadow-xs hover:shadow-md space-y-4 relative ${
                item.isPinned ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
              }`}
            >
              {item.isPinned && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[10px] font-bold">
                  <Pin className="w-3 h-3 fill-amber-700 text-amber-700" />
                  <span>Pinned Priority Notice</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${getCategoryBadgeClass(item.category)}`}>
                      {getCategoryLabel(item.category)}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.publishedDate || 'Recently Published'}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900 leading-snug">
                    {item.title}
                  </h2>
                </div>

                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl self-start shrink-0 border border-emerald-100">
                  {item.authorRole || item.createdBy}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {item.content}
              </p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  As-Sunnah Dawah & Research Institute Media & PR Cell
                </span>

                <button
                  type="button"
                  onClick={() => setActiveItem(item)}
                  className="text-xs font-bold text-[#064e3b] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Read Full Notice <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal View for detailed announcement */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${getCategoryBadgeClass(activeItem.category)}`}>
                  {getCategoryLabel(activeItem.category)}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">{activeItem.publishedDate || 'February 2026'}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <h2 className="text-lg font-bold font-serif text-[#064e3b]">
              {activeItem.title}
            </h2>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
              <p>{activeItem.content}</p>
              <p className="text-[11px] text-slate-500 italic">
                Authority: {activeItem.authorRole || activeItem.createdBy}, As-Sunnah Dawah & Research Institute.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="px-6 py-2.5 bg-[#064e3b] text-amber-300 text-xs font-bold rounded-xl hover:bg-emerald-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
