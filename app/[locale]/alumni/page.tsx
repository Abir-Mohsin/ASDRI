import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/lib/dictionary";
import { AlumniPublicPortal } from "@/components/alumni/AlumniPublicPortal";

export default async function AlumniPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<{ tab?: string; verifyId?: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activeTab = resolvedSearchParams.tab || 'overview';
  const verifyId = resolvedSearchParams.verifyId || '';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Navbar dict={dict} locale={locale} />
      
      <main className="flex-1 w-full pb-16">
        <AlumniPublicPortal 
          initialTab={activeTab} 
          verifyIdParam={verifyId} 
          locale={locale} 
        />
      </main>

      <Footer dict={dict} locale={locale} />
    </div>
  );
}

