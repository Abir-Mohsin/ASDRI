export interface ZakatFormField {
  id: string;
  category: 'personal' | 'financial' | 'debt' | 'referee' | 'declaration';
  label: string;
  placeholder?: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  required?: boolean;
  options?: string[];
  unit?: string;
  helpText?: string;
}

export const DEFAULT_ZAKAT_FORM_FIELDS: ZakatFormField[] = [
  // 1. Personal / Family Additional
  { id: 'nid_brn', category: 'personal', label: 'এন আই ডি / জন্মনিবন্ধন নম্বর', placeholder: 'NID or Birth Certificate Number', type: 'text', required: true },
  { id: 'dob', category: 'personal', label: 'জন্ম তারিখ', type: 'text', placeholder: 'DD/MM/YYYY', required: true },
  { id: 'batch_no', category: 'personal', label: 'ব্যাচ নম্বর (যদি জানা থাকে)', placeholder: 'e.g. Batch 03', type: 'text' },
  { id: 'father_alive', category: 'personal', label: ' পিতা কি জীবিত?', type: 'select', options: ['হ্যাঁ (Alive)', 'না (Deceased)'], required: true },
  { id: 'mother_alive', category: 'personal', label: 'মাতা কি জীবিত?', type: 'select', options: ['হ্যাঁ (Alive)', 'না (Deceased)'], required: true },
  { id: 'inherited_property_partitioned', category: 'personal', label: 'পিতা/মাতা/স্বামী মারা গিয়ে থাকলে তাদের পরিত্যক্ত সম্পদ কি বণ্টন হয়েছে?', type: 'select', options: ['হ্যাঁ (Distributed)', 'না (Pending)', 'প্রযোজ্য নয় (N/A)'] },
  { id: 'permanent_address', category: 'personal', label: 'স্থায়ী ঠিকানা', placeholder: 'গ্রাম/রাস্তা, ডাকঘর, থানা, জেলা', type: 'textarea', required: true },

  // 2. Financial Status Details (আর্থিক অবস্থার বিবরণ)
  { id: 'cash_in_hand', category: 'financial', label: 'ক. নগদ অর্থের পরিমাণ (অন্যের কাছে রাখা আমানত সহ)', placeholder: 'টাকায় পরিমাণ', type: 'number', unit: 'BDT', required: true },
  { id: 'gold_silver_val', category: 'financial', label: 'খ. স্বর্ণ ও রূপা (আনা/ভরি, ক্যারেট ও আনুমানিক বাজারমূল্য)', placeholder: 'যেমন: ১ ভরি স্বর্ণ (২২ ক্যারেট), মূল্য: ১২০০০ টাকা', type: 'text' },
  { id: 'land_property_val', category: 'financial', label: 'গ. জমি, বাড়ি, ফ্ল্যাটের বর্তমান বিক্রয়মূল্য (যাতে বসবাস বা চাষাবাদ বা ভাড়া দেয়া হয় না, পরিত্যক্ত)', placeholder: 'আনুমানিক বিক্রয়মূল্য (টাকায়)', type: 'number', unit: 'BDT' },
  { id: 'vehicle_furniture_val', category: 'financial', label: 'ঘ. প্রয়োজনের অতিরিক্ত বাহন (বাইক, গাড়ি) ও আসবাবপত্রের বিক্রয়মূল্য', placeholder: 'টাকায় পরিমাণ', type: 'number', unit: 'BDT' },
  { id: 'stock_goods_val', category: 'financial', label: 'ঙ. বিক্রয়ের উদ্দেশ্যে স্টকে রাখা রেডি পণ্য, উৎপাদিত পণ্য, কাঁচামালের পাইকারি/একত্রে বিক্রয়মূল্য', placeholder: 'টাকায় পরিমাণ', type: 'number', unit: 'BDT' },
  { id: 'business_share_val', category: 'financial', label: 'চ. শেয়ার বা পার্টনার ব্যবসায় স্টকে থাকা পণ্য ও কাঁচামালের পাইকারি মূল্য', placeholder: 'টাকায় পরিমাণ', type: 'number', unit: 'BDT' },
  { id: 'movable_immovable_val', category: 'financial', label: 'ছ. বিক্রয়ের উদ্দেশ্যে কেনা অন্যান্য স্থাবর ও অস্থাবর সম্পত্তির বিক্রয়মূল্য', placeholder: 'টাকায় পরিমাণ', type: 'number', unit: 'BDT' },
  { id: 'bank_deposit_val', category: 'financial', label: 'জ. ব্যাংক বা কোনো আর্থিক প্রতিষ্ঠানে জমাকৃত অর্থ (সুদ বাদ দিয়ে মূল অংশ)', placeholder: 'টাকায় পরিমাণ', type: 'number', unit: 'BDT' },
  { id: 'savings_bond_val', category: 'financial', label: 'ঝ. সঞ্চয়পত্র, বন্ড, ডিবেঞ্চার ও ট্রেজারি বিল ইত্যাদির ক্রয়মূল্য', placeholder: 'টাকায় পরিমাণ', type: 'number', unit: 'BDT' },
  { id: 'recoverable_loan', category: 'financial', label: 'ঞ. ফেরত পাওয়া যাবে এমন প্রদত্ত ঋণ', placeholder: 'টাকায় পরিমাণ', type: 'number', unit: 'BDT' },
  { id: 'insurance_val', category: 'financial', label: 'ট. উত্তোলন করা যাবে এমন বীমার অর্থ', placeholder: 'টাকায় পরিমাণ', type: 'number', unit: 'BDT' },
  { id: 'special_savings_val', category: 'financial', label: 'ঠ. হজ, উমরা, বিয়ে, ঘর নির্মাণ, জায়গা ক্রয় ইত্যাদি বিশেষ উদ্দেশ্যে জমাকৃত অর্থ', placeholder: 'টাকায় পরিমাণ', type: 'number', unit: 'BDT' },

  // 3. Debt & Liabilities (ঋণ সংক্রান্ত তথ্য)
  { id: 'general_debt', category: 'debt', label: 'ক. অন্যরা আপনার থেকে পাবে এমন সাধারণ ঋণের পরিমাণ', placeholder: 'টাকায় পরিমাণ', type: 'number', unit: 'BDT', required: true },
  { id: 'business_debt_1yr', category: 'debt', label: 'খ. ব্যবসার উদ্দেশ্যে নেওয়া ঋণের পরিমাণ (যা আগামী এক বছরের মধ্যে পরিশোধ করতে হবে)', placeholder: 'টাকায় পরিমাণ', type: 'number', unit: 'BDT' },
  { id: 'longterm_installment_1yr', category: 'debt', label: 'গ. দীর্ঘ মেয়াদী ঋণের এক বছরে আদায়যোগ্য কিস্তির পরিমাণ', placeholder: 'টাকায় পরিমাণ', type: 'number', unit: 'BDT' },
  { id: 'unpaid_mahr_1yr', category: 'debt', label: 'ঘ. অনাদায়ী দেনমোহর আগামী এক বছরে যেটুকু অবশ্যই পরিশোধ করতে হবে', placeholder: 'টাকায় পরিমাণ', type: 'number', unit: 'BDT' },
  { id: 'unpaid_utility_rent', category: 'debt', label: 'ঙ. অনাদায়ী বাড়ি ভাড়া, বিদ্যুৎ/গ্যাস/পানি বিলের পরিমাণ', placeholder: 'টাকায় পরিমাণ', type: 'number', unit: 'BDT' },

  // 4. Referees (দুইজন সত্যায়নকারীর তথ্য)
  { id: 'referee1_name', category: 'referee', label: 'স সত্যায়নকারী ১ - নাম', placeholder: 'আলেম/অভিভাবক/স্থানীয় ব্যক্তির নাম', type: 'text', required: true },
  { id: 'referee1_mobile', category: 'referee', label: 'সত্যায়নকারী ১ - মোবাইল নম্বর', placeholder: '০১৭xxxxxxxx', type: 'text', required: true },
  { id: 'referee1_relation', category: 'referee', label: 'সত্যায়নকারী ১ - সম্পর্ক', placeholder: 'যেমন: স্থানীয় ইমাম / শিক্ষক', type: 'text', required: true },

  { id: 'referee2_name', category: 'referee', label: 'সত্যায়নকারী ২ - নাম', placeholder: 'দ্বিতীয় ব্যক্তির নাম', type: 'text', required: true },
  { id: 'referee2_mobile', category: 'referee', label: 'সত্যায়নকারী ২ - মোবাইল নম্বর', placeholder: '০১৭xxxxxxxx', type: 'text', required: true },
  { id: 'referee2_relation', category: 'referee', label: 'সত্যায়নকারী ২ - সম্পর্ক', placeholder: 'যেমন: প্রতিবেশী / অভিভাবক', type: 'text', required: true },
];

export const DEFAULT_ZAKAT_FORM_TITLE = "যাকাত ফান্ড ও স্কলারশিপ আবেদন ফরম (Zakat & Scholarship Assessment Form)";
export const DEFAULT_ZAKAT_FORM_SUBTITLE = "আপনার আর্থিক স্বচ্ছলতা না থাকলে আস-সুন্নাহ ফাউন্ডেশন যাকাত ফান্ড অথবা জেনারেল স্কলারশিপ ফান্ড থেকে সহায়তা পেতে নিচের সকল তথ্য নির্ভুলভাবে পূরণ করুন।";

export const ZAKAT_WARNING_TEXT = `আবেদনকারীর যাকাত গ্রহণের যোগ্যতা যাচাইয়ের উদ্দেশ্যে ফরমে উল্লিখিত তথ্যসমূহ সংগ্রহ করা হচ্ছে। আবেদনকারী প্রদত্ত তথ্য ও সংশ্লিষ্ট যাচাই-বাছাইয়ের ভিত্তিতে যাকাত গ্রহণের উপযুক্ত বিবেচিত হলে তাকে যাকাত ফান্ড থেকে স্কলারশিপ প্রদান করা হবে। অন্যথায়, প্রযোজ্য ক্ষেত্রে সাধারণ (General) ফান্ড থেকে স্কলারশিপ প্রদান করা হতে পারে।

অতএব, আবেদনকারীকে সঠিক, পূর্ণাঙ্গ ও সত্য তথ্য প্রদান করার জন্য বিশেষভাবে অনুরোধ করা হচ্ছে। যদি কোনো আবেদনকারী ইচ্ছাকৃতভাবে অসত্য, বিভ্রান্তিকর বা গোপনীয় তথ্য প্রদান করে যাকাত ফান্ড থেকে আর্থিক সহায়তা বা স্কলারশিপ গ্রহণ করেন, তবে এর দায়ভার সম্পূর্ণরূপে তার ওপর বর্তাবে এবং শরিয়তের দৃষ্টিতে তিনি এর জন্য দায়ী ও জবাবদিহিতার সম্মুখীন হবেন।`;

export const ZAKAT_UNDERTAKING_TEXT = `আমি এই মর্মে অঙ্গীকার করছি যে, আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউটের প্রশিক্ষণ, আবাসন ও খাওয়া-দাওয়া বাবদ মোট কোর্স ফি বহন করা আমার পক্ষে কষ্টসাধ্য। তাই আস-সুন্নাহ ফাউন্ডেশন থেকে শিক্ষা বৃত্তির আবেদন করছি। কোর্স চলাকালীন আমার আর্থিক স্বচ্ছলতা ফিরে এলে আমি নিজ দায়িত্বে কর্তৃপক্ষকে অবহিত করে যাকাত ফান্ড থেকে প্রদত্ত বৃত্তি বন্ধ করব।`;
