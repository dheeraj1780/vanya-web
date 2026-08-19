import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { api, ApiException } from '../api';
import { PLANS } from '../config';
import { SignInPanel } from '../SignInPanel';

export function Account() {
  const { token, entitlement, refreshEntitlement, signOut, loading } = useAuth();
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCancel = async () => {
    if (!token) return;
    setCancelling(true);
    setError('');
    try {
      await api.cancelSubscription(token);
      setCancelled(true);
      setConfirmOpen(false);
      await refreshEntitlement();
    } catch (e) {
      setError(e instanceof ApiException ? e.message : 'Could not cancel — please try again.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="page">Loading…</div>;

  if (!token || !entitlement) {
    return (
      <div className="page">
        <h1 style={{ fontSize: 24, marginBottom: 16 }}>Your account</h1>
        <SignInPanel reason="Sign in to manage your account" />
      </div>
    );
  }

  const plan = PLANS[entitlement.plan] ?? { emoji: '🌱', displayName: entitlement.plan_display_name, priceInr: 0 };
  const isPaid = entitlement.plan === 'green_thumb' || entitlement.plan === 'photosynthesis_phd';

  return (
    <div className="page">
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Your account</h1>

      <div className={`card${isPaid ? ' highlight' : ''}`}>
        <div className="eyebrow">CURRENT PLAN</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>
          {plan.emoji} {plan.displayName ?? entitlement.plan_display_name}
        </div>
        {isPaid && entitlement.expires_at && (
          <p style={{ marginTop: 6 }}>Renews {new Date(entitlement.expires_at).toLocaleDateString()}</p>
        )}
      </div>

      <div className="eyebrow" style={{ margin: '20px 0 10px' }}>THIS WEEK &amp; MONTH</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <UsageRow label="Plant identification" usage={entitlement.identification} />
        <UsageRow label="Care Calculator" usage={entitlement.care_calculator} />
        <UsageRow label="Diagnose" usage={entitlement.diagnose} />
        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 12.5 }}>Plants in your garden</div>
          <p>{entitlement.plant_count} / {entitlement.plant_limit} — permanent slots, never reset</p>
        </div>
      </div>

      {isPaid && (
        <div style={{ marginTop: 24 }}>
          {cancelled ? (
            <p style={{ color: 'var(--text)', fontWeight: 600 }}>
              Your subscription will end at the close of the current billing cycle — you keep access until then.
            </p>
          ) : confirmOpen ? (
            <div className="card center-column">
              <p style={{ fontWeight: 600 }}>Cancel your {plan.displayName} subscription?</p>
              <p>You'll keep access until the current billing cycle ends — nothing is refunded for time already paid for.</p>
              <button className="btn-primary" style={{ background: 'var(--accent)' }} disabled={cancelling} onClick={handleCancel}>
                {cancelling ? <span className="spinner" /> : 'Yes, cancel'}
              </button>
              <button className="btn-text" onClick={() => setConfirmOpen(false)}>
                Never mind
              </button>
            </div>
          ) : (
            <button className="btn-secondary" onClick={() => setConfirmOpen(true)}>
              Cancel subscription
            </button>
          )}
          {error && <p className="error-text" style={{ marginTop: 8 }}>{error}</p>}
        </div>
      )}

      {!isPaid && entitlement.next_plan && (
        <Link to="/upgrade" className="btn-primary" style={{ display: 'block', marginTop: 24, textAlign: 'center', textDecoration: 'none' }}>
          Upgrade to {entitlement.next_plan_display_name}
        </Link>
      )}

      <button className="btn-text" style={{ marginTop: 20 }} onClick={signOut}>
        Sign out
      </button>
    </div>
  );
}

function UsageRow({ label, usage }: { label: string; usage: { used: number; limit: number; period: string } }) {
  const periodLabel = usage.period === 'weekly' ? 'this week' : usage.period === 'monthly' ? 'this month' : 'total';
  return (
    <div className="card" style={{ padding: 12 }}>
      <div style={{ fontWeight: 600, fontSize: 12.5 }}>{label}</div>
      <p>{usage.limit < 0 ? 'Unlimited' : `${usage.used} / ${usage.limit} ${periodLabel}`}</p>
    </div>
  );
}
