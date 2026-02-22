import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './Navigation';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';
import Compare from './Compare';
import Insights from './Insights';
import './App.css';

const App = () => {
  const [hasComparisonData, setHasComparisonData] = useState(false);

  useEffect(() => {
    // Check if there's comparison data in localStorage
    const checkComparisonData = () => {
      const data = localStorage.getItem('comparisonData');
      setHasComparisonData(!!data);
    };

    // Check initially
    checkComparisonData();

    // Listen for storage changes
    window.addEventListener('storage', checkComparisonData);
    
    // Also listen for custom events from Dashboard
    window.addEventListener('comparisonDataReady', checkComparisonData);

    return () => {
      window.removeEventListener('storage', checkComparisonData);
      window.removeEventListener('comparisonDataReady', checkComparisonData);
    };
  }, []);

  return (
    <Router>
      <div className="app">
        <Navigation hasComparisonData={hasComparisonData} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
