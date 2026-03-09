// frontend/src/pages/QuotesList.js
import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, TextField, IconButton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { quoteAPI } from '../services/api';
import { formatIDR } from '../utils/currency';

const QuotesList = () => {
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const response = await quoteAPI.getAll();
      setQuotes(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load quotes:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'warning',
      'ACCEPTED': 'success',
      'REJECTED': 'error',
      'SENT': 'info'
    };
    return colors[status] || 'default';
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Quotes Management
        </Typography>

        <Paper sx={{ mb: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Material</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>{quote.quote_number}</TableCell>
                    <TableCell>{quote.customer_name || 'Guest'}</TableCell>
                    <TableCell>{quote.material}</TableCell>
                    <TableCell>{quote.quantity}</TableCell>
                    <TableCell>{formatIDR(quote.total_price)}</TableCell>
                    <TableCell>
                      <Chip label={quote.status} color={getStatusColor(quote.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small"><EditIcon /></IconButton>
                      <IconButton size="small"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Container>
  );
};

export default QuotesList;