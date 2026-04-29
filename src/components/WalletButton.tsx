import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@/contexts/WalletContext";
import { truncateAddress } from "@/lib/stellar/freighter";
import { formatBalance } from "@/lib/stellar/horizon";
import { Copy, LogOut, Wallet, ChevronDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { NetworkToggle } from "./NetworkToggle";

export function WalletButton() {
  const { address, xlmBalance, isConnecting, connect, disconnect, refresh, network } = useWallet();

  if (!address) {
    return (
      <div className="flex items-center gap-2">
        <NetworkToggle />
        <Button
          onClick={connect}
          disabled={isConnecting}
          className="bg-gradient-primary text-primary-foreground shadow-glow-primary hover:opacity-90"
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? "Connecting…" : "Connect Wallet"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <NetworkToggle />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="glass-panel border-border/40 font-mono text-sm hover:bg-accent/40"
          >
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-success shadow-glow-success" />
            <span className="hidden sm:inline">{formatBalance(xlmBalance, 2)} XLM</span>
            <span className="mx-2 h-4 w-px bg-border hidden sm:inline-block" />
            {truncateAddress(address)}
            <ChevronDown className="ml-2 h-4 w-4 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <div className="text-xs text-muted-foreground">Connected wallet · {network}</div>
            <div className="font-mono text-sm break-all mt-1">{address}</div>
            <div className="mt-2 text-xs text-muted-foreground">Balance</div>
            <div className="text-base font-semibold">{formatBalance(xlmBalance, 4)} XLM</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(address);
              toast.success("Address copied");
            }}
          >
            <Copy className="mr-2 h-4 w-4" /> Copy address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => void refresh()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh balance
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" /> Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
