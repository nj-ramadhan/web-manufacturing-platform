// frontend/src/pages/Integrations.js
import React from 'react';
import { Container, Box, Typography, Paper, Grid, Card, CardContent, Button } from '@mui/material';

const Integrations = () => (
  <Container maxWidth="xl">
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Integrations</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Payment Gateway</Typography>
              <Typography variant="body2" color="text.secondary">Connect payment methods</Typography>
              <Button variant="contained" sx={{ mt: 2 }}>Configure</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  </Container>
);

export default Integrations;

