// frontend/src/components/Layout/AuthLayout.js
import React from 'react';
import { Box } from '@mui/material';

const AuthLayout = ({ children }) => {
  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        width: '100%',
        bgcolor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      {children}
    </Box>
  );
};

export default AuthLayout;