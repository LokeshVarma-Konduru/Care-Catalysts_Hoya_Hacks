import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { LocalHospital as HospitalIcon } from '@mui/icons-material';

const Welcome = () => {
  return (
    <Paper 
      elevation={0}
      sx={{
        padding: 4,
        backgroundColor: 'transparent',
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <HospitalIcon sx={{ fontSize: 60, color: '#2196f3', mb: 3 }} />
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
        Welcome to Hospital Analytics
      </Typography>
      <Typography variant="h6" gutterBottom sx={{ color: '#666', mb: 3 }}>
        Your Interactive Healthcare Dashboard
      </Typography>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
          Use the chatbot on the right to explore different analytics and insights about our hospital data.
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
          Try asking for:
        </Typography>
        <Typography variant="body1" sx={{ color: '#2196f3', fontWeight: 500 }}>
          • Epic Data Analysis
          <br />
          • Patient Feedback Analysis
        </Typography>
      </Box>
    </Paper>
  );
};

export default Welcome;
