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
  Card,
  CardContent,
  CircularProgress,
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

const AdmissionSubcategoryChart = () => {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');

  useEffect(() => {
    fetchData();
  }, [selectedAgeGroup, selectedGender]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedAgeGroup !== 'all') params.ageGroup = selectedAgeGroup;
      if (selectedGender !== 'all') params.gender = selectedGender;

      console.log('Fetching data with params:', params);
      const response = await axios.get('http://localhost:5000/api/analysis/admission-subcategories', { params });
      console.log('Received data:', response.data);
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Error loading data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRandomColor = (index) => {
    const colors = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(199, 199, 199, 0.7)',
      'rgba(83, 102, 255, 0.7)',
      'rgba(40, 159, 64, 0.7)',
      'rgba(210, 199, 199, 0.7)',
    ];
    return colors[index % colors.length];
  };

  const chartData = data ? {
    labels: data.data.map(item => item.admitted_for),
    datasets: data.subcategories.map((subcategory, index) => ({
      label: subcategory,
      data: data.data.map(item => item.subcategories[index]),
      backgroundColor: getRandomColor(index),
      borderColor: getRandomColor(index).replace('0.7', '1'),
      borderWidth: 1,
      borderRadius: 4,
    }))
  } : null;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Issues by Admission Reason and Subcategory',
        font: { size: 16 }
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            return `Admission: ${tooltipItems[0].label}`;
          },
          label: (context) => {
            return `${context.dataset.label}: ${context.formattedValue} issues`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Issues'
        }
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Age Group</InputLabel>
              <Select
                value={selectedAgeGroup}
                label="Age Group"
                onChange={(e) => setSelectedAgeGroup(e.target.value)}
              >
                <MenuItem value="all">All Ages</MenuItem>
                <MenuItem value="0-18">0-18 years</MenuItem>
                <MenuItem value="19-30">19-30 years</MenuItem>
                <MenuItem value="31-45">31-45 years</MenuItem>
                <MenuItem value="46-60">46-60 years</MenuItem>
                <MenuItem value="60+">60+ years</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Gender</InputLabel>
              <Select
                value={selectedGender}
                label="Gender"
                onChange={(e) => setSelectedGender(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </Select>
            </FormControl>
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
                  <Typography variant="h6" gutterBottom>Summary</Typography>
                  <Typography>Total Admission Types: {data.admissionReasons.length}</Typography>
                  <Typography>Total Subcategories: {data.subcategories.length}</Typography>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>Top Issues by Admission:</Typography>
                  {data.data.slice(0, 5).map((item, index) => (
                    <Box key={index} sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        {item.admitted_for}: {item.total} total issues
                      </Typography>
                      <Typography variant="caption" component="div" sx={{ pl: 2 }}>
                        Main subcategories:
                        {item.subcategories.map((count, idx) => count > 0 ? (
                          <div key={idx}>
                            • {data.subcategories[idx]}: {count} issues
                          </div>
                        ) : null)}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: '500px' }}>
                {chartData && <Bar data={chartData} options={options} />}
              </Paper>
            </Grid>
          </>
        ) : null}
      </Grid>
    </Box>
  );
};

export default AdmissionSubcategoryChart;
