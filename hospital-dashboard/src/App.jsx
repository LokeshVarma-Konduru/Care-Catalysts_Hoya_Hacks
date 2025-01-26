import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Container, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import FeedbackForm from './components/FeedbackForm';

function App() {
  const [activeGraph, setActiveGraph] = useState(null);

  const MainContent = () => (
    <Box sx={{
      display: 'flex',
      gap: 3,
      height: 'calc(100vh - 140px)', // Adjusted for navbar and padding
      p: 2
    }}>
      {/* Left side - Dashboard with graphs */}
      <Box sx={{ 
        flex: '0 0 70%',
        backgroundColor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}>
        <Dashboard activeGraph={activeGraph} onGraphSelect={setActiveGraph} />
      </Box>

      {/* Right side - Chatbot */}
      <Box sx={{ 
        flex: '0 0 30%',
        backgroundColor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}>
        <Chatbot onGraphSelect={setActiveGraph} />
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          backgroundColor: '#f5f5f5'
        }}>
          <Navbar />
          <Container 
            maxWidth="xl" 
            sx={{ 
              flex: 1, 
              py: 4,
              px: { xs: 3, sm: 4, md: 5 },
              maxWidth: '1800px !important',
              mx: 'auto'
            }}
          >
            <Routes>
              <Route path="/" element={<MainContent />} />
              <Route path="/form" element={<FeedbackForm />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
