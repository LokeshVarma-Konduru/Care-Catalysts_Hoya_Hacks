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
        // Get relevant documents from vector store
        const relevantDocs = await vectorStore.similaritySearch(question, 3);
        const context = relevantDocs.map(doc => doc.pageContent).join('\n');

        // Enhanced prompt for graph insights
        const prompt = `
You are an expert healthcare data analyst assistant. Based on the following context and question, provide detailed insights about our healthcare data visualizations. Your responses should be:

1. Visualization-Specific:
   - Identify and explain the relevant visualization
   - Describe what the data shows
   - Point out key patterns and trends
   - Highlight important correlations

2. Healthcare-Focused:
   - Explain implications for patient care
   - Suggest potential improvements
   - Identify care gaps or opportunities
   - Compare different patient groups

3. Action-Oriented:
   - Recommend specific interventions
   - Suggest follow-up analyses
   - Provide practical next steps
   - Highlight areas needing attention

4. Special Populations:
   - Consider elderly care needs
   - Address maternal health aspects
   - Evaluate cultural sensitivities
   - Assess demographic variations

Context: ${context}

Question: ${question}

If asked about navigation or available graphs:
1. Explain which visualizations are available
2. Guide to the most relevant visualization
3. Suggest related analyses that might be helpful
4. Explain how to interpret the chosen visualization

If the context doesn't contain relevant information, acknowledge this and suggest alternative analyses that might be helpful.`;

        // Generate response using Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error in queryRAG:', error);
        throw error;
    }
}

module.exports = { initializeVectorStore, queryRAG };