import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = ({ hasComparisonData }) => {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <span className="brand-icon">🌿</span>
            <span className="brand-text">Carbon-Wise</span>
          </Link>
        </div>

        <div className="nav-menu">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          {hasComparisonData && (
            <Link
              to="/compare"
              className={`nav-link ${location.pathname === '/compare' ? 'active' : ''}`}
            >
              Compare
            </Link>
          )}
          <Link
            to="/insights"
            className={`nav-link ${location.pathname === '/insights' ? 'active' : ''}`}
          >
            Insights
          </Link>
        </div>

        <div className="nav-toggle">
          <span className="hamburger"></span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
