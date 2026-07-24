export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      padding: '40px 0',
      marginTop: 'auto'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>CipherID</span>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            Confidential Digital Identity powered by Midnight Network zero-knowledge proofs.
          </p>
        </div>
        <div style={{ color: '#94a3b8', fontSize: 14 }}>
          Rise-In Midnight Hackathon Submission • {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
