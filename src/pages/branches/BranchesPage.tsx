import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  LocationOn,
  Business,
  TrendingUp,
  People,
} from '@mui/icons-material';
import axios from 'axios';

// Import your GIS Map component
import BranchGISMap from '../../components/BranchGISMap';

interface Branch {
  id: string;
  name: string;
  city: string;
  region: string;
  loans: number;
  customers: number;
  performance: string;
  coordinates: { lat: number; lng: number };
}

const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await axios.get('/api/branches');
        setBranches(response.data.branches || []);
        setStats(response.data.stats || {});
      } catch (error) {
        console.error('Error fetching branches:', error);
        // Demo data
        setBranches([
          { id: '1', name: 'Douala Central', city: 'Douala', region: 'Littoral', loans: 850000000, customers: 12500, performance: 'A+', coordinates: { lat: 4.0511, lng: 9.7679 } },
          { id: '2', name: 'Yaoundé Omnisport', city: 'Yaoundé', region: 'Centre', loans: 720000000, customers: 10800, performance: 'A', coordinates: { lat: 3.8480, lng: 11.5021 } },
          { id: '3', name: 'Bafoussam Main', city: 'Bafoussam', region: 'West', loans: 450000000, customers: 7200, performance: 'B+', coordinates: { lat: 5.4800, lng: 10.4200 } },
        ]);
        setStats({ totalBranches: 45, totalLoans: '12.5B', totalCustomers: 245000 });
      }
    };

    fetchBranches();
  }, []);

  const filteredBranches = selectedRegion === 'all' 
    ? branches 
    : branches.filter(b => b.region === selectedRegion);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#00ff88', mb: 3 }}>
        Branch Intelligence Map
      </Typography>

      <Grid container spacing={3}>
        {/* GIS Map */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.3)', minHeight: 600 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#00ff88' }}>
                Geographic Distribution
              </Typography>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Region</InputLabel>
                <Select
                  value={selectedRegion}
                  label="Region"
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <MenuItem value="all">All Regions</MenuItem>
                  <MenuItem value="Littoral">Littoral</MenuItem>
                  <MenuItem value="Centre">Centre</MenuItem>
                  <MenuItem value="West">West</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ height: 500 }}>
              <BranchGISMap branches={filteredBranches} />
            </Box>
          </Paper>
        </Grid>

        {/* Branch Performance */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,136,0.2)' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">Total Branches</Typography>
                  <Typography variant="h4">{stats.totalBranches || 45}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Chip icon={<People />} label={`${stats.totalCustomers || 245000} Customers`} />
                    <Chip icon={<TrendingUp />} label={`${stats.totalLoans || '12.5B'} FCFA`} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.3)', maxHeight: 450, overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#00ff88' }}>
                  Branch Performance
                </Typography>
                {filteredBranches.map((branch) => (
                  <Box key={branch.id} sx={{ mb: 2, p: 1, borderBottom: '1px solid rgba(0,255,136,0.1)' }}>
                    <Typography variant="subtitle1">{branch.name}</Typography>
                    <Typography variant="caption" display="block">{branch.city}</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <Chip size="small" label={`${(branch.loans / 1000000).toFixed(0)}M FCFA`} />
                      <Chip size="small" label={`Rating: ${branch.performance}`} sx={{ bgcolor: '#00ff88', color: '#040F0A' }} />
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BranchesPage;
