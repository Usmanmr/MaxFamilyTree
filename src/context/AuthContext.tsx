import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleAuthProvider, setMemoryIdToken, apiFetch } from '../lib/firebase';
import { useTreeStore } from '../store/treeStore';

export interface User {
  id: string;
  uid?: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  login: (data: any) => void;
  logout: () => Promise<void>;
  updateProfile: (data: { firstName: string; lastName: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchDashboardData = useTreeStore((s) => s.fetchDashboardData);
  const fetchTreeData = useTreeStore((s) => s.fetchTreeData);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          setMemoryIdToken(token);
          const dbUser = await apiFetch('/api/me');
          const displayParts = (firebaseUser.displayName || '').trim().split(' ');
          setUser({
            id: String(dbUser.id || firebaseUser.uid),
            uid: firebaseUser.uid,
            email: dbUser.email || firebaseUser.email || '',
            firstName: dbUser.firstName || displayParts[0] || 'User',
            lastName: dbUser.lastName || displayParts.slice(1).join(' ') || '',
            avatarUrl: dbUser.avatarUrl || firebaseUser.photoURL || null,
          });
          await fetchDashboardData();
          await fetchTreeData('1');
        } catch (err) {
          console.error('Error syncing user session with Cloud SQL:', err);
          const displayParts = (firebaseUser.displayName || '').trim().split(' ');
          setUser({
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            firstName: displayParts[0] || 'User',
            lastName: displayParts.slice(1).join(' ') || '',
            avatarUrl: firebaseUser.photoURL || null,
          });
        }
      } else {
        setMemoryIdToken(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [fetchDashboardData, fetchTreeData]);

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const token = await result.user.getIdToken();
    setMemoryIdToken(token);
    const dbUser = await apiFetch('/api/me');
    const displayParts = (result.user.displayName || '').trim().split(' ');
    setUser({
      id: String(dbUser.id || result.user.uid),
      uid: result.user.uid,
      email: dbUser.email || result.user.email || '',
      firstName: dbUser.firstName || displayParts[0] || 'User',
      lastName: dbUser.lastName || displayParts.slice(1).join(' ') || '',
      avatarUrl: dbUser.avatarUrl || result.user.photoURL || null,
    });
    await fetchDashboardData();
    await fetchTreeData('1');
  };

  const login = (data: User) => {
    setUser(data);
  };

  const logout = async () => {
    await signOut(auth);
    setMemoryIdToken(null);
    setUser(null);
  };

  const updateProfile = async (data: { firstName: string; lastName: string }) => {
    const updated = await apiFetch('/api/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    setUser((prev) =>
      prev
        ? {
            ...prev,
            firstName: updated.firstName ?? data.firstName,
            lastName: updated.lastName ?? data.lastName,
          }
        : null
    );
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithGoogle, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
