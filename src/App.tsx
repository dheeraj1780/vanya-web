import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { Landing } from './pages/Landing';
import { Upgrade } from './pages/Upgrade';
import { Account } from './pages/Account';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { DeleteAccount } from './pages/DeleteAccount';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <nav style={{ display: 'flex', justifyContent: 'center', gap: 24, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
          <Link to="/" style={{ textDecoration: 'none', fontWeight: 700, color: 'var(--primary)' }}>
            🌿 Vanya
          </Link>
          <Link to="/upgrade" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 13.5, alignSelf: 'center' }}>
            Plans
          </Link>
          <Link to="/account" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 13.5, alignSelf: 'center' }}>
            Account
          </Link>
        </nav>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/account" element={<Account />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/delete-account" element={<DeleteAccount />} />
        </Routes>
        {/* Play Store's Data Safety section and store listing both need a
            reachable Privacy Policy URL — a footer link keeps it findable
            from every page, not just linked in from the app's Settings.
            Terms/Refund policy is required alongside it for any app-listing
            with in-app purchases (Green Thumb / Photosynthesis PhD). */}
        <footer style={{ textAlign: 'center', padding: '32px 20px', borderTop: '1px solid var(--border)', marginTop: 20, display: 'flex', justifyContent: 'center', gap: 16 }}>
          <Link to="/privacy" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 12.5 }}>
            Privacy Policy
          </Link>
          <Link to="/terms" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 12.5 }}>
            Terms &amp; Refund Policy
          </Link>
          <Link to="/delete-account" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 12.5 }}>
            Delete Account
          </Link>
        </footer>
      </BrowserRouter>
    </AuthProvider>
  );
}
