import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  EyeOff,
  BarChart3,
  Fingerprint,
  ScrollText,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/wallet-context';
import { networkLabel } from '@/config';
import { shortAddr } from '@/lib/utils';

export function LandingPage() {
  const { providers, connecting, laceInstalled, laceReady, connect, config, publicState } =
    useWallet();

  return (
    <div className="min-h-screen w-full bg-[var(--canvas)] text-[var(--ink)]">
      {/* Full-bleed SaaS hero */}
      <section className="hero-wash relative flex min-h-screen w-full flex-col text-white">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="fade-in pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/50"
          aria-hidden
        />

        <header className="relative z-10 flex w-full items-center justify-between px-5 py-5 sm:px-8 lg:px-12 xl:px-16">
          <p className="font-display text-xl tracking-tight sm:text-2xl">CipherID</p>
          <div className="flex items-center gap-3">
            {providers ? (
              <span className="hidden font-mono text-[11px] text-white/55 sm:inline">
                {shortAddr(providers.addressLabel)}
              </span>
            ) : laceReady && laceInstalled ? (
              <Button
                variant="ghost"
                size="sm"
                className="!text-white/75 hover:!bg-white/10 hover:!text-white"
                onClick={() => void connect()}
                disabled={connecting}
              >
                {connecting ? 'Connecting…' : 'Connect Lace'}
              </Button>
            ) : null}
            <Link
              to="/dashboard"
              className="inline-flex h-10 items-center rounded-[var(--radius)] bg-white px-4 text-sm font-semibold text-[var(--ink)] hover:bg-rose-50"
            >
              Open app
            </Link>
          </div>
        </header>

        <div className="relative z-10 mx-auto flex w-full flex-1 flex-col justify-center px-5 py-16 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid w-full items-center gap-14 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-20">
            <div className="slide-up">
              <p className="font-display text-[clamp(3.25rem,9vw,6.5rem)] leading-[0.9] tracking-tight">
                CipherID
              </p>
              <h1 className="mt-7 max-w-xl text-lg font-medium leading-snug text-white/80 sm:text-xl lg:text-2xl">
                Prove a digital credential without revealing who you are — or the secret itself.
              </h1>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  to="/verify"
                  className="inline-flex h-12 items-center gap-2 rounded-[var(--radius)] bg-white px-6 text-base font-semibold text-[var(--ink)] hover:bg-rose-50"
                >
                  Verify credential
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex h-12 items-center rounded-[var(--radius)] border border-white/35 px-6 text-base font-semibold text-white hover:bg-white/10"
                >
                  Dashboard
                </Link>
              </div>
              <p className="mt-8 text-[11px] uppercase tracking-[0.18em] text-white/45">
                {networkLabel(config.network).toUpperCase()}
                {providers ? ' · Lace connected' : connecting ? ' · Connecting…' : ''}
              </p>
            </div>

            <div
              className="slide-up w-full border border-white/15 bg-black/30 p-8 backdrop-blur-md sm:p-10"
              style={{ animationDelay: '0.12s' }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-200/85">
                Public ledger preview
              </p>
              <div className="mt-10 space-y-8">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">Credential</p>
                  <p className="mt-2 font-display text-3xl">
                    {publicState?.credentialName ?? 'Digital Identity'}
                  </p>
                </div>
                <div className="flex items-end justify-between gap-4 border-t border-white/15 pt-8">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-white/40">
                      Verifications
                    </p>
                    <p className="mt-2 font-display text-6xl tabular-nums leading-none">
                      {publicState ? publicState.verificationCount.toString() : '0'}
                    </p>
                  </div>
                  <p className="max-w-[9rem] pb-1 text-right text-xs leading-relaxed text-white/45">
                    Secret & identity never appear here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip — edge to edge */}
      <section className="w-full border-b border-[var(--line)] bg-[var(--paper)]">
        <div className="grid w-full md:grid-cols-3">
          {[
            {
              icon: Shield,
              title: 'Private credential',
              body: 'The secret is a circuit witness — never written to the public ledger.',
            },
            {
              icon: EyeOff,
              title: 'Identity sealed',
              body: 'Observers see that a valid proof happened, not who verified.',
            },
            {
              icon: BarChart3,
              title: 'Public accountability',
              body: 'Credential name and verification count stay public for auditors.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="border-[var(--line)] px-6 py-16 md:border-r md:px-10 lg:px-14 md:last:border-r-0"
            >
              <item.icon className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.75} />
              <h2 className="mt-5 font-display text-2xl lg:text-3xl">{item.title}</h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--ink-muted)] lg:text-base">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Structured product map */}
      <section className="w-full px-5 py-20 sm:px-8 lg:px-12 xl:px-16">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-deep)]">
            Workspace
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl">
            One console. Four jobs.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--ink-muted)]">
            Dashboard, verification, history, and settings — structured like a product, not a demo
            page.
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              to: '/dashboard',
              icon: LayoutDashboard,
              title: 'Dashboard',
              body: 'Network, wallet, credential, and live verification count.',
            },
            {
              to: '/verify',
              icon: Fingerprint,
              title: 'Verification',
              body: 'Submit a private secret and prove it with a ZK circuit.',
            },
            {
              to: '/history',
              icon: ScrollText,
              title: 'History',
              body: 'Local trail of wallet sessions and proof attempts.',
            },
            {
              to: '/settings',
              icon: Settings,
              title: 'Settings',
              body: 'Contract address, Lace, and environment endpoints.',
            },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex flex-col bg-[var(--paper)] p-7 transition-colors hover:bg-[var(--accent-soft)] sm:p-8"
            >
              <item.icon className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.75} />
              <h3 className="mt-5 font-display text-xl group-hover:text-[var(--accent-deep)]">
                {item.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--ink-muted)]">
                {item.body}
              </p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent-deep)]">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="w-full border-t border-[var(--line)] bg-[var(--paper)] px-5 py-8 text-center text-xs text-[var(--ink-faint)] sm:px-8">
        Confidential Digital ID · Midnight Network · Compact ZK · Lace
      </footer>
    </div>
  );
}
