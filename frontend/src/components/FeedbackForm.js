import React, { useState } from 'react';
import axios from 'axios';
import './FeedbackForm.css';

function FeedbackForm({ onFeedbackSubmitted }) {
  const [formData, setFormData] = useState({
    studentName: '',
    courseCode: '',
    comments: '',
    rating: ''
  });

  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    }

    if (!formData.courseCode.trim()) {
      newErrors.courseCode = 'Course code is required';
    }

    if (!formData.comments.trim()) {
      newErrors.comments = 'Comments are required';
    }

    if (!formData.rating) {
      newErrors.rating = 'Please select a rating';
    } else if (formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Rating must be between 1 and 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/feedback', {
        studentName: formData.studentName,
        courseCode: formData.courseCode,
        comments: formData.comments,
        rating: parseInt(formData.rating)
      });

      setSubmitMessage('Feedback submitted successfully!');
      
      // Reset form
      setFormData({
        studentName: '',
        courseCode: '',
        comments: '',
        rating: ''
      });

      // Notify parent component
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitMessage(''), 3000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitMessage('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <div className="feedback-form-container">
      <h2>Submit Course Feedback</h2>
      
      {submitMessage && (
        <div className={`message ${submitMessage.includes('success') ? 'success' : 'error'}`}>
          {submitMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="form-group">
          <label htmlFor="studentName">Student Name *</label>
          <input
            type="text"
            id="studentName"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            className={errors.studentName ? 'error-input' : ''}
          />
          {errors.studentName && <span className="error-text">{errors.studentName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="courseCode">Course Code *</label>
          <input
            type="text"
            id="courseCode"
            name="courseCode"
            value={formData.courseCode}
            onChange={handleChange}
            placeholder="e.g., CS101"
            className={errors.courseCode ? 'error-input' : ''}
          />
          {errors.courseCode && <span className="error-text">{errors.courseCode}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="comments">Comments *</label>
          <textarea
            id="comments"
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows="4"
            placeholder="Share your feedback about the course..."
            className={errors.comments ? 'error-input' : ''}
          />
          {errors.comments && <span className="error-text">{errors.comments}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="rating">Rating (1-5) *</label>
          <select
            id="rating"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            className={errors.rating ? 'error-input' : ''}
          >
            <option value="">Select a rating</option>
            <option value="1">1 - Poor</option>
            <option value="2">2 - Fair</option>
            <option value="3">3 - Good</option>
            <option value="4">4 - Very Good</option>
            <option value="5">5 - Excellent</option>
          </select>
          {errors.rating && <span className="error-text">{errors.rating}</span>}
        </div>

        <button type="submit" className="submit-btn">Submit Feedback</button>
      </form>
    </div>
  );
}

export default FeedbackForm;