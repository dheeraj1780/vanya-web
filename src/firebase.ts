// Same Firebase project as the Flutter app (see
// ../plant-companion-flutter_2/lib/firebase_options.dart's `web` block) —
// these values are public client config, safe to embed (same principle as
// any Firebase web app; the actual security boundary is Firebase Auth's
// own token verification, done server-side by the backend's Firebase
// Admin SDK, not by keeping this config secret).
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAhYJ-zUgG0h5zvv7h00kdaUvsB-hSgWNw',
  authDomain: 'plant-companion-81d67.firebaseapp.com',
  projectId: 'plant-companion-81d67',
  storageBucket: 'plant-companion-81d67.firebasestorage.app',
  messagingSenderId: '548708201155',
  appId: '1:548708201155:web:b1d92592697223f7e16876',
  measurementId: 'G-28DYB26F49',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');
