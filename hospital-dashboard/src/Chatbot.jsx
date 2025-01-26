// Frontend: Chatbot Component
import React, { useState } from 'react';
import axios from 'axios';

function Chatbot({ context }) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/chat', {
        question,
        context,
      });
      setResponse(res.data.answer);
    } catch (err) {
      console.error('Error:', err);
      setResponse('Error fetching response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '400px' }}>
      <h2>Dashboard Assistant</h2>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={4}
        placeholder="Ask about your dashboard..."
        style={{ width: '100%', padding: '8px' }}
      />
      <button
        onClick={handleAsk}
        style={{ marginTop: '10px', padding: '10px', width: '100%' }}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Ask'}
      </button>
      <div style={{ marginTop: '20px', fontSize: '16px' }}>
        <strong>Response:</strong>
        <p>{response || 'Your response will appear here.'}</p>
      </div>
    </div>
  );
}

export default Chatbot;
