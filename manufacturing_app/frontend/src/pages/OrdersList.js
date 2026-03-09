// frontend/src/pages/OrdersList.js
import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { orderAPI } from '../services/api';
import { formatIDR } from '../utils/currency';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await orderAPI.myOrders();
      setOrders(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'CONFIRMED': { label: 'Confirmed', color: 'primary' },
      'IN_PRODUCTION': { label: 'In Production', color: 'warning' },
      'COMPLETED': { label: 'Completed', color: 'success' },
    };
    return configs[status] || { label: status, color: 'default' };
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Orders
        </Typography>

        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order Number</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => {
                  const status = getStatusConfig(order.status);
                  return (
                    <TableRow key={order.id}>
                      <TableCell>{order.order_number}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>{order.manufacturing_type}</TableCell>
                      <TableCell>{formatIDR(order.total_price)}</TableCell>
                      <TableCell><Chip label={status.label} color={status.color} size="small" /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Container>
  );
};

export default OrdersList;