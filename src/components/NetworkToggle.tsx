import { useWallet } from "@/contexts/WalletContext";
import { cn } from "@/lib/utils";

export function NetworkToggle() {
  const { network, setNetwork } = useWallet();

  return (
    <div className="glass-panel inline-flex items-center rounded-full p-1 text-xs font-medium">
      {(["testnet", "mainnet"] as const).map((n) => {
        const active = n === network;
        return (
          <button
            key={n}
            type="button"
            onClick={() => setNetwork(n)}
            className={cn(
              "px-3 py-1 rounded-full transition-colors",
              active
                ? n === "mainnet"
                  ? "bg-gradient-success text-success-foreground"
                  : "bg-gradient-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {n === "testnet" ? "Testnet" : "Mainnet"}
          </button>
        );
      })}
    </div>
  );
}
