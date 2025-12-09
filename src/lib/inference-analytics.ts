/**
 * Inference Analytics Service
 * 
 * Provides analytics and export functionality for inference history.
 * Used by creator dashboards and user export features.
 */

import { query } from './db'
import { MARKETPLACE_FEE_BPS } from '@/config/fees'

// ===== Types =====

export interface CreatorStats {
  totalRevenue: number          // Total USDC earned (formatted)
  totalRevenueRaw: string       // Raw USDC in base units
  totalInferences: number       // Total inference count
  uniqueUsers: number           // Unique payer wallets
  avgLatencyMs: number          // Average latency
  models: ModelStats[]          // Per-model breakdown
}

export interface ModelStats {
  modelId: number
  modelName: string
  agentId: number | null
  totalRevenue: number
  totalRevenueRaw: string
  inferenceCount: number
  uniqueUsers: number
  avgLatencyMs: number
  lastUsedAt: string | null
}

export interface UsageDataPoint {
  date: string                  // YYYY-MM-DD
  inferences: number
  revenue: number               // Formatted USDC
  uniqueUsers: number
}

export interface ExportRecord {
  id: string
  date: string
  modelId: number
  modelName: string
  agentId: number | null
  input: string
  output: string
  amountUsdc: string
  txHash: string | null
  explorerUrl: string | null
  latencyMs: number | null
}

// ===== Constants =====

const USDC_DECIMALS = 6
const DEFAULT_RETENTION_DAYS = 90
const MAX_BPS = 10000

// ===== Helper Functions =====

function formatUsdc(baseUnits: string | number): number {
  const raw = typeof baseUnits === 'string' ? BigInt(baseUnits) : BigInt(baseUnits)
  return Number(raw) / Math.pow(10, USDC_DECIMALS)
}

/**
 * Calculate wallet's share of revenue based on their role and the model's split config
 * 
 * Split logic from ModelSplitter contract:
 * - Marketplace gets: marketplaceBps (default 10%)
 * - Creator gets: royaltyBps (0-20%, only if creator ≠ owner)
 * - Seller/Owner gets: remainder (100% - marketplaceBps - royaltyBps)
 * 
 * When owner === creator (typical case):
 * - Owner/Creator gets: 100% - marketplaceBps = 90%
 * 
 * @param totalRevenue Total USDC paid for inference
 * @param walletAddress The wallet we're calculating share for
 * @param owner Model owner address
 * @param creator Model creator address  
 * @param royaltyBps Creator royalty in basis points (from model)
 * @param marketplaceBps Marketplace fee in basis points (default from config)
 */
function calculateWalletShare(
  totalRevenue: number,
  walletAddress: string,
  owner: string,
  creator: string,
  royaltyBps: number,
  marketplaceBps: number = MARKETPLACE_FEE_BPS
): number {
  const walletLower = walletAddress.toLowerCase()
  const ownerLower = owner.toLowerCase()
  const creatorLower = creator.toLowerCase()
  
  // If owner === creator, they get everything minus marketplace fee
  if (ownerLower === creatorLower) {
    if (walletLower === ownerLower) {
      return totalRevenue * (MAX_BPS - marketplaceBps) / MAX_BPS
    }
    return 0 // Not the owner/creator
  }
  
  // Owner and creator are different
  let share = 0
  
  // Owner (seller) gets: 100% - royalty - marketplace
  if (walletLower === ownerLower) {
    share += totalRevenue * (MAX_BPS - royaltyBps - marketplaceBps) / MAX_BPS
  }
  
  // Creator gets royalty
  if (walletLower === creatorLower) {
    share += totalRevenue * royaltyBps / MAX_BPS
  }
  
  return share
}

// ===== Creator Analytics =====

/**
 * Get aggregated stats for a creator (model owner or original creator)
 * Calculates wallet's share based on their role in each model's split config
 */
export async function getCreatorStats(creatorWallet: string): Promise<CreatorStats> {
  // Get all models where this wallet is owner OR creator, including split config
  const modelsResult = await query<{ 
    model_id: number
    name: string
    owner: string
    creator: string
    royalty_bps: number
  }>(
    `SELECT model_id, name, owner, creator, COALESCE(royalty_bps, 0) as royalty_bps 
     FROM models 
     WHERE LOWER(owner) = LOWER($1) OR LOWER(creator) = LOWER($1)`,
    [creatorWallet]
  )
  
  if (modelsResult.length === 0) {
    return {
      totalRevenue: 0,
      totalRevenueRaw: '0',
      totalInferences: 0,
      uniqueUsers: 0,
      avgLatencyMs: 0,
      models: []
    }
  }
  
  // Create a map for quick lookup of model split config
  const modelConfigMap = new Map(modelsResult.map(m => [m.model_id, m]))
  const modelIds = modelsResult.map(m => m.model_id)
  
  // Get per-model inference stats
  const modelStatsResult = await query<{
    model_id: number
    model_name: string
    agent_id: number | null
    total_revenue: string
    inference_count: string
    unique_users: string
    avg_latency: string
    last_used_at: string | null
  }>(
    `SELECT 
      model_id,
      model_name,
      agent_id,
      COALESCE(SUM(amount_usdc), 0) as total_revenue,
      COUNT(*) as inference_count,
      COUNT(DISTINCT payer_wallet) as unique_users,
      COALESCE(AVG(latency_ms), 0) as avg_latency,
      MAX(created_at) as last_used_at
    FROM inference_history
    WHERE model_id = ANY($1)
    GROUP BY model_id, model_name, agent_id
    ORDER BY total_revenue DESC`,
    [modelIds]
  )
  
  // Calculate wallet's share for each model based on split config
  let totalWalletRevenue = 0
  let totalInferences = 0
  let totalRawRevenue = BigInt(0)
  let totalLatency = 0
  let latencyCount = 0
  
  const modelStats: ModelStats[] = modelStatsResult.map(m => {
    const config = modelConfigMap.get(m.model_id)
    const grossRevenue = formatUsdc(m.total_revenue)
    
    // Calculate this wallet's share based on their role
    const walletShare = config 
      ? calculateWalletShare(
          grossRevenue,
          creatorWallet,
          config.owner,
          config.creator,
          config.royalty_bps
        )
      : grossRevenue * (MAX_BPS - MARKETPLACE_FEE_BPS) / MAX_BPS // fallback to 90%
    
    totalWalletRevenue += walletShare
    totalInferences += parseInt(m.inference_count)
    totalRawRevenue += BigInt(m.total_revenue)
    
    if (m.avg_latency) {
      totalLatency += parseFloat(m.avg_latency) * parseInt(m.inference_count)
      latencyCount += parseInt(m.inference_count)
    }
    
    return {
      modelId: m.model_id,
      modelName: m.model_name || config?.name || `Model #${m.model_id}`,
      agentId: m.agent_id,
      totalRevenue: walletShare,
      totalRevenueRaw: m.total_revenue,
      inferenceCount: parseInt(m.inference_count),
      uniqueUsers: parseInt(m.unique_users),
      avgLatencyMs: Math.round(parseFloat(m.avg_latency)),
      lastUsedAt: m.last_used_at
    }
  })
  
  // Get unique users across all models
  const uniqueUsersResult = await query<{ payer_wallet: string }>(
    `SELECT DISTINCT payer_wallet FROM inference_history WHERE model_id = ANY($1)`,
    [modelIds]
  )
  
  return {
    totalRevenue: totalWalletRevenue,
    totalRevenueRaw: totalRawRevenue.toString(),
    totalInferences,
    uniqueUsers: uniqueUsersResult.length,
    avgLatencyMs: latencyCount > 0 ? Math.round(totalLatency / latencyCount) : 0,
    models: modelStats
  }
}

/**
 * Get stats for a specific model
 * @param modelId Model ID
 * @param walletAddress Optional wallet to calculate their specific share
 */
export async function getModelStats(
  modelId: number | string, 
  walletAddress?: string
): Promise<ModelStats | null> {
  // Get model config for split calculation
  const modelConfig = await query<{
    owner: string
    creator: string
    royalty_bps: number
    name: string
  }>(
    `SELECT owner, creator, COALESCE(royalty_bps, 0) as royalty_bps, name 
     FROM models WHERE model_id = $1`,
    [Number(modelId)]
  )
  
  const result = await query<{
    model_id: number
    model_name: string
    agent_id: number | null
    total_revenue: string
    inference_count: string
    unique_users: string
    avg_latency: string
    last_used_at: string | null
  }>(
    `SELECT 
      model_id,
      model_name,
      agent_id,
      COALESCE(SUM(amount_usdc), 0) as total_revenue,
      COUNT(*) as inference_count,
      COUNT(DISTINCT payer_wallet) as unique_users,
      COALESCE(AVG(latency_ms), 0) as avg_latency,
      MAX(created_at) as last_used_at
    FROM inference_history
    WHERE model_id = $1
    GROUP BY model_id, model_name, agent_id`,
    [Number(modelId)]
  )
  
  if (result.length === 0) return null
  
  const m = result[0]
  const config = modelConfig[0]
  const grossRevenue = formatUsdc(m.total_revenue)
  
  // Calculate wallet's share if provided, otherwise show gross revenue
  let walletRevenue = grossRevenue
  if (walletAddress && config) {
    walletRevenue = calculateWalletShare(
      grossRevenue,
      walletAddress,
      config.owner,
      config.creator,
      config.royalty_bps
    )
  }
  
  return {
    modelId: m.model_id,
    modelName: m.model_name || config?.name || `Model #${m.model_id}`,
    agentId: m.agent_id,
    totalRevenue: walletRevenue,
    totalRevenueRaw: m.total_revenue,
    inferenceCount: parseInt(m.inference_count),
    uniqueUsers: parseInt(m.unique_users),
    avgLatencyMs: Math.round(parseFloat(m.avg_latency)),
    lastUsedAt: m.last_used_at
  }
}

/**
 * Get usage time series for charts
 * When creatorWallet is provided, calculates their share based on each model's split config
 */
export async function getUsageTimeSeries(options: {
  modelId?: number | string
  creatorWallet?: string
  days?: number
}): Promise<UsageDataPoint[]> {
  const { modelId, creatorWallet, days = 30 } = options
  
  // For creatorWallet, we need per-model breakdown to calculate correct shares
  if (creatorWallet) {
    // Get models with their split config
    const modelsResult = await query<{
      model_id: number
      owner: string
      creator: string
      royalty_bps: number
    }>(
      `SELECT model_id, owner, creator, COALESCE(royalty_bps, 0) as royalty_bps 
       FROM models 
       WHERE LOWER(owner) = LOWER($1) OR LOWER(creator) = LOWER($1)`,
      [creatorWallet]
    )
    
    if (modelsResult.length === 0) return []
    
    const modelConfigMap = new Map(modelsResult.map(m => [m.model_id, m]))
    const modelIds = modelsResult.map(m => m.model_id)
    
    // Get per-model, per-day breakdown
    const result = await query<{
      date: string
      model_id: number
      inferences: string
      revenue: string
      unique_users: string
    }>(
      `SELECT 
        DATE(created_at) as date,
        model_id,
        COUNT(*) as inferences,
        COALESCE(SUM(amount_usdc), 0) as revenue,
        COUNT(DISTINCT payer_wallet) as unique_users
      FROM inference_history
      WHERE created_at >= NOW() - INTERVAL '1 day' * $1
      AND model_id = ANY($2)
      GROUP BY DATE(created_at), model_id
      ORDER BY date ASC`,
      [days, modelIds]
    )
    
    // Aggregate by date, applying correct share for each model
    const dateMap = new Map<string, { inferences: number; revenue: number; uniqueUsers: Set<string> }>()
    
    for (const r of result) {
      const config = modelConfigMap.get(r.model_id)
      const grossRevenue = formatUsdc(r.revenue)
      
      // Calculate wallet's share for this model
      const walletShare = config
        ? calculateWalletShare(grossRevenue, creatorWallet, config.owner, config.creator, config.royalty_bps)
        : grossRevenue * (MAX_BPS - MARKETPLACE_FEE_BPS) / MAX_BPS
      
      const existing = dateMap.get(r.date) || { inferences: 0, revenue: 0, uniqueUsers: new Set<string>() }
      existing.inferences += parseInt(r.inferences)
      existing.revenue += walletShare
      dateMap.set(r.date, existing)
    }
    
    // Get unique users per date (separate query needed)
    const uniqueUsersResult = await query<{ date: string; unique_users: string }>(
      `SELECT DATE(created_at) as date, COUNT(DISTINCT payer_wallet) as unique_users
       FROM inference_history
       WHERE created_at >= NOW() - INTERVAL '1 day' * $1
       AND model_id = ANY($2)
       GROUP BY DATE(created_at)`,
      [days, modelIds]
    )
    
    const uniqueUsersMap = new Map(uniqueUsersResult.map(r => [r.date, parseInt(r.unique_users)]))
    
    return Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      inferences: data.inferences,
      revenue: data.revenue,
      uniqueUsers: uniqueUsersMap.get(date) || 0
    }))
  }
  
  // Simple case: single model or no filter
  let whereClause = ''
  const params: any[] = [days]
  let paramIndex = 2
  
  if (modelId) {
    whereClause = `AND model_id = $${paramIndex++}`
    params.push(Number(modelId))
  }
  
  const result = await query<{
    date: string
    inferences: string
    revenue: string
    unique_users: string
  }>(
    `SELECT 
      DATE(created_at) as date,
      COUNT(*) as inferences,
      COALESCE(SUM(amount_usdc), 0) as revenue,
      COUNT(DISTINCT payer_wallet) as unique_users
    FROM inference_history
    WHERE created_at >= NOW() - INTERVAL '1 day' * $1
    ${whereClause}
    GROUP BY DATE(created_at)
    ORDER BY date ASC`,
    params
  )
  
  // For single model without wallet context, show gross revenue
  return result.map(r => ({
    date: r.date,
    inferences: parseInt(r.inferences),
    revenue: formatUsdc(r.revenue),
    uniqueUsers: parseInt(r.unique_users)
  }))
}

// ===== User Export =====

/**
 * Export user's inference history
 */
export async function exportUserHistory(options: {
  wallet: string
  modelId?: number | string
  startDate?: string
  endDate?: string
  format?: 'json' | 'csv'
  limit?: number
}): Promise<{ data: ExportRecord[]; csv?: string }> {
  const { wallet, modelId, startDate, endDate, format = 'json', limit = 1000 } = options
  
  const conditions: string[] = ['LOWER(payer_wallet) = LOWER($1)']
  const params: any[] = [wallet]
  let paramIndex = 2
  
  if (modelId) {
    conditions.push(`model_id = $${paramIndex++}`)
    params.push(Number(modelId))
  }
  
  if (startDate) {
    conditions.push(`created_at >= $${paramIndex++}`)
    params.push(startDate)
  }
  
  if (endDate) {
    conditions.push(`created_at <= $${paramIndex++}`)
    params.push(endDate)
  }
  
  params.push(limit)
  
  const result = await query<{
    id: string
    created_at: string
    model_id: number
    model_name: string
    agent_id: number | null
    input_preview: string
    output_preview: string
    amount_usdc: string
    tx_hash: string | null
    chain_id: number
    latency_ms: number | null
  }>(
    `SELECT 
      id, created_at, model_id, model_name, agent_id,
      input_preview, output_preview, amount_usdc, tx_hash, chain_id, latency_ms
    FROM inference_history
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at DESC
    LIMIT $${paramIndex}`,
    params
  )
  
  const data: ExportRecord[] = result.map(r => ({
    id: r.id,
    date: r.created_at,
    modelId: r.model_id,
    modelName: r.model_name || `Model #${r.model_id}`,
    agentId: r.agent_id,
    input: r.input_preview || '',
    output: r.output_preview || '',
    amountUsdc: formatUsdc(r.amount_usdc).toFixed(6),
    txHash: r.tx_hash,
    explorerUrl: r.tx_hash 
      ? r.chain_id === 43113 
        ? `https://testnet.snowtrace.io/tx/${r.tx_hash}`
        : `https://snowtrace.io/tx/${r.tx_hash}`
      : null,
    latencyMs: r.latency_ms
  }))
  
  if (format === 'csv') {
    const headers = ['Date', 'Model ID', 'Model Name', 'Agent ID', 'Input', 'Output', 'Amount (USDC)', 'TX Hash', 'Latency (ms)']
    const rows = data.map(r => [
      r.date,
      r.modelId,
      `"${r.modelName.replace(/"/g, '""')}"`,
      r.agentId || '',
      `"${r.input.replace(/"/g, '""')}"`,
      `"${r.output.replace(/"/g, '""')}"`,
      r.amountUsdc,
      r.txHash || '',
      r.latencyMs || ''
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    return { data, csv }
  }
  
  return { data }
}

// ===== Retention Policy =====

/**
 * Clean up old inference history records
 * Keeps aggregated data in inference_aggregates table
 */
export async function cleanupOldHistory(retentionDays: number = DEFAULT_RETENTION_DAYS): Promise<{
  deletedCount: number
  aggregatedCount: number
}> {
  // First, aggregate old data before deletion
  const aggregateResult = await query<{ count: string }>(
    `INSERT INTO inference_aggregates (
      model_id, agent_id, date, inference_count, total_revenue, unique_users, avg_latency_ms
    )
    SELECT 
      model_id,
      agent_id,
      DATE(created_at) as date,
      COUNT(*) as inference_count,
      SUM(amount_usdc) as total_revenue,
      COUNT(DISTINCT payer_wallet) as unique_users,
      AVG(latency_ms) as avg_latency_ms
    FROM inference_history
    WHERE created_at < NOW() - INTERVAL '1 day' * $1
    GROUP BY model_id, agent_id, DATE(created_at)
    ON CONFLICT (model_id, date) DO UPDATE SET
      inference_count = inference_aggregates.inference_count + EXCLUDED.inference_count,
      total_revenue = inference_aggregates.total_revenue + EXCLUDED.total_revenue,
      unique_users = GREATEST(inference_aggregates.unique_users, EXCLUDED.unique_users),
      avg_latency_ms = (inference_aggregates.avg_latency_ms + EXCLUDED.avg_latency_ms) / 2
    RETURNING 1`,
    [retentionDays]
  )
  
  // Then delete old records
  const deleteResult = await query<{ count: string }>(
    `WITH deleted AS (
      DELETE FROM inference_history
      WHERE created_at < NOW() - INTERVAL '1 day' * $1
      RETURNING 1
    )
    SELECT COUNT(*) as count FROM deleted`,
    [retentionDays]
  )
  
  return {
    deletedCount: parseInt(deleteResult[0]?.count || '0'),
    aggregatedCount: aggregateResult.length
  }
}

/**
 * Get historical aggregates for long-term analytics
 */
export async function getHistoricalAggregates(options: {
  modelId?: number | string
  creatorWallet?: string
  startDate?: string
  endDate?: string
}): Promise<UsageDataPoint[]> {
  const { modelId, creatorWallet, startDate, endDate } = options
  
  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1
  
  if (modelId) {
    conditions.push(`model_id = $${paramIndex++}`)
    params.push(Number(modelId))
  } else if (creatorWallet) {
    const modelsResult = await query<{ model_id: number }>(
      `SELECT model_id FROM models WHERE LOWER(owner) = LOWER($1) OR LOWER(creator) = LOWER($1)`,
      [creatorWallet]
    )
    const modelIds = modelsResult.map(m => m.model_id)
    if (modelIds.length === 0) return []
    conditions.push(`model_id = ANY($${paramIndex++})`)
    params.push(modelIds)
  }
  
  if (startDate) {
    conditions.push(`date >= $${paramIndex++}`)
    params.push(startDate)
  }
  
  if (endDate) {
    conditions.push(`date <= $${paramIndex++}`)
    params.push(endDate)
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  
  const result = await query<{
    date: string
    inference_count: string
    total_revenue: string
    unique_users: string
  }>(
    `SELECT 
      date,
      SUM(inference_count) as inference_count,
      SUM(total_revenue) as total_revenue,
      MAX(unique_users) as unique_users
    FROM inference_aggregates
    ${whereClause}
    GROUP BY date
    ORDER BY date ASC`,
    params
  )
  
  return result.map(r => ({
    date: r.date,
    inferences: parseInt(r.inference_count),
    revenue: formatUsdc(r.total_revenue),
    uniqueUsers: parseInt(r.unique_users)
  }))
}

// ===== User Spending Analytics =====

export interface UserSpendingStats {
  totalSpent: number          // Total USDC spent
  totalInferences: number     // Total inference count
  modelsUsed: number          // Unique models used
  avgLatencyMs: number        // Average latency
  models: UserModelUsage[]    // Per-model breakdown
}

export interface UserModelUsage {
  modelId: number
  modelName: string
  agentId: number | null
  totalSpent: number
  inferenceCount: number
  avgLatencyMs: number
  lastUsedAt: string | null
}

/**
 * Get spending stats for a user (models they have paid for)
 */
export async function getUserSpendingStats(userWallet: string): Promise<UserSpendingStats> {
  // Get per-model spending breakdown
  const modelStatsResult = await query<{
    model_id: number
    model_name: string
    agent_id: number | null
    total_spent: string
    inference_count: string
    avg_latency: string
    last_used_at: string | null
  }>(
    `SELECT 
      model_id,
      model_name,
      agent_id,
      COALESCE(SUM(amount_usdc), 0) as total_spent,
      COUNT(*) as inference_count,
      COALESCE(AVG(latency_ms), 0) as avg_latency,
      MAX(created_at) as last_used_at
    FROM inference_history
    WHERE LOWER(payer_wallet) = LOWER($1)
    GROUP BY model_id, model_name, agent_id
    ORDER BY total_spent DESC`,
    [userWallet]
  )
  
  if (modelStatsResult.length === 0) {
    return {
      totalSpent: 0,
      totalInferences: 0,
      modelsUsed: 0,
      avgLatencyMs: 0,
      models: []
    }
  }
  
  // Calculate totals
  let totalSpent = 0
  let totalInferences = 0
  let totalLatency = 0
  let latencyCount = 0
  
  const models: UserModelUsage[] = modelStatsResult.map(m => {
    const spent = formatUsdc(m.total_spent)
    const count = parseInt(m.inference_count)
    const latency = parseFloat(m.avg_latency)
    
    totalSpent += spent
    totalInferences += count
    if (latency > 0) {
      totalLatency += latency * count
      latencyCount += count
    }
    
    return {
      modelId: m.model_id,
      modelName: m.model_name || `Model #${m.model_id}`,
      agentId: m.agent_id,
      totalSpent: spent,
      inferenceCount: count,
      avgLatencyMs: Math.round(latency),
      lastUsedAt: m.last_used_at
    }
  })
  
  return {
    totalSpent,
    totalInferences,
    modelsUsed: models.length,
    avgLatencyMs: latencyCount > 0 ? Math.round(totalLatency / latencyCount) : 0,
    models
  }
}

/**
 * Get usage time series for a user's spending
 */
export async function getUserUsageTimeSeries(options: {
  userWallet: string
  days?: number
}): Promise<UsageDataPoint[]> {
  const { userWallet, days = 30 } = options
  
  const result = await query<{
    date: string
    inferences: string
    revenue: string
  }>(
    `SELECT 
      DATE(created_at) as date,
      COUNT(*) as inferences,
      COALESCE(SUM(amount_usdc), 0) as revenue
    FROM inference_history
    WHERE LOWER(payer_wallet) = LOWER($1)
    AND created_at >= NOW() - INTERVAL '1 day' * $2
    GROUP BY DATE(created_at)
    ORDER BY date ASC`,
    [userWallet, days]
  )
  
  return result.map(r => ({
    date: r.date,
    inferences: parseInt(r.inferences),
    revenue: formatUsdc(r.revenue),
    uniqueUsers: 1 // Always 1 for user's own spending
  }))
}
