import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_URL = 'http://localhost:3001/api';

// Add spinner animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

const Dashboard = () => {
  const [dailyMiles, setDailyMiles] = useState(30);
  const [yearsOwnership, setYearsOwnership] = useState(10);
  const [region, setRegion] = useState('California');
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [carbonResults, setCarbonResults] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [gridFactors, setGridFactors] = useState({});
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchVehicles();
    fetchGridFactors();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_URL}/vehicles?limit=20`);
      const data = await response.json();
      setAvailableVehicles(data.vehicles);
      // Auto-select first 3 vehicles
      const defaultSelection = data.vehicles.slice(0, 3).map(v => v.id);
      setSelectedVehicles(defaultSelection);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setLoading(false);
    }
  };

  const fetchGridFactors = async () => {
    try {
      const response = await fetch(`${API_URL}/grid-emissions`);
      const data = await response.json();
      setGridFactors(data);
    } catch (error) {
      console.error('Error fetching grid factors:', error);
    }
  };

  const calculateEmissions = async () => {
    try {
      const response = await fetch(`${API_URL}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleIds: selectedVehicles,
          dailyMiles,
          yearsOwnership,
          region
        })
      });
      const data = await response.json();
      setCarbonResults(data.results);
      setRecommendation(data.recommendation);
      
      // Save comparison data to localStorage and trigger event
      const comparisonData = {
        carbonResults: data.results,
        recommendation: data.recommendation
      };
      localStorage.setItem('comparisonData', JSON.stringify(comparisonData));
      window.dispatchEvent(new CustomEvent('comparisonDataReady'));
    } catch (error) {
      console.error('Error calculating emissions:', error);
      alert('Error calculating emissions. Please try again.');
    } finally {
      setCalculating(false);
    }
  };

  const toggleVehicle = (vehicleId) => {
    if (selectedVehicles.includes(vehicleId)) {
      if (selectedVehicles.length > 1) {
        setSelectedVehicles(selectedVehicles.filter(id => id !== vehicleId));
      }
    } else {
      setSelectedVehicles([...selectedVehicles, vehicleId]);
    }
  };

  const getVehicleType = (vehicle) => {
    if (vehicle.isElectric) return 'EV';
    if (vehicle.isHybrid) return 'Hybrid';
    return 'ICE';
  };

  const COLORS = {
    manufacturing: '#FF6B9D',
    operational: '#4ECDC4',
    disposal: '#FFA07A',
    EV: '#00D9FF',
    Hybrid: '#FFE66D',
    ICE: '#FF6B9D'
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '1.5rem'
      }}>
        Loading Carbon-Wise...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
      fontFamily: "'Inter', sans-serif",
      color: '#FFFFFF'
    }}>
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 4rem' }}>
        
        {/* Input Section */}
        <section style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '3rem',
          marginBottom: '3rem'
        }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #FFE66D, #FF6B9D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Calculate Your True Carbon Footprint
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#B0BEC5', marginBottom: '2rem' }}>
            Beyond marketing claims—discover the complete lifecycle emissions
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4ECDC4', fontWeight: '600' }}>
                Daily Miles Driven
              </label>
              <input
                type="number"
                value={dailyMiles}
                onChange={(e) => setDailyMiles(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(78, 205, 196, 0.3)',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '1.1rem'
                }}
              />
              <small style={{ color: '#B0BEC5' }}>
                {(dailyMiles * 365).toLocaleString()} miles/year
              </small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4ECDC4', fontWeight: '600' }}>
                Years of Ownership
              </label>
              <input
                type="number"
                value={yearsOwnership}
                onChange={(e) => setYearsOwnership(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(78, 205, 196, 0.3)',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '1.1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4ECDC4', fontWeight: '600' }}>
                Your Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(78, 205, 196, 0.3)',
                  borderRadius: '12px',
                  color: '#FFFFFF',
                  fontSize: '1.1rem'
                }}
              >
                {Object.keys(gridFactors).map(r => (
                  <option key={r} value={r} style={{ background: '#203A43' }}>
                    {r} ({gridFactors[r].gCO2_per_kWh}g CO2/kWh)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div style={{ marginTop: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '1rem', color: '#4ECDC4', fontWeight: '600', fontSize: '1.1rem' }}>
              Select Vehicles to Compare
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {availableVehicles.map(vehicle => {
                const isSelected = selectedVehicles.includes(vehicle.id);
                const type = getVehicleType(vehicle);
                
                return (
                  <button
                    key={vehicle.id}
                    onClick={() => toggleVehicle(vehicle.id)}
                    style={{
                      padding: '1rem',
                      background: isSelected ? 'linear-gradient(135deg, rgba(78, 205, 196, 0.3), rgba(0, 217, 255, 0.3))' : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected ? '2px solid #4ECDC4' : '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      {vehicle.make} {vehicle.model}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: COLORS[type], fontWeight: '500' }}>
                      {type} • {vehicle.year}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              onClick={calculateEmissions}
              disabled={calculating || selectedVehicles.length === 0}
              style={{
                padding: '1rem 3rem',
                background: calculating 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'linear-gradient(135deg, #4ECDC4, #00D9FF)',
                color: calculating ? '#B0BEC5' : '#0F2027',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1.2rem',
                fontWeight: '600',
                cursor: calculating || selectedVehicles.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: calculating || selectedVehicles.length === 0 ? 0.6 : 1,
                minWidth: '200px'
              }}
              onMouseOver={(e) => {
                if (!calculating && selectedVehicles.length > 0) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 20px rgba(78, 205, 196, 0.3)';
                }
              }}
              onMouseOut={(e) => {
                if (!calculating && selectedVehicles.length > 0) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {calculating ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #B0BEC5',
                    borderTop: '2px solid #4ECDC4',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Calculating...
                </span>
              ) : (
                'Calculate'
              )}
            </button>
            {selectedVehicles.length === 0 && (
              <p style={{ marginTop: '1rem', color: '#FF6B9D', fontSize: '0.9rem' }}>
                Please select at least one vehicle to compare
              </p>
            )}
          </div>
        </section>

        {/* Recommendation */}
        {recommendation && (
          <section style={{
            background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.15), rgba(0, 217, 255, 0.15))',
            border: '2px solid #4ECDC4',
            borderRadius: '20px',
            padding: '2.5rem',
            marginBottom: '3rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '3rem' }}>🏆</div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#4ECDC4' }}>
                  Best Choice: {recommendation.vehicle.make} {recommendation.vehicle.model}
                </h3>
                <p style={{ margin: 0, color: '#B0BEC5' }}>
                  Lowest Total Carbon Footprint
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '1.5rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.9rem', color: '#B0BEC5', marginBottom: '0.5rem' }}>
                  Total Lifecycle Emissions
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#4ECDC4' }}>
                  {recommendation.emissions.totalTons} tons
                </div>
                <div style={{ fontSize: '0.85rem', color: '#B0BEC5', marginTop: '0.5rem' }}>
                  {recommendation.emissions.kgPerMile} kg CO2/mile
                </div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '1.5rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.9rem', color: '#B0BEC5', marginBottom: '1rem' }}>
                  Breakdown
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: COLORS.manufacturing }}>Manufacturing:</span>
                    <span>{(recommendation.emissions.manufacturing / 1000).toFixed(1)}t</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: COLORS.operational }}>Operational:</span>
                    <span>{(recommendation.emissions.operational / 1000).toFixed(1)}t</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: COLORS.disposal }}>Disposal:</span>
                    <span>{(recommendation.emissions.disposal / 1000).toFixed(1)}t</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Comparison Chart */}
        {carbonResults.length > 0 && (
          <section style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '2.5rem'
          }}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>
              Lifecycle Carbon Comparison
            </h3>

            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={carbonResults.map(r => ({
                name: `${r.vehicle.make} ${r.vehicle.model}`,
                manufacturing: r.emissions.manufacturing,
                operational: r.emissions.operational,
                disposal: r.emissions.disposal
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="name" stroke="#B0BEC5" tick={{ fill: '#B0BEC5' }} />
                <YAxis stroke="#B0BEC5" tick={{ fill: '#B0BEC5' }} label={{ value: 'kg CO2', angle: -90, position: 'insideLeft', fill: '#B0BEC5' }} />
                <Tooltip contentStyle={{ background: 'rgba(15, 32, 39, 0.95)', border: '1px solid rgba(78, 205, 196, 0.5)', borderRadius: '8px', color: '#FFFFFF' }} />
                <Legend />
                <Bar dataKey="manufacturing" stackId="a" fill={COLORS.manufacturing} name="Manufacturing" />
                <Bar dataKey="operational" stackId="a" fill={COLORS.operational} name="Operational" />
                <Bar dataKey="disposal" stackId="a" fill={COLORS.disposal} name="Disposal" />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Compare Button */}
        {carbonResults.length > 0 && (
          <section style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link 
              to="/compare" 
              state={{ carbonResults, recommendation }}
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #4ECDC4, #00D9FF)',
                color: '#0F2027',
                textDecoration: 'none',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 20px rgba(78, 205, 196, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Compare
            </Link>
          </section>
        )}
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

export default Dashboard;
