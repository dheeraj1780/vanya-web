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
  // Which plan card is showing its "are you sure" strip for a downgrade —
  // same two-step confirm pattern Account.tsx's cancel-subscription flow
  // already uses, rather than a native window.confirm().
  const [confirmingDowngrade, setConfirmingDowngrade] = useState<string | null>(null);
  const [downgradeDone, setDowngradeDone] = useState<string | null>(null);

  // The plan the user is actively paying for right now, if any — null
  // covers guest/plantie/expired/cancelled alike, all of which are free
  // to subscribe from normally.
  const activePaidPlanKey =
    entitlement?.subscription_status === 'active' && (entitlement.plan === 'green_thumb' || entitlement.plan === 'photosynthesis_phd')
      ? entitlement.plan
      : null;
  const activePriceInr = activePaidPlanKey ? PLANS[activePaidPlanKey].priceInr : null;

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

  // Usually no Checkout involved — this is a downgrade (see backend's
  // billing_service.change_plan): no new charge, so normally nothing for
  // Razorpay Checkout to collect, and feature access flips immediately on
  // success. EXCEPTION: Razorpay's in-place plan-change endpoint doesn't
  // support UPI Autopay mandates (card-only) — most of VANYA's India
  // subscribers pay via UPI, so the backend falls back to cancel + a new
  // subscription for the lower plan (requires_checkout: true), which needs
  // this same one-time Checkout confirmation subscribing normally uses.
  const handleDowngrade = async (planKey: 'green_thumb' | 'photosynthesis_phd') => {
    if (!token) return;
    setBusyPlan(planKey);
    setErrorMessage('');
    try {
      const result = await api.changePlan(token, planKey);
      await refreshEntitlement(); // features already flipped server-side either way

      if (result.requires_checkout && result.subscription_id && result.razorpay_key_id) {
        setConfirmingDowngrade(null);
        const plan = PLANS[planKey];
        const checkout = new window.Razorpay({
          key: result.razorpay_key_id,
          subscription_id: result.subscription_id,
          name: 'VANYA',
          description: `${plan.displayName} — ₹${plan.priceInr}/month`,
          prefill: { email: firebaseUser?.email ?? undefined, name: firebaseUser?.displayName ?? undefined },
          theme: { color: '#1f3d30' },
          handler: () => {
            setDowngradeDone(planKey);
            setBusyPlan(null);
          },
          modal: {
            ondismiss: () => {
              // Already on the new plan's features either way — only the
              // new mandate's confirmation was skipped, so say that
              // plainly instead of implying the downgrade itself failed.
              setErrorMessage(
                `You're on ${plan.displayName} already, but you still need to confirm the new payment method — otherwise it won't continue billing after your current cycle ends.`
              );
              setBusyPlan(null);
            },
          },
        });
        checkout.open();
        return;
      }

      setConfirmingDowngrade(null);
      setDowngradeDone(planKey);
    } catch (e) {
      // Leave confirmingDowngrade set (was cleared unconditionally before)
      // so the error renders right inside the still-open confirm strip
      // instead of only in the page-bottom banner, which is easy to miss
      // below the fold and reads as "the button did nothing".
      setErrorMessage(e instanceof ApiException ? e.message : 'Could not change your plan. Please try again.');
      setBusyPlan(null);
      return;
    }
    setBusyPlan(null);
  };

  if (loading) return <div className="page">Loading…</div>;

  return (
    <div className="page">
      <div className="eyebrow">GROW FURTHER WITH VANYA</div>
      <h1 style={{ fontSize: 26, margin: '6px 0 8px' }}>Choose your plan</h1>
      <p style={{ marginBottom: 20 }}>More identifications, more Care Calculator runs, more room for your garden.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {PAID_PLAN_ORDER.map((planKey) => {
          const plan = PLANS[planKey];
          const isCurrent = entitlement?.plan === planKey;
          const isDowngrade = activePriceInr !== null && !isCurrent && plan.priceInr < activePriceInr;
          // Already paying for a different plan and this card costs more —
          // blocked for now rather than left open: clicking "Subscribe"
          // here used to just create a SECOND Razorpay subscription
          // alongside the still-active first one, with nothing cancelling
          // the old one. Downgrading has its own safe, no-Checkout path
          // (change_plan) below; an in-place upgrade would need its own
          // proration/charge design, which this doesn't attempt.
          const isBlockedUpgrade = activePriceInr !== null && !isCurrent && plan.priceInr > activePriceInr;

          return (
            <PlanCard
              key={planKey}
              plan={plan}
              isCurrent={isCurrent}
              highlight={planKey === 'green_thumb'}
              busy={busyPlan === planKey}
              disabled={!token || busyPlan !== null}
              isDowngrade={isDowngrade}
              isBlockedUpgrade={isBlockedUpgrade}
              confirming={confirmingDowngrade === planKey}
              confirmError={confirmingDowngrade === planKey ? errorMessage : ''}
              justDowngraded={downgradeDone === planKey}
              onSubscribe={() => handleSubscribe(planKey)}
              onRequestDowngrade={() => setConfirmingDowngrade(planKey)}
              onCancelDowngrade={() => setConfirmingDowngrade(null)}
              onConfirmDowngrade={() => handleDowngrade(planKey as 'green_thumb' | 'photosynthesis_phd')}
            />
          );
        })}
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
  isDowngrade,
  isBlockedUpgrade,
  confirming,
  confirmError,
  justDowngraded,
  onSubscribe,
  onRequestDowngrade,
  onCancelDowngrade,
  onConfirmDowngrade,
}: {
  plan: PlanConfig;
  isCurrent: boolean;
  highlight: boolean;
  busy: boolean;
  disabled: boolean;
  isDowngrade: boolean;
  isBlockedUpgrade: boolean;
  confirming: boolean;
  confirmError: string;
  justDowngraded: boolean;
  onSubscribe: () => void;
  onRequestDowngrade: () => void;
  onCancelDowngrade: () => void;
  onConfirmDowngrade: () => void;
}) {
  return (
    <div className={`card${highlight ? ' highlight' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 19 }}>{plan.emoji}</span>
        <h3 style={{ fontSize: 15.5, flex: 1 }}>{plan.displayName}</h3>
        {/* isCurrent checked first — a plan that's both "Most Popular" and
            the user's actual current plan must say CURRENT, not an upsell
            ribbon (mirrors the same fix in the app's PaywallScreen). */}
        {isCurrent ? <span className="badge current">CURRENT</span> : highlight ? <span className="badge popular">MOST POPULAR</span> : null}
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

      {justDowngraded ? (
        <p style={{ marginTop: 14, fontWeight: 600, color: 'var(--primary)' }}>
          You're on {plan.displayName} now, limits and all — your next bill (not this cycle) will reflect the ₹{plan.priceInr}/month price.
        </p>
      ) : confirming ? (
        <div style={{ marginTop: 14 }}>
          <p style={{ fontWeight: 600 }}>Switch to {plan.displayName} right now?</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            You'll get {plan.displayName}'s limits immediately — no refund for the rest of your current cycle, and your next
            bill will be ₹{plan.priceInr}/month instead.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button className="btn-primary" style={{ background: 'var(--accent)' }} disabled={busy} onClick={onConfirmDowngrade}>
              {busy ? <span className="spinner" /> : 'Yes, switch now'}
            </button>
            <button className="btn-secondary" disabled={busy} onClick={onCancelDowngrade}>
              Never mind
            </button>
          </div>
          {confirmError && <p className="error-text" style={{ marginTop: 10 }}>{confirmError}</p>}
        </div>
      ) : isBlockedUpgrade ? (
        <>
          <button className="btn-primary" style={{ marginTop: 14 }} disabled>
            Cancel your current plan first
          </button>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
            Manage or cancel your active plan from the Account page, then subscribe here.
          </p>
        </>
      ) : (
        <button
          className="btn-primary"
          style={{ marginTop: 14 }}
          disabled={disabled || isCurrent}
          onClick={isDowngrade ? onRequestDowngrade : onSubscribe}
        >
          {busy ? <span className="spinner" /> : isCurrent ? 'Current plan' : isDowngrade ? `Downgrade to ${plan.displayName}` : `Subscribe to ${plan.displayName}`}
        </button>
      )}
    </div>
  );
}
