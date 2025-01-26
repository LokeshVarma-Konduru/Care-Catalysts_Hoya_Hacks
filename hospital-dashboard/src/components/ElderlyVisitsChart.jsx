import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ElderlyVisitsChart = () => {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/analysis/elderly-visits');
      setData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching elderly visits data:', error);
      setError('Failed to load elderly visits data');
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

  if (!data) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="textSecondary" variant="h6">No data available</Typography>
      </Box>
    );
  }

  const chartData = {
    labels: data.visits.map(v => v.Month),
    datasets: [
      {
        label: 'Before Implementation',
        data: data.visits.map(v => v.Elderly_Visits_Before),
        borderColor: theme.palette.error.main,
        backgroundColor: theme.palette.error.light,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'After Implementation',
        data: data.visits.map(v => v.Elderly_Visits_After),
        borderColor: theme.palette.success.main,
        backgroundColor: theme.palette.success.light,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
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
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Elderly Visits Trend Analysis',
        align: 'start',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 30
        }
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
          text: 'Number of Visits',
          color: theme.palette.text.secondary,
          font: { size: 12 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 11 },
          color: theme.palette.text.secondary
        }
      }
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Elderly Visits Analysis
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2, bgcolor: theme.palette.error.lighter }}>
            <CardContent>
              <Typography variant="h6" color="error" gutterBottom>
                Before Implementation
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Average Visits: <Typography component="span" variant="body1" color="error.main" fontWeight="medium">
                    {data.stats.avgBefore.toFixed(2)}
                  </Typography>
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Total Visits: <Typography component="span" variant="body1" color="error.main" fontWeight="medium">
                    {data.stats.totalBefore}
                  </Typography>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Highest in a Month: <Typography component="span" variant="body1" color="error.main" fontWeight="medium">
                    {data.stats.highestBefore}
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
                  Average Visits: <Typography component="span" variant="body1" color="success.main" fontWeight="medium">
                    {data.stats.avgAfter.toFixed(2)}
                  </Typography>
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Total Visits: <Typography component="span" variant="body1" color="success.main" fontWeight="medium">
                    {data.stats.totalAfter}
                  </Typography>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Highest in a Month: <Typography component="span" variant="body1" color="success.main" fontWeight="medium">
                    {data.stats.highestAfter}
                  </Typography>
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Change Analysis
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Overall Change in Visits:
              </Typography>
              <Typography variant="h4" color={data.stats.improvement > 0 ? "success.main" : "error.main"} fontWeight="medium">
                {data.stats.improvement}%
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
            <Line options={options} data={chartData} />
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ElderlyVisitsChart;
