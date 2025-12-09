"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Container, Box, Grid, Stack, Typography, Button, Card, CardContent, TextField, Chip, IconButton, Drawer, Divider, Skeleton, Tooltip, CircularProgress, Slider, Checkbox, FormControlLabel, FormGroup, Collapse, Badge, InputAdornment } from '@mui/material'
import TuneIcon from '@mui/icons-material/Tune'
import RefreshIcon from '@mui/icons-material/Refresh'
import VerifiedIcon from '@mui/icons-material/Verified'
import UploadIcon from '@mui/icons-material/CloudUpload'
import RocketIcon from '@mui/icons-material/RocketLaunch'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ApiIcon from '@mui/icons-material/Api'
import DownloadIcon from '@mui/icons-material/Download'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import CategoryIcon from '@mui/icons-material/Category'
import MemoryIcon from '@mui/icons-material/Memory'
import BusinessIcon from '@mui/icons-material/Business'
import SearchIcon from '@mui/icons-material/Search'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import { ModelCard } from '@/components/ModelCard'
import { useChainId as useEvmChainId, useConfig as useWagmiConfig, useAccount as useEvmAccount } from 'wagmi'
import { ipfsToApiRoute } from '@/config'
import { DEFAULT_CHAIN_ID } from '@/config/chains'

type ApiModel = {
  objectId: string
  modelId?: number
  name?: string
  description?: string
  listed?: boolean
  uri?: string
  imageUrl?: string
  owner?: string
  version?: string
  price_perpetual?: number
  price_subscription?: number
  author?: string
  valueProposition?: string
  categories?: string[]
  tasks?: string[]
  tags?: string[]
  architectures?: string[]
  frameworks?: string[]
  precision?: string[]
  industries?: string[]
  useCases?: string[]
  rights?: { api?: boolean; download?: boolean; transferable?: boolean }
  demoPreset?: boolean
  artifacts?: boolean
  deliveryMode?: string
}

export default function ExploreModelsPage() {
  const locale = useLocale()
  const t = useTranslations('explore')
  const isES = String(locale||'').startsWith('es')
  const evmChainId = useEvmChainId()
  const wagmiConfig = useWagmiConfig()
  const { isConnected: evmConnected } = useEvmAccount()
  const evmSymbol = React.useMemo(()=>{
    if (typeof evmChainId !== 'number') return 'AVAX'
    try {
      const chains = (wagmiConfig as any)?.chains || []
      const ch = chains.find((c:any)=> c?.id === evmChainId)
      const sym = ch?.nativeCurrency?.symbol
      return typeof sym === 'string' && sym ? sym : 'AVAX'
    } catch {
      return 'AVAX'
    }
  }, [evmChainId, wagmiConfig])
  const L = {
    title: t('title'),
    subtitle: t('subtitle'),
    exploreAll: t('exploreAll'),
    publish: t('publish'),
    recommended: t('recommended'),
    popular: t('popular'),
    new: t('new'),
    byCategory: t('byCategory'),
    searchPh: t('searchPlaceholder'),
    filters: t('filters'),
  }

  const [q, setQ] = useState('')
  const [openFilters, setOpenFilters] = useState(false)
  const [cats, setCats] = useState<string[]>([]) // placeholder for future taxonomy
  const [tasks, setTasks] = useState<string[]>([])
  const [items, setItems] = useState<ApiModel[]>([])
  const [loading, setLoading] = useState(true) // Start as true for immediate skeleton
  const [loadingMore, setLoadingMore] = useState(false)
  const [start, setStart] = useState(0)
  const [limit] = useState(6)
  const [hasMore, setHasMore] = useState(true)
  const [initialFailed, setInitialFailed] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [initialTimeoutMs, setInitialTimeoutMs] = useState(8000)
  const initialRetryRef = useRef(0)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [debugOn, setDebugOn] = useState(false)
  const [metaAgg, setMetaAgg] = useState<Record<string, any>>({})
  const onCardMeta = React.useCallback((id: string, meta: any) => {
    setMetaAgg(prev => ({ ...prev, [id]: meta }))
  }, [])
  // REMOVED: Progressive reveal timer - causes visual flickering
  // Now we show all cards at once for a cleaner UX

  // Advanced filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([])
  const [selectedArchitectures, setSelectedArchitectures] = useState<string[]>([])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [rightsFilter, setRightsFilter] = useState<{ api: boolean; download: boolean; transferable: boolean }>({ api: false, download: false, transferable: false })
  const [deliveryFilter, setDeliveryFilter] = useState<string[]>([])
  const [filterSearch, setFilterSearch] = useState('')
  
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    price: true,
    categories: true,
    rights: true,
    delivery: false,
    frameworks: false,
    architectures: false,
    industries: false
  })

  // Extract unique values from items for filter options
  const filterOptions = useMemo(() => {
    const categories = new Set<string>()
    const frameworks = new Set<string>()
    const architectures = new Set<string>()
    const industries = new Set<string>()
    let maxPrice = 0

    items.forEach(item => {
      item.categories?.forEach(c => categories.add(c))
      item.frameworks?.forEach(f => frameworks.add(f))
      item.architectures?.forEach(a => architectures.add(a))
      item.industries?.forEach(i => industries.add(i))
      const price = item.price_perpetual ? Number(item.price_perpetual) / 1e6 : 0
      if (price > maxPrice) maxPrice = price
    })

    return {
      categories: Array.from(categories).sort(),
      frameworks: Array.from(frameworks).sort(),
      architectures: Array.from(architectures).sort(),
      industries: Array.from(industries).sort(),
      maxPrice: Math.max(maxPrice, 100) // Minimum 100 USDC for slider
    }
  }, [items])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (priceRange[0] > 0 || priceRange[1] < filterOptions.maxPrice) count++
    if (selectedCategories.length > 0) count++
    if (selectedFrameworks.length > 0) count++
    if (selectedArchitectures.length > 0) count++
    if (selectedIndustries.length > 0) count++
    if (rightsFilter.api || rightsFilter.download || rightsFilter.transferable) count++
    if (deliveryFilter.length > 0) count++
    return count
  }, [priceRange, selectedCategories, selectedFrameworks, selectedArchitectures, selectedIndustries, rightsFilter, deliveryFilter, filterOptions.maxPrice])

  // Clear all filters
  const clearAllFilters = () => {
    setPriceRange([0, filterOptions.maxPrice])
    setSelectedCategories([])
    setSelectedFrameworks([])
    setSelectedArchitectures([])
    setSelectedIndustries([])
    setRightsFilter({ api: false, download: false, transferable: false })
    setDeliveryFilter([])
    setFilterSearch('')
  }

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Update price range when maxPrice changes (items loaded)
  useEffect(() => {
    if (filterOptions.maxPrice > 0 && priceRange[1] === 1000) {
      setPriceRange([0, filterOptions.maxPrice])
    }
  }, [filterOptions.maxPrice])

  useEffect(() => {
    let alive = true
    const fetchWithTimeout = async (input: RequestInfo | URL, init: RequestInit = {}, ms = 8000): Promise<Response> => {
      const ac = new AbortController()
      const id = setTimeout(()=> ac.abort(), ms)
      try {
        return await fetch(input, { ...init, signal: ac.signal })
      } finally {
        clearTimeout(id)
      }
    }
    const load = async (nextStart: number) => {
      const isFirst = nextStart === 0
      isFirst ? setLoading(true) : setLoadingMore(true)
      try {
        // NEW: Use indexed API (FAST!) - already has metadata cached
        const page = Math.floor(nextStart / limit) + 1
        const params = new URLSearchParams({ page: String(page), limit: String(limit) })
        if (typeof evmChainId === 'number') params.set('chainId', String(evmChainId))
        const r = await fetchWithTimeout(`/api/indexed/models?${params.toString()}`, { cache: 'no-store' }, isFirst ? initialTimeoutMs : 8000)
        const j = await r.json().catch(()=>({}))
        // API indexada devuelve {models: [], total, page, pages}
        const arr = Array.isArray(j?.models) ? j.models as any[] : []
        // hydrate images using centralized IPFS config
        const hydrated = arr.map(model => ({
          ...model,
          imageUrl: ipfsToApiRoute(model.imageUrl || '')
        }))
        // Transform indexed API response (already has metadata cached!)
        const withImages: ApiModel[] = hydrated.map((m: any) => {
          const meta = m.metadata || {}
          const customer = meta?.customer || {}
          const author = meta?.author || {}
          return {
            objectId: String(m?.model_id || ''),
            modelId: Number(m?.model_id),
            // agentId from AgentRegistryV2 (ERC-8004 identity)
            // Priority: DB agent_id > model_id fallback
            agentId: m?.agent_id ? Number(m.agent_id) : Number(m?.model_id),
            name: m?.name || meta?.name,
            // Priority: tagline > shortSummary > summary > description
            description: meta?.tagline || meta?.shortSummary || meta?.summary || meta?.description || '',
            listed: Boolean(m?.listed),
            uri: m?.uri,
            owner: m?.owner,
            // Author from metadata
            author: author?.displayName || author?.name || m?.creator || '',
            // Value proposition from customer sheet
            valueProposition: customer?.valueProp || customer?.valueProposition || '',
            version: (() => {
              // Convert DB integer version to string format "v1.0.0"
              const dbVersion = Number(m?.version)
              if (dbVersion > 0) return `v${dbVersion}.0.0`
              // Fallback to metadata string version if present
              if (typeof meta?.version === 'string') return meta.version
              return undefined
            })(),
            price_perpetual: Number(m?.price_perpetual || 0),
            price_subscription: Number(m?.price_subscription || 0),
            // Price per inference from MarketplaceV2 (USDC base units, 6 decimals)
            // Priority: DB price_inference > metadata > default for API-enabled models
            pricePerInference: (() => {
              // Check DB price_inference first (from MarketplaceV2 smart contract)
              const dbPriceInference = m?.price_inference ? BigInt(m.price_inference) : 0n
              if (dbPriceInference > 0n) {
                // Convert from USDC base units (6 decimals) to display format
                return (Number(dbPriceInference) / 1e6).toString()
              }
              // Fallback to metadata
              const metaPrice = meta?.licensePolicy?.pricing?.inference?.pricePerCall 
                || meta?.licensePolicy?.inference?.pricePerCall
                || meta?.pricePerInference
              if (metaPrice) return String(metaPrice)
              return undefined
            })(),
            // Agent endpoint from AgentRegistryV2
            inferenceEndpoint: m?.agent_endpoint || m?.inference_endpoint || undefined,
            // Agent wallet for x402 payments
            inferenceWallet: m?.agent_wallet || m?.inference_wallet || undefined,
            imageUrl: m?.image_url,
            // Extract from cached metadata (prioritize DB columns over nested metadata)
            categories: m?.categories || meta?.categories || meta?.technicalCategories || [],
            tasks: meta?.capabilities?.tasks || [],
            tags: m?.tags || meta?.tags || meta?.technicalTags || [],
            architectures: m?.architectures || meta?.architecture?.architectures || [],
            frameworks: m?.frameworks || meta?.architecture?.frameworks || [],
            precision: meta?.architecture?.precisions || [],
            // Industries and use cases from customer sheet
            industries: customer?.industries || [],
            useCases: customer?.useCases || [],
            // PRIORITY: Use Neon DB fields (delivery_rights_default, delivery_mode_hint) over IPFS metadata
            // This ensures Quick Edit changes are immediately reflected in listings
            rights: (() => {
              // delivery_rights_default: 1=API, 2=Download, 3=Both
              const rightsBitmask = typeof m?.delivery_rights_default === 'number' ? m.delivery_rights_default : null
              if (rightsBitmask !== null) {
                return {
                  api: (rightsBitmask & 1) !== 0,
                  download: (rightsBitmask & 2) !== 0,
                  transferable: Boolean(meta?.licensePolicy?.transferable || meta?.licensePolicy?.rights?.transferable)
                }
              }
              // Fallback to metadata if DB field missing
              if (meta?.licensePolicy?.rights) {
                return {
                  api: Array.isArray(meta.licensePolicy.rights) ? meta.licensePolicy.rights.includes('API') : Boolean(meta.licensePolicy.rights.api),
                  download: Array.isArray(meta.licensePolicy.rights) ? meta.licensePolicy.rights.includes('Download') : Boolean(meta.licensePolicy.rights.download),
                  transferable: Boolean(meta.licensePolicy.transferable || meta.licensePolicy.rights.transferable)
                }
              }
              return undefined
            })(),
            deliveryMode: (() => {
              // delivery_mode_hint: 1=API, 2=Download, 3=Both
              const modeHint = typeof m?.delivery_mode_hint === 'number' ? m.delivery_mode_hint : null
              if (modeHint !== null) {
                return modeHint === 1 ? 'api' : modeHint === 2 ? 'download' : 'both'
              }
              // Fallback to metadata if DB field missing
              if (Array.isArray(meta?.licensePolicy?.delivery)) {
                return (meta.licensePolicy.delivery.includes('API') && meta.licensePolicy.delivery.includes('Download') ? 'both' : 
                        meta.licensePolicy.delivery.includes('API') ? 'api' : 
                        meta.licensePolicy.delivery.includes('Download') ? 'download' : undefined)
              }
              if (typeof meta?.licensePolicy?.deliveryMode === 'string') {
                return meta.licensePolicy.deliveryMode.toLowerCase()
              }
              return undefined
            })(),
            __preMeta: meta
          } as ApiModel
        }).filter(Boolean)
        if (alive) {
          // Pintar primero
          if (isFirst) {
            if (withImages.length > 0) {
              setItems(withImages)
              setHasMore(withImages.length === limit)
              setStart(withImages.length)
              setInitialFailed(false)
              // REMOVED: Auto-prefetch of page 2 - causes extra re-render
              // Let IntersectionObserver handle pagination when user scrolls
            } else {
              // Si la primera respuesta viene vacía, no pisar posibles items del cache
              setHasMore(false)
              setInitialFailed(true)
            }
          } else {
            setItems(prev => [...prev, ...withImages])
            setHasMore(withImages.length === limit)
            setStart(nextStart + withImages.length)
          }
        }
        // Cachear primera página solo si hay resultados
        if (alive && isFirst && withImages.length > 0) {
          try { sessionStorage.setItem('models_first_page_cache', JSON.stringify(withImages)) } catch {}
        }
        // No need to enrich metadata anymore - already cached in DB! ✅
      } catch {
        if (alive && nextStart === 0) {
          setItems([])
          setHasMore(false)
          setInitialFailed(true)
        }
      } finally {
        if (alive) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    }
    // reset on chain change
    setItems([])
    setStart(0)
    setHasMore(true)
    // REMOVED: Session storage cache hydration - causes flash of stale data
    // Just load fresh data from the indexed API (fast enough with Neon)
    load(0)
    return () => { alive = false }
  }, [evmChainId, limit, refreshKey, initialTimeoutMs])

  // Auto-reintento con backoff si la carga inicial falla y no hay items
  useEffect(()=>{
    if (!initialFailed || items.length > 0) return
    if (initialRetryRef.current >= 3) return
    const attempt = initialRetryRef.current + 1
    const t = setTimeout(()=>{
      initialRetryRef.current = attempt
      setInitialTimeoutMs(ms=> Math.min(15000, ms + 4000))
      setHasMore(true)
      setRefreshKey(k=>k+1)
    }, 800 * attempt)
    return ()=> clearTimeout(t)
  }, [initialFailed, items.length])

  // Resetear contador de reintentos cuando llegan items
  useEffect(()=>{ if (items.length > 0) initialRetryRef.current = 0 }, [items.length])

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loading || loadingMore || items.length === 0) return
    const el = sentinelRef.current
    if (!el) return
    let alive = true
    const io = new IntersectionObserver((entries)=>{
      const first = entries[0]
      if (first?.isIntersecting && alive && !loadingMore) {
        // load next page
        // delay a tick to avoid thrashing
        setTimeout(()=>{
          if (alive) {
            // trigger loadMore by refetching effect body
            (async ()=>{
              // reuse loader but do not reset - use indexed API
              const page = Math.floor(start / limit) + 1
              const params = new URLSearchParams({ page: String(page), limit: String(limit) })
              if (typeof evmChainId === 'number') params.set('chainId', String(evmChainId))
              setLoadingMore(true)
              try {
                const ac = new AbortController()
                const t = setTimeout(()=> ac.abort(), 10000)
                let r: Response
                try {
                  r = await fetch(`/api/indexed/models?${params.toString()}`, { cache: 'no-store', signal: ac.signal })
                } catch (e: any) {
                  if (e && (e.name === 'AbortError' || e.code === 'ABORT_ERR')) {
                    clearTimeout(t)
                    return
                  }
                  clearTimeout(t)
                  throw e
                }
                clearTimeout(t)
                const j = await r.json().catch(()=>({}))
                // Transform indexed API response (already has metadata cached!)
                const arr = Array.isArray(j?.models) ? j.models as any[] : []
                const withImages: ApiModel[] = arr.map((m: any) => {
                  const meta = m.metadata || {}
                  const customer = meta?.customer || {}
                  const authorMeta = meta?.author || {}
                  return {
                    objectId: String(m?.model_id || ''),
                    modelId: Number(m?.model_id),
                    name: m?.name || meta?.name,
                    description: meta?.tagline || meta?.shortSummary || meta?.summary || meta?.description || '',
                    listed: Boolean(m?.listed),
                    uri: m?.uri,
                    owner: m?.owner,
                    author: authorMeta?.displayName || authorMeta?.name || m?.creator || '',
                    valueProposition: customer?.valueProp || customer?.valueProposition || '',
                    version: (() => {
                      const dbVersion = Number(m?.version)
                      if (dbVersion > 0) return `v${dbVersion}.0.0`
                      if (typeof meta?.version === 'string') return meta.version
                      return undefined
                    })(),
                    price_perpetual: Number(m?.price_perpetual || 0),
                    price_subscription: Number(m?.price_subscription || 0),
                    imageUrl: m?.image_url,
                    categories: m?.categories || meta?.categories || meta?.technicalCategories || [],
                    tasks: meta?.capabilities?.tasks || [],
                    tags: m?.tags || meta?.tags || meta?.technicalTags || [],
                    architectures: m?.architectures || meta?.architecture?.architectures || [],
                    frameworks: m?.frameworks || meta?.architecture?.frameworks || [],
                    precision: meta?.architecture?.precisions || [],
                    industries: customer?.industries || [],
                    useCases: customer?.useCases || [],
                    rights: (() => {
                      const rightsBitmask = typeof m?.delivery_rights_default === 'number' ? m.delivery_rights_default : null
                      if (rightsBitmask !== null) {
                        return {
                          api: (rightsBitmask & 1) !== 0,
                          download: (rightsBitmask & 2) !== 0,
                          transferable: Boolean(meta?.licensePolicy?.transferable || meta?.licensePolicy?.rights?.transferable)
                        }
                      }
                      if (meta?.licensePolicy?.rights) {
                        return {
                          api: typeof meta.licensePolicy.rights.api === 'boolean' ? meta.licensePolicy.rights.api : false,
                          download: typeof meta.licensePolicy.rights.download === 'boolean' ? meta.licensePolicy.rights.download : false,
                          transferable: Boolean(meta.licensePolicy.transferable || meta.licensePolicy.rights.transferable)
                        }
                      }
                      return undefined
                    })(),
                    deliveryMode: (() => {
                      const modeHint = typeof m?.delivery_mode_hint === 'number' ? m.delivery_mode_hint : null
                      if (modeHint !== null) {
                        return modeHint === 1 ? 'api' : modeHint === 2 ? 'download' : 'both'
                      }
                      if (typeof meta?.licensePolicy?.deliveryMode === 'string') {
                        return meta.licensePolicy.deliveryMode.toLowerCase()
                      }
                      return undefined
                    })(),
                    __preMeta: meta
                  } as ApiModel
                }).filter(Boolean)
                if (alive) {
                  setItems(prev => [...prev, ...withImages])
                  setHasMore(withImages.length === limit)
                  setStart(prev => prev + withImages.length)
                }
              } finally {
                if (alive) setLoadingMore(false)
              }
            })()
          }
        }, 50)
      }
    }, { rootMargin: '800px 0px' })
    io.observe(el)
    return () => { alive = false; io.disconnect() }
  }, [hasMore, loading, loadingMore, start, limit, evmChainId, items.length])

  const filtered = useMemo(()=>{
    return items.filter(m=>{
      // Text search
      const text = (String(m.name||'') + ' ' + String(m.description||'') + ' ' + String(m.owner||'') + ' ' + String(m.author||'')).toLowerCase()
      const okQ = q ? text.includes(q.toLowerCase()) : true
      
      // Price filter (convert from base units to USDC)
      const priceUsdc = m.price_perpetual ? Number(m.price_perpetual) / 1e6 : 0
      const okPrice = priceUsdc >= priceRange[0] && priceUsdc <= priceRange[1]
      
      // Categories filter
      const okCategories = selectedCategories.length === 0 || 
        (m.categories && m.categories.some(c => selectedCategories.includes(c)))
      
      // Frameworks filter
      const okFrameworks = selectedFrameworks.length === 0 || 
        (m.frameworks && m.frameworks.some(f => selectedFrameworks.includes(f)))
      
      // Architectures filter
      const okArchitectures = selectedArchitectures.length === 0 || 
        (m.architectures && m.architectures.some(a => selectedArchitectures.includes(a)))
      
      // Industries filter
      const okIndustries = selectedIndustries.length === 0 || 
        (m.industries && m.industries.some(i => selectedIndustries.includes(i)))
      
      // Rights filter
      const okRights = (
        (!rightsFilter.api || m.rights?.api) &&
        (!rightsFilter.download || m.rights?.download) &&
        (!rightsFilter.transferable || m.rights?.transferable)
      )
      
      // Delivery mode filter
      const okDelivery = deliveryFilter.length === 0 || 
        (m.deliveryMode && deliveryFilter.includes(m.deliveryMode))
      
      return okQ && okPrice && okCategories && okFrameworks && okArchitectures && okIndustries && okRights && okDelivery
    })
  }, [q, items, priceRange, selectedCategories, selectedFrameworks, selectedArchitectures, selectedIndustries, rightsFilter, deliveryFilter])
  // REMOVED: Progressive reveal timer - was causing visual flickering
  // Cards now render all at once when data is ready (using filtered directly)

  // Handle manual refresh - triggers full reindex from blockchain
  const handleRefresh = React.useCallback(async () => {
    if (refreshing) return
    
    setRefreshing(true)
    try {
      // Call the cron endpoint to reindex all models
      const res = await fetch(`/api/indexer?chainId=${evmChainId || DEFAULT_CHAIN_ID}`, {
        method: 'GET',
        cache: 'no-store'
      })
      
      if (res.ok) {
        // Reset and reload data
        setItems([])
        setStart(0)
        setHasMore(true)
        setRefreshKey(k => k + 1)
      }
    } catch (err) {
      console.error('[Catalog Refresh] Error:', err)
    } finally {
      setRefreshing(false)
    }
  }, [refreshing, evmChainId])

  // Reusable filter section component
  const FilterSection = ({ 
    id, 
    title, 
    icon, 
    children, 
    count 
  }: { 
    id: string; 
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode;
    count?: number;
  }) => (
    <Box sx={{ mb: 0.5 }}>
      <Box 
        onClick={() => toggleSection(id)}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          py: 1.5,
          px: 1,
          cursor: 'pointer',
          borderRadius: 1,
          transition: 'background 0.15s',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' }
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ color: 'rgba(255,255,255,0.5)', display: 'flex' }}>{icon}</Box>
          <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 600 }}>{title}</Typography>
          {count !== undefined && count > 0 && (
            <Chip 
              label={count} 
              size="small" 
              sx={{ 
                height: 18, 
                fontSize: '0.7rem', 
                bgcolor: 'rgba(124,92,255,0.3)', 
                color: '#a78bfa',
                '& .MuiChip-label': { px: 1 }
              }} 
            />
          )}
        </Stack>
        {expandedSections[id] ? (
          <ExpandLessIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }} />
        ) : (
          <ExpandMoreIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }} />
        )}
      </Box>
      <Collapse in={expandedSections[id]}>
        <Box sx={{ px: 1, pb: 2 }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  )

  // Checkbox item component
  const FilterCheckbox = ({ 
    label, 
    checked, 
    onChange,
    icon
  }: { 
    label: string; 
    checked: boolean; 
    onChange: () => void;
    icon?: React.ReactNode;
  }) => (
    <FormControlLabel
      control={
        <Checkbox 
          checked={checked} 
          onChange={onChange}
          size="small"
          sx={{ 
            color: 'rgba(255,255,255,0.3)',
            '&.Mui-checked': { color: '#7c5cff' },
            p: 0.5
          }}
        />
      }
      label={
        <Stack direction="row" spacing={0.75} alignItems="center">
          {icon && <Box sx={{ color: 'rgba(255,255,255,0.5)', display: 'flex', fontSize: 16 }}>{icon}</Box>}
          <Typography variant="body2" sx={{ color: '#ffffffcc', fontSize: '0.85rem' }}>{label}</Typography>
        </Stack>
      }
      sx={{ 
        m: 0, 
        py: 0.5,
        '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' },
        borderRadius: 0.5
      }}
    />
  )

  const Filters = (
    <Box sx={{ 
      width: { xs: '100vw', sm: 380 }, 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#0d1320',
      borderLeft: '1px solid rgba(255,255,255,0.08)'
    }} role="presentation">
      {/* Header */}
      <Box sx={{ 
        p: 2.5, 
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'linear-gradient(180deg, rgba(124,92,255,0.08) 0%, transparent 100%)'
      }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ 
              width: 36, 
              height: 36, 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #7c5cff 0%, #2ea0ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TuneIcon sx={{ color: '#fff', fontSize: 18 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
                {isES ? 'Filtros' : 'Filters'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                {filtered.length} {isES ? 'modelos' : 'models'}
              </Typography>
            </Box>
          </Stack>
          <IconButton 
            onClick={() => setOpenFilters(false)}
            sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>

        {/* Active filters badge + clear */}
        {activeFilterCount > 0 && (
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip 
                label={`${activeFilterCount} ${isES ? 'filtros activos' : 'active filters'}`}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(79,225,255,0.15)', 
                  color: '#4fe1ff',
                  fontWeight: 600,
                  '& .MuiChip-label': { px: 1.5 }
                }}
              />
            </Stack>
            <Button 
              size="small" 
              startIcon={<FilterAltOffIcon sx={{ fontSize: 16 }} />}
              onClick={clearAllFilters}
              sx={{ 
                color: 'rgba(255,255,255,0.6)', 
                textTransform: 'none',
                fontSize: '0.8rem',
                '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
              }}
            >
              {isES ? 'Limpiar' : 'Clear all'}
            </Button>
          </Stack>
        )}
      </Box>

      {/* Search within filters */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <TextField
          fullWidth
          size="small"
          placeholder={isES ? 'Buscar en filtros...' : 'Search filters...'}
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }} />
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiInputBase-root': { 
              bgcolor: 'rgba(255,255,255,0.04)', 
              color: '#fff',
              borderRadius: '10px',
              fontSize: '0.9rem'
            },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
            '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7c5cff' },
            '& input::placeholder': { color: 'rgba(255,255,255,0.4)', opacity: 1 }
          }}
        />
      </Box>

      {/* Scrollable filter sections */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
        {/* Price Range */}
        <FilterSection 
          id="price" 
          title={isES ? 'Rango de precio' : 'Price Range'} 
          icon={<AttachMoneyIcon sx={{ fontSize: 20 }} />}
          count={priceRange[0] > 0 || priceRange[1] < filterOptions.maxPrice ? 1 : 0}
        >
          <Box sx={{ px: 1, pt: 1 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                ${priceRange[0]} USDC
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                ${priceRange[1]} USDC
              </Typography>
            </Stack>
{filterOptions.maxPrice > 0 && (
              <Slider
                key={`price-slider-${filterOptions.maxPrice}`}
                value={[Math.min(priceRange[0], filterOptions.maxPrice), Math.min(priceRange[1], filterOptions.maxPrice)]}
                onChange={(_, newValue) => setPriceRange(newValue as [number, number])}
                min={0}
                max={filterOptions.maxPrice}
                step={1}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `$${v}`}
                sx={{
                  color: '#7c5cff',
                  '& .MuiSlider-thumb': { 
                    width: 16, 
                    height: 16,
                    '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 0 8px rgba(124,92,255,0.16)' }
                  },
                  '& .MuiSlider-track': { height: 4 },
                  '& .MuiSlider-rail': { height: 4, bgcolor: 'rgba(255,255,255,0.1)' },
                  '& .MuiSlider-valueLabel': { 
                    bgcolor: '#7c5cff',
                    borderRadius: '6px',
                    fontSize: '0.75rem'
                  }
                }}
              />
            )}
            {filterOptions.maxPrice === 0 && (
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                {isES ? 'Cargando precios...' : 'Loading prices...'}
              </Typography>
            )}
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              {[10, 50, 100, 500].map(preset => (
                <Chip
                  key={preset}
                  label={`≤$${preset}`}
                  size="small"
                  onClick={() => setPriceRange([0, preset])}
                  sx={{
                    bgcolor: priceRange[1] === preset ? 'rgba(124,92,255,0.3)' : 'rgba(255,255,255,0.06)',
                    color: priceRange[1] === preset ? '#a78bfa' : 'rgba(255,255,255,0.6)',
                    border: '1px solid',
                    borderColor: priceRange[1] === preset ? 'rgba(124,92,255,0.5)' : 'transparent',
                    fontSize: '0.7rem',
                    height: 24,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: 'rgba(124,92,255,0.2)' }
                  }}
                />
              ))}
            </Stack>
          </Box>
        </FilterSection>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 0.5 }} />

        {/* License Rights */}
        <FilterSection 
          id="rights" 
          title={isES ? 'Derechos de licencia' : 'License Rights'} 
          icon={<VerifiedIcon sx={{ fontSize: 20 }} />}
          count={(rightsFilter.api ? 1 : 0) + (rightsFilter.download ? 1 : 0) + (rightsFilter.transferable ? 1 : 0)}
        >
          <FormGroup>
            <FilterCheckbox 
              label={isES ? 'Acceso API' : 'API Access'}
              checked={rightsFilter.api}
              onChange={() => setRightsFilter(prev => ({ ...prev, api: !prev.api }))}
              icon={<ApiIcon sx={{ fontSize: 16 }} />}
            />
            <FilterCheckbox 
              label={isES ? 'Descarga de modelo' : 'Model Download'}
              checked={rightsFilter.download}
              onChange={() => setRightsFilter(prev => ({ ...prev, download: !prev.download }))}
              icon={<DownloadIcon sx={{ fontSize: 16 }} />}
            />
            <FilterCheckbox 
              label={isES ? 'Transferible' : 'Transferable'}
              checked={rightsFilter.transferable}
              onChange={() => setRightsFilter(prev => ({ ...prev, transferable: !prev.transferable }))}
              icon={<SwapHorizIcon sx={{ fontSize: 16 }} />}
            />
          </FormGroup>
        </FilterSection>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 0.5 }} />

        {/* Delivery Mode */}
        <FilterSection 
          id="delivery" 
          title={isES ? 'Modo de entrega' : 'Delivery Mode'} 
          icon={<DownloadIcon sx={{ fontSize: 20 }} />}
          count={deliveryFilter.length}
        >
          <FormGroup>
            {['api', 'download', 'both'].map(mode => (
              <FilterCheckbox 
                key={mode}
                label={mode === 'api' ? 'API' : mode === 'download' ? (isES ? 'Descarga' : 'Download') : (isES ? 'API + Descarga' : 'API + Download')}
                checked={deliveryFilter.includes(mode)}
                onChange={() => {
                  setDeliveryFilter(prev => 
                    prev.includes(mode) 
                      ? prev.filter(m => m !== mode)
                      : [...prev, mode]
                  )
                }}
              />
            ))}
          </FormGroup>
        </FilterSection>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 0.5 }} />

        {/* Categories */}
        {filterOptions.categories.length > 0 && (
          <>
            <FilterSection 
              id="categories" 
              title={isES ? 'Categorías' : 'Categories'} 
              icon={<CategoryIcon sx={{ fontSize: 20 }} />}
              count={selectedCategories.length}
            >
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                <FormGroup>
                  {filterOptions.categories
                    .filter(cat => !filterSearch || cat.toLowerCase().includes(filterSearch.toLowerCase()))
                    .map(cat => (
                      <FilterCheckbox 
                        key={cat}
                        label={cat}
                        checked={selectedCategories.includes(cat)}
                        onChange={() => {
                          setSelectedCategories(prev => 
                            prev.includes(cat) 
                              ? prev.filter(c => c !== cat)
                              : [...prev, cat]
                          )
                        }}
                      />
                    ))}
                </FormGroup>
              </Box>
            </FilterSection>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 0.5 }} />
          </>
        )}

        {/* Frameworks */}
        {filterOptions.frameworks.length > 0 && (
          <>
            <FilterSection 
              id="frameworks" 
              title="Frameworks" 
              icon={<MemoryIcon sx={{ fontSize: 20 }} />}
              count={selectedFrameworks.length}
            >
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                <FormGroup>
                  {filterOptions.frameworks
                    .filter(fw => !filterSearch || fw.toLowerCase().includes(filterSearch.toLowerCase()))
                    .map(fw => (
                      <FilterCheckbox 
                        key={fw}
                        label={fw}
                        checked={selectedFrameworks.includes(fw)}
                        onChange={() => {
                          setSelectedFrameworks(prev => 
                            prev.includes(fw) 
                              ? prev.filter(f => f !== fw)
                              : [...prev, fw]
                          )
                        }}
                      />
                    ))}
                </FormGroup>
              </Box>
            </FilterSection>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 0.5 }} />
          </>
        )}

        {/* Architectures */}
        {filterOptions.architectures.length > 0 && (
          <>
            <FilterSection 
              id="architectures" 
              title={isES ? 'Arquitecturas' : 'Architectures'} 
              icon={<MemoryIcon sx={{ fontSize: 20 }} />}
              count={selectedArchitectures.length}
            >
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                <FormGroup>
                  {filterOptions.architectures
                    .filter(arch => !filterSearch || arch.toLowerCase().includes(filterSearch.toLowerCase()))
                    .map(arch => (
                      <FilterCheckbox 
                        key={arch}
                        label={arch}
                        checked={selectedArchitectures.includes(arch)}
                        onChange={() => {
                          setSelectedArchitectures(prev => 
                            prev.includes(arch) 
                              ? prev.filter(a => a !== arch)
                              : [...prev, arch]
                          )
                        }}
                      />
                    ))}
                </FormGroup>
              </Box>
            </FilterSection>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 0.5 }} />
          </>
        )}

        {/* Industries */}
        {filterOptions.industries.length > 0 && (
          <FilterSection 
            id="industries" 
            title={isES ? 'Industrias' : 'Industries'} 
            icon={<BusinessIcon sx={{ fontSize: 20 }} />}
            count={selectedIndustries.length}
          >
            <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
              <FormGroup>
                {filterOptions.industries
                  .filter(ind => !filterSearch || ind.toLowerCase().includes(filterSearch.toLowerCase()))
                  .map(ind => (
                    <FilterCheckbox 
                      key={ind}
                      label={ind}
                      checked={selectedIndustries.includes(ind)}
                      onChange={() => {
                        setSelectedIndustries(prev => 
                          prev.includes(ind) 
                            ? prev.filter(i => i !== ind)
                            : [...prev, ind]
                        )
                      }}
                    />
                  ))}
              </FormGroup>
            </Box>
          </FilterSection>
        )}
      </Box>

      {/* Footer with apply button */}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.3)'
      }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => setOpenFilters(false)}
          sx={{
            background: 'linear-gradient(135deg, #7c5cff 0%, #2ea0ff 100%)',
            color: '#fff',
            fontWeight: 700,
            borderRadius: '12px',
            py: 1.5,
            textTransform: 'none',
            fontSize: '1rem',
            boxShadow: '0 4px 15px rgba(124,92,255,0.4)',
            '&:hover': { 
              background: 'linear-gradient(135deg, #8b6fff 0%, #3db0ff 100%)',
              boxShadow: '0 6px 20px rgba(124,92,255,0.5)'
            }
          }}
        >
          {isES ? `Ver ${filtered.length} modelos` : `Show ${filtered.length} models`}
        </Button>
      </Box>
    </Box>
  )

  return (
    <Box sx={{
      minHeight: '100vh',
      background: [
        'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,92,255,0.15), transparent)',
        'radial-gradient(ellipse 60% 50% at 100% 50%, rgba(46,160,255,0.1), transparent)',
        'radial-gradient(ellipse 60% 50% at 0% 80%, rgba(124,92,255,0.08), transparent)',
        'linear-gradient(180deg, #0b1422 0%, #0a111c 50%, #070b12 100%)'
      ].join(', '),
      color: 'oklch(0.985 0 0)'
    }}>
      {/* Hero Section */}
      <Box sx={{ 
        pt: { xs: 6, md: 10 }, 
        pb: { xs: 4, md: 6 },
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background elements */}
        <Box sx={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46,160,255,0.1) 0%, transparent 70%)',
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
          left: '5%',
          width: 250,
          height: 250,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,92,255,0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animation: 'pulse 10s ease-in-out infinite reverse',
        }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <Chip 
                  icon={<VerifiedIcon sx={{ fontSize: 16 }} />} 
                  label={isES ? 'Marketplace de modelos de IA' : 'AI Models Marketplace'} 
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
                  variant="h1" 
                  sx={{ 
                    fontSize: { xs: '2.2rem', md: '3rem' },
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #fff 0%, #a78bfa 50%, #4fe1ff 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em'
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
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
                  <Button 
                    startIcon={<UploadIcon />} 
                    component={Link} 
                    href={`/${locale}/publish/wizard`} 
                    variant="contained" 
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
                    {L.publish}
                  </Button>
                  <Button 
                    startIcon={<RocketIcon />} 
                    component={Link} 
                    href={`/${locale}/use-cases`} 
                    variant="outlined" 
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
                    {isES ? 'Ver casos de uso' : 'View use cases'}
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              {/* Search Card */}
              <Card sx={{ 
                borderRadius: '20px', 
                border: '1px solid rgba(255,255,255,0.1)', 
                background: 'linear-gradient(180deg, rgba(22,26,36,0.9) 0%, rgba(12,15,24,0.95) 100%)', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)', 
                backdropFilter: 'blur(20px)' 
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '10px', 
                        background: 'linear-gradient(135deg, #7c5cff 0%, #2ea0ff 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <SearchIcon sx={{ color: '#fff', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#fff', lineHeight: 1.2 }}>
                          {isES ? 'Buscar modelos' : 'Search models'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          {filtered.length} {isES ? 'modelos disponibles' : 'models available'}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <TextField 
                      fullWidth 
                      size="small" 
                      placeholder={L.searchPh} 
                      value={q} 
                      onChange={(e) => setQ(e.target.value)} 
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiInputBase-root': { 
                          bgcolor: 'rgba(255,255,255,0.06)', 
                          color: '#fff',
                          borderRadius: '12px',
                          py: 0.5
                        },
                        '& .MuiOutlinedInput-notchedOutline': { 
                          borderColor: 'rgba(255,255,255,0.1)',
                          borderRadius: '12px'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(124,92,255,0.5)' },
                        '& .Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7c5cff' },
                        '& input::placeholder': { color: 'rgba(255,255,255,0.4)', opacity: 1 }
                      }} 
                    />
                    
                    <Stack direction="row" spacing={1}>
                      <Tooltip title={isES ? 'Actualizar desde blockchain' : 'Refresh from blockchain'}>
                        <span style={{ flex: 1 }}>
                          <Button
                            fullWidth
                            onClick={handleRefresh} 
                            disabled={refreshing || loading}
                            startIcon={refreshing ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <RefreshIcon />}
                            sx={{ 
                              color: '#fff',
                              bgcolor: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '10px',
                              py: 1,
                              textTransform: 'none',
                              fontWeight: 600,
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                              '&:disabled': { color: 'rgba(255,255,255,0.3)' }
                            }}
                          >
                            {isES ? 'Actualizar' : 'Refresh'}
                          </Button>
                        </span>
                      </Tooltip>
                      <Badge 
                        badgeContent={activeFilterCount} 
                        color="primary"
                        sx={{
                          flex: 1,
                          '& .MuiBadge-badge': {
                            bgcolor: '#7c5cff',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            minWidth: 18,
                            height: 18,
                            top: 6,
                            right: 6
                          }
                        }}
                      >
                        <Button
                          fullWidth
                          onClick={() => setOpenFilters(true)} 
                          startIcon={<TuneIcon />}
                          sx={{ 
                            color: activeFilterCount > 0 ? '#a78bfa' : '#fff',
                            bgcolor: activeFilterCount > 0 ? 'rgba(124,92,255,0.15)' : 'rgba(255,255,255,0.06)',
                            border: '1px solid',
                            borderColor: activeFilterCount > 0 ? 'rgba(124,92,255,0.4)' : 'rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: 'rgba(124,92,255,0.2)',
                              borderColor: '#7c5cff'
                            }
                          }}
                        >
                          {isES ? 'Filtros' : 'Filters'}
                        </Button>
                      </Badge>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

        {/* Only category grid remains */}

              {/* Models Grid Section */}
      <Container maxWidth="lg" sx={{ pb: 10 }}>
        {/* Section Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
              {isES ? 'Todos los modelos' : 'All models'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              {isES 
                ? `${filtered.length} modelos encontrados` 
                : `${filtered.length} models found`}
            </Typography>
          </Stack>
          {activeFilterCount > 0 && (
            <Button
              onClick={clearAllFilters}
              startIcon={<FilterAltOffIcon />}
              sx={{
                color: '#a78bfa',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { bgcolor: 'rgba(124,92,255,0.1)' }
              }}
            >
              {isES ? 'Limpiar filtros' : 'Clear filters'}
            </Button>
          )}
        </Stack>

        <Grid container spacing={3}>
            {loading && items.length === 0 && Array.from({ length: 6 }).map((_, i) => (
              <Grid key={`sk-${i}`} item xs={12} sm={6} md={4}>
                <Card sx={{ 
                  borderRadius: '20px', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  background: 'linear-gradient(180deg, rgba(22,26,36,0.8) 0%, rgba(12,15,24,0.9) 100%)', 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  overflow: 'hidden'
                }}>
                  <Skeleton variant="rectangular" height={180} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={1.5}>
                      <Skeleton variant="text" width="70%" height={28} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
                      <Skeleton variant="text" width="100%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                      <Skeleton variant="text" width="85%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                      <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                        <Skeleton variant="rounded" width={70} height={26} sx={{ bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                        <Skeleton variant="rounded" width={80} height={26} sx={{ bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '8px' }} />
                      </Stack>
                      <Skeleton variant="text" width="50%" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {!loading && items.length === 0 && (
              <Grid item xs={12}>
                <Card sx={{ 
                  borderRadius: '24px', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  background: 'linear-gradient(180deg, rgba(22,26,36,0.9) 0%, rgba(12,15,24,0.95) 100%)', 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)' 
                }}>
                  <CardContent sx={{ p: 6 }}>
                    <Stack spacing={3} alignItems="center" justifyContent="center">
                      <Box sx={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: '20px', 
                        background: 'linear-gradient(135deg, rgba(124,92,255,0.2) 0%, rgba(46,160,255,0.2) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CircularProgress size={36} sx={{ color: '#7c5cff' }} />
                      </Box>
                      <Stack spacing={1} alignItems="center">
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>
                          {isES ? 'Cargando modelos...' : 'Loading models...'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: 400 }}>
                          {isES 
                            ? 'Esto puede tardar unos segundos si la red está lenta. Reintentaremos automáticamente.' 
                            : 'This may take a few seconds if the network is slow. We will retry automatically.'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )}
            {filtered.map((m:any, idx:number) => (
              <Grid key={m.modelId || m.objectId || idx} item xs={12} sm={6} md={4}>
                <ModelCard locale={locale} data={{
                  slug: '',
                  name: m.name || 'Model',
                  summary: m.description || '',
                  description: m.description,
                  cover: m.imageUrl,
                  uri: m.uri,
                  author: m.author,
                  valueProposition: m.valueProposition,
                  categories: m.categories,
                  tasks: m.tasks,
                  tags: m.tags,
                  architectures: m.architectures,
                  frameworks: m.frameworks,
                  precision: m.precision,
                  industries: m.industries,
                  useCases: m.useCases,
                  rights: m.rights,
                  demoPreset: m.demoPreset,
                  artifacts: m.artifacts,
                  deliveryMode: m.deliveryMode,
                  // price_perpetual is in USDC base units (6 decimals), not AVAX
                  pricePerpetual: m.price_perpetual ? `${(Number(m.price_perpetual)/1e6).toFixed(2)} USDC` : undefined,
                  // price_subscription is in USDC base units (6 decimals)
                  priceSubscription: m.price_subscription ? `${(Number(m.price_subscription)/1e6).toFixed(2)} USDC/${isES?'mes':'mo'}` : undefined,
                  pricePerInference: m.pricePerInference || m.price_per_inference || undefined,
                  version: m.version || undefined,
                  agentId: m.agentId || m.modelId,
                }} href={m.modelId ? `/${locale}/evm/models/${m.modelId}` : undefined} priority={idx < 3} onMeta={onCardMeta} preMeta={(m as any).__preMeta} />
              </Grid>
            ))}
          </Grid>
          
          <Box ref={sentinelRef} sx={{ height: 1 }} />
          
          {loadingMore && items.length > 0 && (
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mt: 4 }}>
              <CircularProgress size={24} sx={{ color: '#7c5cff' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                {isES ? 'Cargando más modelos...' : 'Loading more models...'}
              </Typography>
            </Stack>
          )}
          
          {!hasMore && items.length > 0 && (
            <Box sx={{ 
              mt: 6, 
              py: 4, 
              textAlign: 'center',
              borderTop: '1px solid rgba(255,255,255,0.08)'
            }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                {isES ? '✨ Has visto todos los modelos disponibles' : '✨ You\'ve seen all available models'}
              </Typography>
            </Box>
          )}
          
          {debugOn && (
            <Box sx={{ mt: 3 }}>
              <details open>
                <summary>meta agregados visibles</summary>
                <Box component="pre" sx={{ whiteSpace:'pre-wrap', fontSize: 12, bgcolor:'rgba(255,255,255,0.05)', color: '#fff', p: 2, borderRadius: 2, maxHeight: 400, overflow:'auto' }}>
                  {JSON.stringify(Object.entries(metaAgg).map(([id, meta])=> ({ id, meta })), null, 2)}
                </Box>
              </details>
            </Box>
          )}
      </Container>

      <Drawer anchor="right" open={openFilters} onClose={()=>setOpenFilters(false)}>
        {Filters}
      </Drawer>
    </Box>
  )
}
