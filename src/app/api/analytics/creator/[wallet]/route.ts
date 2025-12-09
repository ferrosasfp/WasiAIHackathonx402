/**
 * GET /api/analytics/creator/[wallet]
 * Returns analytics stats for a creator's models
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCreatorStats, getUsageTimeSeries } from '@/lib/inference-analytics'

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
      getCreatorStats(wallet),
      includeTimeSeries 
        ? getUsageTimeSeries({ creatorWallet: wallet, days })
        : Promise.resolve([])
    ])
    
    return NextResponse.json({
      ok: true,
      wallet,
      stats,
      timeSeries,
    })
  } catch (error: any) {
    console.error('[Analytics API] Creator stats error:', error)
    return NextResponse.json({
      ok: false,
      error: error.message || 'Failed to fetch creator stats',
    }, { status: 500 })
  }
}
