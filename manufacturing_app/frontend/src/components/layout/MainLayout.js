// frontend/src/components/Layout/MainLayout.js
import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import { Notifications as NotificationsIcon, Brightness4 as DarkModeIcon } from '@mui/icons-material';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 20;
const collapsedWidth = 20;

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const currentWidth = sidebarCollapsed ? collapsedWidth : drawerWidth;

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar - ONLY in MainLayout */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        ml: `${currentWidth}px`,
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Top AppBar */}
        <AppBar position="sticky" elevation={0} sx={{ 
          bgcolor: 'white', 
          color: 'text.primary',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Toolbar>
            <Typography variant="h6" fontWeight="bold" sx={{ flexGrow: 1 }}>
              Manufacturing Platform
            </Typography>
            
            <IconButton color="inherit">
              <DarkModeIcon />
            </IconButton>
            
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>

            {user && (
              <>
                <IconButton onClick={handleMenuOpen} sx={{ ml: 2 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {user.username?.[0]?.toUpperCase()}
                  </Avatar>
                </IconButton>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem onClick={() => { handleMenuClose(); logout(); }}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ flex: 1, p: 3, bgcolor: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;