import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import { Box, FormControl, InputLabel, Select, MenuItem, Paper, Typography } from '@mui/material';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AgeSubcategoryChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [selectedSex, setSelectedSex] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedSubcategory, selectedSex]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:5000/api/feedback/age-subcategory', {
        params: { 
          subcategory: selectedSubcategory,
          sex: selectedSex
        }
      });
      
      const colors = [
        'rgba(33, 150, 243, 0.7)',   // Blue
        'rgba(156, 39, 176, 0.7)',   // Purple
        'rgba(233, 30, 99, 0.7)',    // Pink
        'rgba(0, 150, 136, 0.7)',    // Teal
        'rgba(255, 152, 0, 0.7)'     // Orange
      ];

      if (!response.data || response.data.length === 0) {
        setError('No data available for the selected subcategory');
        setChartData(null);
        return;
      }

      const data = {
        labels: ['0-18', '19-30', '31-45', '46-60', '61+'],
        datasets: response.data.map((item, index) => ({
          label: item.subcategory,
          data: item.ageData.map(d => d.count),
          backgroundColor: colors[index % colors.length],
          borderColor: colors[index % colors.length].replace('0.7', '1'),
          borderWidth: 1,
          borderRadius: 4,
        }))
      };

      setChartData(data);
    } catch (error) {
      console.error('Error fetching age-subcategory data:', error);
      setError('Error loading data. Please try again.');
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
        text: 'Age Range Distribution by Subcategory',
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
            return `${context.dataset.label}: ${context.parsed.y} patients`;
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
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Subcategory Filter</InputLabel>
          <Select
            value={selectedSubcategory}
            label="Subcategory Filter"
            onChange={(e) => setSelectedSubcategory(e.target.value)}
          >
            <MenuItem value="all">All Subcategories</MenuItem>
            <MenuItem value="Communication Barrier">Communication Barrier</MenuItem>
            <MenuItem value="Delayed Diagnosis">Delayed Diagnosis</MenuItem>
            <MenuItem value="Postpartum Infections">Postpartum Infections</MenuItem>
            <MenuItem value="Frequent Visits">Frequent Visits</MenuItem>
            <MenuItem value="Transport Issues">Transport Issues</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Sex</InputLabel>
          <Select
            value={selectedSex}
            label="Sex"
            onChange={(e) => setSelectedSex(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper 
        elevation={1} 
        sx={{ 
          height: 'calc(100% - 80px)',
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
        ) : error ? (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : chartData ? (
          <Bar data={chartData} options={options} />
        ) : (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Typography>No data available.</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AgeSubcategoryChart;
