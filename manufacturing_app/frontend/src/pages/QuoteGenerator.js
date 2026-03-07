// frontend/src/pages/QuoteGenerator.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Paper, Grid, TextField,
  Button, Slider, Checkbox, FormControlLabel, Card, CardContent,
  Divider, Alert, CircularProgress, Chip, Tooltip
} from '@mui/material';
import { Info as InfoIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

import { fileAPI, quoteAPI } from '../services/api';
import ThreeDViewer from '../components/ThreeDViewer';
import { formatIDR } from '../utils/currency';

// Material options with Indonesian labels and price hints
const MATERIALS = {
  '3D_PRINTING': [
    { value: 'PLA', label: 'PLA (Standard)', priceNote: '~Rp 850/gram', description: 'Material standar, mudah dicetak, ramah lingkungan' },
    { value: 'ABS', label: 'ABS (Tahan Panas)', priceNote: '~Rp 1.020/gram', description: 'Kuat, tahan panas, cocok untuk part fungsional' },
    { value: 'PETG', label: 'PETG (Kuat & Fleksibel)', priceNote: '~Rp 1.190/gram', description: 'Tahan impact, fleksibel, food-safe' },
    { value: 'NYLON', label: 'Nylon (Premium)', priceNote: '~Rp 2.550/gram', description: 'Sangat kuat, tahan abrasi, untuk aplikasi berat' },
    { value: 'TPU', label: 'TPU (Fleksibel)', priceNote: '~Rp 1.700/gram', description: 'Elastis seperti karet, untuk gasket & casing' },
  ],
  'CNC_MACHINING': [
    { value: 'ALUMINUM', label: 'Aluminium 6061', priceNote: '~Rp 1.700/cm³', description: 'Ringan, kuat, mudah diproses' },
    { value: 'STEEL', label: 'Steel Mild', priceNote: '~Rp 1.360/cm³', description: 'Kuat, ekonomis, untuk part struktural' },
    { value: 'BRASS', label: 'Kuningan', priceNote: '~Rp 3.400/cm³', description: 'Estetis, konduktif, untuk dekorasi' },
    { value: 'POM_DELRIN', label: 'POM/Delrin', priceNote: '~Rp 850/cm³', description: 'Plastik engineering, rendah gesekan' },
  ],
  'LASER_CUTTING': [
    { value: 'ACRYLIC_3MM', label: 'Akrilik 3mm', priceNote: '~Rp 340/cm²', description: 'Transparan/berwarna, untuk signage & display' },
    { value: 'ACRYLIC_5MM', label: 'Akrilik 5mm', priceNote: '~Rp 510/cm²', description: 'Lebih tebal, untuk struktur kuat' },
    { value: 'WOOD_MDF_3MM', label: 'MDF 3mm', priceNote: '~Rp 170/cm²', description: 'Kayu composite, ekonomis, mudah dipotong' },
    { value: 'WOOD_PLYWOOD_5MM', label: 'Plywood 5mm', priceNote: '~Rp 255/cm²', description: 'Kayu lapis, kuat, untuk furniture' },
    { value: 'STAINLESS_1MM', label: 'Stainless 1mm', priceNote: '~Rp 850/cm²', description: 'Logam tahan karat, untuk part presisi' },
  ],
};

// Manufacturing type labels
const MANUFACTURING_LABELS = {
  '3D_PRINTING': 'Cetak 3D (FDM)',
  'CNC_MACHINING': 'CNC Machining',
  'LASER_CUTTING': 'Laser Cutting',
};

// Status labels and colors
const STATUS_CONFIG = {
  PENDING: { label: 'Menunggu', color: 'warning' },
  ACCEPTED: { label: 'Diterima', color: 'success' },
  REJECTED: { label: 'Ditolak', color: 'error' },
  EXPIRED: { label: 'Kadaluarsa', color: 'default' },
};

const QuoteGenerator = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  
  const [file, setFile] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const [settings, setSettings] = useState({
    material: 'PLA',
    quantity: 1,
    layer_height: 0.2,
    infill_percentage: 20,
    support_material: false,
    complexity: 'MEDIUM', // For CNC
    thickness: 3, // For laser cutting
  });

  // Load file data when component mounts or fileId changes
  useEffect(() => {
    if (fileId) {
      loadFile();
    }
  }, [fileId]);

  const loadFile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fileAPI.getById(fileId);
      setFile(response.data);
      
      // Auto-select appropriate material based on manufacturing type
      const type = response.data.manufacturing_type;
      if (type === 'CNC_MACHINING' && settings.material === 'PLA') {
        setSettings(prev => ({ ...prev, material: 'ALUMINUM' }));
      } else if (type === 'LASER_CUTTING' && settings.material === 'PLA') {
        setSettings(prev => ({ ...prev, material: 'ACRYLIC_3MM' }));
      }
    } catch (err) {
      console.error('Failed to load file:', err);
      setError('Gagal memuat file. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [fileId, settings.material]);

  const handleSettingChange = (name, value) => {
    setSettings(prev => ({ ...prev, [name]: value }));
    // Clear quote when settings change to force regeneration
    if (quote) setQuote(null);
  };

  const generateQuote = async () => {
    if (!file?.is_valid) {
      setError('File tidak valid atau analisis gagal. Silakan upload file lain.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Prepare quote request data
      const quoteData = {
        material: settings.material,
        quantity: parseInt(settings.quantity) || 1,
        layer_height: parseFloat(settings.layer_height) || 0.2,
        infill_percentage: parseInt(settings.infill_percentage) || 20,
        support_material: Boolean(settings.support_material),
        complexity: settings.complexity || 'MEDIUM',
        thickness: parseInt(settings.thickness) || 3,
      };
      
      const response = await fileAPI.generateQuote(fileId, quoteData);
      setQuote(response.data);
      setSuccessMessage('Penawaran harga berhasil dihitung!');
      
    } catch (err) {
      console.error('Quote generation failed:', err);
      
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.detail || 
                      err.response?.data?.message ||
                      'Gagal menghitung penawaran. Silakan periksa pengaturan dan coba lagi.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const acceptQuote = async () => {
    if (!quote) return;
    
    setLoading(true);
    try {
      await quoteAPI.accept(quote.id);
      setSuccessMessage('Penawaran diterima! Pesanan Anda sedang diproses.');
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Failed to accept quote:', err);
      setError('Gagal menerima penawaran. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const rejectQuote = async () => {
    if (!quote) return;
    
    try {
      await quoteAPI.reject(quote.id);
      setQuote(null);
      setSuccessMessage('Penawaran ditolak. Anda dapat mengubah pengaturan dan menghitung ulang.');
    } catch (err) {
      console.error('Failed to reject quote:', err);
      setError('Gagal menolak penawaran.');
    }
  };

  const getMaterialOptions = () => {
    const type = file?.manufacturing_type || '3D_PRINTING';
    return MATERIALS[type] || MATERIALS['3D_PRINTING'];
  };

  const getManufacturingLabel = () => {
    return MANUFACTURING_LABELS[file?.manufacturing_type] || 'Cetak 3D';
  };

  // Show loading state
  if (loading && !file) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Memuat file...</Typography>
      </Container>
    );
  }

  // Show error if file not found
  if (error && !file) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/upload')}>
          Kembali ke Upload
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {getManufacturingLabel()}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              File: {file?.original_filename}
            </Typography>
          </Box>
          <Chip 
            label={file?.is_valid ? '✓ Valid' : '✗ Invalid'} 
            color={file?.is_valid ? 'success' : 'error'}
            size="medium"
          />
        </Box>

        {/* Alerts */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ mb: 2 }} 
            icon={<CheckCircleIcon />}
            onClose={() => setSuccessMessage(null)}
          >
            {successMessage}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Left Column: 3D Preview & File Info */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Preview 3D
              </Typography>
              
              <ThreeDViewer fileUrl={file?.file_url} />
              
              {/* File Analysis Results */}
              {file?.is_valid && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Hasil Analisis File:
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Volume
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {file.volume?.toFixed(2)} cm³
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Estimasi Berat
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {file.weight?.toFixed(1)} gram
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12}>
                      <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                        <Typography variant="caption" color="textSecondary" display="block">
                          Dimensi (P × L × T)
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          {file.bounding_box_x?.toFixed(1)} × {file.bounding_box_y?.toFixed(1)} × {file.bounding_box_z?.toFixed(1)} mm
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              {/* Validation Errors */}
              {!file?.is_valid && file?.validation_errors && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Masalah pada file:
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {file.validation_errors}
                  </Typography>
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* Right Column: Settings & Quote */}
          <Grid item xs={12} md={6}>
            {/* Print Settings Card */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Pengaturan Pemesanan
              </Typography>

              {/* Material Selection */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Material
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={settings.material}
                  onChange={(e) => handleSettingChange('material', e.target.value)}
                  SelectProps={{ native: true }}
                  sx={{ mb: 1 }}
                >
                  {getMaterialOptions().map((mat) => (
                    <option key={mat.value} value={mat.value}>
                      {mat.label}
                    </option>
                  ))}
                </TextField>
                <Typography variant="caption" color="textSecondary">
                  {getMaterialOptions().find(m => m.value === settings.material)?.description}
                </Typography>
              </Box>

              {/* Quantity */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Jumlah Unit
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={settings.quantity}
                  onChange={(e) => handleSettingChange('quantity', parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1, max: 1000 }}
                  slotProps={{
                    htmlInput: {
                      style: { textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }
                    }
                  }}
                />
                {settings.quantity >= 5 && (
                  <Chip 
                    label={`Diskon ${settings.quantity >= 10 ? '15%' : '10%'}`} 
                    color="success" 
                    size="small" 
                    sx={{ mt: 1 }} 
                  />
                )}
              </Box>

              {/* 3D Printing Specific Settings */}
              {file?.manufacturing_type === '3D_PRINTING' && (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Tinggi Layer
                      </Typography>
                      <Typography variant="body2" color="primary" fontWeight="bold">
                        {settings.layer_height} mm
                      </Typography>
                    </Box>
                    <Slider
                      value={settings.layer_height}
                      onChange={(e, value) => handleSettingChange('layer_height', value)}
                      step={0.05}
                      min={0.1}
                      max={0.4}
                      valueLabelDisplay="auto"
                      marks={[
                        { value: 0.1, label: '0.1mm (Halus)' },
                        { value: 0.2, label: '0.2mm (Standar)' },
                        { value: 0.3, label: '0.3mm (Cepat)' },
                        { value: 0.4, label: '0.4mm (Draft)' },
                      ]}
                    />
                    <Typography variant="caption" color="textSecondary">
                      Layer lebih kecil = hasil lebih halus, waktu cetak lebih lama
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Infill (Kepadatan Isi)
                      </Typography>
                      <Typography variant="body2" color="primary" fontWeight="bold">
                        {settings.infill_percentage}%
                      </Typography>
                    </Box>
                    <Slider
                      value={settings.infill_percentage}
                      onChange={(e, value) => handleSettingChange('infill_percentage', value)}
                      step={5}
                      min={0}
                      max={100}
                      valueLabelDisplay="auto"
                      marks={[
                        { value: 0, label: '0%' },
                        { value: 20, label: '20% (Standar)' },
                        { value: 50, label: '50%' },
                        { value: 100, label: '100% (Padat)' },
                      ]}
                    />
                    <Typography variant="caption" color="textSecondary">
                      Infill lebih tinggi = lebih kuat, lebih berat, lebih mahal
                    </Typography>
                  </Box>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={settings.support_material}
                        onChange={(e) => handleSettingChange('support_material', e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          Butuh Material Support?
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Diperlukan untuk overhang 45°. Menambah biaya & waktu.
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 2 }}
                  />
                </>
              )}

              {/* CNC Specific Settings */}
              {file?.manufacturing_type === 'CNC_MACHINING' && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Tingkat Kompleksitas
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    value={settings.complexity}
                    onChange={(e) => handleSettingChange('complexity', e.target.value)}
                    SelectProps={{ native: true }}
                  >
                    <option value="SIMPLE">Sederhana (2.5 axis)</option>
                    <option value="MEDIUM">Menengah (3 axis)</option>
                    <option value="COMPLEX">Kompleks (4-5 axis)</option>
                    <option value="VERY_COMPLEX">Sangat Kompleks (Multi-setup)</option>
                  </TextField>
                </Box>
              )}

              {/* Laser Cutting Specific Settings */}
              {file?.manufacturing_type === 'LASER_CUTTING' && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Ketebalan Material
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    value={settings.thickness}
                    onChange={(e) => handleSettingChange('thickness', parseInt(e.target.value))}
                    SelectProps={{ native: true }}
                  >
                    <option value={1}>1 mm</option>
                    <option value={2}>2 mm</option>
                    <option value={3}>3 mm</option>
                    <option value={5}>5 mm</option>
                    <option value={10}>10 mm</option>
                  </TextField>
                </Box>
              )}

              {/* Generate Quote Button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={generateQuote}
                disabled={loading || !file?.is_valid}
                sx={{ 
                  mt: 2, 
                  py: 1.5, 
                  fontSize: '1.1rem',
                  bgcolor: '#1976d2',
                  '&:hover': { bgcolor: '#1565c0' }
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    Menghitung...
                  </Box>
                ) : (
                  'Hitung Penawaran Harga'
                )}
              </Button>
            </Paper>

            {/* Quote Display Card */}
            {quote && (
              <Card 
                sx={{ 
                  borderRadius: 2, 
                  border: '3px solid #4CAF50',
                  bgcolor: '#f1f8e9',
                  boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Quote Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      ✓ Penawaran Harga
                    </Typography>
                    <Chip 
                      label={quote.quote_number} 
                      size="small"
                      sx={{ bgcolor: 'white', fontWeight: 'bold' }}
                    />
                  </Box>

                  {/* Total Price - Large Display */}
                  <Box sx={{ textAlign: 'center', py: 2, bgcolor: 'white', borderRadius: 2, mb: 2 }}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      TOTAL HARGA
                    </Typography>
                    <Typography 
                      variant="h2" 
                      color="primary" 
                      fontWeight="bold"
                      sx={{ 
                        fontSize: { xs: '2rem', sm: '2.5rem' },
                        lineHeight: 1.2 
                      }}
                    >
                      {formatIDR(quote.total_price)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      untuk {quote.quantity} unit • Harga sudah termasuk PPN
                    </Typography>
                  </Box>

                  {/* Price Breakdown */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Rincian Biaya:
                    </Typography>
                    
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'white' }}>
                      <Grid container spacing={1}>
                        {/* Material Cost */}
                        <Grid item xs={6}>
                          <Typography variant="body2">Biaya Material:</Typography>
                        </Grid>
                        <Grid item xs={6} textAlign="right">
                          <Typography variant="body2" fontWeight="medium">
                            {formatIDR(quote.price_breakdown?.material_cost)}
                          </Typography>
                        </Grid>
                        
                        {/* Machine Cost */}
                        <Grid item xs={6}>
                          <Typography variant="body2">Biaya Mesin:</Typography>
                        </Grid>
                        <Grid item xs={6} textAlign="right">
                          <Typography variant="body2" fontWeight="medium">
                            {formatIDR(quote.price_breakdown?.machine_cost)}
                          </Typography>
                        </Grid>
                        
                        {/* Setup Fee */}
                        <Grid item xs={6}>
                          <Typography variant="body2">Biaya Setup:</Typography>
                        </Grid>
                        <Grid item xs={6} textAlign="right">
                          <Typography variant="body2" fontWeight="medium">
                            {formatIDR(quote.price_breakdown?.setup_fee)}
                          </Typography>
                        </Grid>

                        {/* Print/Machining Time */}
                        {(quote.price_breakdown?.print_time_hours || quote.price_breakdown?.machining_time_hours) && (
                          <>
                            <Grid item xs={6}>
                              <Typography variant="body2">Estimasi Waktu:</Typography>
                            </Grid>
                            <Grid item xs={6} textAlign="right">
                              <Typography variant="body2">
                                {quote.price_breakdown?.print_time_hours || quote.price_breakdown?.machining_time_hours} jam
                              </Typography>
                            </Grid>
                          </>
                        )}

                        {/* Quantity Discount */}
                        {quote.price_breakdown?.quantity_discount && quote.price_breakdown.quantity_discount !== '0%' && (
                          <>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="success.main">Diskon Quantity:</Typography>
                            </Grid>
                            <Grid item xs={6} textAlign="right">
                              <Typography variant="body2" color="success.main" fontWeight="bold">
                                -{quote.price_breakdown.quantity_discount}
                              </Typography>
                            </Grid>
                          </>
                        )}

                        {/* Complexity Multiplier */}
                        {quote.price_breakdown?.complexity_multiplier > 1 && (
                          <>
                            <Grid item xs={6}>
                              <Typography variant="body2">Faktor Kompleksitas:</Typography>
                            </Grid>
                            <Grid item xs={6} textAlign="right">
                              <Typography variant="body2">
                                ×{quote.price_breakdown.complexity_multiplier}
                              </Typography>
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </Paper>
                  </Box>

                  {/* Validity Notice */}
                  <Alert 
                    severity="info" 
                    icon={<InfoIcon />}
                    sx={{ mb: 2, bgcolor: 'white' }}
                  >
                    <Typography variant="body2">
                      <strong>Penawaran ini berlaku hingga:</strong>{' '}
                      {new Date(quote.valid_until).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Typography>
                  </Alert>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      size="large"
                      onClick={acceptQuote}
                      disabled={loading}
                      startIcon={<CheckCircleIcon />}
                      sx={{ 
                        py: 1.5, 
                        fontSize: '1rem',
                        bgcolor: '#4CAF50',
                        '&:hover': { bgcolor: '#43a047' }
                      }}
                    >
                      {loading ? 'Memproses...' : 'Terima & Pesan Sekarang'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={rejectQuote}
                      disabled={loading}
                      sx={{ py: 1.5 }}
                    >
                      Tolak
                    </Button>
                  </Box>

                  {/* Additional Info */}
                  <Typography variant="caption" color="textSecondary" display="block" align="center" sx={{ mt: 2 }}>
                    <Tooltip title="Termasuk material, pengerjaan, QC, dan packing standar">
                      <InfoIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                    </Tooltip>
                    Harga sudah termasuk QC & packing standar. Ongkir dihitung terpisah.
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* No Quote Yet - Info Card */}
            {!quote && file?.is_valid && (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  bgcolor: '#fff3e0',
                  border: '2px dashed #ff9800'
                }}
              >
                <InfoIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
                <Typography variant="body1" fontWeight="medium">
                  Atur pengaturan di atas, lalu klik "Hitung Penawaran Harga"
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  💡 Tips: Pilih material yang sesuai dengan kebutuhan produk Anda
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>

        {/* Footer Info */}
        <Paper 
          variant="outlined" 
          sx={{ 
            mt: 4, 
            p: 2, 
            bgcolor: '#f5f5f5',
            textAlign: 'center'
          }}
        >
          <Typography variant="caption" color="textSecondary">
            <strong>Butuh bantuan?</strong> Hubungi kami via WhatsApp: 
            <a href="https://wa.me/6281234567890" style={{ color: '#25D366', textDecoration: 'none', marginLeft: 4 }}>
              +62 812-3456-7890
            </a>
            {' '}•{' '}
            Email: <a href="mailto:support@manufacturing.id" style={{ color: '#1976d2' }}>support@manufacturing.id</a>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default QuoteGenerator;