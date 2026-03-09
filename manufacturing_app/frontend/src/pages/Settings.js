// frontend/src/pages/Settings.js
import React from 'react';
import { Container, Box, Typography } from '@mui/material';

const Settings = () => (
  <Container maxWidth="xl">
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold">Settings</Typography>
      <Typography variant="body1">Manage your account settings</Typography>
    </Box>
  </Container>
);

export default Settings;