import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  freighter,
  FreighterNotInstalledError,
  UserRejectedError,
  type StellarNetwork,
} from "@/lib/stellar/freighter";
import { fetchAccount, getXlmBalance } from "@/lib/stellar/horizon";
import { toast } from "sonner";

interface WalletState {
  address: string | null;
  network: StellarNetwork;
  xlmBalance: string;
  isConnecting: boolean;
  isInstalled: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  setNetwork: (n: StellarNetwork) => void;
  refresh: () => Promise<void>;
}

const WalletContext = createContext<WalletState | null>(null);

const STORAGE_KEY = "stellarflow.wallet";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetworkState] = useState<StellarNetwork>("testnet");
  const [xlmBalance, setXlmBalance] = useState("0");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Hydrate from localStorage + detect Freighter
  useEffect(() => {
    setIsInstalled(freighter.isInstalled());
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { address?: string; network?: StellarNetwork };
        if (parsed.address) setAddress(parsed.address);
        if (parsed.network) setNetworkState(parsed.network);
      }
    } catch {
      /* noop */
    }
  }, []);

  // Persist
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (address) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ address, network }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [address, network]);

  const refresh = useCallback(async () => {
    if (!address) {
      setXlmBalance("0");
      return;
    }
    try {
      const acc = await fetchAccount(address, network);
      setXlmBalance(getXlmBalance(acc));
    } catch (err) {
      console.warn("[wallet] refresh failed", err);
    }
  }, [address, network]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const addr = await freighter.connect();
      setAddress(addr);
      const net = await freighter.getNetwork();
      setNetworkState(net);
      toast.success("Wallet connected", {
        description: `${addr.slice(0, 6)}…${addr.slice(-4)} on ${net}`,
      });
    } catch (err) {
      if (err instanceof FreighterNotInstalledError) {
        toast.error("Freighter not detected", {
          description: "Install the Freighter extension to connect.",
          action: {
            label: "Install",
            onClick: () => window.open("https://freighter.app", "_blank"),
          },
        });
      } else if (err instanceof UserRejectedError) {
        toast.error("Connection rejected");
      } else {
        toast.error("Could not connect", {
          description: (err as Error)?.message ?? "Unknown error",
        });
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setXlmBalance("0");
    toast("Wallet disconnected");
  }, []);

  const setNetwork = useCallback((n: StellarNetwork) => {
    setNetworkState(n);
    toast(`Switched to ${n}`);
  }, []);

  const value = useMemo<WalletState>(
    () => ({
      address,
      network,
      xlmBalance,
      isConnecting,
      isInstalled,
      connect,
      disconnect,
      setNetwork,
      refresh,
    }),
    [address, network, xlmBalance, isConnecting, isInstalled, connect, disconnect, setNetwork, refresh]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within <WalletProvider>");
  return ctx;
}
