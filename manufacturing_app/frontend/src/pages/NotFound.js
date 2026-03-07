// frontend/src/pages/NotFound.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, Paper } from '@mui/material';
import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            bgcolor: 'transparent',
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <Typography variant="h1" fontWeight="bold" color="primary" sx={{ fontSize: '6rem', lineHeight: 1 }}>
            404
          </Typography>
          <Typography variant="h5" gutterBottom>
            Halaman Tidak Ditemukan
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
            <Button 
              variant="contained" 
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
            >
              Beranda
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
            >
              Kembali
            </Button>
          </Box>
        </Paper>
        
        <Typography variant="caption" color="textSecondary" sx={{ mt: 4, display: 'block' }}>
          Butuh bantuan?{' '}
          <a href="mailto:support@manufacturing.id" style={{ color: '#1976d2', textDecoration: 'none' }}>
            support@manufacturing.id
          </a>
        </Typography>
      </Box>
    </Container>
  );
};

export default NotFound;