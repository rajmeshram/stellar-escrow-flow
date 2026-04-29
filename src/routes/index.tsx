import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/contexts/WalletContext";
import {
  ArrowRight,
  ShieldCheck,
  Layers,
  Coins,
  Eye,
  Workflow,
  Lock,
  Wallet,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stellar Flow — Milestone Escrow for Freelancers & Clients" },
      {
        name: "description",
        content:
          "Lock funds in a Soroban smart contract and release them milestone-by-milestone. Built for freelancers and clients on Stellar.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <Hero />
      <HowItWorks />
      <Features />
      <Security />
      <Footer />
    </div>
  );
}

function Hero() {
  const { address, connect, isConnecting } = useWallet();
  return (
    <section className="relative overflow-hidden">
      <div className="grid-bg absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      <div className="absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute top-40 right-10 h-[280px] w-[280px] rounded-full bg-success/20 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="glass-panel mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success shadow-glow-success" />
            <span className="text-muted-foreground">
              Powered by Soroban smart contracts on Stellar
            </span>
          </div>

          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Escrow that releases
            <br />
            <span className="text-gradient-primary">milestone by milestone.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Stellar Flow locks client funds in a Soroban contract and releases them only when each
            milestone is approved. No intermediaries, no chargebacks, settled in seconds.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={connect}
              disabled={isConnecting}
              className="bg-gradient-primary px-6 text-primary-foreground shadow-glow-primary hover:opacity-90"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {address ? "Wallet Connected" : isConnecting ? "Connecting…" : "Connect Freighter"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="glass-panel border-border/40"
              asChild
            >
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>

          <div className="mt-10 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            {[
              "Non-custodial",
              "Up to 5 milestones",
              "Audit log per contract",
              "XLM & USDC ready",
            ].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                {t}
              </div>
            ))}
          </div>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto mt-16 max-w-5xl">
      <div className="glass-panel rounded-2xl p-2 shadow-elevated">
        <div className="rounded-xl bg-surface/80 p-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Active Contract
              </div>
              <div className="mt-1 font-display text-lg font-semibold">
                Brand identity redesign · Acme Co.
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Locked in escrow</div>
              <div className="font-mono text-2xl font-bold text-success">12,500 XLM</div>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {[
              { label: "Discovery & strategy", amount: "2,500", status: "released" },
              { label: "Logo concepts", amount: "5,000", status: "approved" },
              { label: "Final delivery", amount: "5,000", status: "pending" },
            ].map((m, i) => (
              <div
                key={m.label}
                className="flex items-center justify-between rounded-lg border border-border/40 bg-surface-elevated/60 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                      m.status === "released"
                        ? "bg-success/20 text-success"
                        : m.status === "approved"
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{m.label}</div>
                    <div className="text-xs text-muted-foreground capitalize">{m.status}</div>
                  </div>
                </div>
                <div className="font-mono text-sm">{m.amount} XLM</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: Wallet,
      title: "Connect & define",
      desc: "Client connects Freighter, sets milestones, totals, and the creator's address.",
    },
    {
      icon: Lock,
      title: "Fund the contract",
      desc: "Funds are locked in a Soroban escrow — held by code, not a counterparty.",
    },
    {
      icon: Workflow,
      title: "Deliver per milestone",
      desc: "Creator marks each milestone delivered; client reviews and approves.",
    },
    {
      icon: Coins,
      title: "Release on-chain",
      desc: "Approved milestones release instantly. Every event is logged on-chain.",
    },
  ];
  return (
    <section id="how-it-works" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="How it works"
        title="Four steps. Zero trust required."
        subtitle="A workflow that mirrors how freelance projects actually run — backed by a smart contract."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className="glass-panel relative rounded-xl p-6 transition-transform hover:-translate-y-1"
          >
            <div className="absolute right-4 top-4 font-mono text-xs text-muted-foreground">
              0{i + 1}
            </div>
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-glow-primary">
              <s.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: Layers,
      title: "Up to 5 milestones",
      desc: "Structure any project with granular release conditions.",
    },
    {
      icon: ShieldCheck,
      title: "Validated addresses",
      desc: "Every Stellar address is checksummed before a transaction is built.",
    },
    {
      icon: Eye,
      title: "Real-time tracking",
      desc: "Pending, confirmed, and failed states surface as toasts and on-chain status.",
    },
    {
      icon: Coins,
      title: "Multi-asset ready",
      desc: "Start with XLM. USDC and other Stellar assets land in Phase 2.",
    },
  ];
  return (
    <section id="features" className="relative bg-surface/40 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Built for production"
          title="The escrow features freelancers actually need."
          subtitle="No vague promises. Every action is a verifiable on-chain event."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {items.map((f) => (
            <div key={f.title} className="glass-panel rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/15">
                  <f.icon className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Security() {
  return (
    <section id="security" className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="glass-panel relative overflow-hidden rounded-2xl p-10 shadow-elevated">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-success/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-2">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">
              <ShieldCheck className="h-3.5 w-3.5" /> Green Belt hardened
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Security is the product.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Stellar Flow is engineered with a zero-trust mindset. Releases can only be triggered
              by the original client wallet, every input is validated before a transaction is built,
              and signature rejections fail gracefully.
            </p>
          </div>
          <ul className="space-y-3">
            {[
              "Only the original client_address can trigger releases",
              "Stellar address checksum validation on every input",
              "Graceful handling of expired transactions & rejected signatures",
              "Append-only audit log per contract",
              "Row-level security on all stored metadata",
            ].map((t) => (
              <li
                key={t}
                className="flex items-start gap-3 rounded-lg border border-border/40 bg-surface-elevated/40 p-3 text-sm"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-xs font-semibold uppercase tracking-[0.25em] text-success">
        {eyebrow}
      </div>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mt-3 text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/40 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        <div>© {new Date().getFullYear()} Stellar Flow · Built on Stellar & Soroban</div>
        <div className="flex items-center gap-4">
          <a href="https://freighter.app" target="_blank" rel="noreferrer" className="hover:text-foreground">
            Freighter Wallet
          </a>
          <a href="https://stellar.org" target="_blank" rel="noreferrer" className="hover:text-foreground">
            Stellar
          </a>
        </div>
      </div>
    </footer>
  );
}
