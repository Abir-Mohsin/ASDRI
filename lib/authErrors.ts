/**
 * Firebase Authentication Error Diagnostics and Localization
 */

export function isUnauthorizedDomainError(err: any): boolean {
  const code = err?.code || '';
  const rawMessage = err?.message || '';
  return code === 'auth/unauthorized-domain' || rawMessage.includes('unauthorized-domain');
}

export function getGoogleAuthErrorMessage(err: any, locale: string = 'bn'): string {
  const code = err?.code || '';
  const rawMessage = err?.message || '';

  // 1. Domain authorization error
  if (code === 'auth/unauthorized-domain' || rawMessage.includes('unauthorized-domain')) {
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
    if (locale === 'bn') {
      return `ডোমেইন অনুমোদন সংক্রান্ত সমস্যা: "${currentHost}" ডোমেইনটি Firebase Authentication-এর অনুমোদিত তালিকায় নেই। অনুগ্রহ করে Firebase Console → Authentication → Settings → Authorized domains-এ "${currentHost}" ডোমেইনটি যুক্ত করুন (অথবা লাইভ প্রোডাকশন ডোমেইন asdri-fd3ec.web.app ব্যবহার করুন)।`;
    }
    if (locale === 'ar') {
      return `خطأ في ترخيص النطاق: النطاق "${currentHost}" غير مصرح به في Firebase Authentication. يرجى إضافته في Firebase Console → Authentication → Settings → Authorized domains.`;
    }
    return `Unauthorized domain: "${currentHost}" is not in the Firebase authorized domains list. Please add it in Firebase Console → Authentication → Settings → Authorized domains (or use production domain asdri-fd3ec.web.app).`;
  }

  // 2. User closed the popup window
  if (code === 'auth/popup-closed-by-user' || rawMessage.includes('popup-closed-by-user')) {
    if (locale === 'bn') return 'সাইন-ইন উইন্ডোটি সম্পন্ন করার আগেই বন্ধ করা হয়েছে।';
    if (locale === 'ar') return 'تم إغلاق نافذة تسجيل الدخول قبل الانتهاء.';
    return 'The sign-in popup was closed before completing.';
  }

  // 3. Popup blocked by browser
  if (code === 'auth/popup-blocked' || rawMessage.includes('popup-blocked')) {
    if (locale === 'bn') {
      return 'ব্রাউজার সাইন-ইন পপআপ ব্লক করেছে। অনুগ্রহ করে ব্রাউজারের অ্যাড্রেস বারে পপআপ অনুমোদন করে আবার চেষ্টা করুন।';
    }
    if (locale === 'ar') {
      return 'تم حظر النافذة المنبثقة من قبل المتصفح. يرجى السماح بالنوافذ المنبثقة لهذا الموقع.';
    }
    return 'The sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
  }

  // 4. Cancelled popup request (another popup already opened)
  if (code === 'auth/cancelled-popup-request' || rawMessage.includes('cancelled-popup-request')) {
    if (locale === 'bn') return 'ইতিমধ্যে একটি সাইন-ইন উইন্ডো খোলা রয়েছে।';
    if (locale === 'ar') return 'هناك نافذة تسجيل دخول قيد المعالجة بالفعل.';
    return 'Another sign-in popup is already open.';
  }

  // 5. Operation not allowed (Google provider not enabled in Firebase Console)
  if (code === 'auth/operation-not-allowed' || rawMessage.includes('operation-not-allowed')) {
    if (locale === 'bn') {
      return 'Firebase প্রকল্পে Google Sign-in সক্রিয় করা নেই। অনুগ্রহ করে Firebase Console → Authentication → Sign-in method-এ Google প্রদানকারী সক্রিয় (Enable) করুন।';
    }
    if (locale === 'ar') {
      return 'تسجيل الدخول بجوجل غير مفعّل. يرجى تفعيله في Firebase Console → Authentication → Sign-in method.';
    }
    return 'Google Sign-in is not enabled in Firebase Console. Please enable it in Authentication → Sign-in method.';
  }

  // 6. Network request failure
  if (code === 'auth/network-request-failed' || rawMessage.includes('network-request-failed')) {
    if (locale === 'bn') return 'নেটওয়ার্ক সংযোগ বিঘ্নিত হয়েছে। ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।';
    if (locale === 'ar') return 'فشل الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.';
    return 'Network connection failed. Please check your internet connection and try again.';
  }

  // 7. Account exists with different credential
  if (code === 'auth/account-exists-with-different-credential') {
    if (locale === 'bn') {
      return 'এই ইমেইল দিয়ে ইতিমধ্যে অন্য উপায়ে (যেমন পাসওয়ার্ড) অ্যাকাউন্ট খোলা আছে। অনুগ্রহ করে পাসওয়ার্ড দিয়ে লগইন করুন।';
    }
    if (locale === 'ar') {
      return 'يوجد حساب بالفعل بهذا البريد الإلكتروني بطريقة مختلفة. يرجى تسجيل الدخول بكلمة المرور.';
    }
    return 'An account already exists with the same email using a different sign-in method. Please sign in with your email and password.';
  }

  // Default fallback with helpful details
  const detail = rawMessage ? ` (${rawMessage})` : '';
  if (locale === 'bn') return `গুগল দিয়ে লগইন সম্পন্ন হয়নি${detail}`;
  if (locale === 'ar') return `فشل تسجيل الدخول باستخدام جوجل${detail}`;
  return `Failed to sign in with Google${detail}`;
}
