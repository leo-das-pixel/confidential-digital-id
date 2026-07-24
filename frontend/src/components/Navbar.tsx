import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isApp = location.pathname === '/app';

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '16px 0'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: 18
          }}>
            🛡️
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.5px' }}>
            CipherID
          </span>
          <span className="badge badge-primary" style={{ fontSize: 11, padding: '2px 8px' }}>Midnight ZK</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {!isApp ? (
            <>
              <a href="#features" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>Features</a>
              <a href="#privacy" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>Privacy Model</a>
              <Link to="/app" className="btn btn-primary" style={{ fontSize: 14, padding: '8px 18px' }}>
                Launch dApp →
              </Link>
            </>
          ) : (
            <Link to="/" className="btn btn-secondary" style={{ fontSize: 14, padding: '8px 18px' }}>
              ← Back to Overview
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
