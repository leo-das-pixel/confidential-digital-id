import { Link } from 'react-router-dom';
import { RefreshCw, ArrowUpRight } from 'lucide-react';
import { PageHeader, Surface, Badge } from '@/components/ui/surface';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/wallet-context';
import { networkLabel } from '@/config';
import { shortAddr } from '@/lib/utils';

export function DashboardPage() {
  const {
    config,
    providers,
    connecting,
    publicState,
    stateLoading,
    stateError,
    refreshPublicState,
    laceInstalled,
  } = useWallet();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Live overview for confidential credential verification on Midnight."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refreshPublicState()}
            disabled={stateLoading || !providers}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${stateLoading ? 'animate-spin' : ''}`} />
            Sync ledger
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Surface>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
            Network
          </p>
          <p className="mt-2 font-display text-xl">{networkLabel(config.network)}</p>
        </Surface>
        <Surface>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
            Wallet
          </p>
          <p className="mt-2 font-display text-xl">
            {providers ? 'Connected' : connecting ? 'Connecting' : 'Offline'}
          </p>
          <p className="mt-1 truncate text-xs text-[var(--ink-muted)]">
            {providers
              ? shortAddr(providers.addressLabel, 14, 8)
              : laceInstalled
                ? 'Wallet detected'
                : 'Install 1AM or Lace'}
          </p>
        </Surface>
        <Surface>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
            Credential
          </p>
          <p className="mt-2 truncate font-display text-xl">
            {publicState?.credentialName ?? '—'}
          </p>
        </Surface>
        <Surface>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-faint)]">
            Verifications
          </p>
          <p className="mt-2 font-display text-xl">
            {publicState ? publicState.verificationCount.toString() : '—'}
          </p>
        </Surface>
      </div>

      {stateError ? <p className="mt-4 text-sm text-[var(--danger)]">{stateError}</p> : null}

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <Surface>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg">Credential verification</h2>
              <p className="mt-1 text-sm text-[var(--ink-muted)]">
                Prove a private credential secret. Only the public verification count changes.
              </p>
            </div>
            <Badge tone="accent">ZK</Badge>
          </div>
          <Link
            to="/verify"
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent-deep)] hover:underline"
          >
            Open verification <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Surface>
        <Surface>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg">Contract</h2>
              <p className="mt-1 break-all font-mono text-xs text-[var(--ink-muted)]">
                {config.contractAddress ?? 'Not set — Deploy in Settings with 1AM'}
              </p>
            </div>
            <Badge tone="neutral">Config</Badge>
          </div>
          <Link
            to="/settings"
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent-deep)] hover:underline"
          >
            Open settings <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </Surface>
      </div>
    </div>
  );
}
