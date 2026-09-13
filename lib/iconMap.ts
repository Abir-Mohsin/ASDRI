import React from 'react';
import { 
  Target, Shield, BookOpen, Users, Award, 
  GraduationCap, Heart, Sparkles, Globe, Compass, 
  CheckCircle2, Star, Clock, FileText, Landmark,
  BookMarked, MapPin, Phone, Mail, Building2,
  Lightbulb, MessageSquare, Send, Check, HelpCircle,
  Database, Cloud, FolderArchive, FileSpreadsheet, HardDrive,
  Download, ExternalLink, Library, Bookmark, Search, Share2,
  UserPlus, FileCheck, CreditCard, ShieldCheck, Globe2,
  LucideIcon
} from 'lucide-react';

export const iconDictionary: Record<string, LucideIcon> = {
  Target,
  Shield,
  BookOpen,
  Users,
  Award,
  GraduationCap,
  Heart,
  Sparkles,
  Globe,
  Globe2,
  Compass,
  CheckCircle2,
  Star,
  Clock,
  FileText,
  Landmark,
  BookMarked,
  MapPin,
  Phone,
  Mail,
  Building2,
  Lightbulb,
  MessageSquare,
  Send,
  Check,
  HelpCircle,
  Database,
  Cloud,
  FolderArchive,
  FileSpreadsheet,
  HardDrive,
  Download,
  ExternalLink,
  Library,
  Bookmark,
  Search,
  Share2,
  UserPlus,
  FileCheck,
  CreditCard,
  ShieldCheck,
};

export const availableIcons: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'Library', label: 'লাইব্রেরি / পাঠাগার', icon: Library },
  { id: 'BookOpen', label: 'খোলা বই / জ্ঞান', icon: BookOpen },
  { id: 'BookMarked', label: 'কিতাব / রেফারেন্স', icon: BookMarked },
  { id: 'Bookmark', label: 'বুকমার্ক / সংকলন', icon: Bookmark },
  { id: 'Cloud', label: 'ক্লাউড ড্রাইভ / অনলাইন', icon: Cloud },
  { id: 'FolderArchive', label: 'ফোল্ডার / আর্কাইভ', icon: FolderArchive },
  { id: 'FileSpreadsheet', label: 'গুগল শীট / তালিকা', icon: FileSpreadsheet },
  { id: 'Database', label: 'ডাটাবেজ / ভাণ্ডার', icon: Database },
  { id: 'FileText', label: 'দলিল / ডকুমেন্ট', icon: FileText },
  { id: 'GraduationCap', label: 'শিক্ষা / ডিগ্রি', icon: GraduationCap },
  { id: 'Award', label: 'পুরস্কার / মান', icon: Award },
  { id: 'Sparkles', label: 'উজ্জ্বলতা / বিশেষ', icon: Sparkles },
  { id: 'Globe', label: 'আন্তর্জাতিক / বিশ্ব', icon: Globe },
  { id: 'Target', label: 'টার্গেট / লক্ষ্য', icon: Target },
  { id: 'Shield', label: 'শিল্ড / সুরক্ষা', icon: Shield },
  { id: 'Users', label: 'ব্যবহারকারী / সমাজ', icon: Users },
  { id: 'Heart', label: 'আন্তরিকতা / সেবা', icon: Heart },
  { id: 'Compass', label: 'দিকনির্দেশনা / গাইডেন্স', icon: Compass },
  { id: 'Building2', label: 'ক্যাম্পাস / ভবন', icon: Building2 },
  { id: 'Lightbulb', label: 'উদ্ভাবন / চিন্তা', icon: Lightbulb },
  { id: 'MapPin', label: 'ঠিকানা / অবস্থান', icon: MapPin },
  { id: 'Phone', label: 'টেলিফোন / কল', icon: Phone },
  { id: 'Mail', label: 'ইমেইল / বার্তা', icon: Mail },
  { id: 'CheckCircle2', label: 'সততা / নিশ্চয়তা', icon: CheckCircle2 },
  { id: 'Star', label: 'তারকা / বিশিষ্ট', icon: Star },
  { id: 'Clock', label: 'সময় / সময়ানুবর্তিতা', icon: Clock },
  { id: 'Landmark', label: 'প্রতিষ্ঠান / ঐতিহ্য', icon: Landmark },
  { id: 'UserPlus', label: 'নিবন্ধন / Registration (UserPlus)', icon: UserPlus },
  { id: 'FileCheck', label: 'যাচাই / Verification (FileCheck)', icon: FileCheck },
  { id: 'CreditCard', label: 'পেমেন্ট / Payment (CreditCard)', icon: CreditCard },
  { id: 'ShieldCheck', label: 'সুরক্ষা / Compliance (ShieldCheck)', icon: ShieldCheck },
  { id: 'Globe2', label: 'গ্লোবাল / Delivery Mode (Globe2)', icon: Globe2 },
];

export function getLucideIcon(iconName?: string): LucideIcon {
  if (!iconName) return BookOpen;
  return iconDictionary[iconName] || BookOpen;
}

export function RenderIcon({ name, className = 'w-6 h-6' }: { name?: string; className?: string }) {
  const Icon = getLucideIcon(name);
  return React.createElement(Icon, { className });
}
