import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
<<<<<<< HEAD
import { Box, CssBaseline } from '@mui/material';
=======
import { Box, Container, CssBaseline } from '@mui/material';
>>>>>>> f81add4f539b73c041f72667c11a0c4ee2e9054e
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
<<<<<<< HEAD
      gap: 2,
      height: 'calc(100vh - 64px)', // Height minus navbar
      p: 1,
      width: '100%',
      overflow: 'hidden' // Hide overflow at container level
=======
      gap: 3,
      height: 'calc(100vh - 140px)', // Adjusted for navbar and padding
      p: 2
>>>>>>> f81add4f539b73c041f72667c11a0c4ee2e9054e
    }}>
      {/* Left side - Dashboard with graphs */}
      <Box sx={{ 
        flex: '0 0 70%',
        backgroundColor: 'background.paper',
<<<<<<< HEAD
        borderRadius: 1,
        overflow: 'auto', // Allow scrolling in dashboard
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column'
=======
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
>>>>>>> f81add4f539b73c041f72667c11a0c4ee2e9054e
      }}>
        <Dashboard activeGraph={activeGraph} onGraphSelect={setActiveGraph} />
      </Box>

      {/* Right side - Chatbot */}
      <Box sx={{ 
        flex: '0 0 30%',
        backgroundColor: 'background.paper',
<<<<<<< HEAD
        borderRadius: 1,
        overflow: 'auto', // Allow scrolling in chatbot
=======
        borderRadius: 2,
        overflow: 'hidden',
>>>>>>> f81add4f539b73c041f72667c11a0c4ee2e9054e
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
<<<<<<< HEAD
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
=======
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
>>>>>>> f81add4f539b73c041f72667c11a0c4ee2e9054e
            <Routes>
              <Route path="/" element={<MainContent />} />
              <Route path="/form" element={<FeedbackForm />} />
            </Routes>
<<<<<<< HEAD
          </Box>
=======
          </Container>
>>>>>>> f81add4f539b73c041f72667c11a0c4ee2e9054e
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
