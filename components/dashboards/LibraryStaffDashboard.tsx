'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  Book, BookOpen, Clock, AlertTriangle, Users, Search, Plus, 
  Check, X, Trash2, Edit2, RotateCcw, Filter, FileText, CheckCircle2, Bookmark 
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { 
  collection, query, getDocs, addDoc, doc, updateDoc, 
  deleteDoc, setDoc, writeBatch, orderBy, where 
} from 'firebase/firestore';

import { useSearchParams } from 'next/navigation';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function LibraryStaffDashboard() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const paramTab = searchParams?.get('tab');
  
  // Dashboard states
  const [localTab, setLocalTab] = useState<'books' | 'loans'>('books');
  const activeTab = (paramTab as any) || localTab;
  const setActiveTab = (tab: any) => setLocalTab(tab);
  const [books, setBooks] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Filters & Search
  const [bookSearch, setBookSearch] = useState('');
  const [bookCategory, setBookCategory] = useState('All');
  const [loanSearch, setLoanSearch] = useState('');
  const [loanStatusFilter, setLoanStatusFilter] = useState('All');

  // Book Form states (Create / Edit)
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookCategoryForm, setBookCategoryForm] = useState('Tafseer & Quranic Sciences');
  const [bookLanguage, setBookLanguage] = useState('Arabic');
  const [bookIsbn, setBookIsbn] = useState('');
  const [bookLocation, setBookLocation] = useState('Rack A-1');
  const [bookTotalStock, setBookTotalStock] = useState('5');

  // Deletion and Confirmation Modal states
  const [bookToDelete, setBookToDelete] = useState<any | null>(null);
  const [loanToReject, setLoanToReject] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Firestore Error Handler helper
  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: user?.uid,
        email: user?.email,
      },
      operationType,
      path
    };
    console.error('Library Firestore Error details:', JSON.stringify(errInfo));
    alert(`Library operation failed: ${errInfo.error}`);
  };

  // Fetch initial books & loans
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch books
      const booksSnap = await getDocs(collection(db, 'library_books'));
      const booksList = booksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBooks(booksList);

      // Fetch loans
      const loansSnap = await getDocs(collection(db, 'book_loans'));
      const loansList = loansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLoans(loansList);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'library_collections');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchData();
    };
    load();
  }, []);

  // Seed demo data
  const seedDemoLibraryData = async () => {
    setIsSeeding(true);
    try {
      const demoBooks = [
        {
          title: 'Sahih al-Bukhari (Arabic-English, 9 Vol. Set)',
          author: 'Imam Muhammad al-Bukhari',
          category: 'Hadith Collections',
          language: 'Arabic / English',
          isbn: '978-6035002998',
          location: 'Rack H-1',
          totalStock: 3,
          availableStock: 3
        },
        {
          title: 'Tafsir Ibn Kathir (English translation, 10 Vol. Set)',
          author: 'Hafiz Ibn Kathir',
          category: 'Tafseer & Quranic Sciences',
          language: 'English',
          isbn: '978-1591440208',
          location: 'Rack T-2',
          totalStock: 5,
          availableStock: 5
        },
        {
          title: 'Al-Hidaya (The Guidance: Classical Fiqh Manual)',
          author: 'Burhan al-Din al-Marghinani',
          category: 'Islamic Jurisprudence (Fiqh)',
          language: 'Arabic',
          isbn: '978-0954738013',
          location: 'Rack F-4',
          totalStock: 4,
          availableStock: 3 // 1 will be borrowed in demo
        },
        {
          title: 'Al-Muqaddimah: An Introduction to History',
          author: 'Ibn Khaldun',
          category: 'Islamic History & Seerah',
          language: 'English / Arabic',
          isbn: '978-0691166285',
          location: 'Rack HS-1',
          totalStock: 2,
          availableStock: 2
        },
        {
          title: 'Riyadh as-Salihin (The Meadows of the Righteous)',
          author: 'Imam Yahya ibn Sharaf an-Nawawi',
          category: 'Hadith Collections',
          language: 'Arabic / Bengali',
          isbn: '978-2987483921',
          location: 'Rack H-3',
          totalStock: 6,
          availableStock: 6
        },
        {
          title: 'Arabic Linguistics & Rhetoric (Al-Balagha)',
          author: 'Dr. Abdul Qahir al-Jurjani',
          category: 'Arabic Linguistics',
          language: 'Arabic',
          isbn: '978-4392819381',
          location: 'Rack L-2',
          totalStock: 3,
          availableStock: 2 // 1 pending in demo
        }
      ];

      const batch = writeBatch(db);

      // Save books
      const savedBookIds: string[] = [];
      for (const b of demoBooks) {
        // Simple predictable IDs based on title slug
        const bId = b.title.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20);
        const bookRef = doc(db, 'library_books', bId);
        batch.set(bookRef, b);
        savedBookIds.push(bId);
      }

      // Seed a couple of demo loans
      const demoLoans = [
        {
          bookId: 'al_hidaya__the_guidan',
          bookTitle: 'Al-Hidaya (The Guidance: Classical Fiqh Manual)',
          bookAuthor: 'Burhan al-Din al-Marghinani',
          userId: 'student_ahmad',
          userEmail: 'ahmad@asdri.edu',
          userName: 'Ahmad Al-Faruq',
          userRole: 'student',
          requestDate: new Date().toISOString(),
          borrowDate: new Date().toISOString().split('T')[0],
          returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'approved',
          approvedAt: new Date().toISOString()
        },
        {
          bookId: 'arabic_linguistics___',
          bookTitle: 'Arabic Linguistics & Rhetoric (Al-Balagha)',
          bookAuthor: 'Dr. Abdul Qahir al-Jurjani',
          userId: 'student_fatima',
          userEmail: 'fatima@asdri.edu',
          userName: 'Fatima Al-Zahra',
          userRole: 'student',
          requestDate: new Date().toISOString(),
          borrowDate: new Date().toISOString().split('T')[0],
          returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending'
        }
      ];

      for (const ln of demoLoans) {
        const loanId = `${ln.bookId}_${ln.userId}`;
        const loanRef = doc(db, 'book_loans', loanId);
        batch.set(loanRef, ln);
      }

      await batch.commit();
      alert('Seeded library catalog with 6 authentic books and 2 sample loan requests/active checkouts!');
      await fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'library_demo_seeding');
    } finally {
      setIsSeeding(false);
    }
  };

  // Create or Update Book
  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle || !bookAuthor || !bookTotalStock) return;

    try {
      const stockNum = Number(bookTotalStock);
      
      if (editingBookId) {
        // Editing existing book
        const bookRef = doc(db, 'library_books', editingBookId);
        const oldBook = books.find(b => b.id === editingBookId);
        const diffStock = stockNum - (oldBook?.totalStock || 0);
        const newAvailable = Math.max(0, (oldBook?.availableStock || 0) + diffStock);

        await updateDoc(bookRef, {
          title: bookTitle,
          author: bookAuthor,
          category: bookCategoryForm,
          language: bookLanguage,
          isbn: bookIsbn,
          location: bookLocation,
          totalStock: stockNum,
          availableStock: newAvailable
        });
        alert('Book stock updated successfully!');
      } else {
        // Adding new book
        const bId = bookTitle.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20) + '_' + Date.now().toString().slice(-4);
        const bookRef = doc(db, 'library_books', bId);
        await setDoc(bookRef, {
          title: bookTitle,
          author: bookAuthor,
          category: bookCategoryForm,
          language: bookLanguage,
          isbn: bookIsbn,
          location: bookLocation,
          totalStock: stockNum,
          availableStock: stockNum
        });
        alert('New book added to digital library catalog!');
      }

      // Reset form
      setBookTitle('');
      setBookAuthor('');
      setBookIsbn('');
      setBookLocation('Rack A-1');
      setBookTotalStock('5');
      setShowBookForm(false);
      setEditingBookId(null);
      await fetchData();
    } catch (error) {
      handleFirestoreError(error, editingBookId ? OperationType.UPDATE : OperationType.CREATE, `library_books/${editingBookId || 'new'}`);
    }
  };

  // Edit book trigger
  const handleEditBookClick = (book: any) => {
    setEditingBookId(book.id);
    setBookTitle(book.title);
    setBookAuthor(book.author);
    setBookCategoryForm(book.category);
    setBookLanguage(book.language);
    setBookIsbn(book.isbn || '');
    setBookLocation(book.location || 'Rack A-1');
    setBookTotalStock(book.totalStock.toString());
    setShowBookForm(true);
  };

  // Confirm Delete Book
  const confirmDeleteBook = async () => {
    if (!bookToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'library_books', bookToDelete.id));
      setBooks(prev => prev.filter(b => b.id !== bookToDelete.id));
      alert(`"${bookToDelete.title}" বই সফলভাবে ক্যাটালগ থেকে মুছে ফেলা হয়েছে।`);
      setBookToDelete(null);
      await fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `library_books/${bookToDelete.id}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Confirm Reject Loan Request
  const confirmRejectLoan = async () => {
    if (!loanToReject) return;
    try {
      await updateDoc(doc(db, 'book_loans', loanToReject.id), {
        status: 'rejected'
      });
      alert('আবেদনটি প্রত্যাখ্যান করা হয়েছে।');
      setLoanToReject(null);
      await fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `book_loans/${loanToReject.id}`);
    }
  };

  // Approve Loan Request
  const handleApproveLoan = async (loan: any) => {
    try {
      // Find the book and verify availableStock
      const bookRef = doc(db, 'library_books', loan.bookId);
      const bookSnap = await getDocs(query(collection(db, 'library_books')));
      const matchedBookDoc = bookSnap.docs.find(d => d.id === loan.bookId);
      
      if (!matchedBookDoc) {
        alert('Book not found in database catalog!');
        return;
      }
      
      const bookData = matchedBookDoc.data();
      if (bookData.availableStock <= 0) {
        alert('Out of stock! Cannot approve this borrow request.');
        return;
      }

      // Update book stock
      await updateDoc(bookRef, {
        availableStock: bookData.availableStock - 1
      });

      // Update loan status
      const loanRef = doc(db, 'book_loans', loan.id);
      await updateDoc(loanRef, {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        borrowDate: new Date().toISOString().split('T')[0]
      });

      alert(`Borrow request approved for ${loan.userName}!`);
      await fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `book_loans/${loan.id}`);
    }
  };


  // Mark Book as Returned
  const handleReturnBook = async (loan: any) => {
    try {
      const bookRef = doc(db, 'library_books', loan.bookId);
      const bookSnap = await getDocs(query(collection(db, 'library_books')));
      const matchedBookDoc = bookSnap.docs.find(d => d.id === loan.bookId);
      
      if (matchedBookDoc) {
        const bookData = matchedBookDoc.data();
        await updateDoc(bookRef, {
          availableStock: Math.min(bookData.totalStock, bookData.availableStock + 1)
        });
      }

      // Update loan status
      await updateDoc(doc(db, 'book_loans', loan.id), {
        status: 'returned',
        returnedAt: new Date().toISOString()
      });

      alert(`Book successfully marked as returned from ${loan.userName}!`);
      await fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `book_loans/${loan.id}`);
    }
  };

  // Mark Book as Overdue
  const handleMarkOverdue = async (loanId: string) => {
    try {
      await updateDoc(doc(db, 'book_loans', loanId), {
        status: 'overdue'
      });
      await fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `book_loans/${loanId}`);
    }
  };

  // Filter books
  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(bookSearch.toLowerCase()) || 
                          b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
                          (b.isbn && b.isbn.includes(bookSearch));
    const matchesCat = bookCategory === 'All' || b.category === bookCategory;
    return matchesSearch && matchesCat;
  });

  // Filter loans
  const filteredLoans = loans.filter(l => {
    const matchesSearch = l.bookTitle.toLowerCase().includes(loanSearch.toLowerCase()) || 
                          l.userName.toLowerCase().includes(loanSearch.toLowerCase()) ||
                          l.userEmail.toLowerCase().includes(loanSearch.toLowerCase());
    const matchesStatus = loanStatusFilter === 'All' || l.status === loanStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // General counts & stats
  const totalBooksCount = books.length;
  const totalStockSum = books.reduce((acc, b) => acc + (b.totalStock || 0), 0);
  const activeLoansCount = loans.filter(l => l.status === 'approved').length;
  const pendingLoansCount = loans.filter(l => l.status === 'pending').length;
  const overdueCount = loans.filter(l => l.status === 'overdue').length;

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs font-bold text-slate-500">Library Portal</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Firebase Secure Connected
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
              Library Staff Dashboard Overview
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button 
              onClick={() => setActiveTab('books')}
              className="px-4 py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-white text-xs font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Book
            </button>
            <button 
              onClick={() => setActiveTab('loans')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Circulation & Loans
            </button>
          </div>
        </div>
      </div>

      {/* Demo Seeding Utility */}
      {totalBooksCount === 0 && !isLoading && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-[#064e3b] text-sm flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-emerald-700" />
              Catalog Auto-Initializer (Database Empty)
            </h4>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Populate the library catalog with standard Islamic classical collections such as Sahih Bukhari, Tafsir Ibn Kathir, and more.
            </p>
          </div>
          <button 
            onClick={seedDemoLibraryData}
            disabled={isSeeding}
            className="px-4 py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-white text-xs font-bold rounded-2xl shrink-0 transition-colors disabled:opacity-50"
          >
            {isSeeding ? 'Initializing...' : 'Seed Islamic Catalog'}
          </button>
        </div>
      )}

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <Book className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Total Catalog Books</p>
            <h3 className="text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
              {isLoading ? '...' : totalBooksCount}
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('books')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-700 transition-colors mt-6 pt-3 border-t border-slate-50 text-left"
          >
            <span>Book Catalog List →</span>
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Pending Requests</p>
            <h3 className="text-3xl font-extrabold text-amber-700 font-serif tracking-tight">
              {isLoading ? '...' : pendingLoansCount}
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('loans')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-700 transition-colors mt-6 pt-3 border-t border-slate-50 text-left"
          >
            <span>Approve Book Loans →</span>
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Currently Borrowed</p>
            <h3 className="text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
              {isLoading ? '...' : activeLoansCount}
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('loans')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-700 transition-colors mt-6 pt-3 border-t border-slate-50 text-left"
          >
            <span>Circulation Records →</span>
          </button>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Overdue Returns</p>
            <h3 className="text-3xl font-extrabold text-amber-700 font-serif tracking-tight">
              {isLoading ? '...' : overdueCount}
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('loans')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-700 transition-colors mt-6 pt-3 border-t border-slate-50 text-left"
          >
            <span>Send Return Reminders →</span>
          </button>
        </div>

      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064e3b]"></div>
        </div>
      ) : (
        <div className="space-y-6">

          {/* BOOK CATALOG WORKFLOW */}
          {activeTab === 'books' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left & Middle Column: Books Grid/Table */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
                  
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={bookSearch}
                        onChange={(e) => setBookSearch(e.target.value)}
                        placeholder="Search books by title, author, or ISBN..."
                        className="w-full pl-9 pr-4 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 placeholder:text-slate-400 font-medium"
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Filter className="w-4 h-4 text-slate-400" />
                      <select 
                        value={bookCategory}
                        onChange={(e) => setBookCategory(e.target.value)}
                        className="text-xs bg-white text-slate-900 border border-slate-300 font-semibold rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      >
                        <option value="All">All Categories</option>
                        <option value="Tafseer & Quranic Sciences">Tafseer & Quranic Sciences</option>
                        <option value="Hadith Collections">Hadith Collections</option>
                        <option value="Islamic Jurisprudence (Fiqh)">Islamic Jurisprudence (Fiqh)</option>
                        <option value="Islamic History & Seerah">Islamic History & Seerah</option>
                        <option value="Arabic Linguistics">Arabic Linguistics</option>
                        <option value="Academic Research Papers">Academic Research Papers</option>
                      </select>
                    </div>
                  </div>

                  {/* Books list */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-3">Title & Author</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Stock Details</th>
                          <th className="p-3">Shelf Loc</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBooks.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-slate-400">No matching library books found.</td>
                          </tr>
                        ) : (
                          filteredBooks.map(book => (
                            <tr key={book.id} className="hover:bg-slate-50">
                              <td className="p-3">
                                <p className="font-bold text-slate-900 leading-snug">{book.title}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">{book.author} • <span className="text-slate-400">{book.language}</span></p>
                              </td>
                              <td className="p-3">
                                <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                                  {book.category}
                                </span>
                              </td>
                              <td className="p-3">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-slate-800">{book.availableStock} available</span>
                                  <span className="text-[10px] text-slate-400 block">out of {book.totalStock} total</span>
                                </div>
                              </td>
                              <td className="p-3 font-semibold text-amber-700 text-[11px]">
                                {book.location || 'Rack A-1'}
                              </td>
                              <td className="p-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1">
                                  <button 
                                    onClick={() => handleEditBookClick(book)}
                                    className="p-1.5 bg-slate-50 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                                    title="Edit Book stock"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => setBookToDelete(book)}
                                    className="p-1.5 bg-slate-50 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                    title="Delete Book"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
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

              {/* Right Column: Add/Edit Book Form */}
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-fit space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-serif">
                    {editingBookId ? 'Edit Scholarly Book' : 'Add Book to Catalog'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingBookId ? 'Modify book particulars and count details below.' : 'Introduce a new print or manuscript to ASDRI library databases.'}
                  </p>
                </div>

                <form onSubmit={handleSaveBook} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Book Title *</label>
                    <input 
                      type="text" 
                      required 
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      placeholder="e.g. Mukhtasar al-Quduri"
                      className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-700 focus:outline-none placeholder:text-slate-400 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Author Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={bookAuthor}
                      onChange={(e) => setBookAuthor(e.target.value)}
                      placeholder="e.g. Imam Abu al-Husayn al-Quduri"
                      className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-700 focus:outline-none placeholder:text-slate-400 font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Category Subject</label>
                    <select 
                      value={bookCategoryForm}
                      onChange={(e) => setBookCategoryForm(e.target.value)}
                      className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-700 focus:outline-none font-medium"
                    >
                      <option value="Tafseer & Quranic Sciences">Tafseer & Quranic Sciences</option>
                      <option value="Hadith Collections">Hadith Collections</option>
                      <option value="Islamic Jurisprudence (Fiqh)">Islamic Jurisprudence (Fiqh)</option>
                      <option value="Islamic History & Seerah">Islamic History & Seerah</option>
                      <option value="Arabic Linguistics">Arabic Linguistics</option>
                      <option value="Academic Research Papers">Academic Research Papers</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">Language</label>
                      <input 
                        type="text" 
                        value={bookLanguage}
                        onChange={(e) => setBookLanguage(e.target.value)}
                        placeholder="e.g. Arabic"
                        className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-700 focus:outline-none placeholder:text-slate-400 font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">Shelf Location</label>
                      <input 
                        type="text" 
                        value={bookLocation}
                        onChange={(e) => setBookLocation(e.target.value)}
                        placeholder="e.g. Rack B-3"
                        className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-700 focus:outline-none placeholder:text-slate-400 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">ISBN Code (Optional)</label>
                      <input 
                        type="text" 
                        value={bookIsbn}
                        onChange={(e) => setBookIsbn(e.target.value)}
                        placeholder="ISBN code"
                        className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-700 focus:outline-none placeholder:text-slate-400 font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">Total Copies *</label>
                      <input 
                        type="number" 
                        required 
                        min="1"
                        value={bookTotalStock}
                        onChange={(e) => setBookTotalStock(e.target.value)}
                        placeholder="5"
                        className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-700 focus:outline-none placeholder:text-slate-400 font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
                    {editingBookId && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingBookId(null);
                          setBookTitle('');
                          setBookAuthor('');
                          setBookIsbn('');
                          setBookLocation('Rack A-1');
                          setBookTotalStock('5');
                        }}
                        className="flex-1 py-2 border border-slate-200 text-slate-500 rounded text-xs font-bold hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      type="submit" 
                      className="flex-1 py-2 bg-[#064e3b] hover:bg-emerald-800 text-white rounded text-xs font-bold transition-colors"
                    >
                      {editingBookId ? 'Save Changes' : 'Publish Book'}
                    </button>
                  </div>
                </form>
              </div>

            </div>
          )}

          {/* CIRCULATION & LOAN WORKFLOW */}
          {activeTab === 'loans' && (
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Circulation Activity & Borrow Tracking</h3>
                  <p className="text-xs text-slate-500">View and manage book loan submissions, approvals, returns, and overdue dates.</p>
                </div>
                
                {/* Search / Filter bar */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={loanSearch}
                    onChange={(e) => setLoanSearch(e.target.value)}
                    placeholder="Search by student or book..."
                    className="text-xs bg-white text-slate-900 border border-slate-300 rounded-lg px-3 py-2 w-48 focus:outline-none focus:ring-1 focus:ring-emerald-700 placeholder:text-slate-400 font-medium"
                  />
                  <select 
                    value={loanStatusFilter}
                    onChange={(e) => setLoanStatusFilter(e.target.value)}
                    className="text-xs bg-white text-slate-900 border border-slate-300 rounded-lg px-2.5 py-2 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="All">All Requests</option>
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Active Loans</option>
                    <option value="returned">Returned</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              {/* Loans list */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-3">Requested Book</th>
                      <th className="p-3">Borrower Particulars</th>
                      <th className="p-3">Planned Borrow Timeline</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Circulation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLoans.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400">No circulation logs recorded yet.</td>
                      </tr>
                    ) : (
                      filteredLoans.map(loan => {
                        const isOverdue = loan.status === 'approved' && new Date(loan.returnDate) < new Date();
                        
                        return (
                          <tr key={loan.id} className="hover:bg-slate-50">
                            <td className="p-3">
                              <p className="font-bold text-slate-900">{loan.bookTitle}</p>
                              <p className="text-[10px] text-slate-500">{loan.bookAuthor}</p>
                            </td>
                            <td className="p-3">
                              <p className="font-semibold text-slate-900">{loan.userName}</p>
                              <p className="text-[10px] text-slate-400 capitalize">{loan.userRole} • {loan.userEmail}</p>
                            </td>
                            <td className="p-3">
                              <div className="space-y-0.5 text-slate-700">
                                <p className="text-[11px] font-medium">Borrow: <span className="font-bold">{loan.borrowDate || 'N/A'}</span></p>
                                <p className="text-[11px] font-medium">Expected Return: <span className="font-bold text-amber-700">{loan.returnDate || 'N/A'}</span></p>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                                loan.status === 'approved' ? isOverdue ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                                  : loan.status === 'pending' ? 'bg-amber-100 text-amber-800'
                                  : loan.status === 'returned' ? 'bg-slate-100 text-slate-600'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {loan.status === 'approved' && isOverdue ? 'overdue' : loan.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {loan.status === 'pending' && (
                                  <>
                                    <button 
                                      onClick={() => handleApproveLoan(loan)}
                                      className="px-2.5 py-1 bg-[#064e3b] text-white font-bold text-[10px] rounded hover:bg-emerald-800 flex items-center gap-0.5"
                                    >
                                      <Check className="w-3 h-3" /> Approve
                                    </button>
                                    <button 
                                      onClick={() => setLoanToReject(loan)}
                                      className="px-2 py-1 border border-slate-200 text-slate-500 text-[10px] rounded hover:bg-slate-100"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {loan.status === 'approved' && (
                                  <>
                                    <button 
                                      onClick={() => handleReturnBook(loan)}
                                      className="px-2.5 py-1 bg-blue-600 text-white font-bold text-[10px] rounded hover:bg-blue-700 flex items-center gap-0.5"
                                    >
                                      <RotateCcw className="w-3 h-3" /> Mark Returned
                                    </button>
                                    {!isOverdue && (
                                      <button 
                                        onClick={() => handleMarkOverdue(loan.id)}
                                        className="px-2 py-1 text-red-600 hover:bg-red-50 text-[10px] rounded"
                                      >
                                        Mark Overdue
                                      </button>
                                    )}
                                  </>
                                )}
                                {loan.status === 'returned' && (
                                  <span className="text-[10px] text-slate-400 italic">Circulation complete</span>
                                )}
                                {loan.status === 'rejected' && (
                                  <span className="text-[10px] text-red-400 italic">Request rejected</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Delete Book Confirmation Modal */}
      {bookToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-50 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 font-serif">বই মুছে ফেলার নিশ্চিতকরণ</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              আপনি কি নিশ্চিত যে আপনি <strong className="text-slate-900">"{bookToDelete.title}"</strong> ক্যাটালগ থেকে মুছে ফেলতে চান? এই প্রক্রিয়াটি স্থায়ী এবং আর ফিরিয়ে আনা যাবে না।
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBookToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="button"
                onClick={confirmDeleteBook}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? 'মুছে ফেলা হচ্ছে...' : 'হ্যাঁ, ডিলেট করুন (Delete)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Loan Confirmation Modal */}
      {loanToReject && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2 bg-amber-50 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 font-serif">বই ইস্যু আবেদন প্রত্যাখ্যান</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              আপনি কি নিশ্চিত যে <strong className="text-slate-900">{loanToReject.userName}</strong> এর <strong className="text-slate-900">"{loanToReject.bookTitle}"</strong> কিতাবটি নেওয়ার আবেদনটি প্রত্যাখ্যান করতে চান?
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLoanToReject(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                বাতিল (Cancel)
              </button>
              <button
                type="button"
                onClick={confirmRejectLoan}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                প্রত্যাখ্যান করুন (Reject)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
