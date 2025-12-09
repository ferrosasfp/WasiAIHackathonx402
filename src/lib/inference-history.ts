/**
 * Inference History Service
 * Persists x402 inference payments to Neon DB for analytics and user history
 */

import { query, queryOne } from './db'

// ============================================
// TYPES
// ============================================

export interface InferenceRecord {
  id: string
  modelId: string
  modelName: string
  agentId: number
  payer: string
  txHash: string | null
  amount: string          // USDC base units
  amountFormatted: string // Human readable (e.g., "$0.01")
  inputPreview: string
  outputPreview: string
  latencyMs: number
  timestamp: number
  chainId: number
}

export interface InferenceHistoryRow {
  id: string
  model_id: number
  model_name: string | null
  agent_id: number | null
  payer_wallet: string
  tx_hash: string | null
  amount_usdc: string // bigint as string
  chain_id: number
  input_preview: string | null
  output_preview: string | null
  latency_ms: number | null
  created_at: Date
}

export interface RecordInferenceParams {
  modelId: string | number
  modelName: string
  agentId: number
  payer: string
  txHash?: string | null
  amountUsdc: string | number // base units
  chainId?: number
  inputPreview?: string
  outputPreview?: string
  latencyMs?: number
}

// ============================================
// CONSTANTS
// ============================================

const USDC_DECIMALS = 6
const MAX_PREVIEW_LENGTH = 500
const DEFAULT_CHAIN_ID = 43113 // Avalanche Fuji

// ============================================
// HELPERS
// ============================================

function truncatePreview(text: string | undefined, maxLength = MAX_PREVIEW_LENGTH): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

function formatUsdcAmount(baseUnits: string | number): string {
  const value = typeof baseUnits === 'string' ? parseFloat(baseUnits) : baseUnits
  const usdcValue = value / Math.pow(10, USDC_DECIMALS)
  if (usdcValue < 0.01) return `$${usdcValue.toFixed(4)}`
  return `$${usdcValue.toFixed(2)}`
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function rowToRecord(row: InferenceHistoryRow): InferenceRecord {
  const timestamp = new Date(row.created_at).getTime()
  return {
    id: row.id,
    modelId: String(row.model_id),
    modelName: row.model_name || `Model #${row.model_id}`,
    agentId: row.agent_id || 0,
    payer: row.payer_wallet,
    txHash: row.tx_hash,
    amount: row.amount_usdc,
    amountFormatted: formatUsdcAmount(row.amount_usdc),
    inputPreview: row.input_preview || '',
    outputPreview: row.output_preview || '',
    latencyMs: row.latency_ms || 0,
    timestamp,
    chainId: row.chain_id,
  }
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Record a new inference to the database
 * Uses async/non-blocking insert to not slow down API response
 */
export async function recordInference(params: RecordInferenceParams): Promise<string | null> {
  try {
    const result = await query<{ id: string }>(
      `INSERT INTO inference_history 
        (model_id, model_name, agent_id, payer_wallet, tx_hash, amount_usdc, chain_id, input_preview, output_preview, latency_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        Number(params.modelId),
        params.modelName,
        params.agentId,
        params.payer.toLowerCase(),
        params.txHash || null,
        String(params.amountUsdc),
        params.chainId || DEFAULT_CHAIN_ID,
        truncatePreview(params.inputPreview),
        truncatePreview(params.outputPreview),
        params.latencyMs || null,
      ]
    )
    
    const id = result[0]?.id
    console.log(`[InferenceHistory] Recorded inference ${id} for model ${params.modelId}`)
    return id || null
  } catch (error) {
    console.error('[InferenceHistory] Failed to record inference:', error)
    return null
  }
}

/**
 * Record inference without blocking (fire-and-forget)
 * Use this in the API response path to avoid adding latency
 */
export function recordInferenceAsync(params: RecordInferenceParams): void {
  // Fire and forget - don't await
  recordInference(params).catch(err => {
    console.error('[InferenceHistory] Async record failed:', err)
  })
}

/**
 * Get inference history with optional filters
 */
export async function getInferenceHistory(options: {
  modelId?: string | number
  payer?: string
  agentId?: number
  limit?: number
}): Promise<InferenceRecord[]> {
  const { modelId, payer, agentId, limit = 20 } = options
  
  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1
  
  if (modelId) {
    conditions.push(`model_id = $${paramIndex++}`)
    params.push(Number(modelId))
  }
  
  if (payer) {
    conditions.push(`LOWER(payer_wallet) = LOWER($${paramIndex++})`)
    params.push(payer)
  }
  
  if (agentId) {
    conditions.push(`agent_id = $${paramIndex++}`)
    params.push(agentId)
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  
  params.push(Math.min(limit, 100)) // Cap at 100
  
  const sql = `
    SELECT id, model_id, model_name, agent_id, payer_wallet, tx_hash, 
           amount_usdc, chain_id, input_preview, output_preview, latency_ms, created_at
    FROM inference_history
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramIndex}
  `
  
  try {
    const rows = await query<InferenceHistoryRow>(sql, params)
    return rows.map(rowToRecord)
  } catch (error) {
    console.error('[InferenceHistory] Failed to get history:', error)
    return []
  }
}

/**
 * Get inference history with timeAgo and explorerUrl fields
 * (Compatible with existing InferenceHistory component)
 */
export async function getInferenceHistoryForUI(options: {
  modelId?: string | number
  payer?: string
  agentId?: number
  limit?: number
}): Promise<(InferenceRecord & { timeAgo: string; explorerUrl: string | null })[]> {
  const records = await getInferenceHistory(options)
  
  return records.map(record => ({
    ...record,
    timeAgo: getTimeAgo(record.timestamp),
    explorerUrl: record.txHash 
      ? `https://testnet.snowtrace.io/tx/${record.txHash}`
      : null,
  }))
}

/**
 * Get analytics for a model
 */
export async function getModelInferenceStats(modelId: string | number): Promise<{
  totalRuns: number
  totalRevenue: string
  uniqueUsers: number
  avgLatencyMs: number
}> {
  try {
    const result = await queryOne<{
      total_runs: string
      total_revenue: string
      unique_users: string
      avg_latency: string
    }>(
      `SELECT 
        COUNT(*) as total_runs,
        COALESCE(SUM(amount_usdc), 0) as total_revenue,
        COUNT(DISTINCT payer_wallet) as unique_users,
        COALESCE(AVG(latency_ms), 0) as avg_latency
       FROM inference_history
       WHERE model_id = $1`,
      [Number(modelId)]
    )
    
    return {
      totalRuns: parseInt(result?.total_runs || '0'),
      totalRevenue: formatUsdcAmount(result?.total_revenue || '0'),
      uniqueUsers: parseInt(result?.unique_users || '0'),
      avgLatencyMs: Math.round(parseFloat(result?.avg_latency || '0')),
    }
  } catch (error) {
    console.error('[InferenceHistory] Failed to get stats:', error)
    return { totalRuns: 0, totalRevenue: '$0.00', uniqueUsers: 0, avgLatencyMs: 0 }
  }
}

/**
 * Get user's total spending on inferences
 */
export async function getUserInferenceStats(payer: string): Promise<{
  totalRuns: number
  totalSpent: string
  modelsUsed: number
}> {
  try {
    const result = await queryOne<{
      total_runs: string
      total_spent: string
      models_used: string
    }>(
      `SELECT 
        COUNT(*) as total_runs,
        COALESCE(SUM(amount_usdc), 0) as total_spent,
        COUNT(DISTINCT model_id) as models_used
       FROM inference_history
       WHERE LOWER(payer_wallet) = LOWER($1)`,
      [payer]
    )
    
    return {
      totalRuns: parseInt(result?.total_runs || '0'),
      totalSpent: formatUsdcAmount(result?.total_spent || '0'),
      modelsUsed: parseInt(result?.models_used || '0'),
    }
  } catch (error) {
    console.error('[InferenceHistory] Failed to get user stats:', error)
    return { totalRuns: 0, totalSpent: '$0.00', modelsUsed: 0 }
  }
}
