// frontend/src/pages/JobBoard.js
import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper, Grid, Card, CardContent, Chip } from '@mui/material';
import { quoteAPI, orderAPI } from '../services/api';
import { formatIDR } from '../utils/currency';

const JobBoard = () => {
  const [stats, setStats] = useState({
    quotes: 0,
    orders: 0,
    drafts: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [quotesRes, ordersRes] = await Promise.all([
        quoteAPI.getAll(),
        orderAPI.myOrders()
      ]);
      
      const quotes = quotesRes.data.results || quotesRes.data;
      const orders = ordersRes.data.results || ordersRes.data;
      
      setStats({
        quotes: quotes.filter(q => q.status === 'PENDING').length,
        orders: orders.length,
        drafts: quotes.filter(q => q.status === 'DRAFT').length
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Job Board
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
              <CardContent>
                <Typography variant="h3" fontWeight="bold">{stats.quotes}</Typography>
                <Typography variant="body1">Quotes</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
              <CardContent>
                <Typography variant="h3" fontWeight="bold">{stats.orders}</Typography>
                <Typography variant="body1">Orders</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
              <CardContent>
                <Typography variant="h3" fontWeight="bold">{stats.drafts}</Typography>
                <Typography variant="body1">Drafts</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default JobBoard;