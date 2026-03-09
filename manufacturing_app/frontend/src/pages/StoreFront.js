// frontend/src/pages/StoreFront.js
import React from 'react';
import { Container, Box, Typography } from '@mui/material';

const StoreFront = () => (
  <Container maxWidth="xl">
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold">Store Front</Typography>
      <Typography variant="body1">Manage your public storefront</Typography>
    </Box>
  </Container>
);

export default StoreFront;