'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  BookOpen, Users, Clock, FileText, CheckCircle2, AlertCircle, Plus, 
  Calendar as CalendarIcon, Link2, Upload, Trash2, Award, Check, X, ShieldAlert,
  Book, Search, Bookmark, ExternalLink, Video, Volume2
} from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { COURSES } from '@/lib/constants/courses';
import { 
  collection, query, where, getDocs, addDoc, doc, 
  setDoc, updateDoc, getDoc, deleteDoc, writeBatch 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function TeacherDashboard() {
  const { user } = useAuthStore();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || 'en';
  const paramTab = searchParams?.get('tab');
  
  // Dashboard state
  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [localTab, setLocalTab] = useState<'overview' | 'schedules' | 'assignments' | 'materials' | 'attendance' | 'library' | 'research' | 'videos'>('overview');
  const activeTab = (paramTab as any) || localTab;
  const setActiveTab = (tab: any) => setLocalTab(tab);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('pys');
  const [students, setStudents] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  
  // Research review states
  const [researchPapers, setResearchPapers] = useState<any[]>([]);
  const [selectedReviewPaper, setSelectedReviewPaper] = useState<any | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');
  const [isReviewSubmitting, setIsReviewSubmitting] = useState<boolean>(false);
  
  // Loading & Action states
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);

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
  
  // Course videos states
  const [courseVideos, setCourseVideos] = useState<any[]>([]);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoOrder, setVideoOrder] = useState('1');
  const [isAddingVideo, setIsAddingVideo] = useState(false);

  // Student Certificate Editing State
  const [editingEnrollment, setEditingEnrollment] = useState<any | null>(null);
  const [certEligible, setCertEligible] = useState(false);
  const [overallGrade, setOverallGrade] = useState('A+');
  const [graduationDate, setGraduationDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isUpdatingCert, setIsUpdatingCert] = useState(false);
  
  // Form states
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDay, setScheduleDay] = useState('Friday');
  const [scheduleTime, setScheduleTime] = useState('09:00 AM');
  const [scheduleRoom, setScheduleRoom] = useState('Room A-101');
  const [scheduleLink, setScheduleLink] = useState('');

  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDesc, setAssignmentDesc] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [assignmentMaxPoints, setAssignmentMaxPoints] = useState('100');

  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDesc, setMaterialDesc] = useState('');
  const [materialUrl, setMaterialUrl] = useState('');
  const [materialType, setMaterialType] = useState('pdf');

  // Attendance Form state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<{ [studentId: string]: 'present' | 'absent' | 'late' }>({});

  // Grading states
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');

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

  // Helper function to seed mock students & enrollments for testing
  const seedDemoStudents = async () => {
    setIsSeeding(true);
    try {
      const demoStudents = [
        { uid: 'student_ahmad', name: 'Ahmad Al-Faruq', email: 'ahmad@asdri.edu' },
        { uid: 'student_fatima', name: 'Fatima Al-Zahra', email: 'fatima@asdri.edu' },
        { uid: 'student_anas', name: 'Anas Ibn Malik', email: 'anas@asdri.edu' }
      ];

      const batch = writeBatch(db);

      // Save user profiles
      for (const std of demoStudents) {
        const userRef = doc(db, 'users', std.uid);
        batch.set(userRef, {
          name: std.name,
          email: std.email,
          role: 'student',
          createdAt: new Date().toISOString()
        });

        // Save enrollments
        // Custom ID: std_course
        const enrollRef = doc(db, 'enrollments', `${std.uid}_${selectedCourseId}`);
        batch.set(enrollRef, {
          userId: std.uid,
          courseId: selectedCourseId,
          enrolledAt: new Date().toISOString(),
          status: 'active',
          studentName: std.name,
          studentEmail: std.email
        });
      }

      await batch.commit();
      alert('Successfully seeded 3 demo students and enrollments for this course!');
      await fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users/enrollments');
    } finally {
      setIsSeeding(false);
    }
  };

  // Main fetch function
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Students (enrolled in selectedCourseId)
      const enrollQuery = query(collection(db, 'enrollments'), where('courseId', '==', selectedCourseId));
      const enrollSnap = await getDocs(enrollQuery);
      const enrollmentList = await Promise.all(enrollSnap.docs.map(async (docSnap) => {
        const data = docSnap.data();
        let studentName = data.studentName;
        let studentEmail = data.studentEmail;
        
        // Fallback: if studentName/Email are missing from enrollment, fetch from users collection
        if ((!studentName || !studentEmail) && data.userId) {
          try {
            const userRef = doc(db, 'users', data.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              studentName = studentName || userData.name || userData.displayName;
              studentEmail = studentEmail || userData.email;
            }
          } catch (err) {
            console.error("Error fetching student fallback info:", err);
          }
        }
        
        return {
          id: docSnap.id,
          ...data,
          studentName: studentName || 'Student',
          studentEmail: studentEmail || 'N/A'
        };
      }));
      setStudents(enrollmentList);

      // 2. Fetch Schedules
      const schedQuery = query(collection(db, 'schedules'), where('courseId', '==', selectedCourseId));
      const schedSnap = await getDocs(schedQuery);
      setSchedules(schedSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // 3. Fetch Assignments
      const assignQuery = query(collection(db, 'assignments'), where('courseId', '==', selectedCourseId));
      const assignSnap = await getDocs(assignQuery);
      setAssignments(assignSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // 4. Fetch Submissions
      const subQuery = query(collection(db, 'submissions'), where('courseId', '==', selectedCourseId));
      const subSnap = await getDocs(subQuery);
      setSubmissions(subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // 5. Fetch Materials
      const matQuery = query(collection(db, 'materials'), where('courseId', '==', selectedCourseId));
      const matSnap = await getDocs(matQuery);
      setMaterials(matSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // 6. Fetch Attendance Logs
      const attQuery = query(collection(db, 'attendance'), where('courseId', '==', selectedCourseId));
      const attSnap = await getDocs(attQuery);
      setAttendance(attSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // 7. Fetch Library books
      const booksSnap = await getDocs(collection(db, 'library_books'));
      setLibraryBooks(booksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // 8. Fetch user loans
      if (user) {
        const loansQuery = query(collection(db, 'book_loans'), where('userId', '==', user.uid));
        const loansSnap = await getDocs(loansQuery);
        setMyLoans(loansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }

      // 9. Fetch research papers
      const papersSnap = await getDocs(collection(db, 'research_papers'));
      const papersList = papersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResearchPapers(papersList);

      // 10. Fetch course videos
      const videosSnap = await getDocs(query(collection(db, 'course_videos'), where('courseId', '==', selectedCourseId)));
      const videosList = videosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourseVideos(videosList.sort((a: any, b: any) => (a.lessonOrder || 0) - (b.lessonOrder || 0)));

    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'lms_data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dynamic courses from Firestore
  useEffect(() => {
    const fetchDbCourses = async () => {
      try {
        const coursesSnap = await getDocs(collection(db, 'courses'));
        setDbCourses(coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching courses for teacher dashboard:", error);
      }
    };
    fetchDbCourses();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedCourseId]);

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
        userName: user.displayName || user.email?.split('@')[0] || 'Teacher',
        userEmail: user.email || '',
        userRole: 'teacher',
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

  const handleReviewPaper = async (status: 'approved' | 'needs_revision') => {
    if (!selectedReviewPaper || !user) return;
    setIsReviewSubmitting(true);
    try {
      const paperRef = doc(db, 'research_papers', selectedReviewPaper.id);
      await updateDoc(paperRef, {
        status: status,
        reviewerFeedback: reviewFeedback.trim(),
        reviewerId: user.uid,
        reviewerName: user.displayName || user.email?.split('@')[0] || 'Academic Board Member',
        approvedAt: status === 'approved' ? new Date().toISOString() : null
      });

      alert(`Research paper has been ${status === 'approved' ? 'Approved & Published' : 'marked for Revision'} successfully.`);
      
      // Reset review editing state
      setSelectedReviewPaper(null);
      setReviewFeedback('');

      // Refresh paper list
      const papersSnap = await getDocs(collection(db, 'research_papers'));
      const papersList = papersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResearchPapers(papersList);
    } catch (err: any) {
      console.error("Error reviewing paper:", err);
      alert(`Failed to update paper: ${err.message}`);
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  // Handle Form Submissions
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTitle || !scheduleDay || !scheduleTime || !scheduleRoom) return;

    try {
      const path = 'schedules';
      await addDoc(collection(db, path), {
        courseId: selectedCourseId,
        title: scheduleTitle,
        teacherId: user?.uid,
        dayOfWeek: scheduleDay,
        time: scheduleTime,
        room: scheduleRoom,
        meetingLink: scheduleLink || ''
      });
      setScheduleTitle('');
      setScheduleLink('');
      setShowScheduleForm(false);
      await fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'schedules');
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentTitle || !assignmentDueDate || !assignmentMaxPoints) return;

    try {
      const path = 'assignments';
      const docRef = await addDoc(collection(db, path), {
        courseId: selectedCourseId,
        title: assignmentTitle,
        description: assignmentDesc,
        teacherId: user?.uid,
        dueDate: assignmentDueDate,
        maxPoints: Number(assignmentMaxPoints),
        createdAt: new Date().toISOString()
      });

      // Automatically seed empty submissions for students to simulate assignments
      if (students.length > 0) {
        const batch = writeBatch(db);
        students.forEach((std) => {
          const subRef = doc(collection(db, 'submissions'));
          batch.set(subRef, {
            assignmentId: docRef.id,
            assignmentTitle: assignmentTitle,
            courseId: selectedCourseId,
            studentId: std.userId,
            studentName: std.studentName || 'Student',
            studentEmail: std.studentEmail || '',
            submissionText: `As-salamu alaykum. This is my submission draft for assignment: ${assignmentTitle}.`,
            submittedAt: new Date().toISOString(),
            status: 'pending',
            grade: null,
            feedback: ''
          });
        });
        await batch.commit();
      }

      setAssignmentTitle('');
      setAssignmentDesc('');
      setAssignmentDueDate('');
      setAssignmentMaxPoints('100');
      setShowAssignmentForm(false);
      await fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'assignments');
    }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialTitle || !materialUrl) return;

    try {
      const path = 'materials';
      await addDoc(collection(db, path), {
        courseId: selectedCourseId,
        title: materialTitle,
        description: materialDesc,
        teacherId: user?.uid,
        fileUrl: materialUrl,
        fileType: materialType,
        createdAt: new Date().toISOString()
      });
      setMaterialTitle('');
      setMaterialDesc('');
      setMaterialUrl('');
      setShowMaterialForm(false);
      await fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'materials');
    }
  };

  const handleSaveAttendance = async () => {
    if (students.length === 0) return;
    try {
      const batch = writeBatch(db);
      for (const std of students) {
        const status = attendanceRecords[std.userId] || 'present';
        // Unique attendance document per student per course per date
        const attId = `${selectedCourseId}_${attendanceDate}_${std.userId}`;
        const attRef = doc(db, 'attendance', attId);
        batch.set(attRef, {
          courseId: selectedCourseId,
          date: attendanceDate,
          studentId: std.userId,
          studentName: std.studentName || 'Student',
          status: status,
          recordedBy: user?.uid,
          recordedAt: new Date().toISOString()
        });
      }
      await batch.commit();
      alert('Attendance saved successfully!');
      await fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'attendance');
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission || !gradeScore) return;

    try {
      const path = 'submissions';
      const subRef = doc(db, path, gradingSubmission.id);
      await updateDoc(subRef, {
        grade: Number(gradeScore),
        feedback: gradeFeedback,
        status: 'graded'
      });

      // Also create/update a record in the marks collection
      const markId = `${selectedCourseId}_${gradingSubmission.assignmentId}_${gradingSubmission.studentId}`;
      const markRef = doc(db, 'marks', markId);
      await setDoc(markRef, {
        studentId: gradingSubmission.studentId,
        courseId: selectedCourseId,
        examType: 'assignment',
        score: Number(gradeScore),
        maxScore: gradingSubmission.maxPoints || 100,
        grade: Number(gradeScore) >= 90 ? 'A+' : Number(gradeScore) >= 80 ? 'A' : Number(gradeScore) >= 70 ? 'B' : 'C',
        remarks: gradeFeedback,
        recordedBy: user?.uid,
        recordedAt: new Date().toISOString()
      });

      setGradingSubmission(null);
      setGradeScore('');
      setGradeFeedback('');
      await fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `submissions/${gradingSubmission.id}`);
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle || !videoUrl) return;
    setIsAddingVideo(true);
    try {
      await addDoc(collection(db, 'course_videos'), {
        courseId: selectedCourseId,
        title: videoTitle,
        videoUrl: videoUrl,
        description: videoDesc,
        lessonOrder: Number(videoOrder),
        createdAt: new Date().toISOString()
      });
      setVideoTitle('');
      setVideoUrl('');
      setVideoDesc('');
      setVideoOrder('1');
      setShowVideoForm(false);
      alert('Online Video Lecture published successfully!');
      await fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'course_videos');
    } finally {
      setIsAddingVideo(false);
    }
  };

  const handleUpdateStudentCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEnrollment) return;
    setIsUpdatingCert(true);
    try {
      await updateDoc(doc(db, 'enrollments', editingEnrollment.id), {
        certificateEligible: certEligible,
        overallGrade: overallGrade,
        graduationDate: graduationDate
      });
      setEditingEnrollment(null);
      alert('Student certificate details and graduation status updated successfully!');
      await fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `enrollments/${editingEnrollment.id}`);
    } finally {
      setIsUpdatingCert(false);
    }
  };

  const handleDeleteItem = async (collectionName: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      await fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
    }
  };

  const allCourses = [...COURSES, ...dbCourses];
  const selectedCourseName = allCourses.find(c => c.id === selectedCourseId)?.title || selectedCourseId;

  // Overview calculations
  const totalStudentsCount = students.length;
  const materialsCount = materials.length;
  const assignmentsCount = assignments.length;
  const ungradedSubmissionsCount = submissions.filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs font-bold text-slate-500">শিক্ষক হাব (Teacher Portal)</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ফায়ারবেস সিকিউর কানেক্টেড
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
              শিক্ষক ড্যাশবোর্ড ওভারভিউ
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl">
              <label className="text-xs font-bold text-slate-600">কোর্স:</label>
              <select 
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="text-xs bg-transparent text-emerald-950 font-bold focus:outline-none cursor-pointer"
              >
                {allCourses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => setActiveTab('assignments')}
              className="px-4 py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-white text-xs font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              নতুন অ্যাসাইনমেন্ট
            </button>
          </div>
        </div>
      </div>

      {/* Quick Seeding Tool Helper */}
      {totalStudentsCount === 0 && !isLoading && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              ইন্টারেক্টিভ ডেমো হেল্পার (কোন শিক্ষার্থী পাওয়া যায়নি)
            </h4>
            <p className="text-xs text-amber-700 mt-1 max-w-xl">
              <strong>{selectedCourseName}</strong> কোর্সে এখনও কোনো শিক্ষার্থী এনরোল নেই। আপনি অ্যাসাইনমেন্ট, গ্রেডিং ও উপস্থিতি টেস্ট করার জন্য ডেমো শিক্ষার্থী তৈরি করতে পারেন।
            </p>
          </div>
          <button 
            onClick={seedDemoStudents}
            disabled={isSeeding}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-2xl shrink-0 transition-colors disabled:opacity-50"
          >
            {isSeeding ? 'তৈরি হচ্ছে...' : 'ডেমো স্টুডেন্ট ডাটা এনরোল করুন'}
          </button>
        </div>
      )}

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">মোট শিক্ষার্থী</p>
            <h3 className="text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
              {isLoading ? '...' : totalStudentsCount}
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('attendance')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-700 transition-colors mt-6 pt-3 border-t border-slate-50 text-left"
          >
            <span>উপস্থিতি ও ক্লাস লগ →</span>
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">লেকচার উপকরণ</p>
            <h3 className="text-3xl font-extrabold text-amber-700 font-serif tracking-tight">
              {isLoading ? '...' : materialsCount}
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('materials')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-700 transition-colors mt-6 pt-3 border-t border-slate-50 text-left"
          >
            <span>উপকরণ আপলোড ও ফাইল →</span>
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">অ্যাসাইনমেন্ট</p>
            <h3 className="text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
              {isLoading ? '...' : assignmentsCount}
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('assignments')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-700 transition-colors mt-6 pt-3 border-t border-slate-50 text-left"
          >
            <span>অ্যাসাইনমেন্ট তালিকা →</span>
          </button>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 mb-1">মূল্যায়ন অপেক্ষমাণ</p>
            <h3 className="text-3xl font-extrabold text-amber-700 font-serif tracking-tight">
              {isLoading ? '...' : ungradedSubmissionsCount}
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('assignments')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-700 transition-colors mt-6 pt-3 border-t border-slate-50 text-left"
          >
            <span>গ্রেডিং ও রিভিউ দিন →</span>
          </button>
        </div>

      </div>

      {/* Tab Panels */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064e3b]"></div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Course Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-base text-slate-900 mb-2 font-serif">Selected Course Syllabus</h3>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-150">
                    <h4 className="font-bold text-[#064e3b] text-sm">{selectedCourseName}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Duration: {COURSES.find(c => c.id === selectedCourseId)?.duration || '1 Year'} • 
                      Type: {COURSES.find(c => c.id === selectedCourseId)?.type || 'Full-time'}
                    </p>
                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                      This interface expands the academic core of the institute, helping teachers manage the student classroom, update weekly class schedules, distribute reading materials, assignments, and track grades dynamically using cloud-secure database synchronization.
                    </p>
                  </div>
                </div>

                {/* Submissions Pending Evaluation */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">Evaluation Needed ({ungradedSubmissionsCount})</h3>
                    <button onClick={() => setActiveTab('assignments')} className="text-xs text-[#064e3b] font-bold hover:underline">View All</button>
                  </div>
                  <div className="p-5 divide-y divide-slate-100">
                    {submissions.filter(s => s.status === 'pending').length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">All submissions have been successfully graded. Masha-Allah!</p>
                    ) : (
                      submissions.filter(s => s.status === 'pending').map(sub => (
                        <div key={sub.id} className="py-3 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold text-slate-900">{sub.studentName}</p>
                            <p className="text-[10px] text-slate-400">{sub.assignmentTitle} • Submitted on {new Date(sub.submittedAt).toLocaleDateString()}</p>
                          </div>
                          <button 
                            onClick={() => {
                              setGradingSubmission(sub);
                              setGradeScore('');
                              setGradeFeedback('');
                              setActiveTab('assignments');
                            }}
                            className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-[10px] rounded hover:bg-amber-600 transition-colors"
                          >
                            Grade Now
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Student Graduation & Credentials Section */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden space-y-4 p-6">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 font-serif flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#064e3b]" />
                      Student Graduation & Certificates Management
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Approve students for course graduation, set grades, and generate certificates instantly.</p>
                  </div>

                  {editingEnrollment ? (
                    <form onSubmit={handleUpdateStudentCertificate} className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-4">
                      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                        <h4 className="font-bold text-xs text-amber-900">Configure Graduation Certificate for {editingEnrollment.studentName}</h4>
                        <button type="button" onClick={() => setEditingEnrollment(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Cancel</button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 uppercase">Certificate Status</label>
                          <select 
                            value={certEligible ? 'eligible' : 'not_eligible'} 
                            onChange={(e) => setCertEligible(e.target.value === 'eligible')}
                            className="w-full text-xs bg-white border border-slate-200 rounded p-2 focus:outline-none"
                          >
                            <option value="not_eligible">Not Eligible / Incomplete</option>
                            <option value="eligible">Graduated / Approved for Certificate</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 uppercase">Overall Graduation Grade</label>
                          <input 
                            type="text"
                            required
                            value={overallGrade}
                            onChange={(e) => setOverallGrade(e.target.value)}
                            placeholder="e.g. A+ or Mumtaz"
                            className="w-full text-xs bg-white border border-slate-200 rounded p-2 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 uppercase">Graduation / Issue Date</label>
                          <input 
                            type="date"
                            required
                            value={graduationDate}
                            onChange={(e) => setGraduationDate(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-200 rounded p-2 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button 
                          type="button" 
                          onClick={() => setEditingEnrollment(null)}
                          className="px-3 py-1.5 border border-slate-350 text-slate-600 text-xs font-bold rounded"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          disabled={isUpdatingCert}
                          className="px-4 py-1.5 bg-[#064e3b] hover:bg-emerald-800 text-white text-xs font-bold rounded shadow-sm"
                        >
                          {isUpdatingCert ? 'Updating...' : 'Save Certificate Setup'}
                        </button>
                      </div>
                    </form>
                  ) : null}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-3">Student</th>
                          <th className="p-3">Email</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Certificate</th>
                          <th className="p-3">Overall Grade</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-slate-400">No students enrolled in this course yet.</td>
                          </tr>
                        ) : (
                          students.map(std => (
                            <tr key={std.id} className="hover:bg-slate-50">
                              <td className="p-3 font-semibold text-slate-900">{std.studentName || 'Student'}</td>
                              <td className="p-3 text-slate-500">{std.studentEmail || 'N/A'}</td>
                              <td className="p-3">
                                <span className="bg-emerald-50 text-emerald-800 border border-emerald-150 px-2 py-0.5 rounded text-[10px] font-bold capitalize">
                                  {std.status || 'active'}
                                </span>
                              </td>
                              <td className="p-3">
                                {std.certificateEligible ? (
                                  <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                                    <Award className="w-3.5 h-3.5 text-amber-700" /> Eligible / Approved
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic text-[10px]">Not Eligible</span>
                                )}
                              </td>
                              <td className="p-3 font-bold text-slate-700">{std.overallGrade || 'N/A'}</td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => {
                                    setEditingEnrollment(std);
                                    setCertEligible(std.certificateEligible || false);
                                    setOverallGrade(std.overallGrade || 'A+');
                                    setGraduationDate(std.graduationDate || new Date().toISOString().split('T')[0]);
                                  }}
                                  className="px-2.5 py-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded transition-colors"
                                >
                                  Setup Cert
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Upcoming Schedules & Quick Info */}
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-sm text-slate-900 mb-4 font-serif">Today&apos;s Lecture Schedules</h3>
                  <div className="space-y-3">
                    {schedules.length === 0 ? (
                      <div className="text-center py-6 text-slate-400">
                        <Clock className="w-8 h-8 mx-auto opacity-30 mb-2" />
                        <p className="text-xs">No active class schedules yet</p>
                        <button 
                          onClick={() => { setActiveTab('schedules'); setShowScheduleForm(true); }}
                          className="mt-2 text-xs text-[#064e3b] font-bold hover:underline"
                        >
                          + Create Schedule
                        </button>
                      </div>
                    ) : (
                      schedules.map(sc => (
                        <div key={sc.id} className="p-3 bg-slate-50 rounded-lg border border-slate-150 flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 text-emerald-800 rounded">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{sc.title}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">{sc.dayOfWeek} • {sc.time} ({sc.room})</p>
                          </div>
                          {sc.meetingLink && (
                            <a href={sc.meetingLink} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-emerald-700 text-white rounded hover:bg-emerald-800">
                              <Link2 className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-[#064e3b] text-white p-6 rounded-xl shadow-md relative overflow-hidden">
                  <h4 className="text-amber-400 font-bold uppercase text-[9px] tracking-widest mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> System Info
                  </h4>
                  <p className="text-sm font-serif mt-2">Durable Persistence Active</p>
                  <p className="text-[11px] mt-1 opacity-80 leading-relaxed">
                    Student profiles, materials, and grades are securely written and updated inside your Firestore instance. Take attendance roll every day to preserve complete records.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SCHEDULES TAB */}
          {activeTab === 'schedules' && (
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Weekly Class Schedules</h3>
                  <p className="text-xs text-slate-500">Configure lecture times, days, and offline room numbers or online meet URLs.</p>
                </div>
                <button 
                  onClick={() => setShowScheduleForm(!showScheduleForm)}
                  className="px-3 py-1.5 bg-[#064e3b] text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-emerald-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {showScheduleForm ? 'Hide Form' : 'Add Class Schedule'}
                </button>
              </div>

              {showScheduleForm && (
                <form onSubmit={handleCreateSchedule} className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Class Topic / Lecture Title</label>
                    <input 
                      type="text" 
                      required 
                      value={scheduleTitle} 
                      onChange={(e) => setScheduleTitle(e.target.value)}
                      placeholder="e.g. Tafseer-ul-Quran Basic Principles"
                      className="w-full text-xs bg-white border border-slate-200 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">Day of Week</label>
                      <select 
                        value={scheduleDay} 
                        onChange={(e) => setScheduleDay(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-200 rounded px-3 py-2"
                      >
                        {['Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">Time Slot</label>
                      <input 
                        type="text" 
                        required 
                        value={scheduleTime} 
                        onChange={(e) => setScheduleTime(e.target.value)}
                        placeholder="e.g. 10:00 AM"
                        className="w-full text-xs bg-white border border-slate-200 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Classroom Room No</label>
                    <input 
                      type="text" 
                      required 
                      value={scheduleRoom} 
                      onChange={(e) => setScheduleRoom(e.target.value)}
                      placeholder="e.g. Room A-102"
                      className="w-full text-xs bg-white border border-slate-200 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Online Meeting Link (Optional)</label>
                    <input 
                      type="url" 
                      value={scheduleLink} 
                      onChange={(e) => setScheduleLink(e.target.value)}
                      placeholder="e.g. https://meet.google.com/xxx-xxxx-xxx"
                      className="w-full text-xs bg-white border border-slate-200 rounded px-3 py-2 focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowScheduleForm(false)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded text-xs hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-1.5 bg-[#064e3b] text-white rounded text-xs font-bold hover:bg-emerald-800"
                    >
                      Save Schedule
                    </button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-3">Class Title</th>
                      <th className="p-3">Weekly Day</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Room / Virtual</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schedules.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400">No schedules configured for this course yet.</td>
                      </tr>
                    ) : (
                      schedules.map(sc => (
                        <tr key={sc.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900">{sc.title}</td>
                          <td className="p-3">{sc.dayOfWeek}</td>
                          <td className="p-3">{sc.time}</td>
                          <td className="p-3">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 text-[11px]">{sc.room}</span>
                            {sc.meetingLink && (
                              <a href={sc.meetingLink} target="_blank" rel="noopener noreferrer" className="ml-2 text-emerald-700 hover:underline inline-flex items-center gap-0.5">
                                <Link2 className="w-3 h-3" /> Online
                              </a>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button 
                              onClick={() => handleDeleteItem('schedules', sc.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ASSIGNMENTS TAB */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              
              {/* Grading overlay / form */}
              {gradingSubmission && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm font-serif">Evaluate Student Submission</h3>
                      <p className="text-xs text-slate-500">Student: <strong>{gradingSubmission.studentName}</strong> ({gradingSubmission.studentEmail})</p>
                    </div>
                    <button onClick={() => setGradingSubmission(null)} className="p-1 hover:bg-slate-200 rounded-full"><X className="w-4 h-4" /></button>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Submitted Draft Text:</p>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded leading-relaxed whitespace-pre-wrap">{gradingSubmission.submissionText}</p>
                  </div>

                  {/* Submitted Attachments Player & Viewer */}
                  {gradingSubmission.attachments && gradingSubmission.attachments.length > 0 && (
                    <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Submitted Attachments ({gradingSubmission.attachments.length}):</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {gradingSubmission.attachments.map((att: any, idx: number) => {
                          const getTeacherAttachmentIcon = (type: string) => {
                            switch (type) {
                              case 'pdf':
                                return <BookOpen className="w-4 h-4 text-rose-700 shrink-0" />;
                              case 'audio':
                                return <Volume2 className="w-4 h-4 text-blue-700 shrink-0" />;
                              case 'video':
                                return <Video className="w-4 h-4 text-emerald-700 shrink-0" />;
                              case 'image':
                                return <Search className="w-4 h-4 text-amber-700 shrink-0" />;
                              default:
                                return <FileText className="w-4 h-4 text-slate-700 shrink-0" />;
                            }
                          };

                          return (
                            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 truncate pr-1">
                                  {getTeacherAttachmentIcon(att.type)}
                                  <div className="truncate">
                                    <p className="font-bold text-[11px] text-slate-800 truncate leading-none">{att.name}</p>
                                    <p className="text-[9px] text-slate-400">
                                      {att.size ? `${(att.size / (1024 * 1024)).toFixed(2)} MB` : 'Size unknown'} • {att.type.toUpperCase()}
                                    </p>
                                  </div>
                                </div>
                                <a 
                                  href={att.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="p-1 hover:bg-slate-200 rounded text-slate-500 shrink-0"
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>

                              {/* Inline players based on attachment types */}
                              {att.type === 'audio' && (
                                <div className="mt-1">
                                  <audio src={att.url} controls className="w-full h-8 text-xs bg-transparent" />
                                </div>
                              )}

                              {att.type === 'video' && (
                                <div className="mt-1 rounded overflow-hidden bg-black border border-slate-200">
                                  <video src={att.url} controls className="w-full max-h-[140px] object-contain" />
                                </div>
                              )}

                              {att.type === 'image' && (
                                <div className="mt-1 rounded overflow-hidden border border-slate-200 max-h-[140px] bg-slate-100 flex items-center justify-center">
                                  <img src={att.url} alt={att.name} className="max-h-[140px] object-contain" referrerPolicy="no-referrer" />
                                </div>
                              )}

                              {att.type === 'pdf' && (
                                <a 
                                  href={att.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="mt-1 w-full text-center py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors text-[10px] font-bold inline-flex items-center justify-center gap-1"
                                >
                                  <BookOpen className="w-3.5 h-3.5" /> Read PDF Document
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleGradeSubmission} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">Assigned Score (Max {gradingSubmission.maxPoints || 100})</label>
                      <input 
                        type="number" 
                        required 
                        min="0"
                        max={gradingSubmission.maxPoints || 100}
                        value={gradeScore}
                        onChange={(e) => setGradeScore(e.target.value)}
                        placeholder="e.g. 92"
                        className="w-full text-xs bg-white border border-slate-200 rounded px-3 py-2"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">Educational Feedback & Remarks</label>
                      <input 
                        type="text" 
                        value={gradeFeedback}
                        onChange={(e) => setGradeFeedback(e.target.value)}
                        placeholder="e.g. Excellent recitation and solid grasp of the core concepts. Masha-Allah!"
                        className="w-full text-xs bg-white border border-slate-200 rounded px-3 py-2"
                      />
                    </div>
                    <div className="md:col-span-3 flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setGradingSubmission(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:underline"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-4 py-1.5 bg-[#064e3b] text-white text-xs font-bold rounded"
                      >
                        Submit Grade & Feedback
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Active Assignments List */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Course Assignments</h3>
                      <p className="text-xs text-slate-500">Add homework, research papers, or term work.</p>
                    </div>
                    <button 
                      onClick={() => setShowAssignmentForm(!showAssignmentForm)}
                      className="px-3 py-1.5 bg-[#064e3b] text-white text-xs font-bold rounded flex items-center gap-1"
                    >
                      <Plus className="w-4.5 h-4.5" /> New Task
                    </button>
                  </div>

                  {showAssignmentForm && (
                    <form onSubmit={handleCreateAssignment} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 uppercase">Assignment Title</label>
                        <input 
                          type="text" 
                          required 
                          value={assignmentTitle} 
                          onChange={(e) => setAssignmentTitle(e.target.value)}
                          placeholder="e.g. Fiqh Term Essay - Quranic Injunctions"
                          className="w-full text-xs bg-white border border-slate-200 rounded px-3 py-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 uppercase">Detailed Instructions</label>
                        <textarea 
                          rows={2}
                          value={assignmentDesc} 
                          onChange={(e) => setAssignmentDesc(e.target.value)}
                          placeholder="Provide the steps, prompt requirements, or reading materials list..."
                          className="w-full text-xs bg-white border border-slate-200 rounded px-3 py-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 uppercase">Due Date</label>
                          <input 
                            type="date" 
                            required 
                            value={assignmentDueDate} 
                            onChange={(e) => setAssignmentDueDate(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-200 rounded px-3 py-2"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 uppercase">Maximum Points</label>
                          <input 
                            type="number" 
                            required 
                            value={assignmentMaxPoints} 
                            onChange={(e) => setAssignmentMaxPoints(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-200 rounded px-3 py-2"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button 
                          type="button" 
                          onClick={() => setShowAssignmentForm(false)}
                          className="px-3 py-1 bg-slate-100 text-slate-500 rounded text-xs"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="px-4 py-1 bg-[#064e3b] text-white rounded text-xs font-bold"
                        >
                          Publish Assignment
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="divide-y divide-slate-100">
                    {assignments.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No assignments published yet.</p>
                    ) : (
                      assignments.map(asg => (
                        <div key={asg.id} className="py-4 flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-900">{asg.title}</h4>
                            <p className="text-[11px] text-slate-600">{asg.description}</p>
                            <p className="text-[10px] text-slate-400">Due Date: {new Date(asg.dueDate).toLocaleDateString()} • Max Points: {asg.maxPoints}</p>
                          </div>
                          <button 
                            onClick={() => handleDeleteItem('assignments', asg.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Submissions lists */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Student Submissions</h3>
                    <p className="text-xs text-slate-500">Review, grade, and feedback.</p>
                  </div>

                  <div className="space-y-3">
                    {submissions.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No student submissions submitted yet.</p>
                    ) : (
                      submissions.map(sub => (
                        <div key={sub.id} className="p-3 bg-slate-50 rounded-lg border border-slate-150 flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold text-slate-900">{sub.studentName}</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{sub.assignmentTitle}</p>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              sub.status === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {sub.status === 'graded' ? `Graded: ${sub.grade}` : 'Pending'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[9px] text-slate-400">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                            <button 
                              onClick={() => {
                                setGradingSubmission(sub);
                                setGradeScore(sub.grade?.toString() || '');
                                setGradeFeedback(sub.feedback || '');
                              }}
                              className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[10px] font-bold text-slate-700"
                            >
                              {sub.status === 'graded' ? 'Update Grade' : 'Grade Submission'}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* MATERIALS TAB */}
          {activeTab === 'materials' && (
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Reading Materials & Lecture Notes</h3>
                  <p className="text-xs text-slate-500">Provide PDFs, website links, or research guides to the students instantly.</p>
                </div>
                <button 
                  onClick={() => setShowMaterialForm(!showMaterialForm)}
                  className="px-3 py-1.5 bg-[#064e3b] text-white text-xs font-bold rounded flex items-center gap-1 hover:bg-emerald-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {showMaterialForm ? 'Hide Form' : 'Upload Material'}
                </button>
              </div>

              {showMaterialForm && (
                <form onSubmit={handleUploadMaterial} className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Material Title</label>
                    <input 
                      type="text" 
                      required 
                      value={materialTitle} 
                      onChange={(e) => setMaterialTitle(e.target.value)}
                      placeholder="e.g. Introduction to Quranic Hermeneutics PDF"
                      className="w-full text-xs bg-white border border-slate-200 rounded px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">Material Type</label>
                      <select 
                        value={materialType} 
                        onChange={(e) => setMaterialType(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-200 rounded px-3 py-2"
                      >
                        <option value="pdf">PDF File</option>
                        <option value="link">External Link / Web Article</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">Source Link / File URL</label>
                      <input 
                        type="url" 
                        required 
                        value={materialUrl} 
                        onChange={(e) => setMaterialUrl(e.target.value)}
                        placeholder="e.g. https://example.com/lecture1.pdf"
                        className="w-full text-xs bg-white border border-slate-200 rounded px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Brief Description / Reading Notes</label>
                    <input 
                      type="text" 
                      value={materialDesc} 
                      onChange={(e) => setMaterialDesc(e.target.value)}
                      placeholder="e.g. Read chapters 1-3 before the next seminar on Tafseer."
                      className="w-full text-xs bg-white border border-slate-200 rounded px-3 py-2"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-2 pt-1">
                    <button 
                      type="button" 
                      onClick={() => setShowMaterialForm(false)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded text-xs hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-4 py-1.5 bg-[#064e3b] text-white rounded text-xs font-bold hover:bg-emerald-800"
                    >
                      Publish Material
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materials.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-slate-400">No lecture sheets or PDFs uploaded yet.</div>
                ) : (
                  materials.map(mat => (
                    <div key={mat.id} className="bg-slate-50 border border-slate-150 p-4 rounded-lg flex flex-col justify-between hover:border-emerald-200 transition-colors">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                            mat.fileType === 'pdf' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {mat.fileType}
                          </span>
                          <button 
                            onClick={() => handleDeleteItem('materials', mat.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{mat.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{mat.description || 'No notes provided.'}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-[9px] text-slate-400">{new Date(mat.createdAt).toLocaleDateString()}</span>
                        <a 
                          href={mat.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="px-2.5 py-1 bg-[#064e3b] text-white rounded font-bold text-[10px] flex items-center gap-1 hover:bg-emerald-800 transition-colors"
                        >
                          <Link2 className="w-3 h-3" />
                          View Material
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === 'attendance' && (
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Attendance roll-call sheet</h3>
                  <p className="text-xs text-slate-500">Record daily student attendance rates securely.</p>
                </div>
                
                {/* Date select */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Session Date:</label>
                  <input 
                    type="date" 
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {students.length === 0 ? (
                <div className="text-center py-12 text-slate-400 border border-dashed rounded-lg">
                  <p className="text-xs">No students enrolled in this course yet to record attendance.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Student Email</th>
                          <th className="p-3">Attendance Roll</th>
                          <th className="p-3 text-right">Last Log Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.map(std => {
                          const currentStatus = attendanceRecords[std.userId] || 'present';
                          
                          // Look up previous log if exists
                          const prevLog = attendance.find(a => a.studentId === std.userId && a.date === attendanceDate);

                          return (
                            <tr key={std.id} className="hover:bg-slate-50">
                              <td className="p-3 font-semibold text-slate-900">{std.studentName}</td>
                              <td className="p-3 text-slate-500">{std.studentEmail || 'N/A'}</td>
                              <td className="p-3">
                                <div className="inline-flex rounded-md shadow-sm">
                                  {(['present', 'absent', 'late'] as const).map(st => (
                                    <button
                                      key={st}
                                      type="button"
                                      onClick={() => setAttendanceRecords(prev => ({ ...prev, [std.userId]: st }))}
                                      className={`px-3 py-1.5 text-[10px] font-bold uppercase border border-slate-200 first:rounded-l-md last:rounded-r-md transition-all ${
                                        currentStatus === st 
                                          ? st === 'present' ? 'bg-emerald-700 text-white border-emerald-700'
                                            : st === 'absent' ? 'bg-red-600 text-white border-red-600'
                                            : 'bg-amber-500 text-slate-950 border-amber-500'
                                          : 'bg-white hover:bg-slate-50 text-slate-600'
                                      }`}
                                    >
                                      {st}
                                    </button>
                                  ))}
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                {prevLog ? (
                                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                    prevLog.status === 'present' ? 'bg-emerald-50 text-emerald-800'
                                      : prevLog.status === 'absent' ? 'bg-red-50 text-red-800'
                                      : 'bg-amber-50 text-amber-800'
                                  }`}>
                                    Logged: {prevLog.status}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-medium italic">Unrecorded for this date</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={handleSaveAttendance}
                      className="px-5 py-2 bg-[#064e3b] hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      Save & Log Attendance roll
                    </button>
                  </div>
                </div>
              )}
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
                      <p className="text-[11px] text-slate-500">Search and request physical print copies of classical Islamic works for research.</p>
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
                        className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white"
                      />
                    </div>
                    <select 
                      value={libCategory}
                      onChange={(e) => setLibCategory(e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-semibold"
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
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-700 uppercase">Expected Return Date</label>
                        <input 
                          type="date" 
                          required
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-2"
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

          {activeTab === 'research' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#064e3b]" />
                  Research Review & Approval Panel
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Peer-review submitted Dawah and theological research papers. Approved documents will instantly go live on the public Research board.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Papers Directory */}
                <div className="lg:col-span-1 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-700">
                    Submitted Manuscripts ({researchPapers.length})
                  </div>
                  <div className="p-4 divide-y divide-slate-100 overflow-y-auto max-h-[500px] flex-1">
                    {researchPapers.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-8">No research papers submitted yet.</p>
                    ) : (
                      researchPapers.map(paper => (
                        <button
                          key={paper.id}
                          onClick={() => {
                            setSelectedReviewPaper(paper);
                            setReviewFeedback(paper.reviewerFeedback || '');
                          }}
                          className={`w-full text-left p-3 hover:bg-slate-50 rounded-lg transition-all flex flex-col gap-1 ${
                            selectedReviewPaper?.id === paper.id ? 'bg-emerald-50/50 border border-emerald-100/40' : ''
                          }`}
                        >
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded self-start ${
                            paper.status === 'approved' ? 'bg-emerald-100 text-emerald-800'
                              : paper.status === 'needs_revision' ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {paper.status}
                          </span>
                          <span className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight">{paper.title}</span>
                          <span className="text-[10px] text-[#064e3b] font-semibold mt-0.5">{paper.authorName}</span>
                          <span className="text-[9px] text-slate-400">{new Date(paper.createdAt).toLocaleDateString()}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Selected Paper Details / Action */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
                  {!selectedReviewPaper ? (
                    <div className="text-center py-20 text-slate-400 flex flex-col items-center justify-center">
                      <FileText className="w-12 h-12 text-slate-200 mb-3" />
                      <p className="text-xs italic">Select a manuscript from the directory to review and update publication status.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="border-b border-slate-100 pb-4">
                        <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded uppercase">{selectedReviewPaper.category}</span>
                        <h4 className="font-bold text-lg text-slate-900 font-serif mt-1 leading-snug">{selectedReviewPaper.title}</h4>
                        <div className="flex justify-between text-xs text-slate-500 mt-2">
                          <span>Author: <strong className="text-slate-700">{selectedReviewPaper.authorName}</strong> ({selectedReviewPaper.researcherEmail})</span>
                          <span>Submitted: {new Date(selectedReviewPaper.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-1">
                        <h5 className="font-bold text-[10px] text-slate-600 uppercase tracking-wide">Abstract</h5>
                        <p className="text-xs text-slate-700 font-serif italic whitespace-pre-line leading-relaxed">{selectedReviewPaper.abstract}</p>
                      </div>

                      <div className="space-y-1">
                        <h5 className="font-bold text-[10px] text-slate-600 uppercase tracking-wide">Full Manuscript Text</h5>
                        <div className="text-xs text-slate-800 leading-relaxed font-sans bg-white border border-slate-100 rounded-lg p-4 max-h-60 overflow-y-auto whitespace-pre-line">
                          {selectedReviewPaper.contentBody}
                        </div>
                      </div>

                      {selectedReviewPaper.pdfLink && (
                        <div className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          <ExternalLink className="w-3.5 h-3.5" />
                          <a href={selectedReviewPaper.pdfLink} target="_blank" rel="noopener noreferrer" className="font-bold">View attached PDF Document</a>
                        </div>
                      )}

                      <div className="pt-4 border-t border-slate-100 space-y-3">
                        <h5 className="font-bold text-[10px] text-slate-600 uppercase tracking-wide">Board Evaluation Feedback</h5>
                        <textarea
                          rows={3}
                          value={reviewFeedback}
                          onChange={(e) => setReviewFeedback(e.target.value)}
                          placeholder="Provide scholarly feedback, required corrections, or approvals notes here..."
                          className="w-full text-xs p-3 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white"
                        />

                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            disabled={isReviewSubmitting}
                            onClick={() => handleReviewPaper('needs_revision')}
                            className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-100 text-xs font-bold rounded-lg transition-colors"
                          >
                            Request Revisions
                          </button>
                          <button
                            type="button"
                            disabled={isReviewSubmitting}
                            onClick={() => handleReviewPaper('approved')}
                            className="px-4 py-2 bg-[#064e3b] text-white hover:bg-emerald-900 text-xs font-bold rounded-lg transition-colors shadow-sm"
                          >
                            Approve & Publish Live
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 font-serif">Online Video Lectures Management</h3>
                  <p className="text-xs text-slate-500">Add course videos, set order of lessons, and configure online curriculum for student portals.</p>
                </div>
                <button 
                  onClick={() => setShowVideoForm(!showVideoForm)}
                  className="px-3 py-1.5 bg-[#064e3b] text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-emerald-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {showVideoForm ? 'Hide Form' : 'Publish Lecture'}
                </button>
              </div>

              {showVideoForm && (
                <form onSubmit={handleCreateVideo} className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Lecture / Lesson Title</label>
                    <input 
                      type="text" 
                      required 
                      value={videoTitle} 
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="e.g. Arabic Grammar - Lesson 1: Introduction"
                      className="w-full text-xs bg-white border border-slate-200 rounded px-3 py-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Lesson Order / Sequence</label>
                    <input 
                      type="number" 
                      required 
                      min="1"
                      value={videoOrder} 
                      onChange={(e) => setVideoOrder(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded px-3 py-2"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">YouTube Lecture Link / Video URL</label>
                    <input 
                      type="url" 
                      required 
                      value={videoUrl} 
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      className="w-full text-xs bg-white border border-slate-200 rounded px-3 py-2"
                    />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 uppercase">Detailed Description & References</label>
                    <textarea 
                      rows={3}
                      value={videoDesc} 
                      onChange={(e) => setVideoDesc(e.target.value)}
                      placeholder="Enter supplementary study notes, chapter markings, or assignment references..."
                      className="w-full text-xs bg-white border border-slate-200 rounded px-3 py-2"
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button 
                      type="button" 
                      onClick={() => setShowVideoForm(false)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded text-xs hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={isAddingVideo}
                      className="px-4 py-1.5 bg-[#064e3b] text-white rounded text-xs font-bold hover:bg-emerald-800"
                    >
                      {isAddingVideo ? 'Publishing...' : 'Publish Video Lecture'}
                    </button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-3 w-16">Seq</th>
                      <th className="p-3">Lecture Title</th>
                      <th className="p-3">Streaming Source</th>
                      <th className="p-3">Description Summary</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {courseVideos.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400">No dynamic video classes uploaded for this course yet.</td>
                      </tr>
                    ) : (
                      courseVideos.map(vid => (
                        <tr key={vid.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-[#064e3b]">#{vid.lessonOrder || 1}</td>
                          <td className="p-3 font-semibold text-slate-900">{vid.title}</td>
                          <td className="p-3 text-slate-500 truncate max-w-xs">
                            <a href={vid.videoUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline flex items-center gap-1">
                              <ExternalLink className="w-3.5 h-3.5" /> Watch on YouTube
                            </a>
                          </td>
                          <td className="p-3 text-slate-500 truncate max-w-sm">{vid.description || 'N/A'}</td>
                          <td className="p-3 text-right">
                            <button 
                              onClick={() => handleDeleteItem('course_videos', vid.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
