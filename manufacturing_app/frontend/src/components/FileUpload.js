import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { 
  Box, Typography, Button, LinearProgress, Alert 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileUpload = ({ onUploadSuccess, manufacturingType }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    setError(null);
    
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('original_filename', file.name);
    formData.append('manufacturing_type', manufacturingType);
    
    try {
      const response = await axios.post(
        'http://localhost:8000/api/files/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      );
      
      onUploadSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [manufacturingType, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'model/stl': ['.stl'],
      'model/obj': ['.obj'],
      'application/step': ['.step', '.stp'],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed #1976d2',
          borderRadius: 2,
          padding: 4,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragActive ? '#e3f2fd' : 'white',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 64, color: '#1976d2', mb: 2 }} />
        {isDragActive ? (
          <Typography variant="h6">Drop the file here...</Typography>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Drag & drop your 3D file here
            </Typography>
            <Typography variant="body2" color="textSecondary">
              or click to browse (STL, OBJ, STEP supported)
            </Typography>
          </>
        )}
      </Box>
      
      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            Uploading... {uploadProgress}%
          </Typography>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload;