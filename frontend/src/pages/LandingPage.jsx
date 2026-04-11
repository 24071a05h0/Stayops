import React, { useContext } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Hexagon, Zap, ShieldCheck, Activity } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const LandingPage = () => {
  const { user } = useContext(AuthContext);

  return (
    <Container className="fade-in d-flex flex-column align-items-center justify-content-center mt-5 pt-5 text-center px-4">
      <Hexagon size={80} className="text-primary mb-4" style={{ filter: 'drop-shadow(0 0 20px rgba(37,99,235,0.6))' }} />
      <h1 className="display-4 fw-bolder mb-3 text-white">Smart Hostel <span className="text-primary">Operations</span></h1>
      <p className="lead text-muted mb-5 w-75 mx-auto">
        Next-generation intelligent operations system with AI automation, accountability tracking, and smart SLA analytics. 
      </p>

      <Row className="w-100 g-4 mt-2 justify-content-center">
        <Col md={4}>
          <Card className="glass-panel text-start h-100 p-3">
            <Card.Body>
              <Zap className="text-warning mb-3" size={40} />
              <Card.Title className="text-white fw-bold">Smart Automation</Card.Title>
              <Card.Text className="text-muted small">
                Auto-categorize and prioritize complaints instantly using AI-based keyword analysis.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="glass-panel text-start h-100 p-3">
            <Card.Body>
              <Activity className="text-danger mb-3" size={40} />
              <Card.Title className="text-white fw-bold">SLA Tracking</Card.Title>
              <Card.Text className="text-muted small">
                Real-time countdown timers. Auto-escalation to Wardens and Admins if deadlines are breached.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="glass-panel text-start h-100 p-3">
            <Card.Body>
              <ShieldCheck className="text-success mb-3" size={40} />
              <Card.Title className="text-white fw-bold">Unified Dashboard</Card.Title>
              <Card.Text className="text-muted small">
                Role-based access control ensuring students, staff, and admins see exactly what they need.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LandingPage;
