import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService, complaintService } from '../services/api';
import { User, Mail, Shield, Home, Building2, Calendar, Edit3, Save, X, AlertTriangle, CheckCircle, Clock, FileText, Camera, Landmark } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ROLE_COLOR = {
  'Warden': '#f59e0b',
  'Staff':  '#4318FF',
  'Student': '#10b981',
  'Admin':  '#ef4444',
};

const ROLE_GRADIENT = {
  'Warden': 'linear-gradient(135deg, #f59e0b, #d97706, #b45309)',
  'Staff':  'linear-gradient(135deg, #4318FF, #7B5FFF, #a78bfa)',
  'Student': 'linear-gradient(135deg, #10b981, #34d399, #6ee7b7)',
  'Admin':  'linear-gradient(135deg, #ef4444, #f87171, #fca5a5)',
};

const ProfilePage = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', roomNumber: '', block: '', hostelName: '',
    oldPassword: '', password: '', profilePictureFile: null
  });
  const [previewPic, setPreviewPic] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 });
  const editFormRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        roomNumber: user.roomNumber || '',
        block: user.block || '',
        hostelName: user.hostelName || '',
        oldPassword: '',
        password: '',
        profilePictureFile: null
      });
      setPreviewPic(null);
      fetchStats();
    }
  }, [user]);

  // Auto-scroll to edit form when opened
  useEffect(() => {
    if (isEditing && editFormRef.current) {
      setTimeout(() => {
        editFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [isEditing]);

  const fetchStats = async () => {
    try {
      const { data } = await complaintService.getAll();
      // For students: filter by createdBy._id matching user._id
      // For others: show all complaints they can see
      const myComplaints = user.role === 'Student'
        ? data.filter(c => c.createdBy?._id === user._id || c.createdBy === user._id)
        : data;
      setStats({
        total: myComplaints.length,
        resolved: myComplaints.filter(c => c.status === 'Resolved' || c.status === 'Verified by Student').length,
        pending: myComplaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length,
      });
    } catch (_) {}
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePictureFile: file });
      setPreviewPic(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await authService.updateProfile(formData);
      updateUser(data);
      setIsEditing(false);
      setPreviewPic(null);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      // Scroll back to top to see results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  const roleColor = ROLE_COLOR[user.role] || '#4318FF';
  const roleGradient = ROLE_GRADIENT[user.role] || ROLE_GRADIENT['Staff'];
  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';
  const profilePicUrl = user.profilePicture ? `${API_BASE}/${user.profilePicture}` : null;

  return (
    <div style={{ maxWidth: 960, margin: '2rem auto', padding: '0 1rem' }}>

      {/* Success/Error message at top */}
      {message.text && !isEditing && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 18px', borderRadius: 12, marginBottom: 16,
          background: message.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
          color: message.type === 'success' ? '#10b981' : '#ef4444',
          fontWeight: 600, fontSize: '0.9rem',
          border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          animation: 'dropdownFadeIn 0.3s ease'
        }}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {message.text}
        </div>
      )}

      {/* ── Banner Card ── */}
      <div style={{
        background: '#fff', borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 4px 30px rgba(0,0,0,0.06)', border: '1px solid rgba(226,232,248,0.6)'
      }}>
        {/* Gradient banner */}
        <div style={{
          height: 160, background: roleGradient,
          position: 'relative',
        }}>
          {/* Decorative shapes */}
          <div style={{ position: 'absolute', top: 20, right: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', top: 50, right: 100, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: 20, left: 60, width: 60, height: 60, borderRadius: 16, background: 'rgba(255,255,255,0.06)', transform: 'rotate(45deg)' }} />

          {/* StayOps Profile label */}
          <div style={{
            position: 'absolute', top: 20, left: 24,
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
            padding: '6px 16px', borderRadius: 20,
            color: '#fff', fontWeight: 700, fontSize: '0.78rem',
            letterSpacing: '1px', textTransform: 'uppercase'
          }}>
            StayOps Profile
          </div>

          {/* Hostel name on banner */}
          {user.hostelName && (
            <div style={{
              position: 'absolute', bottom: 16, right: 24,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
              padding: '5px 14px', borderRadius: 16,
              color: '#fff', fontWeight: 600, fontSize: '0.75rem',
              letterSpacing: '0.5px',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              <Landmark size={13} /> {user.hostelName}
            </div>
          )}
        </div>

        {/* Profile info section */}
        <div style={{ padding: '0 32px 28px', position: 'relative' }}>
          {/* Avatar */}
          <div style={{
            width: 110, height: 110, borderRadius: '50%',
            background: profilePicUrl ? 'transparent' : roleGradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: '2.2rem',
            border: '4px solid #fff',
            boxShadow: `0 4px 20px ${roleColor}40`,
            position: 'relative', top: -55, marginBottom: -45,
            letterSpacing: '1px',
            overflow: 'hidden'
          }}>
            {profilePicUrl ? (
              <img src={profilePicUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initials
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 style={{ margin: 0, color: '#1B2559', fontWeight: 800, fontSize: '1.6rem' }}>
                {user.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                <span style={{
                  background: `${roleColor}15`, color: roleColor,
                  padding: '3px 12px', borderRadius: 20,
                  fontWeight: 700, fontSize: '0.75rem',
                  letterSpacing: '0.5px', textTransform: 'uppercase'
                }}>
                  {user.role}
                </span>
                <span style={{ color: '#718EBF', fontSize: '0.85rem' }}>@{user.name?.toLowerCase().replace(/\s+/g, '')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
                {user.hostelName && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#718EBF', fontSize: '0.85rem' }}>
                    <Landmark size={14} /> {user.hostelName}
                  </span>
                )}
                {user.block && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#718EBF', fontSize: '0.85rem' }}>
                    <Building2 size={14} /> Block {user.block}
                  </span>
                )}
                {user.roomNumber && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#718EBF', fontSize: '0.85rem' }}>
                    <Home size={14} /> Room {user.roomNumber}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#718EBF', fontSize: '0.85rem' }}>
                  <Calendar size={14} /> Joined {joinDate}
                </span>
              </div>
            </div>

            <button
              onClick={() => { setIsEditing(!isEditing); setMessage({ type: '', text: '' }); setShowPasswordChange(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 20px', borderRadius: 10,
                background: isEditing ? 'rgba(239,68,68,0.08)' : `${roleColor}10`,
                color: isEditing ? '#ef4444' : roleColor,
                border: `1.5px solid ${isEditing ? 'rgba(239,68,68,0.3)' : roleColor + '30'}`,
                fontWeight: 600, fontSize: '0.88rem',
                cursor: 'pointer', transition: 'all 0.2s ease'
              }}
            >
              {isEditing ? <><X size={16} /> Cancel</> : <><Edit3 size={16} /> Edit Profile</>}
            </button>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', gap: 0, marginTop: 24,
            background: 'rgba(67,24,255,0.02)', borderRadius: 14,
            border: '1px solid rgba(226,232,248,0.6)', overflow: 'hidden'
          }}>
            {[
              { icon: <FileText size={18} color={roleColor} />, value: stats.total, label: 'Total Complaints' },
              { icon: <CheckCircle size={18} color="#10b981" />, value: stats.resolved, label: 'Resolved' },
              { icon: <Clock size={18} color="#f59e0b" />, value: stats.pending, label: 'Pending' },
            ].map((stat, i) => (
              <div key={i} style={{
                flex: 1, textAlign: 'center', padding: '18px 12px',
                borderRight: i < 2 ? '1px solid rgba(226,232,248,0.6)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                  {stat.icon}
                  <span style={{ fontWeight: 800, color: '#1B2559', fontSize: '1.3rem' }}>{stat.value}</span>
                </div>
                <div style={{ color: '#718EBF', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Details & About Section ── */}
      <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>

        {/* Details Card */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 28,
          boxShadow: '0 2px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,248,0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 6, height: 22, borderRadius: 3, background: roleGradient }} />
            <h3 style={{ margin: 0, color: '#1B2559', fontWeight: 700, fontSize: '1.05rem' }}>Details</h3>
          </div>

          {[
            { icon: <Shield size={16} color={roleColor} />, label: 'ROLE', value: user.role },
            { icon: <Mail size={16} color="#718EBF" />, label: 'EMAIL', value: user.email },
            ...(user.hostelName ? [{ icon: <Landmark size={16} color="#718EBF" />, label: 'HOSTEL', value: user.hostelName }] : []),
            ...(user.roomNumber ? [{ icon: <Home size={16} color="#718EBF" />, label: 'ROOM', value: user.roomNumber }] : []),
            ...(user.block ? [{ icon: <Building2 size={16} color="#718EBF" />, label: 'BLOCK', value: user.block }] : []),
            { icon: <Calendar size={16} color="#718EBF" />, label: 'MEMBER SINCE', value: joinDate },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid rgba(226,232,248,0.4)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {item.icon}
                <span style={{ color: '#718EBF', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{item.label}</span>
              </div>
              <span style={{ color: '#1B2559', fontWeight: 600, fontSize: '0.9rem', maxWidth: 180, textAlign: 'right', wordBreak: 'break-word' }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* About / Quick Actions Card */}
        <div style={{
          background: '#fff', borderRadius: 16, padding: 28,
          boxShadow: '0 2px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,248,0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 6, height: 22, borderRadius: 3, background: roleGradient }} />
            <h3 style={{ margin: 0, color: '#1B2559', fontWeight: 700, fontSize: '1.05rem' }}>About</h3>
          </div>

          <div style={{
            background: 'rgba(67,24,255,0.03)', borderRadius: 12,
            padding: 20, marginBottom: 20,
            border: '1px solid rgba(226,232,248,0.4)'
          }}>
            <p style={{ margin: 0, color: '#4a5568', fontSize: '0.9rem', lineHeight: 1.6 }}>
              {user.role === 'Student'
                ? `${user.name} is a resident${user.hostelName ? ` at ${user.hostelName}` : ' at the hostel'}${user.block ? `, Block ${user.block}` : ''}${user.roomNumber ? `, Room ${user.roomNumber}` : ''}. Using StayOps for managing complaints and hostel services.`
                : user.role === 'Staff'
                  ? `${user.name} is a staff member${user.hostelName ? ` at ${user.hostelName}` : ''} responsible for handling and resolving hostel complaints and maintenance requests.`
                  : user.role === 'Warden'
                    ? `${user.name} is a warden${user.hostelName ? ` at ${user.hostelName}` : ''} overseeing hostel operations, complaint management, and student welfare.`
                    : `${user.name} is a system administrator with full access to StayOps platform management.`
              }
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 6, height: 22, borderRadius: 3, background: roleGradient }} />
            <h3 style={{ margin: 0, color: '#1B2559', fontWeight: 700, fontSize: '1.05rem' }}>Role & Access</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(user.role === 'Student'
              ? ['File Complaints', 'Track Status', 'View Notifications']
              : user.role === 'Staff'
                ? ['Resolve Complaints', 'Update Status', 'View Assignments']
                : user.role === 'Warden'
                  ? ['Oversee Complaints', 'Assign Staff', 'View Analytics', 'Manage Notifications']
                  : ['Full Access', 'User Management', 'System Analytics', 'Platform Settings']
            ).map((tag, i) => (
              <span key={i} style={{
                background: `${roleColor}10`, color: roleColor,
                padding: '5px 14px', borderRadius: 20,
                fontWeight: 600, fontSize: '0.78rem',
                border: `1px solid ${roleColor}20`
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Edit Profile Form ── */}
      {isEditing && (
        <div ref={editFormRef} style={{
          background: '#fff', borderRadius: 16, padding: 32, marginTop: 20,
          boxShadow: '0 2px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(226,232,248,0.6)',
          animation: 'dropdownFadeIn 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 6, height: 22, borderRadius: 3, background: roleGradient }} />
            <h3 style={{ margin: 0, color: '#1B2559', fontWeight: 700, fontSize: '1.05rem' }}>Edit Profile</h3>
          </div>

          {message.text && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', borderRadius: 10, marginBottom: 20,
              background: message.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              color: message.type === 'success' ? '#10b981' : '#ef4444',
              fontWeight: 600, fontSize: '0.88rem',
              border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
            }}>
              {message.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave}>
            {/* Profile Picture Upload */}
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 90, height: 90, borderRadius: '50%',
                  background: (previewPic || profilePicUrl) ? 'transparent' : roleGradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: '1.6rem',
                  cursor: 'pointer', position: 'relative',
                  overflow: 'hidden',
                  border: `3px dashed ${roleColor}50`,
                  transition: 'all 0.3s ease',
                  flexShrink: 0
                }}
              >
                {(previewPic || profilePicUrl) ? (
                  <img src={previewPic || profilePicUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials
                )}
                {/* Camera overlay */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: '35%', background: 'rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Camera size={16} color="#fff" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div>
                <div style={{ fontWeight: 700, color: '#1B2559', fontSize: '0.95rem', marginBottom: 4 }}>Profile Picture</div>
                <div style={{ color: '#718EBF', fontSize: '0.8rem', lineHeight: 1.4 }}>
                  Click the avatar to upload a new photo.<br />
                  Max size: 5MB. JPG, PNG, or WebP.
                </div>
                {previewPic && (
                  <button
                    type="button"
                    onClick={() => { setPreviewPic(null); setFormData({ ...formData, profilePictureFile: null }); }}
                    style={{
                      marginTop: 8, padding: '4px 12px', borderRadius: 6,
                      background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                      border: '1px solid rgba(239,68,68,0.2)',
                      fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', color: '#718EBF', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
                <input
                  type="text" required value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    border: '1.5px solid rgba(226,232,248,0.8)', fontSize: '0.9rem',
                    color: '#1B2559', outline: 'none', transition: 'border 0.2s',
                    fontWeight: 500, background: '#fafbff', boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = roleColor}
                  onBlur={e => e.target.style.borderColor = 'rgba(226,232,248,0.8)'}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', color: '#718EBF', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
                <input
                  type="email" required value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    border: '1.5px solid rgba(226,232,248,0.8)', fontSize: '0.9rem',
                    color: '#1B2559', outline: 'none', transition: 'border 0.2s',
                    fontWeight: 500, background: '#fafbff', boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = roleColor}
                  onBlur={e => e.target.style.borderColor = 'rgba(226,232,248,0.8)'}
                />
              </div>

              {/* Hostel Name */}
              <div>
                <label style={{ display: 'block', color: '#718EBF', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hostel Name</label>
                <input
                  type="text" value={formData.hostelName}
                  placeholder="e.g. Sree Venkateswara Hostel"
                  onChange={e => setFormData({ ...formData, hostelName: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    border: '1.5px solid rgba(226,232,248,0.8)', fontSize: '0.9rem',
                    color: '#1B2559', outline: 'none', transition: 'border 0.2s',
                    fontWeight: 500, background: '#fafbff', boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = roleColor}
                  onBlur={e => e.target.style.borderColor = 'rgba(226,232,248,0.8)'}
                />
              </div>

              {/* Room Number (student only) */}
              {user.role === 'Student' && (
                <>
                  <div>
                    <label style={{ display: 'block', color: '#718EBF', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Room Number</label>
                    <input
                      type="text" value={formData.roomNumber}
                      onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 10,
                        border: '1.5px solid rgba(226,232,248,0.8)', fontSize: '0.9rem',
                        color: '#1B2559', outline: 'none', transition: 'border 0.2s',
                        fontWeight: 500, background: '#fafbff', boxSizing: 'border-box'
                      }}
                      onFocus={e => e.target.style.borderColor = roleColor}
                      onBlur={e => e.target.style.borderColor = 'rgba(226,232,248,0.8)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#718EBF', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Block</label>
                    <input
                      type="text" value={formData.block}
                      onChange={e => setFormData({ ...formData, block: e.target.value })}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 10,
                        border: '1.5px solid rgba(226,232,248,0.8)', fontSize: '0.9rem',
                        color: '#1B2559', outline: 'none', transition: 'border 0.2s',
                        fontWeight: 500, background: '#fafbff', boxSizing: 'border-box'
                      }}
                      onFocus={e => e.target.style.borderColor = roleColor}
                      onBlur={e => e.target.style.borderColor = 'rgba(226,232,248,0.8)'}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Password section */}
            <div style={{
              marginTop: 20, padding: 20, borderRadius: 12,
              background: 'rgba(0,0,0,0.015)', border: '1px solid rgba(226,232,248,0.5)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, color: '#1B2559', fontSize: '0.88rem' }}>Password Settings</div>
                {!showPasswordChange && (
                  <button
                    type="button"
                    onClick={() => setShowPasswordChange(true)}
                    style={{
                      background: 'rgba(67,24,255,0.08)', color: '#4318FF',
                      border: '1px solid rgba(67,24,255,0.2)', padding: '6px 14px',
                      borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Change Password
                  </button>
                )}
              </div>
              
              {showPasswordChange && (
                <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14 }}>
                  <div>
                    <label style={{ display: 'block', color: '#718EBF', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Password (Required)</label>
                    <input
                      type="password" placeholder="Enter previous password"
                      value={formData.oldPassword}
                      onChange={e => setFormData({ ...formData, oldPassword: e.target.value })}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 10,
                        border: '1.5px solid rgba(226,232,248,0.8)', fontSize: '0.9rem',
                        color: '#1B2559', outline: 'none', fontWeight: 500, background: '#fafbff',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#718EBF', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Password</label>
                    <input
                      type="password" placeholder="Enter new password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 10,
                        border: '1.5px solid rgba(226,232,248,0.8)', fontSize: '0.9rem',
                        color: '#1B2559', outline: 'none', fontWeight: 500, background: '#fafbff',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-start' }}>
                     <button
                        type="button"
                        onClick={() => {
                          setShowPasswordChange(false);
                          setFormData({ ...formData, oldPassword: '', password: '' });
                        }}
                        style={{
                          background: 'transparent', color: '#ef4444', border: 'none',
                          fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: 0
                        }}
                      >
                        Cancel Password Change
                      </button>
                  </div>
                </div>
              )}
            </div>

            {/* Save button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button
                type="button"
                onClick={() => { setIsEditing(false); setPreviewPic(null); setShowPasswordChange(false); setMessage({ type: '', text: '' }); }}
                style={{
                  padding: '10px 24px', borderRadius: 10,
                  background: 'transparent', border: '1.5px solid rgba(226,232,248,0.8)',
                  color: '#718EBF', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit" disabled={isSaving}
                style={{
                  padding: '10px 28px', borderRadius: 10,
                  background: roleGradient, border: 'none',
                  color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  opacity: isSaving ? 0.7 : 1,
                  boxShadow: `0 4px 14px ${roleColor}30`,
                  transition: 'all 0.2s ease'
                }}
              >
                <Save size={16} /> {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Animation keyframes */}
      <style>{`
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
