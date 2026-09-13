'use client';

import React from 'react';
import { 
  Landmark, ShieldCheck, HeartHandshake, BookOpen, 
  Users, Award, Sparkles, CheckCircle2, Globe, ArrowRight,
  GraduationCap, Target, Eye, Compass
} from 'lucide-react';
import Link from 'next/link';

interface AlumniAboutViewProps {
  onNavigateTab?: (tabId: string) => void;
}

export function AlumniAboutView({ onNavigateTab }: AlumniAboutViewProps) {
  const objectives = [
    {
      title: 'Religious Brotherhood and Social Unity',
      desc: 'Maintain mutual communication, sympathy, and spiritual connection among graduates of all batches of the institute.',
      icon: HeartHandshake
    },
    {
      title: 'Advanced Research and Knowledge Cultivation',
      desc: 'Sponsor joint research and publications on contemporary complex issues related to Hadith, Fiqh, and Da’wah.',
      icon: BookOpen
    },
    {
      title: 'Career and Employment Support',
      desc: 'Assist fresh graduates with higher education, international scholarships, and placement in suitable workplaces both domestically and internationally.',
      icon: Target
    },
    {
      title: 'Welfare Fund and Emergency Support',
      desc: 'Operate a permanent institutional fund to stand by underprivileged students, researchers, and sick graduate families.',
      icon: ShieldCheck
    }
  ];

  const milestones = [
    { year: '2021', title: 'First Batch Convocation of the Institute', desc: 'The first batch of the Higher Hadith and Da\'wah Faculty successfully completed graduation.' },
    { year: '2022', title: 'Formation of Central Alumni Committee', desc: 'The framework of the formal association was finalized under the direct guidance of Shaykh Ahmadullah.' },
    { year: '2024', title: 'Global Chapter and International Network', desc: 'Regional coordination committees formed in Saudi Arabia, UAE, and UK.' },
    { year: '2026', title: 'Smart Digital ID and Integrated Portal', desc: 'Cloud-integrated central directory and member portal launched for all alumni.' }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      
      {/* Hero Section */}
      <div className="bg-linear-to-r from-[#064e3b] via-[#043e2f] to-[#022c22] rounded-3xl p-6 sm:p-12 text-white shadow-xl relative overflow-hidden border border-emerald-800">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-amber-300 text-xs font-bold">
            <Landmark className="w-3.5 h-3.5" />
            <span>As-Sunnah Alumni Association (ASAA) Introduction</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold font-serif text-white leading-tight">
            A Platform for Traditional Religious Heritage, Advanced Research, and Trusted Brotherhood
          </h1>

          <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
            Composed of all Islamic scholars, researchers, teachers, and callers (Da'ees) who have graduated from As-Sunnah Da'wah and Research Institute, the As-Sunnah Alumni Association is dedicated to building a knowledge-based religious society and serving the intellectual needs of the Muslim Ummah.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {onNavigateTab && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateTab('committee')}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  View Executive Committee
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('constitution')}
                  className="px-5 py-2.5 bg-emerald-900/80 hover:bg-emerald-800 text-amber-300 border border-amber-400/30 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  Constitution and Regulations
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-serif text-[#064e3b]">Our Vision</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To establish a united network of scholars in the global sphere based on the pure knowledge of the Quran and Sunnah and contemporary research, who will provide leading guidance in religious propagation (Da'wah), human welfare, and the formation of a moral society.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-serif text-[#064e3b]">Our Mission</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To maintain fraternal relations among graduates, provide mentorship in their institutional and international careers, conduct joint academic research, and continuously cooperate in achieving the core objectives of the As-Sunnah Institute.
          </p>
        </div>
      </div>

      {/* Core Objectives */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Association Objectives
          </span>
          <h2 className="text-2xl font-bold font-serif text-[#064e3b]">
            Core Goals and Objectives of the Alumni Association
          </h2>
          <p className="text-xs text-slate-500">
            Four main pillars are at the heart of all our activities and projects
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {objectives.map((obj, i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
                <obj.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-serif text-slate-900">{obj.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{obj.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Milestones */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <GraduationCap className="w-6 h-6 text-emerald-700" />
          <div>
            <h2 className="text-xl font-bold font-serif text-[#064e3b]">Historical Journey of the Institute and Association</h2>
            <p className="text-xs text-slate-500">From inception to today's consolidated international stage</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {milestones.map((ms, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 relative">
              <span className="text-base font-bold font-serif text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 inline-block">
                {ms.year}
              </span>
              <h3 className="text-sm font-bold text-slate-900 font-serif pt-1">{ms.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{ms.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}