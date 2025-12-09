import { NextRequest, NextResponse } from 'next/server'
import { getInferenceHistoryForUI } from '@/lib/inference-history'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const modelId = searchParams.get('modelId') || undefined
  const payer = searchParams.get('payer') || undefined
  const agentId = searchParams.get('agentId') ? parseInt(searchParams.get('agentId')!) : undefined
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  
  try {
    // Query from Neon DB
    const history = await getInferenceHistoryForUI({
      modelId,
      payer,
      agentId,
      limit,
    })
    
    return NextResponse.json({
      ok: true,
      count: history.length,
      history,
      source: 'neon', // Indicates data comes from persistent DB
    })
  } catch (error: any) {
    console.error('[InferenceHistory API] Error:', error)
    return NextResponse.json({
      ok: false,
      error: error.message || 'Failed to fetch inference history',
      history: [],
    }, { status: 500 })
  }
}
