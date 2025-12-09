'use client'

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
} from '@mui/material'
import {
  CardGiftcard as LicenseIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material'
import Link from 'next/link'

interface License {
  tokenId: number
  modelId: number
  modelName: string
  revoked: boolean
  validApi: boolean
  validDownload: boolean
  kind: number
  expiresAt: number
  owner: string
  modelData: any
  viewModel: any
}

interface MyLicensesDashboardProps {
  licenses: License[]
  loading: boolean
  locale?: string
  onOpenArtifacts?: (license: License) => void
}

export default function MyLicensesDashboard({ 
  licenses, 
  loading, 
  locale = 'en',
  onOpenArtifacts 
}: MyLicensesDashboardProps) {
  const isES = locale === 'es'
  
  const L = {
    title: isES ? 'Mis Licencias NFT' : 'My License NFTs',
    subtitle: isES ? 'Licencias de modelos que has adquirido' : 'Model licenses you have purchased',
    nft: 'NFT',
    model: isES ? 'Modelo' : 'Model',
    type: isES ? 'Tipo' : 'Type',
    status: isES ? 'Estado' : 'Status',
    artifacts: 'Artifacts',
    actions: isES ? 'Acciones' : 'Actions',
    perpetual: isES ? 'Perpetua' : 'Perpetual',
    subscription: isES ? 'Suscripción' : 'Subscription',
    active: isES ? 'Activa' : 'Active',
    revoked: isES ? 'Revocada' : 'Revoked',
    expired: isES ? 'Expirada' : 'Expired',
    viewModel: isES ? 'Ver modelo' : 'View model',
    download: isES ? 'Descargar' : 'Download',
    noLicenses: isES ? 'No tienes licencias NFT' : 'You don\'t have any license NFTs',
    noLicensesDesc: isES 
      ? 'Compra una licencia de un modelo para empezar a usarlo'
      : 'Purchase a model license to start using it',
    api: 'API',
  }
  
  // Stats
  const totalLicenses = licenses.length
  const activeLicenses = licenses.filter(l => !l.revoked && (l.kind === 0 || (l.expiresAt && l.expiresAt * 1000 > Date.now()))).length
  const perpetualCount = licenses.filter(l => l.kind === 0).length
  const subscriptionCount = licenses.filter(l => l.kind === 1).length
  
  if (loading) {
    return (
      <Box sx={{
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'linear-gradient(180deg, rgba(22,26,36,0.6), rgba(12,15,24,0.8))',
        p: 6,
        textAlign: 'center',
      }}>
        <CircularProgress sx={{ color: '#a78bfa' }} />
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 2 }}>
          {isES ? 'Cargando licencias...' : 'Loading licenses...'}
        </Typography>
      </Box>
    )
  }
  
  if (licenses.length === 0) {
    return (
      <Box sx={{
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'linear-gradient(180deg, rgba(22,26,36,0.6), rgba(12,15,24,0.8))',
        p: 6,
        textAlign: 'center',
      }}>
        <LicenseIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.2)', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.6)', mb: 1 }}>
          {L.noLicenses}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
          {L.noLicensesDesc}
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
          label={isES ? 'Total Licencias' : 'Total Licenses'} 
          value={totalLicenses} 
          color="#a78bfa" 
        />
        <StatCard 
          label={isES ? 'Activas' : 'Active'} 
          value={activeLicenses} 
          color="#22c55e" 
        />
        <StatCard 
          label={isES ? 'Perpetuas' : 'Perpetual'} 
          value={perpetualCount} 
          color="#4fe1ff" 
        />
        <StatCard 
          label={isES ? 'Suscripciones' : 'Subscriptions'} 
          value={subscriptionCount} 
          color="#f59e0b" 
        />
      </Box>
      
      {/* Licenses Table */}
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
                <TableCell>{L.type}</TableCell>
                <TableCell>{L.status}</TableCell>
                <TableCell>{L.artifacts}</TableCell>
                <TableCell align="right">{L.actions}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {licenses.map((license) => {
                const modelDisplayName = license.viewModel?.step1?.name || license.modelName || `Model #${license.modelId}`
                const subType = license.kind === 0 ? L.perpetual : L.subscription
                const expiresAt = license.expiresAt ? new Date(license.expiresAt * 1000) : null
                const isActive = !license.revoked && (license.kind === 0 || (expiresAt && expiresAt.getTime() > Date.now()))
                const isExpired = license.kind === 1 && expiresAt && expiresAt.getTime() <= Date.now()
                const artifactsCount = license.modelData?.artifactsList?.length || 0

                return (
                  <TableRow key={license.tokenId} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>
                          #{license.tokenId}
                        </Typography>
                        {license.modelId && (
                          <Typography variant="caption" sx={{ color: '#ffffff99' }}>
                            ID: {license.modelId}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>
                          {modelDisplayName}
                        </Typography>
                        {license.viewModel?.step1?.tagline && (
                          <Typography variant="caption" sx={{ color: '#ffffff99' }}>
                            {license.viewModel.step1.tagline}
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={subType}
                        size="small"
                        sx={{
                          bgcolor: license.kind === 0 ? 'rgba(76,175,80,0.18)' : 'rgba(33,150,243,0.18)',
                          color: license.kind === 0 ? '#81c784' : '#64b5f6',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={license.revoked ? L.revoked : isExpired ? L.expired : L.active}
                        size="small"
                        sx={{
                          bgcolor: license.revoked 
                            ? 'rgba(244,67,54,0.18)' 
                            : isExpired 
                              ? 'rgba(158,158,158,0.18)' 
                              : 'rgba(76,175,80,0.18)',
                          color: license.revoked 
                            ? '#e57373' 
                            : isExpired 
                              ? '#9e9e9e' 
                              : '#81c784',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                      {license.kind === 1 && expiresAt && (
                        <Typography variant="caption" sx={{ display: 'block', color: '#ffffff66', mt: 0.5 }}>
                          {isExpired ? (isES ? 'Expiró' : 'Expired') : (isES ? 'Expira' : 'Expires')}: {expiresAt.toLocaleDateString()}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {license.validApi && (
                          <Chip label={L.api} size="small" sx={{ bgcolor: 'rgba(79,225,255,0.15)', color: '#4fe1ff', fontSize: '0.65rem' }} />
                        )}
                        {license.validDownload && (
                          <Chip label={L.download} size="small" sx={{ bgcolor: 'rgba(167,139,250,0.15)', color: '#a78bfa', fontSize: '0.65rem' }} />
                        )}
                        {artifactsCount > 0 && (
                          <Typography variant="caption" sx={{ color: '#ffffff66' }}>
                            ({artifactsCount})
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {license.validDownload && onOpenArtifacts && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => onOpenArtifacts(license)}
                            sx={{
                              color: '#a78bfa',
                              borderColor: 'rgba(167,139,250,0.3)',
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              '&:hover': { borderColor: '#a78bfa', bgcolor: 'rgba(167,139,250,0.1)' },
                            }}
                          >
                            {L.download}
                          </Button>
                        )}
                        {license.modelId && (
                          <Button
                            size="small"
                            variant="text"
                            component={Link}
                            href={`/${locale}/models/${license.modelId}`}
                            startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              color: '#7ec8ff',
                              textTransform: 'none',
                              fontSize: '0.75rem',
                            }}
                          >
                            {L.viewModel}
                          </Button>
                        )}
                      </Stack>
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

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
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
