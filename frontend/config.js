// API Configuration for Production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://student-feedback-application-1.onrender.com';

export const API_ENDPOINTS = {
  FEEDBACK: `${API_BASE_URL}/api/feedback`,
  DASHBOARD: `${API_BASE_URL}/api/dashboard`
};

export default API_BASE_URL;
