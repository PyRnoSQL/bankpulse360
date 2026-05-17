import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Slider,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  TrendingDown,
  TrendingUp,
  Warning,
  Timeline,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface StressTestProps {
  onScenarioChange?: (scenario: any) => void;
}

const StressTestSlider: React.FC<StressTestProps> = ({ onScenarioChange }) => {
  const [stressLevel, setStressLevel] = useState<number>(0);
  const [selectedScenario, setSelectedScenario] = useState<string>('drought');

  const scenarios = {
    drought: {
      name: 'Drought Conditions',
      baseNPL: 5.8,
      stressedNPL: (level: number) => 5.8 + (level / 100) * 12.6,
      impact: 'Agricultural loans at risk',
      color: '#ff4444',
    },
    recession: {
      name: 'Economic Recession',
      baseNPL: 5.8,
      stressedNPL: (level: number) => 5.8 + (level / 100) * 15.2,
      impact: 'SME and consumer credit impact',
      color: '#ff8800',
    },
    currency: {
      name: 'Currency Volatility',
      baseNPL: 5.8,
      stressedNPL: (level: number) => 5.8 + (level / 100) * 8.5,
      impact: 'Import/export sector stress',
      color: '#ffaa00',
    },
  };

  const currentScenario = scenarios[selectedScenario as keyof typeof scenarios];
  const currentNPL = currentScenario.stressedNPL(stressLevel);

  // Generate projection data
  const generateProjection = () => {
    const data = [];
    for (let i = 0; i <= 12; i++) {
      data.push({
        month: `M${i}`,
        baseline: currentScenario.baseNPL,
        stressed: currentScenario.baseNPL + (currentNPL - currentScenario.baseNPL) * (i / 12),
      });
    }
    return data;
  };

  const handleStressChange = (_event: Event, newValue: number | number[]) => {
    const value = newValue as number;
    setStressLevel(value);
    onScenarioChange?.({
      scenario: selectedScenario,
      stressLevel: value,
      projectedNPL: currentScenario.stressedNPL(value),
    });
  };

  const getRiskLevel = () => {
    if (currentNPL < 8) return { text: 'Low Risk', color: '#00ff88' };
    if (currentNPL < 12) return { text: 'Moderate Risk', color: '#ffaa00' };
    if (currentNPL < 16) return { text: 'High Risk', color: '#ff6600' };
    return { text: 'Critical Risk', color: '#ff4444' };
  };

  const riskLevel = getRiskLevel();

  return (
    <Paper sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,255,136,0.2)' }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#00ff88', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Timeline /> Macroeconomic Stress Test Simulator
      </Typography>

      <Grid container spacing={3}>
        {/* Scenario Selection */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {Object.entries(scenarios).map(([key, scenario]) => (
              <Chip
                key={key}
                label={scenario.name}
                onClick={() => setSelectedScenario(key)}
                sx={{
                  bgcolor: selectedScenario === key ? scenario.color : 'rgba(255,255,255,0.1)',
                  color: selectedScenario === key ? '#040F0A' : 'white',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 },
                }}
              />
            ))}
          </Box>
        </Grid>

        {/* Stress Level Slider */}
        <Grid item xs={12}>
          <Typography gutterBottom>Stress Intensity: {stressLevel}%</Typography>
          <Slider
            value={stressLevel}
            onChange={handleStressChange}
            aria-labelledby="stress-slider"
            valueLabelDisplay="auto"
            step={1}
            marks={[
              { value: 0, label: 'Normal' },
              { value: 25, label: 'Mild' },
              { value: 50, label: 'Moderate' },
              { value: 75, label: 'Severe' },
              { value: 100, label: 'Extreme' },
            ]}
            sx={{
              color: currentScenario.color,
              '& .MuiSlider-markLabel': { color: 'white' },
            }}
          />
        </Grid>

        {/* Impact Metrics */}
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'rgba(0,0,0,0.3)' }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">Current NPL Ratio</Typography>
              <Typography variant="h3" sx={{ color: '#00ff88' }}>
                {currentScenario.baseNPL}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: 'rgba(0,0,0,0.3)', border: `2px solid ${riskLevel.color}` }}>
            <CardContent>
              <Typography variant="body2" color="textSecondary">Projected NPL Under Stress</Typography>
              <Typography variant="h3" sx={{ color: riskLevel.color }}>
                {currentNPL.toFixed(1)}%
              </Typography>
              <Chip
                label={riskLevel.text}
                size="small"
                sx={{ mt: 1, bgcolor: riskLevel.color, color: '#040F0A' }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Projection Chart */}
        <Grid item xs={12}>
          <Typography variant="body2" gutterBottom>12-Month NPL Projection</Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={generateProjection()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" stroke="white" />
                <YAxis stroke="white" domain={[0, 25]} />
                <Tooltip
                  contentStyle={{ bgcolor: 'rgba(0,0,0,0.8)', border: '1px solid #00ff88' }}
                />
                <Area
                  type="monotone"
                  dataKey="baseline"
                  stroke="#00ff88"
                  fill="rgba(0, 255, 136, 0.1)"
                  name="Baseline"
                />
                <Area
                  type="monotone"
                  dataKey="stressed"
                  stroke={currentScenario.color}
                  fill={`${currentScenario.color}20`}
                  name="Stressed Scenario"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        {/* Impact Description */}
        <Grid item xs={12}>
          <Alert severity={stressLevel > 50 ? 'warning' : 'info'} sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Scenario Impact:</strong> {currentScenario.impact}
              {stressLevel > 70 && " - Immediate mitigation strategies recommended"}
              {stressLevel > 90 && " - Emergency capital injection may be required"}
            </Typography>
          </Alert>
        </Grid>

        {/* Capital Buffer Recommendation */}
        {stressLevel > 50 && (
          <Grid item xs={12}>
            <LinearProgress
              variant="determinate"
              value={Math.min((currentNPL / 20) * 100, 100)}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': { bgcolor: riskLevel.color },
              }}
            />
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              Recommended Capital Buffer: {Math.ceil((currentNPL - currentScenario.baseNPL) * 2)}% of risk-weighted assets
            </Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default StressTestSlider;
