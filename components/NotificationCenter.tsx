'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Bell, CheckCircle2, AlertTriangle, Info, Clock, X, Send, 
  Trash2, Filter, Sparkles, Shield, BookOpen, CreditCard, ChevronRight, Check
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, arrayUnion, deleteDoc, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store/useAuthStore';

export interface NotificationItem {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  title: string;
  message: string;
  targetAudience: 'all' | 'student' | 'teacher' | 'guardian' | 'finance_officer' | 'researcher' | 'specific_user';
  targetUserId?: string;
  type?: 'general' | 'urgent' | 'class' | 'fee' | 'exam';
  link?: string;
  createdAt: string;
  readBy?: string[];
}

export function NotificationCenter() {
  const { user, role } = useAuthStore();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);

  // Send Notice Modal state
  const [showSendModal, setShowSendModal] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticeAudience, setNoticeAudience] = useState<string>('all');
  const [noticeType, setNoticeType] = useState<string>('general');
  const [noticeLink, setNoticeLink] = useState('');
  const [isSending, setIsSending] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const canSendNotif = role === 'admin' || role === 'super_admin' || role === 'teacher' || role === 'academic_officer' || role === 'finance_officer';

  // Listen for outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time Firestore listener for notifications
  useEffect(() => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifList: NotificationItem[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Omit<NotificationItem, 'id'>;
          // Filter: target audience matches 'all', user's role, specific UID, or user sent it
          const matchesAudience = 
            data.targetAudience === 'all' ||
            data.targetAudience === role ||
            data.targetUserId === user.uid ||
            data.senderId === user.uid;

          if (matchesAudience) {
            notifList.push({
              id: doc.id,
              ...data,
              readBy: data.readBy || []
            });
          }
        });
        setNotifications(notifList);
      }, (err) => {
        console.error('Notification snapshot listener error:', err);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to setup notification listener:', error);
    }
  }, [user, role]);

  const unreadCount = notifications.filter(n => !n.readBy?.includes(user?.uid || '')).length;

  // Mark a single notification as read
  const markAsRead = async (notifId: string) => {
    if (!user) return;
    try {
      const notifRef = doc(db, 'notifications', notifId);
      await updateDoc(notifRef, {
        readBy: arrayUnion(user.uid)
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const unreadNotifs = notifications.filter(n => !n.readBy?.includes(user.uid));
      for (const notif of unreadNotifs) {
        await updateDoc(doc(db, 'notifications', notif.id), {
          readBy: arrayUnion(user.uid)
        });
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  // Delete notification (Admin or Sender)
  const deleteNotif = async (notifId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('আপনি কি এই নোটিফিকেশনটি মুছে ফেলতে চান?')) return;
    try {
      await deleteDoc(doc(db, 'notifications', notifId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Send new notification
  const handleSendNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !noticeTitle.trim() || !noticeMessage.trim()) return;

    setIsSending(true);
    try {
      const senderRoleName = 
        role === 'admin' || role === 'super_admin' ? 'অ্যাডমিন' :
        role === 'teacher' || role === 'academic_officer' ? 'শিক্ষক' :
        role === 'finance_officer' ? 'অর্থ কর্মকর্তা' : 'ইনস্টিটিউট কর্তৃপক্ষ';

      const payload = {
        senderId: user.uid,
        senderName: user.displayName || user.email?.split('@')[0] || 'কর্মকর্তা',
        senderRole: senderRoleName,
        title: noticeTitle.trim(),
        message: noticeMessage.trim(),
        targetAudience: noticeAudience,
        type: noticeType,
        link: noticeLink.trim() || null,
        createdAt: new Date().toISOString(),
        readBy: [user.uid]
      };

      await addDoc(collection(db, 'notifications'), payload);

      setNoticeTitle('');
      setNoticeMessage('');
      setNoticeLink('');
      setShowSendModal(false);
      alert('বিজ্ঞপ্তি সফলভাবে প্রচার করা হয়েছে!');
    } catch (err) {
      console.error('Error sending notice:', err);
      alert('বিজ্ঞপ্তি পাঠানো ব্যর্থ হয়েছে।');
    } finally {
      setIsSending(false);
    }
  };

  const filteredNotifs = filter === 'unread' 
    ? notifications.filter(n => !n.readBy?.includes(user?.uid || '')) 
    : notifications;

  const getRoleBadge = (senderRole: string, type?: string) => {
    if (type === 'urgent') {
      return (
        <span className="p-1.5 bg-red-100 text-red-700 rounded-lg shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </span>
      );
    }
    if (senderRole?.includes('অ্যাডমিন') || senderRole?.includes('admin')) {
      return (
        <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
          <Shield className="w-4 h-4" />
        </span>
      );
    }
    if (senderRole?.includes('শিক্ষক') || senderRole?.includes('teacher')) {
      return (
        <span className="p-1.5 bg-blue-100 text-blue-800 rounded-lg shrink-0">
          <BookOpen className="w-4 h-4" />
        </span>
      );
    }
    if (senderRole?.includes('অর্থ') || senderRole?.includes('finance')) {
      return (
        <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg shrink-0">
          <CreditCard className="w-4 h-4" />
        </span>
      );
    }
    return (
      <span className="p-1.5 bg-slate-100 text-slate-700 rounded-lg shrink-0">
        <Info className="w-4 h-4" />
      </span>
    );
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Toggle Button */}
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all relative cursor-pointer focus:outline-none border border-transparent hover:border-slate-200"
        title="নোটিফিকেশন সেন্টার"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popup Window */}
      {isOpen && (
        <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 text-slate-800 animate-fadeIn overflow-hidden">
          
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-serif leading-tight">
                  নোটিফিকেশন বার্তা
                </h3>
                <p className="text-[10px] text-slate-500 font-sans">
                  {unreadCount > 0 ? `${unreadCount} টি অপঠিত বিজ্ঞপ্তি রয়েছে` : 'সবগুলো বিজ্ঞপ্তি পঠিত'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {canSendNotif && (
                <button
                  type="button"
                  onClick={() => { setIsOpen(false); setShowSendModal(true); }}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-emerald-950 text-[11px] font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                >
                  <Send className="w-3 h-3" /> পাঠাও
                </button>
              )}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="সব পড়া চিহ্নিত করুন"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tab */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 text-[11px] bg-white">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  filter === 'all' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                সব ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  filter === 'unread' ? 'bg-amber-500 text-emerald-950 shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                অপঠিত ({unreadCount})
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-emerald-700 hover:underline font-bold text-[10px]"
              >
                সব পড়া চিহ্নিত করুন
              </button>
            )}
          </div>

          {/* List Area */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
            {filteredNotifs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto opacity-30" />
                <p className="text-xs font-semibold">কোনো নোটিফিকেশন পাওয়া যায়নি</p>
              </div>
            ) : (
              filteredNotifs.map((notif) => {
                const isUnread = !notif.readBy?.includes(user?.uid || '');
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (isUnread) markAsRead(notif.id);
                      setSelectedNotif(notif);
                    }}
                    className={`p-3 transition-colors cursor-pointer flex items-start gap-3 hover:bg-slate-50 ${
                      isUnread ? 'bg-emerald-50/40 border-l-4 border-l-emerald-600' : 'bg-white'
                    }`}
                  >
                    {getRoleBadge(notif.senderRole, notif.type)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[11px] font-bold text-slate-900 truncate">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {new Date(notif.createdAt).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-tight">
                        {notif.message}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                          {notif.senderRole} • {notif.senderName}
                        </span>
                        {(role === 'admin' || role === 'super_admin' || notif.senderId === user?.uid) && (
                          <button
                            onClick={(e) => deleteNotif(notif.id, e)}
                            className="text-slate-400 hover:text-red-600 p-0.5"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Notification Detail View Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {getRoleBadge(selectedNotif.senderRole, selectedNotif.type)}
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-serif">{selectedNotif.title}</h3>
                  <span className="text-xs text-emerald-800 font-bold">
                    {selectedNotif.senderRole}: {selectedNotif.senderName}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNotif(null)} 
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/70">
              {selectedNotif.message}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>প্রচারের সময়: {new Date(selectedNotif.createdAt).toLocaleString('bn-BD')}</span>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedNotif(null)}
                className="px-4 py-2 bg-emerald-900 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Notice Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold font-serif">
                <Send className="w-5 h-5 text-amber-500" />
                <span>নতুন নোটিফিকেশন / বার্তা প্রচার করুন</span>
              </div>
              <button 
                onClick={() => setShowSendModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotice} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  বিজ্ঞপ্তির শিরোনাম *
                </label>
                <input
                  type="text"
                  required
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="যেমন: আগামীকালের ক্লাসের সময়সূচী পরিবর্তন / ফি জমাদান"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-800 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    প্রাপক শ্রেণি (Audience)
                  </label>
                  <select
                    value={noticeAudience}
                    onChange={(e) => setNoticeAudience(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-800 outline-none font-medium bg-white"
                  >
                    <option value="all">সকল ব্যবহারকারী (Everyone)</option>
                    <option value="student">শুধুমাত্র শিক্ষার্থী (Students)</option>
                    <option value="teacher">শুধুমাত্র শিক্ষক (Teachers)</option>
                    <option value="guardian">অভিভাবকবৃন্দ (Guardians)</option>
                    <option value="finance_officer">অর্থ কর্মকর্তা (Finance)</option>
                    <option value="researcher">গবেষকবৃন্দ (Researchers)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    বিজ্ঞপ্তির ধরন (Type)
                  </label>
                  <select
                    value={noticeType}
                    onChange={(e) => setNoticeType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-800 outline-none font-medium bg-white"
                  >
                    <option value="general">সাধারণ তথ্য (General)</option>
                    <option value="urgent">জরুরি ঘোষণা (Urgent)</option>
                    <option value="class">ক্লাস ও পরীক্ষা (Class/Exam)</option>
                    <option value="fee">ফি ও বেতন সংক্রান্ত (Fee/Payment)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  বিজ্ঞপ্তির বার্তা *
                </label>
                <textarea
                  required
                  rows={4}
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  placeholder="বিজ্ঞপ্তির বিস্তারিত বার্তাটি এখানে লিখুন..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-1 focus:ring-emerald-800 outline-none font-medium resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2 bg-[#064e3b] hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSending ? 'পাঠানো হচ্ছে...' : 'নোটিফিকেশন পাঠান'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
