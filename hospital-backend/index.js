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
    - Key Variables: Healthcare subcategories by ethnic groups
    - Common Query Terms: ethnicity, race, cultural background, distribution
    
    b) Age Group Analysis (Paths: /age-subcategory, /age-distribution):
    - Visualization Type: Bar chart showing healthcare issues by age groups
    - Key Variables: Age groups (18-30, 31-45, 46-60, 61+)
    - Common Query Terms: age, years, elderly, young, distribution
    
    c) Feedback Impact Analysis (Paths: /feedback-impact, /impact-analysis):
    - Visualization Type: Line chart comparing before/after feedback implementation
    - Key Variables: Event counts, dates, feedback metrics
    - Common Query Terms: impact, improvement, changes, effectiveness
    
    d) Sentiment Analysis (Paths: /sentiment, /sentiment-analysis):
    - Visualization Type: Multi-chart sentiment distribution
    - Key Variables: Sentiment scores, feedback categories
    - Common Query Terms: sentiment, opinion, satisfaction, feelings
    
    e) Elderly Visits Analysis (Paths: /elderly-visits, /senior-care):
    - Visualization Type: Time series of elderly patient visits
    - Key Variables: Visit frequency, temporal patterns
    - Common Query Terms: elderly care, senior visits, geriatric
    
    f) Pregnancy Care Analysis (Paths: /pregnant-visits, /maternity):
    - Visualization Type: Time series of pregnancy-related visits
    - Key Variables: Visit patterns, maternal care metrics
    - Common Query Terms: pregnancy, maternal, prenatal care
    
    g) Final Results Dashboard (Paths: /final-results, /overall-analysis):
    - Visualization Type: Comprehensive analysis dashboard
    - Key Variables: Multiple metrics, overall impact
    - Common Query Terms: results, outcomes, final analysis
    
    2. Data Relationships and Insights:
    
    a) Demographic Patterns:
    - Age vs Ethnicity correlations
    - Gender distribution in different care types
    - Cultural factors affecting care access
    
    b) Care Quality Metrics:
    - Patient satisfaction trends
    - Care delivery improvements
    - Feedback implementation impact
    
    c) Special Population Care:
    - Elderly care patterns and needs
    - Maternal care effectiveness
    - Cultural sensitivity in care delivery
    
    d) Temporal Analysis:
    - Visit frequency patterns
    - Seasonal variations in care needs
    - Implementation impact over time
    
    3. Key Healthcare Insights:
    
    a) Patient Experience:
    - Feedback categories and trends
    - Satisfaction metrics
    - Communication effectiveness
    
    b) Care Delivery:
    - Access patterns
    - Service efficiency
    - Quality improvements
    
    c) Population Health:
    - Demographic-specific needs
    - Care gap identification
    - Intervention effectiveness
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
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Schema and Model
const EventSchema = new mongoose.Schema({
  event_id: String,
  timestamp: Date,
  event_type: String,
  patient_id: String
});
const Event = mongoose.model('Event', EventSchema);

// Updated Feedback Schema
const FeedbackSchema = new mongoose.Schema({
  patient_id: String,
  Patient_Name: String,
  Age: Number,
  Sex: {
    type: String,
    required: true,
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
    const { subcategory, sex } = req.query;
    console.log('Requested subcategory:', subcategory, 'sex:', sex);

    // Build match query
    const matchQuery = {};
    if (subcategory && subcategory !== 'all') {
      matchQuery.Subcategory = subcategory;
    }
    if (sex && sex !== 'all') {
      matchQuery.Sex = sex;
    }

    console.log('Match Query:', matchQuery);

    // First, get all distinct subcategories if none specified
    let subcategories = [];
    if (!subcategory || subcategory === 'all') {
      subcategories = await Feedback.distinct('Subcategory');
    } else {
      subcategories = [subcategory];
    }

    // Get age distribution for each subcategory
    const result = await Feedback.aggregate([
      // Initial match to filter by subcategory and sex if specified
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
              default: '60+'
            }
          }
        }
      },

      // Group by subcategory and age range to get counts
      {
        $group: {
          _id: {
            subcategory: '$Subcategory',
            ageRange: '$ageRange',
            sex: '$Sex'
          },
          count: { $sum: 1 }
        }
      },

      // Sort by subcategory and age range for consistent ordering
      {
        $sort: {
          '_id.subcategory': 1,
          '_id.ageRange': 1,
          '_id.sex': 1
        }
      }
    ]);

    // Transform the data for the frontend
    const ageRanges = ['0-18', '19-30', '31-45', '46-60', '60+'];
    const formattedData = subcategories.map(subcat => ({
      subcategory: subcat,
      ageData: ageRanges.map(range => {
        const dataPoints = result.filter(r => 
          r._id.subcategory === subcat && 
          r._id.ageRange === range
        );
        
        const count = dataPoints.reduce((sum, point) => sum + point.count, 0);
        return {
          ageRange: range,
          count: count
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


// Define the schemas
const PatientSchema = new mongoose.Schema({
  patient_id: { type: String, unique: true },
  name: String,
  age: Number,
  gender: String,
  admission_time: Date,
  doctor_id: String,
  nurse_id: String,
  admitted_for: String // New field
});

const Patient = mongoose.model('Patient', PatientSchema);


const NurseSchema = new mongoose.Schema({
  nurse_id: { type: String, unique: true },
  name: String,
  shift: String,
  patients_assigned: Number,
});

const Nurse = mongoose.model('Nurse', NurseSchema);

const DoctorSchema = new mongoose.Schema({
  doctor_id: { type: String, unique: true },
  name: String,
  specialization: String,
  shift: String,
  patients_seen: Number,

});

const Doctor = mongoose.model('Doctor', DoctorSchema);

// Endpoint to analyze patient issues by admission reason
app.get('/api/analysis/admission-issues', async (req, res) => {
  try {
    const { ageGroup, gender } = req.query;

    // Build match query for demographics
    const matchQuery = {};
    if (ageGroup) {
      switch(ageGroup) {
        case '0-18':
          matchQuery.Age = { $lte: 18 };
          break;
        case '19-30':
          matchQuery.Age = { $gt: 18, $lte: 30 };
          break;
        case '31-45':
          matchQuery.Age = { $gt: 30, $lte: 45 };
          break;
        case '46-60':
          matchQuery.Age = { $gt: 45, $lte: 60 };
          break;
        case '60+':
          matchQuery.Age = { $gt: 60 };
          break;
      }
    }
    if (gender) {
      matchQuery.Sex = gender;
    }

    console.log('Match Query:', matchQuery);

    // Join Feedback with Patient data and analyze
    const result = await Feedback.aggregate([
      {
        $lookup: {
          from: 'patients',
          localField: 'patient_id',
          foreignField: 'patient_id',
          as: 'patient_info'
        }
      },
      { $unwind: '$patient_info' },
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: {
            admitted_for: '$patient_info.admitted_for',
            category: '$Category',
            subcategory: '$Subcategory',
            age_group: {
              $switch: {
                branches: [
                  { case: { $lte: ['$Age', 18] }, then: '0-18' },
                  { case: { $lte: ['$Age', 30] }, then: '19-30' },
                  { case: { $lte: ['$Age', 45] }, then: '31-45' },
                  { case: { $lte: ['$Age', 60] }, then: '46-60' }
                ],
                default: '60+'
              }
            },
            sex: '$Sex'
          },
          count: { $sum: 1 },
          patients: { $addToSet: '$patient_id' }
        }
      },
      {
        $group: {
          _id: '$_id.admitted_for',
          issues: {
            $push: {
              category: '$_id.category',
              subcategory: '$_id.subcategory',
              age_group: '$_id.age_group',
              sex: '$_id.sex',
              count: '$count',
              unique_patients: { $size: '$patients' }
            }
          },
          total_issues: { $sum: '$count' }
        }
      },
      {
        $project: {
          admitted_for: '$_id',
          issues: 1,
          total_issues: 1,
          most_common_issues: {
            $slice: [{
              $sortArray: {
                input: '$issues',
                sortBy: { count: -1 }
              }
            }, 3]
          },
          _id: 0
        }
      },
      {
        $sort: { total_issues: -1 }
      }
    ]);

    // Add summary statistics
    const summary = {
      total_records: result.reduce((sum, r) => sum + r.total_issues, 0),
      admission_types: result.length,
      top_issues: result.slice(0, 3).map(r => ({
        admitted_for: r.admitted_for,
        total_issues: r.total_issues,
        main_problems: r.most_common_issues.map(i => ({
          subcategory: i.subcategory,
          count: i.count,
          demographic: `${i.age_group} / ${i.sex}`
        }))
      }))
    };

    res.json({
      summary,
      detailed_analysis: result
    });

  } catch (error) {
    console.error('Error analyzing admission issues:', error);
    res.status(500).json({
      error: 'Error analyzing admission issues',
      message: error.message
    });
  }
});

// Endpoint to analyze admission reasons vs subcategories
app.get('/api/analysis/admission-subcategories', async (req, res) => {
  try {
    const { ageGroup, gender } = req.query;

    // Build match query for demographics
    const matchQuery = {};
    if (ageGroup) {
      switch(ageGroup) {
        case '0-18':
          matchQuery.Age = { $lte: 18 };
          break;
        case '19-30':
          matchQuery.Age = { $gt: 18, $lte: 30 };
          break;
        case '31-45':
          matchQuery.Age = { $gt: 30, $lte: 45 };
          break;
        case '46-60':
          matchQuery.Age = { $gt: 45, $lte: 60 };
          break;
        case '60+':
          matchQuery.Age = { $gt: 60 };
          break;
      }
    }
    if (gender) {
      matchQuery.Sex = gender;
    }

    // Join and analyze data
    const result = await Feedback.aggregate([
      {
        $lookup: {
          from: 'patients',
          localField: 'patient_id',
          foreignField: 'patient_id',
          as: 'patient_info'
        }
      },
      { $unwind: '$patient_info' },
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: {
            admitted_for: '$patient_info.admitted_for',
            subcategory: '$Subcategory'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.admitted_for',
          subcategories: {
            $push: {
              subcategory: '$_id.subcategory',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Get unique subcategories across all admissions
    const allSubcategories = await Feedback.distinct('Subcategory');

    // Format data for the frontend
    const formattedData = {
      admissionReasons: result.map(item => item._id),
      subcategories: allSubcategories,
      data: result.map(item => ({
        admitted_for: item._id,
        total: item.total,
        subcategories: allSubcategories.map(subcat => {
          const found = item.subcategories.find(s => s.subcategory === subcat);
          return found ? found.count : 0;
        })
      }))
    };

    res.json(formattedData);
  } catch (error) {
    console.error('Error analyzing admission subcategories:', error);
    res.status(500).json({
      error: 'Error analyzing admission subcategories',
      message: error.message
    });
  }
});

// Endpoint to analyze events before and after feedback implementation
app.get('/api/analysis/feedback-impact', async (req, res) => {
  try {
    const { referenceDate, eventType } = req.query;
    console.log('Query params:', { referenceDate, eventType });
    
    const refDate = new Date(referenceDate);
    console.log('Reference date:', refDate);

    // Get all feedback to check if we have data
    const allFeedback = await Feedback.find({});
    console.log('Total feedback entries:', allFeedback.length);
    
    // Get feedback data before and after reference date
    const feedbackBefore = await Feedback.aggregate([
      {
        $match: {
          timestamp: { $lt: refDate }
        }
      },
      {
        $group: {
          _id: '$Category',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('Feedback before:', feedbackBefore);

    const feedbackAfter = await Feedback.aggregate([
      {
        $match: {
          timestamp: { $gte: refDate }
        }
      },
      {
        $group: {
          _id: '$Category',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('Feedback after:', feedbackAfter);

    // Check if we have any events
    const allEvents = await Event.find({ event_type: eventType });
    console.log('Total events for type:', eventType, ':', allEvents.length);

    // Get events data before and after reference date with patient feedback
    const eventsBefore = await Event.aggregate([
      {
        $match: {
          event_type: eventType,
          timestamp: { $lt: refDate }
        }
      },
      {
        $lookup: {
          from: 'feedback',
          localField: 'patient_id',
          foreignField: 'patient_id',
          as: 'feedback'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 },
          feedbackCount: {
            $sum: { $cond: [{ $gt: [{ $size: "$feedback" }, 0] }, 1, 0] }
          }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);
    console.log('Events before:', eventsBefore);

    const eventsAfter = await Event.aggregate([
      {
        $match: {
          event_type: eventType,
          timestamp: { $gte: refDate }
        }
      },
      {
        $lookup: {
          from: 'feedback',
          localField: 'patient_id',
          foreignField: 'patient_id',
          as: 'feedback'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 },
          feedbackCount: {
            $sum: { $cond: [{ $gt: [{ $size: "$feedback" }, 0] }, 1, 0] }
          }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);
    console.log('Events after:', eventsAfter);

    // Calculate average events per day
    const avgEventsBefore = eventsBefore.length > 0 ? 
      eventsBefore.reduce((acc, curr) => acc + curr.count, 0) / eventsBefore.length : 0;
    const avgEventsAfter = eventsAfter.length > 0 ? 
      eventsAfter.reduce((acc, curr) => acc + curr.count, 0) / eventsAfter.length : 0;

    // Calculate improvement percentages
    const eventImprovement = avgEventsBefore > 0 ? 
      ((avgEventsAfter - avgEventsBefore) / avgEventsBefore) * 100 : 0;

    // Calculate feedback engagement
    const feedbackEngagementBefore = eventsBefore.length > 0 ?
      (eventsBefore.reduce((acc, curr) => acc + curr.feedbackCount, 0) / 
       eventsBefore.reduce((acc, curr) => acc + curr.count, 0)) * 100 : 0;

    const feedbackEngagementAfter = eventsAfter.length > 0 ?
      (eventsAfter.reduce((acc, curr) => acc + curr.feedbackCount, 0) / 
       eventsAfter.reduce((acc, curr) => acc + curr.count, 0)) * 100 : 0;

    // Prepare summary statistics
    const summary = {
      beforeDate: {
        avgEventsPerDay: avgEventsBefore.toFixed(2),
        totalFeedback: feedbackBefore.reduce((acc, curr) => acc + curr.count, 0),
        feedbackCategories: feedbackBefore,
        feedbackEngagement: feedbackEngagementBefore.toFixed(2) + '%'
      },
      afterDate: {
        avgEventsPerDay: avgEventsAfter.toFixed(2),
        totalFeedback: feedbackAfter.reduce((acc, curr) => acc + curr.count, 0),
        feedbackCategories: feedbackAfter,
        feedbackEngagement: feedbackEngagementAfter.toFixed(2) + '%'
      },
      improvement: {
        events: eventImprovement.toFixed(2),
        feedbackEngagement: (feedbackEngagementAfter - feedbackEngagementBefore).toFixed(2)
      }
    };

    console.log('Sending response:', {
      summary,
      eventsBefore: eventsBefore.length,
      eventsAfter: eventsAfter.length,
      feedbackBefore: feedbackBefore.length,
      feedbackAfter: feedbackAfter.length
    });

    res.json({
      summary,
      eventsBefore,
      eventsAfter,
      feedbackBefore,
      feedbackAfter
    });
  } catch (error) {
    console.error('Error analyzing feedback impact:', error);
    res.status(500).json({
      error: 'Error analyzing feedback impact',
      message: error.message,
      stack: error.stack
    });
  }
});

// Schema for sentiment analysis
const SentimentSchema = new mongoose.Schema({
  Author: String,
  Rating: Number,
  Text: String,
  Polarity: Number,
  Sentiment: String
});

const BeforeSentiment = mongoose.model('before_sentiment', SentimentSchema);
const AfterSentiment = mongoose.model('after_sentiment', SentimentSchema);

// Endpoint to get sentiment analysis comparison
app.get('/api/analysis/sentiment-comparison', async (req, res) => {
  try {
    // Get sentiment data before implementation
    const beforeSentiment = await BeforeSentiment.aggregate([
      {
        $group: {
          _id: '$Sentiment',
          count: { $sum: 1 },
          averageRating: { $avg: '$Rating' },
          averagePolarity: { $avg: '$Polarity' }
        }
      }
    ]);

    // Get sentiment data after implementation
    const afterSentiment = await AfterSentiment.aggregate([
      {
        $group: {
          _id: '$Sentiment',
          count: { $sum: 1 },
          averageRating: { $avg: '$Rating' },
          averagePolarity: { $avg: '$Polarity' }
        }
      }
    ]);

    // Calculate overall statistics
    const beforeStats = await BeforeSentiment.aggregate([
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          averageRating: { $avg: '$Rating' },
          averagePolarity: { $avg: '$Polarity' }
        }
      }
    ]);

    const afterStats = await AfterSentiment.aggregate([
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          averageRating: { $avg: '$Rating' },
          averagePolarity: { $avg: '$Polarity' }
        }
      }
    ]);

    // Calculate improvements
    const improvements = {
      rating: ((afterStats[0].averageRating - beforeStats[0].averageRating) / beforeStats[0].averageRating * 100).toFixed(2),
      polarity: ((afterStats[0].averagePolarity - beforeStats[0].averagePolarity) / beforeStats[0].averagePolarity * 100).toFixed(2)
    };

    res.json({
      before: {
        sentiments: beforeSentiment,
        stats: beforeStats[0]
      },
      after: {
        sentiments: afterSentiment,
        stats: afterStats[0]
      },
      improvements
    });

  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    res.status(500).json({
      error: 'Error analyzing sentiment',
      message: error.message
    });
  }
});

// Schema for visits data
const VisitsSchema = new mongoose.Schema({
  Month: String,
  Elderly_Visits_Before: Number,
  Elderly_Visits_After: Number
});

const PregnantVisitsSchema = new mongoose.Schema({
  Month: String,
  Pregnant_Visits_Before: Number,
  Pregnant_Visits_After: Number
});

const ElderlyVisits = mongoose.model('elderly_visits', VisitsSchema);
const PregnantVisits = mongoose.model('pregnant_visits', PregnantVisitsSchema);

// Endpoint to get elderly visits analysis
app.get('/api/analysis/elderly-visits', async (req, res) => {
  try {
    const visits = await ElderlyVisits.find().sort('Month');
    
    // Calculate total and average visits
    const totalBefore = visits.reduce((sum, visit) => sum + visit.Elderly_Visits_Before, 0);
    const totalAfter = visits.reduce((sum, visit) => sum + visit.Elderly_Visits_After, 0);
    const avgBefore = totalBefore / visits.length;
    const avgAfter = totalAfter / visits.length;

    // Calculate improvement percentage
    const improvement = ((avgAfter - avgBefore) / avgBefore * 100).toFixed(2);

    // Find months with highest and lowest visits
    const highestBefore = Math.max(...visits.map(v => v.Elderly_Visits_Before));
    const highestAfter = Math.max(...visits.map(v => v.Elderly_Visits_After));
    const lowestBefore = Math.min(...visits.map(v => v.Elderly_Visits_Before));
    const lowestAfter = Math.min(...visits.map(v => v.Elderly_Visits_After));

    res.json({
      visits,
      stats: {
        totalBefore,
        totalAfter,
        avgBefore,
        avgAfter,
        improvement,
        highestBefore,
        highestAfter,
        lowestBefore,
        lowestAfter
      }
    });

  } catch (error) {
    console.error('Error analyzing elderly visits:', error);
    res.status(500).json({
      error: 'Error analyzing elderly visits',
      message: error.message
    });
  }
});

// Endpoint to get pregnant visits analysis
app.get('/api/analysis/pregnant-visits', async (req, res) => {
  try {
    const visits = await PregnantVisits.find().sort('Month');
    
    // Calculate total and average visits
    const totalBefore = visits.reduce((sum, visit) => sum + visit.Pregnant_Visits_Before, 0);
    const totalAfter = visits.reduce((sum, visit) => sum + visit.Pregnant_Visits_After, 0);
    const avgBefore = totalBefore / visits.length;
    const avgAfter = totalAfter / visits.length;

    // Calculate improvement percentage
    const improvement = ((avgAfter - avgBefore) / avgBefore * 100).toFixed(2);

    // Find months with highest and lowest visits
    const highestBefore = Math.max(...visits.map(v => v.Pregnant_Visits_Before));
    const highestAfter = Math.max(...visits.map(v => v.Pregnant_Visits_After));
    const lowestBefore = Math.min(...visits.map(v => v.Pregnant_Visits_Before));
    const lowestAfter = Math.min(...visits.map(v => v.Pregnant_Visits_After));

    res.json({
      visits,
      stats: {
        totalBefore,
        totalAfter,
        avgBefore,
        avgAfter,
        improvement,
        highestBefore,
        highestAfter,
        lowestBefore,
        lowestAfter
      }
    });

  } catch (error) {
    console.error('Error analyzing pregnant visits:', error);
    res.status(500).json({
      error: 'Error analyzing pregnant visits',
      message: error.message
    });
  }
});

// Schema for final results data
const FinalResultSchema = new mongoose.Schema({
  subcategory: String,
  ethnicity: String,
  before: Number,
  after: Number
});

const FinalResult = mongoose.model('final_results', FinalResultSchema);

// Endpoint to get final results analysis
app.get('/api/analysis/final-results', async (req, res) => {
  try {
    const results = await FinalResult.find();
    
    // Group data by subcategory
    const groupedData = results.reduce((acc, item) => {
      if (!acc[item.subcategory]) {
        acc[item.subcategory] = [];
      }
      acc[item.subcategory].push(item);
      return acc;
    }, {});

    // Calculate statistics for each subcategory
    const statistics = {};
    Object.keys(groupedData).forEach(subcategory => {
      const items = groupedData[subcategory];
      const totalBefore = items.reduce((sum, item) => sum + item.before, 0);
      const totalAfter = items.reduce((sum, item) => sum + item.after, 0);
      // Change the formula to show reduction as positive improvement
      const improvement = (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(2);
      
      statistics[subcategory] = {
        totalBefore,
        totalAfter,
        improvement,
        byEthnicity: items.reduce((acc, item) => {
          acc[item.ethnicity] = {
            before: item.before,
            after: item.after,
            // Change the formula to show reduction as positive improvement
            change: (((item.before - item.after) / item.before) * 100).toFixed(2)
          };
          return acc;
        }, {})
      };
    });

    res.json({
      rawData: results,
      groupedData,
      statistics
    });

  } catch (error) {
    console.error('Error analyzing final results:', error);
    res.status(500).json({
      error: 'Error analyzing final results',
      message: error.message
    });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
