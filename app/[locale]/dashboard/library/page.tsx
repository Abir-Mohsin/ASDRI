'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Book, Search, Filter, Download, Eye, BookmarkPlus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function LibraryPage() {
  const { role } = useAuthStore();
  const params = useParams();
  const locale = params?.locale as string;
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Aqeedah', 'Fiqh', 'Hadith', 'Tafseer', 'Seerah', 'Research Papers'];

  // Mock data for library
  const resources = [
    {
      id: 'book1',
      title: 'Al-Aqeedah Al-Tahawiyyah',
      author: 'Imam Abu Jafar al-Tahawi',
      category: 'Aqeedah',
      type: 'PDF',
      size: '2.4 MB',
      reads: 1240,
      language: 'Arabic/English',
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
    }
  ];

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Digital Library</h2>
          <p className="text-slate-500 text-sm mt-1">
            Access authentic Islamic books, research papers, and course materials.
          </p>
        </div>
        <div className="flex gap-2">
          {(role === 'admin' || role === 'super_admin' || role === 'library_staff') && (
            <button className="px-4 py-2 bg-[#064e3b] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-emerald-900 transition-colors">
              + Upload Resource
            </button>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search books, authors, or topics..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#064e3b] outline-none text-sm transition-all"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-semibold whitespace-nowrap">
            <Filter className="w-4 h-4" /> Advanced Filter
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
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Title & Author</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold hidden md:table-cell">Format</th>
                <th className="px-6 py-4 font-semibold hidden lg:table-cell">Reads</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No resources found matching your search.
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
                      <span className="text-xs font-medium text-slate-500">{resource.reads.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Bookmark">
                          <BookmarkPlus className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Read Online">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
