import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Badge, Spinner, Row, Col, Form, Button } from 'react-bootstrap';
import { complaintService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Clock, CheckCircle, AlertTriangle, User, XCircle, RotateCcw } from 'lucide-react';

// ─── Status helpers ────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  'Pending':             '#f59e0b',
  'In Progress':         '#3b82f6',
  'Resolved by Staff':   '#10b981',
  'Verified by Student': '#8b5cf6',
  'Reopened':            '#ef4444',
  'Resolved':            '#22c55e',
  'Rejected':            '#ef4444',
};
const STATUS_LABEL = {
  'Pending':             'Problem Raised',
  'In Progress':         'Staff Assigned',
  'Resolved by Staff':   'Fixed by Staff — Awaiting Student',
  'Verified by Student': 'Student Confirmed — Awaiting Warden',
  'Reopened':            'Escalated to Warden',
  'Resolved':            'Resolved ✅',
  'Rejected':            'Rejected',
};

// ─── Step tracker component ────────────────────────────────────────────────────
const STEPS = [
  { key: 'Pending',             label: 'Raised' },
  { key: 'In Progress',         label: 'Staff Assigned' },
  { key: 'Resolved by Staff',   label: 'Staff Fixed' },
  { key: 'Verified by Student', label: 'Student Confirmed' },
  { key: 'Resolved',            label: 'Warden Resolved' },
];
const STEP_ORDER = STEPS.map(s => s.key);

function StepTracker({ currentStatus }) {
  const resolvedIdx = currentStatus === 'Reopened'
    ? 1
    : STEP_ORDER.indexOf(currentStatus);

  return (
    <div className="d-flex align-items-center justify-content-between mb-4 px-2">
      {STEPS.map((step, i) => {
        const done    = i < resolvedIdx;
        const active  = i === resolvedIdx;
        const reopen  = currentStatus === 'Reopened' && i === 1;
        const color   = done || active ? '#4318FF' : '#c8d0e7';
        return (
          <React.Fragment key={step.key}>
            <div className="d-flex flex-column align-items-center" style={{ flex: 1 }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: 32, height: 32,
                  background: done ? '#22c55e' : active ? (reopen ? '#ef4444' : '#4318FF') : '#e4e9f5',
                  color: done || active ? '#fff' : '#a0aec0',
                  fontSize: 13, boxShadow: active ? `0 0 0 4px ${done ? '#dcfce7' : reopen ? '#fee2e2' : '#ede9fe'}` : 'none',
                  transition: 'all 0.3s'
                }}
              >
                {done ? '✓' : i + 1}
              </div>
              <div className="text-center mt-1" style={{ fontSize: '0.7rem', color: active ? '#1B2559' : '#718EBF', fontWeight: active ? 700 : 400, maxWidth: 64 }}>
                {step.label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 3, background: done ? '#22c55e' : '#e4e9f5', marginBottom: 20, transition: 'background 0.4s' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
const ComplaintTracker = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Warden panel
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [priorityUpdate, setPriorityUpdate] = useState('');

  // Staff panel
  const [resolutionImage, setResolutionImage] = useState(null);
  const [staffNote, setStaffNote] = useState('');

  // Student verify panel
  const [verifyImage, setVerifyImage] = useState(null);
  const [verifyNote, setVerifyNote] = useState('');

  // Student reject panel
  const [reopenImage, setReopenImage] = useState(null);
  const [reopenNote, setReopenNote] = useState('');

  useEffect(() => {
    fetchComplaint();
    if (user && ['Warden', 'Admin'].includes(user.role)) fetchStaff();
  }, [id, user]);

  useEffect(() => {
    if (!complaint) return;
    if (complaint.slaDeadline && !['Resolved', 'Rejected'].includes(complaint.status)) {
      const timer = setInterval(() => {
        const dist = new Date(complaint.slaDeadline).getTime() - Date.now();
        if (dist < 0) { clearInterval(timer); setTimeLeft('SLA Breached'); return; }
        const h = Math.floor(dist / 3600000);
        const m = Math.floor((dist % 3600000) / 60000);
        const s = Math.floor((dist % 60000) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }, 1000);
      return () => clearInterval(timer);
    }
    setTimeLeft(complaint.status === 'Resolved' ? 'Completed ✅' : 'N/A');
  }, [complaint]);

  const fetchStaff = async () => {
    try {
      const { authService } = await import('../services/api');
      const { data } = await authService.getStaff();
      setStaffList(data);
    } catch (err) { console.error(err); }
  };

  const fetchComplaint = async () => {
    try {
      const { data } = await complaintService.getById(id);
      setComplaint(data);
      if (data.priority) setPriorityUpdate(data.priority);
      if (data.assignedTo) setSelectedStaff(data.assignedTo._id);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const submit = async (formData) => {
    setIsUpdating(true);
    try {
      await complaintService.updateStatus(id, formData);
      await fetchComplaint();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally { setIsUpdating(false); }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleWardenSave = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    if (selectedStaff && selectedStaff !== complaint.assignedTo?._id) fd.append('assignedTo', selectedStaff);
    if (priorityUpdate && priorityUpdate !== complaint.priority) fd.append('priority', priorityUpdate);
    let hasData = false; for (let _ of fd.keys()) { hasData = true; break; }
    if (hasData) await submit(fd);
  };

  const handleWardenFinalize = async () => {
    if (!window.confirm('Finalize and mark this complaint as officially Resolved?')) return;
    const fd = new FormData();
    fd.append('status', 'Resolved');
    await submit(fd);
  };

  const handleStaffMarkResolved = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('resolutionImage', resolutionImage);
    fd.append('status', 'Resolved by Staff');
    if (staffNote) fd.append('note', staffNote);
    await submit(fd);
    setResolutionImage(null); setStaffNote('');
  };

  const handleStudentVerify = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('verifyImage', verifyImage);
    fd.append('status', 'Verified by Student');
    if (verifyNote) fd.append('note', verifyNote);
    await submit(fd);
    setVerifyImage(null); setVerifyNote('');
  };

  const handleStudentReopen = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('reopenImage', reopenImage);
    fd.append('status', 'Reopened');
    fd.append('note', reopenNote || 'Student rejected: problem not resolved');
    await submit(fd);
    setReopenImage(null); setReopenNote('');
  };

  // ── Loading / not found ───────────────────────────────────────────────────
  if (loading) return <div className="text-center mt-5"><Spinner animation="grow" variant="primary" /></div>;
  if (!complaint) return <div className="text-center mt-5" style={{ color: 'var(--text-heading)' }}>Complaint not found</div>;

  const getPriorityColor = (p) => ({ Urgent: 'danger', High: 'warning', Medium: 'info' }[p] || 'secondary');
  const isWardenOrAdmin = ['Warden', 'Admin'].includes(user.role);
  const isFinal = ['Resolved', 'Rejected'].includes(complaint.status);

  const panelStyle = { background: '#fff', border: '1px solid var(--border-light)', borderRadius: 16, padding: '1.5rem', boxShadow: 'var(--shadow-card)', marginBottom: '1rem' };
  const sectionLabel = { color: 'var(--text-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' };

  return (
    <Container className="fade-in py-4 dashboard-container-mobile" style={{ maxWidth: '920px' }}>
      <div className="mb-3">
        <Link to="/dashboard" className="text-decoration-none small" style={{ color: 'var(--primary)' }}>← Back to Dashboard</Link>
      </div>

      {/* ── Step Tracker ── */}
      <div style={panelStyle}>
        <StepTracker currentStatus={complaint.status} />
        <div className="text-center">
          <span className="px-3 py-1 rounded-pill fw-semibold" style={{ background: STATUS_COLOR[complaint.status] + '20', color: STATUS_COLOR[complaint.status], fontSize: '0.9rem', border: `1px solid ${STATUS_COLOR[complaint.status]}40` }}>
            {STATUS_LABEL[complaint.status] || complaint.status}
          </span>
        </div>
      </div>

      <Row className="g-4">
        {/* ── Left: Complaint Details ── */}
        <Col md={7}>
          <div style={panelStyle}>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start mb-3 gap-2">
              <Badge bg={getPriorityColor(complaint.priority)} className="px-3 py-2">{complaint.priority} Priority</Badge>
              <div className="text-end">
                <Badge bg="dark" className="text-white mb-1">{complaint.category}</Badge>
                <div className="small mt-1" style={{ color: 'var(--text-muted)' }}>ID: {complaint._id.substring(0, 8)}</div>
              </div>
            </div>

            <h4 className="fw-bold mb-2" style={{ color: 'var(--text-heading)' }}>{complaint.title}</h4>
            <p className="mb-4 lh-lg p-3 rounded" style={{ color: 'var(--text-body)', background: 'var(--bg-color)', border: '1px solid var(--border-light)' }}>
              {complaint.description}
            </p>

            <div className="d-flex flex-column flex-sm-row gap-2 gap-sm-4 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
              <div className="d-flex align-items-center gap-2">
                <User size={16} style={{ color: 'var(--primary)' }} />
                <span className="small" style={{ color: 'var(--text-muted)' }}>Raised by:</span>
                <span className="small fw-semibold" style={{ color: 'var(--text-heading)' }}>{complaint.createdBy?.name} (Rm {complaint.createdBy?.roomNumber})</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <CheckCircle size={16} className="text-success" />
                <span className="small" style={{ color: 'var(--text-muted)' }}>Assigned:</span>
                <span className="small fw-semibold" style={{ color: 'var(--text-heading)' }}>{complaint.assignedTo?.name || 'Unassigned'}</span>
              </div>
            </div>

            {/* Photos */}
            {complaint.image && (
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                <div className="small fw-bold mb-2" style={{ color: 'var(--text-heading)' }}>📷 Issue Photo</div>
                <img src={`http://localhost:5000/${complaint.image}`} alt="Issue" style={{ maxHeight: 180, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border-light)' }} className="img-fluid" />
              </div>
            )}
            {complaint.resolutionImage && (
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                <div className="small fw-bold mb-2" style={{ color: '#22c55e' }}>✅ Staff Resolution Photo</div>
                <img src={`http://localhost:5000/${complaint.resolutionImage}`} alt="Resolution" style={{ maxHeight: 180, objectFit: 'cover', borderRadius: 10, border: '2px solid #22c55e40' }} className="img-fluid" />
              </div>
            )}
            {complaint.verifyImage && (
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                <div className="small fw-bold mb-2" style={{ color: '#8b5cf6' }}>✔️ Student Confirmation Photo</div>
                <img src={`http://localhost:5000/${complaint.verifyImage}`} alt="Verify" style={{ maxHeight: 180, objectFit: 'cover', borderRadius: 10, border: '2px solid #8b5cf640' }} className="img-fluid" />
              </div>
            )}
            {complaint.reopenImage && (
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                <div className="small fw-bold mb-2" style={{ color: '#ef4444' }}>⚠️ Problem Continues Photo</div>
                <img src={`http://localhost:5000/${complaint.reopenImage}`} alt="Reopen" style={{ maxHeight: 180, objectFit: 'cover', borderRadius: 10, border: '2px solid #ef444440' }} className="img-fluid" />
              </div>
            )}
          </div>
        </Col>

        {/* ── Right: Action Panels ── */}
        <Col md={5}>

          {/* SLA Timer */}
          <div style={{ ...panelStyle, textAlign: 'center' }}>
            <Clock size={32} style={{ color: timeLeft === 'SLA Breached' ? '#ef4444' : 'var(--primary)', marginBottom: 8 }} />
            <div className="small fw-bold text-uppercase mb-1" style={{ color: 'var(--text-muted)', letterSpacing: 1 }}>SLA Countdown</div>
            <div className="fw-bolder" style={{ fontSize: '1.4rem', color: timeLeft === 'SLA Breached' ? '#ef4444' : 'var(--text-heading)' }}>{timeLeft}</div>
            {complaint.slaDeadline && !isFinal && (
              <div className="small mt-1" style={{ color: 'var(--text-muted)' }}>Deadline: {new Date(complaint.slaDeadline).toLocaleString()}</div>
            )}
          </div>

          {/* ── WARDEN: Context-aware panel ── */}
          {isWardenOrAdmin && !isFinal && (
            <div style={panelStyle}>
              <div style={sectionLabel}>🛡️ Warden Controls</div>

              {/* Show staff + priority only when Pending, In Progress, or Reopened */}
              {['Pending', 'In Progress', 'Reopened'].includes(complaint.status) && (
                <Form onSubmit={handleWardenSave}>
                  <Form.Group className="mb-3">
                    <Form.Label>Assign Staff</Form.Label>
                    <Form.Select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)}>
                      <option value="">Select Staff...</option>
                      {staffList.map(s => <option key={s._id} value={s._id}>{s.name} (Blk {s.block})</option>)}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Priority</Form.Label>
                    <Form.Select value={priorityUpdate} onChange={e => setPriorityUpdate(e.target.value)}>
                      {['Low','Medium','High','Urgent'].map(p => <option key={p}>{p}</option>)}
                    </Form.Select>
                  </Form.Group>
                  <Button type="submit" variant="primary" className="w-100 fw-semibold" disabled={isUpdating}>
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Form>
              )}

              {/* Show ONLY Finalize button when student has confirmed */}
              {complaint.status === 'Verified by Student' && (
                <div className="text-center">
                  <CheckCircle size={40} className="text-success mb-3" />
                  <p className="small mb-3" style={{ color: 'var(--text-muted)' }}>
                    The student has confirmed the fix. Click below to officially close this complaint.
                  </p>
                  <Button
                    variant="success"
                    className="w-100 fw-bold py-2"
                    onClick={handleWardenFinalize}
                    disabled={isUpdating}
                    style={{ borderRadius: 12, fontSize: '1rem' }}
                  >
                    {isUpdating ? 'Finalizing...' : '✅ Finalize & Mark Resolved'}
                  </Button>
                </div>
              )}

              {/* Info message for other statuses (e.g. Resolved by Staff – awaiting student) */}
              {complaint.status === 'Resolved by Staff' && (
                <div className="text-center" style={{ color: 'var(--text-muted)' }}>
                  <Clock size={32} className="mb-2 text-primary" />
                  <p className="small mb-0">Awaiting student confirmation. No action needed yet.</p>
                </div>
              )}
            </div>
          )}

          {/* ── STAFF: Upload photo + mark resolved ── */}
          {user.role === 'Staff' && complaint.status === 'In Progress' && (
            <div style={{ ...panelStyle, borderLeft: '4px solid #10b981' }}>
              <div style={sectionLabel}>🔧 Mark as Fixed</div>
              <p className="small mb-3" style={{ color: 'var(--text-muted)' }}>Upload a photo of the fixed problem, then submit.</p>
              <Form onSubmit={handleStaffMarkResolved}>
                <Form.Group className="mb-3">
                  <Form.Label>Resolution Photo (Optional)</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={e => setResolutionImage(e.target.files[0])} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Note (optional)</Form.Label>
                  <Form.Control as="textarea" rows={2} placeholder="e.g. Fan replaced and tested." value={staffNote} onChange={e => setStaffNote(e.target.value)} />
                </Form.Group>
                <Button type="submit" variant="success" className="w-100 fw-semibold" disabled={isUpdating}>
                  {isUpdating ? 'Submitting...' : '✓ Submit Fix'}
                </Button>
              </Form>
            </div>
          )}

          {/* ── STUDENT: Verify or reject ── */}
          {user.role === 'Student' && complaint.status === 'Resolved by Staff' && (
            <>
              {/* Confirm */}
              <div style={{ ...panelStyle, borderLeft: '4px solid #22c55e' }}>
                <div style={sectionLabel}>✅ Confirm Fix</div>
                <p className="small mb-3" style={{ color: 'var(--text-muted)' }}>Upload a photo confirming the issue is resolved.</p>
                <Form onSubmit={handleStudentVerify}>
                  <Form.Group className="mb-3">
                    <Form.Label>Confirmation Photo (Optional)</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={e => setVerifyImage(e.target.files[0])} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Note (optional)</Form.Label>
                    <Form.Control type="text" placeholder="Looks good!" value={verifyNote} onChange={e => setVerifyNote(e.target.value)} />
                  </Form.Group>
                  <Button type="submit" variant="success" className="w-100 fw-semibold" disabled={isUpdating}>
                    {isUpdating ? 'Submitting...' : '✅ Problem Solved'}
                  </Button>
                </Form>
              </div>

              {/* Reject */}
              <div style={{ ...panelStyle, borderLeft: '4px solid #ef4444', marginTop: '1rem' }}>
                <div style={{ ...sectionLabel, color: '#ef4444' }}>⚠️ Problem Not Solved?</div>
                <p className="small mb-3" style={{ color: 'var(--text-muted)' }}>Upload a photo and explain. This will escalate to the Warden.</p>
                <Form onSubmit={handleStudentReopen}>
                  <Form.Group className="mb-3">
                    <Form.Label>Photo of Problem (Optional)</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={e => setReopenImage(e.target.files[0])} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Reason</Form.Label>
                    <Form.Control type="text" placeholder="What's still wrong?" value={reopenNote} onChange={e => setReopenNote(e.target.value)} />
                  </Form.Group>
                  <Button type="submit" variant="danger" className="w-100 fw-semibold" disabled={isUpdating}>
                    {isUpdating ? 'Escalating...' : '🔁 Escalate to Warden'}
                  </Button>
                </Form>
              </div>
            </>
          )}

          {/* Final resolved banner */}
          {complaint.status === 'Resolved' && (
            <div style={{ ...panelStyle, textAlign: 'center', borderTop: '4px solid #22c55e' }}>
              <CheckCircle size={40} className="text-success mb-2" />
              <h6 className="fw-bold" style={{ color: 'var(--text-heading)' }}>Officially Resolved ✅</h6>
              <p className="small" style={{ color: 'var(--text-muted)' }}>This complaint has been finalized by the Warden.</p>
            </div>
          )}

          {complaint.status === 'Reopened' && (
            <div style={{ ...panelStyle, textAlign: 'center', borderTop: '4px solid #ef4444' }}>
              <RotateCcw size={36} style={{ color: '#ef4444', marginBottom: 8 }} />
              <h6 className="fw-bold" style={{ color: '#ef4444' }}>Escalated to Warden</h6>
              <p className="small" style={{ color: 'var(--text-muted)' }}>The Warden will review and reassign staff.</p>
            </div>
          )}
        </Col>

        {/* ── Timeline ── */}
        <Col md={12}>
          <div style={panelStyle}>
            <h5 className="fw-bold mb-4" style={{ color: 'var(--text-heading)' }}>Tracking Timeline</h5>
            <div className="position-relative">
              <div className="position-absolute h-100 border-start border-2" style={{ left: 11, top: 10, borderColor: 'var(--border-light)' }}></div>
              {complaint.timeline.map((event, i) => (
                <div key={i} className="d-flex mb-4 position-relative z-1 fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="rounded-circle me-3 mt-1 flex-shrink-0 d-flex align-items-center justify-content-center"
                    style={{ width: 24, height: 24, minWidth: 24, background: STATUS_COLOR[event.status] || 'var(--primary)', boxShadow: `0 0 8px ${STATUS_COLOR[event.status] || 'var(--primary)'}60` }}>
                  </div>
                  <div className="w-100 p-3 rounded" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-light)' }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold" style={{ color: STATUS_COLOR[event.status] || 'var(--text-heading)', fontSize: '0.9rem' }}>
                        {STATUS_LABEL[event.status] || event.status}
                      </span>
                      <span className="badge bg-light text-secondary border">{new Date(event.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="small" style={{ color: 'var(--text-muted)' }}>{event.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ComplaintTracker;
