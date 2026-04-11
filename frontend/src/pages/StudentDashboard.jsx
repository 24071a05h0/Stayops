import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { complaintService } from '../services/api';
import { Plus, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('All');

  const [formData, setFormData] = useState({ title: '', description: '', image: null });

  const fetchComplaints = async () => {
    try {
      const { data } = await complaintService.getAll();
      setComplaints(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    if(formData.image) submitData.append('image', formData.image);

    try {
      await complaintService.create(submitData);
      setShowForm(false);
      setFormData({ title: '', description: '', image: null });
      fetchComplaints();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit grievance');
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Resolved':
      case 'Completed':
      case 'Resolved by Staff':
      case 'Verified by Student': return <CheckCircle className="text-success" size={16} />;
      case 'In Progress': return <Clock className="text-warning" size={16} />;
      case 'Pending':
      case 'Reopened':
      case 'Rejected': return <AlertTriangle className="text-danger" size={16} />;
      default: return null;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Resolved':
      case 'Completed':
      case 'Verified by Student': return 'success';
      case 'Resolved by Staff': return 'info';
      case 'In Progress': return 'primary';
      case 'Pending': return 'warning';
      case 'Reopened':
      case 'Rejected': return 'danger';
      default: return 'secondary';
    }
  };

  // What students see as the label
  const getStatusLabel = (status) => {
    const map = {
      'Resolved':            'Resolved',
      'Completed':           'Resolved',
      'Resolved by Staff':   'Fixed — Your Response Needed',
      'Verified by Student': 'Confirmed — Awaiting Warden',
      'In Progress':         'In Progress',
      'Reopened':            'Escalated to Warden',
      'Pending':             'Pending',
      'Rejected':            'Rejected',
    };
    return map[status] || status;
  };

  // Cards needing student action
  const needsAction = (status) => status === 'Resolved by Staff';

  // Filter groups
  const FILTERS = [
    { label: 'All',         icon: '📋', match: () => true },
    { label: 'Pending',     icon: '⏳', match: s => s === 'Pending' },
    { label: 'In Progress', icon: '🔧', match: s => s === 'In Progress' },
    { label: 'Verify Fix', icon: '👆', match: s => s === 'Resolved by Staff' },
    { label: 'Resolved',    icon: '✅', match: s => ['Resolved', 'Completed', 'Verified by Student'].includes(s) },
    { label: 'Escalated',   icon: '⚠️', match: s => s === 'Reopened' },
  ];

  const activeFilter = FILTERS.find(f => f.label === filter) || FILTERS[0];
  const filteredComplaints = complaints.filter(c => activeFilter.match(c.status));

  const FILTER_COLORS = {
    'All':           { active: '#4318FF', bg: '#4318FF15' },
    'Pending':       { active: '#f59e0b', bg: '#f59e0b15' },
    'In Progress':   { active: '#3b82f6', bg: '#3b82f615' },
    'Verify Fix':    { active: '#8b5cf6', bg: '#8b5cf615' },
    'Resolved':      { active: '#22c55e', bg: '#22c55e15' },
    'Escalated':     { active: '#ef4444', bg: '#ef444415' },
  };

  return (
    <Container className="fade-in py-4 dashboard-container-mobile">
      <div className="dashboard-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: '#FFFFFF' }}>My Dashboard</h2>
          <p className="mb-0 opacity-75" style={{ color: '#FFFFFF' }}>Room {user.roomNumber} - Block {user.block}</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="d-flex align-items-center gap-2 btn-mobile-full"
          style={{ background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.5)', color: '#fff', borderRadius: '12px', fontWeight: 700, padding: '0.55rem 1.4rem' }}
        >
          <Plus size={18} /> New Grievance
        </Button>
      </div>

      <h5 className="mb-3 fw-bold" style={{ color: 'var(--text-heading)' }}>My Grievances</h5>

      {/* ── Filter Pills ── */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {FILTERS.map(f => {
          const isActive = filter === f.label;
          const col = FILTER_COLORS[f.label];
          const count = complaints.filter(c => f.match(c.status)).length;
          return (
            <button
              key={f.label}
              onClick={() => setFilter(f.label)}
              style={{
                border: `1.5px solid ${isActive ? col.active : 'var(--border-light)'}`,
                background: isActive ? col.active : col.bg,
                color: isActive ? '#fff' : col.active,
                borderRadius: 50,
                padding: '0.4rem 1.1rem',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: isActive ? `0 4px 14px ${col.active}40` : 'none',
              }}
            >
              <span>{f.icon}</span>
              {f.label}
              <span style={{
                background: isActive ? 'rgba(255,255,255,0.25)' : col.active + '30',
                color: isActive ? '#fff' : col.active,
                borderRadius: 20,
                padding: '0 7px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
      ) : filteredComplaints.length === 0 ? (
        <Card className="glass-panel text-center p-5">
          <Card.Body>
            <CheckCircle size={50} className="text-success mb-3 opacity-50" />
            <h5 style={{ color: 'var(--text-heading)' }}>
              {filter === 'All' ? 'All clear!' : `No ${filter} complaints`}
            </h5>
            <p className="text-muted">
              {filter === 'All' ? "You haven't raised any complaints yet." : `Nothing in this category.`}
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {filteredComplaints.map(c => (
            <Col md={6} lg={4} key={c._id}>
              <Card className="glass-panel h-100 position-relative overflow-hidden">
                <div className={`position-absolute top-0 start-0 w-100 bg-${getStatusBadge(c.status)}`} style={{ height: '3px' }}></div>
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge bg="dark" className="text-white">{c.category}</Badge>
                    <div className="d-flex align-items-center gap-1 small" style={{ color: 'var(--text-muted)' }}>
                      {getStatusIcon(c.status)} <span className={`text-${getStatusBadge(c.status)}`}>{getStatusLabel(c.status)}</span>
                    </div>
                  </div>
                  <Card.Title className="fs-6 mt-2 fw-bold text-truncate" style={{ color: 'var(--text-heading)' }}>{c.title}</Card.Title>
                  <Card.Text className="small mb-4 flex-grow-1" style={{ color: 'var(--text-body)' }}>
                    {c.description}
                  </Card.Text>
                  
                  <div className="mt-auto pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="small" style={{ color: 'var(--text-muted)' }}>
                        Added: {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                      <span
                        className="d-inline-flex align-items-center gap-1 px-3 py-1 rounded-pill fw-semibold"
                        style={{
                          background: getStatusBadge(c.status) === 'success' ? '#22c55e'
                            : getStatusBadge(c.status) === 'info' ? '#06b6d4'
                            : getStatusBadge(c.status) === 'primary' ? '#4318FF'
                            : getStatusBadge(c.status) === 'warning' ? '#f59e0b'
                            : getStatusBadge(c.status) === 'danger' ? '#ef4444'
                            : '#6b7280',
                          color: '#ffffff',
                          fontSize: '0.78rem',
                          lineHeight: 1,
                        }}
                      >
                        {getStatusIcon(c.status)}
                        {getStatusLabel(c.status)}
                      </span>
                    </div>
                    {/* Prompt student to act when staff has fixed */}
                    {needsAction(c.status) && (
                      <Link
                        to={`/complaint/${c._id}`}
                        className="btn btn-sm w-100 mt-2 fw-semibold"
                        style={{ background: '#4318FF', color: '#fff', borderRadius: 10, fontSize: '0.82rem' }}
                      >
                        👆 View Fix & Respond
                      </Link>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* New Grievance Modal */}
      <Modal show={showForm} onHide={() => setShowForm(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title style={{ color: 'var(--text-heading)', fontWeight: 700 }}>Raise a Grievance</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Fan not working" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={4} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="e.g. The ceiling fan in my room is making a sparkling noise." />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Photo (Optional)</Form.Label>
              <Form.Control type="file" onChange={e => setFormData({...formData, image: e.target.files[0]})} />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="outline-secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button variant="primary" type="submit">Submit Grievance</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default StudentDashboard;
