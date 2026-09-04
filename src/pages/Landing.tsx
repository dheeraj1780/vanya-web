import { Link } from 'react-router-dom';
import { PLANS, PAID_PLAN_ORDER } from '../config';

export function Landing() {
  return (
    <div className="page">
      <div style={{ textAlign: 'center', margin: '40px 0 32px' }}>
        <div style={{ fontSize: 32 }}>🌿</div>
        <h1 style={{ fontSize: 30, marginTop: 8 }}>Vanya</h1>
        <p style={{ marginTop: 8 }}>Identify plants, track care, grow something beautiful.</p>
      </div>

      <div className="eyebrow" style={{ marginBottom: 10 }}>PLANS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <PlanPreview planKey="plantie" />
        {PAID_PLAN_ORDER.map((key) => (
          <PlanPreview key={key} planKey={key} />
        ))}
      </div>

      <div style={{ marginTop: 28, textAlign: 'center' }}>
        <Link to="/upgrade" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>
          Get started
        </Link>
      </div>
    </div>
  );
}

function PlanPreview({ planKey }: { planKey: string }) {
  const plan = PLANS[planKey];
  const highlight = planKey === 'green_thumb';
  return (
    <div className={`card${highlight ? ' highlight' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 19 }}>{plan.emoji}</span>
        <h3 style={{ fontSize: 15.5, flex: 1 }}>{plan.displayName}</h3>
        {highlight && <span className="badge popular">MOST POPULAR</span>}
        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{plan.priceInr === 0 ? 'Free' : `₹${plan.priceInr}/mo`}</span>
      </div>
      <p style={{ marginTop: 6 }}>{plan.tagline}</p>
    </div>
  );
}
