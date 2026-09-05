// Public, no sign-in required — same reasoning as Privacy.tsx: Google Play's
// store listing needs a reachable Terms/Refund policy URL for any app that
// sells subscriptions, before the app can be submitted for review. Content
// reflects what billing_service.py and razorpay_client.py actually do (see
// each section's own note), not generic boilerplate.
export function Terms() {
  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>LEGAL</div>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Terms of Service &amp; Refund Policy</h1>
      <p style={{ marginBottom: 28 }}>Last updated: September 6, 2026</p>

      <Section title="Who this covers">
        <p>
          These terms apply to anyone using the Vanya app or this website. By subscribing to a paid plan, you agree
          to the billing terms below in addition to our <a href="/privacy" style={{ color: 'var(--accent)' }}>Privacy Policy</a>.
        </p>
      </Section>

      <Section title="Subscriptions">
        <p>
          Vanya offers two paid plans, billed monthly and auto-renewing until cancelled: <strong>Green Thumb</strong>{' '}
          (₹99/month) and <strong>Photosynthesis PhD</strong> (₹199/month). Subscriptions are purchased only on this
          website, through our payment processor Razorpay — never inside the Vanya app itself. This means your
          subscription is managed here (Account page) or by contacting us, not through Google Play or the App Store.
        </p>
      </Section>

      <Section title="Cancelling">
        <p>
          You can cancel anytime from the Account page. Cancelling stops future billing but doesn't cut off access
          early — you keep your plan's features through the end of the cycle you already paid for. We don't refund
          the unused portion of a cancelled cycle.
        </p>
      </Section>

      <Section title="Changing plans">
        <SubHeading>Downgrading</SubHeading>
        <p>
          Takes effect immediately for features — your account moves to the lower plan's limits right away. Since
          you already paid for the current cycle at the higher price, that's not refunded; your next bill is simply
          the lower amount.
        </p>
        <SubHeading>Upgrading</SubHeading>
        <p>
          Also takes effect immediately, but works the other way on price: you're charged the new plan's full price
          right away, with no credit for the unused days left on your previous plan. There's no partial-month
          proration in either direction — this keeps billing predictable rather than calculating day-by-day amounts.
        </p>
      </Section>

      <Section title="Refunds">
        <p>
          All charges are final. We don't offer refunds for unused time on a cycle you cancelled, for a downgrade's
          higher-priced cycle already paid, or for an upgrade's new full-price charge. If a payment was made in
          error or you believe you were charged incorrectly, contact us below and we'll look into it — genuine
          billing mistakes on our end are made right.
        </p>
      </Section>

      <Section title="Failed or missed payments">
        <p>
          If a renewal charge fails, Razorpay retries it for a short grace period, during which you keep your plan's
          access. If it keeps failing through that window, your subscription ends and your account reverts to the
          free plan — your existing plants and data are kept, only the paid-tier limits are removed.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>If these terms change in a material way, we'll update the date at the top and let you know in the app.</p>
      </Section>

      <Section title="Contact us">
        <p>
          For any billing question, dispute, or request: <strong style={{ color: 'var(--accent)' }}>vanya.care.ops@gmail.com</strong>
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 18, marginBottom: 10 }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 13.5, fontFamily: 'inherit', color: 'var(--text)', marginTop: 6 }}>{children}</h3>;
}
