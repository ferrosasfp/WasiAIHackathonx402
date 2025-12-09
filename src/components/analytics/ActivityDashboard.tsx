'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  Stack,
} from '@mui/material'
import {
  TrendingUp as EarningsIcon,
  ShoppingCart as SpendingIcon,
  Storefront as SalesIcon,
  CardGiftcard as PurchasesIcon,
} from '@mui/icons-material'
import CreatorDashboard from './CreatorDashboard'
import UserSpendingDashboard from './UserSpendingDashboard'
import MyLicensesDashboard from './MyLicensesDashboard'
import LicenseSalesDashboard from './LicenseSalesDashboard'

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

interface ActivityDashboardProps {
  wallet: string
  locale?: string
  chainId?: number
  licenses?: License[]
  licensesLoading?: boolean
  onOpenArtifacts?: (license: License) => void
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      sx={{ pt: 3 }}
    >
      {value === index && children}
    </Box>
  )
}

export default function ActivityDashboard({ 
  wallet, 
  locale = 'en',
  chainId,
  licenses = [],
  licensesLoading = false,
  onOpenArtifacts,
}: ActivityDashboardProps) {
  const [activeTab, setActiveTab] = useState(0)
  const isES = locale === 'es'

  const tabs = [
    {
      id: 'earnings',
      label: isES ? 'Mis Ganancias' : 'My Earnings',
      shortLabel: isES ? 'Ganancias' : 'Earnings',
      icon: <EarningsIcon />,
      description: isES 
        ? 'Ingresos por inferencias de tus modelos publicados' 
        : 'Revenue from inferences on your published models',
      color: '#4fe1ff',
      bgColor: 'rgba(79, 225, 255, 0.1)',
    },
    {
      id: 'spending',
      label: isES ? 'Mi Uso' : 'My Usage',
      shortLabel: isES ? 'Uso' : 'Usage',
      icon: <SpendingIcon />,
      description: isES 
        ? 'Modelos que has usado y pagado por inferencia' 
        : 'Models you have used and paid for inference',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    {
      id: 'sales',
      label: isES ? 'Ventas de Licencias' : 'License Sales',
      shortLabel: isES ? 'Ventas' : 'Sales',
      icon: <SalesIcon />,
      description: isES 
        ? 'Licencias NFT que has vendido de tus modelos' 
        : 'License NFTs you have sold from your models',
      color: '#22c55e',
      bgColor: 'rgba(34, 197, 94, 0.1)',
    },
    {
      id: 'purchases',
      label: isES ? 'Mis Licencias' : 'My Licenses',
      shortLabel: isES ? 'Licencias' : 'Licenses',
      icon: <PurchasesIcon />,
      description: isES 
        ? 'Licencias NFT que has comprado' 
        : 'License NFTs you have purchased',
      color: '#a78bfa',
      bgColor: 'rgba(167, 139, 250, 0.1)',
    },
  ]

  return (
    <Box>
      {/* Tab Navigation */}
      <Box sx={{ 
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'linear-gradient(180deg, rgba(22,26,36,0.6), rgba(12,15,24,0.8))',
        backdropFilter: 'blur(10px)',
        mb: 3,
        overflow: 'hidden',
      }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 64,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              background: tabs[activeTab].color,
            },
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              transition: 'all 0.2s',
              '&:hover': {
                color: 'rgba(255,255,255,0.8)',
                bgcolor: 'rgba(255,255,255,0.03)',
              },
              '&.Mui-selected': {
                color: '#fff',
              },
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={tab.id}
              icon={
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: activeTab === index ? tab.color : 'inherit',
                }}>
                  {tab.icon}
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {tab.shortLabel}
                  </Box>
                </Box>
              }
              iconPosition="start"
              sx={{ px: { xs: 2, sm: 3 } }}
            />
          ))}
        </Tabs>
        
        {/* Tab Description */}
        <Box sx={{ 
          px: 3, 
          py: 1.5, 
          borderTop: '1px solid rgba(255,255,255,0.05)',
          bgcolor: tabs[activeTab].bgColor,
        }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ color: tabs[activeTab].color }}>
              {tabs[activeTab].icon}
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {tabs[activeTab].description}
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        <CreatorDashboard wallet={wallet} locale={locale} />
      </TabPanel>
      
      <TabPanel value={activeTab} index={1}>
        <UserSpendingDashboard wallet={wallet} locale={locale} />
      </TabPanel>
      
      <TabPanel value={activeTab} index={2}>
        <LicenseSalesDashboard 
          wallet={wallet}
          locale={locale}
          chainId={chainId}
        />
      </TabPanel>
      
      <TabPanel value={activeTab} index={3}>
        <MyLicensesDashboard 
          licenses={licenses}
          loading={licensesLoading}
          locale={locale}
          onOpenArtifacts={onOpenArtifacts}
        />
      </TabPanel>
    </Box>
  )
}

// Coming Soon placeholder component
function ComingSoonPanel({ 
  title, 
  description, 
  icon, 
  color,
  showBelow = false 
}: { 
  title: string
  description: string
  icon: React.ReactNode
  color: string
  showBelow?: boolean
}) {
  return (
    <Box sx={{
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'linear-gradient(180deg, rgba(22,26,36,0.6), rgba(12,15,24,0.8))',
      backdropFilter: 'blur(10px)',
      p: 6,
      textAlign: 'center',
    }}>
      <Box sx={{ color, opacity: 0.5, mb: 2 }}>
        {icon}
      </Box>
      <Typography variant="h6" fontWeight={700} color="#fff" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', maxWidth: 400, mx: 'auto' }}>
        {description}
      </Typography>
      {showBelow && (
        <Chip 
          label="👇 Ver abajo"
          sx={{ 
            mt: 2,
            bgcolor: `${color}20`,
            color,
            fontWeight: 600,
          }}
        />
      )}
    </Box>
  )
}
