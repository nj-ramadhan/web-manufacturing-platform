// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quoteAPI } from '../services/api';
import { formatIDR } from '../utils/currency';
import {
  Container, Box, Typography, Paper, Button, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const response = await quoteAPI.getAll();
      setQuotes(response.data);
    } catch (error) {
      console.error('Failed to load quotes:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      ACCEPTED: 'success',
      REJECTED: 'error',
      EXPIRED: 'default',
    };
    return colors[status] || 'default';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Welcome, {user?.username}!
          </Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/upload')}
              sx={{ mr: 2 }}
            >
              New Quote
            </Button>
            <Button variant="outlined" onClick={logout}>
              Logout
            </Button>
          </Box>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Your Quotes
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Quote #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Material</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotes.map((quote) => (
                <TableRow key={quote.id}>
                    <TableCell>{quote.quote_number}</TableCell>
                    <TableCell>{new Date(quote.created_at).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>
                    {quote.manufacturing_type === '3D_PRINTING' && 'Cetak 3D'}
                    {quote.manufacturing_type === 'CNC_MACHINING' && 'CNC Machining'}
                    {quote.manufacturing_type === 'LASER_CUTTING' && 'Laser Cutting'}
                    </TableCell>
                    <TableCell>
                    {quote.material === 'PLA' && 'PLA'}
                    {quote.material === 'ABS' && 'ABS'}
                    {quote.material === 'PETG' && 'PETG'}
                    {quote.material === 'ALUMINUM' && 'Aluminium'}
                    {quote.material === 'ACRYLIC_3MM' && 'Akrilik 3mm'}
                    {/* Add more translations as needed */}
                    </TableCell>
                    <TableCell>{quote.quantity}</TableCell>
                    <TableCell align="right" fontWeight="medium">
                    {formatIDR(quote.total_price)}
                    </TableCell>
                    <TableCell>
                    <Chip 
                        label={
                        quote.status === 'PENDING' && 'Menunggu' ||
                        quote.status === 'ACCEPTED' && 'Diterima' ||
                        quote.status === 'REJECTED' && 'Ditolak' ||
                        quote.status === 'EXPIRED' && 'Kadaluarsa' ||
                        quote.status
                        } 
                        color={
                        quote.status === 'PENDING' && 'warning' ||
                        quote.status === 'ACCEPTED' && 'success' ||
                        quote.status === 'REJECTED' && 'error' ||
                        'default'
                        } 
                        size="small" 
                    />
                    </TableCell>
                    <TableCell>
                    <Button size="small" onClick={() => navigate(`/quote/${quote.id}`)}>
                        Lihat
                    </Button>
                    </TableCell>
                </TableRow>
                ))}
                {quotes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No quotes yet. Create your first quote!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;