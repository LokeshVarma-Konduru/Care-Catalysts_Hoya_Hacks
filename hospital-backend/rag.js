// rag.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { Document } = require('langchain/document');
require('dotenv').config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Initialize embeddings with Gemini
const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
});

// Create vector store
let vectorStore;

// Initialize vector store with medical knowledge
async function initializeVectorStore(medicalData) {
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });

    const docs = await textSplitter.createDocuments([medicalData]);
    vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
    return vectorStore;
}

// Query function using Gemini
async function queryRAG(question) {
    if (!vectorStore) {
        throw new Error('Vector store not initialized');
    }

    try {
        // Normalize the question to handle variations
        const normalizedQuestion = normalizeQuery(question);

        // Get relevant documents from vector store with increased count for better context
        const relevantDocs = await vectorStore.similaritySearch(normalizedQuestion, 5);
        const context = relevantDocs.map(doc => doc.pageContent).join('\n');

        // Enhanced prompt for more robust responses
        const prompt = `
You are an expert healthcare data analyst with deep knowledge of medical data visualization. Based on the following context and question, provide a comprehensive analysis. Follow these guidelines:

1. Question Understanding:
   - Identify the main focus of the question (e.g., ethnicity, age, trends, patterns)
   - Consider alternative terms or phrasings that mean the same thing
   - Look for specific demographic or category mentions

2. Data Visualization Analysis:
   - Explain what the relevant graphs or charts show
   - Describe key variables and their relationships
   - Point out important patterns and trends
   - Compare different groups or categories if relevant

3. Healthcare Insights:
   - Highlight significant findings and their implications
   - Identify potential healthcare delivery improvements
   - Suggest interventions based on the data
   - Connect patterns to practical healthcare outcomes

4. Response Structure:
   - Start with a clear, direct answer
   - Provide specific examples from the data
   - Include relevant statistics or numbers if available
   - End with actionable recommendations

Context: ${context}

Question: ${normalizedQuestion}

Remember to:
- Be specific about data patterns and their healthcare implications
- Acknowledge if certain information isn't available in the context
- Maintain consistency in terminology
- Focus on practical, actionable insights`;

        // Generate response using Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error in queryRAG:', error);
        throw error;
    }
}

// Helper function to normalize queries
function normalizeQuery(query) {
    const normalizations = {
        // Ethnicity-related terms
        'race': 'ethnicity',
        'cultural background': 'ethnicity',
        'ethnic group': 'ethnicity',
        'racial': 'ethnic',
        
        // Age-related terms
        'years': 'age',
        'elderly': 'age group',
        'young': 'age group',
        'senior': 'age group',
        
        // Category-related terms
        'problems': 'issues',
        'challenges': 'issues',
        'difficulties': 'issues',
        'concerns': 'issues',
        
        // Distribution-related terms
        'spread': 'distribution',
        'breakdown': 'distribution',
        'analysis': 'distribution',
        
        // Time-related terms
        'temporal': 'time',
        'periodic': 'time',
        'timing': 'time',
        
        // Trend-related terms
        'pattern': 'trend',
        'variation': 'trend',
        'change': 'trend',
        
        // Feedback-related terms
        'complaints': 'feedback',
        'responses': 'feedback',
        'comments': 'feedback',
        
        // Event-related terms
        'occurrences': 'events',
        'incidents': 'events',
        'cases': 'events'
    };

    let normalizedQuery = query.toLowerCase();
    
    // Replace variations with standardized terms
    Object.entries(normalizations).forEach(([variant, standard]) => {
        normalizedQuery = normalizedQuery.replace(new RegExp(variant, 'gi'), standard);
    });

    return normalizedQuery;
}

module.exports = { initializeVectorStore, queryRAG };