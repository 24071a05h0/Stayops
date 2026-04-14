import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api, { notificationService } from '../services/api';
import { Hexagon, LogOut, Bell, Sun, Cloud, CloudRain, Settings, User, ChevronDown, ClipboardList, CheckSquare, Notebook } from 'lucide-react';

const ROLE_COLOR = {
  'Warden': '#f59e0b',
  'Staff':  '#4318FF',
  'Student': '#10b981',
  'Admin':  '#ef4444',
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // User dropdown
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  const [weather, setWeather] = useState(null);
  const [weatherLocationName, setWeatherLocationName] = useState('Local');
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedWeather, setSearchedWeather] = useState(null);
  const [searchedLocationName, setSearchedLocationName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isWeatherHovered, setIsWeatherHovered] = useState(false);
  const weatherRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (weatherRef.current && !weatherRef.current.contains(event.target)) {
        setIsWeatherOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchWeather = async (lat, lon, locationName = 'Local') => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      if (res.ok) {
        const data = await res.json();
        setWeather(data.current_weather);
        setWeatherLocationName(locationName);
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, 'Local'),
        () => fetchWeather(28.6139, 77.2090, 'Delhi, India'), // Fallback Default
        { timeout: 5000, maximumAge: 600000 }
      );
    } else {
      fetchWeather(28.6139, 77.2090, 'Delhi, India');
    }
  }, []);

  const handleSearchWeather = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();
      if (geoData.results && geoData.results.length > 0) {
        const { latitude, longitude, name, admin1, country } = geoData.results[0];
        const displayLocation = admin1 ? `${name}, ${admin1}` : `${name}, ${country}`;
        
        // Fetch specific searched weather
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        if (res.ok) {
          const data = await res.json();
          setSearchedWeather(data.current_weather);
          setSearchedLocationName(displayLocation);
        }
      } else {
        alert('City not found');
      }
    } catch (err) {
      alert('Error searching city');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user, location]);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await notificationService.getAll();
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (_) {}
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleColor = user ? (ROLE_COLOR[user.role] || '#4318FF') : '#4318FF';

  const renderWeatherIcon = (code) => {
    if (code === 0 || code === 1) return <Sun size={18} color="#f59e0b" />;
    if (code >= 51 && code <= 99) return <CloudRain size={18} color="#3b82f6" />;
    return <Cloud size={18} color="#718EBF" />;
  };

  return (
    <div style={{ padding: '0.8rem 1.5rem', position: 'sticky', top: 0, zIndex: 1030 }} className="dashboard-container-mobile">
      <nav className="navbar-mobile" style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: '0 1.5rem',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 14px rgba(0,0,0,0.03)',
        border: '1px solid rgba(226, 232, 248, 0.8)'
      }}>

        {/* ── Brand ── */}
        <Link to="/" className="navbar-brand-mobile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Hexagon size={24} color="#4318FF" strokeWidth={2} />
          <span style={{
            fontWeight: 700,
            fontSize: '1.25rem',
            color: '#1B2559',
            letterSpacing: '0.2px'
          }}>
            StayOps
          </span>
        </Link>

        <div className="navbar-right-mobile" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {!user ? (
            <>
              <Link to="/login" style={{
                color: '#1B2559', fontWeight: 600, textDecoration: 'none',
                fontSize: '0.95rem',
              }}>Login</Link>
              <Link to="/register" style={{
                background: 'linear-gradient(135deg, #4318FF, #7B5FFF)',
                color: '#fff', fontWeight: 700, textDecoration: 'none',
                padding: '7px 20px', borderRadius: 10, fontSize: '0.95rem',
              }}>Get Started</Link>
            </>
          ) : (
            <>
              {/* Weather Widget Container */}
              <div style={{ position: 'relative' }} ref={weatherRef}>
                <div 
                  onClick={() => navigate('/weather')}
                  onMouseEnter={() => setIsWeatherHovered(true)}
                  onMouseLeave={() => setIsWeatherHovered(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '4px 14px 4px 6px',
                    borderRadius: 40,
                    background: isWeatherHovered ? 'linear-gradient(145deg, rgba(67,24,255,0.06), rgba(123,95,255,0.02))' : 'rgba(0,0,0,0.015)',
                    border: isWeatherHovered ? '1px solid rgba(67,24,255,0.2)' : '1px solid rgba(0,0,0,0.04)',
                    boxShadow: isWeatherHovered ? '0 8px 16px rgba(67,24,255,0.1)' : '0 2px 6px rgba(0,0,0,0.02)',
                    transform: isWeatherHovered ? 'translateY(-2px) scale(1.02)' : 'none',
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    marginRight: 8,
                    cursor: 'pointer'
                  }} title="View detailed weather dashboard">
                  
                  {/* Icon Container */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: weather && weather.weathercode <= 1 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(67,24,255,0.08)',
                    borderRadius: '50%', width: 34, height: 34,
                    boxShadow: isWeatherHovered ? 'inset 0 2px 4px rgba(255,255,255,0.8)' : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    {weather ? renderWeatherIcon(weather.weathercode) : <Sun size={18} color="#f59e0b" />}
                  </div>

                  {/* Text Container */}
                  <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontWeight: 800, color: '#1B2559', fontSize: '0.95rem', lineHeight: '1.0', letterSpacing: '-0.5px' }}>
                      {weather ? `${Math.round(weather.temperature)}°` : '...'}
                    </span>
                    <span style={{ fontSize: '0.62rem', color: '#718EBF', maxWidth: '75px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase', marginTop: '2px' }}>
                      {weatherLocationName}
                    </span>
                  </div>
                </div>
              </div>

              {/* To-Do & Notes Button */}
              <Link to="/workspace" title="To-Do & Notes" style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 16px',
                borderRadius: 40,
                background: 'linear-gradient(135deg, rgba(67,24,255,0.08), rgba(123,95,255,0.03))',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(67,24,255,0.15)',
                color: '#4318FF',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
                marginRight: 8,
                boxShadow: '0 4px 12px rgba(67,24,255,0.05)',
                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #4318FF, #7B5FFF)';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(67,24,255,0.25)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.textShadow = '0 2px 4px rgba(0,0,0,0.1)';
                const iconBox = e.currentTarget.querySelector('.icon-box');
                if (iconBox) iconBox.style.background = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(67,24,255,0.08), rgba(123,95,255,0.03))';
                e.currentTarget.style.color = '#4318FF';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(67,24,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(67,24,255,0.15)';
                e.currentTarget.style.textShadow = 'none';
                const iconBox = e.currentTarget.querySelector('.icon-box');
                if (iconBox) iconBox.style.background = 'rgba(67,24,255,0.1)';
              }}>
                <div className="icon-box" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(67,24,255,0.1)', borderRadius: '50%',
                  width: 28, height: 28, marginRight: -2,
                  transition: 'background 0.3s'
                }}>
                  <ClipboardList size={16} strokeWidth={2.5} />
                </div>
                <span className="hide-on-mobile">To-Do & Notes</span>
              </Link>

              {/* Dashboard link */}
              <Link to="/dashboard" className="hide-on-mobile" style={{
                color: '#1B2559', fontWeight: 500, textDecoration: 'none',
                fontSize: '0.9rem',
                marginRight: 4
              }}>
                Dashboard
              </Link>

              {/* Bell */}
              <Link to="/notifications" style={{
                position: 'relative', color: '#1B2559', textDecoration: 'none',
                display: 'flex', alignItems: 'center',
                marginRight: 8
              }}>
                <Bell size={20} strokeWidth={2} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -1, right: -1,
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#ef4444',
                    border: '1px solid white',
                  }} />
                )}
              </Link>

              {/* Divider */}
              <div style={{ width: 1, height: 28, background: 'rgba(0,0,0,0.06)', margin: '0 2px' }} />

              {/* ── User Avatar Dropdown ── */}
              <div style={{ position: 'relative' }} ref={userDropdownRef}>
                <div
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '4px 10px 4px 4px',
                    borderRadius: 40,
                    background: isUserDropdownOpen ? 'linear-gradient(145deg, rgba(67,24,255,0.06), rgba(123,95,255,0.02))' : 'transparent',
                    border: isUserDropdownOpen ? '1px solid rgba(67,24,255,0.15)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    marginLeft: 6
                  }}
                >
                  {/* Avatar circle */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: user?.profilePicture ? 'transparent' : (user?.bannerColor || `linear-gradient(135deg, ${roleColor}, ${roleColor}88)`),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: '0.85rem',
                    letterSpacing: '0.5px',
                    boxShadow: `0 2px 8px ${roleColor}40`,
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}>
                    {user?.profilePicture ? (
                      <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${user.profilePicture.replace(/\\/g, '/')}`} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'
                    )}
                  </div>
                  <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1B2559', whiteSpace: 'nowrap' }}>{user.name}</span>
                    <span style={{ fontSize: '0.68rem', color: roleColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user.role}</span>
                  </div>
                  <ChevronDown size={14} color="#718EBF" style={{ transition: 'transform 0.3s ease', transform: isUserDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </div>

                {/* Dropdown menu */}
                {isUserDropdownOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: '#fff', borderRadius: 14,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.12), 0 2px 10px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(226, 232, 248, 0.8)',
                    width: 220, zIndex: 1050,
                    padding: '8px 0',
                    animation: 'dropdownFadeIn 0.2s ease'
                  }}>
                    {/* User info header */}
                    <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid rgba(226,232,248,0.6)' }}>
                      <div style={{ fontWeight: 700, color: '#1B2559', fontSize: '0.9rem' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#718EBF', marginTop: 2 }}>{user.email}</div>
                    </div>

                    {/* Menu items */}
                    <div style={{ padding: '6px 0' }}>
                      <button
                        onClick={() => { setIsUserDropdownOpen(false); navigate('/profile'); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          width: '100%', padding: '10px 16px',
                          background: 'transparent', border: 'none',
                          color: '#1B2559', fontSize: '0.88rem', fontWeight: 500,
                          cursor: 'pointer', transition: 'background 0.15s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(67,24,255,0.05)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <User size={16} color="#718EBF" /> View Profile
                      </button>
                    </div>

                    {/* Logout */}
                    <div style={{ borderTop: '1px solid rgba(226,232,248,0.6)', padding: '6px 0 2px' }}>
                      <button
                        onClick={() => { setIsUserDropdownOpen(false); handleLogout(); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          width: '100%', padding: '10px 16px',
                          background: 'transparent', border: 'none',
                          color: '#ef4444', fontSize: '0.88rem', fontWeight: 600,
                          cursor: 'pointer', transition: 'background 0.15s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <LogOut size={16} color="#ef4444" style={{ transform: 'scaleX(-1)' }} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Dropdown animation style */}
      <style>{`
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
};

export default Navbar;
