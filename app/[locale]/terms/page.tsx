import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/lib/dictionary";
import { DynamicPageRenderer } from "@/components/DynamicPageRenderer";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar dict={dict} locale={locale} />
      
      <DynamicPageRenderer
        pageId="terms_of_service"
        locale={locale}
        fallbackTitle="Terms of Service (ব্যবহারের শর্তাবলী)"
        fallbackSubtitle="Terms and conditions governing the use of As-Sunnah Dawah and Research Institute digital portal and services."
      />

      <Footer dict={dict} locale={locale} />
    </div>
  );
}
