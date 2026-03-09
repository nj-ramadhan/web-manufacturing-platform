// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Layouts
import MainLayout from '././components/layout/MainLayout';
import AuthLayout from '././components/layout/AuthLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/CustomerDashboard';
import PublicQuoteRequest from './pages/PublicQuoteRequest';
import JobBoard from './pages/JobBoard';
import ProductionBoard from './pages/ProductionBoard';
import PricingTools from './pages/PricingTools';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Customers from './pages/Customers';
import QuotesList from './pages/QuotesList';
import OrdersList from './pages/OrdersList';
import Integrations from './pages/Integrations';
import StoreFront from './pages/StoreFront';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Pages that should NOT have sidebar
const publicPages = ['/login', '/register', '/public-quote'];

// App Content Component - checks location
const AppContent = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Check if current path is a public page
  const isPublicPage = publicPages.some(path => location.pathname === path || location.pathname.startsWith(path + '/'));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public Routes - NO SIDEBAR */}
      <Route path="/login" element={isPublicPage ? <AuthLayout><Login /></AuthLayout> : <Login />} />
      <Route path="/register" element={isPublicPage ? <AuthLayout><Register /></AuthLayout> : <Register />} />
      <Route path="/public-quote" element={<PublicQuoteRequest />} />
      
      {/* Protected Routes - WITH SIDEBAR */}
      <Route 
        path="/dashboard" 
        element={
          user ? (
            <MainLayout><Dashboard /></MainLayout>
          ) : (
            <Navigate to="/login" state={{ from: location }} replace />
          )
        } 
      />
      <Route 
        path="/job-board" 
        element={
          user ? (
            <MainLayout><JobBoard /></MainLayout>
          ) : (
            <Navigate to="/login" state={{ from: location }} replace />
          )
        } 
      />
      <Route 
        path="/production" 
        element={
          user ? (
            <MainLayout><ProductionBoard /></MainLayout>
          ) : (
            <Navigate to="/login" state={{ from: location }} replace />
          )
        } 
      />
      <Route 
        path="/pricing-tools" 
        element={
          user ? (
            <MainLayout><PricingTools /></MainLayout>
          ) : (
            <Navigate to="/login" state={{ from: location }} replace />
          )
        } 
      />
      <Route 
        path="/analytics" 
        element={
          user ? (
            <MainLayout><AnalyticsDashboard /></MainLayout>
          ) : (
            <Navigate to="/login" state={{ from: location }} replace />
          )
        } 
      />
      <Route 
        path="/customers" 
        element={
          user ? (
            <MainLayout><Customers /></MainLayout>
          ) : (
            <Navigate to="/login" state={{ from: location }} replace />
          )
        } 
      />
      <Route 
        path="/quotes" 
        element={
          user ? (
            <MainLayout><QuotesList /></MainLayout>
          ) : (
            <Navigate to="/login" state={{ from: location }} replace />
          )
        } 
      />
      <Route 
        path="/orders" 
        element={
          user ? (
            <MainLayout><OrdersList /></MainLayout>
          ) : (
            <Navigate to="/login" state={{ from: location }} replace />
          )
        } 
      />
      <Route 
        path="/integrations" 
        element={
          user ? (
            <MainLayout><Integrations /></MainLayout>
          ) : (
            <Navigate to="/login" state={{ from: location }} replace />
          )
        } 
      />
      <Route 
        path="/storefront" 
        element={
          user ? (
            <MainLayout><StoreFront /></MainLayout>
          ) : (
            <Navigate to="/login" state={{ from: location }} replace />
          )
        } 
      />
      <Route 
        path="/billing" 
        element={
          user ? (
            <MainLayout><Billing /></MainLayout>
          ) : (
            <Navigate to="/login" state={{ from: location }} replace />
          )
        } 
      />
      <Route 
        path="/settings" 
        element={
          user ? (
            <MainLayout><Settings /></MainLayout>
          ) : (
            <Navigate to="/login" state={{ from: location }} replace />
          )
        } 
      />
      
      {/* Redirects */}
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/public-quote"} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;