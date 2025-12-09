"use client";
import React from 'react'
import { useAccount, useChainId as useEvmChainId, useSwitchChain, useConfig } from 'wagmi'
import {
  Container, Box, Stack, Typography, Button, Alert, Table, TableHead, TableRow, TableCell, TableBody, Chip, CircularProgress, Snackbar, IconButton,
  Tooltip, Drawer
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DownloadIcon from '@mui/icons-material/Download'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ApiIcon from '@mui/icons-material/Api'
import LanguageIcon from '@mui/icons-material/Language'
import { useLocale } from 'next-intl'
import { createViewModelFromPublished } from '@/viewmodels'
import { ActivityDashboard } from '@/components/analytics'

function EvmLicensesPageImpl() {
  const locale = useLocale() as string
  const { address, isConnected, chain } = useAccount()
  const evmChainId = useEvmChainId()
  const { switchChainAsync } = useSwitchChain()
  const { chains } = useConfig() as any

  const [loading, setLoading] = React.useState(false)
  const [rows, setRows] = React.useState<any[]>([])
  const [snkOpen, setSnkOpen] = React.useState(false)
  const [snkMsg, setSnkMsg] = React.useState('')
  const [snkSev, setSnkSev] = React.useState<'success'|'error'|'info'|'warning'>('info')

  const [artifactsDrawerOpen, setArtifactsDrawerOpen] = React.useState(false)
  const [selectedLicense, setSelectedLicense] = React.useState<any>(null)
  const [viewDrawerOpen, setViewDrawerOpen] = React.useState(false)
  const [viewLicense, setViewLicense] = React.useState<any>(null)

  const isES = locale === 'es'
  const evmSymbol = React.useMemo(()=>{
    try {
      if (typeof evmChainId !== 'number') return 'ETH'
      const ch = Array.isArray(chains) ? chains.find((c:any)=> c?.id === evmChainId) : undefined
      const sym = ch?.nativeCurrency?.symbol
      return typeof sym === 'string' && sym ? sym : 'ETH'
    } catch {
      return 'ETH'
    }
  }, [evmChainId, chains])
  
  const chainName = React.useMemo(()=>{
    try {
      if (typeof evmChainId !== 'number') return 'EVM'
      const ch = Array.isArray(chains) ? chains.find((c:any)=> c?.id === evmChainId) : undefined
      return ch?.name || 'EVM'
    } catch {
      return 'EVM'
    }
  }, [evmChainId, chains])

  // Load licenses from indexed API (Neon DB - FAST!)
  const load = React.useCallback(async () => {
    try {
      if (!address) return
      setLoading(true)
      
      // Fetch from indexed API (instant!)
      const response = await fetch(
        `/api/indexed/licenses?userAddress=${address}&chainId=${evmChainId}`,
        { cache: 'no-store' }
      )
      
      if (!response.ok) throw new Error('Failed to fetch licenses')
      
      const data = await response.json()
      
      // Transform to match existing UI format
      // Filter only perpetual licenses (kind === 0) for hackathon MVP
      const perpetualLicenses = data.licenses.filter((lic: any) => lic.kind === 0)
      const items = perpetualLicenses.map((lic: any) => {
        const metadata = lic.model_metadata || {}
        
        // Create viewModel from metadata if available
        let viewModel = null
        try {
          if (metadata && Object.keys(metadata).length > 0) {
            viewModel = createViewModelFromPublished({
              ...metadata,
              artifacts: metadata.artifacts || [],
            })
          }
        } catch {}
        
        return {
          tokenId: lic.token_id,
          modelId: lic.model_id,
          modelName: lic.model_name || `Model #${lic.model_id}`,
          revoked: lic.revoked,
          validApi: lic.valid_api,
          validDownload: lic.valid_download,
          kind: lic.kind,
          expiresAt: Number(lic.expires_at),
          owner: lic.owner,
          modelOwner: lic.model_owner, // The seller/creator of the model
          modelData: {
            name: lic.model_name,
            uri: lic.model_uri,
            imageUrl: lic.model_image,
            ...metadata,
            artifactsList: metadata.artifacts || [],
            download_notes: metadata.downloadNotes || '',
          },
          viewModel,
        }
      })
      
      setRows(items)
    } catch (e: any) {
      setSnkSev('error')
      setSnkMsg(String(e?.message || e || 'Failed to load licenses'))
      setSnkOpen(true)
    } finally {
      setLoading(false)
    }
  }, [address, evmChainId])

  React.useEffect(() => { if (isConnected) load() }, [isConnected, evmChainId, load])

  const needsSwitch = isConnected && chain?.id !== evmChainId

  return (
    <Box sx={{
      minHeight: '100vh',
      background: [
        'radial-gradient(900px 520px at 88% -140px, rgba(46,160,255,0.22), rgba(46,160,255,0) 60%)',
        'radial-gradient(700px 420px at -120px 240px, rgba(124,92,255,0.16), rgba(124,92,255,0) 55%)',
        'linear-gradient(180deg, #0b1422 0%, #0a111c 50%, #070b12 80%, #05080d 100%)'
      ].join(', '),
      color: 'oklch(0.985 0 0)'
    }}>
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack spacing={4}>
          {/* Page Header */}
          <Box>
            <Chip 
              label={isES ? '🎯 Tu Centro de Control' : '🎯 Your Control Center'}
              sx={{ 
                bgcolor: 'rgba(124,92,255,0.15)', 
                color: '#a78bfa',
                fontWeight: 600,
                fontSize: '0.85rem',
                mb: 2,
              }}
            />
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #fff 0%, #a78bfa 50%, #4fe1ff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              {isES ? 'Mi Actividad' : 'My Activity'}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 600 }}>
              {isES 
                ? 'Monitorea tus ganancias, uso de modelos y licencias adquiridas en un solo lugar.'
                : 'Monitor your earnings, model usage, and purchased licenses all in one place.'
              }
            </Typography>
          </Box>
          
          {/* Activity Dashboard with Tabs */}
          {isConnected && address && (
            <ActivityDashboard 
              wallet={address} 
              locale={locale}
              chainId={evmChainId}
              licenses={rows}
              licensesLoading={loading}
              onOpenArtifacts={(license) => {
                setSelectedLicense(license)
                setArtifactsDrawerOpen(true)
              }}
            />
          )}
          
          {!isConnected && (
            <Alert severity="info" sx={{ bgcolor:'rgba(36,48,68,0.5)', color:'#b9d7ff', border:'1px solid rgba(120,150,200,0.25)' }}>Connect your wallet to view your licenses.</Alert>
          )}
          {isConnected && needsSwitch && (
            <Alert severity="warning" action={
              <Button color="inherit" size="small" onClick={async()=>{ try { await switchChainAsync({ chainId: evmChainId }) } catch {} }}>Switch</Button>
            } sx={{ bgcolor:'rgba(255,193,7,0.10)', border:'1px solid rgba(255,193,7,0.32)' }}>You are on the wrong network. Please switch to the target network.</Alert>
          )}
        </Stack>
        <Snackbar open={snkOpen} autoHideDuration={6000} onClose={()=> setSnkOpen(false)} anchorOrigin={{ vertical:'bottom', horizontal:'center' }}>
          <Alert onClose={()=> setSnkOpen(false)} severity={snkSev} sx={{ width: '100%' }}>
            {snkMsg}
          </Alert>
        </Snackbar>
      </Container>
      
      {/* Drawer: Artifacts list */}
      <Drawer
        anchor="right"
        open={artifactsDrawerOpen}
        onClose={() => setArtifactsDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 600, md: 700 },
            bgcolor: 'rgba(20,26,42,0.98)',
            backgroundImage: 'linear-gradient(180deg, rgba(38,46,64,0.95), rgba(20,26,42,0.95))',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                {selectedLicense?.modelName || (isES ? 'Artifacts del modelo' : 'Model artifacts')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#ffffffb3' }}>
                {isES ? 'Licencia NFT' : 'License NFT'} #{selectedLicense?.tokenId} • {selectedLicense?.kind === 0 ? (isES ? 'Perpetua' : 'Perpetual') : (isES ? 'Suscripción' : 'Subscription')}
              </Typography>
            </Box>
            <IconButton onClick={() => setArtifactsDrawerOpen(false)} sx={{ color: '#ffffffb3' }}>
              <CloseIcon />
            </IconButton>
          </Stack>

          {/* Artifacts table */}
          {selectedLicense?.modelData?.artifactsList && selectedLicense.modelData.artifactsList.length > 0 ? (
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
                    <TableCell sx={{ color: '#ffffffb3', fontWeight: 600, fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {isES ? 'Archivo' : 'File'}
                    </TableCell>
                    <TableCell sx={{ color: '#ffffffb3', fontWeight: 600, fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      CID
                    </TableCell>
                    <TableCell sx={{ color: '#ffffffb3', fontWeight: 600, fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {isES ? 'Tamaño' : 'Size'}
                    </TableCell>
                    <TableCell sx={{ color: '#ffffffb3', fontWeight: 600, fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {isES ? 'Acciones' : 'Actions'}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedLicense.modelData.artifactsList.map((artifact: any, idx: number) => (
                    <TableRow key={idx} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }}>
                      <TableCell sx={{ color: '#ffffffcc', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500, fontSize: '0.85rem' }}>
                          {artifact.filename || (isES ? 'Sin nombre' : 'Unnamed')}
                        </Typography>
                        {artifact.role && (
                          <Typography variant="caption" sx={{ color: '#ffffffb3', fontSize: '0.7rem' }}>
                            {artifact.role}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ color: '#ffffffcc', fontSize: '0.75rem', fontFamily: 'monospace', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <Tooltip title={artifact.cid || ''}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#ffffffb3' }}>
                            {artifact.cid ? `${artifact.cid.slice(0, 8)}...${artifact.cid.slice(-6)}` : '—'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ color: '#ffffffcc', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        {artifact.sizeBytes ? (
                          <Typography variant="caption" sx={{ color: '#ffffffb3', fontSize: '0.75rem' }}>
                            {(artifact.sizeBytes / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                        ) : '—'}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <Stack direction="row" spacing={0.5}>
                          {artifact.cid && (
                            <Tooltip title={isES ? 'Copiar CID' : 'Copy CID'}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  navigator.clipboard.writeText(artifact.cid)
                                  setSnkSev('success')
                                  setSnkMsg(isES ? 'CID copiado' : 'CID copied')
                                  setSnkOpen(true)
                                }}
                                sx={{ color: '#ffffffb3', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}
                              >
                                <ContentCopyIcon sx={{ fontSize: '1rem' }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {artifact.uri && (
                            <Tooltip title={isES ? 'Copiar URI' : 'Copy URI'}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  navigator.clipboard.writeText(artifact.uri)
                                  setSnkSev('success')
                                  setSnkMsg(isES ? 'URI copiado' : 'URI copied')
                                  setSnkOpen(true)
                                }}
                                sx={{ color: '#ffffffb3', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}
                              >
                                <LanguageIcon sx={{ fontSize: '1rem' }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {artifact.cid && (
                            <Tooltip title={isES ? 'Descargar' : 'Download'}>
                              <IconButton
                                size="small"
                                component="a"
                                href={`/api/ipfs/ipfs/${artifact.cid}`}
                                download={artifact.filename || 'artifact'}
                                target="_blank"
                                sx={{ color: '#ffffffb3', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}
                              >
                                <DownloadIcon sx={{ fontSize: '1rem' }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#ffffffb3', mb: 1 }}>
                {isES ? 'No hay artifacts disponibles' : 'No artifacts available'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#ffffff99' }}>
                {isES ? 'Este modelo no tiene archivos para descargar' : 'This model has no files to download'}
              </Typography>
            </Box>
          )}

          {/* Instructions to download and run */}
          {selectedLicense?.modelData?.download_notes && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, mb: 1.5, fontSize: '0.95rem' }}>
                {isES ? 'Instrucciones para descargar y ejecutar el modelo' : 'Instructions to download and run the model'}
              </Typography>
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: 2,
                  '& pre': {
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    color: '#ffffffcc'
                  }
                }}
              >
                <pre>{selectedLicense.modelData.download_notes}</pre>
              </Box>
            </Box>
          )}

          {/* Download notice */}
          {selectedLicense && !selectedLicense.validDownload && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,152,0,0.1)', border: '1px solid rgba(255,152,0,0.3)', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: '#ffa726', fontSize: '0.8rem' }}>
                ⚠️ {isES ? 'Descarga no permitida por esta licencia' : 'Download not allowed by this license'}
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Drawer: View NFT Card */}
      <Drawer
        anchor="right"
        open={viewDrawerOpen}
        onClose={() => setViewDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 480 },
            bgcolor: 'rgba(10,16,28,0.98)',
            backgroundImage: 'linear-gradient(180deg, rgba(22,26,36,0.95), rgba(10,16,28,0.95))',
            borderLeft: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        {viewLicense && (
          <Box sx={{ p: 3, height:'100%', display:'flex', flexDirection:'column' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb:2 }}>
              <Box>
                <Typography variant="h6" sx={{ color:'#fff', fontWeight:700 }}>
                  {viewLicense.modelName || (viewLicense.modelId ? `Model #${viewLicense.modelId}` : isES ? 'Modelo' : 'Model')}
                </Typography>
                <Typography variant="caption" sx={{ color:'#ffffff99' }}>
                  {isES ? 'Licencia NFT' : 'License NFT'} #{viewLicense.tokenId}
                </Typography>
              </Box>
              <IconButton onClick={() => setViewDrawerOpen(false)} sx={{ color:'#ffffffb3' }}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Box sx={{
              borderRadius:2,
              border:'1px solid rgba(255,255,255,0.08)',
              overflow:'hidden',
              boxShadow:'0 12px 32px rgba(0,0,0,0.45)'
            }}>
              {viewLicense.modelData?.imageUrl ? (
                <Box component="img"
                  src={viewLicense.modelData.imageUrl}
                  alt={viewLicense.modelName || 'Model'}
                  sx={{ width:'100%', height:220, objectFit:'cover' }}
                />
              ) : (
                <Box sx={{ height:220, bgcolor:'rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Typography variant="caption" sx={{ color:'#ffffff80' }}>
                    {isES ? 'Sin imagen' : 'No image'}
                  </Typography>
                </Box>
              )}

              <Box sx={{ p:2.5, bgcolor:'rgba(255,255,255,0.01)' }}>
                <Stack spacing={1.5}>
                  <Typography variant="body2" sx={{ color:'#fff', fontWeight:700 }}>
                    {viewLicense.viewModel?.step1?.name || viewLicense.modelName}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip 
                      label={viewLicense.kind === 0 ? (isES ? 'Perpetua' : 'Perpetual') : (isES ? 'Suscripción' : 'Subscription')}
                      size="small"
                      sx={{
                        bgcolor: viewLicense.kind === 0 ? 'rgba(76,175,80,0.18)' : 'rgba(33,150,243,0.18)',
                        color: viewLicense.kind === 0 ? '#7feb9c' : '#7ec8ff',
                        fontWeight:600,
                        fontSize:'0.7rem'
                      }}
                    />
                    {viewLicense.validApi && (
                      <Chip size="small" label="API" icon={<ApiIcon sx={{ fontSize:'0.8rem' }} />} variant="outlined" sx={{ color:'#ffffffcc', borderColor:'rgba(255,255,255,0.2)', fontSize:'0.65rem' }} />
                    )}
                    {viewLicense.validDownload && (
                      <Chip size="small" label={isES ? 'Descarga' : 'Download'} icon={<DownloadIcon sx={{ fontSize:'0.8rem' }} />} variant="outlined" sx={{ color:'#ffffffcc', borderColor:'rgba(255,255,255,0.2)', fontSize:'0.65rem' }} />
                    )}
                  </Stack>
                  {viewLicense.viewModel?.step1?.summary && (
                    <Typography variant="body2" sx={{ color:'#ffffffcc', lineHeight:1.5 }}>
                      {viewLicense.viewModel.step1.summary}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  )
}

export default EvmLicensesPageImpl
