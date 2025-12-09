/**
 * POST /api/cron/cleanup-history
 * Retention policy: Clean up old inference history records
 * 
 * This endpoint should be called by a cron job (e.g., Vercel Cron)
 * It aggregates old data before deletion to preserve analytics
 * 
 * Headers:
 *   - Authorization: Bearer <CRON_SECRET> (required in production)
 * 
 * Query params:
 *   - retentionDays: Days to keep detailed records (default: 90)
 */

import { NextRequest, NextResponse } from 'next/server'
import { cleanupOldHistory } from '@/lib/inference-analytics'

export const dynamic = 'force-dynamic'

// Verify cron secret in production
function verifyCronAuth(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  
  // Skip auth in development
  if (process.env.NODE_ENV === 'development') {
    return true
  }
  
  if (!cronSecret) {
    console.warn('[Cron] CRON_SECRET not configured - allowing request')
    return true
  }
  
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }
  
  const token = authHeader.slice(7)
  return token === cronSecret
}

export async function POST(request: NextRequest) {
  // Verify authorization
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const searchParams = request.nextUrl.searchParams
  const retentionDays = parseInt(searchParams.get('retentionDays') || '90')
  
  console.log(`[Cron] Starting cleanup with ${retentionDays} day retention`)
  
  try {
    const result = await cleanupOldHistory(retentionDays)
    
    console.log(`[Cron] Cleanup complete: ${result.deletedCount} records deleted, ${result.aggregatedCount} aggregates created`)
    
    return NextResponse.json({
      ok: true,
      retentionDays,
      deletedCount: result.deletedCount,
      aggregatedCount: result.aggregatedCount,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[Cron] Cleanup error:', error)
    return NextResponse.json({
      ok: false,
      error: error.message || 'Cleanup failed',
    }, { status: 500 })
  }
}

// Also support GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request)
}
