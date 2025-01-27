import React from 'react';
import { Box } from '@mui/material';
import EventTrends from './EventTrends';
import FeedbackAnalysis from './FeedbackAnalysis';
import SubcategoryEthnicityChart from './SubcategoryEthnicityChart';
import AgeSubcategoryChart from './AgeSubcategoryChart';
import AdmissionIssuesChart from './AdmissionIssuesChart';
import AdmissionSubcategoryChart from './AdmissionSubcategoryChart';
import FeedbackForm from './FeedbackForm';
import FeedbackImpactChart from './FeedbackImpactChart';
import Welcome from './Welcome';
import SentimentAnalysisChart from './SentimentAnalysisChart';
import ElderlyVisitsChart from './ElderlyVisitsChart';
import PregnantVisitsChart from './PregnantVisitsChart';
import FinalResultsChart from './FinalResultsChart';

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
      case 'admission_issues':
        return <AdmissionIssuesChart />;
      case 'admission_subcategories':
        return <AdmissionSubcategoryChart />;
      case 'feedback_form':
        return <FeedbackForm />;
      case 'feedback_impact':
        return <FeedbackImpactChart />;
      case 'sentiment_analysis':
        return <SentimentAnalysisChart />;
      case 'elderly_visits':
        return <ElderlyVisitsChart />;
      case 'pregnant_visits':
        return <PregnantVisitsChart />;
      case 'final_results':
        return <FinalResultsChart />;
      default:
        return <Welcome />;
    }
  };

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto',
      '& > *': {  
        minHeight: '600px',  
        flex: '1 1 auto',
        p: 2,  
      }
    }}>
      {renderGraph()}
    </Box>
  );
};

export default Dashboard;
