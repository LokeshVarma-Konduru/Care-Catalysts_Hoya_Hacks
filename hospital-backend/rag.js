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
You are an expert healthcare data analyst. Based on the following context and question, provide detailed insights about the healthcare data visualization. If the question is about a specific graph:
1. Explain what the graph shows
2. Highlight key patterns and trends
3. Provide actionable insights for healthcare improvement
4. Compare different demographic groups if relevant
5. Suggest potential interventions based on the data

Context: ${context}

Question: ${question}

Remember to be specific about the data patterns and their implications for healthcare delivery. If the context doesn't contain relevant information, say so.`;

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