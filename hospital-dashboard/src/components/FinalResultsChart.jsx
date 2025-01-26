import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const FinalResultsChart = () => {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/analysis/final-results');
      setData(response.data);
      // Set initial subcategory
      if (response.data.groupedData && Object.keys(response.data.groupedData).length > 0) {
        setSelectedSubcategory(Object.keys(response.data.groupedData)[0]);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching final results:', error);
      setError('Failed to load final results data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }

  if (!data || !selectedSubcategory) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="textSecondary" variant="h6">No data available</Typography>
      </Box>
    );
  }

  const subcategoryData = data.groupedData[selectedSubcategory];
  const stats = data.statistics[selectedSubcategory];

  const chartData = {
    labels: subcategoryData.map(item => item.ethnicity),
    datasets: [
      {
        label: 'Before Implementation',
        data: subcategoryData.map(item => item.before),
        backgroundColor: theme.palette.error.main,
        borderColor: theme.palette.error.dark,
        borderWidth: 1
      },
      {
        label: 'After Implementation',
        data: subcategoryData.map(item => item.after),
        backgroundColor: theme.palette.success.main,
        borderColor: theme.palette.success.dark,
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: { size: 12 },
          color: theme.palette.text.primary
        }
      },
      title: {
        display: true,
        text: `${selectedSubcategory} - Cases Reduced by ${stats.improvement}%`,
        align: 'start',
        color: theme.palette.text.primary,
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 30 }
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        bodyFont: { size: 12 },
        titleFont: { size: 13, weight: 'bold' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.divider,
          drawBorder: false
        },
        ticks: {
          font: { size: 11 },
          color: theme.palette.text.secondary
        },
        title: {
          display: true,
          text: 'Number of Cases',
          color: theme.palette.text.secondary,
          font: { size: 12 }
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11 },
          color: theme.palette.text.secondary
        }
      }
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5">
            Implementation Impact Analysis
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Select Category</InputLabel>
            <Select
              value={selectedSubcategory}
              label="Select Category"
              onChange={(e) => setSelectedSubcategory(e.target.value)}
            >
              {Object.keys(data.groupedData).map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2, bgcolor: theme.palette.error.lighter }}>
            <CardContent>
              <Typography variant="h6" color="error" gutterBottom>
                Before Implementation
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Total Cases: <Typography component="span" variant="body1" color="error.main" fontWeight="medium">
                    {stats.totalBefore}
                  </Typography>
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2, bgcolor: theme.palette.success.lighter }}>
            <CardContent>
              <Typography variant="h6" color="success" gutterBottom>
                After Implementation
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Total Cases: <Typography component="span" variant="body1" color="success.main" fontWeight="medium">
                    {stats.totalAfter}
                  </Typography>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Cases Reduced: <Typography component="span" variant="body1" color="success.main" fontWeight="medium">
                    {stats.totalBefore - stats.totalAfter}
                  </Typography>
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Overall Impact
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Improvement in Case Reduction:
              </Typography>
              <Typography variant="h4" color="success.main" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center' }}>
                {stats.improvement}%
                <Typography component="span" variant="body2" color="success.main" sx={{ ml: 1 }}>
                  reduction in cases
                </Typography>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ 
            height: 400, 
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1
          }}>
            <Bar options={options} data={chartData} />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FinalResultsChart;
