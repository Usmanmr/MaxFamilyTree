import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

// Keep ID token in memory (never in localStorage)
let currentIdToken: string | null = null;

export const setMemoryIdToken = (token: string | null) => {
  currentIdToken = token;
};

export const getMemoryIdToken = async (): Promise<string | null> => {
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      currentIdToken = token;
      return token;
    } catch (err) {
      console.error('Failed to refresh ID token:', err);
    }
  }
  return currentIdToken;
};

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = await getMemoryIdToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(url, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `Request failed with status ${response.status}`);
  }
  return response.json();
};
