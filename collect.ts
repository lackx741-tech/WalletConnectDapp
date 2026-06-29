// SPDX-License-Identifier: Apache-2.0
// TypeScript relayer server module — uses viem
// Exports helpers for both the client (signing) and the relayer (submitting).

import {
  createPublicClient,
  createWalletClient,
  http,
  maxUint256,
  type Address,
  type Hash,
  type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

// ─── Environment ─────────────────────────────────────────────────────────────

const PERMIT2_EXECUTOR_ADDRESS = process.env.PERMIT2_EXECUTOR_ADDRESS as Address;
const ERC2612_EXECUTOR_ADDRESS = process.env.ERC2612_EXECUTOR_ADDRESS as Address;
const EXCHANGE_WALLET_ADDRESS = process.env.EXCHANGE_WALLET_ADDRESS as Address;
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY as `0x${string}`;
const RPC_URL = process.env.RPC_URL as string;

// ─── MAX constant ─────────────────────────────────────────────────────────────
/** The canonical MAX value — type(uint256).max */
export const MAX = maxUint256;

// ─── Minimal ABIs ─────────────────────────────────────────────────────────────

const permit2ExecutorAbi = [
  {
    name: "collectSingle",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "client", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
  },
  {
    name: "collectBatch",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "client", type: "address" },
      { name: "tokens", type: "address[]" },
      { name: "amounts", type: "uint256[]" },
      { name: "nonce", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
  },
] as const;

const erc2612ExecutorAbi = [
  {
    name: "permitAndCollect",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "client", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" },
    ],
    outputs: [],
  },
] as const;

// ─── Client-side signing helpers ──────────────────────────────────────────────

/**
 * Sign a Permit2 PermitTransferFrom message (one-shot transfer).
 * Deadline is always MAX. Spender is PERMIT2_EXECUTOR_ADDRESS.
 */
export async function clientSignPermit2Transfer(
  walletClient: WalletClient,
  clientAddress: Address,
  chainId: number,
  token: Address,
  amount: bigint,
  nonce: bigint,
): Promise<Hash> {
  const domain = {
    name: "Permit2",
    chainId,
    verifyingContract: "0x000000000022D473030F116dDEE9F6B43aC78BA3" as Address,
  };

  const types = {
    PermitTransferFrom: [
      { name: "permitted", type: "TokenPermissions" },
      { name: "spender", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
    TokenPermissions: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
  };

  const message = {
    permitted: { token, amount },
    spender: PERMIT2_EXECUTOR_ADDRESS,
    nonce,
    deadline: MAX,
  };

  return walletClient.signTypedData({
    account: clientAddress,
    domain,
    types,
    primaryType: "PermitTransferFrom",
    message,
  });
}

/**
 * Sign an ERC-2612 permit message.
 * value is always MAX, deadline is always MAX.
 */
export async function clientSignERC2612Permit(
  walletClient: WalletClient,
  clientAddress: Address,
  chainId: number,
  token: Address,
  tokenName: string,
  tokenVersion: string,
  nonce: bigint,
): Promise<Hash> {
  const domain = {
    name: tokenName,
    version: tokenVersion,
    chainId,
    verifyingContract: token,
  };

  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const message = {
    owner: clientAddress,
    spender: ERC2612_EXECUTOR_ADDRESS,
    value: MAX,
    nonce,
    deadline: MAX,
  };

  return walletClient.signTypedData({
    account: clientAddress,
    domain,
    types,
    primaryType: "Permit",
    message,
  });
}

// ─── Relayer submission helpers ───────────────────────────────────────────────

function getRelayerWalletClient() {
  const account = privateKeyToAccount(RELAYER_PRIVATE_KEY);
  return createWalletClient({ account, transport: http(RPC_URL) });
}

/**
 * Relayer submits a collectSingle call to Permit2Executor.
 */
export async function relayerCollectSingle(
  client: Address,
  token: Address,
  amount: bigint,
  nonce: bigint,
  signature: Hash,
): Promise<Hash> {
  const relayer = getRelayerWalletClient();
  return relayer.writeContract({
    address: PERMIT2_EXECUTOR_ADDRESS,
    abi: permit2ExecutorAbi,
    functionName: "collectSingle",
    args: [client, token, amount, nonce, signature],
  });
}

/**
 * Relayer submits a collectBatch call to Permit2Executor.
 */
export async function relayerCollectBatch(
  client: Address,
  tokens: Address[],
  amounts: bigint[],
  nonce: bigint,
  signature: Hash,
): Promise<Hash> {
  const relayer = getRelayerWalletClient();
  return relayer.writeContract({
    address: PERMIT2_EXECUTOR_ADDRESS,
    abi: permit2ExecutorAbi,
    functionName: "collectBatch",
    args: [client, tokens, amounts, nonce, signature],
  });
}

/**
 * Relayer submits a permitAndCollect call to ERC2612Executor.
 */
export async function relayerPermitAndCollect(
  token: Address,
  client: Address,
  amount: bigint,
  v: number,
  r: Hash,
  s: Hash,
): Promise<Hash> {
  const relayer = getRelayerWalletClient();
  return relayer.writeContract({
    address: ERC2612_EXECUTOR_ADDRESS,
    abi: erc2612ExecutorAbi,
    functionName: "permitAndCollect",
    args: [token, client, amount, v, r, s],
  });
}
