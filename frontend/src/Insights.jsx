import React from 'react';
import './Insights.css';

const Insights = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
      fontFamily: "'Inter', sans-serif",
      color: '#FFFFFF'
    }}>
      {/* Header */}
      <header style={{
        padding: '2rem 4rem',
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', background: 'linear-gradient(135deg, #4ECDC4, #00D9FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700' }}>
              Environmental Insights
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#B0BEC5' }}>
              Understanding your carbon impact
            </p>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 4rem' }}>
        
        {/* Key Insights Section */}
        <section style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '3rem',
          marginBottom: '3rem'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
            Key Environmental Insights
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="insight-card">
              <div className="insight-header">
                <h3>Grid Carbon Intensity</h3>
              </div>
              <p>
                Your region's electricity grid significantly impacts EV emissions. 
                Clean grids maximize environmental benefits, while coal-heavy grids reduce them.
              </p>
              <div className="insight-metric">
                <span className="metric-value">400-800g</span>
                <span className="metric-label">CO2/kWh range</span>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-header">
                <h3>Manufacturing Impact</h3>
              </div>
              <p>
                EV battery production creates significant upfront emissions. 
                Full lifecycle analysis reveals the complete environmental picture.
              </p>
              <div className="insight-metric">
                <span className="metric-value">8-15 tons</span>
                <span className="metric-label">Manufacturing CO2</span>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-header">
                <h3>End-of-Life</h3>
              </div>
              <p>
                Battery disposal and recycling add to total footprint. 
                Proper recycling is crucial for minimizing environmental impact.
              </p>
              <div className="insight-metric">
                <span className="metric-value">200kg</span>
                <span className="metric-label">Disposal CO2</span>
              </div>
            </div>
          </div>
        </section>

        {/* Regional Impact Section */}
        <section style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '3rem',
          marginBottom: '3rem'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
            Regional Impact Analysis
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div className="region-card california">
              <h4>Sweden</h4>
              <div className="grid-factor">
                <span className="factor-value">13</span>
                <span className="factor-unit">g CO2/kWh</span>
              </div>
              <p>Excellent for EVs with hydro and renewable dominance</p>
            </div>

            <div className="region-card texas">
              <h4>France</h4>
              <div className="grid-factor">
                <span className="factor-value">85</span>
                <span className="factor-unit">g CO2/kWh</span>
              </div>
              <p>Very clean grid with nuclear power dominance</p>
            </div>

            <div className="region-card newyork">
              <h4>Germany</h4>
              <div className="grid-factor">
                <span className="factor-value">401</span>
                <span className="factor-unit">g CO2/kWh</span>
              </div>
              <p>Moderate grid with coal and renewable mix</p>
            </div>

            <div className="region-card florida">
              <h4>Poland</h4>
              <div className="grid-factor">
                <span className="factor-value">736</span>
                <span className="factor-unit">g CO2/kWh</span>
              </div>
              <p>Higher impact due to coal dominance - DIRTIEST IN EU</p>
            </div>
          </div>
        </section>

        {/* Vehicle Type Comparison */}
        <section style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '3rem',
          marginBottom: '3rem'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
            Vehicle Type Environmental Impact
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="vehicle-type-card ev">
              <h3>Electric Vehicles</h3>
              <div className="emissions-breakdown">
                <div className="emission-item">
                  <span>Manufacturing:</span>
                  <span>10-12 tons CO2</span>
                </div>
                <div className="emission-item">
                  <span>Operational:</span>
                  <span>0-5 tons CO2/year</span>
                </div>
              </div>
              <p className="vehicle-note">
                Zero tailpipe emissions but higher manufacturing footprint
              </p>
            </div>

            <div className="vehicle-type-card hybrid">
              <h3>Hybrid Vehicles</h3>
              <div className="emissions-breakdown">
                <div className="emission-item">
                  <span>Manufacturing:</span>
                  <span>8-10 tons CO2</span>
                </div>
                <div className="emission-item">
                  <span>Operational:</span>
                  <span>3-6 tons CO2/year</span>
                </div>
              </div>
              <p className="vehicle-note">
                Balanced approach with reduced operational emissions
              </p>
            </div>

            <div className="vehicle-type-card ice">
              <h3>Internal Combustion</h3>
              <div className="emissions-breakdown">
                <div className="emission-item">
                  <span>Manufacturing:</span>
                  <span>6-8 tons CO2</span>
                </div>
                <div className="emission-item">
                  <span>Operational:</span>
                  <span>5-10 tons CO2/year</span>
                </div>
              </div>
              <p className="vehicle-note">
                Lower manufacturing but higher operational emissions
              </p>
            </div>
          </div>
        </section>

        {/* Recommendations Section */}
        <section style={{
          background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.15), rgba(0, 217, 255, 0.15))',
          border: '2px solid #4ECDC4',
          borderRadius: '20px',
          padding: '3rem',
          marginBottom: '3rem'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', color: '#4ECDC4' }}>
            Making Informed Choices
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="recommendation-item">
              <h4>Consider Your Location</h4>
              <p>
                Regional grid emissions dramatically impact EV benefits. 
                Research your local energy mix for accurate assessments.
              </p>
            </div>

            <div className="recommendation-item">
              <h4>Total Lifecycle Analysis</h4>
              <p>
                Look beyond operational emissions. 
                Manufacturing and disposal impacts are crucial for true environmental assessment.
              </p>
            </div>

            <div className="recommendation-item">
              <h4>Usage Patterns Matter</h4>
              <p>
                Daily mileage and ownership duration significantly impact 
                total emissions. Choose vehicles that match your actual needs.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ padding: '3rem 4rem', background: 'rgba(0, 0, 0, 0.5)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', marginTop: '4rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#4ECDC4' }}>Carbon-Wise</h3>
            <p style={{ margin: 0, color: '#B0BEC5', fontSize: '0.9rem' }}>Team Loop Breakers: Atharva & Utkarsh</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, color: '#B0BEC5', fontSize: '0.9rem' }}>Data Sources:</p>
            <p style={{ margin: '0.25rem 0 0 0', color: '#4ECDC4', fontSize: '0.85rem' }}>EPA • EEA • IVL • Argonne GREET</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Insights;
