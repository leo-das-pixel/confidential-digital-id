import { useState, useEffect } from 'react';
import { initializeProviders } from './midnight';
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import * as HelloWorld from './managed/hello-world/contract/index.js';

import { Buffer } from 'buffer';

const PRIVATE_STATE_ID = 'helloWorldPrivateState';

export default function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [network, setNetwork] = useState('undeployed');
  const [contractAddress, setContractAddress] = useState(import.meta.env.VITE_CONTRACT_ADDRESS || '');
  const [secret, setSecret] = useState('');
  
  const [credentialName, setCredentialName] = useState<string | null>(null);
  const [verificationCount, setVerificationCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [providers, setProviders] = useState<any>(null);

  const connectWallet = async () => {
    try {
      setLoading(true);
      setMessage('Connecting to wallet...');
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
        setCredentialName(Buffer.from(ledgerState.credentialName).toString());
        setVerificationCount(Number(ledgerState.verificationCount));
        setMessage('State refreshed.');
      } else {
        setMessage('No state found for this contract.');
      }
    } catch (e: any) {
      setMessage(`Failed to read state: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const verifyCredential = async () => {
    if (!secret) return setMessage('Please enter a secret.');
    try {
      setLoading(true);
      setMessage('Verifying credential... (this can take 30-60s)');
      const deployed = await getContract();
      if (!deployed) throw new Error('Contract not found');
      
      const tx = await (deployed as any).callTx.verifyCredential(secret);
      setMessage(`✅ Credential verified! Tx: ${tx.public.txId}`);
      await readState(); // refresh state
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
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 800, margin: '40px auto', padding: 20 }}>
      <h1 style={{ color: '#2b2b2b' }}>Confidential Digital ID</h1>
      
      <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: 8, marginBottom: 20 }}>
        <h3>Privacy Model (Confidential Credentials)</h3>
        <p><strong>What observers learn:</strong> Only the public credential name and the total number of successful verification proofs.</p>
        <p><strong>What observers CANNOT learn:</strong> The private credential secret you enter. It remains a zero-knowledge witness.</p>
        <p>This dApp demonstrates selective disclosure using the Midnight blockchain.</p>
      </div>

      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: 8, marginBottom: 20 }}>
        <h3>Status</h3>
        <p>Network: <strong>{network}</strong> | Wallet: <strong>{walletConnected ? 'Connected (Lace)' : 'Disconnected'}</strong></p>
        {!walletConnected && <button onClick={connectWallet} disabled={loading}>Connect Lace Wallet</button>}
        
        <div style={{ marginTop: 10 }}>
          <label>Contract Address: </label>
          <input 
            value={contractAddress} 
            onChange={e => setContractAddress(e.target.value)} 
            placeholder="Enter deployed contract address" 
            style={{ width: '100%', padding: 8, marginTop: 5 }}
          />
        </div>
      </div>

      {walletConnected && (
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: 1, padding: '20px', border: '1px solid #cce5ff', background: '#e6f2ff', borderRadius: 8 }}>
            <h3>Verify Private Credential</h3>
            <p style={{ fontSize: 14 }}>Enter your private secret below to generate a ZK proof of verification.</p>
            <input 
              type="password"
              value={secret} 
              onChange={e => setSecret(e.target.value)} 
              placeholder="e.g. 'my-secret-id-code'" 
              style={{ width: '100%', padding: 8, marginBottom: 10 }}
            />
            <button onClick={verifyCredential} disabled={loading} style={{ background: '#0066cc', color: 'white', padding: '10px 15px', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              {loading ? 'Processing...' : 'Verify Credential'}
            </button>
          </div>

          <div style={{ flex: 1, padding: '20px', border: '1px solid #d4edda', background: '#e2f3e5', borderRadius: 8 }}>
            <h3>Public Verification State</h3>
            <p><strong>Credential Name:</strong> {credentialName || '?'}</p>
            <p><strong>Verification Count:</strong> {verificationCount !== null ? verificationCount : '?'}</p>
            <button onClick={readState} disabled={loading} style={{ background: '#28a745', color: 'white', padding: '5px 10px', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Refresh State</button>
          </div>
        </div>
      )}

      {message && (
        <div style={{ marginTop: 20, padding: 15, background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: 8 }}>
          {message}
        </div>
      )}
    </div>
  );
}
