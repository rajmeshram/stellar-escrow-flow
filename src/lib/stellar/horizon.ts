/**
 * Tiny Horizon REST client for read-only account info.
 * Avoids pulling the full @stellar/stellar-sdk into the browser bundle for now;
 * we'll wire the SDK in for transaction building in Phase 2.
 */
import type { StellarNetwork } from "./freighter";

const HORIZON_URLS: Record<StellarNetwork, string> = {
  testnet: "https://horizon-testnet.stellar.org",
  mainnet: "https://horizon.stellar.org",
};

export interface AccountBalance {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
}

export interface AccountInfo {
  id: string;
  balances: AccountBalance[];
}

export async function fetchAccount(
  address: string,
  network: StellarNetwork
): Promise<AccountInfo | null> {
  const url = `${HORIZON_URLS[network]}/accounts/${address}`;
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Horizon error: ${res.status}`);
  return (await res.json()) as AccountInfo;
}

export function getXlmBalance(account: AccountInfo | null): string {
  if (!account) return "0";
  const native = account.balances.find((b) => b.asset_type === "native");
  return native?.balance ?? "0";
}

export function formatBalance(raw: string, decimals = 4): string {
  const n = Number(raw);
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}
