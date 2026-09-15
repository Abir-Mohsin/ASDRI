import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/lib/dictionary";
import { AlumniPublicPortal } from "@/components/alumni/AlumniPublicPortal";

export default async function AlumniPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Navbar dict={dict} locale={locale} />
      
      <main className="flex-1 w-full pb-16">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <AlumniPublicPortal locale={locale} />
        </Suspense>
      </main>

      <Footer dict={dict} locale={locale} />
    </div>
  );
}

