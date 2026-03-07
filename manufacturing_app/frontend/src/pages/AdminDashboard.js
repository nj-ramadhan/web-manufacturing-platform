// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { formatIDR } from '../utils/currency';
import {
  Container, Box, Typography, Paper, Grid, Button, Card, CardContent,
  Chip, LinearProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Select, FormControl, InputLabel,
  Tabs, Tab, Avatar, Tooltip, Divider,
  FormControlLabel, Checkbox, CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility as ViewIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  AddComment as CommentIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updateDialog, setUpdateDialog] = useState({ open: false, order: null });
  const [updateForm, setUpdateForm] = useState({
    title: '',
    message: '',
    update_type: 'INFO',
    is_internal: false
  });

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await orderAPI.getAll(params);
      setOrders(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, { status: newStatus });
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      alert('Gagal update status');
    }
  };

  const handleAddUpdate = async () => {
    if (!updateForm.title || !updateForm.message) {
      alert('Lengkapi judul dan pesan');
      return;
    }
    
    try {
      await orderAPI.addUpdate(updateDialog.order.id, updateForm);
      setUpdateDialog({ open: false, order: null });
      setUpdateForm({ title: '', message: '', update_type: 'INFO', is_internal: false });
      loadOrders();
    } catch (error) {
      alert('Gagal menambahkan update');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'QUOTE_SENT': 'info',
      'ACCEPTED': 'warning',
      'CONFIRMED': 'primary',
      'IN_PRODUCTION': 'primary',
      'QC_CHECK': 'warning',
      'PACKING': 'info',
      'SHIPPED': 'success',
      'COMPLETED': 'success',
      'CANCELLED': 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'QUOTE_SENT': '📧 Penawaran',
      'ACCEPTED': '✅ Diterima',
      'CONFIRMED': '🔧 Dikonfirmasi',
      'IN_PRODUCTION': '🏭 Produksi',
      'QC_CHECK': '🔍 QC',
      'PACKING': '📦 Packing',
      'SHIPPED': '🚚 Dikirim',
      'COMPLETED': '🎉 Selesai',
      'CANCELLED': '❌ Batal',
    };
    return labels[status] || status;
  };

  if (loading) {
    return <Container sx={{ py: 8 }}><Typography>Memuat data...</Typography></Container>;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              🏭 Admin Dashboard
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Kelola pesanan dan pantau progress produksi
            </Typography>
          </Box>
          <Box>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Semua Status</MenuItem>
                <MenuItem value="IN_PRODUCTION">🏭 Sedang Diproduksi</MenuItem>
                <MenuItem value="QC_CHECK">🔍 Quality Control</MenuItem>
                <MenuItem value="QUOTE_SENT">📧 Butuh Review</MenuItem>
                <MenuItem value="COMPLETED">✅ Selesai</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Total Pesanan', value: orders.length, color: 'primary' },
            { label: 'Dalam Produksi', value: orders.filter(o => o.status === 'IN_PRODUCTION').length, color: 'warning' },
            { label: 'Butuh Review', value: orders.filter(o => o.status === 'QUOTE_SENT').length, color: 'info' },
            { label: 'Revenue Bulan Ini', value: formatIDR(orders.filter(o => o.status !== 'CANCELLED').reduce((s, o) => s + (parseFloat(o.total_price)||0), 0)), color: 'success' },
          ].map((stat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ bgcolor: `${stat.color}.light`, color: 'white' }}>
                <CardContent>
                  <Typography variant="h4" fontWeight="bold">{stat.value}</Typography>
                  <Typography variant="body2">{stat.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Orders Table */}
        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell><strong>Nomor Order</strong></TableCell>
                  <TableCell><strong>Customer</strong></TableCell>
                  <TableCell><strong>Produksi</strong></TableCell>
                  <TableCell><strong>Total</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Progress</strong></TableCell>
                  <TableCell align="right"><strong>Aksi</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => {
                  const progress = order.stages?.length 
                    ? Math.round((order.stages.filter(s => s.status === 'COMPLETED').length / order.stages.length) * 100)
                    : 0;
                  
                  return (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">{order.order_number}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(order.created_at).toLocaleDateString('id-ID')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{order.customer_name}</Typography>
                        <Typography variant="caption" color="textSecondary">{order.customer_email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={
                            order.manufacturing_type === '3D_PRINTING' ? '🖨️ 3D' :
                            order.manufacturing_type === 'CNC_MACHINING' ? '🔧 CNC' : '✨ Laser'
                          }
                          size="small"
                        />
                        <Typography variant="caption" display="block">{order.material}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {formatIDR(order.total_price)}
                        </Typography>
                        <Typography variant="caption">{order.quantity} unit</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(order.status)} 
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={progress} 
                            sx={{ width: 80, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption">{progress}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Tooltip title="Lihat Detail">
                            <IconButton size="small" onClick={() => setSelectedOrder(order)}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Update Status">
                            <IconButton size="small" onClick={() => handleUpdateStatus(order.id, prompt('New status:', order.status) || order.status)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Tambah Update">
                            <IconButton size="small" onClick={() => setUpdateDialog({ open: true, order })}>
                              <CommentIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Order Detail Dialog */}
        {selectedOrder && (
          <Dialog fullWidth maxWidth="md" open={!!selectedOrder} onClose={() => setSelectedOrder(null)}>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">{selectedOrder.order_number}</Typography>
                <Chip label={getStatusLabel(selectedOrder.status)} color={getStatusColor(selectedOrder.status)} />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight="bold">Customer</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                    <Typography><strong>{selectedOrder.customer_name}</strong></Typography>
                    <Typography variant="body2">{selectedOrder.customer_email}</Typography>
                    <Typography variant="body2">{selectedOrder.customer_phone}</Typography>
                    {selectedOrder.customer_company && <Typography variant="body2">{selectedOrder.customer_company}</Typography>}
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" fontWeight="bold">Order Details</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>Produksi:</Grid>
                      <Grid item xs={6} textAlign="right">{selectedOrder.manufacturing_type}</Grid>
                      <Grid item xs={6}>Material:</Grid>
                      <Grid item xs={6} textAlign="right">{selectedOrder.material}</Grid>
                      <Grid item xs={6}>Qty:</Grid>
                      <Grid item xs={6} textAlign="right">{selectedOrder.quantity}</Grid>
                      <Grid item xs={6}>Total:</Grid>
                      <Grid item xs={6} textAlign="right" fontWeight="bold">{formatIDR(selectedOrder.total_price)}</Grid>
                    </Grid>
                  </Paper>
                </Grid>
                
                {/* Quick Status Update */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="bold">Update Status Cepat</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    {['CONFIRMED', 'IN_PRODUCTION', 'QC_CHECK', 'PACKING', 'SHIPPED', 'COMPLETED'].map(status => (
                      <Button
                        key={status}
                        size="small"
                        variant={selectedOrder.status === status ? 'contained' : 'outlined'}
                        onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                        disabled={selectedOrder.status === status}
                      >
                        {getStatusLabel(status)}
                      </Button>
                    ))}
                  </Box>
                </Grid>

                {/* Production Stages */}
                {selectedOrder.stages?.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight="bold">Production Pipeline</Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, overflowX: 'auto', pb: 1 }}>
                      {selectedOrder.stages.map((stage, i) => (
                        <Box 
                          key={stage.id}
                          sx={{ 
                            p: 1.5, 
                            minWidth: 120,
                            bgcolor: stage.status === 'COMPLETED' ? 'success.light' : 
                                   stage.status === 'IN_PROGRESS' ? 'primary.light' : 'grey.100',
                            borderRadius: 1,
                            border: stage.status === 'IN_PROGRESS' ? '2px solid' : '1px solid',
                            borderColor: stage.status === 'IN_PROGRESS' ? 'primary.main' : 'divider'
                          }}
                        >
                          <Typography variant="caption" fontWeight="bold">{i + 1}. {stage.stage_label}</Typography>
                          <Chip 
                            label={stage.status === 'COMPLETED' ? '✓' : stage.status === 'IN_PROGRESS' ? '⏳' : '⏸'}
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button startIcon={<WhatsAppIcon />} onClick={() => window.open(`https://wa.me/${selectedOrder.customer_phone.replace(/\D/g,'')}`, '_blank')}>
                WhatsApp
              </Button>
              <Button startIcon={<EmailIcon />} onClick={() => window.location.href = `mailto:${selectedOrder.customer_email}`}>
                Email
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button onClick={() => setSelectedOrder(null)}>Tutup</Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Add Update Dialog */}
        <Dialog open={updateDialog.open} onClose={() => setUpdateDialog({ open: false, order: null })}>
          <DialogTitle>Tambah Update untuk {updateDialog.order?.order_number}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Judul Update"
              value={updateForm.title}
              onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Pesan"
              multiline
              rows={4}
              value={updateForm.message}
              onChange={(e) => setUpdateForm({ ...updateForm, message: e.target.value })}
              sx={{ mt: 2 }}
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Tipe Update</InputLabel>
              <Select
                value={updateForm.update_type}
                label="Tipe Update"
                onChange={(e) => setUpdateForm({ ...updateForm, update_type: e.target.value })}
              >
                <MenuItem value="INFO">📢 Informasi</MenuItem>
                <MenuItem value="PROGRESS">🔄 Progress</MenuItem>
                <MenuItem value="DELAY">⚠️ Keterlambatan</MenuItem>
                <MenuItem value="ACTION_REQUIRED">❗ Perlu Aksi</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={updateForm.is_internal}
                  onChange={(e) => setUpdateForm({ ...updateForm, is_internal: e.target.checked })}
                />
              }
              label="Hanya untuk internal (tidak ditampilkan ke customer)"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUpdateDialog({ open: false, order: null })}>Batal</Button>
            <Button variant="contained" onClick={handleAddUpdate}>Kirim Update</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AdminDashboard;