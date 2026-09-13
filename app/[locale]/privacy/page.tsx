import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/lib/dictionary";
import { DynamicPageRenderer } from "@/components/DynamicPageRenderer";

export default async function PrivacyPage({
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
        pageId="privacy_policy"
        locale={locale}
        fallbackTitle="Privacy Policy (প্রাইভেসি পলিসি)"
        fallbackSubtitle="We are committed to protecting your privacy and personal data at As-Sunnah Dawah and Research Institute."
      />

      <Footer dict={dict} locale={locale} />
    </div>
  );
}
