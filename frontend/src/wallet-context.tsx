import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { loadConfig, saveContractAddressOverride, type AppConfig } from '@/config';
import { pushActivity } from '@/lib/activity';
import {
  initializeProviders,
  waitForLace,
  isLaceInstalled,
  LACE_STORE_URL,
  type MidnightProviders,
} from '@/midnight';

const AUTOCONNECT_KEY = 'cdi:lace-autoconnect';

type PublicState = {
  credentialName: string;
  verificationCount: bigint;
};

type WalletContextValue = {
  config: AppConfig;
  laceInstalled: boolean;
  laceReady: boolean;
  providers: MidnightProviders | null;
  connecting: boolean;
  walletError: string | null;
  publicState: PublicState | null;
  stateLoading: boolean;
  stateError: string | null;
  laceStoreUrl: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshPublicState: () => Promise<void>;
  setContractAddress: (address: string) => void;
  clearContractAddressOverride: () => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

async function contractApi() {
  return import('@/contract');
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(() => loadConfig());
  const [laceInstalled, setLaceInstalled] = useState(false);
  const [laceReady, setLaceReady] = useState(false);
  const [providers, setProviders] = useState<MidnightProviders | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [publicState, setPublicState] = useState<PublicState | null>(null);
  const [stateLoading, setStateLoading] = useState(false);
  const [stateError, setStateError] = useState<string | null>(null);

  const reloadConfig = useCallback(() => setConfig(loadConfig()), []);

  useEffect(() => {
    const onConfig = () => reloadConfig();
    window.addEventListener('cdi:config', onConfig);
    reloadConfig();
    return () => window.removeEventListener('cdi:config', onConfig);
  }, [reloadConfig]);

  const setContractAddress = useCallback((address: string) => {
    saveContractAddressOverride(address);
    setConfig(loadConfig());
    pushActivity('settings_update', 'Contract address updated', address.trim());
  }, []);

  const clearContractAddressOverride = useCallback(() => {
    saveContractAddressOverride(null);
    setConfig(loadConfig());
    pushActivity('settings_update', 'Contract address override cleared');
  }, []);

  const refreshPublicState = useCallback(async () => {
    if (!config.contractAddress) {
      setStateError('No contract address. Set it in Settings or VITE_CONTRACT_ADDRESS.');
      return;
    }
    if (!providers) {
      setStateError('Connect Lace to read on-chain state (or ensure indexer env is set).');
      return;
    }
    setStateLoading(true);
    setStateError(null);
    try {
      const { getPublicState } = await contractApi();
      setPublicState(await getPublicState(config, providers));
    } catch (err) {
      setStateError(err instanceof Error ? err.message : String(err));
    } finally {
      setStateLoading(false);
    }
  }, [config, providers]);

  const connect = useCallback(async () => {
    setConnecting(true);
    setWalletError(null);
    try {
      const p = await initializeProviders(config.network, `${window.location.origin}/hello-world`);
      setProviders(p);
      localStorage.setItem(AUTOCONNECT_KEY, '1');
      pushActivity('wallet_connect', 'Lace wallet connected', p.addressLabel);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setWalletError(message);
      pushActivity('wallet_disconnect', 'Wallet connect failed', message);
    } finally {
      setConnecting(false);
    }
  }, [config.network]);

  const disconnect = useCallback(() => {
    setProviders(null);
    localStorage.setItem(AUTOCONNECT_KEY, '0');
    pushActivity('wallet_disconnect', 'Lace wallet disconnected');
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const found = await waitForLace();
      if (cancelled) return;
      setLaceInstalled(found || isLaceInstalled());
      setLaceReady(true);
      const auto = localStorage.getItem(AUTOCONNECT_KEY);
      if (found && auto !== '0') {
        setConnecting(true);
        try {
          const p = await initializeProviders(
            config.network,
            `${window.location.origin}/hello-world`,
          );
          if (!cancelled) {
            setProviders(p);
            localStorage.setItem(AUTOCONNECT_KEY, '1');
            pushActivity('wallet_connect', 'Lace auto-connected', p.addressLabel);
          }
        } catch (err) {
          if (!cancelled) {
            setWalletError(err instanceof Error ? err.message : String(err));
          }
        } finally {
          if (!cancelled) setConnecting(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [config.network]);

  useEffect(() => {
    if (config.contractAddress && providers) void refreshPublicState();
  }, [config.contractAddress, providers, refreshPublicState]);

  const value = useMemo(
    () => ({
      config,
      laceInstalled,
      laceReady,
      providers,
      connecting,
      walletError,
      publicState,
      stateLoading,
      stateError,
      laceStoreUrl: LACE_STORE_URL,
      connect,
      disconnect,
      refreshPublicState,
      setContractAddress,
      clearContractAddressOverride,
    }),
    [
      config,
      laceInstalled,
      laceReady,
      providers,
      connecting,
      walletError,
      publicState,
      stateLoading,
      stateError,
      connect,
      disconnect,
      refreshPublicState,
      setContractAddress,
      clearContractAddressOverride,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
