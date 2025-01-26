import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, IconButton, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const Chatbot = ({ onGraphSelect }) => {
  const [messages, setMessages] = useState([
    {
      text: "Hello! I can help you explore hospital data. Choose a category to begin:",
      isBot: true,
      options: [
        { text: "Epic Data", value: "epic" },
        { text: "Patient Feedback Data", value: "feedback" },
        { text: "Ask Medical Questions", value: "medical" }  
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOptionClick = async (value) => {
    if (value === 'epic') {
      setMessages([
        ...messages,
        { text: "Epic Data", isBot: false },
        {
          text: "What would you like to analyze?",
          isBot: true,
          options: [
            { text: "Show Event Trends Analysis", value: "event_trends" }
          ]
        }
      ]);
      setSelectedCategory('epic');
    } else if (value === 'feedback') {
      setMessages([
        ...messages,
        { text: "Patient Feedback Data", isBot: false },
        {
          text: "What would you like to analyze?",
          isBot: true,
          options: [
            { text: "Show Feedback Categories Analysis", value: "feedback_categories" },
            { text: "Show Ethnicity Distribution", value: "ethnicity_distribution" },
            { text: "Show Age Distribution", value: "age_distribution" }
          ]
        }
      ]);
      setSelectedCategory('feedback');
    } else if (value === 'medical') {
      setMessages([
        ...messages,
        { text: "Medical Questions", isBot: false },
        {
          text: "Please type your medical question, and I'll assist you using my medical knowledge base.",
          isBot: true
        }
      ]);
      setSelectedCategory('medical');
    } else if (['event_trends', 'feedback_categories', 'ethnicity_distribution', 'age_distribution'].includes(value)) {
      setMessages([
        ...messages,
        { 
          text: `Showing ${value.replace(/_/g, ' ')}...`, 
          isBot: false 
        }
      ]);
      onGraphSelect(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);

    setIsLoading(true);
    try {
        // Check for navigation commands
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('show') || lowerMessage.includes('navigate')) {
            let graphType = null;
            
            // Subcategory vs Ethnicity Graph
            if (lowerMessage.includes('ethnicity') || lowerMessage.includes('subcategory vs ethnicity')) {
                graphType = 'ethnicity_distribution';
                onGraphSelect(graphType);
                const response = await fetch('http://localhost:5000/api/chat/rag', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        question: "Explain the insights from subcategory vs ethnicity graph" 
                    }),
                });
                const data = await response.json();
                setMessages(prev => [
                    ...prev,
                    { text: "Navigating to Subcategory vs Ethnicity graph...", isBot: true },
                    { text: data.answer, isBot: true }
                ]);
            }
            // Age Distribution Graph
            else if (lowerMessage.includes('age') || lowerMessage.includes('age distribution')) {
                graphType = 'age_distribution';
                onGraphSelect(graphType);
                const response = await fetch('http://localhost:5000/api/chat/rag', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        question: "Explain the insights from age distribution graph" 
                    }),
                });
                const data = await response.json();
                setMessages(prev => [
                    ...prev,
                    { text: "Navigating to Age Distribution graph...", isBot: true },
                    { text: data.answer, isBot: true }
                ]);
            }
            // Event Trends Graph
            else if (lowerMessage.includes('event') || lowerMessage.includes('trends')) {
                graphType = 'event_trends';
                onGraphSelect(graphType);
                const response = await fetch('http://localhost:5000/api/chat/rag', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        question: "Explain the insights from event trends graph" 
                    }),
                });
                const data = await response.json();
                setMessages(prev => [
                    ...prev,
                    { text: "Navigating to Event Trends graph...", isBot: true },
                    { text: data.answer, isBot: true }
                ]);
            }
            // Feedback Categories Graph
            else if (lowerMessage.includes('feedback')) {
                graphType = 'feedback_categories';
                onGraphSelect(graphType);
                const response = await fetch('http://localhost:5000/api/chat/rag', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        question: "Explain the insights from feedback categories graph" 
                    }),
                });
                const data = await response.json();
                setMessages(prev => [
                    ...prev,
                    { text: "Navigating to Feedback Categories graph...", isBot: true },
                    { text: data.answer, isBot: true }
                ]);
            }
            
            if (!graphType) {
                setMessages(prev => [...prev, {
                    text: "I'm not sure which graph you want to see. You can ask for:\n- Subcategory vs Ethnicity graph\n- Age Distribution graph\n- Event Trends graph\n- Feedback Categories graph",
                    isBot: true
                }]);
            }
        } else {
            // Regular RAG query for insights or other questions
            const response = await fetch('http://localhost:5000/api/chat/rag', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: userMessage }),
            });

            const data = await response.json();
            setMessages(prev => [...prev, {
                text: data.answer,
                isBot: true
            }]);
        }
    } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, {
            text: "I'm sorry, I encountered an error processing your request.",
            isBot: true
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'background.paper'
    }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: 'primary.main',
        color: 'white'
      }}>
        <Typography variant="h6">
          Hospital Data Assistant
        </Typography>
      </Box>

      {/* Messages */}
      <Box sx={{
        flex: 1,
        overflow: 'auto',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              alignSelf: message.isBot ? 'flex-start' : 'flex-end',
              maxWidth: '80%'
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                backgroundColor: message.isBot ? 'grey.100' : 'primary.main',
                color: message.isBot ? 'text.primary' : 'white',
                borderRadius: 2
              }}
            >
              <Typography>{message.text}</Typography>
              {message.options && (
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {message.options.map((option, optIndex) => (
                    <Paper
                      key={optIndex}
                      onClick={() => handleOptionClick(option.value)}
                      sx={{
                        p: 1,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                          transform: 'translateX(4px)'
                        }
                      }}
                    >
                      <Typography>{option.text}</Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Paper>
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>

      {/* Input */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          display: 'flex',
          gap: 1
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          sx={{ backgroundColor: 'white' }}
        />
        <IconButton type="submit" color="primary" disabled={isLoading}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chatbot;
