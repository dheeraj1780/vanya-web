import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { Landing } from './pages/Landing';
import { Upgrade } from './pages/Upgrade';
import { Account } from './pages/Account';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <nav style={{ display: 'flex', justifyContent: 'center', gap: 24, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
          <Link to="/" style={{ textDecoration: 'none', fontWeight: 700, color: 'var(--primary)' }}>
            🌿 VANYA
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
