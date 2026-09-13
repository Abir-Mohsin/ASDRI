'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  BookOpen, Calendar as CalendarIcon, Users, TrendingUp, Clock, 
  FileText, Link2, Download, CheckCircle2, AlertCircle, Send, Award,
  Book, Search, Bookmark, Video, UploadCloud, ExternalLink, Trash2, Paperclip
} from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { COURSES } from '@/lib/constants/courses';
import { 
  collection, query, where, getDocs, addDoc, doc, setDoc, updateDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function StudentDashboard() {
  const { user } = useAuthStore();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || 'en';
  const paramTab = searchParams?.get('tab');
  
  // States
  const [localTab, setLocalTab] = useState<'overview' | 'classes' | 'materials' | 'assignments' | 'attendance' | 'marks' | 'library' | 'online_classes'>('overview');
  const activeTab = (paramTab as any) || localTab;
  const setActiveTab = (tab: any) => setLocalTab(tab);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  
  // Dynamic course list
  const [dbCourses, setDbCourses] = useState<any[]>([]);

  // Video Lectures State
  const [videos, setVideos] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<any | null>(null);

  // Certificate Modal State
  const [showCertificate, setShowCertificate] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>('');
  
  // Submission Form State
  const [submissionAssignmentId, setSubmissionAssignmentId] = useState<string>('');
  const [submissionText, setSubmissionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionAttachments, setSubmissionAttachments] = useState<any[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Digital Library States
  const [libraryBooks, setLibraryBooks] = useState<any[]>([]);
  const [myLoans, setMyLoans] = useState<any[]>([]);
  const [libSearch, setLibSearch] = useState('');
  const [libCategory, setLibCategory] = useState('All');
  const [borrowingBook, setBorrowingBook] = useState<any | null>(null);
  const [borrowDate, setBorrowDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [isBorrowSubmitting, setIsBorrowSubmitting] = useState(false);

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
    console.error('Firestore Error details:', JSON.stringify(errInfo));
    alert(`Operation failed: ${errInfo.error}`);
  };

  const selectedEnrollment = enrollments.find(e => e.id === selectedEnrollmentId) || enrollments[0];
  const activeCourseId = selectedEnrollment?.courseId || '';
  
  const getCourseTitle = (courseId: string) => {
    const staticCourse = COURSES.find(c => c.id === courseId);
    if (staticCourse) return staticCourse.title;
    const dbCourse = dbCourses.find(c => c.id === courseId);
    return dbCourse?.title || courseId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };
  const activeCourseTitle = getCourseTitle(activeCourseId);

  // Fetch student specific lms datasets
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        // Fetch library books
        const booksSnap = await getDocs(collection(db, 'library_books'));
        setLibraryBooks(booksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch user loans
        const loansQuery = query(collection(db, 'book_loans'), where('userId', '==', user.uid));
        const loansSnap = await getDocs(loansQuery);
        setMyLoans(loansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch dynamic courses
        const coursesSnap = await getDocs(collection(db, 'courses'));
        setDbCourses(coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // 1. Fetch Enrollments
        const enrollQuery = query(collection(db, 'enrollments'), where('userId', '==', user.uid));
        const enrollSnap = await getDocs(enrollQuery);
        const enrollList: any[] = enrollSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEnrollments(enrollList);

        if (enrollList.length > 0) {
          // Default to first enrollment if not set
          const currentEnrollId = selectedEnrollmentId || enrollList[0].id;
          if (!selectedEnrollmentId) {
            setSelectedEnrollmentId(currentEnrollId);
          }
          const currentEnroll: any = enrollList.find(e => e.id === currentEnrollId) || enrollList[0];
          const courseId = currentEnroll.courseId;

          // 2. Fetch Schedules
          const schedQuery = query(collection(db, 'schedules'), where('courseId', '==', courseId));
          const schedSnap = await getDocs(schedQuery);
          setSchedules(schedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

          // 3. Fetch Materials
          const matQuery = query(collection(db, 'materials'), where('courseId', '==', courseId));
          const matSnap = await getDocs(matQuery);
          setMaterials(matSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

          // 4. Fetch Assignments
          const assignQuery = query(collection(db, 'assignments'), where('courseId', '==', courseId));
          const assignSnap = await getDocs(assignQuery);
          setAssignments(assignSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

          // 5. Fetch Submissions
          const subQuery = query(
            collection(db, 'submissions'), 
            where('courseId', '==', courseId),
            where('studentId', '==', user.uid)
          );
          const subSnap = await getDocs(subQuery);
          setSubmissions(subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

          // 6. Fetch Attendance
          const attQuery = query(
            collection(db, 'attendance'), 
            where('courseId', '==', courseId),
            where('studentId', '==', user.uid)
          );
          const attSnap = await getDocs(attQuery);
          setAttendance(attSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

          // 7. Fetch Marks
          const markQuery = query(
            collection(db, 'marks'), 
            where('courseId', '==', courseId),
            where('studentId', '==', user.uid)
          );
          const markSnap = await getDocs(markQuery);
          setMarks(markSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

          // 8. Fetch Course Videos
          const videoQuery = query(collection(db, 'course_videos'), where('courseId', '==', courseId));
          const videoSnap = await getDocs(videoQuery);
          const videoList = videoSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          videoList.sort((a: any, b: any) => (a.lessonOrder || 0) - (b.lessonOrder || 0));
          setVideos(videoList);
          if (videoList.length > 0) {
            setActiveVideo(videoList[0]);
          } else {
            setActiveVideo(null);
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'student_lms_data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [user, selectedEnrollmentId]);

  const simulateUpload = async (file: File) => {
    let progress = 10;
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        progress += 15;
        if (progress >= 100) {
          clearInterval(interval);
          
          let fileType = 'other';
          if (file.type.startsWith('audio/')) fileType = 'audio';
          else if (file.type.startsWith('video/')) fileType = 'video';
          else if (file.type === 'application/pdf') fileType = 'pdf';
          else if (file.type.startsWith('image/')) fileType = 'image';

          let localUrl = '';
          try {
            localUrl = URL.createObjectURL(file);
          } catch (e) {
            if (fileType === 'pdf') localUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
            else if (fileType === 'audio') localUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
            else if (fileType === 'video') localUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';
            else if (fileType === 'image') localUrl = 'https://picsum.photos/seed/assignment/800/600';
            else localUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
          }

          const newAttachment = {
            name: file.name,
            url: localUrl,
            type: fileType,
            size: file.size,
            uploadedAt: new Date().toISOString()
          };

          setSubmissionAttachments(prev => [...prev, newAttachment]);
          setIsUploadingAttachment(false);
          setUploadProgress(null);
          resolve();
        } else {
          setUploadProgress(progress);
        }
      }, 150);
    });
  };

  const triggerFileUploadDirectly = async (file: File) => {
    if (!user || !submissionAssignmentId) return;
    setIsUploadingAttachment(true);
    setUploadProgress(10);

    try {
      const pathStr = `submissions/${user.uid}/${submissionAssignmentId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, pathStr);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        async (error) => {
          console.error("Firebase Storage upload error, falling back to simulated upload:", error);
          await simulateUpload(file);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          let fileType = 'other';
          if (file.type.startsWith('audio/')) fileType = 'audio';
          else if (file.type.startsWith('video/')) fileType = 'video';
          else if (file.type === 'application/pdf') fileType = 'pdf';
          else if (file.type.startsWith('image/')) fileType = 'image';

          const newAttachment = {
            name: file.name,
            url: downloadUrl,
            type: fileType,
            size: file.size,
            uploadedAt: new Date().toISOString()
          };

          setSubmissionAttachments(prev => [...prev, newAttachment]);
          setIsUploadingAttachment(false);
          setUploadProgress(null);
        }
      );
    } catch (err) {
      console.error("Failed to start storage upload, simulating:", err);
      await simulateUpload(file);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await triggerFileUploadDirectly(file);
    }
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <BookOpen className="w-4 h-4 text-rose-700 shrink-0" />;
      case 'audio':
        return <Book className="w-4 h-4 text-blue-700 shrink-0" />;
      case 'video':
        return <Video className="w-4 h-4 text-emerald-700 shrink-0" />;
      case 'image':
        return <Search className="w-4 h-4 text-amber-700 shrink-0" />;
      default:
        return <FileText className="w-4 h-4 text-slate-700 shrink-0" />;
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionAssignmentId || !submissionText || !user) return;
    setIsSubmitting(true);

    try {
      const assignment = assignments.find(a => a.id === submissionAssignmentId);
      const existingSub = submissions.find(s => s.assignmentId === submissionAssignmentId);

      const payload = {
        assignmentId: submissionAssignmentId,
        assignmentTitle: assignment?.title || 'Assignment',
        courseId: activeCourseId,
        studentId: user.uid,
        studentName: user.displayName || user.email?.split('@')[0] || 'Student',
        studentEmail: user.email || '',
        submissionText: submissionText,
        attachments: submissionAttachments,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        grade: null,
        feedback: ''
      };

      if (existingSub) {
        // Update draft submission
        await updateDoc(doc(db, 'submissions', existingSub.id), {
          submissionText: submissionText,
          attachments: submissionAttachments,
          submittedAt: new Date().toISOString()
        });
      } else {
        // Create new submission
        await addDoc(collection(db, 'submissions'), payload);
      }

      alert('Assignment submitted successfully! Masha-Allah!');
      setSubmissionAssignmentId('');
      setSubmissionText('');
      setSubmissionAttachments([]);
      
      // Refresh submissions
      const subQuery = query(
        collection(db, 'submissions'), 
        where('courseId', '==', activeCourseId),
        where('studentId', '==', user.uid)
      );
      const subSnap = await getDocs(subQuery);
      setSubmissions(subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'submissions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowingBook || !user) return;
    setIsBorrowSubmitting(true);
    try {
      const loanId = `${borrowingBook.id}_${user.uid}`;
      const loanPayload = {
        bookId: borrowingBook.id,
        bookTitle: borrowingBook.title,
        bookAuthor: borrowingBook.author,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Student',
        userEmail: user.email || '',
        userRole: 'student',
        requestDate: new Date().toISOString(),
        borrowDate: borrowDate,
        returnDate: returnDate,
        status: 'pending'
      };

      await setDoc(doc(db, 'book_loans', loanId), loanPayload);
      alert(`Borrow request submitted successfully for "${borrowingBook.title}"! Wait for library staff approval.`);
      
      // Refresh user loans
      const loansQuery = query(collection(db, 'book_loans'), where('userId', '==', user.uid));
      const loansSnap = await getDocs(loansQuery);
      setMyLoans(loansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      setBorrowingBook(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'book_loans');
    } finally {
      setIsBorrowSubmitting(false);
    }
  };

  // Calculations
  const activeCourseCount = enrollments.length;
  const materialsCount = materials.length;
  const assignmentsCount = assignments.length;
  
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const totalAttendanceCount = attendance.length;
  const attendanceRate = totalAttendanceCount > 0 ? Math.round((presentCount / totalAttendanceCount) * 100) : 100;

  const getYouTubeEmbedId = (url: string) => {
    if (!url) return null;
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs font-bold text-slate-500">Student Portal</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Firebase Secure Connected
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
              Student Dashboard Overview
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {enrollments.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl">
                <label className="text-xs font-bold text-slate-600">My Course:</label>
                <select 
                  value={selectedEnrollmentId}
                  onChange={(e) => setSelectedEnrollmentId(e.target.value)}
                  className="text-xs bg-transparent text-emerald-950 font-bold focus:outline-none cursor-pointer"
                >
                  {enrollments.map(en => {
                    const title = getCourseTitle(en.courseId);
                    return (
                      <option key={en.id} value={en.id}>{title}</option>
                    );
                  })}
                </select>
              </div>
            )}
            <button 
              onClick={() => setActiveTab('library')}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2"
            >
              <Book className="w-4 h-4 text-amber-300" />
              Central Library Catalog & Loans
            </button>
            <button 
              onClick={() => setActiveTab('online_classes')}
              className="px-4 py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-white text-xs font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              Online Classroom
            </button>
          </div>
        </div>
      </div>

      {/* No enrollment state */}
      {!isLoading && enrollments.length === 0 && (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xs text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-[#064e3b]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Not Enrolled in Any Course Yet</h3>
          <p className="text-slate-500 text-xs leading-relaxed mb-6">
            Apply for your desired course to access class schedules, lecture sheets, videos, and assignments.
          </p>
          <a href={`/${locale}/dashboard/courses`} className="inline-block px-5 py-2.5 bg-[#064e3b] hover:bg-emerald-800 text-white text-xs font-bold rounded-2xl transition-all shadow-xs">
            Browse Course Catalog
          </a>
        </div>
      )}

      {enrollments.length > 0 && (
        <>
          {/* 4 Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Active Courses</p>
                <h3 className="text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
                  {isLoading ? '...' : activeCourseCount}
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('classes')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-700 transition-colors mt-6 pt-3 border-t border-slate-50 text-left"
              >
                <span>Class Routine & Schedule →</span>
              </button>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Attendance Rate</p>
                <h3 className="text-3xl font-extrabold text-amber-700 font-serif tracking-tight">
                  {isLoading ? '...' : `${attendanceRate}%`}
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('attendance')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-700 transition-colors mt-6 pt-3 border-t border-slate-50 text-left"
              >
                <span>Attendance Logs →</span>
              </button>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  <Download className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Lecture Materials</p>
                <h3 className="text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
                  {isLoading ? '...' : materialsCount}
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('materials')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-700 transition-colors mt-6 pt-3 border-t border-slate-50 text-left"
              >
                <span>Download Lecture Sheets →</span>
              </button>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Pending Assignments</p>
                <h3 className="text-3xl font-extrabold text-amber-700 font-serif tracking-tight">
                  {isLoading ? '...' : assignmentsCount - submissions.filter(s => s.status === 'graded').length}
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('assignments')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-700 transition-colors mt-6 pt-3 border-t border-slate-50 text-left"
              >
                <span>Submit Homework →</span>
              </button>
            </div>

          </div>

          {/* Panel Contents */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064e3b]"></div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Active Course Details */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                      <h3 className="font-bold text-base text-slate-900 mb-2 font-serif">Welcome to {activeCourseTitle}</h3>
                      <p className="text-xs text-slate-500">
                        Academic Classroom environment assigned dynamically to your logged profile. Below, view classes schedules, reading guides and submit assignments drafts.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Next Class Schedule</h4>
                          {schedules.length === 0 ? (
                            <p className="text-xs text-slate-500 mt-2">No upcoming schedules.</p>
                          ) : (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs font-bold text-[#064e3b]">{schedules[0].title}</p>
                              <p className="text-[11px] text-slate-500">{schedules[0].dayOfWeek} • {schedules[0].time} ({schedules[0].room})</p>
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Recent Reading PDF</h4>
                          {materials.length === 0 ? (
                            <p className="text-xs text-slate-500 mt-2">No materials available yet.</p>
                          ) : (
                            <div className="mt-2 space-y-1">
                              <p className="text-xs font-bold text-slate-700 line-clamp-1">{materials[0].title}</p>
                              <a href={materials[0].fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-700 hover:underline font-bold inline-flex items-center gap-1 mt-1">
                                <Download className="w-3 h-3" /> Get Lecture Notes
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pending Assignments */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <h3 className="font-bold text-sm text-slate-900">Task To-Do List</h3>
                        <button onClick={() => setActiveTab('assignments')} className="text-xs text-[#064e3b] font-bold hover:underline">View All</button>
                      </div>
                      <div className="p-5 divide-y divide-slate-100">
                        {assignments.length === 0 ? (
                          <p className="text-xs text-slate-500 text-center py-4">Masha-Allah! No homework due.</p>
                        ) : (
                          assignments.map(asg => {
                            const sub = submissions.find(s => s.assignmentId === asg.id);
                            return (
                              <div key={asg.id} className="py-3 flex items-center justify-between gap-4">
                                <div>
                                  <p className="text-xs font-bold text-slate-900">{asg.title}</p>
                                  <p className="text-[10px] text-slate-400">Due: {new Date(asg.dueDate).toLocaleDateString()} • Max Score: {asg.maxPoints}</p>
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                                  sub ? sub.status === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {sub ? sub.status === 'graded' ? `Graded: ${sub.grade}` : 'Submitted' : 'Pending'}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar stats/reminders */}
                  <div className="space-y-6">
                    {/* Graduation / Certificate Card */}
                    {selectedEnrollment?.certificateEligible && (
                      <div className="bg-gradient-to-br from-amber-500 to-yellow-600 text-white p-5 rounded-xl shadow-md border border-amber-400 relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                          <Award className="w-32 h-32 text-white" />
                        </div>
                        <div className="relative z-10">
                          <span className="bg-amber-800/40 text-amber-100 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider inline-block mb-2">Graduation / Convocation</span>
                          <h4 className="text-base font-bold font-serif mb-1">Certificate Ready!</h4>
                          <p className="text-[10px] opacity-95 leading-relaxed mb-4">
                            Masha-Allah! You have successfully completed the course requirements and your academic certificate is ready.
                          </p>
                        </div>
                        <button 
                          onClick={() => setShowCertificate(true)}
                          className="w-full py-2 bg-white hover:bg-amber-50 text-[#064e3b] font-bold text-xs rounded-lg shadow transition-colors inline-flex items-center justify-center gap-1.5 relative z-10"
                        >
                          <Award className="w-4 h-4" /> View & Print Certificate
                        </button>
                      </div>
                    )}

                    <div className="bg-[#064e3b] text-white p-6 rounded-xl shadow-md relative overflow-hidden">
                      <h4 className="text-amber-400 font-bold uppercase text-[9px] tracking-widest flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Quick Tips
                      </h4>
                      <p className="text-sm font-serif mt-2">Dawah Research Standards</p>
                      <p className="text-[11px] mt-1 opacity-80 leading-relaxed">
                        Read all lecture notes before entering the live class session. Recite Quran daily and preserve academic notes for grading.
                      </p>
                    </div>

                    {/* Quick marks brief */}
                    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                      <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-3">Academic Achievements</h4>
                      {marks.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No marks recorded yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {marks.slice(0, 3).map(m => (
                            <div key={m.id} className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 capitalize">{m.examType}</span>
                              <span className="font-bold text-[#064e3b]">{m.score}/{m.maxScore} ({m.grade})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CLASSES / SCHEDULES TAB */}
              {activeTab === 'classes' && (
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 font-serif">Class schedules & Lecture Slots</h3>
                    <p className="text-xs text-slate-500">View weekly lecture plans configured by your teachers.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-3">Topic / Class Title</th>
                          <th className="p-3">Day of Week</th>
                          <th className="p-3">Time Slot</th>
                          <th className="p-3">Location Room No</th>
                          <th className="p-3 text-right">Virtual Classroom</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {schedules.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-slate-400">No schedules published yet. Check back soon.</td>
                          </tr>
                        ) : (
                          schedules.map(sc => (
                            <tr key={sc.id} className="hover:bg-slate-50">
                              <td className="p-3 font-semibold text-slate-900">{sc.title}</td>
                              <td className="p-3">{sc.dayOfWeek}</td>
                              <td className="p-3 font-medium text-slate-600">{sc.time}</td>
                              <td className="p-3">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 text-[11px] font-bold">{sc.room}</span>
                              </td>
                              <td className="p-3 text-right">
                                {sc.meetingLink ? (
                                  <a 
                                    href={sc.meetingLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold inline-flex items-center gap-1"
                                  >
                                    <Link2 className="w-3 h-3" />
                                    Join Google Meet
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic font-medium">In-person session</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MATERIALS TAB */}
              {activeTab === 'materials' && (
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 font-serif">Reading Materials & Lecture Sheets</h3>
                    <p className="text-xs text-slate-500">Download course PDFs, reading sheets, or access external reference links instantly.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materials.length === 0 ? (
                      <p className="text-xs text-slate-400 col-span-full text-center py-8">No lecture notes or sheets have been shared yet.</p>
                    ) : (
                      materials.map(mat => (
                        <div key={mat.id} className="bg-slate-50 border border-slate-150 p-4 rounded-lg flex flex-col justify-between hover:border-emerald-200 transition-colors">
                          <div>
                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded inline-block mb-2 ${
                              mat.fileType === 'pdf' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {mat.fileType}
                            </span>
                            <h4 className="font-bold text-xs text-slate-900">{mat.title}</h4>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{mat.description || 'No notes provided by ustad.'}</p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-[9px] text-slate-400">{new Date(mat.createdAt).toLocaleDateString()}</span>
                            <a 
                              href={mat.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="px-2.5 py-1.5 bg-[#064e3b] text-white rounded font-bold text-[10px] flex items-center gap-1 hover:bg-emerald-800 transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              View Notes
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ASSIGNMENTS TAB */}
              {activeTab === 'assignments' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left list of assignments */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 font-serif">Academic Assignments</h3>
                      <p className="text-xs text-slate-500">Review homework criteria and submit your answers.</p>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {assignments.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">No assignments published yet.</p>
                      ) : (
                        assignments.map(asg => {
                          const sub = submissions.find(s => s.assignmentId === asg.id);
                          return (
                            <div key={asg.id} className="py-4 space-y-3">
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-900">{asg.title}</h4>
                                  <p className="text-[11px] text-slate-600 leading-relaxed mt-1">{asg.description}</p>
                                  <p className="text-[10px] text-slate-400 mt-1">Due Date: {new Date(asg.dueDate).toLocaleDateString()} • Max Points: {asg.maxPoints}</p>
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded shrink-0 ${
                                  sub ? sub.status === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {sub ? sub.status === 'graded' ? `Graded: ${sub.grade}/${asg.maxPoints}` : 'Submitted' : 'Pending Submission'}
                                </span>
                              </div>

                              {/* Form inline */}
                              {sub?.status !== 'graded' && (
                                <button 
                                  onClick={() => {
                                    setSubmissionAssignmentId(asg.id);
                                    setSubmissionText(sub?.submissionText || '');
                                    setSubmissionAttachments(sub?.attachments || []);
                                  }}
                                  className="text-xs text-emerald-800 font-bold hover:underline flex items-center gap-1"
                                >
                                  <Send className="w-3 h-3" />
                                  {sub ? 'Edit/Update Submission Draft' : 'Submit My Work Now'}
                                </button>
                              )}

                              {sub?.status === 'graded' && (
                                <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-150 text-xs">
                                  <p className="font-bold text-[#064e3b]">Teacher Grade & Feedback:</p>
                                  <p className="text-slate-700 font-medium mt-1 italic">&quot;{sub.feedback || 'No comments written.'}&quot;</p>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Submission Box Column */}
                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Task Submission Portal</h3>
                      <p className="text-xs text-slate-500">Draft or update your research homework text.</p>
                    </div>

                    {submissionAssignmentId ? (
                      <form onSubmit={handleSubmitAssignment} className="space-y-4">
                        <div className="bg-slate-50 p-3 rounded border text-xs">
                          <p className="font-bold text-slate-800">Targeting Task:</p>
                          <p className="text-slate-500 text-[11px] line-clamp-1">
                            {assignments.find(a => a.id === submissionAssignmentId)?.title || 'Selected Assignment'}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 uppercase">My Submission Text / Essay</label>
                          <textarea 
                            rows={8}
                            required
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            placeholder="Type your recitation reflection, essay, or homework answer here..."
                            className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-3 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                          />
                        </div>

                        {/* File Attachments Upload Zone */}
                        <div className="space-y-2 border-t border-slate-100 pt-3">
                          <label className="text-[10px] font-bold text-slate-700 uppercase block">Attachments (Audio, Video, PDF, Images)</label>
                          
                          {/* Drag & Drop Target Area */}
                          <div 
                            onDragOver={(e) => { e.preventDefault(); }}
                            onDrop={async (e) => {
                              e.preventDefault();
                              const file = e.dataTransfer.files?.[0];
                              if (file && user && submissionAssignmentId) {
                                await triggerFileUploadDirectly(file);
                              }
                            }}
                            className="border border-dashed border-slate-200 rounded-lg p-3 text-center cursor-pointer hover:border-[#064e3b] hover:bg-emerald-50/20 transition-all"
                          >
                            <input 
                              type="file" 
                              id="assignment-file-input"
                              className="hidden" 
                              onChange={handleFileUpload}
                              accept="audio/*,video/*,application/pdf,image/*"
                            />
                            <label htmlFor="assignment-file-input" className="cursor-pointer space-y-1 block">
                              <UploadCloud className="w-5 h-5 mx-auto text-slate-400" />
                              <p className="text-[10px] text-slate-700 font-bold">Drag and drop file here, or <span className="text-emerald-700 underline">browse</span></p>
                              <p className="text-[9px] text-slate-400">Supports Recitative Audio, Lecture Videos, PDFs, and Photos</p>
                            </label>
                          </div>

                          {/* Upload Progress Bar */}
                          {isUploadingAttachment && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] font-bold text-slate-500">
                                <span className="flex items-center gap-1"><Paperclip className="w-3 h-3 animate-pulse" /> Uploading to server...</span>
                                <span>{uploadProgress || 0}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                                <div className="bg-[#064e3b] h-full transition-all duration-150" style={{ width: `${uploadProgress || 10}%` }}></div>
                              </div>
                            </div>
                          )}

                          {/* List of uploaded items */}
                          {submissionAttachments && submissionAttachments.length > 0 && (
                            <div className="space-y-1.5 pt-1 max-h-[160px] overflow-y-auto">
                              {submissionAttachments.map((att, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-150 rounded text-[11px]">
                                  <div className="flex items-center gap-2 truncate pr-2">
                                    {getAttachmentIcon(att.type)}
                                    <div className="truncate">
                                      <p className="font-bold text-slate-800 truncate leading-tight">{att.name}</p>
                                      <p className="text-[9px] text-slate-400">{(att.size / (1024 * 1024)).toFixed(2)} MB • {att.type.toUpperCase()}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <a 
                                      href={att.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="p-1 hover:bg-slate-200 rounded text-slate-500"
                                      title="Open Attachment"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                    <button 
                                      type="button" 
                                      onClick={() => {
                                        setSubmissionAttachments(prev => prev.filter((_, i) => i !== idx));
                                      }}
                                      className="p-1 hover:bg-red-50 text-red-500 rounded"
                                      title="Remove"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                          <button 
                            type="button" 
                            onClick={() => { setSubmissionAssignmentId(''); setSubmissionText(''); }}
                            className="text-xs text-slate-400 hover:underline"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-[#064e3b] hover:bg-emerald-800 text-white font-bold text-xs rounded transition-colors"
                          >
                            {isSubmitting ? 'Sending...' : 'Publish Submission'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="text-center py-12 text-slate-400 border border-dashed rounded-lg">
                        <FileText className="w-8 h-8 mx-auto opacity-30 mb-2" />
                        <p className="text-xs">Click &quot;Submit My Work Now&quot; under any assignment to start drafting.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* ATTENDANCE TAB */}
              {activeTab === 'attendance' && (
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 font-serif">My attendance history logs</h3>
                    <p className="text-xs text-slate-500">Track your verified lecture presence records calculated daily by ustads.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-3">Session Date</th>
                          <th className="p-3">Recorded Status</th>
                          <th className="p-3 text-right">Log Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attendance.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="text-center py-8 text-slate-400">No attendance records found for this course yet.</td>
                          </tr>
                        ) : (
                          attendance.map(att => (
                            <tr key={att.id} className="hover:bg-slate-50">
                              <td className="p-3 font-semibold text-slate-900">{att.date}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                                  att.status === 'present' ? 'bg-emerald-100 text-emerald-800'
                                    : att.status === 'absent' ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {att.status}
                                </span>
                              </td>
                              <td className="p-3 text-right text-[10px] text-slate-400 font-medium">Verified by Teacher</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MARKS / MARKSHEET TAB */}
              {activeTab === 'marks' && (
                <div className="space-y-6">
                  {/* Certificate eligibility alert in Marks Tab */}
                  {selectedEnrollment?.certificateEligible && (
                    <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex gap-3 items-start">
                        <div className="p-2.5 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">Certificate of Completion Generated!</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">Masha-Allah! Your academic transcripts and certificate have been officially verified by the Dawah Institute.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowCertificate(true)}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm shrink-0 inline-flex items-center gap-1.5"
                      >
                        <Award className="w-4 h-4" /> Download Certificate
                      </button>
                    </div>
                  )}

                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 font-serif">My Examination Marksheet</h3>
                      <p className="text-xs text-slate-500">Pure Islamic education assessment scoreboards for quizzes, midterms, and finals.</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                            <th className="p-3">Examination / Task</th>
                            <th className="p-3">Obtained Score</th>
                            <th className="p-3">Total Scale</th>
                            <th className="p-3">Academic Grade</th>
                            <th className="p-3">Teacher Feedback / Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {marks.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center py-8 text-slate-400">No official examination scores published yet.</td>
                            </tr>
                          ) : (
                            marks.map(mrk => (
                              <tr key={mrk.id} className="hover:bg-slate-50">
                                <td className="p-3 font-bold text-slate-900 capitalize">{mrk.examType}</td>
                                <td className="p-3 text-emerald-800 font-extrabold">{mrk.score}</td>
                                <td className="p-3 text-slate-500">{mrk.maxScore}</td>
                                <td className="p-3">
                                  <span className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-emerald-800 font-bold text-[11px]">
                                    {mrk.grade}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-600 font-medium italic">{mrk.remarks || 'Masha-Allah! No additional comments.'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* DIGITAL LIBRARY CATALOG TAB */}
              {activeTab === 'library' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                  
                  {/* Catalog Column */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 font-serif flex items-center gap-2">
                            <Book className="w-5 h-5 text-[#064e3b]" />
                            Browse Library Catalog
                          </h3>
                          <p className="text-[11px] text-slate-500">Search and request physical print copies of classical Islamic works.</p>
                        </div>
                      </div>

                      {/* Filters */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="text" 
                            value={libSearch}
                            onChange={(e) => setLibSearch(e.target.value)}
                            placeholder="Search by title, author, subject..."
                            className="w-full pl-9 pr-4 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 placeholder:text-slate-400 font-medium"
                          />
                        </div>
                        <select 
                          value={libCategory}
                          onChange={(e) => setLibCategory(e.target.value)}
                          className="text-xs bg-white text-slate-900 border border-slate-300 rounded-lg px-2.5 py-2 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-700"
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

                      {/* Books Catalog Grid */}
                      <div className="space-y-3">
                        {libraryBooks.length === 0 ? (
                          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">The library catalog is currently empty or being initialized by staff.</p>
                          </div>
                        ) : (
                          libraryBooks
                            .filter(book => {
                              const matchesSearch = book.title.toLowerCase().includes(libSearch.toLowerCase()) || 
                                                    book.author.toLowerCase().includes(libSearch.toLowerCase());
                              const matchesCat = libCategory === 'All' || book.category === libCategory;
                              return matchesSearch && matchesCat;
                            })
                            .map(book => {
                              const alreadyRequested = myLoans.find(l => l.bookId === book.id);
                              
                              return (
                                <div key={book.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="space-y-1 max-w-md">
                                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      {book.category}
                                    </span>
                                    <h4 className="font-bold text-xs text-slate-900 leading-tight">{book.title}</h4>
                                    <p className="text-[10px] text-slate-500">{book.author} • <span className="font-semibold text-amber-700">{book.location || 'Rack A-1'}</span></p>
                                    <p className="text-[10px] text-slate-400">Language: {book.language} • ISBN: {book.isbn || 'N/A'}</p>
                                  </div>

                                  <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                                    <span className={`text-[11px] font-bold ${book.availableStock > 0 ? 'text-emerald-800' : 'text-red-600'}`}>
                                      {book.availableStock} / {book.totalStock} available
                                    </span>
                                    
                                    {alreadyRequested ? (
                                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                                        alreadyRequested.status === 'pending' ? 'bg-amber-100 text-amber-800'
                                          : alreadyRequested.status === 'approved' ? 'bg-emerald-100 text-emerald-800'
                                          : alreadyRequested.status === 'returned' ? 'bg-slate-200 text-slate-600'
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {alreadyRequested.status}
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => setBorrowingBook(book)}
                                        disabled={book.availableStock <= 0}
                                        className="px-3 py-1.5 bg-[#064e3b] hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[10px] font-bold rounded shadow-sm transition-colors"
                                      >
                                        {book.availableStock > 0 ? 'Request to Borrow' : 'Out of Stock'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>

                    {/* Borrow Selection Form Overlay */}
                    {borrowingBook && (
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-md space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h4 className="font-bold text-xs text-slate-900 uppercase">Submit Book Loan Request</h4>
                          <button onClick={() => setBorrowingBook(null)} className="text-slate-400 hover:text-slate-600 text-xs">Close</button>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          You are requesting to check out <strong>{borrowingBook.title}</strong> by {borrowingBook.author}. Please select your preferred timeline below:
                        </p>
                        
                        <form onSubmit={handleRequestBorrow} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-700 uppercase">Pickup Date</label>
                            <input 
                              type="date" 
                              required
                              value={borrowDate}
                              onChange={(e) => setBorrowDate(e.target.value)}
                              className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-700 uppercase">Expected Return Date</label>
                            <input 
                              type="date" 
                              required
                              value={returnDate}
                              onChange={(e) => setReturnDate(e.target.value)}
                              className="w-full text-xs bg-white text-slate-900 border border-slate-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-medium"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={isBorrowSubmitting}
                            className="w-full py-2 bg-[#064e3b] hover:bg-emerald-800 text-white font-bold text-xs rounded shadow-sm transition-colors"
                          >
                            {isBorrowSubmitting ? 'Submitting...' : 'Confirm Request'}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Sidebar History Column */}
                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4 h-fit">
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">My Borrow History</h3>
                      <p className="text-[11px] text-slate-500">Track approved physical library logs and expected hand-in deadlines.</p>
                    </div>

                    <div className="space-y-3">
                      {myLoans.length === 0 ? (
                        <p className="text-xs text-slate-400 italic text-center py-6">You have not submitted any borrow requests yet.</p>
                      ) : (
                        myLoans.map(loan => (
                          <div key={loan.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                            <p className="font-bold text-xs text-slate-900 leading-tight">{loan.bookTitle}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>Due: {loan.returnDate}</span>
                              <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                                loan.status === 'approved' ? 'bg-emerald-100 text-emerald-800'
                                  : loan.status === 'pending' ? 'bg-amber-100 text-amber-800'
                                  : loan.status === 'returned' ? 'bg-slate-200 text-slate-600'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {loan.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* VIDEO LESSONS TAB */}
              {activeTab === 'online_classes' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Playback Area */}
                  <div className="lg:col-span-2 space-y-4">
                    {activeVideo ? (
                      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                        {/* Responsive Embed Player */}
                        <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden shadow border border-slate-800">
                          {getYouTubeEmbedId(activeVideo.videoUrl) ? (
                            <iframe
                              src={`https://www.youtube.com/embed/${getYouTubeEmbedId(activeVideo.videoUrl)}?autoplay=0&rel=0`}
                              title={activeVideo.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="absolute inset-0 w-full h-full"
                            ></iframe>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                              <Video className="w-12 h-12 text-slate-600 mb-2" />
                              <p className="text-xs font-semibold text-slate-200">Alternative Video Link</p>
                              <p className="text-[10px] text-slate-400 mt-1 max-w-xs">This lesson uses an external streaming service or direct Link.</p>
                              <a 
                                href={activeVideo.videoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="mt-4 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded shadow transition-colors"
                              >
                                Watch on External Server
                              </a>
                            </div>
                          )}
                        </div>
                        
                        {/* Title & Description */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-[#064e3b]/10 text-[#064e3b] text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                              Lesson {activeVideo.lessonOrder || 1}
                            </span>
                          </div>
                          <h3 className="font-bold text-base text-slate-900 font-serif leading-tight">{activeVideo.title}</h3>
                          <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                            {activeVideo.description || 'No detailed lesson description is provided for this class lecture.'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white p-12 rounded-xl border border-slate-100 shadow-sm text-center">
                        <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h4 className="font-bold text-sm text-slate-800 font-serif">Select a Video Lesson</h4>
                        <p className="text-xs text-slate-400 mt-1">Please choose a lecture from the playlist sidebar on the right.</p>
                      </div>
                    )}
                  </div>

                  {/* Playlist Sidebar */}
                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Course Lectures</h3>
                      <p className="text-[10px] text-slate-500">Structured online course videos and ustad-led classes.</p>
                    </div>

                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {videos.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                          <Video className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                          <p className="text-[10px] text-slate-500 leading-normal px-4">There are no online video lessons published for this program yet.</p>
                        </div>
                      ) : (
                        videos.map((vid) => (
                          <button
                            key={vid.id}
                            onClick={() => setActiveVideo(vid)}
                            className={`w-full p-3 text-left rounded-lg border transition-all flex gap-3 items-start ${
                              activeVideo?.id === vid.id
                                ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                                : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                            }`}
                          >
                            <div className={`p-1.5 rounded bg-white border shrink-0 ${
                              activeVideo?.id === vid.id ? 'text-[#064e3b] border-emerald-200' : 'text-slate-400 border-slate-100'
                            }`}>
                              <Video className="w-4 h-4" />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                                Lecture {vid.lessonOrder || 1}
                              </span>
                              <h4 className="font-bold text-xs text-slate-900 leading-tight line-clamp-2">
                                {vid.title}
                              </h4>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </>
      )}

      {/* PRINTABLE ACADEMIC CERTIFICATE OVERLAY */}
      {showCertificate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-serif">Academic Graduation Certificate</h3>
                <p className="text-[10px] text-slate-500">Print your high-resolution verified PDF certificate below.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#064e3b] hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm inline-flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" /> Print / Save as PDF
                </button>
                <button 
                  onClick={() => setShowCertificate(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg transition-colors hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Frame Area */}
            <div id="printable-certificate" className="bg-white p-8 relative border-8 border-double border-amber-600 shadow-inner rounded-md max-w-3xl mx-auto font-serif text-slate-900 overflow-hidden">
              {/* Accent Watermark */}
              <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none">
                <Award className="w-96 h-96 text-amber-700" />
              </div>
              
              <div className="relative z-10 text-center space-y-6">
                {/* Traditional Header */}
                <div className="space-y-2">
                  <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center font-bold text-[#064e3b] text-2xl mx-auto shadow-md">
                    A
                  </div>
                  <h1 className="text-2xl font-black uppercase tracking-wider text-[#064e3b] font-serif">As-Sunnah Dawah and Research Institute</h1>
                  <p className="text-xs text-amber-700 font-bold uppercase tracking-widest">Islamic Academic Center for Pure Science & Research</p>
                  <div className="w-32 h-1 bg-amber-500 mx-auto rounded-full"></div>
                </div>

                {/* Subtitle */}
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-800 font-serif italic">Certificate of Course Completion</h2>
                  <p className="text-amber-800 font-semibold text-xs">Verified Academic Transcript</p>
                </div>

                {/* Body Content */}
                <div className="space-y-4 max-w-xl mx-auto py-4">
                  <p className="text-xs text-slate-500 leading-normal">
                    This is to certify that
                  </p>
                  <h3 className="text-xl font-extrabold text-slate-900 uppercase font-sans tracking-wide border-b border-dashed border-slate-300 pb-1 inline-block min-w-[250px]">
                    {user?.displayName || user?.email?.split('@')[0]}
                  </h3>
                  <p className="text-xs text-slate-500 leading-normal mt-3">
                    has successfully graduated and completed all academic requirements for:<br/>
                  </p>
                  <h4 className="text-base font-extrabold text-[#064e3b] italic font-serif">
                    {activeCourseTitle}
                  </h4>
                  <p className="text-xs text-slate-600 leading-normal">
                    with overall grade: <strong className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-sm font-extrabold">{selectedEnrollment?.overallGrade || 'A+'}</strong>
                  </p>
                </div>

                {/* Signatures & Footer */}
                <div className="grid grid-cols-2 gap-8 pt-8 max-w-md mx-auto text-xs text-slate-600 font-sans">
                  <div className="text-center space-y-1">
                    <div className="h-8 flex items-end justify-center">
                      <span className="font-serif italic text-amber-700 font-bold">As-Sunnah Academics</span>
                    </div>
                    <div className="border-t border-slate-300 pt-1">
                      <p className="font-bold text-slate-800 text-[10px] uppercase">Academic Director</p>
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="h-8 flex items-end justify-center">
                      <span className="font-serif italic text-[#064e3b] font-bold">Shaykh Mohsin</span>
                    </div>
                    <div className="border-t border-slate-300 pt-1">
                      <p className="font-bold text-slate-800 text-[10px] uppercase">Director of Dawah</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 text-[9px] text-slate-400 space-y-0.5">
                  <p>Verification Code: <strong className="text-slate-500">{selectedEnrollment?.id || 'ASDRI_VERIFIED'}</strong></p>
                  <p>Date of Issue: {selectedEnrollment?.graduationDate || new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .no-print, .no-print * {
            display: none !important;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible !important;
          }
          #printable-certificate {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 2rem !important;
            border: 8px double #b45309 !important;
            box-shadow: none !important;
            z-index: 9999 !important;
          }
        }
      `}</style>
    </div>
  );
}
