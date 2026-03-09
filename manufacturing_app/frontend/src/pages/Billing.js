// frontend/src/pages/Billing.js
import React from 'react';
import { Container, Box, Typography } from '@mui/material';

const Billing = () => (
  <Container maxWidth="xl">
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold">Billing</Typography>
      <Typography variant="body1">Manage billing and invoices</Typography>
    </Box>
  </Container>
);

export default Billing;