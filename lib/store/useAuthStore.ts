import { create } from 'zustand';
import { User } from 'firebase/auth';

export type UserRole = 
  | 'guest' 
  | 'applicant' 
  | 'student' 
  | 'alumni'
  | 'guardian' 
  | 'teacher' 
  | 'researcher' 
  | 'library_staff' 
  | 'finance_officer' 
  | 'academic_officer' 
  | 'media_team' 
  | 'hr' 
  | 'admin' 
  | 'super_admin';

interface AuthState {
  user: User | null;
  role: UserRole | null;
  status: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: UserRole | null) => void;
  setStatus: (status: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  status: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setStatus: (status) => set({ status }),
  setLoading: (isLoading) => set({ isLoading }),
}));

