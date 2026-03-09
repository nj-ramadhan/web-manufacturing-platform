// frontend/src/pages/PublicQuoteRequest.js - ADD LOGIN BUTTON
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';  // ⚠️ Add Link import
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import {
  Container, Box, Typography, Paper, Grid, TextField,
  Button, Stepper, Step, StepLabel, Alert, Chip,
  FormControl, InputLabel, Select, MenuItem,
  Checkbox, FormControlLabel, Divider, CircularProgress,
  IconButton, Avatar, Tooltip
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  WhatsApp as WhatsAppIcon,
  Login as LoginIcon,  // ⚠️ Add Login icon
  AccountCircle as AccountIcon
} from '@mui/icons-material';
import { formatIDR } from '../utils/currency';
import ThreeDViewer from '../components/ThreeDViewer';
import { useAuth } from '../context/AuthContext';  // ⚠️ Import useAuth

const API_BASE = 'http://localhost:8000/api';

const PublicQuoteRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();  // ⚠️ Get auth state
  
  // ... existing state ...
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '',
    manufacturing_type: '3D_PRINTING', material: 'PLA', quantity: 1,
    requirements: '', deadline: '',
    agree_to_terms: false, agree_to_contact: false,
  });
  
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileAnalysis, setFileAnalysis] = useState(null);

  const steps = ['Upload File', 'Detail Proyek', 'Kontak & Konfirmasi'];

  // Material options
  const MATERIALS = {
    '3D_PRINTING': [
      { value: 'PLA', label: 'PLA (Standard)' },
      { value: 'ABS', label: 'ABS (Tahan Panas)' },
      { value: 'PETG', label: 'PETG (Kuat & Fleksibel)' },
      { value: 'NYLON', label: 'Nylon (Premium)' },
    ],
    'CNC_MACHINING': [
      { value: 'ALUMINUM', label: 'Aluminium 6061' },
      { value: 'STEEL', label: 'Steel Mild' },
      { value: 'BRASS', label: 'Kuningan' },
    ],
    'LASER_CUTTING': [
      { value: 'ACRYLIC_3MM', label: 'Akrilik 3mm' },
      { value: 'WOOD_MDF_3MM', label: 'MDF 3mm' },
      { value: 'STAINLESS_1MM', label: 'Stainless 1mm' },
    ],
  };

  const handleLoginClick = () => {
    // Save current progress to sessionStorage so user can resume after login
    const progress = {
      step: activeStep,
      formData,
      uploadedFile: uploadedFile ? { id: uploadedFile.id, name: uploadedFile.original_filename } : null,
      fileAnalysis,
      timestamp: Date.now()
    };
    sessionStorage.setItem('quote_progress', JSON.stringify(progress));
    
    // Navigate to login with return URL
    navigate('/login', { 
      state: { 
        from: '/public-quote',
        message: 'Login untuk melanjutkan permintaan penawaran Anda'
      } 
    });
  };

    useEffect(() => {
    if (user) {
      // User just logged in, check for saved progress
      const savedProgress = sessionStorage.getItem('quote_progress');
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress);
          // Restore progress if recent (< 1 hour)
          if (Date.now() - progress.timestamp < 3600000) {
            setActiveStep(progress.step);
            setFormData(progress.formData);
            if (progress.uploadedFile) {
              // Reload file info from API
              axios.get(`${API_BASE}/files/${progress.uploadedFile.id}/`)
                .then(res => {
                  setUploadedFile(res.data);
                  setFileAnalysis(progress.fileAnalysis);
                });
            }
            setSuccess('Progress Anda telah dipulihkan! Silakan lanjutkan.');
          }
          sessionStorage.removeItem('quote_progress');
        } catch (e) {
          console.error('Failed to restore progress:', e);
        }
      }
    }
  }, [user]);
  
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('original_filename', file.name);
    formData.append('manufacturing_type', formData.manufacturing_type || '3D_PRINTING');

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/public-upload/',  // Changed from /api/files/
        formData,
        {
          headers: { 
            'Content-Type': 'multipart/form-data'
          },
        }
      );
      
      setUploadedFile(response.data);
      setFileAnalysis({
        volume: response.data.volume,
        weight: response.data.weight,
        dimensions: {
          x: response.data.bounding_box_x,
          y: response.data.bounding_box_y,
          z: response.data.bounding_box_z,
        }
      });
      
      // Auto-advance to next step
      setActiveStep(1);
    } catch (err) {
      console.error('[Public Upload Error]', err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.detail || 'Gagal upload file');
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'model/stl': ['.stl'], 'model/obj': ['.obj'] },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
    disabled: loading,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validate current step
    if (activeStep === 0 && !uploadedFile) {
      setError('Silakan upload file 3D terlebih dahulu');
      return;
    }
    if (activeStep === 1 && !formData.material) {
      setError('Silakan pilih material');
      return;
    }
    if (activeStep === 2) {
      if (!formData.name || formData.name.trim() === '') {
        setError('Nama lengkap harus diisi');
        return;
      }
      if (!formData.email || !formData.email.includes('@')) {
        setError('Email harus valid');
        return;
      }
      if (!formData.phone || formData.phone.trim() === '') {
        setError('Nomor WhatsApp/Telepon harus diisi');
        return;
      }
      if (!formData.agree_to_terms) {
        setError('Anda harus menyetujui syarat & ketentuan');
        return;
      }
      // Don't require agree_to_contact - make it optional in backend
      submitQuoteRequest();
      return;
    }
    setError(null);
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError(null);
  };

const submitQuoteRequest = async () => {
  setLoading(true);
  setError(null);

  try {
    const payload = {
      ...formData,
      file_id: uploadedFile.id,
    };

    if (!payload.deadline || payload.deadline === '') {
      payload.deadline = null;
    }
    
    payload.quantity = parseInt(payload.quantity) || 1;
    
    payload.agree_to_terms = Boolean(payload.agree_to_terms);
    payload.agree_to_contact = Boolean(payload.agree_to_contact);

    console.log('[Guest Quote Payload]', payload);

    const response = await axios.post(`${API_BASE}/guest-quotes/`, payload);
    
    setSuccess(response.data.message);
    setOrderNumber(response.data.order_number);
    setActiveStep(3);
  } catch (err) {
    console.error('[Guest Quote Error]', err.response?.status);
    console.error('[Guest Quote Error Data]', err.response?.data);
    
    const errorMsg = err.response?.data 
      ? JSON.stringify(err.response.data) 
      : 'Gagal mengirim permintaan';
    setError(`Error: ${errorMsg}`);
  } finally {
    setLoading(false);
  }
};

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              📁 Upload File 3D Anda
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Format yang didukung: STL, OBJ • Maksimal 100MB
            </Typography>

            <Paper
              {...getRootProps()}
              sx={{
                p: 4,
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'divider',
                borderRadius: 2,
                textAlign: 'center',
                cursor: loading ? 'not-allowed' : 'pointer',
                bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
              }}
            >
              <input {...getInputProps()} />
              <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              {isDragActive ? (
                <Typography>🎯 Lepaskan file di sini...</Typography>
              ) : (
                <>
                  <Typography variant="h6">Drag & drop file 3D</Typography>
                  <Typography variant="body2" color="textSecondary">
                    atau klik untuk browse file
                  </Typography>
                </>
              )}
            </Paper>

            {loading && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Menganalisis file...
                </Typography>
              </Box>
            )}

            {/* File Preview & Analysis */}
            {uploadedFile && fileAnalysis && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  ✓ File Teranalisis
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <ThreeDViewer 
                      fileUrl={
                        uploadedFile?.file_url 
                          ? (uploadedFile.file_url.startsWith('http') 
                              ? uploadedFile.file_url 
                              : `http://localhost:8000${uploadedFile.file_url}`)
                          : null
                      } 
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {uploadedFile.original_filename}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2">
                          📦 Volume: <strong>{fileAnalysis.volume?.toFixed(2)} cm³</strong>
                        </Typography>
                        <Typography variant="body2">
                          ⚖️ Estimasi Berat: <strong>{fileAnalysis.weight?.toFixed(1)} gram</strong>
                        </Typography>
                        <Typography variant="body2">
                          📐 Dimensi: <strong>
                            {fileAnalysis.dimensions.x?.toFixed(1)} × {fileAnalysis.dimensions.y?.toFixed(1)} × {fileAnalysis.dimensions.z?.toFixed(1)} mm
                          </strong>
                        </Typography>
                      </Box>
                      <Chip 
                        label="✓ Valid untuk produksi" 
                        color="success" 
                        size="small" 
                        sx={{ mt: 1 }} 
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        );

        case 1:
          return (
            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                ⚙️ Detail Proyek
              </Typography>

              {/* ⚠️ ADD: 3D Preview Section at Top */}
              {uploadedFile && fileAnalysis && (
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    mb: 3, 
                    bgcolor: 'background.default',
                    border: '2px solid',
                    borderColor: 'success.main'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CheckCircleIcon color="success" />
                    <Typography variant="subtitle1" fontWeight="bold">
                      File Teranalisis: {uploadedFile.original_filename}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={5}>
                      {/* ⚠️ 3D Viewer */}
                      <ThreeDViewer fileUrl={uploadedFile.file_url} />
                    </Grid>
                    <Grid item xs={12} md={7}>
                      {/* File Info */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: 'white', borderRadius: 1 }}>
                          <Typography variant="body2" color="textSecondary">📦 Volume</Typography>
                          <Typography variant="body2" fontWeight="bold">{fileAnalysis.volume?.toFixed(2)} cm³</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: 'white', borderRadius: 1 }}>
                          <Typography variant="body2" color="textSecondary">⚖️ Berat</Typography>
                          <Typography variant="body2" fontWeight="bold">{fileAnalysis.weight?.toFixed(1)} gram</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: 'white', borderRadius: 1 }}>
                          <Typography variant="body2" color="textSecondary">📐 Dimensi</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {fileAnalysis.dimensions.x?.toFixed(1)} × {fileAnalysis.dimensions.y?.toFixed(1)} × {fileAnalysis.dimensions.z?.toFixed(1)} mm
                          </Typography>
                        </Box>
                        <Chip 
                          label="✓ Valid untuk produksi" 
                          color="success" 
                          size="small"
                          sx={{ alignSelf: 'flex-start', mt: 1 }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* Rest of Step 1 form fields */}
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Jenis Produksi</InputLabel>
                    <Select
                      value={formData.manufacturing_type}
                      label="Jenis Produksi"
                      onChange={(e) => handleChange('manufacturing_type', e.target.value)}
                    >
                      <MenuItem value="3D_PRINTING">🖨️ Cetak 3D (FDM)</MenuItem>
                      <MenuItem value="CNC_MACHINING">🔧 CNC Machining</MenuItem>
                      <MenuItem value="LASER_CUTTING">✨ Laser Cutting</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Material</InputLabel>
                    <Select
                      value={formData.material}
                      label="Material"
                      onChange={(e) => handleChange('material', e.target.value)}
                    >
                      {MATERIALS[formData.manufacturing_type]?.map((mat) => (
                        <MenuItem key={mat.value} value={mat.value}>
                          {mat.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Jumlah Unit"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1 }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Target Selesai (Opsional)"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleChange('deadline', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Catatan Tambahan"
                    placeholder="Contoh: Butuh finishing cat, toleransi dimensi ±0.1mm, dll."
                    multiline
                    rows={4}
                    value={formData.requirements}
                    onChange={(e) => handleChange('requirements', e.target.value)}
                  />
                </Grid>
              </Grid>

              {/* Price Estimate Hint */}
              <Alert 
                icon={<InfoIcon />} 
                severity="info" 
                sx={{ mt: 2 }}
              >
                <Typography variant="body2">
                  💡 <strong>Estimasi Harga:</strong> Berdasarkan file Anda, 
                  perkiraan harga mulai dari {formatIDR(50000)} - {formatIDR(500000)} 
                  tergantung material dan finishing. Harga final akan dikonfirmasi 
                  oleh tim kami setelah review.
                </Typography>
              </Alert>
            </Box>
          );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              👤 Data Kontak & Konfirmasi
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Nama Lengkap *"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Perusahaan (Opsional)"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="WhatsApp/Telepon *"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="0812-3456-7890"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                📋 Ringkasan Pesanan
              </Typography>
              <Grid container spacing={1} fontSize="0.9rem">
                <Grid item xs={6}>File:</Grid>
                <Grid item xs={6} textAlign="right" fontWeight="medium">
                  {uploadedFile?.original_filename}
                </Grid>
                <Grid item xs={6}>Produksi:</Grid>
                <Grid item xs={6} textAlign="right">
                  {formData.manufacturing_type === '3D_PRINTING' && 'Cetak 3D'}
                  {formData.manufacturing_type === 'CNC_MACHINING' && 'CNC Machining'}
                  {formData.manufacturing_type === 'LASER_CUTTING' && 'Laser Cutting'}
                </Grid>
                <Grid item xs={6}>Material:</Grid>
                <Grid item xs={6} textAlign="right">{formData.material}</Grid>
                <Grid item xs={6}>Jumlah:</Grid>
                <Grid item xs={6} textAlign="right">{formData.quantity} unit</Grid>
              </Grid>
            </Box>

            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agree_to_terms}
                    onChange={(e) => handleChange('agree_to_terms', e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    Saya menyetujui <a href="/terms" target="_blank" rel="noopener">Syarat & Ketentuan</a> dan <a href="/privacy" target="_blank" rel="noopener">Kebijakan Privasi</a> *
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agree_to_contact}
                    onChange={(e) => handleChange('agree_to_contact', e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2">
                    Saya setuju menerima update via email/WhatsApp tentang pesanan ini
                  </Typography>
                }
              />
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              🎉 Permintaan Berhasil!
            </Typography>
            <Typography variant="body1" paragraph>
              Terima kasih, <strong>{formData.name}</strong>!
            </Typography>
            
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                my: 2, 
                bgcolor: 'success.light', 
                borderColor: 'success.main' 
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Nomor Pesanan: {orderNumber}
              </Typography>
              <Typography variant="body2">
                Simpan nomor ini untuk melacak pesanan Anda
              </Typography>
            </Paper>

            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                📧 Tim kami akan menghubungi Anda via <strong>{formData.email}</strong> 
                atau <strong>{formData.phone}</strong> dalam <strong>1x24 jam</strong> 
                untuk konfirmasi harga final dan detail produksi.
              </Typography>
            </Alert>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<WhatsAppIcon />}
                href={`https://wa.me/6281234567890?text=Halo, saya ingin follow up pesanan ${orderNumber}`}
                target="_blank"
              >
                Chat via WhatsApp
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
              >
                Kembali ke Beranda
              </Button>
            </Box>

            <Typography variant="caption" color="textSecondary" sx={{ mt: 3, display: 'block' }}>
              Butuh bantuan? Hubungi: support@manufacturing.id • +62 812-3456-7890
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        
        {/* ⚠️ HEADER WITH LOGIN BUTTON */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          pb: 2,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              🚀 Minta Penawaran Harga
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Upload file 3D, atur spesifikasi, dan dapatkan penawaran dalam 1x24 jam
            </Typography>
          </Box>
          
          {/* ⚠️ LOGIN BUTTON */}
          {user ? (
            // User is logged in - show profile
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {user.username?.[0]?.toUpperCase()}
              </Avatar>
              <Typography variant="body2" fontWeight="medium">
                {user.username}
              </Typography>
            </Box>
          ) : (
            // Guest user - show login button
            <Button
              variant="outlined"
              startIcon={<LoginIcon />}
              onClick={handleLoginClick}
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  bgcolor: 'primary.light'
                }
              }}
            >
              Login / Register
            </Button>
          )}
        </Box>

        {/* ⚠️ PROGRESS BANNER FOR LOGGED-IN GUESTS */}
        {user && activeStep > 0 && (
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon />}
            sx={{ mb: 2 }}
          >
            👋 Halo {user.username}! Progress permintaan penawaran Anda telah disimpan.
          </Alert>
        )}

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
          {['Upload File', 'Detail Proyek', 'Kontak & Konfirmasi'].map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Form Content */}
        <Paper sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
          {getStepContent(activeStep)}
        </Paper>

        {/* Navigation Buttons */}
        {activeStep < 3 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={() => setActiveStep(prev => prev - 1)}
            >
              Kembali
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              endIcon={activeStep === 2 ? <CheckCircleIcon /> : undefined}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : activeStep === 2 ? (
                'Kirim Permintaan'
              ) : (
                'Lanjut'
              )}
            </Button>
          </Box>
        )}

        {/* ⚠️ FOOTER WITH LOGIN REMINDER */}
        {!user && (
          <Box sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2" display="flex" alignItems="center" justifyContent="center" gap={1}>
              Sudah punya akun?{' '}
              <Button 
                size="small" 
                onClick={handleLoginClick}
                endIcon={<LoginIcon />}
                sx={{ textTransform: 'none', fontWeight: 'medium' }}
              >
                Login di sini
              </Button>
              {' '}untuk melacak pesanan & riwayat penawaran
            </Typography>
          </Box>
        )}

        {/* Trust Badges */}
        <Box sx={{ mt: 3, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="caption" display="block">
            🔒 Data aman • 🇮🇩 Produksi lokal • ⭐ 500+ project selesai
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default PublicQuoteRequest;