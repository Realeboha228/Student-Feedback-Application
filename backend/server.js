const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS Configuration - Allow Vercel frontend
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://student-feedback-application.vercel.app',
    'https://student-feedback-application-1.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    return;
  }
  console.log('✅ Connected to PostgreSQL database');
  release();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Student Feedback API is running!',
    endpoints: {
      getAllFeedback: 'GET /api/feedback',
      addFeedback: 'POST /api/feedback',
      deleteFeedback: 'DELETE /api/feedback/:id',
      dashboard: 'GET /api/dashboard'
    }
  });
});

// GET - Retrieve all feedback
app.get('/api/feedback', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id, 
        studentname as "studentName", 
        coursecode as "courseCode", 
        comments, 
        rating, 
        created_at as "createdAt" 
      FROM feedback 
      ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching feedback:', err);
    res.status(500).json({ error: 'Failed to retrieve feedback' });
  }
});

// POST - Add new feedback
app.post('/api/feedback', async (req, res) => {
  const { studentName, courseCode, comments, rating } = req.body;

  // Validation
  if (!studentName || !courseCode || !comments || !rating) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO feedback (studentname, coursecode, comments, rating) VALUES ($1, $2, $3, $4) RETURNING *',
      [studentName, courseCode, comments, rating]
    );
    
    res.status(201).json({ 
      message: 'Feedback submitted successfully',
      feedback: {
        id: result.rows[0].id,
        studentName: result.rows[0].studentname,
        courseCode: result.rows[0].coursecode,
        comments: result.rows[0].comments,
        rating: result.rows[0].rating,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (err) {
    console.error('Error inserting feedback:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// DELETE - Remove feedback
app.delete('/api/feedback/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      'DELETE FROM feedback WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    res.json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    console.error('Error deleting feedback:', err);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

// GET - Dashboard statistics
app.get('/api/dashboard', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_feedback,
        AVG(rating)::numeric(10,1) as average_rating,
        MIN(rating) as lowest_rating,
        MAX(rating) as highest_rating
      FROM feedback
    `);
    
    const distribution = await pool.query(`
      SELECT rating, COUNT(*) as count
      FROM feedback
      GROUP BY rating
      ORDER BY rating DESC
    `);
    
    const topCourses = await pool.query(`
      SELECT coursecode as course, COUNT(*) as count
      FROM feedback
      GROUP BY coursecode
      ORDER BY count DESC
      LIMIT 5
    `);
    
    res.json({
      totalFeedback: parseInt(stats.rows[0].total_feedback),
      averageRating: parseFloat(stats.rows[0].average_rating) || 0,
      lowestRating: stats.rows[0].lowest_rating,
      highestRating: stats.rows[0].highest_rating,
      ratingDistribution: distribution.rows,
      topCourses: topCourses.rows
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to retrieve dashboard statistics' });
  }
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Access API at http://localhost:${PORT}`);
});
