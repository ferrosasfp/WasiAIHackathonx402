/**
 * GET /api/analytics/export
 * Export user's inference history as JSON or CSV
 * 
 * Query params:
 *   - wallet: User wallet address (required)
 *   - modelId: Filter by model (optional)
 *   - startDate: Start date YYYY-MM-DD (optional)
 *   - endDate: End date YYYY-MM-DD (optional)
 *   - format: 'json' or 'csv' (default: json)
 *   - limit: Max records (default: 1000, max: 10000)
 */

import { NextRequest, NextResponse } from 'next/server'
import { exportUserHistory } from '@/lib/inference-analytics'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const wallet = searchParams.get('wallet')
  const modelId = searchParams.get('modelId') || undefined
  const startDate = searchParams.get('startDate') || undefined
  const endDate = searchParams.get('endDate') || undefined
  const format = (searchParams.get('format') || 'json') as 'json' | 'csv'
  const limit = Math.min(parseInt(searchParams.get('limit') || '1000'), 10000)
  
  if (!wallet) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
  }
  
  try {
    const result = await exportUserHistory({
      wallet,
      modelId,
      startDate,
      endDate,
      format,
      limit,
    })
    
    if (format === 'csv' && result.csv) {
      // Return CSV file download
      return new NextResponse(result.csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="inference-history-${wallet.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }
    
    return NextResponse.json({
      ok: true,
      wallet,
      count: result.data.length,
      data: result.data,
    })
  } catch (error: any) {
    console.error('[Analytics API] Export error:', error)
    return NextResponse.json({
      ok: false,
      error: error.message || 'Failed to export history',
    }, { status: 500 })
  }
}
