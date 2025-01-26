import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  useTheme
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

const SentimentAnalysisChart = () => {
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
      const response = await axios.get('http://localhost:5000/api/analysis/sentiment-comparison');
      setData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
      setError('Failed to load sentiment data. Please try again later.');
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

  if (!data || !data.before || !data.after) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="textSecondary" variant="h6">No sentiment data available.</Typography>
      </Box>
    );
  }

  const sentimentOrder = ['Positive', 'Neutral', 'Negative'];
  const getSortedData = (sentiments) => {
    return sentimentOrder.map(sentiment => {
      const found = sentiments.find(s => s._id === sentiment);
      return found ? found.count : 0;
    });
  };

  const chartData = {
    labels: sentimentOrder,
    datasets: [
      {
        label: 'Before Implementation',
        data: getSortedData(data.before.sentiments),
        backgroundColor: theme.palette.error.light,
        borderColor: theme.palette.error.main,
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 30
      },
      {
        label: 'After Implementation',
        data: getSortedData(data.after.sentiments),
        backgroundColor: theme.palette.success.light,
        borderColor: theme.palette.success.main,
        borderWidth: 1,
        borderRadius: 4,
        barThickness: 30
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
          },
          color: theme.palette.text.primary
        }
      },
      title: {
        display: true,
        text: 'Sentiment Distribution',
        align: 'start',
        color: theme.palette.text.primary,
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
        bodyFont: {
          size: 12
        },
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' reviews';
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.divider,
          drawBorder: false
        },
        border: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: theme.palette.text.secondary,
          padding: 8
        },
        title: {
          display: true,
          text: 'Number of Reviews',
          color: theme.palette.text.secondary,
          font: {
            size: 12
          },
          padding: { top: 10, bottom: 0 }
        }
      },
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            weight: '500'
          },
          color: theme.palette.text.primary,
          padding: 8
        }
      }
    },
    layout: {
      padding: {
        top: 0,
        right: 16,
        bottom: 0,
        left: 0
      }
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Sentiment Analysis Results
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
                  Average Rating: <Typography component="span" variant="body1" color="error.main" fontWeight="medium">
                    {data.before.stats.averageRating.toFixed(2)}
                  </Typography>
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Average Sentiment: <Typography component="span" variant="body1" color="error.main" fontWeight="medium">
                    {data.before.stats.averagePolarity.toFixed(2)}
                  </Typography>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Reviews: <Typography component="span" variant="body1" color="error.main" fontWeight="medium">
                    {data.before.stats.totalCount}
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
                  Average Rating: <Typography component="span" variant="body1" color="success.main" fontWeight="medium">
                    {data.after.stats.averageRating.toFixed(2)}
                  </Typography>
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  Average Sentiment: <Typography component="span" variant="body1" color="success.main" fontWeight="medium">
                    {data.after.stats.averagePolarity.toFixed(2)}
                  </Typography>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total Reviews: <Typography component="span" variant="body1" color="success.main" fontWeight="medium">
                    {data.after.stats.totalCount}
                  </Typography>
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Key Improvements
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>Rating Change</Typography>
                  <Typography variant="h6" color="primary" fontWeight="medium">
                    {data.improvements.rating}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>Sentiment Change</Typography>
                  <Typography variant="h6" color="primary" fontWeight="medium">
                    {data.improvements.polarity}%
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box sx={{ 
            height: 400, 
            mt: 2,
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

export default SentimentAnalysisChart;
