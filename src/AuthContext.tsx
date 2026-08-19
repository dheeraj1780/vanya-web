// Mirrors the relevant slice of ../plant-companion-flutter_2/lib/app_state.dart
// — same backend session token concept, same localStorage-as-SharedPreferences
// pattern, same Firebase-UID-is-the-cross-platform-identity principle that
// makes "subscribe on web, use in app" (and vice versa) just work.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider, appleProvider } from './firebase';
import { api } from './api';
import type { Entitlement } from './types';

const SESSION_KEY = 'vanya_session_token';

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  token: string | null;
  entitlement: Entitlement | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshEntitlement: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(SESSION_KEY));
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshEntitlement = async () => {
    const t = localStorage.getItem(SESSION_KEY);
    if (!t) return;
    try {
      const data = await api.getEntitlement(t);
      setEntitlement(data);
    } catch (e) {
      console.warn('Failed to refresh entitlement:', e);
    }
  };

  // Firebase's own auth state drives the backend session — whenever a
  // Firebase user is present (from a popup sign-in just now, or a
  // restored session on reload), exchange it for our backend's session
  // token via the SAME /auth/signin the Flutter app uses, so the
  // resulting user_id is identical on both platforms.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const identityToken = await user.getIdToken();
          const signInData = await api.signInWithFirebase(identityToken);
          localStorage.setItem(SESSION_KEY, signInData.session_token);
          setToken(signInData.session_token);
        } catch (e) {
          console.error('Backend sign-in failed:', e);
        }
      } else {
        localStorage.removeItem(SESSION_KEY);
        setToken(null);
        setEntitlement(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (token) refreshEntitlement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        token,
        entitlement,
        loading,
        signInWithGoogle: async () => {
          await signInWithPopup(auth, googleProvider);
        },
        signInWithApple: async () => {
          await signInWithPopup(auth, appleProvider);
        },
        signOut: async () => {
          await firebaseSignOut(auth);
        },
        refreshEntitlement,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
