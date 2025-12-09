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
  Card,
  CardContent,
  Avatar,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Speed as SpeedIcon,
  AttachMoney as MoneyIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  RocketLaunch as RocketLaunchIcon,
  AutoAwesome as AutoAwesomeIcon,
  Bolt as BoltIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material'
import UsageChart from './UsageChart'

interface ModelStats {
  modelId: number
  modelName: string
  agentId: number | null
  totalRevenue: number
  inferenceCount: number
  uniqueUsers: number
  avgLatencyMs: number
  lastUsedAt: string | null
}

interface CreatorStats {
  totalRevenue: number
  totalInferences: number
  uniqueUsers: number
  avgLatencyMs: number
  models: ModelStats[]
}

interface UsageDataPoint {
  date: string
  inferences: number
  revenue: number
  uniqueUsers: number
}

interface CreatorDashboardProps {
  wallet: string
  locale?: string
}

export default function CreatorDashboard({ wallet, locale = 'en' }: CreatorDashboardProps) {
  const [stats, setStats] = useState<CreatorStats | null>(null)
  const [timeSeries, setTimeSeries] = useState<UsageDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  
  const isES = locale === 'es'
  
  const L = {
    title: isES ? 'Actividad de tus Modelos' : 'Your Models Activity',
    subtitle: isES ? 'Monitorea el rendimiento y ganancias de tus modelos de IA' : 'Monitor performance and earnings from your AI models',
    totalRevenue: isES ? 'Ganancias Totales' : 'Total Earnings',
    totalInferences: isES ? 'Ejecuciones' : 'Runs',
    uniqueUsers: isES ? 'Usuarios' : 'Users',
    avgLatency: isES ? 'Velocidad' : 'Speed',
    usageLast: isES ? 'Actividad últimos' : 'Activity last',
    days: isES ? 'días' : 'days',
    topModels: isES ? 'Rendimiento por Modelo' : 'Performance by Model',
    model: isES ? 'Modelo' : 'Model',
    revenue: isES ? 'Ganancias' : 'Earnings',
    runs: isES ? 'Ejecuciones' : 'Runs',
    users: isES ? 'Usuarios' : 'Users',
    latency: isES ? 'Velocidad' : 'Speed',
    lastUsed: isES ? 'Última actividad' : 'Last activity',
    exportCsv: isES ? 'Descargar Reporte' : 'Download Report',
    noData: isES ? 'Aún no hay actividad' : 'No activity yet',
    noModels: isES ? 'Publica tu primer modelo para ver estadísticas' : 'Publish your first model to see stats',
    refresh: isES ? 'Actualizar' : 'Refresh',
    error: isES ? 'Error al cargar datos' : 'Error loading data',
    revenueDesc: isES ? 'tu parte neta' : 'your net share',
    runsDesc: isES ? 'veces ejecutado' : 'times executed',
    usersDesc: isES ? 'usuarios únicos' : 'unique users',
    speedDesc: isES ? 'tiempo promedio' : 'avg response',
  }
  
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/analytics/creator/${wallet}?days=${days}`)
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
  
  // Stats cards config
  const statsCards = [
    {
      id: 'revenue',
      icon: <MoneyIcon sx={{ fontSize: 28 }} />,
      label: L.totalRevenue,
      value: `$${stats?.totalRevenue.toFixed(2) || '0.00'}`,
      desc: L.revenueDesc,
      gradient: 'linear-gradient(135deg, #4fe1ff 0%, #00b4d8 100%)',
      bgColor: 'rgba(79, 225, 255, 0.08)',
      borderColor: 'rgba(79, 225, 255, 0.25)',
    },
    {
      id: 'runs',
      icon: <BoltIcon sx={{ fontSize: 28 }} />,
      label: L.totalInferences,
      value: stats?.totalInferences.toLocaleString() || '0',
      desc: L.runsDesc,
      gradient: 'linear-gradient(135deg, #a78bfa 0%, #7c5cff 100%)',
      bgColor: 'rgba(167, 139, 250, 0.08)',
      borderColor: 'rgba(167, 139, 250, 0.25)',
    },
    {
      id: 'users',
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
      label: L.uniqueUsers,
      value: stats?.uniqueUsers.toLocaleString() || '0',
      desc: L.usersDesc,
      gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
      bgColor: 'rgba(244, 114, 182, 0.08)',
      borderColor: 'rgba(244, 114, 182, 0.25)',
    },
    {
      id: 'speed',
      icon: <SpeedIcon sx={{ fontSize: 28 }} />,
      label: L.avgLatency,
      value: stats?.avgLatencyMs 
        ? stats.avgLatencyMs > 1000 
          ? `${(stats.avgLatencyMs / 1000).toFixed(1)}s`
          : `${stats.avgLatencyMs}ms`
        : '-',
      desc: L.speedDesc,
      gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
      bgColor: 'rgba(52, 211, 153, 0.08)',
      borderColor: 'rgba(52, 211, 153, 0.25)',
    },
  ]

  if (loading) {
    return (
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        {/* Animated background */}
        <Box sx={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,92,255,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        
        <Stack spacing={3}>
          <Skeleton variant="text" width={300} height={50} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map(i => (
              <Grid item xs={6} md={3} key={i}>
                <Skeleton variant="rounded" height={140} sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rounded" height={250} sx={{ bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 3 }} />
        </Stack>
      </Box>
    )
  }
  
  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          bgcolor: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 3,
          '& .MuiAlert-icon': { color: '#ef4444' }
        }}
      >
        {L.error}: {error}
      </Alert>
    )
  }
  
  if (!stats || stats.totalInferences === 0) {
    return (
      <Box sx={{ 
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'linear-gradient(180deg, rgba(22,26,36,0.6) 0%, rgba(12,15,24,0.8) 100%)',
        backdropFilter: 'blur(10px)',
        p: { xs: 4, md: 6 },
        textAlign: 'center',
      }}>
        {/* Animated background */}
        <Box sx={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,92,255,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulse 8s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { transform: 'translateX(-50%) scale(1)', opacity: 0.5 },
            '50%': { transform: 'translateX(-50%) scale(1.2)', opacity: 0.8 },
          }
        }} />
        
        <Stack spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
          <Avatar sx={{ 
            width: 80, 
            height: 80, 
            bgcolor: 'rgba(124,92,255,0.15)',
            border: '2px solid rgba(124,92,255,0.3)',
          }}>
            <AnalyticsIcon sx={{ fontSize: 40, color: '#a78bfa' }} />
          </Avatar>
          <Typography variant="h5" fontWeight={700} color="#fff">
            {L.noData}
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.6)" maxWidth={400}>
            {L.noModels}
          </Typography>
        </Stack>
      </Box>
    )
  }
  
  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      {/* Animated background elements */}
      <Box sx={{
        position: 'absolute',
        top: '-30%',
        right: '-10%',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,225,255,0.06) 0%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'float 10s ease-in-out infinite',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '-20%',
        left: '-10%',
        width: 350,
        height: 350,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,92,255,0.06) 0%, transparent 70%)',
        filter: 'blur(50px)',
        animation: 'float 12s ease-in-out infinite reverse',
      }} />

      <Stack spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <Chip 
                icon={<RocketLaunchIcon sx={{ fontSize: 16 }} />}
                label={isES ? 'Panel de Analytics' : 'Analytics Dashboard'}
                sx={{ 
                  bgcolor: 'rgba(124,92,255,0.15)', 
                  color: '#a78bfa',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  '& .MuiChip-icon': { color: '#a78bfa' }
                }}
              />
            </Stack>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #fff 0%, #a78bfa 50%, #4fe1ff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5
              }}
            >
              {L.title}
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.6)">
              {L.subtitle}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1.5}>
            <Tooltip title={L.refresh}>
              <IconButton 
                onClick={fetchData} 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(124,92,255,0.15)', borderColor: 'rgba(124,92,255,0.3)' }
                }}
              >
                <RefreshIcon sx={{ color: '#fff' }} />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{
                background: 'linear-gradient(135deg, #7c5cff 0%, #2ea0ff 100%)',
                color: '#fff',
                fontWeight: 600,
                px: 3,
                borderRadius: '12px',
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(124,92,255,0.3)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #8b6fff 0%, #3db0ff 100%)',
                  boxShadow: '0 6px 20px rgba(124,92,255,0.4)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s'
              }}
            >
              {L.exportCsv}
            </Button>
          </Stack>
        </Stack>
        
        {/* Stats Cards */}
        <Grid container spacing={2}>
          {statsCards.map((card) => (
            <Grid item xs={6} md={3} key={card.id}>
              <Card
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                sx={{
                  height: '100%',
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: hoveredCard === card.id ? card.borderColor : 'rgba(255,255,255,0.08)',
                  bgcolor: hoveredCard === card.id ? card.bgColor : 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  transform: hoveredCard === card.id ? 'translateY(-4px)' : 'none',
                  boxShadow: hoveredCard === card.id 
                    ? '0 15px 30px rgba(0,0,0,0.3)'
                    : '0 4px 15px rgba(0,0,0,0.1)',
                  cursor: 'default',
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack spacing={1.5}>
                    <Box sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      background: card.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      boxShadow: `0 4px 15px ${card.bgColor}`,
                    }}>
                      {card.icon}
                    </Box>
                    <Box>
                      <Typography variant="caption" color="rgba(255,255,255,0.5)" fontWeight={500}>
                        {card.label}
                      </Typography>
                      <Typography 
                        variant="h4" 
                        fontWeight={800}
                        sx={{
                          background: card.gradient,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {card.value}
                      </Typography>
                      <Typography variant="caption" color="rgba(255,255,255,0.4)">
                        {card.desc}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Usage Chart */}
        {timeSeries.length > 0 && (
          <Box sx={{ 
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)',
            bgcolor: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(10px)',
            p: 3,
          }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={700} color="#fff">
                {L.usageLast} {days} {L.days}
              </Typography>
              <Stack direction="row" spacing={1}>
                {[7, 30, 90].map(d => (
                  <Chip
                    key={d}
                    label={`${d}d`}
                    size="small"
                    onClick={() => setDays(d)}
                    sx={{
                      bgcolor: days === d ? 'rgba(124,92,255,0.25)' : 'rgba(255,255,255,0.05)',
                      color: days === d ? '#a78bfa' : 'rgba(255,255,255,0.6)',
                      border: '1px solid',
                      borderColor: days === d ? 'rgba(124,92,255,0.5)' : 'rgba(255,255,255,0.1)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(124,92,255,0.15)',
                        borderColor: 'rgba(124,92,255,0.3)'
                      }
                    }}
                  />
                ))}
              </Stack>
            </Stack>
            <UsageChart data={timeSeries} locale={locale} height={220} />
          </Box>
        )}
        
        {/* Top Models */}
        {stats.models.length > 0 && (
          <Box sx={{ 
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)',
            bgcolor: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(10px)',
            overflow: 'hidden',
          }}>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography variant="h6" fontWeight={700} color="#fff">
                {L.topModels}
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ '& th': { borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' } }}>
                    <TableCell>{L.model}</TableCell>
                    <TableCell align="right">{L.revenue}</TableCell>
                    <TableCell align="right">{L.runs}</TableCell>
                    <TableCell align="right">{L.users}</TableCell>
                    <TableCell align="right">{L.latency}</TableCell>
                    <TableCell align="right">{L.lastUsed}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.models.slice(0, 10).map((model, index) => (
                    <TableRow 
                      key={`${model.modelId}-${index}`} 
                      sx={{ 
                        '& td': { borderColor: 'rgba(255,255,255,0.05)' },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                        transition: 'background 0.2s'
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar sx={{ 
                            width: 36, 
                            height: 36, 
                            bgcolor: `rgba(${124 + index * 20}, ${92 + index * 15}, 255, 0.15)`,
                            border: '1px solid rgba(124,92,255,0.3)',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#a78bfa'
                          }}>
                            {model.modelName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600} color="#fff">
                              {model.modelName}
                            </Typography>
                            {model.agentId && (
                              <Typography variant="caption" color="rgba(255,255,255,0.4)">
                                Agent #{model.agentId}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          fontWeight={700}
                          sx={{
                            background: 'linear-gradient(135deg, #4fe1ff 0%, #00b4d8 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          ${model.totalRevenue.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="rgba(255,255,255,0.8)">
                          {model.inferenceCount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="rgba(255,255,255,0.8)">
                          {model.uniqueUsers}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={model.avgLatencyMs > 1000 
                            ? `${(model.avgLatencyMs / 1000).toFixed(1)}s`
                            : `${model.avgLatencyMs}ms`
                          }
                          size="small"
                          sx={{
                            bgcolor: model.avgLatencyMs < 2000 ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                            color: model.avgLatencyMs < 2000 ? '#34d399' : '#fbbf24',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="caption" color="rgba(255,255,255,0.5)">
                          {formatTimeAgo(model.lastUsedAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Stack>
    </Box>
  )
}
