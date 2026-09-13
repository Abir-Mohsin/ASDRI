export interface FatwaItem {
  id: string;
  questionNo: string;
  title: string;
  titleEn?: string;
  titleAr?: string;
  category: string;
  categoryEn?: string;
  categoryAr?: string;
  question: string;
  questionEn?: string;
  questionAr?: string;
  answer: string;
  answerEn?: string;
  answerAr?: string;
  muftiName: string;
  muftiTitle?: string;
  references?: string[];
  date: string;
  isVerified: boolean;
  status: 'published' | 'pending' | 'private';
  views?: number;
}

export const defaultFatwas: FatwaItem[] = [
  {
    id: 'fatwa-01',
    questionNo: 'F-2026-084',
    title: 'স্বর্ণ ও শেয়ারের যাকাত হিসাব করার শরয়ী পদ্ধতি',
    titleEn: 'Method of Calculating Zakat on Gold and Company Shares',
    titleAr: 'طريقة حساب زكاة الذهب والأسهم الاستثمارية',
    category: 'যাকাত ও সদকা',
    categoryEn: 'Zakat & Charity',
    categoryAr: 'الزكاة والصدقات',
    question: 'মুহতারাম মুফতি সাহেব, আমার কাছে কিছু স্বর্ণালঙ্কার রয়েছে এবং কিছু অর্থ শেয়ারবাজারে বিনিয়োগ করা আছে। এগুলোর ওপর যাকাত প্রদানের সঠিক নিয়ম ও নিসাব কীভাবে নির্ধারণ করতে হবে?',
    questionEn: 'Honorable Mufti, I possess gold ornaments and have investments in company stocks. How should I accurately calculate the Nisab and annual Zakat on both?',
    questionAr: 'فضيلة المفتي، أمتلك كمية من الذهب وأسهمًا في البورصة. كيف يتم حساب النصاب والزكاة الواجبة عليهما شرعًا؟',
    answer: `আলহামদুলিল্লাহ, ওয়াহদাহু ওয়াস সালাতু ওয়াস সালামু আলা রাসুলিহিল কারীম।

১. স্বর্ণের যাকাত: সাড়ে সাত ভরি (৮৭.৪৮ গ্রাম) বা তার সমপরিমাণ স্বর্ণ থাকলে এবং পূর্ণ এক বছর অতিবাহিত হলে তার বর্তমান বাজারমূল্যের ২.৫% হারে যাকাত দেওয়া ফরজ। যদি স্বর্ণের সাথে নগদ টাকা বা অন্যান্য যাকাতযোগ্য সম্পদ থাকে, তবে রূপার নিসাব (৫২.৫ তোলা বা ৬১২.৩৬ গ্রাম রূপার মূল্য) অনুযায়ী হিসাব করতে হবে।

২. শেয়ারের যাকাত: শেয়ার যদি কেবল ডিভিডেন্ড বা লভ্যাংশ পাওয়ার নিয়তে দীর্ঘমেয়াদে রাখা হয়, তবে কোম্পানির তরল সম্পদ ও বিক্রয়যোগ্য পণ্যের অনুপাত অনুযায়ী যাকাত দিতে হবে। আর যদি ট্রেডিং বা মূলধন বৃদ্ধির উদ্দেশ্যে ক্রয়-বিক্রয় করা হয়, তবে প্রতি বছর যাকাতের তারিখে শেয়ারের বর্তমান বাজারমূল্যের ওপর সরাসরি ২.৫% হারে যাকাত আদায় করতে হবে।

আল্লাহ তাআলা আমাদেরকে বিশুদ্ধভাবে সম্পদ পরিশুদ্ধ করার তাওফিক দিন। আমিন।`,
    answerEn: `All praise is due to Allah alone.
1. Gold Zakat: The Nisab for gold is 87.48 grams (7.5 Bhori). If a person owns this amount for a complete lunar year, 2.5% of its current market value is due. If mixed with cash, silver Nisab (612.36 grams) is applied.
2. Shares/Stocks: If held for trading, 2.5% of market value on the Zakat due date must be paid. If held for dividends, calculate 2.5% on the company's liquid and trading assets.`,
    answerAr: `الحمد لله والصلاة والسلام على رسول الله:
نصاب الذهب 87.48 جرامًا، والواجب إخراج ربع العشر (2.5%). أما الأسهم، فإن كانت للمتاجرة زكيت بقيمتها السوقية، وإن كانت استثمارية زكيت على الأصول الزكوية. والله تعالى أعلم.`,
    muftiName: 'মুফতি আবদুল্লাহ আল-মাসউদ (হাফি.)',
    muftiTitle: 'প্রধান ফাতওয়া গবেষক, দারুল ইফতা ASDRI',
    references: ['সহীহ আল-বুখারী: কিতাবুয যাকাত', 'বাদায়েউস সানায়ে: ২/১৮', 'ফাতাওয়ায়ে হিন্দিয়াহ: ১/১৭৮'],
    date: '২০২৬-০৮-১৫',
    isVerified: true,
    status: 'published',
    views: 1420
  },
  {
    id: 'fatwa-02',
    questionNo: 'F-2026-079',
    title: 'অনলাইন ক্রিপ্টোকারেন্সি ও ডিজিটাল ট্রেডিংয়ের শরয়ী বিধান',
    titleEn: 'Islamic Ruling on Cryptocurrency and Digital Assets',
    titleAr: 'الحكم الشرعي لتداول العملات المشفرة والرقمية',
    category: 'মুআমালাত ও লেনদেন',
    categoryEn: 'Transactions & Finance',
    categoryAr: 'المعاملات المالية',
    question: 'বর্তমান যুগে প্রচলিত ক্রিপ্টোকারেন্সি (যেমন বিটকয়েন) কেনাবেচা ও এর মাধ্যমে মুনাফা অর্জন করার ব্যাপারে ইসলামী শরীয়তের দৃষ্টিভঙ্গি কী?',
    questionEn: 'What is the ruling of Islamic jurisprudence on buying, selling, and trading cryptocurrencies like Bitcoin?',
    questionAr: 'ما حكم التعامل بالعملات الرقمية المشفرة والمضاربة بها في الشريعة الإسلامية؟',
    answer: `আলহামদুলিল্লাহ,
ক্রিপ্টোকারেন্সি কোনো সার্বভৌম রাষ্ট্রের নিশ্চয়তাযুক্ত নয় এবং এতে চরম অনিশ্চয়তা (গারার) ও জুয়া সুলভ ঝুঁকি (কিমার) বিদ্যমান। অধিকাংশ শীর্ষস্থানীয় ফিকহ একাডেমি (যেমন ওআইসি ফিকহ একাডেমি, আল-আজহার ফাতওয়া কমিটি) এগুলোকে মুদ্রা বা নিরাপদ সম্পদ হিসেবে স্বীকৃতি দেয়নি। 

অতএব, যতদিন পর্যন্ত সার্বভৌম রাষ্ট্রীয় নিয়ন্ত্রণ ও নিশ্চয়তা প্রতিষ্ঠিত না হচ্ছে, ততদিন পর্যন্ত ক্রিপ্টোকারেন্সি কেনাবেচা ও ট্রেডিং থেকে বিরত থাকা আবশ্যক।`,
    answerEn: `Cryptocurrencies lack sovereign backing, intrinsic value, and suffer from excessive uncertainty (Gharar) and speculation. Major contemporary Fiqh councils advise against trading in them until regulated by sovereign authorities.`,
    answerAr: `العملات المشفرة تكتنفها الغرر والمخاطرة الشديدة وعدم وجود ضمانات سيادية، وجمهور المجامع الفقهية المعاصرة تمنع تداولها في صورتها الحالية.`,
    muftiName: 'ড. আহমাদুল হক আল-আজহারী',
    muftiTitle: 'চেয়ারম্যান, ফাতওয়া ও গবেষণা বোর্ড',
    references: ['মাজাল্লাতু মাজমায়িল ফিকহিল ইসলামী: সিদ্ধান্ত নং ২১৯', 'আল-আজহার ফাতওয়া কাউন্সিল রিপোর্ট'],
    date: '২০২৬-০৭-২২',
    isVerified: true,
    status: 'published',
    views: 2380
  },
  {
    id: 'fatwa-03',
    questionNo: 'F-2026-065',
    title: 'ভ্রমণকালে সালাত কসর ও জমা করার নিয়মাবলী',
    titleEn: 'Rules of Shortening (Qasr) and Combining Prayers while Traveling',
    titleAr: 'أحكام قصر الصلاة وجمعها للمسافر',
    category: 'তাহরাত ও সালাত',
    categoryEn: 'Purity & Prayer',
    categoryAr: 'الطهارة والصلاة',
    question: 'কত দূর পথ অতিক্রম করলে মুসাফির হিসেবে গণ্য হবে এবং কত দিন অবস্থানের নিয়তে কসর করা যাবে?',
    questionEn: 'What distance classifies one as a traveler (Musafir) and allows shortening of four-Rak’ah prayers?',
    questionAr: 'ما هي المسافة المبيحة لقصر الصلاة وكم المدة التي يجوز فيها الترخص برخص السفر؟',
    answer: `আলহামদুলিল্লাহ,
শরীয়তের দৃষ্টিতে ৪৮ মাইল বা প্রায় ৭৭.২৪ কিলোমিটার দূরত্বে সফরের নিয়তে নিজ এলাকার সীমানা ত্যাগ করলে ব্যক্তি মুসাফির গণ্য হন। চার রাকাত বিশিষ্ট ফরজ নামাজ (যোহর, আসর ও ইশা) দুই রাকাত পড়তে হবে। যদি কোনো নির্দিষ্ট স্থানে একটানা ১৫ দিনের কম অবস্থানের নিয়ত থাকে, তবে সেখানেও কসর করবেন। ১৫ দিন বা ততোধিক অবস্থানের নিয়ত করলে মুকীম হিসেবে পূর্ণ নামাজ পড়তে হবে।`,
    answerEn: `A travel distance of approximately 48 miles (77.24 km) with intention to travel outside one's hometown makes one a Musafir. Four-rak'ah obligatory prayers are shortened to two. If intending to stay less than 15 days at the destination, Qasr applies.`,
    answerAr: `مسافة السفر المبيحة للقصر هي 48 ميلاً (نحو 78 كم). وإذا نوى الإقامة أقل من 15 يوماً قصر الصلاة الرباعية ركعتين.`,
    muftiName: 'মাওলানা মাহমুদ হাসান আল-মাদানী',
    muftiTitle: 'সিনিয়র মুফতি, দারুল ইফতা ASDRI',
    references: ['সহীহ মুসলিম: বাবু সালাতিল মুসাফিরীন', 'আল-হিদায়াহ: ১/৮০'],
    date: '২০২৬-০৬-১০',
    isVerified: true,
    status: 'published',
    views: 1890
  }
];
