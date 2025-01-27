import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
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
      gap: 2,
      height: 'calc(100vh - 64px)', // Height minus navbar
      p: 1,
      width: '100%',
      overflow: 'hidden' // Hide overflow at container level
    }}>
      {/* Left side - Dashboard with graphs */}
      <Box sx={{ 
        flex: '0 0 70%',
        backgroundColor: 'background.paper',
        borderRadius: 1,
        overflow: 'auto', // Allow scrolling in dashboard
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Dashboard activeGraph={activeGraph} onGraphSelect={setActiveGraph} />
      </Box>

      {/* Right side - Chatbot */}
      <Box sx={{ 
        flex: '0 0 30%',
        backgroundColor: 'background.paper',
        borderRadius: 1,
        overflow: 'auto', // Allow scrolling in chatbot
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
          width: '100vw',
          backgroundColor: '#f5f5f5'
        }}>
          <Navbar />
          <Box sx={{ 
            flex: 1,
            width: '100%',
            height: 'calc(100vh - 64px)',
            overflow: 'hidden'
          }}>
            <Routes>
              <Route path="/" element={<MainContent />} />
              <Route path="/form" element={<FeedbackForm />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
