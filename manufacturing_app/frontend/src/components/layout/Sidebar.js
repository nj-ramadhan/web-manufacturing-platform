// frontend/src/components/Layout/Sidebar.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  Divider, Box, Typography, IconButton, Tooltip,
  Collapse
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
  ChevronLeft,
  ChevronRight,
  Assessment as AssessmentIcon,
  PriceCheck as PriceIcon,
  Build as BuildIcon,
  AccountBalance as BillingIcon,
  ExpandMore,
  ExpandLess,
  MenuBook
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 260;
const collapsedWidth = 60;

const menuItems = [
  {
    category: 'WORKSPACE',
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'My Job Board', icon: <AssessmentIcon />, path: '/job-board' },
      { text: 'Production', icon: <ProductionIcon />, path: '/production' },
      { text: 'Auto-pricing', icon: <PriceIcon />, path: '/pricing-tools' },
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
    category: 'TOOLS',
    items: [
      { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
      { text: 'Store Front', icon: <StoreIcon />, path: '/storefront' },
      { text: 'Integrations', icon: <BuildIcon />, path: '/integrations' },
    ]
  },
  {
    category: 'SETTINGS',
    items: [
      { text: 'Billing', icon: <BillingIcon />, path: '/billing' },
      { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    ]
  }
];

const Sidebar = ({ collapsed, onToggle }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({
    'WORKSPACE': true,
    'CUSTOMER & SALES': true,
    'TOOLS': true,
    'SETTINGS': true
  });

  const toggleMenu = (category) => {
    if (!collapsed) {
      setOpenMenus(prev => ({
        ...prev,
        [category]: !prev[category]
      }));
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? collapsedWidth : drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#ffffff',
          borderRight: '1px solid #e0e0e0',
          transition: 'width 0.3s ease',
          overflowX: 'hidden'
        },
      }}
    >
      {/* Header dengan Toggle Button */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between'
      }}>
        {!collapsed && (
          <Typography variant="h6" fontWeight="bold" color="primary">
            MAKER XCITE
          </Typography>
        )}
        <IconButton onClick={onToggle} size="small">
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>

      {/* User Profile */}
      {user && (
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid #e0e0e0',
          display: collapsed ? 'none' : 'block'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              width: 32, 
              height: 32, 
              bgcolor: 'primary.main',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              {user.username?.[0]?.toUpperCase()}
            </Box>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <Typography variant="body2" fontWeight="medium" noWrap>
                {user.username}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {user.is_staff ? 'Admin' : 'Customer'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {menuItems.map((section) => (
          <Box key={section.category}>
            {!collapsed && (
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
            )}
            <List>
              {section.items.map((item) => (
                <Tooltip 
                  key={item.text} 
                  title={collapsed ? item.text : ''}
                  placement="right"
                >
                  <ListItem
                    component={Link}
                    to={item.path}
                    onClick={() => collapsed && onToggle()}
                    sx={{
                      px: collapsed ? 1.5 : 2,
                      py: 0.75,
                      mx: collapsed ? 0.5 : 1,
                      borderRadius: 1,
                      mb: 0.25,
                      cursor: 'pointer',
                      bgcolor: isActive(item.path) ? 'primary.light' : 'transparent',
                      color: isActive(item.path) ? 'primary.contrastText' : 'text.primary',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      '&:hover': {
                        bgcolor: isActive(item.path) ? 'primary.light' : 'action.hover'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ 
                      minWidth: collapsed ? 0 : 32, 
                      color: isActive(item.path) ? 'primary.contrastText' : 'inherit',
                      mr: collapsed ? 0 : 1.5,
                      display: 'flex',
                      justifyContent: 'center'
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText 
                        primary={item.text}
                        primaryTypographyProps={{ 
                          fontSize: '0.85rem', 
                          fontWeight: isActive(item.path) ? 600 : 400 
                        }}
                      />
                    )}
                  </ListItem>
                </Tooltip>
              ))}
            </List>
            {!collapsed && <Divider sx={{ my: 0.5 }} />}
          </Box>
        ))}
      </Box>

      {/* Footer */}
      {!collapsed && (
        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="caption" color="text.secondary" display="block" align="center">
            © 2026 MAKER XCITE
          </Typography>
        </Box>
      )}
    </Drawer>
  );
};

export default Sidebar;