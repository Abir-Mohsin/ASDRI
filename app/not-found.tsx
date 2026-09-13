import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 text-slate-900">
      <h1 className="text-6xl font-extrabold text-[#064e3b] font-serif mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">পৃষ্ঠাটি পাওয়া যায়নি (Page Not Found)</h2>
      <p className="text-slate-600 max-w-md mb-6">
        আপনি যে পৃষ্ঠাটি খুঁজছেন তা স্থানান্তরিত হয়েছে অথবা মুছে ফেলা হয়েছে।
      </p>
      <Link
        href="/bn"
        className="px-6 py-3 bg-[#064e3b] text-white font-bold rounded-xl hover:bg-emerald-900 transition-colors"
      >
        মূল পাতায় ফিরে যান
      </Link>
    </div>
  );
}
