import React, { useState } from 'react';
import './App.css';
import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';
import Dashboard from './components/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFeedbackSubmitted = () => {
    // Trigger refresh of list and dashboard
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1> Student Feedback System</h1>
        <p>Share your course experience and help us improve!</p>
      </header>

      <nav className="app-nav">
        <button 
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          home
        </button>
        <button 
          className={`nav-btn ${activeTab === 'submit' ? 'active' : ''}`}
          onClick={() => setActiveTab('submit')}
        >
          Submit Feedback
        </button>
        <button 
          className={`nav-btn ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          View Feedback
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'dashboard' && <Dashboard refreshTrigger={refreshTrigger} />}
        {activeTab === 'submit' && <FeedbackForm onFeedbackSubmitted={handleFeedbackSubmitted} />}
        {activeTab === 'view' && <FeedbackList refreshTrigger={refreshTrigger} />}
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 Student Feedback System. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;