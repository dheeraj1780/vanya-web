import { useState } from 'react';
import { useAuth } from './AuthContext';

/// Shared across Upgrade/Account — same Firebase project as the app, so
/// signing in here produces the exact same user_id the app already uses.
export function SignInPanel({ reason }: { reason: string }) {
  const { signInWithGoogle, signInWithApple } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (fn: () => Promise<void>) => {
    setLoading(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError('Could not sign in. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card center-column">
      <p style={{ fontWeight: 600, color: 'var(--text)' }}>{reason}</p>
      <button className="btn-secondary" disabled={loading} onClick={() => handle(signInWithGoogle)}>
        Continue with Google
      </button>
      <button className="btn-secondary" disabled={loading} onClick={() => handle(signInWithApple)}>
        Continue with Apple
      </button>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
