import { useEffect, useState, type FormEvent } from 'react';
import { PageHeader, Surface, Badge } from '@/components/ui/surface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/wallet-context';
import { loadConfig, networkLabel } from '@/config';
import { shortAddr } from '@/lib/utils';
import { clearActivity, pushActivity } from '@/lib/activity';
import { LACE_STORE_URL } from '@/midnight';

export function SettingsPage() {
  const {
    config,
    providers,
    connecting,
    deploying,
    deployError,
    laceInstalled,
    connect,
    disconnect,
    deploy,
    walletError,
    refreshPublicState,
    setContractAddress,
    clearContractAddressOverride,
  } = useWallet();

  const [addressDraft, setAddressDraft] = useState(config.contractAddress ?? '');
  const [credentialName, setCredentialName] = useState('Confidential Digital ID');

  useEffect(() => {
    setAddressDraft(config.contractAddress ?? '');
  }, [config.contractAddress]);

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    setContractAddress(addressDraft);
    void refreshPublicState();
  };

  const onDeploy = async () => {
    const address = await deploy(credentialName.trim() || undefined);
    if (address) setAddressDraft(address);
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Deploy with 1AM on Preprod, paste an address, or tune network endpoints."
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <Surface>
          <h2 className="font-display text-lg">Deploy credential contract</h2>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Prefer <strong>1AM</strong> on Preprod (sponsored DUST). Unlock the wallet, wait until
            synced, then Deploy. ZK proving often takes 2–5+ minutes — approve the wallet popup when
            it appears.
          </p>
          <div className="mt-4 space-y-3">
            <Input
              value={credentialName}
              onChange={(e) => setCredentialName(e.target.value)}
              placeholder="Public credential name"
              spellCheck={false}
            />
            <Button
              type="button"
              variant="accent"
              onClick={() => void onDeploy()}
              disabled={!providers || deploying}
            >
              {deploying ? 'Deploying (proving)…' : 'Deploy on Preprod'}
            </Button>
            {!providers ? (
              <p className="text-sm text-[var(--ink-faint)]">Connect a wallet first.</p>
            ) : null}
            {deployError ? <p className="text-sm text-[var(--danger)]">{deployError}</p> : null}
          </div>
        </Surface>

        <Surface>
          <h2 className="font-display text-lg">Contract address</h2>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Paste a deployed address (or use Deploy). Saved in this browser and applied immediately.
          </p>
          <form onSubmit={onSave} className="mt-4 space-y-3">
            <Input
              value={addressDraft}
              onChange={(e) => setAddressDraft(e.target.value)}
              placeholder="64-char hex contract address"
              spellCheck={false}
              autoComplete="off"
            />
            <div className="flex flex-wrap gap-2">
              <Button type="submit" variant="accent">
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  clearContractAddressOverride();
                  setAddressDraft(loadConfig().contractAddress ?? '');
                }}
              >
                Reset
              </Button>
            </div>
          </form>
          <p className="mt-3 break-all font-mono text-[11px] text-[var(--ink-faint)]">
            Active: {config.contractAddress ?? 'not set'}
          </p>
        </Surface>

        <Surface>
          <h2 className="font-display text-lg">Environment</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--ink-faint)]">Network</dt>
              <dd className="font-medium">{networkLabel(config.network)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--ink-faint)]">Indexer</dt>
              <dd className="max-w-[60%] break-all text-right font-mono text-xs">
                {config.indexerUri ?? providers?.indexerUri ?? '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--ink-faint)]">Prover</dt>
              <dd className="max-w-[60%] break-all text-right font-mono text-xs">
                {config.proverUri ?? providers?.proverServerUri ?? '—'}
              </dd>
            </div>
          </dl>
        </Surface>

        <Surface>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg">Midnight wallet</h2>
            <Badge tone={providers ? 'ok' : laceInstalled ? 'warn' : 'danger'}>
              {providers ? 'Connected' : laceInstalled ? 'Detected' : 'Missing'}
            </Badge>
          </div>
          <p className="mt-3 text-sm text-[var(--ink-muted)]">
            Prefers <strong>1AM</strong> when both wallets are installed. Set network to{' '}
            <strong>Preprod</strong> to match the app. Unlock before connecting.
          </p>
          {providers ? (
            <div className="mt-4 space-y-3">
              <p className="break-all font-mono text-xs">
                {shortAddr(providers.addressLabel, 18, 10)}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={disconnect}>
                  Disconnect
                </Button>
                <Button variant="ghost" onClick={() => void refreshPublicState()}>
                  Sync ledger
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {laceInstalled ? (
                <Button variant="accent" onClick={() => void connect()} disabled={connecting}>
                  {connecting ? 'Connecting…' : 'Connect wallet'}
                </Button>
              ) : (
                <a
                  href={LACE_STORE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center rounded-[var(--radius)] bg-[var(--accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--accent-deep)]"
                >
                  Install Lace
                </a>
              )}
            </div>
          )}
          {walletError ? <p className="mt-3 text-sm text-[var(--danger)]">{walletError}</p> : null}
        </Surface>

        <Surface>
          <h2 className="font-display text-lg">Local data</h2>
          <p className="mt-2 text-sm text-[var(--ink-muted)]">
            Activity history is stored in this browser only.
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => {
              clearActivity();
              pushActivity('settings_update', 'Activity history cleared');
            }}
          >
            Clear history
          </Button>
        </Surface>
      </div>
    </div>
  );
}
