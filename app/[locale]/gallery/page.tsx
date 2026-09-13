'use client';

import React from 'react';
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GalleryPageContent } from "@/components/GalleryPageContent";
import { useParams } from 'next/navigation';

export default function GalleryPage() {
  const params = useParams();
  const locale = (params?.locale as any) || 'bn';

  const dictMock = {
    common: {
      home: locale === 'bn' ? 'হোম' : 'Home',
      about: locale === 'bn' ? 'আমাদের সম্পর্কে' : 'About',
      courses: locale === 'bn' ? 'কোর্সসমূহ' : 'Courses',
      admission: locale === 'bn' ? 'ভর্তি' : 'Admission',
      library: locale === 'bn' ? 'ডিজিটাল লাইব্রেরি' : 'Digital Library',
      gallery: locale === 'bn' ? 'গ্যালারি' : 'Gallery',
      alumni: locale === 'bn' ? 'এলামনাই' : 'Alumni',
      login: locale === 'bn' ? 'লগইন' : 'Login',
      dashboard: locale === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard',
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Navbar dict={dictMock} locale={locale} />
      <main className="flex-1">
        <GalleryPageContent locale={locale} />
      </main>
      <Footer dict={dictMock} locale={locale} />
    </div>
  );
}
