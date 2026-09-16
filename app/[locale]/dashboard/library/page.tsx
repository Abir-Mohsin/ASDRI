'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  Book, Search, Filter, Download, Eye, BookmarkPlus, 
  ExternalLink, Plus, Trash2, Edit2, X, RefreshCw, 
  BookOpen, Sparkles, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { 
  collection, query, onSnapshot, addDoc, doc, 
  updateDoc, deleteDoc, setDoc 
} from 'firebase/firestore';
import { BookReaderModal } from '@/components/BookReaderModal';
import { LibraryBook, getBookEmbedUrl, getBookDownloadUrl } from '@/lib/libraryBooksData';

export default function LibraryPage() {
  const { role, user } = useAuthStore();
  const params = useParams();
  const locale = (params?.locale as 'en' | 'bn' | 'ar') || 'bn';
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Resources loaded from Firestore
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  // Form / Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any | null>(null);
  const [selectedBookForReading, setSelectedBookForReading] = useState<LibraryBook | null>(null);

  // Form Fields State
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formCategory, setFormCategory] = useState('Aqeedah');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [formType, setFormType] = useState('PDF');
  const [formSize, setFormSize] = useState('2.5 MB');
  const [formLanguage, setFormLanguage] = useState('Arabic/English');
  const [formDriveUrl, setFormDriveUrl] = useState('');
  const [formDownloadUrl, setFormDownloadUrl] = useState('');

  const defaultCategories = ['Aqeedah', 'Fiqh', 'Hadith', 'Tafseer', 'Seerah', 'Research Papers'];
  const allExistingCategories = Array.from(
    new Set([
      ...defaultCategories,
      ...resources.map((r) => r.category).filter(Boolean)
    ])
  );
  const categories = ['All', ...allExistingCategories];

  // Default initial mock resources
  const defaultMockResources = [
    {
      id: 'book1',
      title: 'Al-Aqeedah Al-Tahawiyyah',
      author: 'Imam Abu Jafar al-Tahawi',
      category: 'Aqeedah',
      type: 'PDF',
      size: '2.4 MB',
      reads: 1240,
      language: 'Arabic/English',
      driveUrl: 'https://archive.org/details/Sharh-Aqeedah-Tahawiyyah-Bangla',
    },
    {
      id: 'book2',
      title: 'Mukhtasar al-Quduri',
      author: 'Imam al-Quduri',
      category: 'Fiqh',
      type: 'PDF',
      size: '5.1 MB',
      reads: 890,
      language: 'Arabic',
      driveUrl: 'https://archive.org/details/Al-Hidayah-Bangla-Full',
    },
    {
      id: 'book3',
      title: 'Introduction to Usul al-Fiqh',
      author: 'Dr. Hashim Kamali',
      category: 'Fiqh',
      type: 'E-Book',
      size: '1.2 MB',
      reads: 3450,
      language: 'English',
      driveUrl: 'https://archive.org/details/Itqan-Fi-Ulum-Al-Quran',
    },
    {
      id: 'paper1',
      title: 'Modern Dawah Challenges in the West',
      author: 'ASDRI Research Wing',
      category: 'Research Papers',
      type: 'Document',
      size: '800 KB',
      reads: 430,
      language: 'English',
      driveUrl: 'https://archive.org/details/ModernDawah',
    },
    {
      id: 'book4',
      title: 'Tafseer Ibn Kathir (Vol 1)',
      author: 'Imam Ibn Kathir',
      category: 'Tafseer',
      type: 'PDF',
      size: '15 MB',
      reads: 5600,
      language: 'Arabic/Bengali',
      driveUrl: 'https://archive.org/details/Tafseer-Ibn-Katheer-Bengali',
    }
  ];

  // Fetch from Firestore
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'library_resources'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResources(list);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to library resources:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync / Seed Default Resources to Firestore if empty
  const handleSeedResources = async () => {
    if (!db || isSeeding) return;
    setIsSeeding(true);
    try {
      for (const res of defaultMockResources) {
        await setDoc(doc(db, 'library_resources', res.id), {
          title: res.title,
          author: res.author,
          category: res.category,
          type: res.type,
          size: res.size,
          reads: res.reads,
          language: res.language,
          driveUrl: res.driveUrl,
          createdAt: new Date().toISOString()
        });
      }
      alert(locale === 'en' ? 'Digital Library resources seeded successfully!' : 'ডিজিটাল লাইব্রেরি রিসোর্স সফলভাবে ডাটাবেজে সিঙ্ক করা হয়েছে!');
    } catch (err) {
      console.error("Error seeding library resources:", err);
      alert("Failed to seed library resources: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSeeding(false);
    }
  };

  // Open Add Resource Modal
  const handleOpenAddModal = () => {
    setEditingResource(null);
    setFormTitle('');
    setFormAuthor('');
    setFormCategory('Aqeedah');
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setFormType('PDF');
    setFormSize('2.5 MB');
    setFormLanguage('Arabic/English');
    setFormDriveUrl('');
    setFormDownloadUrl('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (resource: any) => {
    setEditingResource(resource);
    setFormTitle(resource.title || '');
    setFormAuthor(resource.author || '');
    const currentCat = resource.category || 'Aqeedah';
    setFormCategory(currentCat);
    const isCustom = !defaultCategories.includes(currentCat);
    setIsCustomCategory(isCustom);
    setCustomCategoryInput(isCustom ? currentCat : '');
    setFormType(resource.type || 'PDF');
    setFormSize(resource.size || '2.5 MB');
    setFormLanguage(resource.language || 'Arabic/English');
    setFormDriveUrl(resource.driveUrl || '');
    setFormDownloadUrl(resource.downloadUrl || '');
    setIsModalOpen(true);
  };

  // Handle Save (Add/Edit)
  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formAuthor) return;

    const finalCategory = (isCustomCategory ? customCategoryInput.trim() : formCategory.trim()) || 'General';

    const payload = {
      title: formTitle,
      author: formAuthor,
      category: finalCategory,
      type: formType,
      size: formSize,
      language: formLanguage,
      driveUrl: formDriveUrl,
      downloadUrl: formDownloadUrl,
      reads: editingResource ? (editingResource.reads || 0) : 0,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (editingResource) {
        // Edit existing
        await updateDoc(doc(db, 'library_resources', editingResource.id), payload);
        alert(locale === 'en' ? 'Resource updated successfully!' : 'রিসোর্স সফলভাবে আপডেট করা হয়েছে!');
      } else {
        // Create new
        const newDocId = 'res_' + Date.now().toString();
        await setDoc(doc(db, 'library_resources', newDocId), {
          ...payload,
          createdAt: new Date().toISOString()
        });
        alert(locale === 'en' ? 'Resource added successfully!' : 'নতুন রিসোর্স সফলভাবে যুক্ত করা হয়েছে!');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving library resource:", err);
      alert("Error saving resource: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Delete Resource
  const handleDeleteResource = async (id: string, title: string) => {
    const confirmationText = locale === 'en' 
      ? `Are you sure you want to delete "${title}"?` 
      : `আপনি কি নিশ্চিত যে আপনি "${title}" মুছে ফেলতে চান?`;
    if (!confirm(confirmationText)) return;

    try {
      await deleteDoc(doc(db, 'library_resources', id));
      alert(locale === 'en' ? 'Resource deleted successfully!' : 'রিসোর্স সফলভাবে মুছে ফেলা হয়েছে!');
    } catch (err) {
      console.error("Error deleting library resource:", err);
      alert("Error deleting: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Dynamic resources list combining Firestore with fallback if loading or Firestore is empty
  const displayResources = resources.length > 0 ? resources : (loading ? [] : defaultMockResources);

  const filteredResources = displayResources.filter(r => {
    const matchesSearch = r.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const isAuthorized = role === 'admin' || role === 'super_admin' || role === 'library_staff';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              {locale === 'en' ? 'Academic Hub' : 'একাডেমিক পোর্টাল'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {locale === 'en' ? 'Database Integrated' : 'ডাটাবেজ সংযুক্ত'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
            {locale === 'en' ? 'Digital Research Library' : 'ডিজিটাল গবেষণা লাইব্রেরি'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {locale === 'en' 
              ? 'Access and manage authentic Islamic books, research papers, and course materials.' 
              : 'ইসলামি কিতাব, গবেষণা প্রবন্ধ এবং কোর্স সামগ্রী সরাসরি পড়ুন ও ডাউনলোড করুন।'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {resources.length === 0 && !loading && isAuthorized && (
            <button 
              onClick={handleSeedResources}
              disabled={isSeeding}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
              title="Seed mock resources to Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
              {isSeeding ? (locale === 'en' ? 'Syncing...' : 'সিঙ্ক হচ্ছে...') : (locale === 'en' ? 'Seed DB Catalog' : 'ডাটাবেজে সিঙ্ক করুন')}
            </button>
          )}

          {isAuthorized && (
            <button 
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-[#064e3b] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-950 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {locale === 'en' ? 'Upload Resource' : 'রিসোর্স আপলোড করুন'}
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={locale === 'en' ? "Search books, authors, or topics..." : "কিতাব, লেখক বা বিষয় দিয়ে অনুসন্ধান করুন..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#064e3b] outline-none text-sm transition-all"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-semibold whitespace-nowrap">
            <Filter className="w-4 h-4" /> 
            {locale === 'en' ? 'Advanced Filter' : 'ফিল্টার অপশন'}
          </button>
        </div>
        
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                activeCategory === cat 
                  ? 'bg-[#064e3b] text-white border-[#064e3b]' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {cat === 'All' ? (locale === 'en' ? 'All' : 'সব') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-[#064e3b] animate-spin" />
            <p className="text-slate-500 text-xs font-semibold">
              {locale === 'en' ? 'Fetching digital catalog...' : 'ডিজিটাল লাইব্রেরি লোড হচ্ছে...'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">{locale === 'en' ? 'Title & Author' : 'কিতাবের নাম ও লেখক'}</th>
                  <th className="px-6 py-4 font-semibold">{locale === 'en' ? 'Category' : 'বিষয়'}</th>
                  <th className="px-6 py-4 font-semibold hidden md:table-cell">{locale === 'en' ? 'Format' : 'ফরম্যাট ও সাইজ'}</th>
                  <th className="px-6 py-4 font-semibold hidden lg:table-cell">{locale === 'en' ? 'Language' : 'ভাষা'}</th>
                  <th className="px-6 py-4 font-semibold text-right">{locale === 'en' ? 'Actions' : 'কার্যক্রম'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResources.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      {locale === 'en' ? 'No resources found matching your search.' : 'অনুসন্ধানের সাথে মিল পাওয়া কোনো তথ্য নেই।'}
                    </td>
                  </tr>
                ) : (
                  filteredResources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-12 bg-emerald-50 rounded border border-emerald-100 flex items-center justify-center shrink-0">
                            <Book className="w-5 h-5 text-emerald-700" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 line-clamp-1">{resource.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">{resource.author}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 md:hidden">{resource.type} • {resource.size}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                          {resource.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-700">{resource.type}</span>
                          <span className="text-[10px] text-slate-400">{resource.size}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-xs font-medium text-slate-500">{resource.language || 'Arabic'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isAuthorized && (
                            <>
                              <button 
                                onClick={() => handleOpenEditModal(resource)}
                                className="p-2 text-slate-400 hover:text-[#064e3b] hover:bg-emerald-50 rounded-lg transition-colors" 
                                title={locale === 'en' ? "Edit resource details" : "রিসোর্স এডিট করুন"}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteResource(resource.id, resource.title)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                title={locale === 'en' ? "Delete resource" : "রিসোর্স মুছে ফেলুন"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button 
                            onClick={() => setSelectedBookForReading(resource)}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" 
                            title={locale === 'en' ? "Read Online" : "অনলাইনে পড়ুন"}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {resource.driveUrl && (
                            <a 
                              href={resource.downloadUrl || getBookDownloadUrl(resource.driveUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                              title={locale === 'en' ? "Download" : "ডাউনলোড"}
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Book Reader Modal */}
      {selectedBookForReading && (
        <BookReaderModal
          book={selectedBookForReading}
          onClose={() => setSelectedBookForReading(null)}
          locale={locale}
        />
      )}

      {/* Upload/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#064e3b] to-[#043e2f] px-6 py-4 flex items-center justify-between text-white border-b border-emerald-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold font-serif text-sm sm:text-base">
                  {editingResource 
                    ? (locale === 'en' ? 'Edit Scholarly Resource' : 'রিসোর্স সংশোধন করুন')
                    : (locale === 'en' ? 'Upload New Research Resource' : 'নতুন রিসোর্স আপলোড করুন')}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-emerald-800 rounded-lg text-emerald-100 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveResource} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {locale === 'en' ? 'Resource Title *' : 'রিসোর্সের নাম *'}
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Al-Aqeedah Al-Tahawiyyah"
                    className="w-full text-xs bg-slate-50 text-slate-950 border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-emerald-700 focus:bg-white outline-none font-medium transition-all"
                  />
                </div>

                {/* Author */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {locale === 'en' ? 'Scholar / Author *' : 'লেখক / মুসান্নিফ *'}
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    placeholder="e.g. Imam Abu Jafar al-Tahawi"
                    className="w-full text-xs bg-slate-50 text-slate-950 border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-emerald-700 focus:bg-white outline-none font-medium transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Category */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        {locale === 'en' ? 'Category *' : 'ক্যাটাগরি *'}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !isCustomCategory;
                          setIsCustomCategory(nextState);
                          if (nextState) {
                            setCustomCategoryInput(formCategory && !defaultCategories.includes(formCategory) ? formCategory : '');
                          }
                        }}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
                      >
                        {isCustomCategory ? (
                          <>
                            <Filter className="w-3 h-3" />
                            <span>{locale === 'en' ? 'Select List' : 'ড্রপডাউন'}</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>{locale === 'en' ? '+ Custom / Edit' : '+ নতুন / এডিট'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {isCustomCategory ? (
                      <div>
                        <input 
                          type="text"
                          required
                          value={customCategoryInput}
                          onChange={(e) => {
                            setCustomCategoryInput(e.target.value);
                            setFormCategory(e.target.value);
                          }}
                          placeholder={locale === 'en' ? 'Type custom category (e.g. Usul al-Fiqh)' : 'ক্যাটাগরি লিখুন (যেমন: উসুলুল ফিকহ, ইসলামী অর্থনীতি)'}
                          className="w-full text-xs bg-emerald-50/60 text-slate-950 border border-emerald-300 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-emerald-700 focus:bg-white outline-none font-semibold transition-all placeholder:text-slate-400"
                          autoFocus
                        />
                        <span className="text-[10px] text-emerald-700 mt-1 block">
                          {locale === 'en' ? '✓ Custom category will be saved and added to filters' : '✓ নতুন ক্যাটাগরি স্বয়ংক্রিয়ভাবে ফিল্টার লিস্টে যুক্ত হবে'}
                        </span>
                      </div>
                    ) : (
                      <select 
                        value={formCategory}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setIsCustomCategory(true);
                            setCustomCategoryInput('');
                            setFormCategory('');
                          } else {
                            setFormCategory(e.target.value);
                          }
                        }}
                        className="w-full text-xs bg-slate-50 text-slate-950 border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-emerald-700 focus:bg-white outline-none font-semibold transition-all cursor-pointer"
                      >
                        <optgroup label={locale === 'en' ? 'Existing Categories' : 'বিদ্যমান ক্যাটাগরি'}>
                          {allExistingCategories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </optgroup>
                        <option value="__custom__" className="text-emerald-700 font-bold">
                          {locale === 'en' ? '✏️ + Type New / Custom Category...' : '✏️ + ড্রপডাউনের বাইরে নতুন ক্যাটাগরি লিখুন...'}
                        </option>
                      </select>
                    )}
                  </div>

                  {/* Type */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {locale === 'en' ? 'Format Type' : 'ফরম্যাট'}
                    </label>
                    <select 
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full text-xs bg-slate-50 text-slate-950 border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-emerald-700 focus:bg-white outline-none font-semibold transition-all cursor-pointer"
                    >
                      <option value="PDF">PDF</option>
                      <option value="E-Book">E-Book</option>
                      <option value="Document">Document</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* File Size */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {locale === 'en' ? 'Size (e.g. 2.4 MB)' : 'সাইজ (যেমন: ২.৪ মেগাবাইট)'}
                    </label>
                    <input 
                      type="text" 
                      value={formSize}
                      onChange={(e) => setFormSize(e.target.value)}
                      placeholder="e.g. 2.4 MB"
                      className="w-full text-xs bg-slate-50 text-slate-950 border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-emerald-700 focus:bg-white outline-none font-medium transition-all"
                    />
                  </div>

                  {/* Language */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      {locale === 'en' ? 'Language' : 'ভাষা'}
                    </label>
                    <input 
                      type="text" 
                      value={formLanguage}
                      onChange={(e) => setFormLanguage(e.target.value)}
                      placeholder="e.g. Arabic/English"
                      className="w-full text-xs bg-slate-50 text-slate-950 border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-emerald-700 focus:bg-white outline-none font-medium transition-all"
                    />
                  </div>
                </div>

                {/* Cloud Drive URL */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {locale === 'en' ? 'Google Drive / Archive URL' : 'গুগল ড্রাইভ বা আর্কাইভ লিঙ্ক'}
                  </label>
                  <input 
                    type="url" 
                    value={formDriveUrl}
                    onChange={(e) => setFormDriveUrl(e.target.value)}
                    placeholder="https://archive.org/details/..."
                    className="w-full text-xs bg-slate-50 text-slate-950 border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-emerald-700 focus:bg-white outline-none font-medium transition-all"
                  />
                </div>

                {/* Direct Download URL */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {locale === 'en' ? 'Direct Download URL (Optional)' : 'সরাসরি ডাউনলোড লিঙ্ক (ঐচ্ছিক)'}
                  </label>
                  <input 
                    type="url" 
                    value={formDownloadUrl}
                    onChange={(e) => setFormDownloadUrl(e.target.value)}
                    placeholder="https://example.com/download.pdf"
                    className="w-full text-xs bg-slate-50 text-slate-950 border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-emerald-700 focus:bg-white outline-none font-medium transition-all"
                  />
                </div>

              </div>

              {/* Form Actions Footer */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  {locale === 'en' ? 'Cancel' : 'বাতিল'}
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-[#064e3b] text-white rounded-xl text-xs font-bold hover:bg-emerald-950 transition-colors flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  {locale === 'en' ? 'Publish / Save' : 'রিসোর্স প্রকাশ করুন'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
