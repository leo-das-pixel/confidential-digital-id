import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import './index.css';
import App from './App.tsx';

const networkId =
  import.meta.env.VITE_NETWORK_ID ||
  import.meta.env.VITE_NETWORK ||
  (import.meta.env.PROD ? 'preprod' : 'undeployed');
setNetworkId(networkId);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
