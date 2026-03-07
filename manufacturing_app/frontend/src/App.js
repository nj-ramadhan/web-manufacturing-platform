// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UploadFile from './pages/UploadFile';
import QuoteGenerator from './pages/QuoteGenerator';
import PublicQuoteRequest from './pages/PublicQuoteRequest';
import NotFound from './pages/NotFound';

// Components
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    success: { main: '#2e7d32' },
    warning: { main: '#ed6c02' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Role-based route wrapper
const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Memuat...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/public-quote" />} />
            <Route path="/public-quote" element={<PublicQuoteRequest />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Customer Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <CustomerDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <PrivateRoute>
                  <UploadFile />
                </PrivateRoute>
              }
            />
            <Route
              path="/quote/:fileId"
              element={
                <PrivateRoute>
                  <QuoteGenerator />
                </PrivateRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <RoleRoute allowedRoles={['admin', 'staff']}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />
            
            {/* Legacy Dashboard (redirect to customer) */}
            <Route path="/old-dashboard" element={<Dashboard />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ToastContainer position="bottom-right" />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;