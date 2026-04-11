import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Modal, Form, Button } from 'react-bootstrap';
import api, { notificationService, authService } from '../services/api';
import { Hexagon, LogOut, Bell, Sun, Cloud, CloudRain, Settings } from 'lucide-react';

const ROLE_COLOR = {
  'Warden': '#f59e0b',
  'Staff':  '#4318FF',
  'Student': '#10b981',
  'Admin':  '#ef4444',
};

const Navbar = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Profile Modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '', oldPassword: '', password: '', roomNumber: '', block: '' });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    if (user && showProfileModal) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        oldPassword: '',
        password: '', // Kept empty for security
        roomNumber: user.roomNumber || '',
        block: user.block || ''
      });
    }
  }, [user, showProfileModal]);
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

  const handleDeleteAccount = async () => {
    if (!window.confirm('Permanently delete your account? This cannot be undone.')) return;
    try {
      await api.delete('/auth/me');
      logout(); navigate('/');
    } catch (err) {
      alert('Failed to delete account: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const { data } = await authService.updateProfile(profileData);
      updateUser(data);
      setShowProfileModal(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const roleColor = user ? (ROLE_COLOR[user.role] || '#4318FF') : '#4318FF';

  const renderWeatherIcon = (code) => {
    if (code === 0 || code === 1) return <Sun size={18} color="#f59e0b" />;
    if (code >= 51 && code <= 99) return <CloudRain size={18} color="#3b82f6" />;
    return <Cloud size={18} color="#718EBF" />;
  };

  return (
    <div style={{ padding: '0.8rem 1.5rem', position: 'sticky', top: 0, zIndex: 1030 }}>
      <nav style={{
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
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
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

        {/* ── Right side ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
                  onClick={() => setIsWeatherOpen(!isWeatherOpen)}
                  onMouseEnter={() => setIsWeatherHovered(true)}
                  onMouseLeave={() => setIsWeatherHovered(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '4px 14px 4px 6px',
                    borderRadius: 40,
                    background: isWeatherHovered || isWeatherOpen ? 'linear-gradient(145deg, rgba(67,24,255,0.06), rgba(123,95,255,0.02))' : 'rgba(0,0,0,0.015)',
                    border: isWeatherHovered || isWeatherOpen ? '1px solid rgba(67,24,255,0.2)' : '1px solid rgba(0,0,0,0.04)',
                    boxShadow: isWeatherHovered || isWeatherOpen ? '0 8px 16px rgba(67,24,255,0.1)' : '0 2px 6px rgba(0,0,0,0.02)',
                    transform: isWeatherHovered && !isWeatherOpen ? 'translateY(-2px) scale(1.02)' : 'none',
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    marginRight: 8,
                    cursor: 'pointer'
                  }} title="Click to change location">
                  
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
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontWeight: 800, color: '#1B2559', fontSize: '0.95rem', lineHeight: '1.0', letterSpacing: '-0.5px' }}>
                      {weather ? `${Math.round(weather.temperature)}°` : '...'}
                    </span>
                    <span style={{ fontSize: '0.62rem', color: '#718EBF', maxWidth: '75px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase', marginTop: '2px' }}>
                      {weatherLocationName}
                    </span>
                  </div>
                </div>

                {isWeatherOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: 8,
                    background: '#fff', borderRadius: 12, padding: 12,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid rgba(226, 232, 248, 0.8)',
                    width: 220, zIndex: 1000
                  }}>
                    <form onSubmit={handleSearchWeather} style={{ display: 'flex', gap: 6 }}>
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search city..." 
                        style={{
                          flex: 1, padding: '6px 10px', borderRadius: 8, 
                          border: '1px solid #E2E8F8', fontSize: '0.85rem', width: '100%',
                          outline: 'none'
                        }}
                      />
                      <button type="submit" disabled={isSearching} style={{
                        background: '#4318FF', color: '#fff', border: 'none',
                        borderRadius: 8, padding: '0 12px', fontSize: '0.85rem', cursor: isSearching ? 'not-allowed' : 'pointer',
                        fontWeight: 600, opacity: isSearching ? 0.7 : 1
                      }}>{isSearching ? '...' : 'Go'}</button>
                    </form>
                    
                    {searchedWeather && (
                      <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(67,24,255,0.04)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1B2559', fontSize: '1.1rem' }}>
                            {Math.round(searchedWeather.temperature)}°C
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#718EBF', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {searchedLocationName}
                          </div>
                        </div>
                        {renderWeatherIcon(searchedWeather.weathercode)}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dashboard link */}
              <Link to="/dashboard" style={{
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

              {/* Role badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.9rem', marginLeft: 8 }}>
                <span style={{ color: '#718EBF' }}>Role:</span>
                <span style={{ color: roleColor, fontWeight: 700 }}>{user.role}</span>
              </div>

              {/* User name / Profile Edit Trigger */}
              <span 
                onClick={() => setShowProfileModal(true)}
                title="Edit Profile"
                style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: '#1B2559',
                  cursor: 'pointer',
                  padding: '4px 10px',
                  marginLeft: 4,
                  borderRadius: '6px',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(67,24,255,0.08)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {user.name}
              </span>

              {/* Logout */}
              <button onClick={handleLogout} style={{
                background: 'transparent',
                border: '1.5px solid rgba(239,68,68,0.5)',
                color: '#ef4444',
                borderRadius: 6,
                padding: '4px 10px',
                fontWeight: 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                marginLeft: 4
              }}>
                <LogOut size={16} strokeWidth={1.8} style={{transform: 'scaleX(-1)'}} /> Logout
              </button>

              {/* Delete account */}
              <button onClick={handleDeleteAccount} style={{
                background: '#ef4444',
                border: 'none',
                color: '#ffffff',
                borderRadius: 6,
                padding: '6px 14px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}>
                Delete Account
              </button>
            </>
          )}
        </div>
      </nav>

      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title style={{ color: '#1B2559', fontWeight: 700 }}>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleProfileUpdate}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control type="text" required value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control type="email" required value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} />
            </Form.Group>
            <div className="p-3 mb-4 rounded" style={{ background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div className="fw-semibold mb-3" style={{ color: '#1B2559', fontSize: '0.9rem' }}>Security</div>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontSize: '0.85rem' }}>Current Password</Form.Label>
                <Form.Control type="password" placeholder="Required if changing password" value={profileData.oldPassword} onChange={e => setProfileData({...profileData, oldPassword: e.target.value})} />
              </Form.Group>
              <Form.Group className="mb-1">
                <Form.Label style={{ fontSize: '0.85rem' }}>New Password</Form.Label>
                <Form.Control type="password" placeholder="Leave blank to keep current password" value={profileData.password} onChange={e => setProfileData({...profileData, password: e.target.value})} />
              </Form.Group>
            </div>
            {user?.role === 'Student' && (
              <div className="d-flex gap-3 mb-4">
                <Form.Group style={{ flex: 1 }}>
                  <Form.Label>Room Number</Form.Label>
                  <Form.Control type="text" value={profileData.roomNumber} onChange={e => setProfileData({...profileData, roomNumber: e.target.value})} />
                </Form.Group>
                <Form.Group style={{ flex: 1 }}>
                   <Form.Label>Block</Form.Label>
                   <Form.Control type="text" value={profileData.block} onChange={e => setProfileData({...profileData, block: e.target.value})} />
                </Form.Group>
              </div>
            )}
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="outline-secondary" onClick={() => setShowProfileModal(false)} style={{ borderRadius: 10 }}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={isUpdatingProfile} style={{ background: '#4318FF', border: 'none', borderRadius: 10 }}>
                {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default Navbar;
