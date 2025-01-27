import React, { useState, useEffect, useRef } from 'react';
import { Box, Paper, Typography, TextField, IconButton, CircularProgress, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ElderlyVisitsChart from './ElderlyVisitsChart';
import PregnantVisitsChart from './PregnantVisitsChart';

const Chatbot = ({ onGraphSelect }) => {
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Initialize messages from localStorage or default if not found
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    return savedMessages ? JSON.parse(savedMessages) : [
      {
        text: "Hello! I can help you explore hospital data. Choose a category to begin:",
        isBot: true,
        options: [
          { text: "Progress", value: "progress" },
          { text: "Submit Feedback", value: "feedback_form" },
          { text: "Ask Medical Questions", value: "medical" },
          { text: "Results", value: "results" },
          { text: "Start Analysis", value: "start_analysis" }
        ]
      }
    ];
  });

  const [input, setInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem('selectedCategory') || null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(() => {
    return localStorage.getItem('selectedAnalysis') === 'true';
  });

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  // Save selected category and analysis state
  useEffect(() => {
    localStorage.setItem('selectedCategory', selectedCategory || '');
    localStorage.setItem('selectedAnalysis', selectedAnalysis.toString());
  }, [selectedCategory, selectedAnalysis]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  // Auto scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Prevent automatic scroll up when chat container is manually scrolled
  const handleScroll = (e) => {
    const element = e.target;
    const isScrolledNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    if (isScrolledNearBottom) {
      element.dataset.allowAutoScroll = 'true';
    } else {
      element.dataset.allowAutoScroll = 'false';
    }
  };

  // Clear chat history function
  const clearChatHistory = () => {
    setMessages([{
      text: "Hello! I can help you explore hospital data. Choose a category to begin:",
      isBot: true,
      options: [
        { text: "Progress", value: "progress" },
        { text: "Submit Feedback", value: "feedback_form" },
        { text: "Ask Medical Questions", value: "medical" },
        { text: "Results", value: "results" },
        { text: "Start Analysis", value: "start_analysis" }
      ]
    }]);
    setSelectedCategory(null);
    setSelectedAnalysis(false);
    localStorage.removeItem('chatHistory');
    localStorage.removeItem('selectedCategory');
    localStorage.removeItem('selectedAnalysis');
  };

  const analysisOptions = [
    { text: "Epic Data", value: "epic" },
    { text: "Patient Feedback Data", value: "feedback" },
    { text: "Epic + Feedback Analysis", value: "epic_feedback" }
  ];

  const resultOptions = [
    { text: "Implementation Impact Analysis", value: "final_results" },
    { text: "Show Feedback Impact Analysis", value: "feedback_impact" },
    { text: "Show Sentiment Analysis", value: "sentiment_analysis" }
  ];

  const specialPopulationOptions = [
    { text: "Elderly Care Analysis", value: "elderly_visits" },
    { text: "Maternal Care Analysis", value: "pregnant_visits" }
  ];

  const handleOptionClick = async (value) => {
    if (value === "start_analysis") {
      setSelectedAnalysis(true);
      setMessages([
        ...messages,
        {
          text: "Please select the type of analysis you would like to perform:",
          isBot: true,
          options: analysisOptions
        }
      ]);
      return;
    }

    if (value === "special_population") {
      setMessages([
        ...messages,
        { text: "Special Population Analysis", isBot: false },
        {
          text: "Which population would you like to analyze?",
          isBot: true,
          options: specialPopulationOptions
        }
      ]);
      return;
    }

    if (value === "results") {
      setMessages([
        ...messages,
        { text: "Results", isBot: false },
        {
          text: "What would you like to see?",
          isBot: true,
          options: resultOptions
        }
      ]);
      return;
    }

    if (value === "epic_feedback") {
      setMessages([
        ...messages,
        {
          text: "Choose an analysis type:",
          isBot: true,
          options: [
            { text: "Show Admission Issues Analysis", value: "admission_issues" },
            { text: "Show Admission vs Subcategory Analysis", value: "admission_subcategories" }
          ]
        }
      ]);
      return;
    }

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
    } else if (value === 'feedback_form') {
      setMessages([
        ...messages,
        { text: "Opening feedback form...", isBot: false }
      ]);
      onGraphSelect('feedback_form');
    } else if (value === 'sentiment_analysis') {
      setMessages([
        ...messages,
        { text: "Showing Sentiment Analysis Results", isBot: false },
        {
          text: "Here's the sentiment analysis comparison before and after implementation:",
          isBot: true
        }
      ]);
      onGraphSelect('sentiment_analysis');
      return;
    } else if (value === 'final_results') {
      setMessages([
        ...messages,
        { text: "Implementation Impact Analysis", isBot: false },
        {
          text: "Here's the implementation impact analysis across different categories:",
          isBot: true
        }
      ]);
      onGraphSelect('final_results');
    } else if (['event_trends', 'feedback_categories', 'ethnicity_distribution', 'age_distribution', 'admission_issues', 'admission_subcategories', 'feedback_impact'].includes(value)) {
      setMessages([
        ...messages,
        { 
          text: `Showing ${value.replace(/_/g, ' ')}...`, 
          isBot: false 
        }
      ]);
      onGraphSelect(value);
    } else if (value === 'progress') {
      setMessages([
        ...messages,
        { text: "Progress", isBot: false },
        {
          text: "Please select which analysis you would like to see:",
          isBot: true,
          options: [
            { text: "Elderly Visits Analysis", value: "elderly_visits" },
            { text: "Pregnant Visit Analysis", value: "pregnant_visits" }
          ]
        }
      ]);
    } else if (value === 'elderly_visits') {
      setMessages([
        ...messages,
        { text: "Elderly Visits Analysis", isBot: false },
        {
          text: "Here's the elderly visits analysis:",
          isBot: true
        }
      ]);
      onGraphSelect('elderly_visits');
    } else if (value === 'pregnant_visits') {
      setMessages([
        ...messages,
        { text: "Pregnant Visit Analysis", isBot: false },
        {
          text: "Here's the pregnant visits analysis:",
          isBot: true
        }
      ]);
      onGraphSelect('pregnant_visits');
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
      
      // Helper function to check for term variations
      const containsAny = (text, terms) => terms.some(term => text.includes(term));
      
      // Define term variations for each graph type
      const ethnicityTerms = ['ethnicity', 'ethnic', 'race', 'racial', 'cultural', 'subcategory vs ethnicity', 'ethnicity vs subcategory'];
      const ageTerms = ['age', 'years', 'elderly', 'young', 'senior', 'age distribution', 'age group'];
      const eventTerms = ['event', 'admission', 'discharge', 'hospital pattern', 'trend', 'epic', 'temporal'];
      const feedbackTerms = ['feedback', 'complaint', 'response', 'patient feedback', 'category', 'issue'];

      if (lowerMessage.includes('show') || lowerMessage.includes('navigate') || lowerMessage.includes('display') || lowerMessage.includes('view')) {
        let graphType = null;
        let graphDescription = '';
        
        // Subcategory vs Ethnicity Graph
        if (containsAny(lowerMessage, ethnicityTerms)) {
          graphType = 'ethnicity_distribution';
          graphDescription = 'Subcategory vs Ethnicity';
        }
        // Age Distribution Graph
        else if (containsAny(lowerMessage, ageTerms)) {
          graphType = 'age_distribution';
          graphDescription = 'Age Distribution';
        }
        // Event Trends Graph
        else if (containsAny(lowerMessage, eventTerms)) {
          graphType = 'event_trends';
          graphDescription = 'Event Trends';
        }
        // Feedback Categories Graph
        else if (containsAny(lowerMessage, feedbackTerms)) {
          graphType = 'feedback_categories';
          graphDescription = 'Feedback Categories';
        }
        
        if (graphType) {
          onGraphSelect(graphType);
          const response = await fetch('http://localhost:5000/api/chat/rag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              question: `Explain the insights from ${graphDescription} graph` 
            }),
          });
          const data = await response.json();
          setMessages(prev => [
            ...prev,
            { text: `Navigating to ${graphDescription} graph...`, isBot: true },
            { text: data.answer, isBot: true }
          ]);
        } else {
          setMessages(prev => [...prev, {
            text: "I can help you view these graphs:\n" +
                  "1. Subcategory vs Ethnicity graph (shows distribution across ethnic groups)\n" +
                  "2. Age Distribution graph (shows patterns across age groups)\n" +
                  "3. Event Trends graph (shows hospital event patterns)\n" +
                  "4. Feedback Categories graph (shows feedback distribution)\n\n" +
                  "Try saying 'show [graph name]' or 'navigate to [graph name]'",
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

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setMessages(prev => [...prev, {
          text: data.answer,
          isBot: true
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        text: "I apologize, but I encountered an error processing your request. Please try again or rephrase your question.",
        isBot: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Header with clear button */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <Typography variant="h6" component="h2">
          Hospital Data Assistant
        </Typography>
        <Button 
          onClick={clearChatHistory}
          size="small"
          variant="outlined"
          color="primary"
          sx={{ 
            minWidth: 'auto',
            px: 2,
            py: 0.5,
            fontSize: '0.875rem',
            '&:hover': {
              color: 'error.main',
              borderColor: 'error.main'
            }
          }}
        >
          Clear Chat
        </Button>
      </Box>

      {/* Chat messages */}
      <Box 
        ref={chatContainerRef}
        onScroll={handleScroll}
        sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              alignSelf: message.isBot ? 'flex-start' : 'flex-end',
              maxWidth: '80%',
              backgroundColor: message.isBot ? 'grey.100' : 'primary.main',
              color: message.isBot ? 'text.primary' : 'white',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography>{message.text}</Typography>
            {message.options && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {message.options.map((option) => (
                  <Button
                    key={option.value}
                    variant="contained"
                    size="small"
                    onClick={() => handleOptionClick(option.value)}
                    sx={{
                      backgroundColor: message.isBot ? 'white' : 'primary.light',
                      color: message.isBot ? 'primary.main' : 'white',
                      '&:hover': {
                        backgroundColor: message.isBot ? 'grey.100' : 'primary.dark',
                      },
                    }}
                  >
                    {option.text}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
        ))}
        <div ref={messagesEndRef} />
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
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
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
    </Paper>
  );
};

export default Chatbot;
