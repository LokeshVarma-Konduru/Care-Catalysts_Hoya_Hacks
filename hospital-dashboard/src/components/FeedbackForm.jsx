import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Container
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import axios from 'axios';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    Patient_Name: '',
    Age: '',
    Sex: '',
    Ethnicity: '',
    Category: '',
    Subcategory: ''
  });

  const [options, setOptions] = useState({
    sex: ['Male', 'Female'],
    ethnicity: ['Black', 'Asian', 'White', 'Hispanic', 'Other'],
    category: ['Diagnosis Issues', 'Communication', 'Healthcare Access', 'Procedural Errors', 'None'],
    subcategory: ['Communication Barrier', 'Delayed Diagnosis', 'Postpartum Infections', 'Frequent Visits', 'Transport Issues', 'None']
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!formData.Patient_Name || !formData.Age || !formData.Sex || !formData.Ethnicity) {
        throw new Error('Please fill in all required fields');
      }

      const response = await axios.post('http://localhost:5000/api/feedback/submit', formData);
      setSuccess('Feedback submitted successfully!');
      setFormData({
        Patient_Name: '',
        Age: '',
        Sex: '',
        Ethnicity: '',
        Category: '',
        Subcategory: ''
      });
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(err.message || 'Error submitting feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        maxWidth: 800,
        mx: 'auto',
        mt: 2,
        p: { xs: 2, sm: 3 }
      }}
    >
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, sm: 4 },
          borderRadius: 2,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom 
          align="center" 
          color="primary"
          sx={{ 
            mb: 1,
            fontWeight: 600,
          }}
        >
          Patient Feedback Form
        </Typography>
        
        <Typography 
          variant="body1" 
          gutterBottom 
          align="center" 
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Help us improve our services by sharing your experience
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 1,
            }}
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: 1,
            }}
          >
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patient Name"
                name="Patient_Name"
                value={formData.Patient_Name}
                onChange={handleChange}
                required
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                name="Age"
                type="number"
                value={formData.Age}
                onChange={handleChange}
                required
                variant="outlined"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                required
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  }
                }}
              >
                <InputLabel>Sex</InputLabel>
                <Select
                  name="Sex"
                  value={formData.Sex}
                  onChange={handleChange}
                  label="Sex"
                >
                  {options.sex.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth 
                required
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  }
                }}
              >
                <InputLabel>Ethnicity</InputLabel>
                <Select
                  name="Ethnicity"
                  value={formData.Ethnicity}
                  onChange={handleChange}
                  label="Ethnicity"
                >
                  {options.ethnicity.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  }
                }}
              >
                <InputLabel>Category</InputLabel>
                <Select
                  name="Category"
                  value={formData.Category}
                  onChange={handleChange}
                  label="Category"
                >
                  {options.category.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  }
                }}
              >
                <InputLabel>Subcategory</InputLabel>
                <Select
                  name="Subcategory"
                  value={formData.Subcategory}
                  onChange={handleChange}
                  label="Subcategory"
                >
                  {options.subcategory.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                  sx={{
                    minWidth: 200,
                    py: 1.5,
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default FeedbackForm;
