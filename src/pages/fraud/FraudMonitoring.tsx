import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Warning,
  TrendingUp,
  AccountBalance,
  Timeline,
} from '@mui/icons-material';
import axios from 'axios';

// Import your AML Network Graph component (adjust path as needed)
import AMLNetworkGraph from '../../components/AMLNetworkGraph';

interface FraudAlert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  type: string;
  amount: number;
  customer: string;
  timestamp: string;
}

const FraudMonitoring: React.FC = () => {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch fraud data
    const fetchFraudData = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await axios.get('/api/fraud/alerts');
        setAlerts(response.data.alerts || []);
        setStats(response.data.stats || {});
      } catch (error) {
        console.error('Error fetching fraud data:', error);
        // Demo data
        setAlerts([
          { id: '1', severity: 'high', type: 'Unusual Pattern', amount: 4500000, customer: 'Business Corp', timestamp: new Date().toISOString() },
          { id: '2', severity: 'medium', type: 'Location Anomaly', amount: 2300000, customer: 'Individual Account', timestamp: new Date().toISOString() },
        ]);
        setStats({ totalAlerts: 124, highRisk: 12, suspiciousVolume: '45.2M' });
      } finally {
        setLoading(false);
      }
    };

    fetchFraudData();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#00ff88', mb: 3 }}>
        Fraud Intelligence Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,136,0.2)' }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">Total Alerts</Typography>
              <Typography variant="h4">{stats.totalAlerts || 124}</Typography>
              <Chip size="small" label="+12% vs last month" sx={{ mt: 1, bgcolor: '#ff4444' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,136,0.2)' }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">High Risk</Typography>
              <Typography variant="h4">{stats.highRisk || 12}</Typography>
              <Chip size="small" label="Critical" sx={{ mt: 1, bgcolor: '#ff4444' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,136,0.2)' }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">Suspicious Volume</Typography>
              <Typography variant="h4">{stats.suspiciousVolume || '45.2M'} FCFA</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,136,0.2)' }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">Detection Rate</Typography>
              <Typography variant="h4">94.5%</Typography>
              <Chip size="small" label="+2.1%" sx={{ mt: 1, bgcolor: '#00ff88', color: '#040F0A' }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AML Network Graph */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.3)', minHeight: 500 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#00ff88' }}>
              AML Transaction Network
            </Typography>
            <Box sx={{ height: 450 }}>
              <AMLNetworkGraph data={alerts} />
            </Box>
          </Paper>
        </Grid>

        {/* Alerts List */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.3)', maxHeight: 500, overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#00ff88' }}>
              Recent Alerts
            </Typography>
            {alerts.map((alert) => (
              <Alert
                key={alert.id}
                severity={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'}
                sx={{ mb: 2 }}
              >
                <Typography variant="body2">{alert.type}</Typography>
                <Typography variant="caption">Amount: {alert.amount.toLocaleString()} FCFA</Typography>
              </Alert>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FraudMonitoring;
