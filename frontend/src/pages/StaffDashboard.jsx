import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Button, Table } from 'react-bootstrap';
import { complaintService } from '../services/api';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

const StaffDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

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

  const getPriorityBadge = (priority) => {
    const map = { 'Urgent': 'danger', 'High': 'warning', 'Medium': 'info', 'Low': 'secondary' };
    return map[priority] || 'secondary';
  };

  const DONE_STATUSES = ['Resolved', 'Completed', 'Resolved by Staff', 'Verified by Student', 'Rejected'];

  const urgentCount = complaints.filter(c => c.priority === 'Urgent' && !DONE_STATUSES.includes(c.status)).length;
  const pendingCount = complaints.filter(c => !DONE_STATUSES.includes(c.status)).length;

  // All final/resolved states displayed uniformly as "Resolved"
  const getStatusLabel = (status) => {
    const map = {
      'Resolved':            'Resolved',
      'Completed':           'Resolved',
      'Resolved by Staff':   'Resolved',
      'Verified by Student': 'Resolved',
      'In Progress':         'In Progress',
      'Pending':             'Pending',
      'Reopened':            'Reopened',
      'Rejected':            'Rejected',
    };
    return map[status] || status;
  };

  const getStatusColor = (status) => {
    if (['Resolved', 'Completed', 'Resolved by Staff', 'Verified by Student'].includes(status)) return 'success';
    if (status === 'In Progress') return 'primary';
    if (status === 'Pending') return 'warning';
    if (status === 'Reopened') return 'danger';
    if (status === 'Rejected') return 'secondary';
    return 'muted';
  };

  return (
    <Container className="fade-in py-4">
      <div className="d-flex justify-content-between align-items-center mb-5 border-bottom border-light pb-3">
        <div>
          <h2 className="text-white fw-bold mb-0">Staff Operations</h2>
          <p className="text-muted small mb-0">Manage and resolve assigned complaints</p>
        </div>
      </div>

      <Row className="g-4 mb-5">
        <Col md={6}>
          <Card className="glass-panel text-center border-0 border-top border-3 border-danger">
            <Card.Body className="p-4">
              <AlertCircle size={32} className="text-danger mb-2" />
              <h3 className="text-white fw-bold">{urgentCount}</h3>
              <p className="text-muted small mb-0 fw-semibold text-uppercase">Urgent / High Priority</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="glass-panel text-center border-0 border-top border-3 border-warning">
            <Card.Body className="p-4">
              <Clock size={32} className="text-warning mb-2" />
              <h3 className="text-white fw-bold">{pendingCount}</h3>
              <p className="text-muted small mb-0 fw-semibold text-uppercase">Pending Resolution</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="glass-panel border-0 overflow-hidden">
        <Card.Header className="bg-transparent border-secondary text-white fw-bold py-3 px-4 d-flex justify-content-between align-items-center">
          <span>Assigned Tasks</span>
          <Button variant="outline-primary" size="sm" onClick={fetchComplaints}>Refresh</Button>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
          ) : complaints.length === 0 ? (
            <div className="text-center p-5 text-muted">No assigned complaints. Good job!</div>
          ) : (
            <div className="table-responsive">
              <Table hover variant="dark" className="mb-0 align-middle">
                <thead>
                  <tr className="text-muted small text-uppercase">
                    <th className="px-4 py-3 bg-transparent border-secondary fw-semibold">Task</th>
                    <th className="bg-transparent border-secondary fw-semibold">Location</th>
                    <th className="bg-transparent border-secondary fw-semibold">Priority</th>
                    <th className="bg-transparent border-secondary fw-semibold">Status</th>
                    <th className="bg-transparent border-secondary fw-semibold text-end px-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map(c => (
                    <tr key={c._id}>
                      <td className="px-4 bg-transparent border-secondary">
                        <div className="text-white fw-semibold">{c.title}</div>
                        <div className="text-muted small">{c.category}</div>
                      </td>
                      <td className="bg-transparent border-secondary text-light">
                        {c.createdBy?.roomNumber} - Blk {c.createdBy?.block}
                      </td>
                      <td className="bg-transparent border-secondary">
                        <Badge bg={getPriorityBadge(c.priority)}>{c.priority}</Badge>
                      </td>
                      <td className="bg-transparent border-secondary">
                        <span className={`text-${getStatusColor(c.status)} small fw-semibold`}>
                          {getStatusLabel(c.status)}
                        </span>
                      </td>
                      <td className="bg-transparent border-secondary text-end px-4">
                        <Link to={`/complaint/${c._id}`} className="btn btn-sm btn-primary rounded-pill px-3 py-1">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StaffDashboard;
