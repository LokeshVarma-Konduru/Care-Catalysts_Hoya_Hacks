// Backend: Node.js with Updated API
// ================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Add these routes to your existing index.js
const { initializeVectorStore, queryRAG } = require('./rag');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize RAG with medical knowledge
const medicalKnowledge = `
    Medical Knowledge Base and Data Insights:
    
    1. Available Graphs and Navigation:

    a) Subcategory vs Ethnicity Analysis (Paths: /subcategory-ethnicity, /ethnicity-subcategory, /ethnic-distribution):
    - Visualization Type: Bar chart comparing healthcare issues across ethnic groups
    - Alternative Names: 
        * Ethnicity Distribution Graph
        * Ethnic Group Analysis
        * Race vs Healthcare Issues
        * Cultural Background Analysis
    - Key Variables:
        * X-axis: Healthcare subcategories (Communication Barriers, Delayed Diagnosis, Transport Issues, etc.)
        * Y-axis: Number of cases
        * Grouping: By ethnic groups (Asian, Black, White, Hispanic, Other)
    - Common Query Terms:
        * "ethnicity", "ethnic", "race", "cultural background"
        * "subcategory", "sub-category", "issues", "problems"
        * "distribution", "breakdown", "analysis", "comparison"
    
    b) Age Group Analysis (Paths: /age-subcategory, /age-distribution, /age-analysis):
    - Visualization Type: Bar chart showing healthcare issues by age groups
    - Alternative Names:
        * Age Distribution Graph
        * Age Group Breakdown
        * Age-based Analysis
        * Patient Age Statistics
    - Key Variables:
        * X-axis: Age groups (18-30, 31-45, 46-60, 61+)
        * Y-axis: Number of cases
        * Categories: All healthcare subcategories
    - Common Query Terms:
        * "age", "years", "elderly", "young"
        * "group", "bracket", "range"
        * "distribution", "spread", "pattern"
    
    c) Feedback Analysis (Paths: /feedback, /feedback-analysis, /patient-feedback):
    - Visualization Type: Multi-chart dashboard with pie and trend charts
    - Alternative Names:
        * Patient Feedback Dashboard
        * Complaint Analysis
        * Patient Response Analysis
        * Healthcare Feedback Metrics
    - Key Components:
        * Category distribution pie chart
        * Time-series trend analysis
        * Demographic breakdown
    - Common Query Terms:
        * "feedback", "complaints", "responses", "issues"
        * "trends", "patterns", "changes"
        * "categories", "types", "classifications"
    
    d) Event Trends (Paths: /events, /event-trends, /hospital-events):
    - Visualization Type: Line chart showing temporal patterns
    - Alternative Names:
        * Hospital Event Analysis
        * Temporal Event Patterns
        * Time-based Event Analysis
        * Operational Trends
    - Key Variables:
        * X-axis: Time periods (hourly/daily)
        * Y-axis: Event frequency
        * Event types: Admissions, discharges, procedures
    - Common Query Terms:
        * "events", "occurrences", "incidents"
        * "trends", "patterns", "frequency"
        * "time", "temporal", "periodic"

    2. Data Relationships and Cross-References:
    
    a) Demographic Correlations:
    - Age vs Ethnicity patterns
    - Gender distribution across categories
    - Cultural factors in healthcare access
    - Socioeconomic implications
    
    b) Healthcare Issue Patterns:
    - Communication barriers across demographics
    - Transport issues by location and age
    - Diagnosis delays by ethnic group
    - Access problems by age group
    
    c) Temporal Patterns:
    - Daily admission variations
    - Weekly trend analysis
    - Seasonal healthcare patterns
    - Peak period identification

    3. Common Analysis Scenarios:

    a) Demographic Analysis:
    - "Show me problems faced by elderly patients"
    - "Compare issues between ethnic groups"
    - "Analyze age-related healthcare patterns"
    - "Distribution of complaints by race"
    
    b) Issue-based Analysis:
    - "Transport problems across age groups"
    - "Communication barriers by ethnicity"
    - "Diagnosis delays in different communities"
    - "Access issues for minority groups"
    
    c) Trend Analysis:
    - "Hospital admission patterns"
    - "Weekly event distribution"
    - "Busiest hours for procedures"
    - "Patient discharge trends"

    4. Healthcare Insights by Category:

    a) Communication Barriers:
    - Language-based issues
    - Cultural misunderstandings
    - Information delivery problems
    - Patient-provider communication gaps
    
    b) Transport Issues:
    - Geographic accessibility
    - Public transport dependence
    - Emergency transport patterns
    - Distance-related challenges
    
    c) Diagnosis Patterns:
    - Delay factors analysis
    - Demographic influences
    - Cultural impact on diagnosis
    - Access to specialist care
    
    d) Healthcare Access:
    - Availability of services
    - Insurance-related issues
    - Appointment scheduling
    - Resource distribution
`;

initializeVectorStore(medicalKnowledge).then(() => {
    console.log('RAG system initialized with enhanced knowledge base and query handling');
}).catch(console.error);

// RAG query endpoint
app.post('/api/chat/rag', async (req, res) => {
    try {
        const { question } = req.body;
        const answer = await queryRAG(question);
        res.json({ answer });
    } catch (error) {
        console.error('RAG Error:', error);
        res.status(500).json({ error: 'Error processing your question' });
    }
});

// MongoDB Connection
mongoose.connect('mongodb+srv://akhilandresleo:Akhil%402002@patientdata.tesqt.mongodb.net/hospital_db?retryWrites=true&w=majority', {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
}).then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error: ", err));

// Schema and Model
const EventSchema = new mongoose.Schema({
  event_id: String,
  timestamp: Date,
  event_type: String,
});
const Event = mongoose.model('Event', EventSchema);

// Updated Feedback Schema
const FeedbackSchema = new mongoose.Schema({
  Patient_Name: String,
  Age: Number,
  Sex: {
    type: String,
    enum: ['Male', 'Female']
  },
  Ethnicity: {
    type: String,
    enum: ['Black', 'Asian', 'White', 'Hispanic', 'Other']
  },
  Category: {
    type: String,
    enum: ['Diagnosis Issues', 'Communication', 'Healthcare Access', 'Procedural Errors', 'None']
  },
  Subcategory: {
    type: String,
    enum: ['Communication Barrier', 'Delayed Diagnosis', 'Postpartum Infections', 'Frequent Visits', 'Transport Issues', 'None']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});
const Feedback = mongoose.model('feedback', FeedbackSchema);

app.get('/api/analysis/event-summary', async (req, res) => {
    const { eventType, filter } = req.query;
  
    const matchStage = { $match: { event_type: eventType } };
  
    let groupStage;
    if (filter === 'hourly') {
      groupStage = {
        $group: {
          _id: { hour: { $hour: "$timestamp" }, dayOfYear: { $dayOfYear: "$timestamp" } },
          count: { $sum: 1 },
        },
      };
    } else if (filter === 'daily') {
      groupStage = {
        $group: {
          _id: { day: { $dayOfWeek: "$timestamp" }, week: { $week: "$timestamp" } },
          count: { $sum: 1 },
        },
      };
    }
  
    const avgStage = {
      $group: {
        _id: filter === 'hourly' ? "$_id.hour" : "$_id.day",
        avgCount: { $avg: "$count" },
      },
    };
  
    const projectionStage = {
      $project: {
        label: filter === 'hourly'
          ? { $concat: [{ $toString: "$_id" }, ":00 - ", { $toString: { $add: ["$_id", 1] } }, ":00"] }
          : {
              $switch: {
                branches: [
                  { case: { $eq: ["$_id", 1] }, then: "Sunday" },
                  { case: { $eq: ["$_id", 2] }, then: "Monday" },
                  { case: { $eq: ["$_id", 3] }, then: "Tuesday" },
                  { case: { $eq: ["$_id", 4] }, then: "Wednesday" },
                  { case: { $eq: ["$_id", 5] }, then: "Thursday" },
                  { case: { $eq: ["$_id", 6] }, then: "Friday" },
                  { case: { $eq: ["$_id", 7] }, then: "Saturday" },
                ],
                default: "Unknown",
              },
            },
        avgCount: 1,
        _id: 0,
      },
    };
  
    try {
      const results = await Event.aggregate([matchStage, groupStage, avgStage, projectionStage]);
      const highest = results.reduce((max, curr) => (curr.avgCount > (max?.avgCount || 0) ? curr : max), null)?.label;
      const lowest = results.reduce((min, curr) => (curr.avgCount < (min?.avgCount || Infinity) ? curr : min), null)?.label;
      res.json({ data: results, highest, lowest });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching data");
    }
  });

// Endpoint to get feedback data by ethnicity
app.get('/api/feedback/analysis', async (req, res) => {
  try {
    const result = await Feedback.aggregate([
      {
        $group: {
          _id: {
            category: "$Category",
            subcategory: "$Subcategory",
            ethnicity: "$Ethnicity"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            category: "$_id.category",
            ethnicity: "$_id.ethnicity"
          },
          subcategories: {
            $push: {
              subcategory: "$_id.subcategory",
              count: "$count"
            }
          }
        }
      }
    ]);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching feedback analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Updated endpoint to include gender filter
app.get('/api/feedback/subcategory-ethnicity', async (req, res) => {
  try {
    const { gender } = req.query;
    
    // Build the match stage based on gender filter
    const matchStage = gender ? { Sex: gender } : {};

    const result = await Feedback.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            subcategory: '$Subcategory',
            ethnicity: '$Ethnicity'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.subcategory',
          ethnicityData: {
            $push: {
              ethnicity: '$_id.ethnicity',
              count: '$count'
            }
          }
        }
      }
    ]);

    res.json(result);
  } catch (error) {
    console.error('Error getting subcategory-ethnicity analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to get age range vs subcategory analysis
app.get('/api/feedback/age-subcategory', async (req, res) => {
  try {
    const { subcategory } = req.query;
    console.log('Requested subcategory:', subcategory);

    // Build match query
    const matchQuery = subcategory && subcategory !== 'all' 
      ? { Subcategory: subcategory }
      : {};

    // First, get all distinct subcategories if none specified
    let subcategories = [];
    if (!subcategory || subcategory === 'all') {
      subcategories = await Feedback.distinct('Subcategory');
    } else {
      subcategories = [subcategory];
    }

    // Get age distribution for each subcategory
    const result = await Feedback.aggregate([
      // Initial match to filter by subcategory if specified
      { $match: matchQuery },
      
      // Create age range categories
      {
        $addFields: {
          ageRange: {
            $switch: {
              branches: [
                { case: { $lte: ['$Age', 18] }, then: '0-18' },
                { case: { $lte: ['$Age', 30] }, then: '19-30' },
                { case: { $lte: ['$Age', 45] }, then: '31-45' },
                { case: { $lte: ['$Age', 60] }, then: '46-60' }
              ],
              default: '61+'
            }
          }
        }
      },

      // Group by subcategory and age range to get counts
      {
        $group: {
          _id: {
            subcategory: '$Subcategory',
            ageRange: '$ageRange'
          },
          count: { $sum: 1 }
        }
      },

      // Sort by subcategory and age range for consistent ordering
      {
        $sort: {
          '_id.subcategory': 1,
          '_id.ageRange': 1
        }
      }
    ]);

    // Transform the data for the frontend
    const ageRanges = ['0-18', '19-30', '31-45', '46-60', '61+'];
    const formattedData = subcategories.map(subcat => ({
      subcategory: subcat,
      ageData: ageRanges.map(range => {
        const dataPoint = result.find(r => 
          r._id.subcategory === subcat && 
          r._id.ageRange === range
        );
        return {
          ageRange: range,
          count: dataPoint ? dataPoint.count : 0
        };
      })
    }));

    console.log('Formatted data:', formattedData);
    res.json(formattedData);

  } catch (error) {
    console.error('Error getting age-subcategory analysis:', error);
    res.status(500).json({ 
      error: 'Error getting age-subcategory analysis',
      message: error.message 
    });
  }
});

// Endpoint to submit feedback
app.post('/api/feedback/submit', async (req, res) => {
  try {
    const {
      Patient_Name,
      Age,
      Sex,
      Ethnicity,
      Category,
      Subcategory
    } = req.body;

    // Validate required fields
    if (!Patient_Name || !Age || !Sex || !Ethnicity || !Category || !Subcategory) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate Age
    if (Age < 0 || Age > 120) {
      return res.status(400).json({ error: 'Invalid age' });
    }

    const feedback = new Feedback({
      Patient_Name,
      Age,
      Sex,
      Ethnicity,
      Category,
      Subcategory
    });

    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to get form options
app.get('/api/feedback/options', async (req, res) => {
  try {
    res.json({
      sex: ['Male', 'Female'],
      ethnicity: ['Black', 'Asian', 'White', 'Hispanic', 'Other'],
      category: ['Diagnosis Issues', 'Communication', 'Healthcare Access', 'Procedural Errors', 'None'],
      subcategory: ['Communication Barrier', 'Delayed Diagnosis', 'Postpartum Infections', 'Frequent Visits', 'Transport Issues', 'None']
    });
  } catch (error) {
    console.error('Error fetching form options:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
