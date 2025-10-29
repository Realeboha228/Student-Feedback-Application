import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://student-feedback-application-1.onrender.com';

function Dashboard({ refreshTrigger }) {
  const [stats, setStats] = useState({
    totalFeedback: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    topCourses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/feedback`);
      const feedbackData = response.data;

      // Calculate statistics
      const total = feedbackData.length;
      
      const ratingSum = feedbackData.reduce((sum, fb) => sum + fb.rating, 0);
      const avgRating = total > 0 ? (ratingSum / total).toFixed(1) : 0;

      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      feedbackData.forEach(fb => {
        distribution[fb.rating]++;
      });

      // Count feedback per course
      const courseCount = {};
      feedbackData.forEach(fb => {
        courseCount[fb.courseCode] = (courseCount[fb.courseCode] || 0) + 1;
      });

      const topCourses = Object.entries(courseCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([code, count]) => ({ code, count }));

      setStats({
        totalFeedback: total,
        averageRating: avgRating,
        ratingDistribution: distribution,
        topCourses
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-container"><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="dashboard-container">
      <h2>General Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Feedback</h3>
            <p className="stat-number">{stats.totalFeedback}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Average Rating</h3>
            <p className="stat-number">{stats.averageRating} / 5</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Rating Distribution</h3>
        <div className="rating-bars">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = stats.ratingDistribution[rating];
            const percentage = stats.totalFeedback > 0 
              ? (count / stats.totalFeedback * 100).toFixed(1) 
              : 0;
            
            return (
              <div key={rating} className="rating-bar-row">
                <span className="rating-label">{rating} ★</span>
                <div className="rating-bar">
                  <div 
                    className="rating-bar-fill" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="rating-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {stats.topCourses.length > 0 && (
        <div className="dashboard-section">
          <h3>Most Reviewed Courses</h3>
          <div className="top-courses">
            {stats.topCourses.map((course, index) => (
              <div key={course.code} className="course-item">
                <span className="course-rank">#{index + 1}</span>
                <span className="course-name">{course.code}</span>
                <span className="course-count">{course.count} feedback</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
