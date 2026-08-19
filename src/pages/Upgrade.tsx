import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { api, ApiException } from '../api';
import { PLANS, PAID_PLAN_ORDER, type PlanConfig } from '../config';
import { SignInPanel } from '../SignInPanel';

type Status = 'idle' | 'opening' | 'confirming' | 'done' | 'error';

export function Upgrade() {
  const { token, firebaseUser, entitlement, refreshEntitlement, loading } = useAuth();
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [busyPlan, setBusyPlan] = useState<string | null>(null);

  const handleSubscribe = async (planKey: 'green_thumb' | 'photosynthesis_phd') => {
    if (!token) return;
    setBusyPlan(planKey);
    setStatus('opening');
    setErrorMessage('');
    try {
      const { subscription_id, razorpay_key_id } = await api.createSubscription(token, planKey);
      const plan = PLANS[planKey];

      const checkout = new window.Razorpay({
        key: razorpay_key_id,
        subscription_id,
        name: 'VANYA',
        description: `${plan.displayName} — ₹${plan.priceInr}/month`,
        prefill: { email: firebaseUser?.email ?? undefined, name: firebaseUser?.displayName ?? undefined },
        theme: { color: '#1f3d30' },
        handler: () => {
          // Razorpay reported success — the ACTUAL entitlement flip only
          // happens once our backend's webhook processes it (see
          // billing_service.py's trust boundary), so poll rather than
          // trusting this callback directly.
          confirmActivation(planKey);
        },
        modal: {
          ondismiss: () => {
            if (status !== 'confirming' && status !== 'done') setStatus('idle');
            setBusyPlan(null);
          },
        },
      });
      checkout.open();
    } catch (e) {
      setStatus('error');
      setBusyPlan(null);
      setErrorMessage(e instanceof ApiException ? e.message : 'Could not start checkout. Please try again.');
    }
  };

  const confirmActivation = async (planKey: string) => {
    setStatus('confirming');
    if (!token) return;
    for (let attempt = 0; attempt < 8; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        const result = await api.getSubscriptionStatus(token);
        if (result.subscription_status === 'active' && result.plan === planKey) {
          await refreshEntitlement();
          setStatus('done');
          setBusyPlan(null);
          return;
        }
      } catch (e) {
        console.warn('Status poll failed:', e);
      }
    }
    // Webhook hasn't landed yet after ~16s — not an error, just slower
    // than usual (Razorpay's own delivery can lag). Reassure rather than
    // alarm; refreshEntitlement will pick it up whenever it does arrive.
    setStatus('done');
    setBusyPlan(null);
  };

  if (loading) return <div className="page">Loading…</div>;

  return (
    <div className="page">
      <div className="eyebrow">GROW FURTHER WITH VANYA</div>
      <h1 style={{ fontSize: 26, margin: '6px 0 8px' }}>Choose your plan</h1>
      <p style={{ marginBottom: 20 }}>More identifications, more Care Calculator runs, more room for your garden.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {PAID_PLAN_ORDER.map((planKey) => (
          <PlanCard
            key={planKey}
            plan={PLANS[planKey]}
            isCurrent={entitlement?.plan === planKey}
            highlight={planKey === 'green_thumb'}
            busy={busyPlan === planKey}
            disabled={!token || busyPlan !== null}
            onSubscribe={() => handleSubscribe(planKey)}
          />
        ))}
      </div>

      {status === 'confirming' && (
        <div className="card" style={{ marginTop: 16, textAlign: 'center' }}>
          <span className="spinner" style={{ borderTopColor: 'var(--primary)', borderColor: 'var(--border)' }} />
          <p style={{ marginTop: 8 }}>Confirming your payment…</p>
        </div>
      )}
      {status === 'done' && (
        <div className="card center-column" style={{ marginTop: 16 }}>
          <p style={{ fontWeight: 600, color: 'var(--primary)' }}>You're all set 🌿</p>
          <p>Open the VANYA app — your new plan will show up there automatically.</p>
        </div>
      )}
      {errorMessage && <p className="error-text" style={{ marginTop: 12 }}>{errorMessage}</p>}

      {!token && (
        <div style={{ marginTop: 20 }}>
          <SignInPanel reason="Sign in to subscribe" />
        </div>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  isCurrent,
  highlight,
  busy,
  disabled,
  onSubscribe,
}: {
  plan: PlanConfig;
  isCurrent: boolean;
  highlight: boolean;
  busy: boolean;
  disabled: boolean;
  onSubscribe: () => void;
}) {
  return (
    <div className={`card${highlight ? ' highlight' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 19 }}>{plan.emoji}</span>
        <h3 style={{ fontSize: 15.5, flex: 1 }}>{plan.displayName}</h3>
        {highlight ? <span className="badge popular">MOST POPULAR</span> : isCurrent ? <span className="badge current">CURRENT</span> : null}
      </div>
      <p style={{ marginTop: 6 }}>{plan.tagline}</p>
      <div style={{ fontSize: 26, fontFamily: "'Fraunces', serif", fontWeight: 600, color: 'var(--primary)', marginTop: 8 }}>
        ₹{plan.priceInr}<span style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'inherit', fontWeight: 400 }}>/month</span>
      </div>
      <ul className="feature-list">
        <li>{plan.maxPlants} plants in your garden</li>
        <li>{plan.wishlistLimit} wishlist slots</li>
        <li>{plan.identification.limit} identification{plan.identification.limit === 1 ? '' : 's'} / {plan.identification.period}</li>
        <li>{plan.careCalculator.limit} Care Calculator use{plan.careCalculator.limit === 1 ? '' : 's'} / {plan.careCalculator.period}</li>
        <li>{plan.diagnose.limit} diagnosis{plan.diagnose.limit === 1 ? '' : 'es'} / {plan.diagnose.period}</li>
        {plan.gardenSetupIdentifications > 0 && <li>{plan.gardenSetupIdentifications} bonus identifications to set up your garden</li>}
      </ul>
      <button className="btn-primary" style={{ marginTop: 14 }} disabled={disabled || isCurrent} onClick={onSubscribe}>
        {busy ? <span className="spinner" /> : isCurrent ? 'Current plan' : `Subscribe to ${plan.displayName}`}
      </button>
    </div>
  );
}
