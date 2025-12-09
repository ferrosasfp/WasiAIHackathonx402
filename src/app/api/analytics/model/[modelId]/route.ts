/**
 * GET /api/analytics/model/[modelId]
 * Returns analytics stats for a specific model
 */

import { NextRequest, NextResponse } from 'next/server'
import { getModelStats, getUsageTimeSeries } from '@/lib/inference-analytics'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { modelId: string } }
) {
  const { modelId } = params
  
  if (!modelId) {
    return NextResponse.json({ error: 'Model ID required' }, { status: 400 })
  }
  
  const searchParams = request.nextUrl.searchParams
  const days = parseInt(searchParams.get('days') || '30')
  const includeTimeSeries = searchParams.get('timeSeries') !== 'false'
  
  try {
    const stats = await getModelStats(modelId)
    
    if (!stats) {
      return NextResponse.json({
        ok: true,
        modelId,
        stats: null,
        message: 'No inference data found for this model',
      })
    }
    
    let timeSeries: any[] = []
    if (includeTimeSeries) {
      timeSeries = await getUsageTimeSeries({ modelId, days })
    }
    
    return NextResponse.json({
      ok: true,
      modelId,
      stats,
      timeSeries,
    })
  } catch (error: any) {
    console.error('[Analytics API] Model stats error:', error)
    return NextResponse.json({
      ok: false,
      error: error.message || 'Failed to fetch model stats',
    }, { status: 500 })
  }
}
