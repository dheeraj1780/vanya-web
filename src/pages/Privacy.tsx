// Public, no sign-in required — this is what Google Play's Data Safety
// section and store listing both require a working URL to before the app
// can even be submitted for review. Content reflects what this codebase
// actually does (see each section's own note on where in the code that's
// implemented), not generic boilerplate.
export function Privacy() {
  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <div className="eyebrow" style={{ marginBottom: 6 }}>LEGAL</div>
      <h1 style={{ fontSize: 26, marginBottom: 4 }}>Privacy Policy</h1>
      <p style={{ marginBottom: 28 }}>Last updated: August 31, 2026</p>

      <Section title="Who this policy covers">
        <p>
          This policy explains what VANYA ("we", "us") collects when you use the VANYA app or this website, why, and
          what your choices are. It applies to everyone using VANYA, whether signed in with Google/Apple or using it
          as a guest.
        </p>
      </Section>

      <Section title="Information we collect">
        <SubHeading>Account information</SubHeading>
        <p>
          If you sign in with Google or Apple, we receive your name and email address from that provider so we can
          create your account and keep your data attached to it across devices. We never see or store your
          Google/Apple password.
        </p>
        <SubHeading>Guest use</SubHeading>
        <p>
          If you use VANYA as a guest, we generate a random device identifier stored only on your device — no name,
          email, or other personal information is required or collected.
        </p>
        <SubHeading>Plant photos and care data</SubHeading>
        <p>
          Photos you take or choose to identify a plant, diagnose a problem, or add as a Growth Journey memory are
          uploaded to secure cloud storage and linked to your account. We also store what you enter yourself —
          plant nicknames, notes, and watering history.
        </p>
        <SubHeading>Camera, photo library, and location</SubHeading>
        <p>
          Camera and photo library access is used only at the moment you choose to scan or diagnose a plant, or add
          a photo — never in the background. Location (coarse, never precise) is only requested if you use the Care
          Calculator's weather-based suggestions, and only to work out your season/climate for that calculation —
          you can decline it and still use the rest of the app.
        </p>
        <SubHeading>Notifications</SubHeading>
        <p>If you enable watering reminders, we store a push-notification token to deliver them to your device.</p>
        <SubHeading>Usage data</SubHeading>
        <p>
          We log which features you use (e.g. "identified a plant", "viewed the upgrade screen") to understand how
          people actually use VANYA. These events never include your photos or anything you typed in a free-text
          field.
        </p>
        <SubHeading>Payment information</SubHeading>
        <p>
          Subscriptions are purchased on this website through our payment processor. VANYA never receives or stores
          your card, UPI, or bank details — the payment processor handles payment directly and only tells us
          whether your subscription is active.
        </p>
      </Section>

      <Section title="How we use your information">
        <p>To provide the core service — identifying and diagnosing your plants, tracking their care, and reminding you when they need water. Plant photos you submit for identification or diagnosis are sent to a third-party AI service to analyze — that's how VANYA recognizes species and spots problems. We also use your information to manage your subscription, respond when you contact us, and improve the app based on how it's actually used.</p>
      </Section>

      <Section title="Who we share it with">
        <p>We don't sell your personal information to anyone, ever. We share the minimum necessary with the service providers that make VANYA work:</p>
        <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.7, paddingLeft: 20 }}>
          <li>Google — if you choose Sign in with Google</li>
          <li>Apple — Sign in with Apple, where used</li>
          <li>A third-party AI service — analyzes photos you submit for plant identification/diagnosis</li>
          <li>A cloud storage provider — stores the photos you upload</li>
          <li>Our payment processor — handles subscription billing</li>
          <li>Our hosting providers — run our backend and this website</li>
        </ul>
      </Section>

      <Section title="How long we keep your data">
        <p>
          You can delete your account at any time from the app (Settings → Delete account). This schedules your
          account for permanent removal, with a 24-hour window in which signing back in restores everything exactly
          as it was, in case you change your mind. Once that window closes, your account, plant records, and photos
          are permanently deleted from our systems.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You can access, correct, or delete your data at any time through the app itself. For anything else — a
          question, a request the app doesn't cover, or a concern about your data — contact us below.
        </p>
      </Section>

      <Section title="Children's privacy">
        <p>VANYA is not directed at children under 13, and we do not knowingly collect personal information from them.</p>
      </Section>

      <Section title="Security">
        <p>
          We use reasonable technical and organizational measures to protect your information. No online service can
          guarantee perfect security, but we take this seriously and work with reputable, security-conscious
          providers (see "Who we share it with" above).
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>If this policy changes in a material way, we'll update the date at the top and let you know in the app.</p>
      </Section>

      <Section title="Contact us">
        <p>
          For any privacy question or request: <strong style={{ color: 'var(--accent)' }}>[ADD YOUR PRIVACY CONTACT EMAIL HERE]</strong>
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
