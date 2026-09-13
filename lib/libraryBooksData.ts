export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: string;
  driveUrl: string;
  downloadUrl?: string;
  previewUrl?: string;
  language?: string;
  volume?: string;
  fileSize?: string;
  format?: string;
  coverImage?: string;
  description?: string;
  pages?: number;
  year?: string;
}

// Convert Drive / Archive URLs to In-App embed preview URLs
export function getBookEmbedUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Google Drive File
  const match1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const match2 = trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  const match3 = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const driveId = match1 ? match1[1] : match2 ? match2[1] : match3 ? match3[1] : null;

  if (driveId && trimmed.includes('drive.google.com')) {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }

  // Google Drive Folder
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch && trimmed.includes('drive.google.com')) {
    return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#list`;
  }

  // Internet Archive Details -> Embed
  if (trimmed.includes('archive.org/details/')) {
    return trimmed.replace('archive.org/details/', 'archive.org/embed/');
  }

  return trimmed;
}

// Convert Drive URLs to Direct Download Links
export function getBookDownloadUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const match1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const match2 = trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  const match3 = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const driveId = match1 ? match1[1] : match2 ? match2[1] : match3 ? match3[1] : null;

  if (driveId && trimmed.includes('drive.google.com')) {
    return `https://drive.google.com/uc?export=download&id=${driveId}`;
  }
  return trimmed;
}

// Pre-loaded Islamic Classical & Research Library Database (Sample authentic books)
export const DEFAULT_LIBRARY_BOOKS: LibraryBook[] = [
  // --- Tafsir & Quranic Sciences ---
  {
    id: 'tafseer-1',
    title: 'Tafsir Ibn Kathir (Complete Volumes)',
    author: 'Allama Hafiz Ibn Kathir (Rh.)',
    category: 'Tafsir & Quranic Sciences',
    driveUrl: 'https://archive.org/details/Tafseer-Ibn-Katheer-Bengali',
    previewUrl: 'https://archive.org/embed/Tafseer-Ibn-Katheer-Bengali',
    language: 'Bengali Translation',
    volume: 'Vol 1-11',
    fileSize: '185 MB',
    format: 'PDF',
    description: 'The most accepted and authentic Tafsir of the Holy Quran.'
  },
  {
    id: 'tafseer-2',
    title: 'Tafsir al-Tabari (Jami al-Bayan)',
    author: 'Imam Ibn Jarir al-Tabari (Rh.)',
    category: 'Tafsir & Quranic Sciences',
    driveUrl: 'https://archive.org/details/TafsirTabari',
    previewUrl: 'https://archive.org/embed/TafsirTabari',
    language: 'Arabic / Bengali',
    volume: 'Vol 1-24',
    fileSize: '350 MB',
    format: 'PDF',
    description: "The oldest and foundational authentic book of Tafsir bil Ma'thur."
  },
  {
    id: 'tafseer-3',
    title: 'Tafsir al-Qurtubi (Al-Jami li-Ahkam al-Quran)',
    author: 'Imam Abu Abdullah al-Qurtubi (Rh.)',
    category: 'Tafsir & Quranic Sciences',
    driveUrl: 'https://archive.org/details/tafseer-qurtubi-bangla',
    previewUrl: 'https://archive.org/embed/tafseer-qurtubi-bangla',
    language: 'Bengali / Arabic',
    volume: 'Vol 1-20',
    fileSize: '280 MB',
    format: 'PDF',
    description: 'A famous Tafsir based on Ahkam and Fiqh issues.'
  },
  {
    id: 'tafseer-4',
    title: 'Al-Itqan fi Ulum al-Quran',
    author: 'Imam Jalaluddin al-Suyuti (Rh.)',
    category: 'Tafsir & Quranic Sciences',
    driveUrl: 'https://archive.org/details/Itqan-Fi-Ulum-Al-Quran',
    previewUrl: 'https://archive.org/embed/Itqan-Fi-Ulum-Al-Quran',
    language: 'Arabic / Bengali',
    volume: 'Vol 1-2',
    fileSize: '45 MB',
    format: 'PDF',
    description: 'One of the best encyclopedias on Quranic sciences.'
  },

  // --- Hadith & Hadith Sciences ---
  {
    id: 'hadith-1',
    title: 'Sahih al-Bukhari (Verified Complete)',
    author: 'Imam Muhammad bin Ismail al-Bukhari (Rh.)',
    category: 'Hadith & Hadith Sciences',
    driveUrl: 'https://archive.org/details/SahihAlBukhariBanglaAllVolumes',
    previewUrl: 'https://archive.org/embed/SahihAlBukhariBanglaAllVolumes',
    language: 'Bengali & Original Arabic',
    volume: 'Vol 1-10',
    fileSize: '120 MB',
    format: 'PDF',
    description: 'The most authentic Hadith book in human history after the Book of Allah.'
  },
  {
    id: 'hadith-2',
    title: 'Sahih Muslim (with Sharh Nawawi)',
    author: 'Imam Muslim bin Hajjaj al-Qushayri (Rh.)',
    category: 'Hadith & Hadith Sciences',
    driveUrl: 'https://archive.org/details/SahihMuslimBanglaAllPart',
    previewUrl: 'https://archive.org/embed/SahihMuslimBanglaAllPart',
    language: 'Bengali Translation',
    volume: 'Vol 1-8',
    fileSize: '95 MB',
    format: 'PDF',
    description: 'One of the best authentic Hadith collections written in a systematic chapter-based layout.'
  },
  {
    id: 'hadith-3',
    title: 'Fath al-Bari Sharh Sahih al-Bukhari',
    author: 'Hafiz Ibn Hajar al-Asqalani (Rh.)',
    category: 'Hadith & Hadith Sciences',
    driveUrl: 'https://archive.org/details/Fath-Al-Bari-Ibn-Hajar',
    previewUrl: 'https://archive.org/embed/Fath-Al-Bari-Ibn-Hajar',
    language: 'Original Arabic',
    volume: 'Vol 1-13',
    fileSize: '320 MB',
    format: 'PDF',
    description: 'The immortal and incomparable commentary on Sahih al-Bukhari.'
  },
  {
    id: 'hadith-4',
    title: 'Riyad as-Salihin (The Meadows of the Righteous)',
    author: 'Imam Abu Zakariya Yahya an-Nawawi (Rh.)',
    category: 'Hadith & Hadith Sciences',
    driveUrl: 'https://archive.org/details/Riyadus-Saliheen-Bangla',
    previewUrl: 'https://archive.org/embed/Riyadus-Saliheen-Bangla',
    language: 'Bengali & Arabic',
    volume: 'Vol 1-2',
    fileSize: '35 MB',
    format: 'PDF',
    description: 'An authentic collection of Hadiths regarding daily practices, morals, and manners.'
  },
  {
    id: 'hadith-5',
    title: 'Muqaddimah Ibn al-Salah (Ulum al-Hadith)',
    author: 'Ibn al-Salah al-Shahrazuri (Rh.)',
    category: 'Hadith & Hadith Sciences',
    driveUrl: 'https://archive.org/details/Muqaddimah-Ibn-Salah',
    previewUrl: 'https://archive.org/embed/Muqaddimah-Ibn-Salah',
    language: 'Arabic / Bengali',
    volume: 'Vol 1',
    fileSize: '22 MB',
    format: 'PDF',
    description: 'The foundational authentic basis of Usul al-Hadith and Mustalah al-Hadith.'
  },

  // --- Fiqh & Fatwa ---
  {
    id: 'fiqh-1',
    title: 'Al-Hidayah fi Sharh al-Bidayah',
    author: 'Imam Burhanuddin al-Marghinani (Rh.)',
    category: 'Fiqh & Fatwa',
    driveUrl: 'https://archive.org/details/Al-Hidayah-Bangla-Full',
    previewUrl: 'https://archive.org/embed/Al-Hidayah-Bangla-Full',
    language: 'Arabic / Bengali',
    volume: 'Vol 1-4',
    fileSize: '85 MB',
    format: 'PDF',
    description: 'The foundational evidenced-based textbook and authentic book of Hanafi Fiqh.'
  },
  {
    id: 'fiqh-2',
    title: "Fatawa 'Alamgiri (Al-Fatawa al-Hindiyyah)",
    author: 'Leading Board of Ulama in India',
    category: 'Fiqh & Fatwa',
    driveUrl: 'https://archive.org/details/Fatwa-Alamgiri-Bangla',
    previewUrl: 'https://archive.org/embed/Fatwa-Alamgiri-Bangla',
    language: 'Bengali Translation',
    volume: 'Vol 1-10',
    fileSize: '240 MB',
    format: 'PDF',
    description: 'A massive collection of Islamic law and judicial system.'
  },
  {
    id: 'fiqh-3',
    title: 'Al-Mughni by Ibn Qudamah',
    author: 'Imam Muwaffaquddin Ibn Qudamah al-Maqdisi (Rh.)',
    category: 'Fiqh & Fatwa',
    driveUrl: 'https://archive.org/details/Al-Mughni-Ibn-Qudama',
    previewUrl: 'https://archive.org/embed/Al-Mughni-Ibn-Qudama',
    language: 'Original Arabic',
    volume: 'Vol 1-15',
    fileSize: '290 MB',
    format: 'PDF',
    description: 'A massive and authentic encyclopedia of comparative Fiqh.'
  },
  {
    id: 'fiqh-4',
    title: 'Radd al-Muhtar ala al-Durr al-Mukhtar (Fatawa Shami)',
    author: 'Allama Ibn Abidin al-Shami (Rh.)',
    category: 'Fiqh & Fatwa',
    driveUrl: 'https://archive.org/details/Radd-Al-Muhtar-Ibn-Abidin',
    previewUrl: 'https://archive.org/embed/Radd-Al-Muhtar-Ibn-Abidin',
    language: 'Original Arabic',
    volume: 'Vol 1-12',
    fileSize: '260 MB',
    format: 'PDF',
    description: 'The ultimate reference and authentic book of later Hanafi Fiqh.'
  },

  // --- Seerah & Islamic History ---
  {
    id: 'seerah-1',
    title: 'Ar-Raheeq Al-Makhtum (The Sealed Nectar)',
    author: 'Allama Safiur Rahman Mubarakpuri (Rh.)',
    category: 'Seerah & Islamic History',
    driveUrl: 'https://archive.org/details/Ar-Raheeq-Al-Makhtum-Bangla',
    previewUrl: 'https://archive.org/embed/Ar-Raheeq-Al-Makhtum-Bangla',
    language: 'Bengali Translation',
    volume: 'Vol 1',
    fileSize: '18 MB',
    format: 'PDF',
    description: 'আন্তর্জাতিক সীরাত প্রতিযোগিতায় প্রথম পুরস্কারপ্রাপ্ত বিশুদ্ধতম সীরাতগ্রন্থ।'
  },
  {
    id: 'seerah-2',
    title: 'আল-বিদায়া ওয়ান-নিহায়া (ইতিহাসের শুরু ও শেষ)',
    author: 'Allama Hafiz Ibn Kathir (Rh.)',
    category: 'Seerah & Islamic History',
    driveUrl: 'https://archive.org/details/Al-Bidaya-Wan-Nihaya-Bangla',
    previewUrl: 'https://archive.org/embed/Al-Bidaya-Wan-Nihaya-Bangla',
    language: 'Bengali Translation',
    volume: 'Vol 1-14',
    fileSize: '৩১০ মেগাবাইট',
    format: 'PDF',
    description: 'সৃষ্টির সূচনা, আম্বিয়ায়ে কিরামের ঘটনা ও ইসলামি খেলাফতের প্রামাণ্য ইতিহাস।'
  },
  {
    id: 'seerah-3',
    title: 'সীরাতে খাতামুল আম্বিয়া',
    author: 'মুফতী মুহাম্মদ শফী (রহ.)',
    category: 'Seerah & Islamic History',
    driveUrl: 'https://archive.org/details/Sirate-Khatamul-Ambiya-Bangla',
    previewUrl: 'https://archive.org/embed/Sirate-Khatamul-Ambiya-Bangla',
    language: 'Bengali Translation',
    volume: 'Vol 1',
    fileSize: '12 MB',
    format: 'PDF',
    description: 'রাসূলুল্লাহ (সা.)-এর জীবন ও আদর্শের ওপর সংক্ষিপ্ত ও প্রাঞ্জল সংকলন।'
  },

  // --- Aqeedah & Comparative Religion ---
  {
    id: 'aqeedah-1',
    title: 'আকীদাতুত তাহাবিয়া (শরহসহ)',
    author: 'Imam Abu Jafar at-Tahawi (Rh.)',
    category: 'Aqeedah & Comparative Religion',
    driveUrl: 'https://archive.org/details/Sharh-Aqeedah-Tahawiyyah-Bangla',
    previewUrl: 'https://archive.org/embed/Sharh-Aqeedah-Tahawiyyah-Bangla',
    language: 'Bengali & Arabic',
    volume: 'Vol 1',
    fileSize: '২৮ মেগাবাইট',
    format: 'PDF',
    description: 'আহলুস সুন্নাহ ওয়াল জামাআতের বিশুদ্ধ মূলনীতি ও আকীদা বিষয়ক সংকলন।'
  },
  {
    id: 'aqeedah-2',
    title: 'Kitab at-Tawhid',
    author: 'শায়খুল ইসলাম মুহাম্মদ বিন আব্দুল ওয়াহহাব (রহ.)',
    category: 'Aqeedah & Comparative Religion',
    driveUrl: 'https://archive.org/details/Kitab-At-Tawheed-Bangla',
    previewUrl: 'https://archive.org/embed/Kitab-At-Tawheed-Bangla',
    language: 'Bengali Translation',
    volume: 'Vol 1',
    fileSize: '১৪ মেগাবাইট',
    format: 'PDF',
    description: 'তাওহীদের মূল ভিত্তি ও শিরকের ভয়াবহতা বিষয়ক প্রামাণ্য গ্রন্থ।'
  },
  {
    id: 'aqeedah-3',
    title: 'আল-আকীদা আল-ওয়াসেত্বীয়্যাহ',
    author: 'শায়খুল ইসলাম ইবনে তাইমিয়্যাহ (রহ.)',
    category: 'Aqeedah & Comparative Religion',
    driveUrl: 'https://archive.org/details/Aqeedah-Wasitiyyah-Bangla',
    previewUrl: 'https://archive.org/embed/Aqeedah-Wasitiyyah-Bangla',
    language: 'Bengali / Arabic',
    volume: 'Vol 1',
    fileSize: '১৬ মেগাবাইট',
    format: 'PDF',
    description: 'আল্লাহর গুণাবলী ও সালাফদের আকীদা বিষয়ক প্রখ্যাত সংকলন।'
  },

  // --- আরবি ভাষা, সাহিত্য ও ব্যাকরণ ---
  {
    id: 'arabic-1',
    title: 'আল-কাফিয়া ফীন-নাহু',
    author: 'ইবনুল হাজিব (রহ.)',
    category: 'আরবি ভাষা, সাহিত্য ও ব্যাকরণ',
    driveUrl: 'https://archive.org/details/Al-Kafiyah-Nahw',
    previewUrl: 'https://archive.org/embed/Al-Kafiyah-Nahw',
    language: 'Original Arabic',
    volume: 'Vol 1',
    fileSize: '১৫ মেগাবাইট',
    format: 'PDF',
    description: 'নাহু শাস্ত্রের অবিসংবাদিত শাস্ত্রীয় পাঠ্যগ্রন্থ।'
  },
  {
    id: 'arabic-2',
    title: 'আল-মুজামুল ওয়াসীত (আধুনিক আরবি অভিধান)',
    author: 'মাজমাউল লুগাতিল আরাবিয়্যাহ, কায়রো',
    category: 'আরবি ভাষা, সাহিত্য ও ব্যাকরণ',
    driveUrl: 'https://archive.org/details/Al-Mujam-Al-Waseet',
    previewUrl: 'https://archive.org/embed/Al-Mujam-Al-Waseet',
    language: 'আরবি',
    volume: 'Vol 1-2',
    fileSize: '৫৫ মেগাবাইট',
    format: 'PDF',
    description: 'আরবি শব্দের অর্থ ও প্রয়োগের সর্বজনগ্রাহ্য অভিধান।'
  },
  {
    id: 'arabic-3',
    title: 'দুরূসুল লুগাতিল আরাবিয়্যাহ (১-৪ খণ্ড)',
    author: 'ড. ভি. আব্দুর রহীম',
    category: 'আরবি ভাষা, সাহিত্য ও ব্যাকরণ',
    driveUrl: 'https://archive.org/details/Duroos-Al-Lughah-Bangla',
    previewUrl: 'https://archive.org/embed/Duroos-Al-Lughah-Bangla',
    language: 'Bengali & Arabic',
    volume: 'Vol 1-4',
    fileSize: '45 MB',
    format: 'PDF',
    description: 'মদিনা ইসলামিক ইউনিভার্সিটির সুপরিচিত আরবি ভাষা শিক্ষা কোর্স।'
  }
];
