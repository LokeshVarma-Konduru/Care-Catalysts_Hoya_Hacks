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
  CircularProgress
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

const AdmissionIssuesChart = () => {
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
      const response = await axios.get('http://localhost:5000/api/analysis/admission-issues', { params });
      console.log('Received data:', response.data);
      
      if (!response.data || !response.data.detailed_analysis) {
        throw new Error('Invalid data format received from server');
      }
      
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Error loading data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = data?.detailed_analysis ? {
    labels: data.detailed_analysis.map(item => item.admitted_for || 'Unknown'),
    datasets: [
      {
        label: 'Total Issues',
        data: data.detailed_analysis.map(item => item.total_issues || 0),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  } : null;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Issues by Admission Reason',
        font: { size: 16 }
      },
      tooltip: {
        callbacks: {
          afterBody: function(context) {
            const dataIndex = context[0].dataIndex;
            const admissionData = data.detailed_analysis[dataIndex];
            return [
              '',
              'Top Issues:',
              ...admissionData.most_common_issues.map(issue => 
                `${issue.subcategory}: ${issue.count} (${issue.demographic})`
              )
            ];
          }
        }
      }
    },
    scales: {
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
                  <Typography>Total Records: {data.summary.total_records}</Typography>
                  <Typography>Admission Types: {data.summary.admission_types}</Typography>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>Top Issues:</Typography>
                  {data.summary.top_issues.map((issue, index) => (
                    <Box key={index} sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        {issue.admitted_for}: {issue.total_issues} issues
                      </Typography>
                      <Typography variant="caption" component="div" sx={{ pl: 2 }}>
                        Main problems:
                        {issue.main_problems.map((problem, i) => (
                          <div key={i}>
                            • {problem.subcategory}: {problem.count} ({problem.demographic})
                          </div>
                        ))}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2, height: '400px' }}>
                {chartData && <Bar data={chartData} options={options} />}
              </Paper>
            </Grid>
          </>
        ) : null}
      </Grid>
    </Box>
  );
};

export default AdmissionIssuesChart;
