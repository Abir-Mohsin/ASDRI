import Link from 'next/link';

export default function LocaleNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-2xl mb-4">
        404
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        Page Not Found / পৃষ্ঠাটি পাওয়া যায়নি
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6">
        The requested resource could not be found.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-semibold transition-colors"
      >
        Return to Home / মূল পাতায় ফিরে যান
      </Link>
    </div>
  );
}
