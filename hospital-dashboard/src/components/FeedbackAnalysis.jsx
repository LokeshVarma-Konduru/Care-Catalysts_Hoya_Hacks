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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const FeedbackAnalysis = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const [selectedEthnicity, setSelectedEthnicity] = useState('All');
  const [ethnicities, setEthnicities] = useState(['All']);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/feedback/analysis');
      const data = response.data;
      
      // Extract unique ethnicities
      const uniqueEthnicities = ['All', ...new Set(data.map(item => item._id.ethnicity))];
      setEthnicities(uniqueEthnicities);
      setFeedbackData(data);
    } catch (error) {
      console.error('Error fetching feedback data:', error);
    }
  };

  const prepareChartData = () => {
    const filteredData = selectedEthnicity === 'All' 
      ? feedbackData 
      : feedbackData.filter(item => item._id.ethnicity === selectedEthnicity);

    // Get unique categories
    const categories = [...new Set(filteredData.map(item => item._id.category))];
    
    // Get all unique subcategories
    const allSubcategories = new Set();
    filteredData.forEach(item => {
      item.subcategories.forEach(sub => {
        allSubcategories.add(sub.subcategory);
      });
    });
    const subcategories = Array.from(allSubcategories);

    // Prepare datasets
    const datasets = subcategories.map((subcategory, index) => ({
      label: subcategory,
      data: categories.map(category => {
        const categoryData = filteredData.find(item => item._id.category === category);
        const subcategoryData = categoryData?.subcategories.find(sub => sub.subcategory === subcategory);
        return subcategoryData?.count || 0;
      }),
      backgroundColor: `hsla(${index * (360 / subcategories.length)}, 85%, 80%, 0.8)`,
      borderColor: `hsla(${index * (360 / subcategories.length)}, 85%, 60%, 1)`,
      borderWidth: 1,
    }));

    return {
      labels: categories,
      datasets,
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Patient Feedback Analysis by Category and Ethnicity',
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        stacked: false,
      },
    },
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="ethnicity-select">Select Ethnicity: </label>
        <select
          id="ethnicity-select"
          value={selectedEthnicity}
          onChange={(e) => setSelectedEthnicity(e.target.value)}
          style={{ marginLeft: '10px', padding: '5px' }}
        >
          {ethnicities.map((ethnicity) => (
            <option key={ethnicity} value={ethnicity}>
              {ethnicity}
            </option>
          ))}
        </select>
      </div>
      {feedbackData.length > 0 && (
        <Bar options={options} data={prepareChartData()} />
      )}
    </div>
  );
};

export default FeedbackAnalysis;
