'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material'
import {
  Storefront as SalesIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
} from '@mui/icons-material'
import Link from 'next/link'
import { formatUnits } from 'viem'

interface LicenseSale {
  token_id: number
  model_id: number
  chain_id: number
  buyer: string
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

interface SalesStats {
  totalSales: number
  uniqueBuyers: number
  modelsWithSales: number
  totalRevenue: string
}

interface LicenseSalesDashboardProps {
  wallet: string
  locale?: string
  chainId?: number
}

export default function LicenseSalesDashboard({ 
  wallet, 
  locale = 'en',
  chainId,
}: LicenseSalesDashboardProps) {
  const [sales, setSales] = useState<LicenseSale[]>([])
  const [stats, setStats] = useState<SalesStats>({ totalSales: 0, uniqueBuyers: 0, modelsWithSales: 0, totalRevenue: '0' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const isES = locale === 'es'
  
  const L = {
    title: isES ? 'Ventas de Licencias' : 'License Sales',
    subtitle: isES ? 'Licencias NFT vendidas de tus modelos' : 'License NFTs sold from your models',
    nft: 'NFT',
    model: isES ? 'Modelo' : 'Model',
    buyer: isES ? 'Comprador' : 'Buyer',
    type: isES ? 'Tipo' : 'Type',
    price: isES ? 'Precio' : 'Price',
    date: isES ? 'Fecha' : 'Date',
    actions: isES ? 'Acciones' : 'Actions',
    perpetual: isES ? 'Perpetua' : 'Perpetual',
    subscription: isES ? 'Suscripción' : 'Subscription',
    viewModel: isES ? 'Ver modelo' : 'View model',
    noSales: isES ? 'No tienes ventas de licencias' : 'You don\'t have any license sales',
    noSalesDesc: isES 
      ? 'Cuando alguien compre una licencia de tus modelos, aparecerá aquí'
      : 'When someone purchases a license from your models, it will appear here',
    totalSales: isES ? 'Total Ventas' : 'Total Sales',
    uniqueBuyers: isES ? 'Compradores' : 'Buyers',
    modelsWithSales: isES ? 'Modelos Vendidos' : 'Models Sold',
    totalRevenue: isES ? 'Ingresos Totales' : 'Total Revenue',
  }
  
  useEffect(() => {
    async function fetchSales() {
      try {
        setLoading(true)
        setError(null)
        
        const params = new URLSearchParams({ sellerAddress: wallet })
        if (chainId) params.append('chainId', chainId.toString())
        
        const response = await fetch(`/api/indexed/license-sales?${params}`)
        if (!response.ok) throw new Error('Failed to fetch sales')
        
        const data = await response.json()
        setSales(data.sales || [])
        setStats(data.stats || { totalSales: 0, uniqueBuyers: 0, modelsWithSales: 0, totalRevenue: '0' })
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    
    if (wallet) fetchSales()
  }, [wallet, chainId])
  
  // Format price from wei to USDC (6 decimals)
  const formatPrice = (priceWei: string | null): string => {
    if (!priceWei || priceWei === '0') return '-'
    try {
      const formatted = formatUnits(BigInt(priceWei), 6)
      return `$${parseFloat(formatted).toFixed(2)}`
    } catch {
      return '-'
    }
  }
  
  // Truncate address
  const truncateAddress = (addr: string): string => {
    if (!addr || addr.length < 10) return addr
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }
  
  if (loading) {
    return (
      <Box sx={{
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'linear-gradient(180deg, rgba(22,26,36,0.6), rgba(12,15,24,0.8))',
        p: 6,
        textAlign: 'center',
      }}>
        <CircularProgress sx={{ color: '#22c55e' }} />
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 2 }}>
          {isES ? 'Cargando ventas...' : 'Loading sales...'}
        </Typography>
      </Box>
    )
  }
  
  if (sales.length === 0) {
    return (
      <Box sx={{
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'linear-gradient(180deg, rgba(22,26,36,0.6), rgba(12,15,24,0.8))',
        p: 6,
        textAlign: 'center',
      }}>
        <SalesIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.2)', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1 }}>
          {L.noSales}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
          {L.noSalesDesc}
        </Typography>
      </Box>
    )
  }
  
  return (
    <Box>
      {/* Stats Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 2,
        mb: 3,
      }}>
        <StatCard 
          label={L.totalSales} 
          value={stats.totalSales.toString()} 
          color="#22c55e" 
        />
        <StatCard 
          label={L.uniqueBuyers} 
          value={stats.uniqueBuyers.toString()} 
          color="#4fe1ff" 
        />
        <StatCard 
          label={L.modelsWithSales} 
          value={stats.modelsWithSales.toString()} 
          color="#a78bfa" 
        />
        <StatCard 
          label={L.totalRevenue} 
          value={formatPrice(stats.totalRevenue)} 
          color="#f59e0b" 
          isPrice
        />
      </Box>
      
      {/* Sales Table */}
      <Box sx={{
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'linear-gradient(180deg, rgba(22,26,36,0.6), rgba(12,15,24,0.8))',
        overflow: 'hidden',
      }}>
        <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
          <Table size="small" sx={{ 
            minWidth: 650, 
            '& th, & td': { 
              borderColor: 'rgba(255,255,255,0.08)', 
              color: '#ffffffd6' 
            } 
          }}>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 600, color: 'rgba(255,255,255,0.7)' } }}>
                <TableCell>{L.nft}</TableCell>
                <TableCell>{L.model}</TableCell>
                <TableCell>{L.buyer}</TableCell>
                <TableCell>{L.type}</TableCell>
                <TableCell>{L.price}</TableCell>
                <TableCell>{L.date}</TableCell>
                <TableCell align="right">{L.actions}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.map((sale) => {
                const price = sale.kind === 0 ? sale.price_perpetual : sale.price_subscription
                const saleDate = new Date(sale.created_at)

                return (
                  <TableRow key={`${sale.chain_id}-${sale.token_id}`} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>
                        #{sale.token_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>
                          {sale.model_name || `Model #${sale.model_id}`}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#ffffff99' }}>
                          ID: {sale.model_id}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={sale.buyer}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <PersonIcon sx={{ fontSize: 14, color: '#ffffff66' }} />
                          <Typography variant="body2" sx={{ color: '#4fe1ff', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {truncateAddress(sale.buyer)}
                          </Typography>
                        </Stack>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={sale.kind === 0 ? L.perpetual : L.subscription}
                        size="small"
                        sx={{
                          bgcolor: sale.kind === 0 ? 'rgba(76,175,80,0.18)' : 'rgba(33,150,243,0.18)',
                          color: sale.kind === 0 ? '#81c784' : '#64b5f6',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#22c55e', fontWeight: 600 }}>
                        {formatPrice(price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#ffffff99' }}>
                        {saleDate.toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="text"
                        component={Link}
                        href={`/${locale}/models/${sale.model_id}`}
                        startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          color: '#7ec8ff',
                          textTransform: 'none',
                          fontSize: '0.75rem',
                        }}
                      >
                        {L.viewModel}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}

function StatCard({ label, value, color, isPrice = false }: { label: string; value: string; color: string; isPrice?: boolean }) {
  return (
    <Box sx={{
      p: 2,
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.08)',
      bgcolor: `${color}10`,
    }}>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, color }}>
        {value}
      </Typography>
    </Box>
  )
}
