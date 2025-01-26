import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Box, FormControl, InputLabel, Select, MenuItem, Paper, Typography } from '@mui/material';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const EventTrends = () => {
  const [selectedCategory, setSelectedCategory] = useState('admitted');
  const [selectedFilter, setSelectedFilter] = useState('hourly');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [insights, setInsights] = useState({ highest: null, lowest: null });

  useEffect(() => {
    fetchChartData();
  }, [selectedCategory, selectedFilter]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/analysis/event-summary', {
        params: {
          eventType: selectedCategory,
          filter: selectedFilter,
        },
      });
      const { data, highest, lowest } = response.data;
      const sortedData = data.sort((a, b) => {
        if (selectedFilter === 'hourly') {
          return parseInt(a.label.split(':')[0]) - parseInt(b.label.split(':')[0]);
        } else {
          const daysOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          return daysOrder.indexOf(a.label) - daysOrder.indexOf(b.label);
        }
      });
      setChartData({
        labels: sortedData.map((item) => item.label),
        datasets: [
          {
            label: `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Events (${selectedFilter})`,
            data: sortedData.map((item) => item.avgCount),
            backgroundColor: 'rgba(33, 150, 243, 0.2)',
            borderColor: 'rgba(33, 150, 243, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: 'rgba(33, 150, 243, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      });
      setInsights({ highest, lowest });
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Hospital Event Trends',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        padding: 10,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        callbacks: {
          label: function(context) {
            return `Average events: ${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: '#f0f0f0'
        },
        ticks: {
          color: '#666'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f0f0f0'
        },
        ticks: {
          color: '#666'
        }
      }
    },
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <Box sx={{ height: '100%', p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Event Category</InputLabel>
          <Select
            value={selectedCategory}
            label="Event Category"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="admitted">Admitted</MenuItem>
            <MenuItem value="consultation">Consultation</MenuItem>
            <MenuItem value="medication given">Medication Given</MenuItem>
            <MenuItem value="discharged">Discharged</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>View</InputLabel>
          <Select
            value={selectedFilter}
            label="View"
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <MenuItem value="hourly">Hourly</MenuItem>
            <MenuItem value="daily">Daily</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#1976d2' }}>
          Quick Insights
        </Typography>
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box>
            <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
              Highest Activity
            </Typography>
            <Typography variant="h6" sx={{ color: '#2196f3' }}>
              {insights.highest || 'N/A'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
              Lowest Activity
            </Typography>
            <Typography variant="h6" sx={{ color: '#2196f3' }}>
              {insights.lowest || 'N/A'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper 
        elevation={1} 
        sx={{ 
          height: 'calc(100% - 200px)',
          minHeight: '400px',
          p: 2,
          backgroundColor: 'white'
        }}
      >
        {loading ? (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Typography>Loading...</Typography>
          </Box>
        ) : chartData.labels.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Typography>No data available for this category.</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default EventTrends;
