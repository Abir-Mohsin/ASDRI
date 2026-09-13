'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';
import { ChevronLeft, User, Phone, MapPin, Book, Briefcase, Camera, Loader2, CheckCircle, Upload, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { UserAvatar } from '@/components/UserAvatar';

export default function ProfilePage() {
  const { user, role, setUser } = useAuthStore();
  const params = useParams();
  const locale = params?.locale as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [formData, setFormData] = useState({
    fullName: user?.displayName || '',
    phone: '',
    address: '',
    education: '',
    profession: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        if (user.photoURL) {
          setPhotoURL(user.photoURL);
        }
        const docRef = doc(db, 'users_profile', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData(prev => ({ ...prev, ...data }));
          if (data.photoURL) {
            setPhotoURL(data.photoURL);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingPhoto(true);
    try {
      const storageRef = ref(storage, `profile_pictures/${user.uid}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadedUrl = await getDownloadURL(storageRef);
      setPhotoURL(downloadedUrl);

      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: downloadedUrl });
      }

      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), { photoURL: downloadedUrl }, { merge: true });
      await setDoc(doc(db, 'users_profile', user.uid), { photoURL: downloadedUrl }, { merge: true });

      if (auth.currentUser) {
        setUser({ ...auth.currentUser });
      }
      setSuccessMessage('Profile picture updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Photo upload error:', err);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setSuccessMessage('');
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: formData.fullName || auth.currentUser.displayName,
          photoURL: photoURL || auth.currentUser.photoURL
        });
      }

      const profilePayload = {
        ...formData,
        email: user.email,
        photoURL: photoURL || user.photoURL,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users_profile', user.uid), profilePayload, { merge: true });
      await setDoc(doc(db, 'users', user.uid), { 
        name: formData.fullName,
        photoURL: photoURL || user.photoURL 
      }, { merge: true });

      if (auth.currentUser) {
        setUser({ ...auth.currentUser });
      }

      setSuccessMessage('Profile details updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/${locale}/dashboard`} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-[#064e3b] transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">My Profile</h2>
          <p className="text-slate-500 text-xs sm:text-sm">Manage your personal details and account profile photo.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs text-center">
            <div className="relative inline-block mb-4 group">
              <UserAvatar user={user} customPhotoUrl={photoURL} size="2xl" showBorder={true} />
              <label 
                htmlFor="photo-upload" 
                className="absolute bottom-0 right-0 p-2 bg-amber-500 text-emerald-950 rounded-full shadow-md hover:bg-amber-400 transition-colors cursor-pointer border-2 border-white"
                title="Change Profile Photo"
              >
                {isUploadingPhoto ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-950" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </label>
              <input 
                id="photo-upload" 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                className="hidden" 
                disabled={isUploadingPhoto}
              />
            </div>

            <h3 className="text-lg font-bold text-slate-900 font-serif">{formData.fullName || user?.displayName || 'User'}</h3>
            <p className="text-xs text-slate-500 mb-4 font-mono">{user?.email}</p>
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200 uppercase tracking-wider">
              {role || 'Student'}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-left space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Profile Photo URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                />
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <p className="text-[11px] text-slate-400">
                You can also enter a direct photo URL to set your avatar.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-xs">
            <h3 className="font-bold text-lg text-[#064e3b] font-serif mb-6 border-b border-slate-100 pb-4">
              Personal Details
            </h3>
            
            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Full Name
                  </label>
                  <input 
                    type="text" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#064e3b] outline-none font-medium"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
                  </label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+8801XXXXXXXXX"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#064e3b] outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Book className="w-3.5 h-3.5 text-slate-400" /> Highest Qualification
                  </label>
                  <input 
                    type="text" 
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    placeholder="e.g. B.Sc / M.A / Dawrah e Hadith"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#064e3b] outline-none font-medium"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Profession
                  </label>
                  <input 
                    type="text" 
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    placeholder="e.g. Teacher / Researcher / Student"
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#064e3b] outline-none font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Present Address
                </label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#064e3b] outline-none font-medium resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
