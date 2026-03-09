// frontend/src/pages/Customers.js
import React from 'react';
import { Container, Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const Customers = () => {
  // Mock data - replace with API
  const customers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', orders: 5, totalSpent: 2500000 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', orders: 3, totalSpent: 1500000 },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold">Customers</Typography>
          <Button variant="contained" startIcon={<AddIcon />}>Add Customer</Button>
        </Box>

        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Orders</TableCell>
                  <TableCell>Total Spent</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.orders}</TableCell>
                    <TableCell>Rp {customer.totalSpent.toLocaleString('id-ID')}</TableCell>
                    <TableCell><Chip label="Active" color="success" size="small" /></TableCell>
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

export default Customers;