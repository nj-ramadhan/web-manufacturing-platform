import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Paper, Box, Typography, Card, CardContent,
  Chip, Button, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import {
  TrendingUp, TrendingDown, AttachMoney,
  People, ShoppingCart, Assessment
} from '@mui/icons-material';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { formatIDR } from '../utils/currency';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    newCustomers: 0,
    fulfillmentTime: 0
  });

  // Mock data - replace with API calls
  const growthData = [
    { date: '01/03', orders: 2, quotes: 5, revenue: 150000 },
    { date: '02/03', orders: 3, quotes: 7, revenue: 225000 },
    { date: '03/03', orders: 1, quotes: 4, revenue: 75000 },
    { date: '04/03', orders: 4, quotes: 8, revenue: 300000 },
    { date: '05/03', orders: 5, quotes: 10, revenue: 375000 },
    { date: '06/03', orders: 3, quotes: 6, revenue: 225000 },
    { date: '07/03', orders: 6, quotes: 12, revenue: 450000 },
  ];

  const technologyData = [
    { name: '3D Printing', value: 45, color: '#1976d2' },
    { name: 'CNC Machining', value: 30, color: '#2e7d32' },
    { name: 'Laser Cutting', value: 25, color: '#ed6c02' },
  ];

  const StatCard = ({ title, value, change, changeType, icon }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {value}
            </Typography>
            {change && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {changeType === 'increase' ? (
                  <TrendingUp color="success" fontSize="small" />
                ) : (
                  <TrendingDown color="error" fontSize="small" />
                )}
                <Typography variant="body2" color={changeType === 'increase' ? 'success.main' : 'error.main'}>
                  {change}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ 
            p: 1.5, 
            bgcolor: 'primary.light', 
            borderRadius: 2,
            color: 'primary.main'
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Analytics Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track your manufacturing business performance
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="quarter">Last 3 Months</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Total Revenue"
              value={formatIDR(2500000)}
              change={12.5}
              changeType="increase"
              icon={<AttachMoney />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Total Orders"
              value={48}
              change={8.2}
              changeType="increase"
              icon={<ShoppingCart />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Conversion Rate"
              value="14.29%"
              change={5.3}
              changeType="decrease"
              icon={<Assessment />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="New Customers"
              value={12}
              change={15.0}
              changeType="increase"
              icon={<People />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <StatCard
              title="Avg Fulfillment"
              value="1.05 Months"
              change={3.1}
              changeType="increase"
              icon={<TrendingUp />}
            />
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3}>
          {/* Growth Chart */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Growth Overview
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="orders" stroke="#1976d2" name="Orders" />
                  <Line type="monotone" dataKey="quotes" stroke="#2e7d32" name="Quotes" />
                  <Line type="monotone" dataKey="revenue" stroke="#ed6c02" name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Technology Distribution */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Technology Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={technologyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {technologyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Activity
              </Typography>
              <Box sx={{ mt: 2 }}>
                {[1, 2, 3].map((_, i) => (
                  <Box key={i} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    py: 1.5,
                    borderBottom: i < 2 ? '1px solid #e0e0e0' : 'none'
                  }}>
                    <Chip 
                      label={i === 0 ? 'New Order' : i === 1 ? 'Quote Sent' : 'Production Started'}
                      size="small"
                      color={i === 0 ? 'success' : i === 1 ? 'info' : 'warning'}
                    />
                    <Typography variant="body2">
                      {i === 0 ? 'ORD-3DP-20260308-001' : i === 1 ? 'Quote #245' : 'Production #189'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      {i === 0 ? '2 hours ago' : i === 1 ? '5 hours ago' : '1 day ago'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AnalyticsDashboard;