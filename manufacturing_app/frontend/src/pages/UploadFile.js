import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { fileAPI } from '../services/api';
import {
  Container, Box, Typography, Paper, LinearProgress, Alert, Grid
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const UploadFile = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    
    // ⚠️ Create FormData correctly
    const formData = new FormData();
    formData.append('file', file);  // Must match serializer field name
    formData.append('original_filename', file.name);
    formData.append('manufacturing_type', '3D_PRINTING');
    // ⚠️ Do NOT append 'user' - it's set by the backend

    setUploading(true);
    setError('');

    try {
        const response = await fileAPI.upload(formData);
        setUploadedFile(response.data);
        
        // Redirect to quote generator after short delay
        setTimeout(() => {
        navigate(`/quote/${response.data.id}`);
        }, 1000);
    } catch (err) {
        console.error('Upload error:', err);
        
        // Show detailed error
        const errorMsg = err.response?.data?.detail || 
                        err.response?.data?.message || 
                        err.message || 
                        'Upload failed';
        setError(errorMsg);
    } finally {
        setUploading(false);
        setProgress(0);
    }
  }, [navigate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'model/stl': ['.stl'],
      'model/obj': ['.obj'],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
  });

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Upload 3D File
        </Typography>

        <Paper sx={{ p: 4, mt: 2 }}>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed #1976d2',
              borderRadius: 2,
              padding: 6,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragActive ? '#e3f2fd' : 'white',
              '&:hover': { backgroundColor: '#f5f5f5' },
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{ fontSize: 64, color: '#1976d2', mb: 2 }} />
            {isDragActive ? (
              <Typography variant="h6">Drop file here...</Typography>
            ) : (
              <>
                <Typography variant="h6">
                  Drag & drop your 3D file here
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  or click to browse (STL, OBJ supported)
                </Typography>
              </>
            )}
          </Box>

          {uploading && (
            <Box sx={{ mt: 3 }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                Uploading... {progress}%
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {uploadedFile && (
            <Alert severity="success" sx={{ mt: 2 }}>
              File uploaded successfully! Redirecting to quote generator...
            </Alert>
          )}
        </Paper>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Supported File Types
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2">• STL (.stl)</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">• OBJ (.obj)</Typography>
            </Grid>
          </Grid>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            Max file size: 100MB
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default UploadFile;