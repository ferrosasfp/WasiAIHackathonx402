"use client";

import React from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
  Avatar,
} from '@mui/material'
import { 
  UploadRounded, 
  LockRounded, 
  FlashOnRounded, 
  BoltRounded, 
  ArrowForwardRounded,
  RocketLaunch as RocketIcon,
  CloudUpload as UploadIcon,
  Verified as VerifiedIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  AccountBalanceWallet as WalletIcon,
  PlayArrow as PlayIcon,
  TrendingUp as TrendingIcon,
  Psychology as PsychologyIcon,
  Support as SupportIcon,
  AutoGraph as AutoGraphIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material'

export const dynamic = 'force-dynamic'

export default function LandingV2() {
  const locale = useLocale()
  const to = (p: string) => `/${locale}${p}`
  const es = locale === 'es'
  const tokenSym = 'USDC'
  const L = React.useMemo(()=>({
    heroTitle: es ? 'Agentes de IA que cobran por uso.' : 'AI agents that get paid per use.',
    heroBody: es
      ? 'WasiAI es el hogar de los agentes de IA en Avalanche. Publica tu modelo y cobra automáticamente cada vez que alguien lo usa. Sin intermediarios. Sin facturas. Sin esperas. Cada agente tiene identidad verificada en blockchain.'
      : 'WasiAI is the home of AI agents on Avalanche. Publish your model and get paid automatically every time someone uses it. No middlemen. No invoices. No waiting. Every agent has verified identity on blockchain.',
    ctaExplore: es ? 'Explorar modelos' : 'Explore models',
    ctaPublish: es ? 'Publica tu modelo' : 'Publish your model',
    howItWorks: es ? 'Cómo funciona' : 'How it works',
    forCreators: es ? 'Para creadores' : 'For creators',
    forTeams: es ? 'Para equipos' : 'For teams',
    featured: es ? 'Modelos destacados' : 'Featured models',
    featuredSub: es ? 'Modelos populares seleccionados por el equipo de WasiAI.' : 'Popular models curated by the WasiAI team.',
    whyTitle: es ? 'Por qué WasiAI' : 'Why WasiAI',
    useCases: es ? 'Hecho para casos reales' : 'Built for real use cases',
    seeModels: es ? 'Ver modelos →' : 'See models →',
    ctaBandTitle: es ? '¿Listo para publicar o probar tu primer modelo?' : 'Ready to publish or try your first model?',
    ctaBandExplore: es ? 'Explorar modelos' : 'Explore models',
    ctaBandPublish: es ? 'Publicar un modelo' : 'Publish a model',
    subscription: es ? 'Pago por uso' : 'Pay per use',
    perpetual: es ? 'Licencia perpetua' : 'Perpetual License',
    from: es ? 'Desde' : 'From',
    runDemo: es ? 'Probar demo' : 'Run demo',
    viewDetails: es ? 'Ver detalles' : 'View details',
    viewModel: es ? 'Ver modelo' : 'View model',
    demoCard: es
      ? { name: 'Pronóstico de Ventas Pro', desc: 'Analítica predictiva para proyección de ingresos', tags: ['Analítica','Modelo ML','Enterprise'] }
      : { name: 'Sales Forecasting Pro', desc: 'Advanced AI model for predictive sales analytics', tags: ['Analytics','ML Model','Enterprise'] },
    creatorsSteps: es ? [
      { k: '1/3', t: 'Publica tu modelo', d: 'Sube tu modelo, configura precio por uso y obtén identidad verificada' },
      { k: '2/3', t: 'Elige cómo cobrar', d: 'Por cada uso, suscripción mensual o licencia perpetua' },
      { k: '3/3', t: 'Cobra automáticamente', d: 'Recibe USDC instantáneamente cada vez que usan tu modelo' },
    ] : [
      { k: '1/3', t: 'Publish your model', d: 'Upload your model, set price per use and get verified identity' },
      { k: '2/3', t: 'Choose how to charge', d: 'Per use, monthly subscription, or perpetual license' },
      { k: '3/3', t: 'Get paid automatically', d: 'Receive USDC instantly every time someone uses your model' },
    ],
    teamsSteps: es ? [
      { k: '1/3', t: 'Descubre agentes', d: 'Busca agentes verificados por caso de uso' },
      { k: '2/3', t: 'Prueba antes de pagar', d: 'Corre una demo gratuita en entorno seguro' },
      { k: '3/3', t: 'Paga solo por lo que usas', d: 'Sin contratos. Sin mínimos. Pagas por cada llamada.' },
    ] : [
      { k: '1/3', t: 'Discover agents', d: 'Find verified agents by use case' },
      { k: '2/3', t: 'Try before you pay', d: 'Run a free demo in a safe environment' },
      { k: '3/3', t: 'Pay only for what you use', d: 'No contracts. No minimums. Pay per call.' },
    ],
    whyList: es ? [
      { t: '💰 Pago por uso (x402)', d: 'Cobra automáticamente cada vez que alguien usa tu modelo. Sin facturas. Sin esperas. El dinero llega directo a tu wallet.' },
      { t: '🪪 Identidad verificada (ERC-8004)', d: 'Cada agente tiene un "pasaporte digital" que prueba quién lo creó y su historial de uso. Confía en agentes verificados.' },
      { t: '🎮 Prueba gratis antes de pagar', d: 'Corre demos en un entorno seguro. Si te gusta, pagas. Si no, no gastas nada.' },
      { t: '⚡ Pagos instantáneos en USDC', d: 'Los creadores reciben su pago en segundos, no en 30 días. Sin intermediarios. Sin comisiones ocultas.' },
    ] : [
      { t: '💰 Pay per use (x402)', d: 'Get paid automatically every time someone uses your model. No invoices. No waiting. Money goes straight to your wallet.' },
      { t: '🪪 Verified identity (ERC-8004)', d: 'Every agent has a "digital passport" proving who created it and its usage history. Trust verified agents.' },
      { t: '🎮 Try free before you pay', d: 'Run demos in a safe environment. If you like it, pay. If not, spend nothing.' },
      { t: '⚡ Instant payments in USDC', d: 'Creators get paid in seconds, not 30 days. No middlemen. No hidden fees.' },
    ],
    useCasesList: es ? [
      { t: 'Analítica y pronósticos', d: 'Modelos predictivos para ingresos, demanda y forecasting.' },
      { t: 'Atención al cliente y copilots', d: 'Agentes para soporte y automatización interna.' },
      { t: 'Trading y agentes DeFi', d: 'Modelos para gestión de portafolio y estrategias.' },
      { t: 'Herramientas internas y automatizaciones', d: 'Modelos a medida para optimizar flujos de trabajo.' },
    ] : [
      { t: 'Analytics & forecasting', d: 'Predictive models for revenue, demand, and market forecasting.' },
      { t: 'Customer support & copilots', d: 'Autonomous agents for customer service and internal automation.' },
      { t: 'Trading & DeFi agents', d: 'Specialized models for portfolio management and trading strategies.' },
      { t: 'Internal tools & automations', d: 'Custom models to streamline workflows and internal operations.' },
    ],
    featuredModels: es ? [
      { name: 'Pronóstico de Ventas Pro', desc: 'Analítica predictiva para proyección de ingresos', tags: ['Analítica','Verificado','Enterprise'], sub: '0.1 USDC/uso', perp: '50 USDC', chain: 'Avalanche' },
      { name: 'Agente de Riesgo DeFi', desc: 'Agente autónomo para gestión de riesgo de portafolio', tags: ['Agente','DeFi','Verificado'], sub: '0.2 USDC/uso', perp: '80 USDC', chain: 'Avalanche' },
      { name: 'Copiloto de Soporte', desc: 'Automatización de atención al cliente con IA', tags: ['NLP','Copilot','Verificado'], sub: '0.05 USDC/uso', perp: '30 USDC', chain: 'Avalanche' },
    ] : [
      { name: 'Sales Forecasting Pro', desc: 'Predictive analytics for revenue forecasting', tags: ['Analytics','Verified','Enterprise'], sub: '0.1 USDC/use', perp: '50 USDC', chain: 'Avalanche' },
      { name: 'DeFi Risk Agent', desc: 'Autonomous agent for portfolio risk management', tags: ['Agent','DeFi','Verified'], sub: '0.2 USDC/use', perp: '80 USDC', chain: 'Avalanche' },
      { name: 'Customer Support Copilot', desc: 'AI-powered customer service automation', tags: ['NLP','Copilot','Verified'], sub: '0.05 USDC/use', perp: '30 USDC', chain: 'Avalanche' },
    ],
    footerTagline: es ? 'Agentes de IA que cobran por uso en Avalanche.' : 'AI agents that get paid per use on Avalanche.',
    footerCols: es ? [
      { h: 'Producto', items: ['Explorar','Precios','Hoja de ruta'] },
      { h: 'Desarrolladores', items: ['Docs','API','GitHub'] },
      { h: 'Compañía', items: ['Acerca de','Contacto'] },
      { h: 'Comunidad', items: ['X (Twitter)','Discord','Blog'] },
    ] : [
      { h: 'Product', items: ['Explore','Pricing','Roadmap'] },
      { h: 'Developers', items: ['Docs','API','GitHub'] },
      { h: 'Company', items: ['About','Contact'] },
      { h: 'Community', items: ['X (Twitter)','Discord','Blog'] },
    ],
    footerCopyright: (year: number) => es ? `© ${year} WasiAI. Todos los derechos reservados.` : `© ${year} WasiAI. All rights reserved.`,
  }), [es])

  const panelSx = {
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'linear-gradient(180deg, rgba(22,26,36,0.9) 0%, rgba(12,15,24,0.95) 100%)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    backdropFilter: 'blur(20px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
      borderColor: 'rgba(124,92,255,0.3)'
    }
  } as const

  return (
    <Box sx={{
      minHeight: '100vh',
      background: [
        'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,92,255,0.15), transparent)',
        'radial-gradient(ellipse 60% 50% at 100% 50%, rgba(46,160,255,0.1), transparent)',
        'radial-gradient(ellipse 60% 50% at 0% 80%, rgba(124,92,255,0.08), transparent)',
        'linear-gradient(180deg, #0b1422 0%, #0a111c 50%, #070b12 100%)'
      ].join(', '),
      color: '#fff'
    }}>

      {/* Hero Section */}
      <Box sx={{ 
        pt: { xs: 8, md: 14 }, 
        pb: { xs: 6, md: 10 },
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background elements */}
        <Box sx={{
          position: 'absolute',
          top: '5%',
          right: '15%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46,160,255,0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'pulse 8s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
            '50%': { transform: 'scale(1.3)', opacity: 0.8 },
          }
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,92,255,0.12) 0%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'pulse 10s ease-in-out infinite reverse',
        }} />
        <Box sx={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,225,255,0.08) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0) translateX(-50%)' },
            '50%': { transform: 'translateY(-20px) translateX(-50%)' },
          }
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack spacing={4}>
                <Chip 
                  icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                  label={es ? 'Marketplace de Agentes IA en Avalanche' : 'AI Agent Marketplace on Avalanche'}
                  sx={{ 
                    alignSelf: 'flex-start',
                    bgcolor: 'rgba(124,92,255,0.15)',
                    color: '#a78bfa',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    py: 2.5,
                    px: 1,
                    '& .MuiChip-icon': { color: '#a78bfa' }
                  }}
                />
                <Typography 
                  component="h1" 
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                    background: 'linear-gradient(135deg, #fff 0%, #a78bfa 50%, #4fe1ff 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {L.heroTitle}
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    fontWeight: 400,
                    lineHeight: 1.7,
                    maxWidth: 560,
                    fontSize: { xs: '1rem', md: '1.15rem' }
                  }}
                >
                  {L.heroBody}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
                  <Button 
                    size="large"
                    startIcon={<RocketIcon />}
                    component={Link} 
                    href={to('/models')}
                    sx={{
                      background: 'linear-gradient(135deg, #7c5cff 0%, #2ea0ff 100%)',
                      color: '#fff',
                      fontWeight: 700,
                      px: 4,
                      py: 1.75,
                      borderRadius: '14px',
                      textTransform: 'none',
                      fontSize: '1.05rem',
                      boxShadow: '0 8px 30px rgba(124,92,255,0.4)',
                      '&:hover': { 
                        background: 'linear-gradient(135deg, #8b6fff 0%, #3db0ff 100%)',
                        boxShadow: '0 10px 40px rgba(124,92,255,0.5)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    {L.ctaExplore}
                  </Button>
                  <Button 
                    size="large"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    component={Link} 
                    href={to('/publish/wizard')}
                    sx={{ 
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: '#fff',
                      fontWeight: 600,
                      px: 4,
                      py: 1.75,
                      borderRadius: '14px',
                      textTransform: 'none',
                      fontSize: '1.05rem',
                      '&:hover': { 
                        borderColor: '#7c5cff',
                        bgcolor: 'rgba(124,92,255,0.1)'
                      }
                    }}
                  >
                    {L.ctaPublish}
                  </Button>
                </Stack>
                <Stack direction="row" spacing={1.5} sx={{ pt: 2 }}>
                  {[
                    { label: 'Avalanche', color: '#ff6b6b', bg: 'rgba(232,65,66,0.15)', border: 'rgba(232,65,66,0.35)' },
                    { label: 'x402', color: '#4fe1ff', bg: 'rgba(79,225,255,0.12)', border: 'rgba(79,225,255,0.35)' },
                    { label: 'ERC-8004', color: '#a78bfa', bg: 'rgba(124,92,255,0.15)', border: 'rgba(124,92,255,0.35)' },
                  ].map((c) => (
                    <Chip 
                      key={c.label} 
                      size="small" 
                      label={c.label} 
                      sx={{ 
                        bgcolor: c.bg, 
                        color: c.color, 
                        border: `1px solid ${c.border}`,
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }} 
                    />
                  ))}
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              {/* Demo Card */}
              <Card sx={{ ...panelSx, overflow: 'visible' }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack spacing={3}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ 
                        width: 56, 
                        height: 56, 
                        background: 'linear-gradient(135deg, #7c5cff 0%, #2ea0ff 100%)',
                        boxShadow: '0 8px 20px rgba(124,92,255,0.3)'
                      }}>
                        <TrendingIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                          {L.demoCard.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          {L.demoCard.desc}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {L.demoCard.tags.map((t) => (
                        <Chip 
                          key={t} 
                          size="small" 
                          label={t} 
                          sx={{ 
                            bgcolor: 'rgba(124,92,255,0.15)', 
                            color: '#a78bfa', 
                            border: '1px solid rgba(124,92,255,0.3)',
                            fontWeight: 600
                          }} 
                        />
                      ))}
                    </Stack>
                    
                    <Box sx={{ 
                      p: 2.5, 
                      borderRadius: '14px', 
                      bgcolor: 'rgba(0,0,0,0.3)', 
                      border: '1px solid rgba(255,255,255,0.08)' 
                    }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            {L.subscription}
                          </Typography>
                          <Typography sx={{ color: '#4fe1ff', fontWeight: 700, fontSize: '1rem' }}>
                            {L.from} 0.1 USDC/{es ? 'uso' : 'use'}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            {L.perpetual}
                          </Typography>
                          <Typography sx={{ color: '#a78bfa', fontWeight: 700, fontSize: '1rem' }}>
                            {L.from} 10 USDC
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                    
                    <Stack direction="row" spacing={1.5}>
                      <Button 
                        fullWidth 
                        startIcon={<PlayIcon />}
                        sx={{ 
                          background: 'linear-gradient(135deg, #7c5cff 0%, #2ea0ff 100%)',
                          color: '#fff',
                          fontWeight: 700,
                          py: 1.5,
                          borderRadius: '12px',
                          textTransform: 'none',
                          boxShadow: '0 6px 20px rgba(124,92,255,0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #8b6fff 0%, #3db0ff 100%)',
                          }
                        }}
                      >
                        {L.runDemo}
                      </Button>
                      <Button 
                        fullWidth 
                        variant="outlined"
                        sx={{ 
                          borderColor: 'rgba(255,255,255,0.2)',
                          color: '#fff',
                          fontWeight: 600,
                          py: 1.5,
                          borderRadius: '12px',
                          textTransform: 'none',
                          '&:hover': { 
                            borderColor: '#7c5cff',
                            bgcolor: 'rgba(124,92,255,0.1)'
                          }
                        }}
                      >
                        {L.viewDetails}
                      </Button>
                    </Stack>
                    
                    {/* Code Preview */}
                    <Box sx={{ 
                      p: 2, 
                      borderRadius: '12px', 
                      bgcolor: 'rgba(0,0,0,0.5)', 
                      border: '1px solid rgba(255,255,255,0.06)',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      fontSize: 12
                    }}>
                      <Box sx={{ color: 'rgba(255,255,255,0.4)' }}>
                        {'> '}<Box component="span" sx={{ color: '#4fe1ff' }}>invoke_model</Box>
                      </Box>
                      <Box sx={{ color: 'rgba(255,255,255,0.4)' }}>
                        {'{'}<Box component="span" sx={{ color: '#ffb86b' }}>"prediction"</Box>
                        <Box component="span" sx={{ color: 'rgba(255,255,255,0.5)' }}>: </Box>
                        <Box component="span" sx={{ color: '#8ef18b' }}>0.94</Box>,
                      </Box>
                      <Box sx={{ pl: 2, color: 'rgba(255,255,255,0.4)' }}>
                        <Box component="span" sx={{ color: '#ffb86b' }}>"confidence"</Box>
                        <Box component="span" sx={{ color: 'rgba(255,255,255,0.5)' }}>: </Box>
                        <Box component="span" sx={{ color: '#8ef18b' }}>0.87</Box>
                      </Box>
                      <Box sx={{ color: 'rgba(255,255,255,0.4)' }}>{'}'}</Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How it works */}
      <Box sx={{ py: { xs: 8, md: 14 } }}>
        <Container maxWidth="lg">
          <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: { xs: 6, md: 10 } }}>
            <Chip 
              label={es ? 'Proceso simple' : 'Simple process'}
              sx={{ 
                bgcolor: 'rgba(79,225,255,0.12)',
                color: '#4fe1ff',
                fontWeight: 600,
                fontSize: '0.85rem',
                py: 2
              }}
            />
            <Typography 
              variant="h2" 
              sx={{ 
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 800,
                background: 'linear-gradient(135deg, #fff 0%, #4fe1ff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {L.howItWorks}
            </Typography>
          </Stack>

          {/* For Creators */}
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ 
                width: 36, 
                height: 36, 
                background: 'linear-gradient(135deg, #7c5cff 0%, #a78bfa 100%)'
              }}>
                <UploadIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography sx={{ fontWeight: 700, color: '#a78bfa', fontSize: '1.1rem' }}>
                {L.forCreators}
              </Typography>
            </Stack>
          </Stack>
          
          <Grid container spacing={3} sx={{ mb: { xs: 6, md: 10 } }}>
            {L.creatorsSteps.map((s, i) => (
              <Grid key={s.t} item xs={12} md={4}>
                <Card sx={{ 
                  ...panelSx, 
                  height: '100%',
                  position: 'relative',
                  overflow: 'visible',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -1,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: 'linear-gradient(90deg, #7c5cff, #a78bfa)',
                    borderRadius: '20px 20px 0 0'
                  }
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={2.5}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ 
                          width: 52, 
                          height: 52, 
                          background: 'linear-gradient(135deg, #7c5cff 0%, #a78bfa 100%)',
                          boxShadow: '0 8px 20px rgba(124,92,255,0.3)'
                        }}>
                          {i === 0 ? <UploadRounded /> : i === 1 ? <WalletIcon /> : <SpeedIcon />}
                        </Avatar>
                        <Chip 
                          label={s.k} 
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(124,92,255,0.15)',
                            color: '#a78bfa',
                            fontWeight: 700
                          }}
                        />
                      </Stack>
                      <Typography sx={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>
                        {s.t}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.6 }}>
                        {s.d}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* For Teams */}
          <Stack spacing={1} sx={{ mb: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ 
                width: 36, 
                height: 36, 
                background: 'linear-gradient(135deg, #2ea0ff 0%, #4fe1ff 100%)'
              }}>
                <PsychologyIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Typography sx={{ fontWeight: 700, color: '#4fe1ff', fontSize: '1.1rem' }}>
                {L.forTeams}
              </Typography>
            </Stack>
          </Stack>
          
          <Grid container spacing={3}>
            {L.teamsSteps.map((s, i) => (
              <Grid key={s.t} item xs={12} md={4}>
                <Card sx={{ 
                  ...panelSx, 
                  height: '100%',
                  position: 'relative',
                  overflow: 'visible',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -1,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: 'linear-gradient(90deg, #2ea0ff, #4fe1ff)',
                    borderRadius: '20px 20px 0 0'
                  }
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Stack spacing={2.5}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ 
                          width: 52, 
                          height: 52, 
                          background: 'linear-gradient(135deg, #2ea0ff 0%, #4fe1ff 100%)',
                          boxShadow: '0 8px 20px rgba(46,160,255,0.3)'
                        }}>
                          {i === 0 ? <BoltRounded /> : i === 1 ? <SecurityIcon /> : <CheckCircleIcon />}
                        </Avatar>
                        <Chip 
                          label={s.k} 
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(79,225,255,0.12)',
                            color: '#4fe1ff',
                            fontWeight: 700
                          }}
                        />
                      </Stack>
                      <Typography sx={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>
                        {s.t}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.6 }}>
                        {s.d}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Featured models */}
      <Box sx={{ py: { xs: 8, md: 14 }, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Container maxWidth="lg">
          <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: { xs: 6, md: 8 } }}>
            <Chip 
              icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
              label={es ? 'Curados por WasiAI' : 'Curated by WasiAI'}
              sx={{ 
                bgcolor: 'rgba(124,92,255,0.15)',
                color: '#a78bfa',
                fontWeight: 600,
                fontSize: '0.85rem',
                py: 2,
                '& .MuiChip-icon': { color: '#a78bfa' }
              }}
            />
            <Typography 
              variant="h2" 
              sx={{ 
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 800,
                color: '#fff'
              }}
            >
              {L.featured}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 500 }}>
              {L.featuredSub}
            </Typography>
          </Stack>
          
          <Grid container spacing={3}>
            {L.featuredModels.map((m, idx) => (
              <Grid key={m.name} item xs={12} md={4}>
                <Card sx={{ 
                  ...panelSx,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 120,
                    background: idx === 0 
                      ? 'linear-gradient(135deg, rgba(124,92,255,0.15) 0%, rgba(46,160,255,0.1) 100%)'
                      : idx === 1
                      ? 'linear-gradient(135deg, rgba(46,160,255,0.15) 0%, rgba(79,225,255,0.1) 100%)'
                      : 'linear-gradient(135deg, rgba(79,225,255,0.15) 0%, rgba(124,92,255,0.1) 100%)',
                    opacity: 0.5
                  }
                }}>
                  <CardContent sx={{ p: 4, position: 'relative' }}>
                    <Stack spacing={3}>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Avatar sx={{ 
                          width: 56, 
                          height: 56, 
                          background: idx === 0 
                            ? 'linear-gradient(135deg, #7c5cff 0%, #2ea0ff 100%)'
                            : idx === 1
                            ? 'linear-gradient(135deg, #2ea0ff 0%, #4fe1ff 100%)'
                            : 'linear-gradient(135deg, #4fe1ff 0%, #a78bfa 100%)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                        }}>
                          {idx === 0 ? <TrendingIcon /> : idx === 1 ? <AutoGraphIcon /> : <SupportIcon />}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', mb: 0.5 }}>
                            {m.name}
                          </Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                            {m.desc}
                          </Typography>
                        </Box>
                      </Stack>
                      
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {m.tags.map((t) => (
                          <Chip 
                            key={t} 
                            size="small" 
                            label={t} 
                            sx={{ 
                              bgcolor: t.includes('Verif') ? 'rgba(79,225,255,0.12)' : 'rgba(255,255,255,0.08)',
                              color: t.includes('Verif') ? '#4fe1ff' : 'rgba(255,255,255,0.7)',
                              border: t.includes('Verif') ? '1px solid rgba(79,225,255,0.3)' : 'none',
                              fontWeight: 500
                            }} 
                          />
                        ))}
                      </Stack>
                      
                      <Box sx={{ 
                        p: 2, 
                        borderRadius: '12px', 
                        bgcolor: 'rgba(0,0,0,0.3)', 
                        border: '1px solid rgba(255,255,255,0.06)' 
                      }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                              {es ? 'Por uso' : 'Per use'}
                            </Typography>
                            <Typography sx={{ color: '#4fe1ff', fontWeight: 700 }}>
                              {m.sub}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                              {es ? 'Perpetua' : 'Perpetual'}
                            </Typography>
                            <Typography sx={{ color: '#a78bfa', fontWeight: 700 }}>
                              {m.perp}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                      
                      <Stack direction="row" spacing={1}>
                        <Chip 
                          label="Avalanche" 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(232,65,66,0.15)', 
                            color: '#ff6b6b', 
                            border: '1px solid rgba(232,65,66,0.35)',
                            fontWeight: 600
                          }} 
                        />
                        <Chip 
                          icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                          label={es ? 'Verificado' : 'Verified'} 
                          size="small" 
                          sx={{ 
                            bgcolor: 'rgba(79,225,255,0.12)', 
                            color: '#4fe1ff', 
                            border: '1px solid rgba(79,225,255,0.35)',
                            fontWeight: 600,
                            '& .MuiChip-icon': { color: '#4fe1ff' }
                          }} 
                        />
                      </Stack>
                      
                      <Stack direction="row" spacing={1.5}>
                        <Button 
                          fullWidth 
                          variant="outlined"
                          sx={{ 
                            borderColor: 'rgba(255,255,255,0.2)',
                            color: '#fff',
                            fontWeight: 600,
                            py: 1.25,
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': { 
                              borderColor: '#7c5cff',
                              bgcolor: 'rgba(124,92,255,0.1)'
                            }
                          }}
                        >
                          {L.viewModel}
                        </Button>
                        <Button 
                          sx={{ 
                            minWidth: 48,
                            background: 'linear-gradient(135deg, #7c5cff 0%, #2ea0ff 100%)',
                            color: '#fff',
                            borderRadius: '10px',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #8b6fff 0%, #3db0ff 100%)',
                            }
                          }}
                        >
                          <PlayIcon />
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Stack alignItems="center" sx={{ mt: 6 }}>
            <Button 
              component={Link}
              href={to('/models')}
              endIcon={<ArrowForwardRounded />}
              sx={{ 
                color: '#a78bfa',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(124,92,255,0.1)' }
              }}
            >
              {es ? 'Ver todos los modelos' : 'View all models'}
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Why WasiAI */}
      <Box sx={{ py: { xs: 8, md: 14 }, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Container maxWidth="lg">
          <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: { xs: 6, md: 8 } }}>
            <Chip 
              icon={<SpeedIcon sx={{ fontSize: 14 }} />}
              label={es ? 'Ventajas clave' : 'Key advantages'}
              sx={{ 
                bgcolor: 'rgba(79,225,255,0.12)',
                color: '#4fe1ff',
                fontWeight: 600,
                fontSize: '0.85rem',
                py: 2,
                '& .MuiChip-icon': { color: '#4fe1ff' }
              }}
            />
            <Typography 
              variant="h2" 
              sx={{ 
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 800,
                background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {L.whyTitle}
            </Typography>
          </Stack>
          
          <Grid container spacing={3}>
            {L.whyList.map((f, idx) => {
              const icons = [<WalletIcon key="w" />, <SecurityIcon key="s" />, <PlayIcon key="p" />, <SpeedIcon key="sp" />]
              const gradients = [
                'linear-gradient(135deg, #7c5cff 0%, #2ea0ff 100%)',
                'linear-gradient(135deg, #a78bfa 0%, #7c5cff 100%)',
                'linear-gradient(135deg, #2ea0ff 0%, #4fe1ff 100%)',
                'linear-gradient(135deg, #4fe1ff 0%, #a78bfa 100%)',
              ]
              return (
                <Grid key={f.t} item xs={12} md={6}>
                  <Card sx={{ ...panelSx, height: '100%' }}>
                    <CardContent sx={{ p: 4 }}>
                      <Stack direction="row" spacing={3} alignItems="flex-start">
                        <Avatar sx={{ 
                          width: 56, 
                          height: 56, 
                          background: gradients[idx],
                          boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                          flexShrink: 0
                        }}>
                          {icons[idx]}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', mb: 1 }}>
                            {f.t}
                          </Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
                            {f.d}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        </Container>
      </Box>

      {/* Use cases */}
      <Box sx={{ py: { xs: 8, md: 14 }, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <Container maxWidth="lg">
          <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: { xs: 6, md: 8 } }}>
            <Chip 
              icon={<PsychologyIcon sx={{ fontSize: 14 }} />}
              label={es ? 'Aplicaciones' : 'Applications'}
              sx={{ 
                bgcolor: 'rgba(124,92,255,0.15)',
                color: '#a78bfa',
                fontWeight: 600,
                fontSize: '0.85rem',
                py: 2,
                '& .MuiChip-icon': { color: '#a78bfa' }
              }}
            />
            <Typography 
              variant="h2" 
              sx={{ 
                fontSize: { xs: '2rem', md: '2.75rem' },
                fontWeight: 800,
                color: '#fff'
              }}
            >
              {L.useCases}
            </Typography>
          </Stack>
          
          <Grid container spacing={3}>
            {L.useCasesList.map((u, idx) => {
              const icons = [<TrendingIcon key="t" />, <SupportIcon key="s" />, <AutoGraphIcon key="a" />, <PsychologyIcon key="p" />]
              return (
                <Grid key={u.t} item xs={12} md={6}>
                  <Card sx={{ 
                    ...panelSx, 
                    height: '100%',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                      borderColor: 'rgba(124,92,255,0.4)',
                      '& .arrow-icon': {
                        transform: 'translateX(4px)',
                        color: '#a78bfa'
                      }
                    }
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Stack direction="row" spacing={3} alignItems="center">
                        <Avatar sx={{ 
                          width: 52, 
                          height: 52, 
                          background: 'linear-gradient(135deg, rgba(124,92,255,0.2) 0%, rgba(46,160,255,0.2) 100%)',
                          border: '1px solid rgba(124,92,255,0.3)',
                          color: '#a78bfa',
                          flexShrink: 0
                        }}>
                          {icons[idx]}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', mb: 0.5 }}>
                            {u.t}
                          </Typography>
                          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
                            {u.d}
                          </Typography>
                        </Box>
                        <ArrowForwardRounded 
                          className="arrow-icon"
                          sx={{ 
                            color: 'rgba(255,255,255,0.3)', 
                            fontSize: 24,
                            transition: 'all 0.3s'
                          }} 
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
          
          <Stack alignItems="center" sx={{ mt: 6 }}>
            <Button 
              component={Link}
              href={to('/use-cases')}
              endIcon={<ArrowForwardRounded />}
              sx={{ 
                color: '#4fe1ff',
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(79,225,255,0.1)' }
              }}
            >
              {es ? 'Ver todos los casos de uso' : 'View all use cases'}
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* CTA Band */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            position: 'relative', 
            borderRadius: '24px', 
            overflow: 'hidden',
            p: { xs: 5, md: 8 },
            textAlign: 'center'
          }}>
            {/* Background gradients */}
            <Box sx={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'linear-gradient(135deg, rgba(124,92,255,0.2) 0%, rgba(46,160,255,0.2) 100%)',
              zIndex: 0
            }} />
            <Box sx={{ 
              position: 'absolute', 
              inset: 0, 
              background: 'linear-gradient(180deg, rgba(12,15,24,0.9) 0%, rgba(8,10,16,0.95) 100%)',
              zIndex: 1
            }} />
            <Box sx={{ 
              position: 'absolute', 
              inset: 0, 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              zIndex: 2
            }} />
            
            {/* Animated orbs */}
            <Box sx={{
              position: 'absolute',
              top: '20%',
              left: '10%',
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124,92,255,0.2) 0%, transparent 70%)',
              filter: 'blur(40px)',
              animation: 'pulse 6s ease-in-out infinite',
              zIndex: 1
            }} />
            <Box sx={{
              position: 'absolute',
              bottom: '20%',
              right: '10%',
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(46,160,255,0.2) 0%, transparent 70%)',
              filter: 'blur(40px)',
              animation: 'pulse 8s ease-in-out infinite reverse',
              zIndex: 1
            }} />
            
            <Stack spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 3 }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                background: 'linear-gradient(135deg, #7c5cff 0%, #2ea0ff 100%)',
                boxShadow: '0 12px 30px rgba(124,92,255,0.4)'
              }}>
                <RocketIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography 
                sx={{ 
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #fff 0%, #a78bfa 50%, #4fe1ff 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  maxWidth: 600
                }}
              >
                {L.ctaBandTitle}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button 
                  size="large"
                  startIcon={<RocketIcon />}
                  component={Link} 
                  href={to('/models')}
                  sx={{
                    background: 'linear-gradient(135deg, #7c5cff 0%, #2ea0ff 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    px: 4,
                    py: 1.75,
                    borderRadius: '14px',
                    textTransform: 'none',
                    fontSize: '1.05rem',
                    boxShadow: '0 8px 30px rgba(124,92,255,0.4)',
                    '&:hover': { 
                      background: 'linear-gradient(135deg, #8b6fff 0%, #3db0ff 100%)',
                      boxShadow: '0 10px 40px rgba(124,92,255,0.5)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s'
                  }}
                >
                  {L.ctaBandExplore}
                </Button>
                <Button 
                  size="large"
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  component={Link} 
                  href={to('/publish/wizard')}
                  sx={{ 
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: '#fff',
                    fontWeight: 600,
                    px: 4,
                    py: 1.75,
                    borderRadius: '14px',
                    textTransform: 'none',
                    fontSize: '1.05rem',
                    '&:hover': { 
                      borderColor: '#7c5cff',
                      bgcolor: 'rgba(124,92,255,0.1)'
                    }
                  }}
                >
                  {L.ctaBandPublish}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ 
        borderTop: '1px solid rgba(255,255,255,0.08)', 
        py: 8, 
        bgcolor: 'rgba(0,0,0,0.3)' 
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                <Typography 
                  variant="h5" 
                  fontWeight={800}
                  sx={{ 
                    background: 'linear-gradient(135deg, #a78bfa 0%, #4fe1ff 100%)', 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent' 
                  }}
                >
                  WasiAI
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 280, lineHeight: 1.7 }}>
                  {L.footerTagline}
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
                  {[
                    { label: 'Avalanche', color: '#ff6b6b', bg: 'rgba(232,65,66,0.15)' },
                    { label: 'x402', color: '#4fe1ff', bg: 'rgba(79,225,255,0.12)' },
                  ].map((c) => (
                    <Chip 
                      key={c.label} 
                      size="small" 
                      label={c.label} 
                      sx={{ 
                        bgcolor: c.bg, 
                        color: c.color,
                        fontWeight: 600,
                        fontSize: '0.7rem'
                      }} 
                    />
                  ))}
                </Stack>
              </Stack>
            </Grid>
            {L.footerCols.map((col) => (
              <Grid key={col.h} item xs={6} md={2}>
                <Stack spacing={2}>
                  <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                    {col.h}
                  </Typography>
                  <Stack spacing={1.5}>
                    {col.items.map((it) => (
                      <Typography 
                        key={it} 
                        sx={{ 
                          color: 'rgba(255,255,255,0.5)', 
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'color 0.2s',
                          '&:hover': { color: '#a78bfa' }
                        }}
                      >
                        {it}
                      </Typography>
                    ))}
                  </Stack>
                </Stack>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ 
            borderTop: '1px solid rgba(255,255,255,0.08)', 
            pt: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
              {L.footerCopyright(new Date().getFullYear())}
            </Typography>
            <Stack direction="row" spacing={3}>
              {['Privacy', 'Terms', 'Cookies'].map((item) => (
                <Typography 
                  key={item}
                  sx={{ 
                    color: 'rgba(255,255,255,0.4)', 
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    '&:hover': { color: 'rgba(255,255,255,0.7)' }
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
