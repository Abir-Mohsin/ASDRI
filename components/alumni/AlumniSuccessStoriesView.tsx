'use client';

import React, { useState } from 'react';
import { 
  AlumniSuccessStory, INITIAL_SUCCESS_STORIES 
} from '@/lib/alumniTypes';
import { 
  Award, Sparkles, Quote, CheckCircle2, 
  MapPin, Briefcase, GraduationCap, ChevronRight,
  ExternalLink, BookOpen, Star, Filter
} from 'lucide-react';

interface AlumniSuccessStoriesViewProps {
  stories?: AlumniSuccessStory[];
}

export function AlumniSuccessStoriesView({ stories = INITIAL_SUCCESS_STORIES }: AlumniSuccessStoriesViewProps) {
  const [selectedStory, setSelectedStory] = useState<AlumniSuccessStory | null>(null);
  const [batchFilter, setBatchFilter] = useState<string>('all');

  const filteredStories = stories.filter(s => {
    if (batchFilter === 'all') return true;
    return s.batch.toLowerCase().includes(batchFilter.toLowerCase());
  });

  const featuredStory = stories.find(s => s.featured) || stories[0];

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-linear-to-r from-[#064e3b] via-[#043e2f] to-[#022c22] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-emerald-800">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Alumni Success Stories & Achievements</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold font-serif text-white leading-tight">
            Inspirational Achievements and Success Stories of Talented Graduates
          </h1>

          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
            The lives and works of talented scholars who have made unique contributions to research, teaching, fatwa, Islamic banking, and social service at home and abroad after gaining knowledge from As-Sunnah Dawah and Research Institute.
          </p>
        </div>
      </div>

      {/* Featured Spotlight Card */}
      {featuredStory && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-full lg:w-1/3 shrink-0 text-center">
              <div className="relative inline-block">
                <img
                  src={featuredStory.photoUrl}
                  alt={featuredStory.name}
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl object-cover border-4 border-emerald-100 shadow-md mx-auto"
                />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-extrabold text-[11px] px-3.5 py-1 rounded-full shadow-xs whitespace-nowrap flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Spotlight Scholar</span>
                </div>
              </div>

              <div className="mt-5 space-y-1">
                <h3 className="text-lg font-bold font-serif text-slate-900">{featuredStory.name}</h3>
                <p className="text-xs text-emerald-800 font-semibold">{featuredStory.currentRole}</p>
                <p className="text-[11px] text-slate-500">{featuredStory.organization}</p>
              </div>
            </div>

            <div className="w-full lg:w-2/3 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
                  {featuredStory.batch}
                </span>
                <span className="bg-slate-100 text-slate-700 font-medium px-3 py-1 rounded-full">
                  {featuredStory.program}
                </span>
                <span className="flex items-center gap-1 text-slate-500 text-xs ml-auto">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {featuredStory.location}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#064e3b] leading-snug">
                {featuredStory.headline}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {featuredStory.story}
              </p>

              {featuredStory.quote && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-slate-800 italic text-xs sm:text-sm relative">
                  <Quote className="w-6 h-6 text-amber-400 absolute top-2 right-2 opacity-30" />
                  &quot;{featuredStory.quote}&quot;
                </div>
              )}

              {/* Achievements list */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notable Achievements:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {featuredStory.keyAchievements.map((ach, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{ach}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-bold font-serif text-[#064e3b] flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Inspirational Stories of All Graduates
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The lives and works of talented scholars who have graduated from various batches and faculties
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Batch Filter:</span>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
            >
              <option value="all">All Batches</option>
              <option value="1st">1st Batch</option>
              <option value="2nd">2nd Batch</option>
              <option value="3rd">3rd Batch</option>
            </select>
          </div>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={story.photoUrl}
                    alt={story.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-100 shadow-xs group-hover:scale-105 transition-transform"
                  />
                  <div>
                    <h3 className="text-base font-bold font-serif text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {story.name}
                    </h3>
                    <p className="text-xs text-emerald-800 font-semibold">{story.currentRole}</p>
                    <p className="text-[10px] text-slate-500">{story.batch}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">
                    {story.headline}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {story.story}
                  </p>
                </div>

                {story.quote && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 italic">
                    &quot;{story.quote}&quot;
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                  {story.alumniId}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedStory(story)}
                  className="text-xs font-bold text-[#064e3b] hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  Read More <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Story Detail Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStory.photoUrl}
                  alt={selectedStory.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-100"
                />
                <div>
                  <h3 className="text-lg font-bold font-serif text-slate-900">{selectedStory.name}</h3>
                  <p className="text-xs text-emerald-800 font-bold">{selectedStory.currentRole}</p>
                  <p className="text-xs text-slate-500">{selectedStory.organization} • {selectedStory.location}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStory(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold font-serif text-[#064e3b]">
                {selectedStory.headline}
              </h2>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {selectedStory.story}
              </p>

              {selectedStory.quote && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-slate-800 italic text-xs sm:text-sm">
                  &quot;{selectedStory.quote}&quot;
                </div>
              )}

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase">Key Achievements & Endeavors:</h4>
                <ul className="space-y-2">
                  {selectedStory.keyAchievements.map((ach, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStory(null)}
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
