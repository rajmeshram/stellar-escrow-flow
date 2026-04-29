import { Link } from "@tanstack/react-router";
import { WalletButton } from "./WalletButton";
import { Sparkles } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-base font-bold tracking-tight">
              Stellar<span className="text-success">Flow</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Milestone Escrow
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#security" className="hover:text-foreground transition-colors">Security</a>
        </nav>

        <WalletButton />
      </div>
    </header>
  );
}
