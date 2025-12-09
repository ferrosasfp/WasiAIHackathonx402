/**
 * GET /api/indexed/license-sales
 * Returns licenses SOLD by the user (where user is the model owner/seller)
 * Query params:
 *   - sellerAddress: Wallet address of the seller (required)
 *   - chainId: Filter by chain (optional)
 *   - limit: Max items (default: 50)
 * 
 * Response: { sales: [], total: number, stats: { totalSales, totalRevenue, uniqueBuyers } }
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface LicenseSale {
  token_id: number
  model_id: number
  chain_id: number
  buyer: string  // license owner = buyer
  kind: number
  revoked: boolean
  valid_api: boolean
  valid_download: boolean
  expires_at: number
  tx_hash: string | null
  created_at: string
  model_name: string | null
  model_uri: string | null
  model_image: string | null
  price_perpetual: string | null
  price_subscription: string | null
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sellerAddress = searchParams.get('sellerAddress')
    const chainId = searchParams.get('chainId')
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))

    if (!sellerAddress) {
      return NextResponse.json(
        { error: 'sellerAddress is required' },
        { status: 400 }
      )
    }

    // Build WHERE clause - find licenses where the MODEL OWNER matches the seller
    const conditions: string[] = ['LOWER(m.owner) = LOWER($1)']
    const params: any[] = [sellerAddress]
    let paramIndex = 2

    if (chainId) {
      conditions.push(`l.chain_id = $${paramIndex}`)
      params.push(parseInt(chainId))
      paramIndex++
    }

    const whereClause = conditions.join(' AND ')

    // Get licenses sold by this user (where they own the model)
    params.push(limit)
    const salesQuery = `
      SELECT 
        l.token_id,
        l.model_id,
        l.chain_id,
        l.owner as buyer,
        l.kind,
        l.revoked,
        l.valid_api,
        l.valid_download,
        l.expires_at,
        l.tx_hash,
        l.created_at,
        m.name as model_name,
        m.uri as model_uri,
        m.price_perpetual,
        m.price_subscription,
        mm.image_url as model_image
      FROM licenses l
      JOIN models m ON l.model_id = m.model_id AND l.chain_id = m.chain_id
      LEFT JOIN model_metadata mm ON l.model_id = mm.model_id
      WHERE ${whereClause}
      ORDER BY l.created_at DESC
      LIMIT $${paramIndex}
    `

    const sales = await query<LicenseSale>(salesQuery, params)

    // Calculate stats
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT l.token_id) as total_sales,
        COUNT(DISTINCT l.owner) as unique_buyers,
        COUNT(DISTINCT l.model_id) as models_with_sales,
        SUM(CASE WHEN l.kind = 0 THEN m.price_perpetual ELSE m.price_subscription END) as total_revenue
      FROM licenses l
      JOIN models m ON l.model_id = m.model_id AND l.chain_id = m.chain_id
      WHERE LOWER(m.owner) = LOWER($1)
      ${chainId ? `AND l.chain_id = $2` : ''}
    `
    
    const statsParams = chainId ? [sellerAddress, parseInt(chainId)] : [sellerAddress]
    const statsResult = await query<any>(statsQuery, statsParams)
    const stats = statsResult[0] || { total_sales: 0, unique_buyers: 0, models_with_sales: 0, total_revenue: '0' }

    return NextResponse.json({
      sales,
      total: sales.length,
      stats: {
        totalSales: parseInt(stats.total_sales) || 0,
        uniqueBuyers: parseInt(stats.unique_buyers) || 0,
        modelsWithSales: parseInt(stats.models_with_sales) || 0,
        totalRevenue: stats.total_revenue || '0',
      }
    })
  } catch (error: any) {
    console.error('Error fetching license sales from database:', error)
    return NextResponse.json(
      { error: 'Failed to fetch license sales', details: error.message },
      { status: 500 }
    )
  }
}
