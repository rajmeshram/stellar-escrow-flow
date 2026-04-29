/**
 * stellar-service — Soroban contract interaction layer (MOCKED).
 *
 * This is the seam between the UI and the on-chain Soroban escrow contract.
 * Replace the mocked implementations with real Soroban RPC calls when the
 * contract is deployed. The function shapes match the expected real signatures
 * so the swap is mechanical.
 *
 * To integrate a real contract:
 *   1. Set SOROBAN_CONTRACT_ID to the deployed contract address.
 *   2. Replace the mocked bodies below with calls to soroban-client / stellar-sdk.
 *   3. Have Freighter sign the prepared XDR via window.freighterApi.signTransaction.
 */
import type { StellarNetwork } from "./freighter";

export const SOROBAN_CONTRACT_ID: string | null = null; // <-- set when deployed

export interface CreateEscrowParams {
  client: string;
  creator: string;
  totalAmount: string;
  asset: "XLM" | "USDC";
  network: StellarNetwork;
  milestones: Array<{ title: string; amount: string }>;
}

export interface PreparedTransaction {
  xdr: string;
  description: string;
}

const SIMULATED_LATENCY_MS = 900;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Build an unsigned XDR for the client to sign via Freighter. */
export async function prepareCreateEscrowTx(
  params: CreateEscrowParams
): Promise<PreparedTransaction> {
  await wait(SIMULATED_LATENCY_MS);
  // Mocked XDR — replace with real Soroban contract.invoke build
  return {
    xdr: `MOCK_XDR::create_escrow::${params.client}::${params.totalAmount}::${params.asset}`,
    description: `Fund escrow with ${params.totalAmount} ${params.asset}`,
  };
}

/** Submit a signed XDR to the network. Returns a fake tx hash for now. */
export async function submitSignedTx(signedXdr: string): Promise<{ hash: string }> {
  await wait(SIMULATED_LATENCY_MS);
  const hash = `mock_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
  console.info("[stellar-service] submitted (mock)", { signedXdr, hash });
  return { hash };
}

/** Prepare a release-funds tx for a single milestone. */
export async function prepareReleaseMilestoneTx(args: {
  contractId: string;
  milestoneIndex: number;
  network: StellarNetwork;
}): Promise<PreparedTransaction> {
  await wait(SIMULATED_LATENCY_MS);
  return {
    xdr: `MOCK_XDR::release::${args.contractId}::${args.milestoneIndex}`,
    description: `Release milestone #${args.milestoneIndex}`,
  };
}
