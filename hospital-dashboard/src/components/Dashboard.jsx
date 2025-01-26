import React from 'react';
import { Box } from '@mui/material';
import EventTrends from './EventTrends';
import FeedbackAnalysis from './FeedbackAnalysis';
import SubcategoryEthnicityChart from './SubcategoryEthnicityChart';
import AgeSubcategoryChart from './AgeSubcategoryChart';
import Welcome from './Welcome';

const Dashboard = ({ activeGraph }) => {
  const renderGraph = () => {
    switch (activeGraph) {
      case 'event_trends':
        return <EventTrends />;
      case 'feedback_categories':
        return <FeedbackAnalysis />;
      case 'ethnicity_distribution':
        return <SubcategoryEthnicityChart />;
      case 'age_distribution':
        return <AgeSubcategoryChart />;
      default:
        return <Welcome />;
    }
  };

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {renderGraph()}
    </Box>
  );
};

export default Dashboard;
