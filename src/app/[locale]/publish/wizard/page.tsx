"use client";

import React from 'react';
import NextDynamic from 'next/dynamic'
import Link from 'next/link'
import { 
  Box, Stack, Typography, Button, Grid, Chip, Dialog, DialogTitle, 
  DialogContent, DialogActions, Container, Avatar, Card, CardContent 
} from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import VerifiedIcon from '@mui/icons-material/Verified'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DescriptionIcon from '@mui/icons-material/Description'
import SettingsIcon from '@mui/icons-material/Settings'
import GavelIcon from '@mui/icons-material/Gavel'
import PublishIcon from '@mui/icons-material/Publish'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import SecurityIcon from '@mui/icons-material/Security'
import SpeedIcon from '@mui/icons-material/Speed'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import {useLocale, useTranslations} from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation'
import { useWalletAddress } from '@/hooks/useWalletAddress'

const UnifiedConnectButton = NextDynamic<any>(
  () => import('@/components/UnifiedConnectButton').then(m => m.UnifiedConnectButton),
  { ssr: false }
)

export const dynamic = 'force-dynamic'

// Step icons mapping
const stepIcons = [
  <DescriptionIcon key="1" sx={{ fontSize: 28 }} />,
  <AutoAwesomeIcon key="2" sx={{ fontSize: 28 }} />,
  <CloudUploadIcon key="3" sx={{ fontSize: 28 }} />,
  <GavelIcon key="4" sx={{ fontSize: 28 }} />,
  <PublishIcon key="5" sx={{ fontSize: 28 }} />,
]

// Step gradients
const stepGradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
]

export default function WizardIndexLocalized() {
  const t = useTranslations()
  const locale = useLocale()
  const base = `/${locale}/publish/wizard`
  const router = useRouter()
  const searchParams = useSearchParams()
  const [askConnect, setAskConnect] = React.useState(false)
  const [hoveredStep, setHoveredStep] = React.useState<number | null>(null)
  const { walletAddress } = useWalletAddress()
  const es = locale === 'es'

  // Local labels
  const L = React.useMemo(() => ({
    badge: es ? 'Asistente de Publicación' : 'Publishing Wizard',
    title: es ? 'Publica tu modelo de IA en minutos' : 'Publish your AI model in minutes',
    subtitle: es 
      ? 'Sigue 5 simples pasos para crear un listado profesional, configurar precios y comenzar a vender globalmente.'
      : 'Follow 5 simple steps to create a professional listing, set pricing, and start selling globally.',
    cta: es ? 'Comenzar ahora' : 'Start now',
    learnMore: es ? 'Ver documentación' : 'View documentation',
    stepsTitle: es ? 'Los 5 pasos' : 'The 5 steps',
    stepsSubtitle: es 
      ? 'Cada paso está diseñado para maximizar la visibilidad y conversión de tu modelo.'
      : 'Each step is designed to maximize your model\'s visibility and conversion.',
    benefitsTitle: es ? '¿Por qué publicar en WasiAI?' : 'Why publish on WasiAI?',
    benefits: es ? [
      { icon: <AttachMoneyIcon />, title: 'Monetización instantánea', desc: 'Recibe pagos en USDC cada vez que alguien usa tu modelo. Sin esperas.' },
      { icon: <SecurityIcon />, title: 'Propiedad verificada', desc: 'Tu modelo queda registrado en blockchain con identidad verificable.' },
      { icon: <TrendingUpIcon />, title: 'Alcance global', desc: 'Accede a miles de empresas y desarrolladores buscando modelos de IA.' },
      { icon: <SpeedIcon />, title: 'Entrega segura', desc: 'IPFS + cifrado garantizan que solo compradores autorizados accedan.' },
    ] : [
      { icon: <AttachMoneyIcon />, title: 'Instant monetization', desc: 'Get paid in USDC every time someone uses your model. No waiting.' },
      { icon: <SecurityIcon />, title: 'Verified ownership', desc: 'Your model is registered on blockchain with verifiable identity.' },
      { icon: <TrendingUpIcon />, title: 'Global reach', desc: 'Access thousands of companies and developers looking for AI models.' },
      { icon: <SpeedIcon />, title: 'Secure delivery', desc: 'IPFS + encryption ensures only authorized buyers can access.' },
    ],
    readyTitle: es ? '¿Listo para comenzar?' : 'Ready to get started?',
    readySubtitle: es 
      ? 'En menos de 10 minutos tendrás tu modelo listo para vender.'
      : 'In less than 10 minutes you\'ll have your model ready to sell.',
    step1Short: es ? 'Identidad' : 'Identity',
    step2Short: es ? 'Ficha cliente' : 'Customer sheet',
    step3Short: es ? 'Archivos' : 'Files',
    step4Short: es ? 'Precios' : 'Pricing',
    step5Short: es ? 'Publicar' : 'Publish',
  }), [es])

  // Preserve query params (mode, modelId) for upgrade flow
  const queryString = React.useMemo(() => {
    const params = new URLSearchParams()
    if (searchParams.get('mode')) params.set('mode', searchParams.get('mode')!)
    if (searchParams.get('modelId')) params.set('modelId', searchParams.get('modelId')!)
    return params.toString() ? `?${params.toString()}` : ''
  }, [searchParams])

  const onStart = () => {
    if (walletAddress) {
      router.push(`${base}/step1${queryString}`)
    } else {
      setAskConnect(true)
    }
  }

  React.useEffect(() => {
    if (askConnect && walletAddress) {
      try { setAskConnect(false) } catch {}
      try { router.push(`${base}/step1${queryString}`) } catch {}
    }
  }, [askConnect, walletAddress, router, base, queryString])

  React.useEffect(() => {
    try { localStorage.removeItem('wizard_resetting'); sessionStorage.removeItem('wizard_resetting') } catch {}
    const isUpgradeMode = searchParams.get('mode') === 'upgrade' && searchParams.get('modelId')
    if (!isUpgradeMode) {
      try {
        localStorage.removeItem('wizard_upgrade_mode')
        localStorage.removeItem('wizard_upgrade_model_id')
        localStorage.removeItem('wizard_upgrade_slug')
      } catch {}
    }
  }, [searchParams])

  React.useEffect(() => {
    try { router.prefetch(`${base}/step1`) } catch {}
  }, [router, base])

  const stepLabels = [L.step1Short, L.step2Short, L.step3Short, L.step4Short, L.step5Short]
  const stepDescriptions = [
    t('wizard.step1.subtitle'),
    t('wizard.step2.subtitle'),
    t('wizard.step3.subtitle'),
    t('wizard.step4.subtitle'),
    t('wizard.step5.subtitle'),
  ]

  return (
    <Box sx={{
      minHeight: '100vh',
      background: [
        'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,92,255,0.15), transparent)',
        'radial-gradient(ellipse 60% 50% at 100% 50%, rgba(46,160,255,0.1), transparent)',
        'radial-gradient(ellipse 60% 50% at 0% 80%, rgba(124,92,255,0.08), transparent)',
        'linear-gradient(180deg, #0b1422 0%, #0a111c 50%, #070b12 100%)'
      ].join(', '),
    }}>
      {/* Hero Section */}
      <Box sx={{ 
        pt: { xs: 8, md: 12 }, 
        pb: { xs: 6, md: 10 },
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background elements */}
        <Box sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,92,255,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulse 8s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
            '50%': { transform: 'scale(1.2)', opacity: 0.8 },
          }
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46,160,255,0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animation: 'pulse 10s ease-in-out infinite reverse',
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                <Chip 
                  icon={<RocketLaunchIcon sx={{ fontSize: 16 }} />}
                  label={L.badge}
                  sx={{ 
                    bgcolor: 'rgba(124,92,255,0.15)', 
                    color: '#a78bfa',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    py: 2.5,
                    px: 1,
                    width: 'fit-content',
                    '& .MuiChip-icon': { color: '#a78bfa' }
                  }}
                />
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontSize: { xs: '2.2rem', md: '3.2rem' },
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #fff 0%, #a78bfa 50%, #4fe1ff 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.1
                  }}
                >
                  {L.title}
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    fontWeight: 400,
                    lineHeight: 1.6,
                    maxWidth: 500
                  }}
                >
                  {L.subtitle}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                  <Button
                    onClick={onStart}
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      background: 'linear-gradient(135deg, #7c5cff 0%, #2ea0ff 100%)',
                      color: '#fff',
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontSize: '1rem',
                      boxShadow: '0 4px 20px rgba(124,92,255,0.4)',
                      '&:hover': { 
                        background: 'linear-gradient(135deg, #8b6fff 0%, #3db0ff 100%)',
                        boxShadow: '0 6px 25px rgba(124,92,255,0.5)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.2s'
                    }}
                  >
                    {L.cta}
                  </Button>
                  <Button
                    component={Link}
                    href={`/${locale}/use-cases`}
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: '#fff',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': { 
                        borderColor: '#7c5cff',
                        bgcolor: 'rgba(124,92,255,0.1)'
                      }
                    }}
                  >
                    {es ? 'Ver casos de uso' : 'View use cases'}
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              {/* Steps Preview Card */}
              <Card sx={{
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'linear-gradient(180deg, rgba(22,26,36,0.9) 0%, rgba(12,15,24,0.95) 100%)',
                backdropFilter: 'blur(20px)',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    {[0, 1, 2, 3, 4].map((idx) => (
                      <Box 
                        key={idx}
                        onMouseEnter={() => setHoveredStep(idx)}
                        onMouseLeave={() => setHoveredStep(null)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 2,
                          borderRadius: '12px',
                          bgcolor: hoveredStep === idx ? 'rgba(124,92,255,0.1)' : 'rgba(255,255,255,0.03)',
                          border: '1px solid',
                          borderColor: hoveredStep === idx ? 'rgba(124,92,255,0.3)' : 'rgba(255,255,255,0.06)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          transform: hoveredStep === idx ? 'translateX(4px)' : 'none',
                        }}
                      >
                        <Avatar sx={{ 
                          background: stepGradients[idx],
                          width: 44,
                          height: 44,
                        }}>
                          {stepIcons[idx]}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700 }}>
                            {es ? 'Paso' : 'Step'} {idx + 1} · {stepLabels[idx]}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: 'rgba(255,255,255,0.5)',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {stepDescriptions[idx]}
                          </Typography>
                        </Box>
                        <CheckCircleIcon sx={{ 
                          color: 'rgba(255,255,255,0.2)',
                          fontSize: 20
                        }} />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack spacing={4} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              color: '#fff', 
              fontWeight: 800,
              fontSize: { xs: '1.8rem', md: '2.5rem' }
            }}
          >
            {L.benefitsTitle}
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {L.benefits.map((benefit, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card sx={{
                height: '100%',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'linear-gradient(180deg, rgba(22,26,36,0.8) 0%, rgba(12,15,24,0.9) 100%)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: 'rgba(124,92,255,0.3)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(124,92,255,0.15)',
                      width: 56,
                      height: 56,
                      '& .MuiSvgIcon-root': { color: '#a78bfa', fontSize: 28 }
                    }}>
                      {benefit.icon}
                    </Avatar>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                      {benefit.desc}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ pb: 10 }}>
        <Box sx={{ 
          py: 6, 
          px: 4,
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(124,92,255,0.15) 0%, rgba(46,160,255,0.15) 100%)',
          border: '1px solid rgba(124,92,255,0.2)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,92,255,0.2) 0%, transparent 70%)',
            filter: 'blur(40px)'
          }} />

          <Stack spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Avatar sx={{ 
              width: 72, 
              height: 72, 
              bgcolor: 'rgba(124,92,255,0.2)',
              border: '2px solid rgba(124,92,255,0.3)'
            }}>
              <RocketLaunchIcon sx={{ fontSize: 36, color: '#a78bfa' }} />
            </Avatar>
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#fff', 
                fontWeight: 800,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              {L.readyTitle}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255,255,255,0.7)', 
                maxWidth: 400
              }}
            >
              {L.readySubtitle}
            </Typography>
            <Button
              onClick={onStart}
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{
                background: 'linear-gradient(135deg, #7c5cff 0%, #2ea0ff 100%)',
                color: '#fff',
                fontWeight: 700,
                px: 5,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '1.1rem',
                boxShadow: '0 4px 20px rgba(124,92,255,0.4)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #8b6fff 0%, #3db0ff 100%)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s'
              }}
            >
              {L.cta}
            </Button>
          </Stack>
        </Box>
      </Container>

      {/* Connect Wallet Dialog */}
      <Dialog
        open={askConnect}
        onClose={() => setAskConnect(false)}
        fullWidth 
        maxWidth="xs"
        PaperProps={{ 
          sx: { 
            borderRadius: '20px', 
            border: '1px solid rgba(124,92,255,0.3)', 
            background: 'linear-gradient(180deg, rgba(22,26,36,0.98) 0%, rgba(12,15,24,0.98) 100%)', 
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)', 
            backdropFilter: 'blur(20px)' 
          } 
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#fff', textAlign: 'center', pt: 4 }}>
          {t('wizard.index.connectModal.title')}
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
            {t('wizard.index.connectModal.body')}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            {askConnect && <UnifiedConnectButton onBeforeOpen={() => setAskConnect(false)} />}
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={() => setAskConnect(false)} 
            sx={{ 
              textTransform: 'none', 
              color: 'rgba(255,255,255,0.6)',
              '&:hover': { color: '#fff' }
            }}
          >
            {t('wizard.index.connectModal.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
