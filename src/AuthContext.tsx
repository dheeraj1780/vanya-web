// Mirrors the relevant slice of ../plant-companion-flutter_2/lib/app_state.dart
// — same backend session token concept, same localStorage-as-SharedPreferences
// pattern, same Firebase-UID-is-the-cross-platform-identity principle that
// makes "subscribe on web, use in app" (and vice versa) just work.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithCustomToken, signInWithPopup, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider, appleProvider } from './firebase';
import { api } from './api';
import type { Entitlement } from './types';

const SESSION_KEY = 'vanya_session_token';

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  token: string | null;
  entitlement: Entitlement | null;
  loading: boolean;
  loginHint: string | null;
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
  const [loginHint, setLoginHint] = useState<string | null>(null);

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

  // Handoff from the VANYA app: PaywallScreen mints a short-lived Firebase
  // custom token for the exact account the user is already signed into
  // there (see backend's POST /auth/web-handoff-token) and opens this site
  // with it as ?auth_token=... — signing in here automatically instead of
  // landing on a bare Google/Apple picker, where it's easy to tap a
  // different account than the one actually using the app and end up
  // subscribing the wrong one. Runs once, before Firebase's own restored-
  // session check below has a chance to matter either way.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const handoffToken = params.get('auth_token');
    if (!handoffToken) return;
    // Stripped from the URL immediately — it's minted for one-time use and
    // shouldn't linger in the address bar, browser history, or get shared/
    // bookmarked with it still attached.
    params.delete('auth_token');
    const cleanSearch = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (cleanSearch ? `?${cleanSearch}` : ''));
    signInWithCustomToken(auth, handoffToken).catch((e) => {
      console.error('Web sign-in handoff failed:', e);
    });
  }, []);

  // Weaker fallback for when the handoff token above couldn't be minted
  // at all (see PaywallScreen._openWebsite's docstring) — the app passes
  // the signed-in email as ?login_hint=..., which pre-selects/suggests
  // that account in Google's own sign-in picker instead of a blank one,
  // rather than fully signing in automatically. Stripped from the URL the
  // same way auth_token is, once read into state.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hint = params.get('login_hint');
    if (!hint) return;
    setLoginHint(hint);
    params.delete('login_hint');
    const cleanSearch = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (cleanSearch ? `?${cleanSearch}` : ''));
  }, []);

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
        loginHint,
        signInWithGoogle: async () => {
          // googleProvider is a shared instance (see ./firebase) --
          // setCustomParameters configures the next OAuth request only;
          // skipped entirely with no hint so Google's normal picker shows.
          if (loginHint) googleProvider.setCustomParameters({ login_hint: loginHint });
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
