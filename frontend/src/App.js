import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [weatherCards, setWeatherCards] = useState([]);
  const [kpi, setKpi] = useState(null);
  const [tempChartUrl, setTempChartUrl] = useState('');
  const [humidityChartUrl, setHumidityChartUrl] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const loadDashboardData = async () => {
    try {
      const [cardsRes, kpiRes] = await Promise.all([
        axios.get('http://localhost:5000/api/weather-cards'),
        axios.get('http://localhost:5000/api/kpi-summary')
      ]);
      setWeatherCards(cardsRes.data);
      setKpi(kpiRes.data);
      setLastUpdated(new Date().toLocaleTimeString());
      
      const ts = Date.now();
      setTempChartUrl(`http://localhost:5000/api/visualizations/temperature?t=${ts}`);
      setHumidityChartUrl(`http://localhost:5000/api/visualizations/humidity?t=${ts}`);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const syncWeatherData = async () => {
    setLoading(true);
    setStatusMessage('Syncing live weather records...');
    try {
      const response = await axios.get('http://localhost:5000/api/fetch-and-store');
      setStatusMessage(response.data.message);
      await loadDashboardData();
    } catch (error) {
      console.error(error);
      setStatusMessage('Failed to sync. Ensure backend Flask server is running.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div style={{ padding: '30px 40px', fontFamily: "'Segoe UI', Roboto, sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh', color: '#0f172a' }}>
      
      {/* Header */}
      <header style={{ backgroundColor: '#0f172a', padding: '24px 32px', borderRadius: '16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', boxShadow: '0 4px 20px rgba(15,23,42,0.15)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '700' }}>Pakistan Weather Analytics Platform</h1>
          <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>Real-time OpenWeather insights & Seaborn visual analytics across 7 major cities</p>
        </div>
        {lastUpdated && (
          <div style={{ textAlign: 'right', fontSize: '13px', color: '#cbd5e1' }}>
            Status: <span style={{ color: '#4ade80', fontWeight: '600' }}>Live Synced</span><br />
            Last Synced: <b>{lastUpdated}</b>
          </div>
        )}
      </header>

      {/* Sync Control Bar */}
      <div style={{ backgroundColor: 'white', padding: '16px 24px', borderRadius: '12px', marginBottom: '25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #e2e8f0' }}>
        <button 
          onClick={syncWeatherData} 
          disabled={loading}
          style={{
            padding: '10px 22px',
            backgroundColor: loading ? '#94a3b8' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s'
          }}
        >
          {loading ? 'Fetching Updates...' : '🔄 Sync Live Weather Data'}
        </button>
        {statusMessage && (
          <span style={{ fontSize: '14px', color: statusMessage.includes('Failed') ? '#dc2626' : '#16a34a', fontWeight: '600' }}>
            {statusMessage}
          </span>
        )}
      </div>

      {/* KPI Summary Cards */}
      {kpi && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #ef4444' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Hottest City</span>
            <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '6px', color: '#1e293b' }}>{kpi.hottest_city}</div>
            <div style={{ fontSize: '14px', color: '#ef4444', fontWeight: '700', marginTop: '2px' }}>{kpi.hottest_temp}°C</div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #06b6d4' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Coldest City</span>
            <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '6px', color: '#1e293b' }}>{kpi.coldest_city}</div>
            <div style={{ fontSize: '14px', color: '#0891b2', fontWeight: '700', marginTop: '2px' }}>{kpi.coldest_temp}°C</div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '4px solid #3b82f6' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>National Avg Humidity</span>
            <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '6px', color: '#1e293b' }}>{kpi.avg_humidity}%</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Across 7 cities</div>
          </div>
        </div>
      )}

      {/* Live City Weather Cards */}
      <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>Live City Weather Metrics</h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
        gap: '18px', 
        marginBottom: '35px' 
      }}>
        {weatherCards.map((item, index) => (
          <div key={index} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{item.city}</h3>
                <p style={{ margin: '3px 0 0 0', color: '#64748b', fontSize: '13px' }}>{item.description}</p>
                
                {/* Sunshine Status Badge */}
                <span style={{
                  backgroundColor: item.sunshine_status?.includes('Daylight') ? '#fef3c7' : '#e2e8f0',
                  color: item.sunshine_status?.includes('Daylight') ? '#b45309' : '#475569',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  marginTop: '8px',
                  display: 'inline-block'
                }}>
                  ☀️ {item.sunshine_status || 'Daylight / Clear Sun'}
                </span>
              </div>
              
              {item.icon && (
                <img 
                  src={`https://openweathermap.org/img/wn/${item.icon}@2x.png`} 
                  alt={item.description} 
                  style={{ width: '42px', height: '42px', marginTop: '-4px' }}
                />
              )}
            </div>
            
            <div style={{ fontSize: '30px', fontWeight: '800', color: '#0f172a', margin: '12px 0 8px 0' }}>{item.current_temp}°C</div>
            
            <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
              Feels Like: <b>{item.feels_like}°C</b><br />
              Humidity: <b>{item.humidity}%</b> | Wind: <b>{item.wind_speed} m/s</b>
            </div>
          </div>
        ))}
      </div>

      {/* Seaborn Visualizations */}
      <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>Seaborn Analytical Charts</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '25px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', minHeight: '320px' }}>
          {tempChartUrl ? (
            <img src={tempChartUrl} alt="Temperature Chart" style={{ width: '100%', display: 'block', borderRadius: '8px' }} />
          ) : (
            <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>Loading Temperature Chart...</div>
          )}
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', minHeight: '320px' }}>
          {humidityChartUrl ? (
            <img src={humidityChartUrl} alt="Humidity Chart" style={{ width: '100%', display: 'block', borderRadius: '8px' }} />
          ) : (
            <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>Loading Humidity Chart...</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;