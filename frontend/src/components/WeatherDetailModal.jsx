import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler, BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import {
  X, Droplets, Wind, Thermometer, Eye, Gauge, Sun, Cloud, CloudRain,
  CloudSnow, CloudLightning, TrendingUp, History, BarChart3, MapPin, Calendar
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, BarElement);

const WEATHER_API_KEY = "32ef5d65b483dbd69240b2c97df19a93";

/* ── Weather condition icons mapping ── */
const renderWeatherIconLarge = (id, size = 48) => {
  if (!id) return <Sun size={size} color="#f59e0b" />;
  if (id === 800) return <Sun size={size} color="#f59e0b" />;
  if (id >= 200 && id <= 531) return <CloudRain size={size} color="#3b82f6" />;
  if (id >= 600 && id <= 622) return <CloudSnow size={size} color="#60a5fa" />;
  if (id >= 200 && id <= 232) return <CloudLightning size={size} color="#8b5cf6" />;
  return <Cloud size={size} color="#718EBF" />;
};

const WeatherDetailModal = ({ isOpen, onClose, cityName: initialCityName, latitude: initialLat, longitude: initialLon }) => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecastList, setForecastList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsMetric, setAnalyticsMetric] = useState('Temperature');
  const [analyticsChart, setAnalyticsChart] = useState('Line Chart');

  const [searchInput, setSearchInput] = useState(initialCityName);
  const [currentDisplayCity, setCurrentDisplayCity] = useState(initialCityName);
  const [coords, setCoords] = useState({ lat: initialLat, lon: initialLon });

  useEffect(() => {
    if (isOpen) {
      setSearchInput(initialCityName);
      setCurrentDisplayCity(initialCityName);
      setCoords({ lat: initialLat, lon: initialLon });
    }
  }, [isOpen, initialCityName, initialLat, initialLon]);

  useEffect(() => {
    if (isOpen && coords.lat && coords.lon) {
      fetchDetailedWeather();
    }
  }, [isOpen, coords]);

  const handleCitySearch = async () => {
    if (!searchInput.trim()) return;
    setLoading(true);
    try {
      const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchInput)}&limit=1&appid=${WEATHER_API_KEY}`);
      const geoData = await geoRes.json();
      if (geoData && geoData.length > 0) {
        setCoords({ lat: geoData[0].lat, lon: geoData[0].lon });
        setCurrentDisplayCity(geoData[0].name);
      } else {
        alert("City not found");
      }
    } catch (err) {
      setError("Failed to resolve city name");
    } finally {
      if (!coords.lat) setLoading(false);
    }
  };

  const fetchDetailedWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch current
      const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${WEATHER_API_KEY}&units=metric`);
      if (!currentRes.ok) throw new Error('Failed to fetch current weather');
      const currentData = await currentRes.json();
      setCurrentWeather(currentData);

      // Fetch forecast
      const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${WEATHER_API_KEY}&units=metric`);
      if (!forecastRes.ok) throw new Error('Failed to fetch forecast');
      const forecastData = await forecastRes.json();
      setForecastList(forecastData.list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  /* ── Build hourly chart data (next 12 hours from now) ── */
  const buildHourlyChart = () => {
    if (!forecastList || forecastList.length === 0) return null;
    const slice = forecastList.slice(0, 8); // Next 24 hours (8 intervals of 3h)

    const labels = slice.map(item => {
      const d = new Date(item.dt * 1000);
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    });

    let datasets = [];
    if (analyticsMetric === 'Temperature') {
      datasets = [{ label: 'Temp (°C)', data: slice.map(it => it.main.temp), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', tension: 0.4, fill: true, pointRadius: 3 }];
    } else if (analyticsMetric === 'Humidity') {
      datasets = [{ label: 'Humidity (%)', data: slice.map(it => it.main.humidity), borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', tension: 0.4, fill: true, pointRadius: 3 }];
    } else {
      datasets = [{ label: 'Wind (m/s)', data: slice.map(it => it.wind.speed), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', tension: 0.4, fill: true, pointRadius: 3 }];
    }
    return { labels, datasets };
  };

  const buildWeeklyChart = () => {
    if (!forecastList || forecastList.length === 0) return null;
    const dailyMap = {};
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyMap[date]) dailyMap[date] = { temps: [] };
      dailyMap[date].temps.push(item.main.temp);
    });

    const labels = Object.keys(dailyMap).slice(0, 5);
    const maxTemps = labels.map(day => Math.max(...dailyMap[day].temps));
    const minTemps = labels.map(day => Math.min(...dailyMap[day].temps));
    const avgTemps = labels.map(day => (dailyMap[day].temps.reduce((a, b) => a + b, 0) / dailyMap[day].temps.length).toFixed(1));

    return {
      labels,
      datasets: [
        { label: 'Max Temp (°C)', data: maxTemps, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.15)', tension: 0.4, fill: '+1', pointRadius: 4, pointBackgroundColor: '#ef4444', borderWidth: 2 },
        { label: 'Avg Temp (°C)', data: avgTemps, borderColor: '#718EBF', borderDash: [5, 5], tension: 0.4, fill: false, pointRadius: 3, pointBackgroundColor: '#718EBF', borderWidth: 2 },
        { label: 'Min Temp (°C)', data: minTemps, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.12)', tension: 0.4, fill: 'origin', pointRadius: 4, pointBackgroundColor: '#3b82f6', borderWidth: 2 }
      ]
    };
  };

  const buildHighlights = () => {
    if (!currentWeather) return [];
    return [
      { label: 'SUNRISE', val: new Date(currentWeather.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), sub: 'Daily' },
      { label: 'SUNSET', val: new Date(currentWeather.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), sub: 'Daily' },
      { label: 'PRESSURE', val: `${currentWeather.main.pressure} hPa`, sub: 'Atmospheric' },
      { label: 'VISIBILITY', val: `${(currentWeather.visibility / 1000).toFixed(1)} km`, sub: 'Average' }
    ];
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#718EBF', font: { family: 'Inter', size: 11 }, boxWidth: 12, padding: 12 } },
      tooltip: { backgroundColor: '#1B2559', titleFont: { family: 'Inter' }, bodyFont: { family: 'Inter' }, cornerRadius: 8, padding: 10 }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#a3bed9', font: { size: 10 } } },
      y: { grid: { color: 'rgba(226,232,248,0.5)' }, ticks: { color: '#a3bed9', font: { size: 10 } }, border: { display: false } }
    }
  };

  const weeklyChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: { position: 'top', labels: { color: '#718EBF', font: { family: 'Inter', size: 11 }, boxWidth: 20, padding: 16, usePointStyle: false } }
    }
  };

  const hourlyChartData = buildHourlyChart();
  const weeklyChartData = buildWeeklyChart();
  const highlights = buildHighlights();

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(27,37,89,0.45)', backdropFilter: 'blur(6px)',
        zIndex: 9998, animation: 'weatherModalFadeIn 0.25s ease'
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '92vw', maxWidth: 900, maxHeight: '90vh', overflowY: 'auto',
        background: 'linear-gradient(180deg, #f0f4ff 0%, #e8eeff 30%, #dce4ff 100%)',
        borderRadius: 24, boxShadow: '0 32px 80px rgba(67,24,255,0.22)',
        border: '1px solid rgba(255,255,255,0.6)',
        zIndex: 9999, padding: '0', animation: 'weatherModalSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1)'
      }}>
        {/* Top Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px 14px', borderBottom: '1px solid rgba(226,232,248,0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={18} color="#4318FF" />
            <span style={{ fontWeight: 800, color: '#1B2559', fontSize: '1.05rem' }}>Weather Analysis</span>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'
          }}>
            <X size={18} color="#ef4444" />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '14px 24px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, background: '#fff',
            borderRadius: 12, padding: '8px 16px', border: '1.5px solid rgba(226,232,248,0.8)',
            boxShadow: '0 2px 10px rgba(67,24,255,0.04)', minWidth: 280
          }}>
            <input
              type="text" value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
              placeholder="Search another city..."
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontWeight: 600, color: '#1B2559', fontSize: '0.95rem', width: '100%'
              }}
            />
            <button 
              onClick={handleCitySearch}
              style={{
                background: '#10b981', color: '#fff', padding: '6px 18px', borderRadius: 8,
                fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer'
              }}>
              Get Weather
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#718EBF' }}>
            <div style={{
              width: 40, height: 40, border: '3px solid rgba(67,24,255,0.1)',
              borderTop: '3px solid #4318FF', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
            }} />
            <p style={{ fontWeight: 600 }}>Loading detailed weather data...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444', fontWeight: 600 }}>
            {error}
          </div>
        ) : (
          <div style={{ padding: '0 24px 24px' }}>
            {/* ── Main 3-Column Grid ── */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: 16, marginBottom: 20
            }} className="weather-detail-grid">

              {/* Today's Highlights */}
              <div style={{
                background: 'linear-gradient(145deg, #fffbeb, #fef3c7)', borderRadius: 18,
                padding: '20px 18px', border: '1px solid rgba(245,158,11,0.15)',
                boxShadow: '0 4px 16px rgba(245,158,11,0.08)'
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16,
                  fontWeight: 800, fontSize: '0.72rem', letterSpacing: '1.5px',
                  textTransform: 'uppercase', color: '#92400e'
                }}>
                  <History size={14} /> Today's Highlights
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#A3816A', letterSpacing: '0.5px' }}>{h.label}</div>
                      <div style={{ fontWeight: 800, color: '#1B2559', fontSize: '0.95rem', marginTop: 1 }}>{h.val}</div>
                      <div style={{ fontSize: '0.62rem', color: '#D4A373' }}>{h.sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, paddingTop: 12, borderTop: '1px solid rgba(245,158,11,0.2)' }}>
                   <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#A3816A' }}>VISIBILITY</div>
                   <div style={{ 
                      width: '100%', height: 4, background: 'rgba(245,158,11,0.1)', borderRadius: 2, marginTop: 4, overflow: 'hidden'
                   }}>
                      <div style={{ width: '80%', height: '100%', background: '#f59e0b' }}></div>
                   </div>
                </div>
              </div>

              {/* Current Weather Center */}
              <div style={{
                background: '#fff', borderRadius: 18, padding: '24px 20px',
                textAlign: 'center', border: '1px solid rgba(226,232,248,0.6)',
                boxShadow: '0 6px 24px rgba(67,24,255,0.06)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }}>
                <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.6rem', color: '#1B2559' }}>
                  {currentDisplayCity}
                </h2>
                <div style={{ fontWeight: 700, fontSize: '1.3rem', color: '#1B2559', margin: '4px 0' }}>
                  {currentWeather ? `${Math.round(currentWeather.main.temp)}°C` : '--'}
                </div>
                {currentWeather && (
                  <>
                    <div style={{ fontSize: '0.85rem', color: '#718EBF', fontWeight: 600 }}>
                      Humidity: {currentWeather.main.humidity}%
                    </div>
                    <div style={{ fontStyle: 'italic', color: '#4318FF', fontWeight: 600, fontSize: '0.9rem', margin: '4px 0 12px', textTransform: 'capitalize' }}>
                      {currentWeather.weather[0].description}
                    </div>
                    <div style={{ margin: '8px 0 16px' }}>
                      {renderWeatherIconLarge(currentWeather.weather[0].id, 56)}
                    </div>
                    <div style={{
                      display: 'flex', gap: 24, justifyContent: 'center',
                      borderTop: '1px solid rgba(226,232,248,0.5)', paddingTop: 14
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <Wind size={18} color="#718EBF" />
                        <div style={{ fontWeight: 700, color: '#1B2559', fontSize: '0.88rem', marginTop: 4 }}>
                          {currentWeather.wind.speed} m/s
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#718EBF', fontWeight: 600 }}>Wind</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <Thermometer size={18} color="#718EBF" />
                        <div style={{ fontWeight: 700, color: '#1B2559', fontSize: '0.88rem', marginTop: 4 }}>
                          {Math.round(currentWeather.main.feels_like)}°C
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#718EBF', fontWeight: 600 }}>Feels Like</div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Real-Time Analytics */}
              <div style={{
                background: 'linear-gradient(145deg, #fffbeb, #fef3c7)', borderRadius: 18,
                padding: '20px 16px', border: '1px solid rgba(245,158,11,0.15)',
                boxShadow: '0 4px 16px rgba(245,158,11,0.08)',
                display: 'flex', flexDirection: 'column'
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12,
                  fontWeight: 800, fontSize: '0.72rem', letterSpacing: '1.5px',
                  textTransform: 'uppercase', color: '#92400e'
                }}>
                  <BarChart3 size={14} /> Real-Time Analytics
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  <select
                    value={analyticsMetric}
                    onChange={(e) => setAnalyticsMetric(e.target.value)}
                    style={{
                      padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(226,232,248,0.8)',
                      fontSize: '0.72rem', fontWeight: 600, color: '#1B2559', background: '#fff',
                      outline: 'none', cursor: 'pointer'
                    }}
                  >
                    <option>Temperature</option>
                    <option>Humidity</option>
                    <option>Wind Speed</option>
                  </select>
                  <select
                    value={analyticsChart}
                    onChange={(e) => setAnalyticsChart(e.target.value)}
                    style={{
                      padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(226,232,248,0.8)',
                      fontSize: '0.72rem', fontWeight: 600, color: '#1B2559', background: '#fff',
                      outline: 'none', cursor: 'pointer'
                    }}
                  >
                    <option>Line Chart</option>
                    <option>Bar Chart</option>
                  </select>
                </div>
                <div style={{ flex: 1, minHeight: 140 }}>
                  {hourlyChartData && (
                    analyticsChart === 'Line Chart'
                      ? <Line data={hourlyChartData} options={{ ...chartOptions, scales: { ...chartOptions.scales, x: { ...chartOptions.scales.x, ticks: { ...chartOptions.scales.x.ticks, maxRotation: 45, font: { size: 8 } } } } }} />
                      : <Bar data={hourlyChartData} options={{ ...chartOptions, scales: { ...chartOptions.scales, x: { ...chartOptions.scales.x, ticks: { ...chartOptions.scales.x.ticks, maxRotation: 45, font: { size: 8 } } } } }} />
                  )}
                </div>
              </div>
            </div>

            {/* ── Weekly Temperature Trends ── */}
            <div style={{
              background: 'linear-gradient(145deg, #dbeafe, #ede9fe, #fce7f3)',
              borderRadius: 18, padding: '24px 20px',
              border: '1px solid rgba(67,24,255,0.08)',
              boxShadow: '0 6px 24px rgba(67,24,255,0.06)'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginBottom: 16, fontWeight: 800, fontSize: '0.78rem', letterSpacing: '1.5px',
                textTransform: 'uppercase', color: '#1B2559'
              }}>
                <TrendingUp size={16} color="#4318FF" /> Weekly Temperature Trends
              </div>
              <div style={{ height: 260 }}>
                {weeklyChartData && <Line data={weeklyChartData} options={weeklyChartOptions} />}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes weatherModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes weatherModalSlideIn {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .weather-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
};

export default WeatherDetailModal;
