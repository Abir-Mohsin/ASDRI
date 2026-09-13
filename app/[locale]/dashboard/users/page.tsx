'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Check, X, ShieldAlert, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsersManagementPage() {
  const { role, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && role !== 'super_admin' && role !== 'admin') {
      router.push('/');
    }
  }, [authLoading, role, router]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        // Sort: pending first, then by creation date
        usersData.sort((a, b) => {
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        if (isMounted) {
          setUsers(usersData);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (role === 'super_admin' || role === 'admin') {
      fetchUsers();
    }

    return () => {
      isMounted = false;
    };
  }, [role]);

  const handleUpdateUser = async (userId: string, newRole: string, newStatus: string) => {
    setIsUpdating(userId);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        status: newStatus,
        // if approving, maybe clear requestedRole, but keeping it is fine
      });
      // Refresh local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole, status: newStatus } : u));
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user.');
    } finally {
      setIsUpdating(null);
    }
  };

  if (authLoading || (role !== 'super_admin' && role !== 'admin')) {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-500 text-sm mt-1">
            Review and approve user registrations.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">No users found.</td>
                </tr>
              ) : (
                users.map((u) => {
                  if (u.email === 'abirmohsin02@gmail.com') return null; // Hide super admin

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                            <UserIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{u.name || 'Unknown'}</div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <select 
                            className="border border-slate-200 rounded text-xs px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 bg-white text-slate-900 font-medium cursor-pointer shadow-2xs"
                            value={u.role || 'guest'}
                            onChange={(e) => handleUpdateUser(u.id, e.target.value, u.status || 'pending')}
                            disabled={isUpdating === u.id}
                          >
                            <option value="guest" className="bg-white text-slate-900 font-medium py-1">Guest</option>
                            <option value="applicant" className="bg-white text-slate-900 font-medium py-1">Applicant</option>
                            <option value="student" className="bg-white text-slate-900 font-medium py-1">Student</option>
                            <option value="teacher" className="bg-white text-slate-900 font-medium py-1">Teacher</option>
                            <option value="guardian" className="bg-white text-slate-900 font-medium py-1">Guardian</option>
                            <option value="researcher" className="bg-white text-slate-900 font-medium py-1">Researcher</option>
                            <option value="library_staff" className="bg-white text-slate-900 font-medium py-1">Library Staff</option>
                            <option value="finance_officer" className="bg-white text-slate-900 font-medium py-1">Finance Officer</option>
                            <option value="admin" className="bg-white text-slate-900 font-medium py-1">Admin</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-4">
                        {u.status === 'pending' ? (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 w-max">
                            Pending Approval
                          </span>
                        ) : u.status === 'rejected' ? (
                          <span className="px-2.5 py-1 bg-red-100 text-red-800 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 w-max">
                            Rejected
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-md flex items-center gap-1 w-max">
                            <Check className="w-3 h-3" /> Approved
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {u.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleUpdateUser(u.id, u.role, 'approved')}
                                disabled={isUpdating === u.id}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Approve
                              </button>
                              <button 
                                onClick={() => handleUpdateUser(u.id, u.role, 'rejected')}
                                disabled={isUpdating === u.id}
                                className="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold transition-colors flex items-center gap-1"
                              >
                                <X className="w-3 h-3" /> Reject
                              </button>
                            </>
                          )}
                          
                          {u.status === 'approved' && (
                            <button 
                              onClick={() => handleUpdateUser(u.id, u.role, 'rejected')}
                              disabled={isUpdating === u.id}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Revoke Access
                            </button>
                          )}
                          
                           {u.status === 'rejected' && (
                            <button 
                              onClick={() => handleUpdateUser(u.id, u.role, 'approved')}
                              disabled={isUpdating === u.id}
                              className="text-xs text-emerald-600 hover:underline"
                            >
                              Restore Access
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
