'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-800 font-bold text-2xl mb-4">
        !
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        Something went wrong / ত্রুটি দেখা দিয়েছে
      </h1>
      <p className="text-sm text-slate-600 max-w-md mb-6">
        An unexpected error occurred. Please try again or return to home.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
        >
          Try Again / আবার চেষ্টা করুন
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-sm font-semibold transition-colors"
        >
          Return Home / মূল পাতায় ফিরে যান
        </Link>
      </div>
    </div>
  );
}
