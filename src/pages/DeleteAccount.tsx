// Public, no sign-in required — Play Console's Account & Data Deletion
// section requires a way to request account deletion from the WEB, not
// just from inside the app, for any app that lets users create an
// account. In-app deletion (Settings → Delete account) already exists
// and is the faster path; this page is the required fallback for anyone
// who can't or doesn't want to open the app first. Content mirrors what
// account_service.py actually does (see Privacy.tsx's "How long we keep
// your data" section, same facts), not generic boilerplate.
export function DeleteAccount() {
  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>ACCOUNT</div>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Delete your account</h1>
      <p style={{ marginBottom: 28 }}>Last updated: September 6, 2026</p>

      <Section title="The fastest way: inside the app">
        <p>
          Open Vanya, go to <strong>Settings → Delete account</strong>, and confirm. This works for both guest and
          signed-in accounts and takes effect immediately — no email required.
        </p>
      </Section>

      <Section title="Don't have the app, or can't sign in?">
        <p>
          Email <strong style={{ color: 'var(--accent)' }}>vanya.care.ops@gmail.com</strong> from the address you
          signed up with (or tell us the Google/Apple account you used) and ask us to delete your account. We'll
          verify it's really your account before acting on it, and confirm once it's done.
        </p>
      </Section>

      <Section title="What gets deleted">
        <p>
          Your account, plant records, photos, and preferences. Requesting deletion starts a 24-hour window — signing
          back in during that window restores everything exactly as it was, in case you change your mind. Once that
          window closes, everything is permanently removed from our systems.
        </p>
      </Section>

      <Section title="What doesn't get deleted immediately">
        <p>
          If you have an active paid subscription, deleting your account does not automatically cancel the Razorpay
          mandate — cancel it separately from the Account page (or ask us to, in your deletion email) so you're not
          billed after your account is gone. See our{' '}
          <a href="/terms" style={{ color: 'var(--accent)' }}>Terms &amp; Refund Policy</a> for how cancellation
          works.
        </p>
      </Section>

      <Section title="Questions">
        <p>
          See our <a href="/privacy" style={{ color: 'var(--accent)' }}>Privacy Policy</a> for exactly what we
          collect and why, or email <strong style={{ color: 'var(--accent)' }}>vanya.care.ops@gmail.com</strong> with
          anything else.
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
