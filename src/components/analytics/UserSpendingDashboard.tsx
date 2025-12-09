'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Skeleton,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Stack,
  Tooltip,
  IconButton,
  Avatar,
} from '@mui/material'
import {
  ShoppingCart as SpendingIcon,
  Receipt as ReceiptIcon,
  Speed as SpeedIcon,
  Category as CategoryIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material'
import UsageChart from './UsageChart'

interface ModelUsage {
  modelId: number
  modelName: string
  agentId: number | null
  totalSpent: number
  inferenceCount: number
  avgLatencyMs: number
  lastUsedAt: string | null
}

interface UserSpendingStats {
  totalSpent: number
  totalInferences: number
  modelsUsed: number
  avgLatencyMs: number
  models: ModelUsage[]
}

interface UsageDataPoint {
  date: string
  inferences: number
  revenue: number
  uniqueUsers: number
}

interface UserSpendingDashboardProps {
  wallet: string
  locale?: string
}

export default function UserSpendingDashboard({ wallet, locale = 'en' }: UserSpendingDashboardProps) {
  const [stats, setStats] = useState<UserSpendingStats | null>(null)
  const [timeSeries, setTimeSeries] = useState<UsageDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  
  const isES = locale === 'es'
  
  const L = {
    title: isES ? 'Tu Uso de Modelos' : 'Your Model Usage',
    subtitle: isES ? 'Historial de modelos que has usado y pagado' : 'History of models you have used and paid for',
    totalSpent: isES ? 'Total Gastado' : 'Total Spent',
    totalInferences: isES ? 'Ejecuciones' : 'Runs',
    modelsUsed: isES ? 'Modelos' : 'Models',
    avgLatency: isES ? 'Velocidad' : 'Speed',
    usageLast: isES ? 'Actividad últimos' : 'Activity last',
    days: isES ? 'días' : 'days',
    topModels: isES ? 'Modelos Más Usados' : 'Most Used Models',
    model: isES ? 'Modelo' : 'Model',
    spent: isES ? 'Gastado' : 'Spent',
    runs: isES ? 'Ejecuciones' : 'Runs',
    latency: isES ? 'Velocidad' : 'Speed',
    lastUsed: isES ? 'Última actividad' : 'Last activity',
    exportCsv: isES ? 'Descargar Historial' : 'Download History',
    noData: isES ? 'Aún no hay actividad' : 'No activity yet',
    noUsage: isES ? 'No has usado ningún modelo todavía' : 'You haven\'t used any models yet',
    refresh: isES ? 'Actualizar' : 'Refresh',
    error: isES ? 'Error al cargar datos' : 'Error loading data',
    spentDesc: isES ? 'USDC pagados' : 'USDC paid',
    runsDesc: isES ? 'veces ejecutado' : 'times executed',
    modelsDesc: isES ? 'modelos diferentes' : 'different models',
    speedDesc: isES ? 'tiempo promedio' : 'avg response',
    viewModel: isES ? 'Ver modelo' : 'View model',
  }
  
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/analytics/user/${wallet}?days=${days}`)
      const data = await res.json()
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to fetch')
      }
      
      setStats(data.stats)
      setTimeSeries(data.timeSeries || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (wallet) {
      fetchData()
    }
  }, [wallet, days])
  
  const handleExport = () => {
    window.open(`/api/analytics/export?wallet=${wallet}&format=csv`, '_blank')
  }
  
  const formatTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    return `${diffDays}d`
  }
  
  const statCards = [
    {
      id: 'spent',
      icon: <SpendingIcon sx={{ fontSize: 28 }} />,
      label: L.totalSpent,
      value: `$${stats?.totalSpent.toFixed(2) || '0.00'}`,
      desc: L.spentDesc,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      bgColor: 'rgba(245, 158, 11, 0.08)',
    },
    {
      id: 'runs',
      icon: <ReceiptIcon sx={{ fontSize: 28 }} />,
      label: L.totalInferences,
      value: stats?.totalInferences.toLocaleString() || '0',
      desc: L.runsDesc,
      gradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
      bgColor: 'rgba(167, 139, 250, 0.08)',
    },
    {
      id: 'models',
      icon: <CategoryIcon sx={{ fontSize: 28 }} />,
      label: L.modelsUsed,
      value: stats?.modelsUsed.toLocaleString() || '0',
      desc: L.modelsDesc,
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      bgColor: 'rgba(34, 197, 94, 0.08)',
    },
    {
      id: 'speed',
      icon: <SpeedIcon sx={{ fontSize: 28 }} />,
      label: L.avgLatency,
      value: stats?.avgLatencyMs ? `${(stats.avgLatencyMs / 1000).toFixed(1)}s` : '-',
      desc: L.speedDesc,
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      bgColor: 'rgba(236, 72, 153, 0.08)',
    },
  ]
  
  if (loading) {
    return (
      <Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map(i => (
            <Grid item xs={6} md={3} key={i}>
              <Skeleton variant="rounded" height={120} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={300} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
      </Box>
    )
  }
  
  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={fetchData}>
            {L.refresh}
          </Button>
        }
        sx={{ bgcolor: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}
      >
        {L.error}: {error}
      </Alert>
    )
  }
  
  const hasData = stats && (stats.totalInferences > 0 || stats.models.length > 0)
  
  return (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid item xs={6} md={3} key={card.id}>
            <Box
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: hoveredCard === card.id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
                bgcolor: card.bgColor,
                transition: 'all 0.3s ease',
                transform: hoveredCard === card.id ? 'translateY(-2px)' : 'none',
                cursor: 'default',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                <Box sx={{
                  p: 1,
                  borderRadius: '10px',
                  background: card.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}>
                  {card.icon}
                </Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                  {card.label}
                </Typography>
              </Stack>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>
                {card.value}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                {card.desc}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      
      {!hasData ? (
        <Box sx={{
          p: 6,
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.08)',
          bgcolor: 'rgba(255,255,255,0.02)',
          textAlign: 'center',
        }}>
          <SpendingIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.2)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1 }}>
            {L.noData}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
            {L.noUsage}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Usage Chart */}
          <Box sx={{
            p: 3,
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            bgcolor: 'rgba(255,255,255,0.02)',
            mb: 3,
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} color="#fff">
                {L.usageLast} {days} {L.days}
              </Typography>
              <Stack direction="row" spacing={1}>
                {[7, 14, 30].map(d => (
                  <Chip
                    key={d}
                    label={`${d}d`}
                    size="small"
                    onClick={() => setDays(d)}
                    sx={{
                      bgcolor: days === d ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                      color: days === d ? '#f59e0b' : 'rgba(255,255,255,0.6)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(245,158,11,0.15)' },
                    }}
                  />
                ))}
              </Stack>
            </Stack>
            <UsageChart data={timeSeries} locale={locale} height={200} />
          </Box>
          
          {/* Models Table */}
          <Box sx={{
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            bgcolor: 'rgba(255,255,255,0.02)',
            overflow: 'hidden',
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography variant="subtitle1" fontWeight={600} color="#fff">
                {L.topModels}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Tooltip title={L.refresh}>
                  <IconButton size="small" onClick={fetchData} sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                  sx={{
                    color: '#f59e0b',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { bgcolor: 'rgba(245,158,11,0.1)' },
                  }}
                >
                  {L.exportCsv}
                </Button>
              </Stack>
            </Stack>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { color: 'rgba(255,255,255,0.5)', fontWeight: 600, borderColor: 'rgba(255,255,255,0.08)' } }}>
                    <TableCell>{L.model}</TableCell>
                    <TableCell align="right">{L.spent}</TableCell>
                    <TableCell align="right">{L.runs}</TableCell>
                    <TableCell align="right">{L.latency}</TableCell>
                    <TableCell align="right">{L.lastUsed}</TableCell>
                    <TableCell align="center" width={50}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats?.models.slice(0, 10).map((model, index) => (
                    <TableRow 
                      key={`${model.modelId}-${index}`}
                      sx={{ 
                        '& td': { borderColor: 'rgba(255,255,255,0.05)' },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Avatar 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              bgcolor: `hsl(${(index * 45) % 360}, 70%, 35%)`,
                              fontSize: '0.8rem',
                              fontWeight: 700,
                            }}
                          >
                            {model.modelName?.charAt(0) || '#'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600} color="#fff">
                              {model.modelName || `Model #${model.modelId}`}
                            </Typography>
                            {model.agentId && (
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                                Agent #{model.agentId}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          fontWeight={700}
                          sx={{
                            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          ${model.totalSpent.toFixed(4)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="rgba(255,255,255,0.8)">
                          {model.inferenceCount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={model.avgLatencyMs ? `${(model.avgLatencyMs / 1000).toFixed(1)}s` : '-'}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.05)',
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          {formatTimeAgo(model.lastUsedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={L.viewModel}>
                          <IconButton 
                            size="small" 
                            href={`/${locale}/models/${model.modelId}`}
                            sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#f59e0b' } }}
                          >
                            <OpenInNewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}
    </Box>
  )
}
