import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-2xl mb-4">
        404
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found / পৃষ্ঠাটি পাওয়া যায়নি</h1>
      <p className="text-sm text-slate-600 max-w-md mb-6">
        The page you are looking for does not exist or has been moved.
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
