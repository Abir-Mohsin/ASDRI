import { Plus_Jakarta_Sans, Noto_Serif_Bengali, Noto_Kufi_Arabic, Amiri } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ['bengali'],
  variable: '--font-noto-serif-bengali',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-kufi-arabic',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const amiri = Amiri({
  subsets: ['arabic'],
  variable: '--font-amiri',
  display: 'swap',
  weight: ['400', '700'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${notoSerifBengali.variable} ${notoKufiArabic.variable} ${amiri.variable}`}
    >
      <body suppressHydrationWarning className="bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}

