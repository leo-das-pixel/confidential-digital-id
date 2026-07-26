import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { PageHeader, Surface, Badge } from '@/components/ui/surface';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/wallet-context';
import { pushActivity } from '@/lib/activity';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; txId: string }
  | { kind: 'error'; message: string };

async function contractApi() {
  return import('@/contract');
}

export function VerifyPage() {
  const { config, providers, connect, connecting, publicState, refreshPublicState } = useWallet();
  const [secret, setSecret] = useState('');
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!providers) return;
    setStatus({ kind: 'submitting' });
    pushActivity('verify_attempt', 'Credential verification submitted');
    try {
      const { submitVerifyCredential } = await contractApi();
      const { txId } = await submitVerifyCredential(config, providers, secret);
      setStatus({ kind: 'success', txId });
      setSecret('');
      pushActivity('verify_success', 'Credential verified on-chain', `tx ${txId}`);
      void refreshPublicState();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ kind: 'error', message });
      pushActivity('verify_error', 'Verification failed', message);
    }
  };

  const disabled =
    !providers || !config.contractAddress || status.kind === 'submitting' || !secret.trim();

  return (
    <div>
      <PageHeader
        title="Verification"
        description="Prove you hold a valid digital credential without revealing the secret."
      />

      <div className="grid gap-3 lg:grid-cols-[1.25fr_0.75fr]">
        <Surface>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg">Private credential</h2>
            <Badge tone={providers ? 'ok' : 'warn'}>
              {providers ? 'Wallet ready' : 'Wallet required'}
            </Badge>
          </div>

          {!providers ? (
            <div className="mb-4 rounded-[var(--radius)] border border-dashed border-[var(--line)] bg-[var(--surface)]/60 p-4 text-sm text-[var(--ink-muted)]">
              Connect Lace to prove and submit the verification circuit.
              <div className="mt-3">
                <Button variant="accent" size="sm" onClick={() => void connect()} disabled={connecting}>
                  {connecting ? 'Connecting…' : 'Connect Lace'}
                </Button>
              </div>
            </div>
          ) : null}

          <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
            <div>
              <label
                htmlFor="secret"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ink-muted)]"
              >
                Credential secret
              </label>
              <div className="flex gap-2">
                <Input
                  id="secret"
                  type={show ? 'text' : 'password'}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="credential-code-…"
                  autoComplete="off"
                  disabled={status.kind === 'submitting'}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? 'Hide' : 'Show'}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" variant="accent" disabled={disabled}>
              {status.kind === 'submitting' ? 'Proving…' : 'Verify credential'}
            </Button>
          </form>

          {!config.contractAddress ? (
            <p className="mt-4 text-sm text-[var(--warn)]">
              No contract address — set it under Settings.
            </p>
          ) : null}
          {status.kind === 'success' ? (
            <p className="mt-4 text-sm text-[var(--ok)]">
              Verified. tx {status.txId.slice(0, 18)}…
            </p>
          ) : null}
          {status.kind === 'error' ? (
            <p className="mt-4 text-sm text-[var(--danger)]">{status.message}</p>
          ) : null}
        </Surface>

        <Surface className="bg-[var(--ink)] text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-200/80">
            Public ledger
          </p>
          <dl className="mt-6 space-y-5">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.12em] text-white/40">Credential</dt>
              <dd className="mt-1 font-display text-xl">{publicState?.credentialName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.12em] text-white/40">Count</dt>
              <dd className="mt-1 font-display text-4xl tabular-nums">
                {publicState ? publicState.verificationCount.toString() : '—'}
              </dd>
            </div>
          </dl>
          <p className="mt-8 border-t border-white/15 pt-4 text-sm text-white/60">
            Secret and identity stay private. Only the count is public.
          </p>
        </Surface>
      </div>
    </div>
  );
}
