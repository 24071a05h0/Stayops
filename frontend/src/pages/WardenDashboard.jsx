import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Table, Tabs, Tab } from 'react-bootstrap';
import { complaintService } from '../services/api';
import { Link } from 'react-router-dom';
import { ShieldAlert, Users, TrendingUp, CheckSquare } from 'lucide-react';

const WardenDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

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

  const escalatedCount = complaints.filter(c => c.escalationLevel >= 1 && c.status !== 'Resolved').length;
  const escalatedComplaints = complaints.filter(c => c.escalationLevel >= 1 && c.status !== 'Resolved');
  
  const pendingComplaints = complaints.filter(c => ['Pending', 'Rejected'].includes(c.status));
  const inProgressComplaints = complaints.filter(c => ['In Progress', 'Resolved by Staff', 'Resolved by Warden'].includes(c.status));
  const verifiedComplaints = complaints.filter(c => c.status === 'Verified by Student');
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved');
  
  const renderTable = (complaintList, emptyMessage) => (
    complaintList.length === 0 ? (
      <div className="text-center p-5 text-muted">{emptyMessage}</div>
    ) : (
      <Table hover variant="dark" className="mb-0 align-middle">
        <thead>
          <tr className="text-muted small text-uppercase">
            <th className="px-4 py-3 bg-transparent border-secondary fw-semibold">Grievance</th>
            <th className="bg-transparent border-secondary fw-semibold">Student Info</th>
            <th className="bg-transparent border-secondary fw-semibold">Assigned</th>
            <th className="bg-transparent border-secondary fw-semibold">Escalation</th>
            <th className="bg-transparent border-secondary fw-semibold text-end px-4">View</th>
          </tr>
        </thead>
        <tbody>
          {complaintList.map(c => (
            <tr key={c._id}>
              <td className="px-4 bg-transparent border-secondary">
                <div className="text-white fw-semibold">{c.title}</div>
                <div className="text-muted small">
                  <span className={`text-${c.status === 'Resolved' ? 'success' : c.status.includes('Resolved') ? 'info' : 'warning'}`}>{c.status}</span>
                  {c.priority === 'Urgent' && <Badge bg="danger" className="ms-2">Urgent</Badge>}
                </div>
              </td>
              <td className="bg-transparent border-secondary text-light">
                <div className="fw-semibold">{c.createdBy?.name || 'Unknown'}</div>
                <div className="text-muted small">Rm {c.createdBy?.roomNumber} (Blk {c.createdBy?.block})</div>
              </td>
              <td className="bg-transparent border-secondary text-light small">
                {c.assignedTo?.name || 'Unassigned'}
              </td>
              <td className="bg-transparent border-secondary">
                {c.escalationLevel > 0 ? (
                  <Badge bg="danger">Lvl {c.escalationLevel}</Badge>
                ) : (
                  <span className="text-muted small">Normal</span>
                )}
              </td>
              <td className="bg-transparent border-secondary text-end px-4">
                <Link to={`/complaint/${c._id}`} className="btn btn-sm btn-primary rounded-pill px-3 py-1">
                  Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    )
  );

  return (
    <Container className="fade-in py-4">
      <div className="d-flex justify-content-between align-items-center mb-5 border-bottom border-light pb-3">
        <div>
          <h2 className="text-white fw-bold mb-0">Warden Overview</h2>
          <p className="text-muted small mb-0">Monitor block activity and escalated issues</p>
        </div>
      </div>

      <Row className="g-4 mb-5">
        <Col md={3}>
          <Card 
            className="glass-panel text-start border-0 border-start border-4 border-danger h-100 p-2"
            onClick={() => setActiveTab('escalated')}
            style={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
          >
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small mb-1 fw-semibold text-uppercase">Escalated SLAs</p>
                <h3 className="text-danger fw-bolder m-0">{escalatedCount}</h3>
              </div>
              <ShieldAlert size={40} className="text-danger opacity-50" />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card 
            className="glass-panel text-start border-0 border-start border-4 border-primary h-100 p-2"
            onClick={() => setActiveTab('inprogress')}
            style={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
          >
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small mb-1 fw-semibold text-uppercase">Active Issues</p>
                <h3 className="text-white fw-bolder m-0">{pendingComplaints.length + inProgressComplaints.length}</h3>
              </div>
              <TrendingUp size={40} className="text-primary opacity-50" />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card 
            className="glass-panel text-start border-0 border-start border-4 border-warning h-100 p-2"
            onClick={() => setActiveTab('verified')}
            style={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
          >
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small mb-1 fw-semibold text-uppercase">Awaiting Warden</p>
                <h3 className="text-warning fw-bolder m-0">{verifiedComplaints.length}</h3>
              </div>
              <CheckSquare size={40} className="text-warning opacity-50" />
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card 
            className="glass-panel text-start border-0 border-start border-4 border-success h-100 p-2"
            onClick={() => setActiveTab('resolved')}
            style={{ cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)' } }}
          >
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small mb-1 fw-semibold text-uppercase">Resolved (Total)</p>
                <h3 className="text-success fw-bolder m-0">{resolvedComplaints.length}</h3>
              </div>
              <Users size={40} className="text-success opacity-50" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="glass-panel border-0 overflow-hidden">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
          ) : (
            <Tabs 
              activeKey={activeTab} 
              onSelect={(k) => setActiveTab(k)}
              className="border-secondary px-3 pt-3 custom-tabs mb-0"
            >
              <Tab eventKey="pending" title={`Recent (${pendingComplaints.length})`}>
                {renderTable(pendingComplaints, "No recent/pending complaints.")}
              </Tab>
              <Tab eventKey="inprogress" title={`In Progress (${inProgressComplaints.length})`}>
                {renderTable(inProgressComplaints, "No complaints currently in progress.")}
              </Tab>
              <Tab eventKey="verified" title={`Student Confirmed (${verifiedComplaints.length})`}>
                {renderTable(verifiedComplaints, "No complaints awaiting warden verification.")}
              </Tab>
              <Tab eventKey="resolved" title={`Resolved (${resolvedComplaints.length})`}>
                {renderTable(resolvedComplaints, "No resolved complaints yet.")}
              </Tab>
              <Tab eventKey="escalated" title={`Escalated (${escalatedComplaints.length})`}>
                {renderTable(escalatedComplaints, "No escalated complaints.")}
              </Tab>
            </Tabs>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default WardenDashboard;
