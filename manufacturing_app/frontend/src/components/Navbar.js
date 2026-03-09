// frontend/src/components/Layout/Sidebar.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  Collapse, Divider, Box, Typography, Avatar, Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ProductionQuantityLimits as ProductionIcon,
  RequestQuote as QuoteIcon,
  Analytics as AnalyticsIcon,
  Storefront as StoreIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  ExpandMore,
  ExpandLess,
  Assessment as AssessmentIcon,
  PriceCheck as PriceIcon,
  Build as BuildIcon,
  AccountBalance as BillingIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

const menuItems = [
  {
    category: 'WORKSPACE',
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'My Job Board', icon: <AssessmentIcon />, path: '/job-board' },
      { text: 'Production', icon: <ProductionIcon />, path: '/production' },
      { text: 'Auto-pricing', icon: <PriceIcon />, path: '/pricing-tools' },
      { text: 'Email To Quote', icon: <QuoteIcon />, path: '/email-quote', locked: true },
      { text: 'Job Feed', icon: <BuildIcon />, path: '/job-feed', locked: true },
    ]
  },
  {
    category: 'CUSTOMER & SALES',
    items: [
      { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
      { text: 'Quotes', icon: <QuoteIcon />, path: '/quotes' },
      { text: 'Orders', icon: <InventoryIcon />, path: '/orders' },
    ]
  },
  {
    category: 'PLUGINS',
    items: [
      { text: 'Integrations', icon: <BuildIcon />, path: '/integrations' },
      { text: 'Quoting Plugin', icon: <QuoteIcon />, path: '/quoting-plugin', pro: true },
      { text: 'Layout Editor', icon: <BuildIcon />, path: '/layout-editor' },
      { text: 'Client Portal', icon: <StoreIcon />, path: '/client-portal', pro: true },
      { text: 'Astra Plugin', icon: <BuildIcon />, path: '/astra-plugin', ai: true },
    ]
  },
  {
    category: 'BILLING',
    items: [
      { text: 'Billing', icon: <BillingIcon />, path: '/billing' },
      { text: 'Cad Tools', icon: <BuildIcon />, path: '/cad-tools', locked: true },
      { text: 'Add-ons', icon: <BuildIcon />, path: '/addons' },
    ]
  }
];

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (category) => {
    setOpenMenus(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#f8f9fa',
          borderRight: '1px solid #e0e0e0'
        },
      }}
    >
      {/* Logo & Branding */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" fontWeight="bold" color="primary">
          MAKER XCITE
        </Typography>
      </Box>

      {/* User Profile Summary */}
      {user && (
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {user.username?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight="medium" noWrap>
                {user.username}
              </Typography>
              <Chip 
                label="Free Plan" 
                size="small" 
                sx={{ fontSize: '0.65rem', height: 18 }}
                color={user.is_staff ? "primary" : "default"}
              />
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {menuItems.map((section) => (
          <Box key={section.category}>
            <Typography
              variant="caption"
              sx={{
                px: 2,
                py: 1,
                display: 'block',
                color: 'text.secondary',
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {section.category}
            </Typography>
            <List>
              {section.items.map((item) => (
                <ListItem
                  key={item.text}
                  component={Link}
                  to={item.path}
                  disabled={item.locked}
                  sx={{
                    px: 2,
                    py: 0.75,
                    mx: 1,
                    borderRadius: 1,
                    mb: 0.25,
                    cursor: item.locked ? 'not-allowed' : 'pointer',
                    bgcolor: isActive(item.path) ? 'primary.light' : 'transparent',
                    color: isActive(item.path) ? 'primary.contrastText' : 'text.primary',
                    opacity: item.locked ? 0.6 : 1,
                    '&:hover': {
                      bgcolor: item.locked ? 'transparent' : 'action.hover'
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 32, 
                    color: isActive(item.path) ? 'primary.contrastText' : 'inherit',
                    mr: 1.5
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isActive(item.path) ? 600 : 400 }}
                  />
                  {item.pro && (
                    <Chip label="Pro" size="small" sx={{ ml: 1, fontSize: '0.6rem', height: 20 }} color="warning" />
                  )}
                  {item.ai && (
                    <Chip label="AI" size="small" sx={{ ml: 1, fontSize: '0.6rem', height: 20 }} color="secondary" />
                  )}
                  {item.locked && (
                    <ListItemIcon sx={{ minWidth: 24, color: 'text.secondary' }}>
                      🔒
                    </ListItemIcon>
                  )}
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 0.5 }} />
          </Box>
        ))}
      </Box>

      {/* Upgrade CTA */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Box
          sx={{
            p: 2,
            bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            Upgrade to Pro
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            Unlock all features
          </Typography>
          <Box 
            component="button"
            sx={{
              mt: 1,
              width: '100%',
              py: 0.75,
              border: 'none',
              borderRadius: 1,
              bgcolor: 'white',
              color: 'primary.main',
              fontWeight: 'bold',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            Upgrade Now
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;