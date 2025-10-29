import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FeedbackList.css';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://student-feedback-application-1.onrender.com';

function FeedbackList({ refreshTrigger }) {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/feedback`);
      setFeedbackList(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/feedback/${id}`);
        // Refresh the list
        fetchFeedback();
      } catch (err) {
        console.error('Error deleting feedback:', err);
        alert('Failed to delete feedback');
      }
    }
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return <div className="feedback-list-container"><p>Loading feedback...</p></div>;
  }

  if (error) {
    return <div className="feedback-list-container"><p className="error">{error}</p></div>;
  }

  return (
    <div className="feedback-list-container">
      <h2>All Course Feedback</h2>
      
      {feedbackList.length === 0 ? (
        <p className="no-feedback">No feedback submitted yet.</p>
      ) : (
        <div className="feedback-grid">
          {feedbackList.map((feedback) => (
            <div key={feedback.id} className="feedback-card">
              <div className="feedback-header">
                <h3>{feedback.studentName}</h3>
                <span className="course-code">{feedback.courseCode}</span>
              </div>
              
              <div className="feedback-rating">
                <span className="stars">{renderStars(feedback.rating)}</span>
                <span className="rating-number">({feedback.rating}/5)</span>
              </div>
              
              <p className="feedback-comments">{feedback.comments}</p>
              
              <div className="feedback-footer">
                <span className="feedback-date">
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </span>
                <button 
                  onClick={() => handleDelete(feedback.id)}
                  className="delete-btn"
                  title="Delete feedback"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FeedbackList;
