import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Paper, Grid, Card, CardContent,
  Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Switch, FormControlLabel, IconButton, Chip, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Build as BuildIcon
} from '@mui/icons-material';

const PricingTools = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [technologies, setTechnologies] = useState([
    {
      id: 1,
      name: 'SLA',
      technology: '3D Printing',
      pricingModel: 'Equation based',
      minOrder: 20000,
      machines: 1,
      status: 'active'
    },
    {
      id: 2,
      name: 'FDM',
      technology: '3D Printing',
      pricingModel: 'Equation based',
      minOrder: 10000,
      machines: 2,
      status: 'active'
    }
  ]);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Pricing configuration tool
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Configure intelligent pricing models for your manufacturing services
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
            <Tab label="Pricing Models" icon={<SettingsIcon />} iconPosition="start" />
            <Tab label="Leadtime & Post Processing" icon={<BuildIcon />} iconPosition="start" />
            <Tab label="Promotions" icon={<BuildIcon />} iconPosition="start" />
          </Tabs>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="secondary">
              Need help choosing a pricing model?
            </Button>
            <Button variant="contained">
              Implement on your website
            </Button>
          </Box>
        </Box>

        {/* Technology Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2 }}>
            <Tabs value={0}>
              <Tab label="3D printing" />
              <Tab label="CNC machining" />
              <Tab label="Sheet metal" />
            </Tabs>
          </Box>
          
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" startIcon={<AddIcon />}>
                Add technology
              </Button>
              <Button variant="outlined" startIcon={<EditIcon />}>
                Edit Machines
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton color="primary">
                <SettingsIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>

        {/* Pricing Table */}
        <Paper>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: 12, textAlign: 'left' }}>TECHNOLOGY</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>PRICING MODEL</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>MIN ORDER</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>MACHINES</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>STATUS</th>
                  <th style={{ padding: 12, textAlign: 'left' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {technologies.map((tech) => (
                  <tr key={tech.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: 12 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton size="small">⋮⋮</IconButton>
                        <Typography variant="body2" fontWeight="medium">{tech.name}</Typography>
                      </Box>
                    </td>
                    <td style={{ padding: 12 }}>
                      <Chip 
                        label={tech.pricingModel} 
                        size="small" 
                        sx={{ bgcolor: 'primary.light', color: 'primary.main' }}
                      />
                    </td>
                    <td style={{ padding: 12 }}>
                      <Typography variant="body2">IDR {tech.minOrder.toLocaleString('id-ID')}</Typography>
                    </td>
                    <td style={{ padding: 12 }}>
                      <Typography variant="body2">{tech.machines}</Typography>
                    </td>
                    <td style={{ padding: 12 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Switch 
                          checked={tech.status === 'active'} 
                          size="small"
                          onChange={() => {
                            const updated = technologies.map(t => 
                              t.id === tech.id 
                                ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' }
                                : t
                            );
                            setTechnologies(updated);
                          }}
                        />
                        <Chip label="Internal" size="small" />
                      </Box>
                    </td>
                    <td style={{ padding: 12 }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button size="small" variant="outlined" startIcon={<SettingsIcon />}>
                          Configure
                        </Button>
                        <IconButton size="small" color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default PricingTools;