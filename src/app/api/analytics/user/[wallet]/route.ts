/**
 * GET /api/analytics/user/[wallet]
 * Returns usage stats for a user (models they have used/paid for)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserSpendingStats, getUserUsageTimeSeries } from '@/lib/inference-analytics'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { wallet: string } }
) {
  const { wallet } = params
  
  if (!wallet) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
  }
  
  const searchParams = request.nextUrl.searchParams
  const days = parseInt(searchParams.get('days') || '30')
  const includeTimeSeries = searchParams.get('timeSeries') !== 'false'
  
  try {
    // Execute queries in parallel for better performance
    const [stats, timeSeries] = await Promise.all([
      getUserSpendingStats(wallet),
      includeTimeSeries 
        ? getUserUsageTimeSeries({ userWallet: wallet, days })
        : Promise.resolve([])
    ])
    
    return NextResponse.json({
      ok: true,
      wallet,
      stats,
      timeSeries,
    })
  } catch (error: any) {
    console.error('[Analytics API] User spending stats error:', error)
    return NextResponse.json({
      ok: false,
      error: error.message || 'Failed to fetch user spending stats',
    }, { status: 500 })
  }
}
