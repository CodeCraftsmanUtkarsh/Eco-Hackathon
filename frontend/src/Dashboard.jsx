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
  const [region, setRegion] = useState('European Average');
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [carbonResults, setCarbonResults] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [gridFactors, setGridFactors] = useState({});
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [showMoreVehicles, setShowMoreVehicles] = useState(false);
  const [selectedOtherVehicle, setSelectedOtherVehicle] = useState('');

  // Most frequently purchased cars in Europe (based on market data)
  const POPULAR_VEHICLES = [
    'VW-Golf-2024',
    'VW-Polo-2024',
    'VW-Passat-2024',
    'VW-Tiguan-2024',
    'Renault-Clio-2024',
    'Renault-Megane-2024',
    'Renault-Captur-2024',
    'Peugeot-208-2024',
    'Peugeot-3008-2024',
    'Peugeot-2008-2024',
    'Ford-Fiesta-2024',
    'Ford-Focus-2024',
    'Ford-Kuga-2024',
    'Opel-Corsa-2024',
    'Opel-Astra-2024',
    'Opel-Mokka-2024',
    'Toyota-Yaris-2024',
    'Toyota-Corolla-2024',
    'Toyota-RAV4-2024',
    'Nissan-Qashqai-2024',
    'Nissan-Juke-2024',
    'Dacia-Sandero-2024',
    'Dacia-Duster-2024',
    'Skoda-Octavia-2024',
    'Skoda-Fabia-2024',
    'Mercedes-C-Class-2024',
    'BMW-3-Series-2024',
    'Audi-A4-2024',
    'Volvo-XC40-2024',
    'Jaguar-E-Pace-2024',
    'Land-Rover-Evoque-2024',
    'Mazda-CX-5-2024'
  ];

  // Fetch initial data
  useEffect(() => {
    fetchVehicles();
    fetchGridFactors();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_URL}/vehicles?limit=50`);
      const data = await response.json();
      setAvailableVehicles(data.vehicles);
      // Start with no vehicles selected - user must choose manually
      setSelectedVehicles([]);
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

  const handleOtherVehicleSelect = (vehicleId) => {
    if (vehicleId && !selectedVehicles.includes(vehicleId)) {
      setSelectedVehicles([...selectedVehicles, vehicleId]);
      setSelectedOtherVehicle('');
    }
  };

  const getPopularVehicles = () => {
    const popular = availableVehicles.filter(vehicle => POPULAR_VEHICLES.includes(vehicle.id));
    console.log('Available vehicles count:', availableVehicles.length);
    console.log('First few available vehicle IDs:', availableVehicles.slice(0, 5).map(v => v.id));
    console.log('Popular vehicles count:', popular.length);
    return popular;
  };

  const getOtherVehicles = () => {
    return availableVehicles.filter(vehicle => !POPULAR_VEHICLES.includes(vehicle.id));
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
                Daily Miles Driven: <span style={{ color: '#ffffff', fontWeight: '700' }}>{dailyMiles}</span>
              </label>
              <input
                type="range"
                min="5"
                max="100"
                value={dailyMiles}
                onChange={(e) => setDailyMiles(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(78, 205, 196, 0.2)',
                  borderRadius: '4px',
                  outline: 'none',
                  WebkitAppearance: 'none'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: '#B0BEC5' }}>
                <span>5 mi/day</span>
                <span>100 mi/day</span>
              </div>
              <small style={{ color: '#B0BEC5', display: 'block', marginTop: '0.5rem' }}>
                📊 {(dailyMiles * 365).toLocaleString()} miles/year
                {dailyMiles <= 15 && " - Light driver"}
                {dailyMiles > 15 && dailyMiles <= 40 && " - Average driver"}
                {dailyMiles > 40 && " - Heavy driver"}
              </small>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4ECDC4', fontWeight: '600' }}>
                Years of Ownership: <span style={{ color: '#ffffff', fontWeight: '700' }}>{yearsOwnership}</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={yearsOwnership}
                onChange={(e) => setYearsOwnership(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(78, 205, 196, 0.2)',
                  borderRadius: '4px',
                  outline: 'none',
                  WebkitAppearance: 'none'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: '#B0BEC5' }}>
                <span>1 year</span>
                <span>10 years</span>
                <span>20 years</span>
              </div>
              <small style={{ color: '#B0BEC5', display: 'block', marginTop: '0.5rem' }}>
                🚗 {yearsOwnership <= 3 && " - Short-term ownership"}
                {yearsOwnership > 3 && yearsOwnership <= 8 && " - Average ownership"}
                {yearsOwnership > 8 && " - Long-term ownership"}
              </small>
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
                {gridFactors && Object.keys(gridFactors).map(r => (
                  <option key={r} value={r} style={{ background: '#203A43' }}>
                    {r} ({gridFactors[r].gCO2_per_kWh}g CO2/kWh)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Popular Vehicle Selection */}
          <div style={{ marginTop: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '1rem', color: '#4ECDC4', fontWeight: '600', fontSize: '1.1rem' }}>
              🚗 Popular Vehicles
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {loading ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#B0BEC5' }}>
                  Loading popular vehicles...
                </div>
              ) : getPopularVehicles().length > 0 ? (
                getPopularVehicles().map(vehicle => {
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
                        textAlign: 'left',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                        {vehicle.make} {vehicle.model}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: COLORS[type], fontWeight: '500' }}>
                        {type} • {vehicle.year}
                      </div>
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          background: '#4ECDC4',
                          color: '#0F2027',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 'bold'
                        }}>
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#B0BEC5' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                    {availableVehicles.slice(0, 15).map(vehicle => {
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
                            textAlign: 'left',
                            transition: 'all 0.3s ease'
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
              )}
            </div>
          </div>

          {/* Other Vehicles Dropdown */}
          <div style={{ marginTop: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#4ECDC4', fontWeight: '600' }}>
              📋 Other Available Vehicles
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <select
                  value={selectedOtherVehicle}
                  onChange={(e) => {
                    setSelectedOtherVehicle(e.target.value);
                    if (e.target.value) {
                      handleOtherVehicleSelect(e.target.value);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(78, 205, 196, 0.3)',
                    borderRadius: '12px',
                    color: '#FFFFFF',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    minHeight: '60px'
                  }}
                >
                  <option value="" style={{ background: '#203A43', color: '#B0BEC5' }}>
                    🔍 Select a vehicle to compare...
                  </option>
                  {getOtherVehicles().map(vehicle => {
                    const type = getVehicleType(vehicle);
                    const isSelected = selectedVehicles.includes(vehicle.id);
                    return (
                      <option
                        key={vehicle.id}
                        value={vehicle.id}
                        disabled={isSelected}
                        style={{
                          background: isSelected ? '#4ECDC4' : '#203A43',
                          color: isSelected ? '#0F2027' : '#FFFFFF',
                          padding: '8px',
                          fontSize: '14px'
                        }}
                      >
                        {isSelected ? '✓ ' : ''}{vehicle.make} {vehicle.model} ({vehicle.fuelType})
                      </option>
                    );
                  })}
                </select>
              </div>
              <button
                onClick={() => setShowMoreVehicles(!showMoreVehicles)}
                style={{
                  padding: '1rem 1.5rem',
                  background: 'rgba(78, 205, 196, 0.2)',
                  border: '2px solid rgba(78, 205, 196, 0.3)',
                  borderRadius: '12px',
                  color: '#4ECDC4',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                {showMoreVehicles ? 'Hide' : 'Show'} All ({getOtherVehicles().length})
              </button>
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

              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '2rem', borderRadius: '15px', border: '1px solid rgba(78, 205, 196, 0.2)' }}>
                <div style={{ fontSize: '1rem', color: '#B0BEC5', marginBottom: '1.5rem', fontWeight: '600' }}>
                  📊 Lifecycle Emissions Breakdown
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Manufacturing */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: COLORS.manufacturing, fontWeight: '600' }}>
                        🏭 Manufacturing
                      </span>
                      <span style={{ color: '#FFFFFF', fontWeight: '700' }}>
                        {(recommendation.emissions.manufacturing / 1000).toFixed(1)}t
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(recommendation.emissions.manufacturing / recommendation.emissions.total) * 100}%`,
                        height: '100%',
                        background: COLORS.manufacturing,
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                      }}></div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#B0BEC5', marginTop: '0.25rem' }}>
                      {((recommendation.emissions.manufacturing / recommendation.emissions.total) * 100).toFixed(1)}% of total
                    </div>
                  </div>

                  {/* Operational */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: COLORS.operational, fontWeight: '600' }}>
                        ⚡ Operational
                      </span>
                      <span style={{ color: '#FFFFFF', fontWeight: '700' }}>
                        {(recommendation.emissions.operational / 1000).toFixed(1)}t
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(recommendation.emissions.operational / recommendation.emissions.total) * 100}%`,
                        height: '100%',
                        background: COLORS.operational,
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                      }}></div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#B0BEC5', marginTop: '0.25rem' }}>
                      {((recommendation.emissions.operational / recommendation.emissions.total) * 100).toFixed(1)}% of total
                    </div>
                  </div>

                  {/* Disposal */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ color: COLORS.disposal, fontWeight: '600' }}>
                        ♻️ Disposal
                      </span>
                      <span style={{ color: '#FFFFFF', fontWeight: '700' }}>
                        {(recommendation.emissions.disposal / 1000).toFixed(1)}t
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(recommendation.emissions.disposal / recommendation.emissions.total) * 100}%`,
                        height: '100%',
                        background: COLORS.disposal,
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                      }}></div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#B0BEC5', marginTop: '0.25rem' }}>
                      {((recommendation.emissions.disposal / recommendation.emissions.total) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(78, 205, 196, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(78, 205, 196, 0.3)'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#4ECDC4', fontWeight: '600' }}>
                    💡 Key Insight
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#B0BEC5', marginTop: '0.5rem' }}>
                    {recommendation.emissions.operational > recommendation.emissions.manufacturing ?
                      "Operational emissions dominate this vehicle's lifecycle footprint." :
                      "Manufacturing emissions are the largest contributor."
                    }
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
            <p style={{ margin: '0.25rem 0 0 0', color: '#4ECDC4', fontSize: '0.85rem' }}>EEA • EPA • IVL • Argonne GREET</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;