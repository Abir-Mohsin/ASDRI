'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { getGoogleAuthErrorMessage, isUnauthorizedDomainError } from '@/lib/authErrors';
import { UnauthorizedDomainAlert } from '@/components/UnauthorizedDomainAlert';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const dict = {
  en: {
    title: "Sign in to your account",
    emailPlaceholder: "Email address",
    passwordPlaceholder: "Password",
    signInBtn: "Sign in",
    signingIn: "Signing in...",
    orContinue: "Or continue with",
    googleBtn: "Sign in with Google",
    backHome: "Back to Home",
    noAccount: "Don't have an account? Create one",
  },
  bn: {
    title: "আপনার অ্যাকাউন্টে লগইন করুন",
    emailPlaceholder: "ইমেইল ঠিকানা",
    passwordPlaceholder: "পাসওয়ার্ড",
    signInBtn: "লগইন করুন",
    signingIn: "লগইন হচ্ছে...",
    orContinue: "অথবা অন্য উপায়ে",
    googleBtn: "গুগল দিয়ে লগইন করুন",
    backHome: "হোমপেজে ফিরে যান",
    noAccount: "কোনো অ্যাকাউন্ট নেই? নতুন অ্যাকাউন্ট তৈরি করুন",
  },
  ar: {
    title: "تسجيل الدخول إلى حسابك",
    emailPlaceholder: "البريد الإلكتروني",
    passwordPlaceholder: "كلمة المرور",
    signInBtn: "تسجيل الدخول",
    signingIn: "جاري تسجيل الدخول...",
    orContinue: "أو متابعة باستخدام",
    googleBtn: "تسجيل الدخول باستخدام جوجل",
    backHome: "العودة إلى الرئيسة",
    noAccount: "ليس لديك حساب؟ إنشاء حساب جديد",
  }
};

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showUnauthorizedDomainAlert, setShowUnauthorizedDomainAlert] = useState(false);
  
  const router = useRouter();

  const params = useParams();
  const locale = (params?.locale as string || 'en') as keyof typeof dict;
  const activeDict = dict[locale] || dict.en;
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Extract email query parameter safely on mount/search updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const emailParam = searchParams.get('email');
      if (emailParam) {
        setValue('email', emailParam);
      }
    }
  }, [setValue]);

  const getFriendlyLoginErrorMessage = (err: any, loc: string) => {
    const code = err?.code || '';
    const message = err?.message || '';

    if (code === 'auth/wrong-password' || code === 'auth/user-not-found' || code === 'auth/invalid-credential' || message.includes('invalid-credential') || message.includes('wrong-password') || message.includes('user-not-found')) {
      if (loc === 'bn') {
        return 'ভুল ইমেইল বা পাসওয়ার্ড। দয়া করে সঠিক ইমেইল ও পাসওয়ার্ড দিয়ে আবার চেষ্টা করুন।';
      }
      if (loc === 'ar') {
        return 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.';
      }
      return 'Incorrect email or password. Please check your credentials and try again.';
    }

    if (code === 'auth/user-disabled' || message.includes('user-disabled')) {
      if (loc === 'bn') {
        return 'এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে। অনুগ্রহ করে কর্তৃপক্ষের সাথে যোগাযোগ করুন।';
      }
      if (loc === 'ar') {
        return 'تم تعطيل هذا الحساب. يرجى الاتصال بالإدارة.';
      }
      return 'This account has been disabled. Please contact administration.';
    }

    if (code === 'auth/too-many-requests' || message.includes('too-many-requests')) {
      if (loc === 'bn') {
        return 'অনেক বার ভুল চেষ্টার কারণে সাময়িকভাবে এই অ্যাকাউন্ট লক করা হয়েছে। অনুগ্রহ করে কিছু সময় পর আবার চেষ্টা করুন।';
      }
      if (loc === 'ar') {
        return 'تم حظر الحساب مؤقتاً بسبب محاولات تسجيل دخول فاشلة متعددة. يرجى المحاولة لاحقاً.';
      }
      return 'Too many failed login attempts. This account has been temporarily locked. Please try again later.';
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
      return 'লগইন করতে ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।';
    }
    if (loc === 'ar') {
      return 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.';
    }
    return 'Failed to sign in. Please try again.';
  };

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setResetMessage(null);
    setResetError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      
      let targetPath = `/${locale}/dashboard`;
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const redirectParam = searchParams.get('redirect');
        if (redirectParam) {
          targetPath = `/${locale}/${decodeURIComponent(redirectParam)}`;
        }
      }
      router.push(targetPath);
    } catch (err: any) {
      console.error(err);
      setError(getFriendlyLoginErrorMessage(err, locale));
    }
  };

  const handleForgotPassword = async () => {
    setResetMessage(null);
    setResetError(null);
    setError(null);
    
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const emailValue = emailInput?.value;
    
    if (!emailValue) {
      setResetError(locale === 'bn' 
        ? 'পাসওয়ার্ড রিসেট করতে আগে আপনার ইমেইলটি উপরে লিখুন।' 
        : locale === 'ar' 
        ? 'يرجى كتابة بريدك الإلكتروني أولاً في الأعلى لإعادة تعيين كلمة المرور.' 
        : 'Please enter your email address above first.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, emailValue);
      setResetMessage(locale === 'bn' 
        ? 'পাসওয়ার্ড রিসেট লিঙ্ক আপনার ইমেইলে পাঠানো হয়েছে! অনুগ্রহ করে আপনার ইনবক্স (বা স্প্যাম ফোল্ডার) চেক করুন।' 
        : locale === 'ar' 
        ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني! يرجى التحقق من صندوق الوارد (أو البريد المزعج).' 
        : 'Password reset link sent to your email! Please check your inbox (or spam folder).');
    } catch (err: any) {
      console.error(err);
      setResetError(locale === 'bn' 
        ? 'পাসওয়ার্ড রিসেট ইমেইল পাঠানো যায়নি। অনুগ্রহ করে সঠিক ইমেইল লিখেছেন কিনা তা নিশ্চিত করুন।' 
        : locale === 'ar' 
        ? 'فشل إرسال بريد إعادة التعيين. يرجى التأكد من كتابة البريد الإلكتروني بشكل صحيح.' 
        : 'Failed to send password reset email. Please make sure the email is correct.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setResetMessage(null);
    setResetError(null);
    setIsGoogleLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      
      // Ensure user profile in Firestore without blocking auth flow if offline/delay
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          const isSuperAdmin = user.email === 'abirmohsin02@gmail.com';
          const role = isSuperAdmin ? 'super_admin' : 'applicant';
          
          await setDoc(userDocRef, {
            name: user.displayName || 'User',
            email: user.email,
            role: role,
            status: isSuperAdmin ? 'approved' : 'approved',
            createdAt: new Date().toISOString(),
          });
        }
      } catch (firestoreErr) {
        console.warn('Firestore profile sync postponed:', firestoreErr);
      }
      
      let targetPath = `/${locale}/dashboard`;
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const redirectParam = searchParams.get('redirect');
        if (redirectParam) {
          targetPath = `/${locale}/${decodeURIComponent(redirectParam)}`;
        }
      }
      router.push(targetPath);
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      // Suppress alarming error if user simply closed the popup
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        return;
      }
      if (isUnauthorizedDomainError(err)) {
        setShowUnauthorizedDomainAlert(true);
      } else {
        setError(getGoogleAuthErrorMessage(err, (locale as string) || 'bn'));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-slate-100">
        <div className="flex flex-col items-center">
          <BrandLogo variant="auth" locale={locale} showText={false} sizeOverride={64} />
          <h2 className="mt-5 text-center text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
            {activeDict.title}
          </h2>
        </div>

        {showUnauthorizedDomainAlert && (
          <UnauthorizedDomainAlert
            locale={locale as string}
            onDismiss={() => setShowUnauthorizedDomainAlert(false)}
          />
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border-l-4 border-red-500 font-medium">
              {error}
            </div>
          )}

          {resetMessage && (
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-md text-sm border-l-4 border-emerald-600 font-medium">
              {resetMessage}
            </div>
          )}

          {resetError && (
            <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm border-l-4 border-amber-500 font-medium">
              {resetError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">{activeDict.emailPlaceholder}</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-[#064e3b] focus:border-[#064e3b] focus:z-10 sm:text-sm"
                placeholder={activeDict.emailPlaceholder}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">{activeDict.passwordPlaceholder}</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-[#064e3b] focus:border-[#064e3b] focus:z-10 sm:text-sm"
                placeholder={activeDict.passwordPlaceholder}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-950 focus:outline-none transition-colors"
            >
              {locale === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : locale === 'ar' ? 'هل نسيت كلمة المرور؟' : 'Forgot Password?'}
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-[#064e3b] hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#064e3b] disabled:opacity-70 transition-colors"
            >
              {isSubmitting ? activeDict.signingIn : activeDict.signInBtn}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">{activeDict.orContinue}</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isSubmitting}
              className="w-full flex items-center justify-center py-3 px-4 border border-slate-300 rounded-md shadow-sm bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#064e3b] transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {isGoogleLoading 
                ? (locale === 'bn' ? 'গুগলে কানেক্ট হচ্ছে...' : locale === 'ar' ? 'جاري الاتصال بجوجل...' : 'Connecting to Google...') 
                : activeDict.googleBtn}
            </button>
          </div>

        </div>

        <div className="text-center mt-6 flex flex-col gap-3">
          <Link href={`/${locale}/register`} className="text-emerald-700 hover:text-emerald-900 text-sm font-semibold">
            {activeDict.noAccount}
          </Link>
          <Link href={`/${locale}`} className="text-slate-500 hover:text-slate-800 text-xs font-medium">
            &larr; {activeDict.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
