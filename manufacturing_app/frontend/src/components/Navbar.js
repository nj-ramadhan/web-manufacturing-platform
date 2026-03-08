// frontend/src/components/Navbar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Menu, MenuItem, Divider
} from '@mui/material';
import { Menu as MenuIcon, Factory as FactoryIcon, Dashboard, TrackChanges, AdminPanelSettings } from '@mui/icons-material';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const isActive = (path) => location.pathname === path;

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN' || user?.is_staff;
  const isCustomer = user?.role === 'CUSTOMER' || (user && !isAdmin);

  return (
    <AppBar 
      position="sticky" 
      elevation={1}
      sx={{ 
        bgcolor: 'white', 
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FactoryIcon color="primary" />
          <Typography 
            variant="h6" 
            component={Link} 
            to="/"
            sx={{ 
              textDecoration: 'none', 
              color: 'inherit', 
              fontWeight: 'bold',
              '&:hover': { color: 'primary.main' }
            }}
          >
            ManufacturingID
          </Typography>
        </Box>

        {/* Desktop Navigation - Role Based */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
          {/* Public Link - Always visible */}
          <Button
            component={Link}
            to="/public-quote"
            color={isActive('/public-quote') ? 'primary' : 'inherit'}
            sx={{ fontWeight: isActive('/public-quote') ? 600 : 400 }}
          >
            🚀 Minta Penawaran
          </Button>
          
          {/* Customer Links */}
          {isCustomer && (
            <>
              <Button
                component={Link}
                to="/dashboard"
                color={isActive('/dashboard') ? 'primary' : 'inherit'}
                startIcon={<TrackChanges />}
              >
                Pesanan Saya
              </Button>
              <Button
                component={Link}
                to="/upload"
                color={isActive('/upload') ? 'primary' : 'inherit'}
              >
                📤 Upload File
              </Button>
            </>
          )}
          
          {/* Admin Links */}
          {isAdmin && (
            <Button
              component={Link}
              to="/admin-dashboard"
              color={isActive('/admin-dashboard') ? 'primary' : 'inherit'}
              startIcon={<AdminPanelSettings />}
            >
              🏭 Admin
            </Button>
          )}
          
          {/* Auth Buttons */}
          {!user ? (
            <>
              <Button component={Link} to="/login" variant="outlined">
                Login
              </Button>
              <Button component={Link} to="/register" variant="contained">
                Register
              </Button>
            </>
          ) : null}
        </Box>

        {/* User Menu */}
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user.username}
              {isAdmin && <span style={{ marginLeft: '4px', color: '#dc004e' }}>👑</span>}
            </Typography>
            <IconButton onClick={handleMenu} size="small">
              <Avatar sx={{ width: 32, height: 32, bgcolor: isAdmin ? 'secondary.main' : 'primary.main' }}>
                {user.username?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {isCustomer && (
                <MenuItem component={Link} to="/dashboard" onClick={handleClose}>
                  <Dashboard fontSize="small" sx={{ mr: 1 }} />
                  Dashboard
                </MenuItem>
              )}
              {isAdmin && (
                <MenuItem component={Link} to="/admin-dashboard" onClick={handleClose}>
                  <AdminPanelSettings fontSize="small" sx={{ mr: 1 }} />
                  Admin Panel
                </MenuItem>
              )}
              <Divider />
              <MenuItem onClick={() => { logout(); handleClose(); }}>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Button component={Link} to="/login" variant="outlined">
              Login
            </Button>
            <Button component={Link} to="/register" variant="contained">
              Register
            </Button>
          </Box>
        )}

        {/* Mobile Menu Button */}
        <IconButton sx={{ display: { xs: 'flex', md: 'none' } }}>
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;