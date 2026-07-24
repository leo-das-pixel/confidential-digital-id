import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [simulatedSecret, setSimulatedSecret] = useState('secret-passcode-99');

  return (
    <div style={{ background: '#ffffff', flex: 1 }}>
      {/* Hero Section */}
      <section style={{ padding: '80px 0 60px', textAlign: 'center' }} className="animate-fade-in">
        <div className="container">
          <div className="badge badge-primary" style={{ marginBottom: 20 }}>
            🔒 Powered by Midnight Network ZK Circuits
          </div>
          <h1 style={{
            fontSize: '52px',
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            maxWidth: 900,
            margin: '0 auto 20px'
          }}>
            Prove Who You Are <br />
            <span style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Without Revealing Who You Are</span>
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#64748b',
            maxWidth: 680,
            margin: '0 auto 36px',
            fontWeight: 400
          }}>
            CipherID allows users to generate zero-knowledge cryptographic proofs of valid digital credentials without publicly exposing names, ID numbers, or private keys.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link to="/app" className="btn btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
              Launch dApp →
            </Link>
            <a href="#privacy" className="btn btn-secondary" style={{ fontSize: 16, padding: '14px 28px' }}>
              How Privacy Works
            </a>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" style={{ padding: '60px 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#0f172a' }}>Why Choose CipherID?</h2>
            <p style={{ color: '#64748b', fontSize: 16 }}>Built specifically for privacy-first compliance and identity verification.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div style={{ background: '#ffffff', padding: 32, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🛡️</div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>Zero-Knowledge Witness</h3>
              <p style={{ color: '#64748b', fontSize: 14 }}>
                Your private credential secret never leaves your local browser or Lace wallet. Verification logic runs in a client-side ZK proof circuit.
              </p>
            </div>

            <div style={{ background: '#ffffff', padding: 32, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>⚡</div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>Public State Auditing</h3>
              <p style={{ color: '#64748b', fontSize: 14 }}>
                Verifiers can publicly verify that a valid credential proof was executed and witness the incrementing proof count on the Midnight ledger.
              </p>
            </div>

            <div style={{ background: '#ffffff', padding: 32, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🔑</div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>Lace Wallet Native</h3>
              <p style={{ color: '#64748b', fontSize: 14 }}>
                Seamless integration with the Midnight Lace privacy wallet via the standard dApp connector API protocol.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive ZK Simulator */}
      <section id="privacy" style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="badge badge-primary">Interactive Demo</span>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: '#0f172a', marginTop: 12 }}>See Selective Disclosure in Action</h2>
            <p style={{ color: '#64748b', fontSize: 16 }}>Compare what stays private in your wallet vs what the public blockchain sees.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900, margin: '0 auto' }}>
            {/* Private Side */}
            <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', padding: 24, borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontWeight: 700, color: '#3730a3' }}>🔒 Private Wallet State</span>
                <span className="badge" style={{ background: '#c7d2fe', color: '#3730a3' }}>Only You See This</span>
              </div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#4338ca' }}>Credential Secret / ID Code:</label>
              <input 
                type="text" 
                value={simulatedSecret}
                onChange={e => setSimulatedSecret(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', marginTop: 6, borderRadius: 6, border: '1px solid #a5b4fc', fontFamily: 'monospace' }}
              />
              <p style={{ fontSize: 12, color: '#4338ca', marginTop: 10 }}>
                This string is fed into the Compact ZK circuit as a private witness. It is NEVER written to the public ledger.
              </p>
            </div>

            {/* Public Side */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: 24, borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>🌐 Public Blockchain State</span>
                <span className="badge badge-success">Visible To Everyone</span>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 6, padding: 12, fontFamily: 'monospace', fontSize: 13 }}>
                <div><strong>Credential Name:</strong> "Confidential Digital ID"</div>
                <div><strong>Total Verifications:</strong> 42</div>
                <div><strong>Witness Status:</strong> <span style={{ color: '#16a34a' }}>Valid Proof Accepted</span></div>
                <div style={{ color: '#dc2626', marginTop: 6 }}><strong>Private Secret:</strong> [REDACTED / ZERO-KNOWLEDGE]</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '60px 0', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 16 }}>Ready to Verify Your Credential?</h2>
          <p style={{ fontSize: 18, color: '#c7d2fe', maxWidth: 600, margin: '0 auto 30px' }}>
            Connect your Lace wallet and test zero-knowledge identity proofs on the Midnight network.
          </p>
          <Link to="/app" className="btn" style={{ background: 'white', color: '#4f46e5', fontSize: 16, padding: '14px 36px', fontWeight: 700 }}>
            Open Confidential dApp
          </Link>
        </div>
      </section>
    </div>
  );
}
