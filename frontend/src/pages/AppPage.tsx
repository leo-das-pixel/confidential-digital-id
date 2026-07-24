import { useState, useEffect } from 'react';
import { initializeProviders } from '../midnight';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import * as HelloWorld from '../managed/hello-world/contract/index.js';

const PRIVATE_STATE_ID = 'helloWorldPrivateState';

export default function AppPage() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [network, setNetwork] = useState('undeployed');
  const [contractAddress, setContractAddress] = useState(import.meta.env.VITE_CONTRACT_ADDRESS || '');
  const [secret, setSecret] = useState('');
  
  const [credentialName, setCredentialName] = useState<string | null>(null);
  const [verificationCount, setVerificationCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');
  const [providers, setProviders] = useState<any>(null);

  const copyAddress = () => {
    if (!contractAddress) return;
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      setMessage('Connecting to Midnight Lace wallet...');
      const networkId = import.meta.env.VITE_NETWORK_ID || 'undeployed';
      setNetwork(networkId);
      
      const newProviders = await initializeProviders(networkId, window.location.origin + '/hello-world');
      setProviders(newProviders);
      setWalletConnected(true);
      setMessage('Wallet connected successfully.');
    } catch (e: any) {
      setMessage(`Failed to connect wallet: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getContract = async () => {
    if (!providers || !contractAddress) return null;
    const compiledContract = CompiledContract.make('hello-world', HelloWorld.Contract).pipe(
      CompiledContract.withVacantWitnesses,
      CompiledContract.withCompiledFileAssets(window.location.origin + '/hello-world')
    );

    return findDeployedContract(providers, {
      compiledContract: compiledContract as any,
      contractAddress,
      privateStateId: PRIVATE_STATE_ID,
      initialPrivateState: {},
    });
  };

  const readState = async () => {
    if (!providers || !contractAddress) return;
    try {
      setLoading(true);
      const contractState = await providers.publicDataProvider.queryContractState(contractAddress);
      if (contractState) {
        const ledgerState = HelloWorld.ledger(contractState.data);
        setCredentialName(new TextDecoder().decode(Uint8Array.from(ledgerState.credentialName)));
        setVerificationCount(Number(ledgerState.verificationCount));
        setMessage('State refreshed successfully.');
      } else {
        setMessage('No state found for this contract address.');
      }
    } catch (e: any) {
      setMessage(`Failed to read state: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const verifyCredential = async () => {
    if (!secret) return setMessage('Please enter a credential secret.');
    try {
      setLoading(true);
      setMessage('Generating ZK proof and submitting verification transaction... (30-60s)');
      const deployed = await getContract();
      if (!deployed) throw new Error('Contract not found or not connected');
      
      const tx = await (deployed as any).callTx.verifyCredential(secret);
      setMessage(`✅ Credential verified! Transaction ID: ${tx.public.txId}`);
      await readState();
    } catch (e: any) {
      setMessage(`❌ Verification failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletConnected && contractAddress) {
      readState();
    }
  }, [walletConnected, contractAddress]);

  return (
    <div style={{ background: '#f8fafc', flex: 1, padding: '40px 0' }} className="animate-fade-in">
      <div className="container" style={{ maxWidth: 960 }}>
        {/* App Header Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: 28,
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 24
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>Digital Identity Verification dApp</h2>
              <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Execute zero-knowledge identity proofs on the Midnight network.</p>
            </div>
            
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span className="badge badge-primary">Network: {network}</span>
              <span className={`badge ${walletConnected ? 'badge-success' : ''}`} style={{ background: walletConnected ? undefined : '#f1f5f9', color: walletConnected ? undefined : '#64748b' }}>
                {walletConnected ? '🟢 Lace Connected' : '⚪ Disconnected'}
              </span>
            </div>
          </div>

          {!walletConnected && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, color: '#64748b' }}>Connect your Midnight Lace wallet to get started.</span>
              <button className="btn btn-primary" onClick={connectWallet} disabled={loading} style={{ fontSize: 14, padding: '10px 20px' }}>
                {loading ? 'Connecting...' : 'Connect Lace Wallet'}
              </button>
            </div>
          )}

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Deployed Contract Address</label>
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <input 
                value={contractAddress} 
                onChange={e => setContractAddress(e.target.value)} 
                placeholder="0x..." 
                style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, fontFamily: 'monospace' }}
              />
              <button 
                className="btn btn-secondary" 
                onClick={copyAddress} 
                disabled={!contractAddress} 
                title="Copy contract address to clipboard"
                style={{ fontSize: 14, padding: '10px 14px' }}
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
              {walletConnected && (
                <button className="btn btn-secondary" onClick={readState} disabled={loading || !contractAddress} style={{ fontSize: 14, padding: '10px 16px' }}>
                  Load State
                </button>
              )}
            </div>
          </div>
        </div>

        {/* dApp Execution Panels */}
        {walletConnected ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Panel 1: Verify Credential */}
            <div style={{ background: '#ffffff', borderRadius: 12, padding: 28, border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 20 }}>🔐</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Private Credential Verification</h3>
              </div>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
                Enter your private credential secret code. A ZK proof will be generated locally in your browser.
              </p>

              <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Credential Secret Code</label>
              <input 
                type="password"
                value={secret} 
                onChange={e => setSecret(e.target.value)} 
                placeholder="e.g. secret-id-123" 
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, marginTop: 6, marginBottom: 20 }}
              />

              <button className="btn btn-primary" onClick={verifyCredential} disabled={loading} style={{ width: '100%', padding: '12px' }}>
                {loading ? 'Processing ZK Proof...' : 'Verify Credential (ZK)'}
              </button>
            </div>

            {/* Panel 2: Public Ledger State */}
            <div style={{ background: '#ffffff', borderRadius: 12, padding: 28, border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 20 }}>📊</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>Public State Ledger</h3>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 16, border: '1px solid #f1f5f9', marginBottom: 20 }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>CREDENTIAL NAME</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                    {credentialName || 'Not loaded'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>TOTAL VERIFICATION PROOFS</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#4f46e5', marginTop: 2 }}>
                    {verificationCount !== null ? verificationCount : '0'}
                  </div>
                </div>
              </div>

              <button className="btn btn-secondary" onClick={readState} disabled={loading} style={{ width: '100%', padding: '10px' }}>
                Refresh Public State
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: '#ffffff', borderRadius: 12, padding: 40, textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: 40 }}>⚡</span>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginTop: 12 }}>Wallet Connection Required</h3>
            <p style={{ color: '#64748b', fontSize: 15, maxWidth: 500, margin: '8px auto 24px' }}>
              Please connect your Midnight Lace browser wallet using the button above to interact with the ZK credential circuits.
            </p>
          </div>
        )}

        {/* Status Toast Notification */}
        {message && (
          <div style={{
            marginTop: 24,
            padding: '16px 20px',
            background: message.includes('❌') ? '#fef2f2' : message.includes('✅') ? '#f0fdf4' : '#eef2ff',
            border: `1px solid ${message.includes('❌') ? '#fecaca' : message.includes('✅') ? '#bbf7d0' : '#c7d2fe'}`,
            borderRadius: 8,
            color: message.includes('❌') ? '#991b1b' : message.includes('✅') ? '#166534' : '#3730a3',
            fontSize: 14,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
