import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';

function App() {
  const [activeGraph, setActiveGraph] = useState(null);

  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Container maxWidth={false} sx={{ flex: 1, py: 3 }}>
          <Box sx={{
            display: 'flex',
            gap: 3,
            height: 'calc(100vh - 100px)', // Adjust for navbar and padding
          }}>
            {/* Left side - Dashboard with graphs */}
            <Box sx={{ 
              flex: '0 0 70%',
              backgroundColor: 'background.paper',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: 1
            }}>
              <Dashboard activeGraph={activeGraph} onGraphSelect={setActiveGraph} />
            </Box>

            {/* Right side - Chatbot */}
            <Box sx={{ 
              flex: '0 0 30%',
              backgroundColor: 'background.paper',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: 1
            }}>
              <Chatbot onGraphSelect={setActiveGraph} />
            </Box>
          </Box>
        </Container>
      </Box>
    </Router>
  );
}

export default App;
