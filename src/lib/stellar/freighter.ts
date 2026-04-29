/**
 * Freighter wallet bridge.
 * Lightweight typed wrapper over the injected window.freighterApi.
 * Falls back to a clear error if Freighter is not installed.
 */

export type StellarNetwork = "testnet" | "mainnet";

interface FreighterApi {
  isConnected: () => Promise<boolean>;
  isAllowed?: () => Promise<boolean>;
  setAllowed?: () => Promise<boolean>;
  requestAccess?: () => Promise<{ address: string; error?: string }>;
  getAddress?: () => Promise<{ address: string; error?: string }>;
  getPublicKey?: () => Promise<string>;
  getNetwork?: () => Promise<{ network: string; networkPassphrase: string } | string>;
  getNetworkDetails?: () => Promise<{ network: string; networkPassphrase: string; networkUrl: string }>;
  signTransaction?: (
    xdr: string,
    opts?: { network?: string; networkPassphrase?: string; address?: string }
  ) => Promise<{ signedTxXdr: string; signerAddress: string } | string>;
}

declare global {
  interface Window {
    freighterApi?: FreighterApi;
    freighter?: FreighterApi;
  }
}

function getApi(): FreighterApi | null {
  if (typeof window === "undefined") return null;
  return window.freighterApi ?? window.freighter ?? null;
}

export class FreighterNotInstalledError extends Error {
  constructor() {
    super(
      "Freighter wallet not detected. Install the Freighter extension from freighter.app to continue."
    );
    this.name = "FreighterNotInstalledError";
  }
}

export class UserRejectedError extends Error {
  constructor(message = "Signature request was rejected.") {
    super(message);
    this.name = "UserRejectedError";
  }
}

export const freighter = {
  isInstalled(): boolean {
    return getApi() !== null;
  },

  async isConnected(): Promise<boolean> {
    const api = getApi();
    if (!api) return false;
    try {
      return await api.isConnected();
    } catch {
      return false;
    }
  },

  async connect(): Promise<string> {
    const api = getApi();
    if (!api) throw new FreighterNotInstalledError();

    try {
      // Newer API
      if (api.requestAccess) {
        const res = await api.requestAccess();
        if (res?.error) throw new UserRejectedError(res.error);
        if (res?.address) return res.address;
      }

      // Legacy fallback
      if (api.setAllowed) await api.setAllowed();
      if (api.getAddress) {
        const r = await api.getAddress();
        if (r?.error) throw new UserRejectedError(r.error);
        if (r?.address) return r.address;
      }
      if (api.getPublicKey) {
        return await api.getPublicKey();
      }
      throw new Error("Unable to retrieve Stellar address from Freighter.");
    } catch (err) {
      if (err instanceof UserRejectedError) throw err;
      const msg = (err as Error)?.message ?? "Failed to connect to Freighter.";
      if (/reject|denied/i.test(msg)) throw new UserRejectedError(msg);
      throw new Error(msg);
    }
  },

  async getNetwork(): Promise<StellarNetwork> {
    const api = getApi();
    if (!api) return "testnet";
    try {
      if (api.getNetworkDetails) {
        const d = await api.getNetworkDetails();
        return /test/i.test(d.network) ? "testnet" : "mainnet";
      }
      if (api.getNetwork) {
        const n = await api.getNetwork();
        const name = typeof n === "string" ? n : n?.network;
        return /test/i.test(name ?? "") ? "testnet" : "mainnet";
      }
    } catch {
      /* noop */
    }
    return "testnet";
  },
};

/** Truncate a Stellar G... address for display. */
export function truncateAddress(addr: string | null | undefined, head = 6, tail = 4): string {
  if (!addr) return "";
  if (addr.length <= head + tail + 1) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

/** Lightweight Stellar public key validation (G... 56 base32 chars). */
export function isValidStellarAddress(addr: string): boolean {
  return /^G[A-Z2-7]{55}$/.test(addr);
}
