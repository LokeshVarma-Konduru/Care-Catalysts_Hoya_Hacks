import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { dashboardStyles as styles } from '../styles/dashboard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SubcategoryEthnicityChart = () => {
  const [rawData, setRawData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEthnicities, setSelectedEthnicities] = useState([]);
  const [availableEthnicities, setAvailableEthnicities] = useState([]);
  const [selectedGender, setSelectedGender] = useState('all');

  useEffect(() => {
    fetchData();
  }, [selectedGender]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = selectedGender !== 'all' ? { gender: selectedGender } : {};
      const response = await axios.get('http://localhost:5000/api/feedback/subcategory-ethnicity', { params });
      const data = response.data;
      setRawData(data);
      
      // Get all unique ethnicities
      const allEthnicities = new Set();
      data.forEach(item => {
        item.ethnicityData.forEach(ethnic => {
          allEthnicities.add(ethnic.ethnicity);
        });
      });
      const ethnicities = Array.from(allEthnicities);
      setAvailableEthnicities(ethnicities);
      setSelectedEthnicities(ethnicities); // Initially select all ethnicities
      prepareChartData();
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rawData.length > 0) {
      prepareChartData();
    }
  }, [selectedEthnicities, rawData]);

  const prepareChartData = () => {
    const chartData = {
      labels: rawData.map(item => item._id), // Subcategories
      datasets: selectedEthnicities.map((ethnicity, index) => ({
        label: ethnicity,
        data: rawData.map(item => {
          const ethnicityData = item.ethnicityData.find(
            ethnic => ethnic.ethnicity === ethnicity
          );
          return ethnicityData ? ethnicityData.count : 0;
        }),
        backgroundColor: `hsla(${index * (360 / selectedEthnicities.length)}, 85%, 85%, 0.7)`,
        borderColor: `hsla(${index * (360 / selectedEthnicities.length)}, 85%, 65%, 1)`,
        borderWidth: 1,
        hoverBackgroundColor: `hsla(${index * (360 / selectedEthnicities.length)}, 85%, 75%, 0.9)`,
        hoverBorderColor: `hsla(${index * (360 / selectedEthnicities.length)}, 85%, 55%, 1)`,
      })),
    };

    setChartData(chartData);
  };

  const handleEthnicityChange = (event) => {
    setSelectedEthnicities(event.target.value);
  };

  const handleGenderChange = (event) => {
    setSelectedGender(event.target.value);
  };

  const handleSelectAll = () => {
    setSelectedEthnicities(availableEthnicities);
  };

  const handleDeselectAll = () => {
    setSelectedEthnicities([]);
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Patient Issues by Subcategory and Ethnicity',
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
        stacked: false,
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          color: '#666'
        },
        grid: {
          color: '#f0f0f0'
        }
      },
      y: {
        stacked: false,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Issues',
          color: '#666'
        },
        ticks: {
          color: '#666'
        },
        grid: {
          color: '#f0f0f0'
        }
      },
    },
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    }
  };

  return (
    <div>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Ethnicity</InputLabel>
          <Select
            multiple
            value={selectedEthnicities}
            onChange={handleEthnicityChange}
            label="Ethnicity"
            renderValue={(selected) => selected.join(', ')}
          >
            {availableEthnicities.map((ethnicity) => (
              <MenuItem key={ethnicity} value={ethnicity}>
                {ethnicity}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Gender</InputLabel>
          <Select
            value={selectedGender}
            onChange={handleGenderChange}
            label="Gender"
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '10px', 
          alignItems: 'center',
          marginBottom: '10px'
        }}>
          <button 
            onClick={handleSelectAll}
            style={{
              padding: '5px 10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Select All
          </button>
          <button 
            onClick={handleDeselectAll}
            style={{
              padding: '5px 10px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Deselect All
          </button>
        </div>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '10px' 
        }}>
          {availableEthnicities.map((ethnicity) => (
            <label 
              key={ethnicity}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center',
                padding: '5px 10px',
                backgroundColor: selectedEthnicities.includes(ethnicity) ? '#e3f2fd' : '#f5f5f5',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                checked={selectedEthnicities.includes(ethnicity)}
                onChange={() => handleEthnicityChange(ethnicity)}
                style={{ marginRight: '5px' }}
              />
              {ethnicity}
            </label>
          ))}
        </div>
      </div>

      <div style={{ height: '600px' }}>
        {loading ? (
          <div className="loading-spinner" />
        ) : chartData ? (
          <Bar options={options} data={chartData} />
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
};

export default SubcategoryEthnicityChart;
