/**
 * x402 Protocol Constants and Types
 * 
 * Shared between client (X402InferencePanel) and server (inference route)
 * This file contains ONLY constants and types - no runtime logic that could
 * cause issues with Next.js client/server boundaries.
 */

// ============================================================================
// CHAIN CONFIGURATION
// ============================================================================

/**
 * Supported chain configurations for x402 payments
 * Currently only Avalanche Fuji testnet is active
 */
export const X402_CHAINS = {
  AVALANCHE_FUJI: {
    chainId: 43113,
    network: 'avalanche-fuji',
    name: 'Avalanche Fuji',
    explorerUrl: 'https://testnet.snowtrace.io',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  },
  AVALANCHE_MAINNET: {
    chainId: 43114,
    network: 'avalanche',
    name: 'Avalanche',
    explorerUrl: 'https://snowtrace.io',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
  },
} as const

// Active chain (can be switched via env in the future)
export const ACTIVE_CHAIN = X402_CHAINS.AVALANCHE_FUJI

// ============================================================================
// USDC CONFIGURATION
// ============================================================================

/**
 * Circle USDC addresses per chain
 * Note: This is different from MockUSDC used for license purchases
 */
export const USDC_ADDRESSES: Record<number, string> = {
  43113: '0x5425890298aed601595a70AB815c96711a31Bc65', // Avalanche Fuji
  43114: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // Avalanche Mainnet
}

export const USDC_DECIMALS = 6

// ============================================================================
// FACILITATOR CONFIGURATION
// ============================================================================

/**
 * Ultravioleta DAO Facilitator - handles gasless x402 settlements
 * Free tier, covers gas on Avalanche testnet/mainnet
 */
export const DEFAULT_FACILITATOR_URL = 'https://facilitator.ultravioletadao.xyz'

// ============================================================================
// PAYMENT CONFIGURATION
// ============================================================================

export const X402_VERSION = 1
export const X402_SCHEME = 'exact'
export const MAX_TIMEOUT_SECONDS = 60
export const DEFAULT_PRICE_USDC_BASE_UNITS = '10000' // 0.01 USDC

// ============================================================================
// RATE LIMITING
// ============================================================================

export const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60_000, // 1 minute
} as const

// ============================================================================
// HUGGINGFACE CONFIGURATION
// ============================================================================

export const HUGGINGFACE: {
  apiUrl: string
  timeoutMs: number
  maxRetries: number
} = {
  apiUrl: 'https://router.huggingface.co/hf-inference/models',
  timeoutMs: 30_000,
  maxRetries: 2,
}

// ============================================================================
// EIP-712 TYPES FOR USDC TRANSFER WITH AUTHORIZATION
// ============================================================================

/**
 * EIP-712 typed data for USDC TransferWithAuthorization (EIP-3009)
 * Used by the client to sign gasless USDC transfers
 */
export const TRANSFER_WITH_AUTHORIZATION_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
  ],
} as const

// ============================================================================
// TYPES
// ============================================================================

/**
 * x402 Payment Requirement - returned in 402 response
 */
export interface X402PaymentRequirement {
  scheme: string
  network: string
  maxAmountRequired: string
  resource: string
  description: string
  mimeType?: string
  payTo: string
  asset: string
  maxTimeoutSeconds: number
}

/**
 * x402 Payment Payload - sent in X-PAYMENT header
 */
export interface X402PaymentPayload {
  x402Version: number
  scheme: string
  network: string
  payload: {
    signature: string
    authorization: {
      from: string
      to: string
      value: string
      validAfter: string
      validBefore: string
      nonce: string
    }
  }
}

/**
 * x402 Payment Response - returned in X-PAYMENT-RESPONSE header
 */
export interface X402PaymentResponse {
  success: boolean
  transaction: string | null
  network: string
  payer: string | null
  errorReason: string | null
}

// ============================================================================
// HELPER FUNCTIONS (Pure, no side effects)
// ============================================================================

/**
 * Format USDC base units to human-readable price
 * @param baseUnits - Amount in USDC base units (6 decimals)
 * @returns Formatted price string like "$0.0100"
 */
export function formatUsdcPrice(baseUnits: string | number): string {
  const value = typeof baseUnits === 'string' 
    ? parseFloat(baseUnits) 
    : baseUnits
  return `$${(value / Math.pow(10, USDC_DECIMALS)).toFixed(4)}`
}

/**
 * Convert human-readable USDC to base units
 * @param usdc - Amount in USDC (e.g., 0.01)
 * @returns Base units as string (e.g., "10000")
 */
export function usdcToBaseUnits(usdc: number): string {
  return Math.floor(usdc * Math.pow(10, USDC_DECIMALS)).toString()
}

/**
 * Convert base units to human-readable USDC
 * @param baseUnits - Amount in base units
 * @returns USDC amount as number
 */
export function baseUnitsToUsdc(baseUnits: string | number): number {
  const value = typeof baseUnits === 'string' ? parseFloat(baseUnits) : baseUnits
  return value / Math.pow(10, USDC_DECIMALS)
}

/**
 * Get block explorer URL for a transaction
 * @param txHash - Transaction hash
 * @param chainId - Chain ID (defaults to active chain)
 * @returns Full explorer URL
 */
export function getExplorerTxUrl(txHash: string, chainId?: number): string {
  const chain = chainId === 43114 
    ? X402_CHAINS.AVALANCHE_MAINNET 
    : X402_CHAINS.AVALANCHE_FUJI
  return `${chain.explorerUrl}/tx/${txHash}`
}

/**
 * Get USDC address for a chain
 * @param chainId - Chain ID
 * @returns USDC contract address
 */
export function getUsdcAddress(chainId: number): string {
  return USDC_ADDRESSES[chainId] || USDC_ADDRESSES[43113]
}

/**
 * Build USDC EIP-712 domain for signing
 * @param chainId - Chain ID
 * @param usdcAddress - Optional override for USDC address
 * @returns EIP-712 domain object
 */
export function buildUsdcDomain(chainId: number, usdcAddress?: string) {
  return {
    name: 'USD Coin',
    version: '2',
    chainId,
    verifyingContract: (usdcAddress || getUsdcAddress(chainId)) as `0x${string}`,
  }
}
