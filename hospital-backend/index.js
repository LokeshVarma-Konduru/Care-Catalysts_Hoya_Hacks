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

    a) Subcategory vs Ethnicity Chart (Path: /subcategory-ethnicity):
    - Shows distribution of healthcare issues across different ethnic groups
    - Interactive filters for gender selection
    - Color-coded bars for easy comparison
    - Features:
        * X-axis: Healthcare subcategories
        * Y-axis: Number of cases
        * Multiple ethnic groups displayed side by side
        * Filterable by gender (All, Male, Female)
    - Navigation: "Show me the subcategory vs ethnicity graph" or "Navigate to ethnicity distribution"
    
    b) Age vs Subcategory Chart (Path: /age-subcategory):
    - Visualizes healthcare issues across different age groups
    - Interactive subcategory selection
    - Age groups in ranges (18-30, 31-45, 46-60, 61+)
    - Features:
        * X-axis: Age groups
        * Y-axis: Number of cases
        * Color-coded bars for different subcategories
        * Filterable by specific subcategory
    - Navigation: "Show me the age distribution graph" or "Navigate to age analysis"
    
    c) Feedback Analysis Dashboard (Path: /feedback):
    - Overall distribution of feedback categories
    - Ethnicity-specific analysis
    - Trend analysis over time
    - Features:
        * Category distribution pie chart
        * Time-series trend analysis
        * Ethnicity-wise breakdown
    - Navigation: "Show me the feedback analysis" or "Open feedback dashboard"
    
    d) Event Trends Chart (Path: /events):
    - Hospital event patterns and timing analysis
    - Hourly and daily trend visualization
    - Features:
        * Time-based event distribution
        * Peak hours identification
        * Weekly patterns
        * Admission and discharge trends
    - Navigation: "Show me hospital event trends" or "View event analysis"

    2. Graph Interaction Instructions:
    - Filter Options:
        * Gender selection (All, Male, Female)
        * Age group selection
        * Ethnicity selection
        * Time period selection
    - Hover Effects:
        * Detailed tooltips with exact values
        * Percentage distributions
        * Comparative statistics
    - Export Options:
        * Download data as CSV
        * Save graph as image
        * Generate detailed reports

    3. Graph Insights and Analysis:
    
    a) Subcategory-Ethnicity Patterns:
    - Communication barriers more prevalent in certain ethnic groups
    - Transport issues showing demographic correlations
    - Healthcare access variations across ethnicities
    
    b) Age-Related Trends:
    - Different health issues predominant in specific age groups
    - Age-specific service utilization patterns
    - Impact of age on healthcare access
    
    c) Feedback Patterns:
    - Most common categories of feedback
    - Demographic-specific concerns
    - Temporal trends in patient satisfaction
    
    d) Event Distribution:
    - Peak admission hours and days
    - Department-specific busy periods
    - Resource utilization patterns

    4. Navigation Commands:
    - "Show graph [type]": Opens specific graph view
    - "Compare [metric1] vs [metric2]": Shows comparative analysis
    - "Filter by [criterion]": Applies specific filters
    - "Navigate to [dashboard]": Opens specific dashboard
    - "Analyze trends in [category]": Shows trend analysis
    
    5. Advanced Analysis Features:
    - Cross-reference multiple graphs
    - Demographic correlation analysis
    - Time-based pattern recognition
    - Predictive trend analysis
`;

initializeVectorStore(medicalKnowledge).then(() => {
    console.log('RAG system initialized with comprehensive graph knowledge and navigation capabilities');
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
