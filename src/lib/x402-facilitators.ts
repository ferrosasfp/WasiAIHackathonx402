/**
 * x402 Facilitator Abstraction Layer
 * 
 * Two providers available:
 * - Ultravioleta DAO: Free, covers gas, Avalanche only
 * - Thirdweb: Multi-chain, requires backend wallet for gas
 * 
 * Switch via X402_FACILITATOR_PROVIDER env: 'ultravioleta' | 'thirdweb'
 */

import {
  ACTIVE_CHAIN,
  DEFAULT_FACILITATOR_URL,
  type X402PaymentRequirement,
  type X402PaymentPayload,
} from './x402-constants'

// ============================================================================
// TYPES
// ============================================================================

export type FacilitatorProvider = 'ultravioleta' | 'thirdweb'

export interface SettlementResult {
  success: boolean
  txHash?: string
  payer?: string
  error?: string
  provider: FacilitatorProvider
}

export interface FacilitatorConfig {
  provider: FacilitatorProvider
  url: string
  apiKey?: string
  chainId: number
  network: string
}

export interface Facilitator {
  readonly provider: FacilitatorProvider
  readonly config: FacilitatorConfig
  settle(payment: X402PaymentPayload, requirement: X402PaymentRequirement): Promise<SettlementResult>
  healthCheck(): Promise<boolean>
}

// ============================================================================
// ULTRAVIOLETA FACILITATOR - Free, covers gas, Avalanche only
// ============================================================================

class UltravioletaFacilitator implements Facilitator {
  readonly provider: FacilitatorProvider = 'ultravioleta'
  readonly config: FacilitatorConfig
  
  constructor(config?: Partial<FacilitatorConfig>) {
    this.config = {
      provider: 'ultravioleta',
      url: config?.url || process.env.X402_FACILITATOR_URL || DEFAULT_FACILITATOR_URL,
      chainId: config?.chainId || ACTIVE_CHAIN.chainId,
      network: config?.network || ACTIVE_CHAIN.network,
    }
  }
  
  async settle(
    payment: X402PaymentPayload,
    requirement: X402PaymentRequirement
  ): Promise<SettlementResult> {
    try {
      // Validate network matches
      if (payment.network !== this.config.network) {
        return {
          success: false,
          error: `Network mismatch: expected ${this.config.network}, got ${payment.network}`,
          provider: this.provider,
        }
      }
      
      // Build settle request per x402 spec
      const settleRequest = {
        x402Version: payment.x402Version,
        paymentPayload: {
          x402Version: payment.x402Version,
          scheme: payment.scheme,
          network: payment.network,
          payload: payment.payload,
        },
        paymentRequirements: requirement,
      }
      
      console.log(`[Ultravioleta] Settling payment for resource: ${requirement.resource}`)
      
      const response = await fetch(`${this.config.url}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settleRequest),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errorData.error || `Facilitator error: ${response.status}`,
          provider: this.provider,
        }
      }
      
      const data = await response.json()
      
      if (!data.success) {
        // Translate common errors for better UX
        let errorMsg = data.errorReason || data.error || 'Settlement failed'
        
        if (errorMsg.includes('insufficient') || errorMsg.includes('balance')) {
          errorMsg = 'Insufficient USDC balance. Please fund your wallet with testnet USDC.'
        } else if (errorMsg.includes('allowance')) {
          errorMsg = 'USDC allowance not set. Please approve USDC spending first.'
        } else if (errorMsg.includes('nonce')) {
          errorMsg = 'Payment nonce already used. Please try again.'
        }
        
        return {
          success: false,
          error: errorMsg,
          provider: this.provider,
        }
      }
      
      return {
        success: true,
        txHash: data.transaction,
        payer: payment.payload.authorization.from,
        provider: this.provider,
      }
    } catch (error: any) {
      console.error('[Ultravioleta] Settlement error:', error)
      return {
        success: false,
        error: error.message || 'Settlement failed',
        provider: this.provider,
      }
    }
  }
  
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.url}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  }
}

// ============================================================================
// THIRDWEB FACILITATOR - Multi-chain, backend pays gas
// ============================================================================

class ThirdwebFacilitator implements Facilitator {
  readonly provider: FacilitatorProvider = 'thirdweb'
  readonly config: FacilitatorConfig
  
  constructor(config?: Partial<FacilitatorConfig>) {
    this.config = {
      provider: 'thirdweb',
      url: config?.url || 'https://rpc.thirdweb.com',
      apiKey: config?.apiKey || process.env.THIRDWEB_SECRET_KEY,
      chainId: config?.chainId || ACTIVE_CHAIN.chainId,
      network: config?.network || ACTIVE_CHAIN.network,
    }
  }
  
  async settle(
    payment: X402PaymentPayload,
    requirement: X402PaymentRequirement
  ): Promise<SettlementResult> {
    if (!this.config.apiKey) {
      return {
        success: false,
        error: 'Thirdweb API key not configured. Set THIRDWEB_SECRET_KEY env variable.',
        provider: this.provider,
      }
    }
    
    try {
      console.log(`[Thirdweb] Settling payment for resource: ${requirement.resource}`)
      
      const auth = payment.payload.authorization
      const signature = payment.payload.signature
      
      // Parse signature into v, r, s components
      const sig = signature.startsWith('0x') ? signature.slice(2) : signature
      const r = '0x' + sig.slice(0, 64)
      const s = '0x' + sig.slice(64, 128)
      const v = parseInt(sig.slice(128, 130), 16)
      
      // Dynamic import to avoid issues with Next.js
      const { createThirdwebClient } = await import('thirdweb')
      const { defineChain } = await import('thirdweb/chains')
      const { getContract, sendTransaction, prepareContractCall } = await import('thirdweb')
      const { privateKeyToAccount } = await import('thirdweb/wallets')
      
      // Create Thirdweb client
      const client = createThirdwebClient({
        secretKey: this.config.apiKey,
      })
      
      // Define chain
      const chain = defineChain(this.config.chainId)
      
      // Get USDC contract
      const usdcAddress = requirement.asset as `0x${string}`
      const contract = getContract({
        client,
        chain,
        address: usdcAddress,
      })
      
      // Get backend wallet from env (needed to pay gas)
      const backendPrivateKey = process.env.PRIVATE_KEY
      if (!backendPrivateKey) {
        return {
          success: false,
          error: 'Backend wallet not configured. Set PRIVATE_KEY env variable.',
          provider: this.provider,
        }
      }
      
      // Create account from private key
      const account = privateKeyToAccount({
        client,
        privateKey: backendPrivateKey,
      })
      
      console.log(`[Thirdweb] Executing transferWithAuthorization`)
      console.log(`[Thirdweb] From: ${auth.from}`)
      console.log(`[Thirdweb] To: ${auth.to}`)
      console.log(`[Thirdweb] Value: ${auth.value}`)
      
      // Prepare the transaction
      const transaction = prepareContractCall({
        contract,
        method: {
          type: 'function',
          name: 'transferWithAuthorization',
          inputs: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'validAfter', type: 'uint256' },
            { name: 'validBefore', type: 'uint256' },
            { name: 'nonce', type: 'bytes32' },
            { name: 'v', type: 'uint8' },
            { name: 'r', type: 'bytes32' },
            { name: 's', type: 'bytes32' },
          ],
          outputs: [],
          stateMutability: 'nonpayable',
        },
        params: [
          auth.from as `0x${string}`,
          auth.to as `0x${string}`,
          BigInt(auth.value),
          BigInt(auth.validAfter),
          BigInt(auth.validBefore),
          auth.nonce as `0x${string}`,
          v,
          r as `0x${string}`,
          s as `0x${string}`,
        ],
      })
      
      // Send transaction
      const result = await sendTransaction({
        transaction,
        account,
      })
      
      console.log(`[Thirdweb] Transaction sent: ${result.transactionHash}`)
      
      return {
        success: true,
        txHash: result.transactionHash,
        payer: auth.from,
        provider: this.provider,
      }
    } catch (error: any) {
      console.error('[Thirdweb] Settlement error:', error)
      
      // Parse common errors
      let errorMsg = error.message || 'Settlement failed'
      
      if (errorMsg.includes('insufficient funds')) {
        errorMsg = 'Backend wallet has insufficient funds for gas. Please fund it with AVAX.'
      } else if (errorMsg.includes('nonce')) {
        errorMsg = 'Payment nonce already used or invalid.'
      } else if (errorMsg.includes('ERC20: transfer amount exceeds balance')) {
        errorMsg = 'Insufficient USDC balance. Please fund your wallet.'
      }
      
      return {
        success: false,
        error: errorMsg,
        provider: this.provider,
      }
    }
  }
  
  async healthCheck(): Promise<boolean> {
    if (!this.config.apiKey) return false
    
    try {
      // Simple check - try to create client
      const { createThirdwebClient } = await import('thirdweb')
      createThirdwebClient({ secretKey: this.config.apiKey })
      return true
    } catch {
      return false
    }
  }
}

// ============================================================================
// FACTORY & EXPORTS
// ============================================================================

export function getActiveProvider(): FacilitatorProvider {
  const provider = process.env.X402_FACILITATOR_PROVIDER?.toLowerCase()
  return provider === 'thirdweb' ? 'thirdweb' : 'ultravioleta'
}

export function createFacilitator(
  provider?: FacilitatorProvider,
  config?: Partial<FacilitatorConfig>
): Facilitator {
  const activeProvider = provider || getActiveProvider()
  return activeProvider === 'thirdweb'
    ? new ThirdwebFacilitator(config)
    : new UltravioletaFacilitator(config)
}

let defaultFacilitator: Facilitator | null = null

export function getFacilitator(): Facilitator {
  if (!defaultFacilitator) {
    defaultFacilitator = createFacilitator()
  }
  return defaultFacilitator
}

export function resetFacilitator(): void {
  defaultFacilitator = null
}

export { UltravioletaFacilitator, ThirdwebFacilitator }
