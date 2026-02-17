import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Carbon-Wise</h1>
          <p className="hero-subtitle">Lifecycle Vehicle Carbon Intelligence Platform</p>
          <p className="hero-description">
            Make informed decisions about your vehicle's environmental impact. 
            Compare carbon footprints, analyze emissions, and discover sustainable alternatives.
          </p>
          <div className="hero-buttons">
            <Link to="/dashboard" className="btn btn-primary">
              Get Started
            </Link>
            <button className="btn btn-secondary">
              Learn More
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="eco-graphic">
            <div className="leaf-icon">🌿</div>
            <div className="car-icon">🚗</div>
            <div className="chart-icon">📊</div>
          </div>
        </div>
      </header>

      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Carbon-Wise?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Comprehensive Analysis</h3>
              <p>Get detailed lifecycle carbon emissions data for thousands of vehicle models.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Regional Insights</h3>
              <p>Understand how your location affects your vehicle's environmental impact.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Smart Recommendations</h3>
              <p>Receive personalized suggestions for reducing your carbon footprint.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Real-time Comparisons</h3>
              <p>Compare multiple vehicles side-by-side to make the best choice.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <h2>Ready to Make a Difference?</h2>
          <p>Start analyzing your vehicle's carbon footprint today.</p>
          <Link to="/dashboard" className="btn btn-primary btn-large">
            Launch Dashboard
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2024 Carbon-Wise. Building a sustainable future, one vehicle at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
