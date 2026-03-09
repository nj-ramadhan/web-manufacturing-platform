// frontend/src/pages/ProductionBoard.js - SIMPLIFIED VERSION (NO DRAG-DROP)
import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Paper, Chip, IconButton,
  Button, Card, CardContent, Avatar, Badge, Select, MenuItem,
  FormControl, InputLabel, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid
} from '@mui/material';
import {
  MoreVert, AccessTime, Person, Add as AddIcon,
  FilterList as FilterIcon, Edit as EditIcon, CheckCircle
} from '@mui/icons-material';
import { orderAPI } from '../services/api';
import { formatIDR } from '../utils/currency';

const ProductionBoard = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialog, setStatusDialog] = useState(false);

  const columns = {
    'QUOTE_SENT': { title: 'Quote Sent', color: 'info', order: 1 },
    'ACCEPTED': { title: 'Accepted', color: 'warning', order: 2 },
    'CONFIRMED': { title: 'Confirmed', color: 'primary', order: 3 },
    'IN_PRODUCTION': { title: 'In Production', color: 'primary', order: 4 },
    'QC_CHECK': { title: 'Quality Control', color: 'warning', order: 5 },
    'PACKING': { title: 'Packing', color: 'info', order: 6 },
    'SHIPPED': { title: 'Shipped', color: 'success', order: 7 },
    'COMPLETED': { title: 'Completed', color: 'success', order: 8 },
  };

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await orderAPI.getAll(params);
      setOrders(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, { status: newStatus });
      loadOrders();
      setStatusDialog(false);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Gagal update status');
    }
  };

  const getOrderCount = (status) => {
    return orders.filter(o => o.status === status).length;
  };

  const sortedColumns = Object.entries(columns)
    .sort((a, b) => a[1].order - b[1].order);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Production Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track and manage production workflow
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter Status</InputLabel>
              <Select
                value={filter}
                label="Filter Status"
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="all">Semua</MenuItem>
                {Object.keys(columns).map(status => (
                  <MenuItem key={status} value={status}>{columns[status].title}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" startIcon={<AddIcon />}>
              New Order
            </Button>
          </Box>
        </Box>

        {/* Stats Summary */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, overflowX: 'auto', pb: 1 }}>
          {sortedColumns.map(([statusId, column]) => (
            <Chip
              key={statusId}
              label={`${column.title} (${getOrderCount(statusId)})`}
              color={column.color}
              variant={filter === statusId ? 'filled' : 'outlined'}
              onClick={() => setFilter(statusId)}
              sx={{ cursor: 'pointer', flexShrink: 0 }}
            />
          ))}
        </Box>

        {/* Orders Grid */}
        <Grid container spacing={2}>
          {orders.map((order) => {
            const statusConfig = columns[order.status] || columns['QUOTE_SENT'];
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderLeft: `4px solid ${statusConfig.color}.main`,
                    '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' },
                    transition: 'all 0.2s'
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {order.order_number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.customer_name}
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => { setSelectedOrder(order); setStatusDialog(true); }}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* Badges */}
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={order.manufacturing_type === '3D_PRINTING' ? '🖨️ 3D' : 
                               order.manufacturing_type === 'CNC_MACHINING' ? '🔧 CNC' : '✨ Laser'}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                      <Chip 
                        label={order.material}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 0.5 }}
                      />
                    </Box>

                    {/* Details */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">Quantity:</Typography>
                        <Typography variant="body2" fontWeight="medium">{order.quantity} units</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">Total:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                          {formatIDR(order.total_price)}
                        </Typography>
                      </Box>
                      {order.deadline && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                          <AccessTime fontSize="small" color="action" />
                          <Typography variant="caption" color="error">
                            Due: {new Date(order.deadline).toLocaleDateString('id-ID')}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Status */}
                    <Chip 
                      label={statusConfig.title}
                      color={statusConfig.color}
                      size="small"
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  </CardContent>

                  {/* Quick Actions */}
                  <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      fullWidth
                      startIcon={<EditIcon />}
                      onClick={() => { setSelectedOrder(order); setStatusDialog(true); }}
                    >
                      Update
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
          
          {orders.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No orders found for this filter
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>

        {/* Status Update Dialog */}
        {selectedOrder && (
          <Dialog open={statusDialog} onClose={() => setStatusDialog(false)}>
            <DialogTitle>Update Status: {selectedOrder.order_number}</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                {sortedColumns.map(([statusId, column]) => (
                  <Button
                    key={statusId}
                    variant={selectedOrder.status === statusId ? 'contained' : 'outlined'}
                    onClick={() => handleStatusChange(selectedOrder.id, statusId)}
                    disabled={selectedOrder.status === statusId}
                    startIcon={selectedOrder.status === statusId ? <CheckCircle /> : null}
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    {column.title}
                  </Button>
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </Container>
  );
};

export default ProductionBoard;