import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  Cloud, Sun, CloudRain, CloudLightning, Wind, Droplets, 
  ArrowLeft, Search, Calendar, TrendingUp, History, Sparkles, LineChart as LineChartIcon
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const WeatherPage = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('New York');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // 1. Check if user has a preferred city saved
    const preferredCity = localStorage.getItem('preferredWeatherCity');
    if (preferredCity) {
      const data = JSON.parse(preferredCity);
      fetchWeatherData(data.name, data.lat, data.lon);
      return;
    }

    // 2. Fallback: Try to get user's location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(null, position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          fetchWeatherData(city);
        }
      );
    } else {
      fetchWeatherData(city);
    }
  }, []);

  const [currentCoords, setCurrentCoords] = useState(null);

  const fetchWeatherData = async (cityName, lat = null, lon = null) => {
    setLoading(true);
    try {
      let latitude, longitude, name;

      if (lat && lon) {
        latitude = lat;
        longitude = lon;
        if (cityName) {
          name = cityName;
        } else {
          const revGeoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
          const revGeoData = await revGeoRes.json();
          name = revGeoData.city || revGeoData.locality || "Your Location";
        }
      } else {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();
        
        if (!geoData.results || geoData.results.length === 0) {
          alert("City not found");
          setLoading(false);
          return;
        }

        latitude = geoData.results[0].latitude;
        longitude = geoData.results[0].longitude;
        name = geoData.results[0].name;
      }

      setCity(name);
      setCurrentCoords({ lat: latitude, lon: longitude });

      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,temperature_2m_mean&timezone=auto`);
      const weatherData = await weatherRes.json();

      setWeather(weatherData.current);
      setForecast(weatherData.daily);
      
      // Mock history based on weekly forecast for demo
      setHistory(weatherData.daily.time.map((t, i) => ({
        date: t,
        temp: weatherData.daily.temperature_2m_max[i],
        code: weatherData.daily.weather_code[i]
      })).slice(0, 3));

      setLoading(false);
    } catch (error) {
      console.error("Error fetching weather:", error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeatherData(searchQuery);
    }
  };

  const renderWeatherIcon = (code, size = 24, color = "currentColor") => {
    if (code <= 1) return <Sun size={size} color="#f59e0b" />;
    if (code <= 3) return <Cloud size={size} color="#718EBF" />;
    if (code <= 67) return <CloudRain size={size} color="#3b82f6" />;
    return <CloudLightning size={size} color="#4318FF" />;
  };

  const analyticsData = {
    labels: ['01 PM', '03 PM', '05 PM', '07 PM', '09 PM', '11 PM', '01 AM'],
    datasets: [
      {
        fill: true,
        label: 'Temperature',
        data: [18, 22, 28, 24, 20, 19, 18],
        borderColor: '#4318FF',
        backgroundColor: 'rgba(67, 24, 255, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const weeklyTrendsData = {
    labels: forecast?.time || [],
    datasets: [
      {
        label: 'Max Temp (°C)',
        data: forecast?.temperature_2m_max || [],
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        tension: 0.4,
      },
      {
        label: 'Avg Temp (°C)',
        data: forecast?.temperature_2m_mean || [],
        borderColor: '#718EBF',
        backgroundColor: 'rgba(113, 142, 191, 0.1)',
        fill: true,
        tension: 0.4,
        borderDash: [5, 5],
      },
      {
        label: 'Min Temp (°C)',
        data: forecast?.temperature_2m_min || [],
        borderColor: '#3b82f6',
        backgroundColor: 'transparent',
        tension: 0.4,
      },
    ],
  };

  return (
    <Container fluid style={{ background: '#f8f9fe', minHeight: '100vh', padding: '2rem' }}>
      {/* Header with Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: '3rem' }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 42, height: 42, borderRadius: 12,
            background: '#ffffff', border: '1px solid rgba(67,24,255,0.15)',
            color: '#4318FF', cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            boxShadow: '0 4px 12px rgba(67,24,255,0.05)',
            marginRight: '1rem'
          }}
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <Form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 700 }}>
          <Form.Control 
            type="text" 
            placeholder="Enter city" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ borderRadius: 12, padding: '12px 20px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', flex: 1 }} 
          />
          <Button type="submit" style={{ background: '#10b981', border: 'none', borderRadius: 12, padding: '0 20px', fontWeight: 700, whiteSpace: 'nowrap' }}>
            Get Weather
          </Button>
          <button 
            type="button"
            onClick={() => {
              localStorage.setItem('preferredWeatherCity', JSON.stringify({ name: city, ...currentCoords }));
              window.dispatchEvent(new Event('weatherPreferenceChanged'));
              alert(`Successfully set ${city} as your local weather!`);
            }}
            style={{ 
              background: '#FFFFFF', 
              border: '2px solid rgba(67, 24, 255, 0.15)', 
              color: '#4318FF',
              borderRadius: 12, 
              padding: '0 20px', 
              fontSize: '0.85rem', 
              fontWeight: 800,
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: '0 4px 12px rgba(67, 24, 255, 0.05)',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = 'rgba(67, 24, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(67, 24, 255, 0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = 'rgba(67, 24, 255, 0.15)';
            }}
          >
            <Sparkles size={16} /> SET AS PRIMARY
          </button>
        </Form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: '#718EBF', fontWeight: 600 }}>Loading weather dashboard...</div>
      ) : (
        <>
          <Row className="g-4">
            {/* Recent History */}
            <Col lg={4}>
              <Card style={{ borderRadius: 24, border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.03)', height: '100%', background: 'linear-gradient(to bottom, #dbeafe, #fef3c7)' }}>
                <Card.Body style={{ padding: '2rem' }}>
                  <h5 style={{ fontWeight: 800, color: '#1B2559', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <History size={20} /> RECENT HISTORY
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {history.map((h, i) => (
                      <div key={i} style={{ paddingBottom: '1rem', borderBottom: i < history.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 800, color: '#1B2559' }}>{new Date(h.date).toLocaleDateString('en-US', { day: 'numeric', weekday: 'short' })}</div>
                            <div style={{ fontSize: '0.8rem', color: '#718EBF' }}>Clear</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {renderWeatherIcon(h.code, 20)}
                            <span style={{ fontWeight: 700, color: '#1B2559' }}>{Math.round(h.temp)}° / {Math.round(h.temp - 5)}°</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Main City Widget */}
            <Col lg={4}>
              <Card style={{ borderRadius: 24, border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.03)', height: '100%', background: 'linear-gradient(to bottom, #dbeafe, #fef3c7)' }}>
                <Card.Body style={{ padding: '2rem', textAlign: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <h2 style={{ fontWeight: 900, color: '#1B2559', fontSize: '2.5rem', marginBottom: '0.5rem' }}>{city}</h2>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1B2559', marginBottom: '1rem' }}>{Math.round(weather.temperature_2m)}°C</div>
                  <div style={{ color: '#718EBF', fontWeight: 600, marginBottom: '2rem' }}>Humidity: {weather.relative_humidity_2m}%</div>
                  <div style={{ fontStyle: 'italic', fontWeight: 800, color: '#1B2559', fontSize: '1.2rem', marginBottom: '2.5rem', textTransform: 'lowercase' }}>clear sky</div>
                  
                  <div style={{ margin: '2rem 0', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#4a5568', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {renderWeatherIcon(weather.weather_code, 40, "white")}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '2.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1.5rem' }}>
                    <div>
                      <Wind size={18} color="#718EBF" />
                      <div style={{ fontWeight: 800, color: '#1B2559', marginTop: 4 }}>{weather.wind_speed_10m} m/s</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#718EBF', textTransform: 'uppercase' }}>Wind</div>
                    </div>
                    <div>
                      <Droplets size={18} color="#718EBF" />
                      <div style={{ fontWeight: 800, color: '#1B2559', marginTop: 4 }}>{Math.round(weather.apparent_temperature)}°C</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#718EBF', textTransform: 'uppercase' }}>Feels Like</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Real-time Analytics */}
            <Col lg={4}>
              <Card style={{ borderRadius: 24, border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.03)', height: '100%', background: 'linear-gradient(to bottom, #dbeafe, #fef3c7)' }}>
                <Card.Body style={{ padding: '2rem' }}>
                  <h5 style={{ fontWeight: 800, color: '#1B2559', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <LineChartIcon size={20} /> REAL-TIME ANALYTICS
                  </h5>
                  <div style={{ height: 300 }}>
                    <Line data={analyticsData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false, grid: { display: false } }, x: { grid: { display: false } } } }} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Weekly Trends */}
          <Row className="mt-4">
            <Col xs={12}>
              <Card style={{ borderRadius: 24, border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.03)', background: 'linear-gradient(to bottom, #dbeafe, #fef3c7)' }}>
                <Card.Body style={{ padding: '2rem' }}>
                  <h5 style={{ fontWeight: 800, color: '#1B2559', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <TrendingUp size={20} /> WEEKLY TEMPERATURE TRENDS
                  </h5>
                  <div style={{ height: 350 }}>
                    <Line 
                      data={weeklyTrendsData} 
                      options={{ 
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'top' } },
                        scales: { 
                          y: { grid: { color: 'rgba(0,0,0,0.05)' } },
                          x: { grid: { display: false } }
                        }
                      }} 
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default WeatherPage;
