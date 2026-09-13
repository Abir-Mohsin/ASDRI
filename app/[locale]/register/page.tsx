'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { Lock, Mail, User as UserIcon } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('applicant');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getFriendlyErrorMessage = (err: any, loc: string) => {
    const code = err?.code || '';
    const message = err?.message || '';

    if (code === 'auth/email-already-in-use' || message.includes('email-already-in-use')) {
      if (loc === 'bn') {
        return 'এই ইমেইল ঠিকানাটি ইতিমধ্যে ASDRI প্ল্যাটফর্মে নিবন্ধিত রয়েছে। আপনি কি পূর্বে অ্যাকাউন্ট তৈরি করেছিলেন বা গুগলের (Google) মাধ্যমে লগইন করেছিলেন? অনুগ্রহ করে নিচের লিঙ্কে ক্লিক করে সরাসরি লগইন করুন।';
      }
      if (loc === 'ar') {
        return 'عنوان البريد الإلكتروني هذا مسجل بالفعل في منصة ASDRI. هل قمت بالتسجيل مسبقاً أو سجلت الدخول عبر Google؟ يرجى النقر على الرابط أدناه لتسجيل الدخول.';
      }
      return 'This email address is already registered on the ASDRI platform. Did you previously sign up or log in using Google? Please click the link below to sign in.';
    }

    if (code === 'auth/weak-password' || message.includes('weak-password')) {
      if (loc === 'bn') {
        return 'পাসওয়ার্ডটি অত্যন্ত দুর্বল। পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।';
      }
      if (loc === 'ar') {
        return 'كلمة المرور ضعيفة جداً. يجب أن تتكون من 6 أحرف على الأقل.';
      }
      return 'The password is too weak. It must be at least 6 characters.';
    }

    if (code === 'auth/invalid-email' || message.includes('invalid-email')) {
      if (loc === 'bn') {
        return 'ইমেইল ঠিকানাটি সঠিক নয়। দয়া করে সঠিক ইমেইল ব্যবহার করুন।';
      }
      if (loc === 'ar') {
        return 'عنوان البريد الإلكتروني غير صحيح. يرجى استخدام بريد إلكتروني صالح.';
      }
      return 'The email address is invalid. Please use a valid email.';
    }

    if (code === 'auth/network-request-failed' || message.includes('network-request-failed')) {
      if (loc === 'bn') {
        return 'নেটওয়ার্ক সংযোগ ব্যর্থ হয়েছে। দয়া করে আপনার ইন্টারনেট কানেকশন চেক করে আবার চেষ্টা করুন।';
      }
      if (loc === 'ar') {
        return 'فشل الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.';
      }
      return 'Network connection failed. Please check your internet connection and try again.';
    }

    if (loc === 'bn') {
      return message || 'অ্যাকাউন্ট তৈরি করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
    }
    if (loc === 'ar') {
      return message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.';
    }
    return message || 'Failed to create account. Please try again.';
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create user document in Firestore
      const isSuperAdmin = user.email === 'abirmohsin02@gmail.com';
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role: isSuperAdmin ? 'super_admin' : selectedRole,
        status: isSuperAdmin ? 'approved' : 'pending',
        createdAt: new Date().toISOString(),
      });

      // 3. Redirect to dashboard
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(getFriendlyErrorMessage(err, locale || 'en'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setIsLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        const isSuperAdmin = user.email === 'abirmohsin02@gmail.com';
        
        await setDoc(userDocRef, {
          name: user.displayName || 'Unknown',
          email: user.email,
          role: isSuperAdmin ? 'super_admin' : selectedRole,
          status: isSuperAdmin ? 'approved' : 'pending',
          createdAt: new Date().toISOString(),
        });
      }
      
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError('Failed to sign up with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-6">
          <BrandLogo variant="navbar" locale={locale} sizeOverride={48} />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Or{' '}
          <Link href={`/${locale}/login`} className="font-medium text-emerald-600 hover:text-emerald-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex flex-col gap-2">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                  {(error.includes('already') || error.includes('ইতিমধ্যে') || error.includes('بالفعل')) && (
                    <div className="ml-8 mt-1">
                      <Link
                        href={`/${locale}/login?email=${encodeURIComponent(email)}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline decoration-2 underline-offset-2"
                      >
                        {locale === 'bn' 
                          ? 'সরাসরি লগইন করতে এখানে ক্লিক করুন →' 
                          : locale === 'ar' 
                          ? 'انقر هنا لتسجيل الدخول مباشرة ←' 
                          : 'Click here to sign in directly →'}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700">
                Account Type / অ্যাকাউন্টের ধরন / نوع الحساب
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-[#064e3b] focus:border-[#064e3b] sm:text-sm bg-white"
                >
                  <option value="applicant">Applicant / আবেদনকারী (মাস্টার ড্যাশবোর্ড)</option>
                  <option value="student">Student / শিক্ষার্থী (ক্লাস, মূল্যায়ন ও ফি ট্র্যাকিং)</option>
                  <option value="teacher">Teacher / Academic Officer (নম্বর প্রদান, উপস্থিতি ও রিসার্চ রিভিউ)</option>
                  <option value="guardian">Guardian / অভিভাবক (সন্তানের প্রগতি ও পেমেন্ট পোর্টাল)</option>
                  <option value="researcher">Researcher / গবেষক (দাওয়াহ পেপার সাবমিশন ও লাইব্রেরি)</option>
                  <option value="library_staff">Library Staff / লাইব্রেরি কর্মকর্তা (বই ম্যানেজমেন্ট)</option>
                  <option value="finance_officer">Finance Officer / অর্থ কর্মকর্তা (আর্থিক লেনদেন)</option>
                  <option value="admin">Admin / অ্যাডমিন (সিস্টেম প্রশাসন)</option>
                </select>
                <p className="mt-1.5 text-[10px] text-slate-400 leading-normal">
                  * Select your academic or research role to enter the correct specialized portal automatically upon login.
                </p>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#064e3b] hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-slate-300 rounded-md shadow-sm bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#064e3b] transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign up with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
