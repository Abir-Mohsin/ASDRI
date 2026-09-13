'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  BookOpen, Calendar, Users, TrendingUp, AlertCircle, ShieldCheck, 
  Search, Plus, CreditCard, CheckCircle, MessageSquare, Book, FileText, ArrowRight
} from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { 
  collection, query, where, getDocs, setDoc, doc, addDoc, updateDoc, getDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Trilingual dictionaries
const t = {
  en: {
    welcome: "Welcome, Guardian",
    subWelcome: "Guardian Portal overview and student monitoring",
    linkTitle: "Connect Your Child's Account",
    linkDesc: "Enter your child's Unique ID or Email Address to link their academic and fee profile to your dashboard.",
    linkPlaceholder: "Enter Student UID or Email...",
    linkButton: "Link Student Account",
    linking: "Linking student...",
    successLink: "Masha-Allah! Student account linked successfully.",
    errorStudentNotFound: "No student was found with that ID or Email. Please make sure the ID is correct and they are registered as a student.",
    linkedStudentsTitle: "My Children / Enrolled Students",
    noLinkedStudents: "No students are currently linked to your guardian account. Please connect your child above.",
    academicOverview: "Academic Overview",
    academicProgress: "Academic Progress",
    teacherComments: "Teacher Comments & Remarks",
    feeUpdates: "Fee Payment Updates",
    attendanceRate: "Attendance Rate",
    completedAssignments: "Completed Assignments",
    averageScore: "Average Marks / Score",
    pendingFees: "Pending Fees",
    noEnrollments: "Your child is not enrolled in any courses yet.",
    course: "Course",
    grade: "Grade",
    score: "Score",
    remarks: "Remarks",
    examType: "Assessment / Exam",
    date: "Date",
    attendanceLog: "Attendance Log",
    present: "Present",
    absent: "Absent",
    late: "Late",
    excused: "Excused",
    noticesTitle: "Institute Notices",
    parentTeacherNotice: "Upcoming Parent-Teacher Meeting",
    parentTeacherNoticeDesc: "Scheduled for next Friday. Teachers will review child progress with guardians.",
    recentComments: "Recent Comments from Teachers",
    noComments: "No teacher comments available yet.",
    assignment: "Assignment",
    feedback: "Feedback",
    invoiceId: "Invoice ID",
    feeType: "Fee Type",
    amount: "Amount",
    dueDate: "Due Date",
    status: "Status",
    action: "Action",
    payNow: "Pay Securely",
    paying: "Processing...",
    seedFees: "Seed Demo Fees & Logs",
    seedFeesDesc: "Click to generate demo academic marks, attendance, and fee updates for testing.",
    noFees: "No fee updates or invoices recorded for this student.",
    bdt: "BDT",
    viewDetails: "View Details",
    statusPaid: "PAID",
    statusUnpaid: "UNPAID",
    successPayment: "Alhamdulillah! Payment completed successfully."
  },
  bn: {
    welcome: "স্বাগতম, অভিভাবক",
    subWelcome: "অভিভাবক পোর্টাল ওভারভিউ এবং শিক্ষার্থীর একাডেমিক তদারকি",
    linkTitle: "সন্তানের অ্যাকাউন্ট সংযুক্ত করুন",
    linkDesc: "আপনার সন্তানের ইউনিক আইডি বা ইমেল ঠিকানা লিখুন যাতে তাদের একাডেমিক ও ফি প্রদানের প্রোফাইল আপনার ড্যাশবোর্ডে সংযুক্ত করা যায়।",
    linkPlaceholder: "শিক্ষার্থীর ইউনিক আইডি বা ইমেল...",
    linkButton: "শিক্ষার্থীর অ্যাকাউন্ট সংযুক্ত করুন",
    linking: "সংযুক্ত করা হচ্ছে...",
    successLink: "মাশা-আল্লাহ! শিক্ষার্থীর অ্যাকাউন্ট সফলভাবে সংযুক্ত হয়েছে।",
    errorStudentNotFound: "এই আইডি বা ইমেল দিয়ে কোনো শিক্ষার্থী পাওয়া যায়নি। অনুগ্রহ করে নিশ্চিত করুন যে আইডিটি সঠিক এবং তারা শিক্ষার্থী হিসেবে নিবন্ধিত রয়েছে।",
    linkedStudentsTitle: "আমার সন্তানগণ / অধ্যয়নরত শিক্ষার্থী",
    noLinkedStudents: "বর্তমানে আপনার অভিভাবক অ্যাকাউন্টের সাথে কোনো শিক্ষার্থী সংযুক্ত নেই। অনুগ্রহ করে উপরে আপনার সন্তানকে সংযুক্ত করুন।",
    academicOverview: "একাডেমিক ওভারভিউ",
    academicProgress: "একাডেমিক প্রগতি",
    teacherComments: "শিক্ষকের মন্তব্য ও ফিডব্যাক",
    feeUpdates: "ফি প্রদানের আপডেট",
    attendanceRate: "উপস্থিতির হার",
    completedAssignments: "সম্পন্ন অ্যাসাইনমেন্ট",
    averageScore: "গড় নম্বর / স্কোর",
    pendingFees: "বকেয়া ফি",
    noEnrollments: "আপনার সন্তান এখনো কোনো কোর্সে ভর্তি হয়নি।",
    course: "কোর্স",
    grade: "গ্রেড",
    score: "প্রাপ্ত নম্বর",
    remarks: "মন্তব্য",
    examType: "মূল্যায়ন / পরীক্ষা",
    date: "তারিখ",
    attendanceLog: "উপস্থিতি লগ",
    present: "উপস্থিত",
    absent: "অনুপস্থিত",
    late: "দেরি",
    excused: "ছুটি",
    noticesTitle: "ইনস্টিটিউটের নোটিশ",
    parentTeacherNotice: "আসন্ন অভিভাবক-শিক্ষক সভা",
    parentTeacherNoticeDesc: "আগামী শুক্রবারের জন্য নির্ধারিত। শিক্ষকরা অভিভাবকদের সাথে সন্তানের অগ্রগতি অগ্রগতি পর্যালোচনা করবেন।",
    recentComments: "শিক্ষকদের সাম্প্রতিক মন্তব্য",
    noComments: "এখনো কোনো শিক্ষকের মন্তব্য উপলব্ধ নেই।",
    assignment: "অ্যাসাইনমেন্ট",
    feedback: "ফিডব্যাক",
    invoiceId: "ইনভয়েস আইডি",
    feeType: "ফি-এর ধরন",
    amount: "পরিমাণ",
    dueDate: "পরিশোধের শেষ তারিখ",
    status: "অবস্থা",
    action: "পদক্ষেপ",
    payNow: "সুরক্ষিত পেমেন্ট করুন",
    paying: "প্রক্রিয়াধীন...",
    seedFees: "পরীক্ষামূলক ফি ও লগ তৈরি করুন",
    seedFeesDesc: "টেস্ট করার জন্য পরীক্ষামূলক একাডেমিক নম্বর, উপস্থিতি এবং ফি তথ্য তৈরি করতে এখানে ক্লিক করুন।",
    noFees: "এই শিক্ষার্থীর জন্য কোনো ফি বা ইনভয়েস রেকর্ড নেই।",
    bdt: "টাকা",
    viewDetails: "বিস্তারিত দেখুন",
    statusPaid: "পরিশোধিত",
    statusUnpaid: "অপরিশোধিত",
    successPayment: "আলহামদুলিল্লাহ! পেমেন্ট সফলভাবে সম্পন্ন হয়েছে।"
  },
  ar: {
    welcome: "مرحباً، ولي الأمر",
    subWelcome: "نظرة عامة على بوابة ولي الأمر ومتابعة الطلاب",
    linkTitle: "ربط حساب الطالب (ابنكم/ابنتكم)",
    linkDesc: "أدخل المعرف الفريد للطالب أو عنوان بريده الإلكتروني لربط ملفه الأكاديمي والمالي بلوحة التحكم الخاصة بك.",
    linkPlaceholder: "أدخل معرف الطالب أو البريد الإلكتروني...",
    linkButton: "ربط حساب الطالب",
    linking: "جاري الربط...",
    successLink: "ما شاء الله! تم ربط حساب الطالب بنجاح.",
    errorStudentNotFound: "لم يتم العثور على أي طالب بهذا المعرف أو البريد الإلكتروني. يرجى التأكد من صحة البيانات وأنه مسجل كطالب.",
    linkedStudentsTitle: "أبنائي / الطلاب المسجلون",
    noLinkedStudents: "لا يوجد طلاب مرتبطون بحساب ولي الأمر حالياً. يرجى ربط حساب ابنك أعلاه.",
    academicOverview: "الملخص الأكاديمي",
    academicProgress: "التقدم الأكاديمي",
    teacherComments: "ملاحظات وتعليقات المعلمين",
    feeUpdates: "تحديثات دفع الرسوم",
    attendanceRate: "نسبة الحضور",
    completedAssignments: "الواجبات المكتملة",
    averageScore: "متوسط الدرجات",
    pendingFees: "الرسوم المستحقة",
    noEnrollments: "ابنكم غير مسجل في أي دورة تدريبية حتى الآن.",
    course: "المادة / الدورة",
    grade: "التقدير",
    score: "الدرجة",
    remarks: "الملاحظات",
    examType: "التقييم / الامتحان",
    date: "التاريخ",
    attendanceLog: "سجل الحضور",
    present: "حاضر",
    absent: "غائب",
    late: "متأخر",
    excused: "مستأذن",
    noticesTitle: "إعلانات المعهد",
    parentTeacherNotice: "اجتماع أولياء الأمور والمعلمين القادم",
    parentTeacherNoticeDesc: "مقرر يوم الجمعة القادم. سيقوم المعلمون بمراجعة تقدم الطلاب مع أولياء أمورهم.",
    recentComments: "التعليقات الأخيرة من المعلمين",
    noComments: "لا توجد تعليقات من المعلمين حالياً.",
    assignment: "الواجب",
    feedback: "التقييم والملاحظات",
    invoiceId: "رقم الفاتورة",
    feeType: "نوع الرسوم",
    amount: "المبلغ",
    dueDate: "تاريخ الاستحقاق",
    status: "الحالة",
    action: "الإجراء",
    payNow: "دفع آمن",
    paying: "جاري المعالجة...",
    seedFees: "توليد بيانات تجريبية ورسوم",
    seedFeesDesc: "انقر لتوليد علامات أكاديمية وحضور ورسوم تجريبية للاختبار.",
    noFees: "لا توجد رسوم أو فواتير مسجلة لهذا الطالب.",
    bdt: "تَكَا",
    viewDetails: "عرض التفاصيل",
    statusPaid: "مقبول",
    statusUnpaid: "غير مدفوع",
    successPayment: "الحمد لله! تم الدفع بنجاح."
  }
};

type Language = 'en' | 'bn' | 'ar';

export function GuardianDashboard() {
  const { user } = useAuthStore();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = ((params?.locale as string) || 'en') as Language;
  const paramTab = searchParams?.get('tab');
  
  // Translation selector helper
  const dict = t[locale] || t.en;

  // States
  const [linkedStudents, setLinkedStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [linkInput, setLinkInput] = useState<string>('');
  const [isLinking, setIsLinking] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Tab State
  const [localTab, setLocalTab] = useState<'overview' | 'progress' | 'comments' | 'fees'>('overview');
  const activeTab = (paramTab as any) || localTab;
  const setActiveTab = (tab: any) => setLocalTab(tab);

  // Selected Student Detailed Data State
  const [studentDetails, setStudentDetails] = useState<any | null>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [isPayingId, setIsPayingId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  // Load Linked Students on startup
  useEffect(() => {
    if (!user) return;
    
    const fetchLinkedStudents = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, 'guardian_links'), 
          where('guardianId', '==', user.uid)
        );
        const snap = await getDocs(q);
        const studentsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setLinkedStudents(studentsList);
        
        if (studentsList.length > 0) {
          setSelectedStudentId(studentsList[0].studentId);
        }
      } catch (err) {
        console.error("Error loading linked students:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkedStudents();
  }, [user]);

  // Load Selected Student detailed data when student selection changes
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!selectedStudentId) {
        setStudentDetails(null);
        setEnrollments([]);
        setAttendance([]);
        setMarks([]);
        setSubmissions([]);
        setFees([]);
        return;
      }
      try {
        // 1. Fetch Student profile to verify name/email
        const studentDoc = await getDoc(doc(db, 'users', selectedStudentId));
        if (studentDoc.exists()) {
          setStudentDetails({ id: studentDoc.id, ...studentDoc.data() });
        }

        // 2. Fetch Enrollments
        const enrollQ = query(collection(db, 'enrollments'), where('userId', '==', selectedStudentId));
        const enrollSnap = await getDocs(enrollQ);
        setEnrollments(enrollSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // 3. Fetch Attendance
        const attQ = query(collection(db, 'attendance'), where('studentId', '==', selectedStudentId));
        const attSnap = await getDocs(attQ);
        setAttendance(attSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // 4. Fetch Marks
        const marksQ = query(collection(db, 'marks'), where('studentId', '==', selectedStudentId));
        const marksSnap = await getDocs(marksQ);
        setMarks(marksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // 5. Fetch Submissions
        const subQ = query(collection(db, 'submissions'), where('studentId', '==', selectedStudentId));
        const subSnap = await getDocs(subQ);
        setSubmissions(subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // 6. Fetch Fees
        const feesQ = query(collection(db, 'fees'), where('studentId', '==', selectedStudentId));
        const feesSnap = await getDocs(feesQ);
        setFees(feesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (err) {
        console.error("Error fetching detailed student data:", err);
      }
    };

    const timer = setTimeout(() => {
      fetchStudentData();
    }, 0);

    return () => clearTimeout(timer);
  }, [selectedStudentId]);

  // Handle Linking Student
  const handleLinkStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInput.trim() || !user) return;

    setIsLinking(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Find student in 'users' collection with role === 'student'
      // Try by UID first, then by Email
      let targetStudentId = '';
      let targetStudentName = '';
      let targetStudentEmail = '';

      // Check if input is a UID
      const userRef = doc(db, 'users', linkInput.trim());
      const userDoc = await getDoc(userRef);

      if (userDoc.exists() && userDoc.data().role === 'student') {
        targetStudentId = userDoc.id;
        targetStudentName = userDoc.data().name || 'Student';
        targetStudentEmail = userDoc.data().email || '';
      } else {
        // Query by email
        const q = query(
          collection(db, 'users'), 
          where('email', '==', linkInput.trim()),
          where('role', '==', 'student')
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const matched = snap.docs[0];
          targetStudentId = matched.id;
          targetStudentName = matched.data().name || 'Student';
          targetStudentEmail = matched.data().email || '';
        }
      }

      if (!targetStudentId) {
        setErrorMsg(dict.errorStudentNotFound);
        setIsLinking(false);
        return;
      }

      // Check if already linked
      const linkId = `${user.uid}_${targetStudentId}`;
      const linkCheck = await getDoc(doc(db, 'guardian_links', linkId));
      if (linkCheck.exists()) {
        setSuccessMsg(dict.successLink);
        setLinkInput('');
        setIsLinking(false);
        return;
      }

      // Create new link
      await setDoc(doc(db, 'guardian_links', linkId), {
        guardianId: user.uid,
        guardianEmail: user.email,
        studentId: targetStudentId,
        studentName: targetStudentName,
        studentEmail: targetStudentEmail,
        linkedAt: new Date().toISOString()
      });

      setSuccessMsg(dict.successLink);
      setLinkInput('');

      // Reload linked students
      const q = query(
        collection(db, 'guardian_links'), 
        where('guardianId', '==', user.uid)
      );
      const snap = await getDocs(q);
      const studentsList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setLinkedStudents(studentsList);
      setSelectedStudentId(targetStudentId);

    } catch (err: any) {
      console.error("Error linking student:", err);
      setErrorMsg(err.message || "Failed to link student account.");
    } finally {
      setIsLinking(false);
    }
  };

  // Pay Fee Securely (Firestore updates)
  const handlePayFee = async (feeId: string, amount: number) => {
    setIsPayingId(feeId);
    try {
      await updateDoc(doc(db, 'fees', feeId), {
        status: 'paid',
        paidAt: new Date().toISOString()
      });
      alert(dict.successPayment + ` [${amount} ${dict.bdt}]`);
      
      // Refresh fees
      const feesQ = query(collection(db, 'fees'), where('studentId', '==', selectedStudentId));
      const feesSnap = await getDocs(feesQ);
      setFees(feesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error paying fee:", err);
    } finally {
      setIsPayingId(null);
    }
  };

  // Seed Demo Data for Selected Student
  const handleSeedDemoData = async () => {
    if (!selectedStudentId || !studentDetails) return;
    setIsSeeding(true);
    try {
      const studentName = studentDetails.name || 'Student';
      
      // 1. Seed enrollment
      const enrollId = `enroll_demo_${selectedStudentId}`;
      await setDoc(doc(db, 'enrollments', enrollId), {
        userId: selectedStudentId,
        courseId: 'pys',
        courseTitle: 'Principles of Al-Shafi\'i Jurisprudence (Usul al-Fiqh)',
        enrolledAt: new Date().toISOString()
      });

      // 2. Seed Marks
      const mark1Id = `marks_demo1_${selectedStudentId}`;
      await setDoc(doc(db, 'marks', mark1Id), {
        studentId: selectedStudentId,
        courseId: 'pys',
        examType: 'Midterm Examination',
        score: 87,
        maxScore: 100,
        grade: 'A',
        remarks: 'Excellent dedication to understanding classical legal jurisprudence. Ma-Sha-Allah!',
        recordedBy: 'teacher_demo',
        recordedAt: new Date().toISOString()
      });

      const mark2Id = `marks_demo2_${selectedStudentId}`;
      await setDoc(doc(db, 'marks', mark2Id), {
        studentId: selectedStudentId,
        courseId: 'pys',
        examType: 'Final Research Draft',
        score: 92,
        maxScore: 100,
        grade: 'A+',
        remarks: 'In-depth methodology exploration. Demonstrates maturity in legal deduction.',
        recordedBy: 'teacher_demo',
        recordedAt: new Date().toISOString()
      });

      // 3. Seed Attendance
      const attDates = [
        { date: '2026-07-25', status: 'present' },
        { date: '2026-07-26', status: 'present' },
        { date: '2026-07-27', status: 'late' },
        { date: '2026-07-28', status: 'present' },
        { date: '2026-07-29', status: 'absent' }
      ];

      for (const item of attDates) {
        const attId = `att_demo_${selectedStudentId}_${item.date}`;
        await setDoc(doc(db, 'attendance', attId), {
          courseId: 'pys',
          date: item.date,
          studentId: selectedStudentId,
          studentName: studentName,
          status: item.status,
          recordedBy: 'teacher_demo',
          recordedAt: new Date().toISOString()
        });
      }

      // 4. Seed Submissions (Feedback)
      const subId = `sub_demo_${selectedStudentId}`;
      await setDoc(doc(db, 'submissions', subId), {
        assignmentId: 'assign_demo',
        courseId: 'pys',
        studentId: selectedStudentId,
        studentName: studentName,
        studentEmail: studentDetails.email || '',
        submissionText: 'I have researched the secondary proofs (Istihsan & Maslahah Mursalah) in classical Usul texts...',
        submittedAt: new Date().toISOString(),
        status: 'graded',
        grade: 95,
        feedback: 'Excellent synthesis. You have captured the differences between Shafi\'i and Maliki schools beautifully. Keep up the high effort!'
      });

      // 5. Seed Fees
      const fee1Id = `fee_demo1_${selectedStudentId}`;
      await setDoc(doc(db, 'fees', fee1Id), {
        invoiceId: 'INV-2026-001',
        feeType: 'Tuition Fee (Semester 1)',
        amount: 15000,
        dueDate: '2026-08-15',
        status: 'unpaid',
        paidAt: null,
        studentId: selectedStudentId,
        studentName: studentName
      });

      const fee2Id = `fee_demo2_${selectedStudentId}`;
      await setDoc(doc(db, 'fees', fee2Id), {
        invoiceId: 'INV-2026-002',
        feeType: 'Library Print Service Deposit',
        amount: 2500,
        dueDate: '2026-08-20',
        status: 'paid',
        paidAt: new Date().toISOString(),
        studentId: selectedStudentId,
        studentName: studentName
      });

      // Refresh Data
      const enrollSnap = await getDocs(query(collection(db, 'enrollments'), where('userId', '==', selectedStudentId)));
      setEnrollments(enrollSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const attSnap = await getDocs(query(collection(db, 'attendance'), where('studentId', '==', selectedStudentId)));
      setAttendance(attSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const marksSnap = await getDocs(query(collection(db, 'marks'), where('studentId', '==', selectedStudentId)));
      setMarks(marksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const subSnap = await getDocs(query(collection(db, 'submissions'), where('studentId', '==', selectedStudentId)));
      setSubmissions(subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const feesSnap = await getDocs(query(collection(db, 'fees'), where('studentId', '==', selectedStudentId)));
      setFees(feesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      alert("Masha-Allah! Demo academic logs, attendance logs, and student fees seeded successfully!");
    } catch (err) {
      console.error("Error seeding student demo data:", err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Compute stats for selected student
  const attendanceRate = attendance.length > 0 
    ? Math.round((attendance.filter(a => a.status === 'present' || a.status === 'late').length / attendance.length) * 100) 
    : 100;

  const dueFeesAmount = fees
    .filter(f => f.status === 'unpaid')
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  const completedAssignmentsCount = submissions.length;

  const averageScoreValue = marks.length > 0
    ? Math.round(marks.reduce((sum, m) => sum + (m.score || 0), 0) / marks.length)
    : 0;

  const selectedChildName = studentDetails?.name || linkedStudents.find(s => s.studentId === selectedStudentId)?.studentName || 'Student';

  return (
    <div className="space-y-6" dir="ltr">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs font-bold text-slate-500">Guardian Portal</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shadow-2xs">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Firebase Secure Sync Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
              Guardian Dashboard Overview
            </h1>
          </div>

          <div className="text-xs font-bold text-slate-500 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 font-mono">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* DUAL GRID: LINK STUDENT FORM AND ENROLLED CHILDREN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LINK CHILD FORM (STEP 2.4 MAIN) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 font-serif">
              <Users className="w-5 h-5 text-[#064e3b]" />
              {dict.linkTitle}
            </h3>
            <p className="text-slate-500 text-[11px] mt-1">{dict.linkDesc}</p>
          </div>

          <form onSubmit={handleLinkStudent} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                required
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder={dict.linkPlaceholder}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={isLinking}
              className="px-5 py-2.5 bg-[#064e3b] hover:bg-emerald-800 disabled:bg-slate-200 text-white text-xs font-bold rounded-lg transition-colors shadow-sm shrink-0 flex items-center justify-center gap-2"
            >
              {isLinking ? dict.linking : dict.linkButton}
            </button>
          </form>

          {errorMsg && (
            <p className="text-red-600 text-[11px] font-medium bg-red-50 p-2.5 rounded border border-red-100 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              {errorMsg}
            </p>
          )}

          {successMsg && (
            <p className="text-emerald-700 text-[11px] font-medium bg-emerald-50 p-2.5 rounded border border-emerald-100 flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              {successMsg}
            </p>
          )}
        </div>

        {/* CURRENTLY LINKED CHILDREN LIST */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">{dict.linkedStudentsTitle}</h3>
            <p className="text-[10px] text-slate-400">Select child profile to view progress and fees updates.</p>
          </div>

          <div className="space-y-2 flex-1 max-h-[140px] overflow-y-auto pr-1 my-2">
            {linkedStudents.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs italic">
                {dict.noLinkedStudents}
              </div>
            ) : (
              linkedStudents.map((stud) => (
                <button
                  key={stud.studentId}
                  onClick={() => setSelectedStudentId(stud.studentId)}
                  className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                    selectedStudentId === stud.studentId 
                      ? 'border-[#064e3b] bg-emerald-50/30' 
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs text-slate-900">{stud.studentName}</p>
                    <p className="text-[10px] text-slate-400">{stud.studentEmail}</p>
                  </div>
                  <ArrowRight className={`w-4 h-4 text-slate-400 transition-transform ${
                    selectedStudentId === stud.studentId ? 'translate-x-1 text-[#064e3b]' : ''
                  }`} />
                </button>
              ))
            )}
          </div>
        </div>

      </div>

      {selectedStudentId && (
        <div className="space-y-6">
          
          {/* STATS OVERVIEW SECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Stat 1: Attendance Rate */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-1">{dict.attendanceRate}</p>
                <h3 className="text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
                  {attendanceRate}%
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('attendance')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-700 transition-colors mt-6 pt-3 border-t border-slate-50 text-left"
              >
                <span>View Attendance Log →</span>
              </button>
            </div>

            {/* Stat 2: Completed Assignments */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-1">{dict.completedAssignments}</p>
                <h3 className="text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
                  {completedAssignmentsCount}
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('progress')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-700 transition-colors mt-6 pt-3 border-t border-slate-50 text-left"
              >
                <span>Submissions & Feedback →</span>
              </button>
            </div>

            {/* Stat 3: Average Exam marks */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-1">{dict.averageScore}</p>
                <h3 className="text-3xl font-extrabold text-amber-700 font-serif tracking-tight">
                  {averageScoreValue}%
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('progress')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-700 transition-colors mt-6 pt-3 border-t border-slate-50 text-left"
              >
                <span>Exam Scores & Grade Sheet →</span>
              </button>
            </div>

            {/* Stat 4: Unpaid due fees */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-1">{dict.pendingFees}</p>
                <h3 className="text-3xl font-extrabold text-amber-700 font-serif tracking-tight">
                  {dueFeesAmount} {dict.bdt}
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('fees')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-700 transition-colors mt-6 pt-3 border-t border-slate-50 text-left"
              >
                <span>Pay Pending Fees →</span>
              </button>
            </div>

          </div>

          {/* ACTIVE STUDENT DATA */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">

            <div className="p-6">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                  
                  {/* Left Main Overview Column */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-xs text-[#064e3b] uppercase">Currently Monitored Student</h4>
                        <p className="text-base font-bold text-slate-900 mt-1">{selectedChildName}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">UID: {selectedStudentId}</p>
                      </div>
                      
                      {/* Seed button to generate mock academic progress / fees if empty */}
                      {enrollments.length === 0 && (
                        <div className="space-y-1 text-right max-w-xs">
                          <p className="text-[10px] text-slate-500 leading-normal">{dict.seedFeesDesc}</p>
                          <button
                            onClick={handleSeedDemoData}
                            disabled={isSeeding}
                            className="px-3.5 py-1.5 bg-[#064e3b] hover:bg-emerald-800 disabled:bg-slate-200 text-white font-bold text-[10px] rounded transition-colors"
                          >
                            {isSeeding ? 'Generating...' : dict.seedFees}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Course Enrollments</h4>
                      {enrollments.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-100">
                          <Book className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs text-slate-400 italic">{dict.noEnrollments}</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {enrollments.map(en => (
                            <div key={en.id} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm space-y-2">
                              <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border border-emerald-100">
                                Active Program
                              </span>
                              <h5 className="font-bold text-xs text-slate-900">{en.courseTitle || en.courseId}</h5>
                              <p className="text-[10px] text-slate-500">Enrolled on: {en.enrolledAt ? new Date(en.enrolledAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Sidebar Notice Column */}
                  <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 space-y-4">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-[#064e3b]" />
                        {dict.noticesTitle}
                      </h4>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3.5 bg-white border border-slate-100 rounded-lg space-y-1">
                        <h5 className="font-bold text-xs text-emerald-900">{dict.parentTeacherNotice}</h5>
                        <p className="text-[10px] text-slate-600 leading-relaxed">{dict.parentTeacherNoticeDesc}</p>
                      </div>

                      <div className="p-3.5 bg-white border border-slate-100 rounded-lg space-y-1">
                        <h5 className="font-bold text-xs text-slate-900">Quranic Recitation Seminar</h5>
                        <p className="text-[10px] text-slate-600 leading-relaxed">Classical Tajweed seminar scheduled for this Thursday morning at Assembly Hall.</p>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: ACADEMIC PROGRESS & ATTENDANCE */}
              {activeTab === 'progress' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                  
                  {/* Exam Marks / Progress Column */}
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">{dict.academicProgress}</h4>
                    
                    {marks.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-lg border border-slate-100">
                        <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-400 italic">No academic assessment marks have been posted for your child yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {marks.map((m) => (
                          <div key={m.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center gap-4">
                            <div className="space-y-1">
                              <span className="text-[9px] bg-emerald-100 text-[#064e3b] font-bold px-2 py-0.5 rounded-full uppercase">
                                {m.examType}
                              </span>
                              <h5 className="font-bold text-xs text-slate-900">{m.courseId === 'pys' ? 'Principles of Al-Shafi\'i Jurisprudence' : m.courseId}</h5>
                              <p className="text-[10px] text-slate-500">Remarks: <span className="font-semibold text-slate-700">{m.remarks || 'No remarks written.'}</span></p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-lg font-bold text-[#064e3b]">{m.score} / {m.maxScore}</p>
                              <p className="text-[10px] text-amber-700 font-bold uppercase">Grade {m.grade || 'A'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Attendance Log Column */}
                  <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 space-y-4">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#064e3b]" />
                        {dict.attendanceLog}
                      </h4>
                    </div>

                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {attendance.length === 0 ? (
                        <p className="text-xs text-slate-400 italic text-center py-6">No attendance records found.</p>
                      ) : (
                        attendance.map((att) => (
                          <div key={att.id} className="p-2.5 bg-white rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                            <span className="text-slate-700 font-semibold">{att.date}</span>
                            <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                              att.status === 'present' ? 'bg-emerald-100 text-emerald-800'
                                : att.status === 'absent' ? 'bg-red-100 text-red-800'
                                : att.status === 'late' ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {att.status === 'present' ? dict.present
                                : att.status === 'absent' ? dict.absent
                                : att.status === 'late' ? dict.late
                                : dict.excused
                              }
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: TEACHER COMMENTS & FEEDBACK */}
              {activeTab === 'comments' && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">{dict.recentComments}</h4>
                  
                  {submissions.filter(s => s.feedback).length === 0 && marks.filter(m => m.remarks).length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-400 italic">{dict.noComments}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Submissions feedback */}
                      {submissions.filter(s => s.feedback).map((sub) => (
                        <div key={sub.id} className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm space-y-3">
                          <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2.5">
                            <div>
                              <span className="text-[9px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded-full uppercase">
                                Assignment Feedback
                              </span>
                              <h5 className="font-bold text-xs text-slate-900 mt-1">{sub.assignmentTitle || dict.assignment}</h5>
                            </div>
                            {sub.grade !== null && (
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 block font-semibold">Grade</span>
                                <span className="font-bold text-xs text-[#064e3b]">{sub.grade}%</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-[11px] text-slate-700 font-medium italic leading-relaxed">
                              &quot;{sub.feedback}&quot;
                            </p>
                          </div>
                          <p className="text-[9px] text-slate-400 text-right">Graded on: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      ))}

                      {/* Marks remarks */}
                      {marks.filter(m => m.remarks).map((mark) => (
                        <div key={mark.id} className="p-5 bg-white border border-slate-100 rounded-xl shadow-sm space-y-3">
                          <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2.5">
                            <div>
                              <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                                Exam & Mark Remarks
                              </span>
                              <h5 className="font-bold text-xs text-slate-900 mt-1">{mark.examType}</h5>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block font-semibold">{dict.score}</span>
                              <span className="font-bold text-xs text-amber-700">{mark.score}/{mark.maxScore}</span>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-[11px] text-slate-700 font-medium italic leading-relaxed">
                              &quot;{mark.remarks}&quot;
                            </p>
                          </div>
                          <p className="text-[9px] text-slate-400 text-right">Recorded: {mark.recordedAt ? new Date(mark.recordedAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: FEES & PAYMENT UPDATES */}
              {activeTab === 'fees' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">{dict.feeUpdates}</h4>
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded">
                      Total Pending: {dueFeesAmount} {dict.bdt}
                    </span>
                  </div>

                  {fees.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-lg border border-slate-100">
                      <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-400 italic">{dict.noFees}</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600 border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-bold bg-slate-50/50">
                            <th className="p-3 font-semibold">{dict.invoiceId}</th>
                            <th className="p-3 font-semibold">{dict.feeType}</th>
                            <th className="p-3 font-semibold">{dict.amount}</th>
                            <th className="p-3 font-semibold">{dict.dueDate}</th>
                            <th className="p-3 font-semibold">{dict.status}</th>
                            <th className="p-3 font-semibold text-center">{dict.action}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fees.map((f) => (
                            <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                              <td className="p-3 font-semibold text-slate-900">{f.invoiceId}</td>
                              <td className="p-3">{f.feeType}</td>
                              <td className="p-3 font-bold text-slate-900">{f.amount} {dict.bdt}</td>
                              <td className="p-3 text-slate-500">{f.dueDate}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  f.status === 'paid' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-red-100 text-red-800 animate-pulse'
                                }`}>
                                  {f.status === 'paid' ? dict.statusPaid : dict.statusUnpaid}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                {f.status === 'paid' ? (
                                  <span className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                    {f.paidAt ? new Date(f.paidAt).toLocaleDateString() : ''}
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handlePayFee(f.id, f.amount)}
                                    disabled={isPayingId === f.id}
                                    className="px-3 py-1.5 bg-[#064e3b] hover:bg-emerald-800 disabled:bg-slate-200 text-white font-bold text-[10px] rounded shadow-sm transition-colors"
                                  >
                                    {isPayingId === f.id ? dict.paying : dict.payNow}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      )}
    </div>
  );
}
