// frontend/src/pages/CustomerDashboard.js - COMPLETE WORKING VERSION

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container, Box, Typography, Paper, Grid, Button, Card, CardContent,
  Chip, LinearProgress, Divider, Tabs, Tab, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert
} from '@mui/material';
import {
  TrackChanges as TrackIcon,
  History as HistoryIcon,
  Add as AddIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { formatIDR } from '../utils/currency';
import { orderAPI } from '../services/api';
import ThreeDViewer from '../components/ThreeDViewer';
import { getFileUrl } from '../utils/url';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadOrders();
  }, [tabValue, refreshKey]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await orderAPI.myOrders();
      console.log('[Dashboard Orders]', response.data);
      setOrders(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'QUOTE_SENT': { label: 'Penawaran Dikirim', color: 'info', icon: '📧' },
      'ACCEPTED': { label: 'Diterima', color: 'warning', icon: '✅' },
      'CONFIRMED': { label: 'Dikonfirmasi', color: 'primary', icon: '🔧' },
      'IN_PRODUCTION': { label: 'Sedang Diproduksi', color: 'primary', icon: '🏭' },
      'QC_CHECK': { label: 'Quality Control', color: 'warning', icon: '🔍' },
      'PACKING': { label: 'Packing', color: 'info', icon: '📦' },
      'SHIPPED': { label: 'Telah Dikirim', color: 'success', icon: '🚚' },
      'COMPLETED': { label: 'Selesai', color: 'success', icon: '🎉' },
      'CANCELLED': { label: 'Dibatalkan', color: 'error', icon: '❌' },
    };
    return configs[status] || { label: status, color: 'default', icon: '⏳' };
  };

  const getStageProgress = (order) => {
    if (!order.stages?.length) return 0;
    const completed = order.stages.filter(s => s.status === 'COMPLETED').length;
    return Math.round((completed / order.stages.length) * 100);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseDialog = () => {
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography>Memuat pesanan...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              👋 Halo, {user?.username}!
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Kelola dan lacak pesanan produksi Anda
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => navigate('/public-quote')}
            >
              Minta Penawaran Baru
            </Button>
            <Button variant="outlined" onClick={logout}>
              Logout
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
              <CardContent>
                <Typography variant="h3" fontWeight="bold">
                  {orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length}
                </Typography>
                <Typography variant="body2">Pesanan Aktif</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
              <CardContent>
                <Typography variant="h3" fontWeight="bold">
                  {orders.filter(o => o.status === 'COMPLETED').length}
                </Typography>
                <Typography variant="body2">Selesai</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
              <CardContent>
                <Typography variant="h3" fontWeight="bold">
                  {formatIDR(orders.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0))}
                </Typography>
                <Typography variant="body2">Total Belanja</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, val) => setTabValue(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={`📋 Semua (${orders.length})`} />
            <Tab label={`⏳ Dalam Proses (${orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length})`} />
            <Tab label={`✅ Selesai (${orders.filter(o => o.status === 'COMPLETED').length})`} />
          </Tabs>
        </Paper>

        {/* Orders List */}
        <Grid container spacing={3}>
          {orders
            .filter(order => {
              if (tabValue === 1) return !['COMPLETED', 'CANCELLED'].includes(order.status);
              if (tabValue === 2) return order.status === 'COMPLETED';
              return true;
            })
            .map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const progress = getStageProgress(order);
              
              return (
                <Grid item xs={12} key={order.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
                      transition: 'all 0.2s',
                      borderLeft: `4px solid ${statusConfig.color}.main`
                    }}
                    onClick={() => handleViewOrder(order)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {order.order_number}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                            })}
                          </Typography>
                        </Box>
                        <Chip 
                          icon={<span>{statusConfig.icon}</span>}
                          label={statusConfig.label} 
                          color={statusConfig.color}
                          size="small"
                        />
                      </Box>

                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="textSecondary" display="block">
                            Produksi
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {order.manufacturing_type === '3D_PRINTING' && 'Cetak 3D'}
                            {order.manufacturing_type === 'CNC_MACHINING' && 'CNC'}
                            {order.manufacturing_type === 'LASER_CUTTING' && 'Laser'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="textSecondary" display="block">
                            Material
                          </Typography>
                          <Typography variant="body2">{order.material}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="textSecondary" display="block">
                            Jumlah
                          </Typography>
                          <Typography variant="body2">{order.quantity} unit</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="caption" color="textSecondary" display="block">
                            Total
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {formatIDR(order.total_price)}
                          </Typography>
                        </Grid>
                      </Grid>

                      {/* Progress Bar for Active Orders */}
                      {!['COMPLETED', 'CANCELLED', 'QUOTE_SENT'].includes(order.status) && (
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">Progress Produksi</Typography>
                            <Typography variant="caption" fontWeight="bold">{progress}%</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={progress} 
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      )}

                      {/* File Info */}
                      {order.quote_info && (
                        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                          <Typography variant="caption" color="textSecondary">
                            📄 {order.quote_info.file_name}
                          </Typography>
                          {order.quote_info.volume && (
                            <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                              • {order.quote_info.volume.toFixed(2)} cm³
                            </Typography>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          
          {orders.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Belum ada pesanan
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                  Mulai dengan meminta penawaran harga untuk proyek pertama Anda
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/public-quote')}
                >
                  Buat Penawaran Pertama
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Order Detail Dialog */}
        {selectedOrder && (
          <Dialog 
            fullWidth 
            maxWidth="md" 
            open={!!selectedOrder} 
            onClose={handleCloseDialog}
          >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {selectedOrder.order_number}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Dibuat: {new Date(selectedOrder.created_at).toLocaleDateString('id-ID')}
                </Typography>
              </Box>
              <Chip 
                label={getStatusConfig(selectedOrder.status).label}
                color={getStatusConfig(selectedOrder.status).color}
              />
            </DialogTitle>
            
            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* 3D Preview if file exists */}
                {selectedOrder.quote_info && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Preview 3D
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <ThreeDViewer fileUrl={getFileUrl(selectedOrder.quote_info)} />
                      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip label={`📦 ${selectedOrder.quote_info.volume?.toFixed(2)} cm³`} size="small" />
                        <Chip label={`⚖️ ${selectedOrder.quote_info.weight?.toFixed(1)} gram`} size="small" />
                        <Chip label={`📐 ${selectedOrder.quote_info.dimensions?.x?.toFixed(0)}×${selectedOrder.quote_info.dimensions?.y?.toFixed(0)}×${selectedOrder.quote_info.dimensions?.z?.toFixed(0)} mm`} size="small" />
                      </Box>
                    </Paper>
                  </Grid>
                )}

                {/* Order Info */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Detail Pesanan
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>Produksi:</Grid>
                      <Grid item xs={6} textAlign="right">{selectedOrder.manufacturing_type}</Grid>
                      <Grid item xs={6}>Material:</Grid>
                      <Grid item xs={6} textAlign="right">{selectedOrder.material}</Grid>
                      <Grid item xs={6}>Jumlah:</Grid>
                      <Grid item xs={6} textAlign="right">{selectedOrder.quantity} unit</Grid>
                      <Grid item xs={6}>Harga/Unit:</Grid>
                      <Grid item xs={6} textAlign="right">{formatIDR(selectedOrder.unit_price)}</Grid>
                      <Grid item xs={6} fontWeight="bold">Total:</Grid>
                      <Grid item xs={6} textAlign="right" fontWeight="bold" color="primary">
                        {formatIDR(selectedOrder.total_price)}
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Contact Info */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Informasi Kontak
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2"><strong>Nama:</strong> {selectedOrder.customer_name}</Typography>
                    <Typography variant="body2"><strong>Email:</strong> {selectedOrder.customer_email}</Typography>
                    <Typography variant="body2"><strong>Telepon:</strong> {selectedOrder.customer_phone || '-'}</Typography>
                    {selectedOrder.customer_company && (
                      <Typography variant="body2"><strong>Perusahaan:</strong> {selectedOrder.customer_company}</Typography>
                    )}
                  </Paper>
                </Grid>

                {/* Production Stages - STATUS MONITORING */}
                {selectedOrder.stages?.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      📊 Tahapan Produksi
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {selectedOrder.stages.map((stage, index) => (
                        <Box 
                          key={stage.id}
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            p: 1.5,
                            bgcolor: stage.status === 'COMPLETED' ? 'success.light' : 
                                   stage.status === 'IN_PROGRESS' ? 'primary.light' : 'grey.100',
                            borderRadius: 1,
                            opacity: stage.status === 'SKIPPED' ? 0.5 : 1
                          }}
                        >
                          <Avatar 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              bgcolor: stage.status === 'COMPLETED' ? 'success.main' : 
                                      stage.status === 'IN_PROGRESS' ? 'primary.main' : 'grey.400'
                            }}
                          >
                            {stage.status === 'COMPLETED' ? '✓' : 
                             stage.status === 'IN_PROGRESS' ? '⏳' : index + 1}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {stage.stage_label}
                            </Typography>
                            {stage.started_at && (
                              <Typography variant="caption" color="textSecondary">
                                Mulai: {new Date(stage.started_at).toLocaleDateString('id-ID')}
                              </Typography>
                            )}
                            {stage.assigned_to && (
                              <Typography variant="caption" color="textSecondary" display="block">
                                👤 {stage.assigned_to}
                              </Typography>
                            )}
                          </Box>
                          <Chip 
                            label={stage.status_label || stage.status}
                            size="small"
                            color={stage.status === 'COMPLETED' ? 'success' : 
                                   stage.status === 'IN_PROGRESS' ? 'primary' : 'default'}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                )}

                {/* Updates Timeline */}
                {selectedOrder.updates?.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      📢 Update Terbaru
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {selectedOrder.updates.map((update) => (
                        <Paper key={update.id} variant="outlined" sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {update.title}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {update.created_at_formatted}
                            </Typography>
                          </Box>
                          <Typography variant="body2">{update.message}</Typography>
                        </Paper>
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button 
                variant="outlined" 
                startIcon={<WhatsAppIcon />}
                onClick={() => window.open('https://wa.me/6281234567890', '_blank')}
              >
                Chat via WhatsApp
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<EmailIcon />}
                onClick={() => window.location.href = `mailto:support@manufacturing.id?subject=Order ${selectedOrder.order_number}`}
              >
                Email Support
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button onClick={handleCloseDialog}>Tutup</Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Floating Action Button */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => navigate('/public-quote')}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            borderRadius: 50,
            px: 3,
            boxShadow: 3,
            '&:hover': { boxShadow: 6 }
          }}
        >
          + Pesanan Baru
        </Button>
      </Box>
    </Container>
  );
};

export default CustomerDashboard;