"use client";
import React, { useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { 
  Container, Box, Grid, Stack, Typography, Button, Card, CardContent, 
  Chip, IconButton, Tabs, Tab, Avatar, Divider, Paper
} from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import SecurityIcon from '@mui/icons-material/Security'
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import CampaignIcon from '@mui/icons-material/Campaign'
import CodeIcon from '@mui/icons-material/Code'
import ImageIcon from '@mui/icons-material/Image'
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'
import TranslateIcon from '@mui/icons-material/Translate'
import PsychologyIcon from '@mui/icons-material/Psychology'
import DataObjectIcon from '@mui/icons-material/DataObject'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import VerifiedIcon from '@mui/icons-material/Verified'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import GroupsIcon from '@mui/icons-material/Groups'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import SpeedIcon from '@mui/icons-material/Speed'
import BuildIcon from '@mui/icons-material/Build'

// Use case data structure
interface UseCase {
  id: string
  title: string
  titleEs: string
  description: string
  descriptionEs: string
  category: string
  industry: string
  industryEs: string
  impact: string
  impactEs: string
  metrics: { label: string; labelEs: string; value: string }[]
  technologies: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  gradient: string
  icon: React.ReactNode
}

// Categories with icons
const categories = [
  { id: 'all', label: 'All', labelEs: 'Todos', icon: <AutoAwesomeIcon /> },
  { id: 'nlp', label: 'Natural Language', labelEs: 'Lenguaje Natural', icon: <TranslateIcon /> },
  { id: 'vision', label: 'Computer Vision', labelEs: 'Visión por Computadora', icon: <ImageIcon /> },
  { id: 'audio', label: 'Audio & Speech', labelEs: 'Audio y Voz', icon: <RecordVoiceOverIcon /> },
  { id: 'predictive', label: 'Predictive Analytics', labelEs: 'Análisis Predictivo', icon: <AnalyticsIcon /> },
  { id: 'generative', label: 'Generative AI', labelEs: 'IA Generativa', icon: <PsychologyIcon /> },
  { id: 'agents', label: 'AI Agents', labelEs: 'Agentes IA', icon: <SmartToyIcon /> },
]

// Real-world use cases data
const useCases: UseCase[] = [
  // NLP Use Cases
  {
    id: 'sentiment-trading',
    title: 'Crypto Sentiment Trading Bot',
    titleEs: 'Bot de Trading por Sentimiento Crypto',
    description: 'Real-time analysis of social media, news, and on-chain data to predict market movements. The model processes thousands of tweets, Reddit posts, and news articles per minute to generate trading signals.',
    descriptionEs: 'Análisis en tiempo real de redes sociales, noticias y datos on-chain para predecir movimientos del mercado. El modelo procesa miles de tweets, posts de Reddit y artículos por minuto para generar señales de trading.',
    category: 'nlp',
    industry: 'DeFi & Trading',
    industryEs: 'DeFi y Trading',
    impact: 'Hedge funds using this model reported 23% better risk-adjusted returns compared to traditional technical analysis.',
    impactEs: 'Los fondos que usan este modelo reportaron 23% mejores retornos ajustados al riesgo comparado con análisis técnico tradicional.',
    metrics: [
      { label: 'Accuracy', labelEs: 'Precisión', value: '87%' },
      { label: 'Latency', labelEs: 'Latencia', value: '<100ms' },
      { label: 'Daily Signals', labelEs: 'Señales/día', value: '500+' },
    ],
    technologies: ['Transformer', 'BERT', 'Real-time Streaming'],
    difficulty: 'advanced',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
  },
  {
    id: 'smart-contract-audit',
    title: 'Smart Contract Security Auditor',
    titleEs: 'Auditor de Seguridad de Smart Contracts',
    description: 'AI-powered vulnerability detection for Solidity and Vyper contracts. Identifies reentrancy attacks, integer overflows, and logic flaws before deployment.',
    descriptionEs: 'Detección de vulnerabilidades impulsada por IA para contratos Solidity y Vyper. Identifica ataques de reentrancia, desbordamientos de enteros y fallas lógicas antes del despliegue.',
    category: 'nlp',
    industry: 'Blockchain Security',
    industryEs: 'Seguridad Blockchain',
    impact: 'Prevented $50M+ in potential exploits across 200+ audited protocols.',
    impactEs: 'Previno $50M+ en exploits potenciales en más de 200 protocolos auditados.',
    metrics: [
      { label: 'Vulnerabilities Found', labelEs: 'Vulnerabilidades', value: '2,400+' },
      { label: 'False Positive Rate', labelEs: 'Falsos Positivos', value: '<5%' },
      { label: 'Audit Time', labelEs: 'Tiempo Auditoría', value: '< 2min' },
    ],
    technologies: ['CodeBERT', 'Static Analysis', 'Symbolic Execution'],
    difficulty: 'intermediate',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: <SecurityIcon sx={{ fontSize: 32 }} />,
  },
  {
    id: 'customer-support-agent',
    title: 'Web3 Customer Support Agent',
    titleEs: 'Agente de Soporte Web3',
    description: 'Autonomous AI agent that handles wallet issues, transaction queries, and DeFi protocol support. Integrates with Discord, Telegram, and in-app chat.',
    descriptionEs: 'Agente IA autónomo que maneja problemas de wallet, consultas de transacciones y soporte de protocolos DeFi. Se integra con Discord, Telegram y chat in-app.',
    category: 'agents',
    industry: 'Customer Service',
    industryEs: 'Servicio al Cliente',
    impact: 'Reduced support ticket resolution time by 78% while maintaining 94% customer satisfaction.',
    impactEs: 'Redujo el tiempo de resolución de tickets en 78% manteniendo 94% de satisfacción del cliente.',
    metrics: [
      { label: 'Resolution Rate', labelEs: 'Tasa Resolución', value: '89%' },
      { label: 'Avg Response', labelEs: 'Respuesta Prom.', value: '< 3s' },
      { label: 'Languages', labelEs: 'Idiomas', value: '12' },
    ],
    technologies: ['GPT-4', 'RAG', 'Multi-agent'],
    difficulty: 'intermediate',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: <SmartToyIcon sx={{ fontSize: 32 }} />,
  },
  // Vision Use Cases
  {
    id: 'nft-authenticity',
    title: 'NFT Authenticity Verifier',
    titleEs: 'Verificador de Autenticidad NFT',
    description: 'Deep learning model that detects copied, AI-generated, or stolen artwork in NFT collections. Compares against a database of 10M+ verified artworks.',
    descriptionEs: 'Modelo de deep learning que detecta obras copiadas, generadas por IA o robadas en colecciones NFT. Compara contra una base de datos de 10M+ obras verificadas.',
    category: 'vision',
    industry: 'NFT & Digital Art',
    industryEs: 'NFT y Arte Digital',
    impact: 'Helped marketplaces remove 15,000+ fraudulent listings, protecting creators and collectors.',
    impactEs: 'Ayudó a marketplaces a remover 15,000+ listados fraudulentos, protegiendo creadores y coleccionistas.',
    metrics: [
      { label: 'Detection Rate', labelEs: 'Tasa Detección', value: '96%' },
      { label: 'Database Size', labelEs: 'Base de Datos', value: '10M+' },
      { label: 'Scan Time', labelEs: 'Tiempo Escaneo', value: '< 1s' },
    ],
    technologies: ['ResNet', 'Siamese Networks', 'Perceptual Hashing'],
    difficulty: 'advanced',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    icon: <VerifiedIcon sx={{ fontSize: 32 }} />,
  },
  {
    id: 'medical-imaging',
    title: 'Medical Imaging Diagnostics',
    titleEs: 'Diagnóstico por Imágenes Médicas',
    description: 'FDA-cleared AI for detecting anomalies in X-rays, MRIs, and CT scans. Assists radiologists with early detection of tumors, fractures, and cardiovascular issues.',
    descriptionEs: 'IA aprobada por FDA para detectar anomalías en rayos X, resonancias y tomografías. Asiste a radiólogos en detección temprana de tumores, fracturas y problemas cardiovasculares.',
    category: 'vision',
    industry: 'Healthcare',
    industryEs: 'Salud',
    impact: 'Improved early cancer detection rates by 31% in partner hospitals.',
    impactEs: 'Mejoró las tasas de detección temprana de cáncer en 31% en hospitales asociados.',
    metrics: [
      { label: 'Sensitivity', labelEs: 'Sensibilidad', value: '94.2%' },
      { label: 'Specificity', labelEs: 'Especificidad', value: '91.8%' },
      { label: 'Scans Analyzed', labelEs: 'Escaneos', value: '2M+' },
    ],
    technologies: ['U-Net', '3D CNN', 'DICOM Processing'],
    difficulty: 'advanced',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    icon: <HealthAndSafetyIcon sx={{ fontSize: 32 }} />,
  },
  // Audio Use Cases
  {
    id: 'voice-cloning',
    title: 'Personalized Voice Synthesis',
    titleEs: 'Síntesis de Voz Personalizada',
    description: 'Create natural-sounding voice clones from just 30 seconds of audio. Perfect for podcasts, audiobooks, and accessibility applications.',
    descriptionEs: 'Crea clones de voz naturales desde solo 30 segundos de audio. Perfecto para podcasts, audiolibros y aplicaciones de accesibilidad.',
    category: 'audio',
    industry: 'Media & Entertainment',
    industryEs: 'Medios y Entretenimiento',
    impact: 'Enabled content creators to produce 10x more audio content with consistent quality.',
    impactEs: 'Permitió a creadores de contenido producir 10x más contenido de audio con calidad consistente.',
    metrics: [
      { label: 'MOS Score', labelEs: 'Puntuación MOS', value: '4.3/5' },
      { label: 'Languages', labelEs: 'Idiomas', value: '29' },
      { label: 'Clone Time', labelEs: 'Tiempo Clonado', value: '30s' },
    ],
    technologies: ['VITS', 'HiFi-GAN', 'Speaker Embedding'],
    difficulty: 'intermediate',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    icon: <RecordVoiceOverIcon sx={{ fontSize: 32 }} />,
  },
  {
    id: 'meeting-transcription',
    title: 'Real-time Meeting Intelligence',
    titleEs: 'Inteligencia de Reuniones en Tiempo Real',
    description: 'Transcribe, summarize, and extract action items from video calls. Supports 50+ languages with speaker diarization and sentiment analysis.',
    descriptionEs: 'Transcribe, resume y extrae tareas de videollamadas. Soporta 50+ idiomas con diarización de hablantes y análisis de sentimiento.',
    category: 'audio',
    industry: 'Enterprise',
    industryEs: 'Empresarial',
    impact: 'Teams using this tool reported 40% fewer follow-up meetings and better task completion.',
    impactEs: 'Equipos usando esta herramienta reportaron 40% menos reuniones de seguimiento y mejor completación de tareas.',
    metrics: [
      { label: 'WER', labelEs: 'Tasa Error', value: '< 5%' },
      { label: 'Languages', labelEs: 'Idiomas', value: '50+' },
      { label: 'Latency', labelEs: 'Latencia', value: '< 500ms' },
    ],
    technologies: ['Whisper', 'Pyannote', 'LLM Summarization'],
    difficulty: 'beginner',
    gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    icon: <GroupsIcon sx={{ fontSize: 32 }} />,
  },
  // Predictive Analytics
  {
    id: 'defi-risk',
    title: 'DeFi Protocol Risk Scoring',
    titleEs: 'Scoring de Riesgo de Protocolos DeFi',
    description: 'ML model that analyzes smart contract code, TVL patterns, team history, and on-chain metrics to generate real-time risk scores for DeFi protocols.',
    descriptionEs: 'Modelo ML que analiza código de contratos, patrones de TVL, historial del equipo y métricas on-chain para generar scores de riesgo en tiempo real.',
    category: 'predictive',
    industry: 'DeFi & Risk Management',
    industryEs: 'DeFi y Gestión de Riesgo',
    impact: 'Institutional investors using this model avoided 3 major protocol collapses in 2023.',
    impactEs: 'Inversores institucionales usando este modelo evitaron 3 colapsos mayores de protocolos en 2023.',
    metrics: [
      { label: 'Protocols Tracked', labelEs: 'Protocolos', value: '500+' },
      { label: 'Prediction Accuracy', labelEs: 'Precisión', value: '82%' },
      { label: 'Update Frequency', labelEs: 'Actualización', value: '1min' },
    ],
    technologies: ['XGBoost', 'Graph Neural Networks', 'Time Series'],
    difficulty: 'advanced',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    icon: <AccountBalanceIcon sx={{ fontSize: 32 }} />,
  },
  {
    id: 'demand-forecasting',
    title: 'E-commerce Demand Forecasting',
    titleEs: 'Pronóstico de Demanda E-commerce',
    description: 'Predict product demand with 95% accuracy using historical sales, seasonality, promotions, and external factors like weather and events.',
    descriptionEs: 'Predice demanda de productos con 95% de precisión usando ventas históricas, estacionalidad, promociones y factores externos como clima y eventos.',
    category: 'predictive',
    industry: 'Retail & E-commerce',
    industryEs: 'Retail y E-commerce',
    impact: 'Reduced inventory costs by 28% and stockouts by 45% for enterprise clients.',
    impactEs: 'Redujo costos de inventario en 28% y faltantes en 45% para clientes empresariales.',
    metrics: [
      { label: 'MAPE', labelEs: 'Error Prom.', value: '< 5%' },
      { label: 'Forecast Horizon', labelEs: 'Horizonte', value: '90 days' },
      { label: 'SKUs Supported', labelEs: 'SKUs', value: '1M+' },
    ],
    technologies: ['Prophet', 'LSTM', 'Ensemble Methods'],
    difficulty: 'intermediate',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    icon: <ShoppingCartIcon sx={{ fontSize: 32 }} />,
  },
  // Generative AI
  {
    id: 'marketing-copy',
    title: 'AI Marketing Content Generator',
    titleEs: 'Generador de Contenido de Marketing IA',
    description: 'Generate high-converting ad copy, email campaigns, and social media content. Fine-tuned on millions of successful marketing campaigns.',
    descriptionEs: 'Genera copy de anuncios de alta conversión, campañas de email y contenido de redes sociales. Ajustado en millones de campañas exitosas.',
    category: 'generative',
    industry: 'Marketing & Advertising',
    industryEs: 'Marketing y Publicidad',
    impact: 'Clients saw 34% higher click-through rates and 2x faster content production.',
    impactEs: 'Clientes vieron 34% más clics y 2x más rápida producción de contenido.',
    metrics: [
      { label: 'CTR Improvement', labelEs: 'Mejora CTR', value: '+34%' },
      { label: 'Content/Hour', labelEs: 'Contenido/Hora', value: '50+' },
      { label: 'A/B Variants', labelEs: 'Variantes A/B', value: '10' },
    ],
    technologies: ['GPT-4', 'Fine-tuning', 'RLHF'],
    difficulty: 'beginner',
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    icon: <CampaignIcon sx={{ fontSize: 32 }} />,
  },
  {
    id: 'code-assistant',
    title: 'Blockchain Developer Copilot',
    titleEs: 'Copiloto para Desarrolladores Blockchain',
    description: 'AI coding assistant specialized in Solidity, Rust (Solana), and Move. Generates smart contracts, suggests optimizations, and explains complex DeFi patterns.',
    descriptionEs: 'Asistente de código IA especializado en Solidity, Rust (Solana) y Move. Genera smart contracts, sugiere optimizaciones y explica patrones DeFi complejos.',
    category: 'generative',
    industry: 'Developer Tools',
    industryEs: 'Herramientas de Desarrollo',
    impact: 'Developers reported 60% faster smart contract development and 40% fewer bugs.',
    impactEs: 'Desarrolladores reportaron 60% más rápido desarrollo de contratos y 40% menos bugs.',
    metrics: [
      { label: 'Code Accuracy', labelEs: 'Precisión Código', value: '92%' },
      { label: 'Languages', labelEs: 'Lenguajes', value: '8' },
      { label: 'Gas Savings', labelEs: 'Ahorro Gas', value: '15%' },
    ],
    technologies: ['CodeLlama', 'RAG', 'AST Analysis'],
    difficulty: 'intermediate',
    gradient: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
    icon: <CodeIcon sx={{ fontSize: 32 }} />,
  },
  // AI Agents
  {
    id: 'trading-agent',
    title: 'Autonomous DeFi Trading Agent',
    titleEs: 'Agente de Trading DeFi Autónomo',
    description: 'Self-managing agent that executes arbitrage, yield farming, and liquidity provision strategies across multiple chains. Includes risk management and portfolio rebalancing.',
    descriptionEs: 'Agente auto-gestionado que ejecuta estrategias de arbitraje, yield farming y provisión de liquidez en múltiples chains. Incluye gestión de riesgo y rebalanceo de portafolio.',
    category: 'agents',
    industry: 'DeFi & Trading',
    industryEs: 'DeFi y Trading',
    impact: 'Generated consistent 15-25% APY for users while minimizing impermanent loss.',
    impactEs: 'Generó consistentemente 15-25% APY para usuarios minimizando pérdida impermanente.',
    metrics: [
      { label: 'Avg APY', labelEs: 'APY Prom.', value: '18%' },
      { label: 'Chains', labelEs: 'Chains', value: '12' },
      { label: 'Uptime', labelEs: 'Disponibilidad', value: '99.9%' },
    ],
    technologies: ['Reinforcement Learning', 'Multi-agent', 'MEV Protection'],
    difficulty: 'advanced',
    gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
    icon: <AttachMoneyIcon sx={{ fontSize: 32 }} />,
  },
  {
    id: 'research-agent',
    title: 'Crypto Research Analyst Agent',
    titleEs: 'Agente Analista de Investigación Crypto',
    description: 'Autonomous agent that researches tokens, analyzes whitepapers, tracks team activity, and generates comprehensive investment reports.',
    descriptionEs: 'Agente autónomo que investiga tokens, analiza whitepapers, rastrea actividad del equipo y genera reportes de inversión completos.',
    category: 'agents',
    industry: 'Research & Analysis',
    industryEs: 'Investigación y Análisis',
    impact: 'Reduced research time from 8 hours to 15 minutes per project while improving coverage.',
    impactEs: 'Redujo tiempo de investigación de 8 horas a 15 minutos por proyecto mejorando cobertura.',
    metrics: [
      { label: 'Reports/Day', labelEs: 'Reportes/Día', value: '100+' },
      { label: 'Data Sources', labelEs: 'Fuentes', value: '50+' },
      { label: 'Accuracy', labelEs: 'Precisión', value: '91%' },
    ],
    technologies: ['LangChain', 'Web Scraping', 'Knowledge Graphs'],
    difficulty: 'intermediate',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: <DataObjectIcon sx={{ fontSize: 32 }} />,
  },
]

// Difficulty badge colors
const difficultyColors = {
  beginner: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', label: 'Beginner', labelEs: 'Principiante' },
  intermediate: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', label: 'Intermediate', labelEs: 'Intermedio' },
  advanced: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', label: 'Advanced', labelEs: 'Avanzado' },
}

export default function UseCasesPage() {
  const locale = useLocale()
  const isES = locale === 'es'
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const filteredUseCases = selectedCategory === 'all' 
    ? useCases 
    : useCases.filter(uc => uc.category === selectedCategory)

  const L = {
    title: isES ? 'Casos de Uso' : 'Use Cases',
    subtitle: isES 
      ? 'Descubre cómo empresas y desarrolladores están usando modelos de IA para resolver problemas reales' 
      : 'Discover how companies and developers are using AI models to solve real-world problems',
    heroTagline: isES ? 'Inspiración para Builders' : 'Inspiration for Builders',
    exploreModels: isES ? 'Explorar Modelos' : 'Explore Models',
    startBuilding: isES ? 'Comenzar a Construir' : 'Start Building',
    impact: isES ? 'Impacto' : 'Impact',
    technologies: isES ? 'Tecnologías' : 'Technologies',
    learnMore: isES ? 'Ver más' : 'Learn more',
    buildThis: isES ? 'Construir esto' : 'Build this',
    resultsCount: (count: number) => isES ? `${count} casos de uso` : `${count} use cases`,
    ctaTitle: isES ? '¿Listo para construir el próximo caso de éxito?' : 'Ready to build the next success story?',
    ctaSubtitle: isES 
      ? 'Publica tu modelo de IA en el marketplace y monetiza tu trabajo' 
      : 'Publish your AI model on the marketplace and monetize your work',
    publishModel: isES ? 'Publicar Modelo' : 'Publish Model',
    browseModels: isES ? 'Ver Modelos' : 'Browse Models',
  }

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
        pt: { xs: 10, md: 14 }, 
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
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Chip 
              icon={<RocketLaunchIcon sx={{ fontSize: 16 }} />}
              label={L.heroTagline}
              sx={{ 
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
              variant="h1" 
              sx={{ 
                fontSize: { xs: '2.5rem', md: '4rem' },
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
              variant="h5" 
              sx={{ 
                color: 'rgba(255,255,255,0.7)', 
                maxWidth: 700,
                fontWeight: 400,
                lineHeight: 1.6
              }}
            >
              {L.subtitle}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
              <Button
                component={Link}
                href={`/${locale}/models`}
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
                {L.exploreModels}
              </Button>
              <Button
                component={Link}
                href={`/${locale}/publish/wizard/step1`}
                variant="outlined"
                size="large"
                startIcon={<BuildIcon />}
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
                {L.startBuilding}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Category Tabs */}
      <Container maxWidth="lg">
        <Box sx={{ 
          mb: 4,
          overflowX: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none'
        }}>
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ 
              minWidth: 'max-content',
              pb: 1
            }}
          >
            {categories.map(cat => (
              <Chip
                key={cat.id}
                icon={cat.icon as React.ReactElement}
                label={isES ? cat.labelEs : cat.label}
                onClick={() => setSelectedCategory(cat.id)}
                sx={{
                  bgcolor: selectedCategory === cat.id 
                    ? 'rgba(124,92,255,0.25)' 
                    : 'rgba(255,255,255,0.05)',
                  color: selectedCategory === cat.id ? '#a78bfa' : 'rgba(255,255,255,0.7)',
                  border: '1px solid',
                  borderColor: selectedCategory === cat.id 
                    ? 'rgba(124,92,255,0.5)' 
                    : 'rgba(255,255,255,0.1)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  py: 2.5,
                  px: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '& .MuiChip-icon': { 
                    color: selectedCategory === cat.id ? '#a78bfa' : 'rgba(255,255,255,0.5)' 
                  },
                  '&:hover': {
                    bgcolor: 'rgba(124,92,255,0.15)',
                    borderColor: 'rgba(124,92,255,0.3)'
                  }
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Results count */}
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mb: 3 }}>
          {L.resultsCount(filteredUseCases.length)}
        </Typography>

        {/* Use Cases Grid */}
        <Grid container spacing={3} sx={{ pb: 8 }}>
          {filteredUseCases.map((useCase) => (
            <Grid item xs={12} md={6} key={useCase.id}>
              <Card
                onMouseEnter={() => setHoveredCard(useCase.id)}
                onMouseLeave={() => setHoveredCard(null)}
                sx={{
                  height: '100%',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: hoveredCard === useCase.id 
                    ? 'rgba(124,92,255,0.4)' 
                    : 'rgba(255,255,255,0.08)',
                  background: 'linear-gradient(180deg, rgba(22,26,36,0.8) 0%, rgba(12,15,24,0.9) 100%)',
                  backdropFilter: 'blur(10px)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  transform: hoveredCard === useCase.id ? 'translateY(-4px)' : 'none',
                  boxShadow: hoveredCard === useCase.id 
                    ? '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,92,255,0.2) inset'
                    : '0 4px 20px rgba(0,0,0,0.2)',
                }}
              >
                {/* Gradient header */}
                <Box sx={{ 
                  background: useCase.gradient,
                  p: 3,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Pattern overlay */}
                  <Box sx={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.1,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }} />
                  
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <Chip 
                          label={isES ? useCase.industryEs : useCase.industry}
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                        <Chip 
                          label={isES ? difficultyColors[useCase.difficulty].labelEs : difficultyColors[useCase.difficulty].label}
                          size="small"
                          sx={{ 
                            bgcolor: difficultyColors[useCase.difficulty].bg, 
                            color: difficultyColors[useCase.difficulty].color,
                            fontWeight: 600,
                            fontSize: '0.7rem'
                          }}
                        />
                      </Stack>
                      <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.3 }}>
                        {isES ? useCase.titleEs : useCase.title}
                      </Typography>
                    </Box>
                    <Avatar sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      width: 56, 
                      height: 56,
                      backdropFilter: 'blur(10px)'
                    }}>
                      {useCase.icon}
                    </Avatar>
                  </Stack>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      mb: 3,
                      lineHeight: 1.7,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {isES ? useCase.descriptionEs : useCase.description}
                  </Typography>

                  {/* Metrics */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {useCase.metrics.map((metric, idx) => (
                      <Grid item xs={4} key={idx}>
                        <Box sx={{ 
                          textAlign: 'center',
                          p: 1.5,
                          borderRadius: '12px',
                          bgcolor: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)'
                        }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: '#4fe1ff', 
                              fontWeight: 700,
                              fontSize: '1.1rem'
                            }}
                          >
                            {metric.value}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'rgba(255,255,255,0.5)',
                              fontSize: '0.7rem'
                            }}
                          >
                            {isES ? metric.labelEs : metric.label}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Impact */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      mb: 3,
                      borderRadius: '12px',
                      bgcolor: 'rgba(124,92,255,0.08)',
                      border: '1px solid rgba(124,92,255,0.2)'
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                      {L.impact}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5, fontSize: '0.85rem' }}>
                      {isES ? useCase.impactEs : useCase.impact}
                    </Typography>
                  </Paper>

                  {/* Technologies */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 600, mb: 1, display: 'block' }}>
                      {L.technologies}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {useCase.technologies.map((tech, idx) => (
                        <Chip 
                          key={idx}
                          label={tech}
                          size="small"
                          sx={{ 
                            bgcolor: 'rgba(255,255,255,0.06)', 
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '0.75rem',
                            height: 26
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  {/* Actions */}
                  <Stack direction="row" spacing={2}>
                    <Button
                      component={Link}
                      href={`/${locale}/models`}
                      fullWidth
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        background: 'linear-gradient(135deg, #7c5cff 0%, #2ea0ff 100%)',
                        color: '#fff',
                        fontWeight: 600,
                        borderRadius: '10px',
                        py: 1.2,
                        textTransform: 'none',
                        '&:hover': { 
                          background: 'linear-gradient(135deg, #8b6fff 0%, #3db0ff 100%)',
                        }
                      }}
                    >
                      {L.buildThis}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* CTA Section */}
        <Box sx={{ 
          py: 8, 
          mb: 8,
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(124,92,255,0.15) 0%, rgba(46,160,255,0.15) 100%)',
          border: '1px solid rgba(124,92,255,0.2)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
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
          <Box sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(46,160,255,0.2) 0%, transparent 70%)',
            filter: 'blur(30px)'
          }} />

          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
            <Stack spacing={3} alignItems="center">
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'rgba(124,92,255,0.2)',
                border: '2px solid rgba(124,92,255,0.3)'
              }}>
                <RocketLaunchIcon sx={{ fontSize: 40, color: '#a78bfa' }} />
              </Avatar>
              <Typography 
                variant="h3" 
                sx={{ 
                  color: '#fff', 
                  fontWeight: 800,
                  fontSize: { xs: '1.8rem', md: '2.5rem' }
                }}
              >
                {L.ctaTitle}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  fontWeight: 400,
                  maxWidth: 500
                }}
              >
                {L.ctaSubtitle}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <Button
                  component={Link}
                  href={`/${locale}/publish/wizard/step1`}
                  variant="contained"
                  size="large"
                  startIcon={<RocketLaunchIcon />}
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
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  {L.publishModel}
                </Button>
                <Button
                  component={Link}
                  href={`/${locale}/models`}
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
                  {L.browseModels}
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>
      </Container>
    </Box>
  )
}
