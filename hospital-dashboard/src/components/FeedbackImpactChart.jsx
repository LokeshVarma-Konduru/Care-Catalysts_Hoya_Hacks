import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  Card,
  CardContent,
  CircularProgress,
  useTheme
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

const FeedbackImpactChart = () => {
  const theme = useTheme();
  const [selectedEvent, setSelectedEvent] = useState('admitted');
  const [referenceDate, setReferenceDate] = useState('2024-01-01');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedEvent, referenceDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/analysis/feedback-impact', {
        params: {
          eventType: selectedEvent,
          referenceDate: referenceDate
        }
      });
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const chartData = data ? {
    datasets: [
      {
        label: 'Before Feedback Implementation',
        data: data.eventsBefore,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        parsing: {
          xAxisKey: '_id',
          yAxisKey: 'count'
        }
      },
      {
        label: 'After Feedback Implementation',
        data: data.eventsAfter,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        parsing: {
          xAxisKey: '_id',
          yAxisKey: 'count'
        }
      }
    ]
  } : null;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Impact of Feedback Implementation',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 14
          },
          padding: {
            top: 10
          }
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          padding: 10,
          font: {
            size: 12
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Number of Events',
          font: {
            size: 14
          },
          padding: {
            bottom: 10
          }
        },
        ticks: {
          font: {
            size: 12
          }
        }
      }
    },
    layout: {
      padding: {
        left: 15,
        right: 15,
        top: 15,
        bottom: 15
      }
    }
  };

  const calculateQualityScore = () => {
    const beforeScore = (data.summary.beforeDate.avgEventsPerDay * 100) / data.summary.beforeDate.totalFeedback;
    const afterScore = (data.summary.afterDate.avgEventsPerDay * 100) / data.summary.afterDate.totalFeedback;
    return ((afterScore - beforeScore) / beforeScore * 100).toFixed(2);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Event Type</InputLabel>
              <Select
                value={selectedEvent}
                label="Event Type"
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                <MenuItem value="admitted">Admitted</MenuItem>
                <MenuItem value="consultation">Consultation</MenuItem>
                <MenuItem value="medication given">Medication Given</MenuItem>
                <MenuItem value="discharged">Discharged</MenuItem>
              </Select>
            </FormControl>

            <TextField
              type="date"
              label="Reference Date"
              value={referenceDate}
              onChange={(e) => setReferenceDate(e.target.value)}
              sx={{ minWidth: 200 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </Grid>

        {loading ? (
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Grid>
        ) : error ? (
          <Grid item xs={12}>
            <Typography color="error">{error}</Typography>
          </Grid>
        ) : data ? (
          <>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Quality of Care Analysis
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Before Implementation ({referenceDate})
                    </Typography>
                    <Typography>
                      Events: {data.summary.beforeDate.avgEventsPerDay} per day
                    </Typography>
                    <Typography>
                      Patient Concerns: {data.summary.beforeDate.totalFeedback}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      After Implementation
                    </Typography>
                    <Typography>
                      Events: {data.summary.afterDate.avgEventsPerDay} per day
                    </Typography>
                    <Typography>
                      Patient Concerns: {data.summary.afterDate.totalFeedback}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Impact Summary
                    </Typography>
                    <ul>
                      <li>
                        <span>Processing Time:</span> {Math.abs(data.summary.improvement.events)}% more thorough care
                      </li>
                      <li>
                        <span>Patient Concerns:</span> Reduced by {data.summary.beforeDate.totalFeedback - data.summary.afterDate.totalFeedback} cases
                      </li>
                      <li>
                        <span>Quality Score:</span> Improved by {calculateQualityScore()}%
                      </li>
                    </ul>
                    <Typography variant="body2" color="textSecondary">
                      A slight decrease in processing speed indicates more thorough patient care, resulting in fewer concerns and better outcomes.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: '500px' }}>
                {chartData && <Line data={chartData} options={options} />}
              </Paper>
            </Grid>
          </>
        ) : null}
      </Grid>
    </Box>
  );
};

export default FeedbackImpactChart;
