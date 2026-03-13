import React from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Compare = () => {
  const location = useLocation();
  const { carbonResults, recommendation } = location.state || {};

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

  // Color palette for pie chart - distinct colors for each vehicle
  const PIE_COLORS = [
    '#00D9FF', // Bright cyan
    '#FFE66D', // Bright yellow
    '#FF6B9D', // Hot pink
    '#4ECDC4', // Teal
    '#95E1D3', // Mint
    '#F38181', // Coral
    '#AA96DA', // Lavender
    '#FCBAD3', // Light pink
    '#A8D8EA', // Light blue
    '#FFE5B4', // Peach
    '#B4E7FF', // Sky blue
    '#FFD6A5', // Light orange
    '#CAFFBF', // Light green
    '#FFB4B4', // Light red
    '#FFC6FF'  // Light magenta
  ];

  if (!carbonResults || carbonResults.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '1.5rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p>No comparison data available.</p>
          <p style={{ fontSize: '1rem', color: '#B0BEC5' }}>Please go to the Dashboard and calculate emissions first.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      fontFamily: "'Inter', sans-serif",
      color: '#FFFFFF'
    }}>
      {/* Header */}
      <header style={{
        padding: '2rem 4rem',
        background: 'rgba(26, 26, 26, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #4ECDC4, #00D9FF)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}></div>
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', background: 'linear-gradient(135deg, #4ECDC4, #00D9FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '700' }}>
                Vehicle Comparison
              </h1>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#B0BEC5' }}>
                Detailed carbon footprint analysis
              </p>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 4rem' }}>

        {/* Best Choice Highlight */}
        {recommendation && (
          <section style={{
            background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(0, 217, 255, 0.2))',
            border: '2px solid #4ECDC4',
            borderRadius: '20px',
            padding: '2.5rem',
            marginBottom: '3rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#4ECDC4' }}>
                  Best Environmental Choice
                </h2>
                <p style={{ margin: 0, color: '#B0BEC5', fontSize: '1.1rem' }}>
                  {recommendation.vehicle.make} {recommendation.vehicle.model}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
              <div style={{ background: '#2d2d2d', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(78, 205, 196, 0.1)' }}>
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

              <div style={{ background: '#2d2d2d', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(78, 205, 196, 0.1)' }}>
                <div style={{ fontSize: '0.9rem', color: '#B0BEC5', marginBottom: '1rem' }}>
                  Emissions Breakdown
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

        {/* Detailed Comparison Cards */}
        <section style={{
          background: '#1a1a1a',
          border: '1px solid rgba(78, 205, 196, 0.1)',
          borderRadius: '20px',
          padding: '2.5rem',
          marginBottom: '3rem'
        }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Detailed Vehicle Comparison</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            {carbonResults.map((result, idx) => (
              <div key={result.vehicle.id} style={{
                background: idx === 0 ? 'linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(0, 217, 255, 0.2))' : '#2d2d2d',
                border: idx === 0 ? '2px solid #4ECDC4' : '1px solid rgba(78, 205, 196, 0.1)',
                borderRadius: '16px',
                padding: '2rem',
                position: 'relative'
              }}>
                {idx === 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: 'linear-gradient(135deg, #4ECDC4, #00D9FF)',
                    color: '#0F2027',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '700'
                  }}>
                    BEST CHOICE
                  </div>
                )}

                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  {result.vehicle.make} {result.vehicle.model}
                </h3>
                <div style={{ color: COLORS[getVehicleType(result.vehicle)], fontWeight: '600', marginBottom: '1.5rem' }}>
                  {getVehicleType(result.vehicle)} • {result.vehicle.year}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: idx === 0 ? '#4ECDC4' : '#FFFFFF' }}>
                    {result.emissions.totalTons} tons
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#B0BEC5' }}>Total CO2</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', background: '#2d2d2d', borderRadius: '12px', border: '1px solid rgba(78, 205, 196, 0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#B0BEC5' }}>Manufacturing:</span>
                    <span style={{ color: COLORS.manufacturing }}>{(result.emissions.manufacturing / 1000).toFixed(1)}t</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#B0BEC5' }}>Operational:</span>
                    <span style={{ color: COLORS.operational }}>{(result.emissions.operational / 1000).toFixed(1)}t</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#B0BEC5' }}>Disposal:</span>
                    <span style={{ color: COLORS.disposal }}>{(result.emissions.disposal / 1000).toFixed(1)}t</span>
                  </div>
                </div>

                {idx > 0 && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255, 107, 157, 0.1)', borderRadius: '8px', fontSize: '0.9rem', color: '#FF6B9D' }}>
                    +{(result.emissions.total - carbonResults[0].emissions.total).toLocaleString()} kg more than best choice
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bar Chart Section */}
        <section style={{
          background: '#1a1a1a',
          border: '1px solid rgba(78, 205, 196, 0.1)',
          borderRadius: '20px',
          padding: '2.5rem',
          marginBottom: '3rem'
        }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Lifecycle Emissions Breakdown</h2>
          <ResponsiveContainer width="100%" height={650}>
            <BarChart data={carbonResults.map(r => ({
              name: `${r.vehicle.make} ${r.vehicle.model}`,
              manufacturing: r.emissions.manufacturing,
              operational: r.emissions.operational,
              disposal: r.emissions.disposal
            }))} margin={{ top: 20, right: 30, left: 80, bottom: 200 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="name" stroke="#B0BEC5" tick={{ fill: '#B0BEC5', angle: -45, textAnchor: 'end', height: 120 }} />
              <YAxis stroke="#B0BEC5" tick={{ fill: '#B0BEC5' }} label={{ value: 'kg CO2', angle: -90, position: 'left', offset: 10, fill: '#B0BEC5' }} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(10, 10, 10, 0.95)',
                  border: '1px solid rgba(78, 205, 196, 0.5)',
                  borderRadius: '8px',
                  color: '#FFFFFF'
                }}
                labelStyle={{ color: '#FFFFFF' }}
                itemStyle={{ color: '#FFFFFF' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="manufacturing" stackId="a" fill={COLORS.manufacturing} name="Manufacturing" />
              <Bar dataKey="operational" stackId="a" fill={COLORS.operational} name="Operational" />
              <Bar dataKey="disposal" stackId="a" fill={COLORS.disposal} name="Disposal" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Pie Chart Section */}
        <section style={{
          background: '#1a1a1a',
          border: '1px solid rgba(78, 205, 196, 0.1)',
          borderRadius: '20px',
          padding: '2.5rem'
        }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Total Emissions Distribution</h2>
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                data={carbonResults.map(r => ({
                  name: `${r.vehicle.make} ${r.vehicle.model}`,
                  value: r.emissions.total
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {carbonResults.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgba(10, 10, 10, 0.95)',
                  border: '1px solid rgba(78, 205, 196, 0.5)',
                  borderRadius: '8px',
                  color: '#FFFFFF'
                }}
                labelStyle={{ color: '#FFFFFF' }}
                itemStyle={{ color: '#FFFFFF' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </main>
    </div>
  );
};

export default Compare;
