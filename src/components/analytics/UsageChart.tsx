'use client'

import { Box, Typography, Stack, useTheme } from '@mui/material'

interface UsageDataPoint {
  date: string
  inferences: number
  revenue: number
  uniqueUsers: number
}

interface UsageChartProps {
  data: UsageDataPoint[]
  locale?: string
  height?: number
}

export default function UsageChart({ data, locale = 'en', height = 200 }: UsageChartProps) {
  const theme = useTheme()
  const isES = locale === 'es'
  
  if (!data || data.length === 0) {
    return (
      <Box sx={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'rgba(255,255,255,0.02)',
        borderRadius: 2,
      }}>
        <Typography color="text.secondary">
          {isES ? 'Sin datos para mostrar' : 'No data to display'}
        </Typography>
      </Box>
    )
  }
  
  // Calculate max values for scaling
  const maxInferences = Math.max(...data.map(d => d.inferences), 1)
  const maxRevenue = Math.max(...data.map(d => d.revenue), 0.01)
  
  // Calculate totals for summary
  const totalInferences = data.reduce((sum, d) => sum + d.inferences, 0)
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
  
  const barWidth = Math.max(4, Math.min(20, (100 / data.length) - 1))
  
  return (
    <Box sx={{ 
      bgcolor: 'rgba(255,255,255,0.02)', 
      borderRadius: 2, 
      p: 2,
      border: '1px solid rgba(255,255,255,0.05)',
    }}>
      {/* Summary */}
      <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            {isES ? 'Total Inferencias' : 'Total Inferences'}
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#b8a3ff' }}>
            {totalInferences.toLocaleString()}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            {isES ? 'Total Ingresos' : 'Total Revenue'}
          </Typography>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#4fe1ff' }}>
            ${totalRevenue.toFixed(2)}
          </Typography>
        </Box>
      </Stack>
      
      {/* Chart */}
      <Box sx={{ 
        height: height - 80, 
        display: 'flex', 
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 0.5,
        position: 'relative',
      }}>
        {/* Y-axis labels */}
        <Box sx={{ 
          position: 'absolute', 
          left: 0, 
          top: 0, 
          bottom: 20,
          width: 40,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>
            {maxInferences}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>
            {Math.round(maxInferences / 2)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>
            0
          </Typography>
        </Box>
        
        {/* Bars */}
        <Box sx={{ 
          flex: 1, 
          ml: 5,
          display: 'flex', 
          alignItems: 'flex-end',
          justifyContent: 'space-around',
          height: '100%',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          {data.map((point, index) => {
            const inferenceHeight = (point.inferences / maxInferences) * 100
            const revenueHeight = (point.revenue / maxRevenue) * 100
            const date = new Date(point.date)
            const dayLabel = date.getDate()
            const showLabel = data.length <= 14 || index % Math.ceil(data.length / 10) === 0
            
            return (
              <Box
                key={point.date}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  maxWidth: 30,
                }}
              >
                {/* Stacked bars */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 0.25,
                  alignItems: 'flex-end',
                  height: height - 100,
                }}>
                  {/* Inferences bar */}
                  <Box
                    sx={{
                      width: barWidth / 2,
                      height: `${inferenceHeight}%`,
                      minHeight: point.inferences > 0 ? 4 : 0,
                      bgcolor: '#b8a3ff',
                      borderRadius: '2px 2px 0 0',
                      transition: 'height 0.3s ease',
                      '&:hover': {
                        bgcolor: '#c9b8ff',
                      },
                    }}
                    title={`${point.inferences} inferences`}
                  />
                  {/* Revenue bar */}
                  <Box
                    sx={{
                      width: barWidth / 2,
                      height: `${revenueHeight}%`,
                      minHeight: point.revenue > 0 ? 4 : 0,
                      bgcolor: '#4fe1ff',
                      borderRadius: '2px 2px 0 0',
                      transition: 'height 0.3s ease',
                      '&:hover': {
                        bgcolor: '#7aeaff',
                      },
                    }}
                    title={`$${point.revenue.toFixed(4)} revenue`}
                  />
                </Box>
                
                {/* X-axis label */}
                {showLabel && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      fontSize: 10,
                      fontWeight: 500,
                      mt: 0.5 
                    }}
                  >
                    {dayLabel}
                  </Typography>
                )}
              </Box>
            )
          })}
        </Box>
      </Box>
      
      {/* Legend */}
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#b8a3ff', borderRadius: 0.5 }} />
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {isES ? 'Inferencias' : 'Inferences'}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#4fe1ff', borderRadius: 0.5 }} />
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {isES ? 'Ingresos' : 'Revenue'}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  )
}
