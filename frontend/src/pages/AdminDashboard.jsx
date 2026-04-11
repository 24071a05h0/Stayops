import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { analyticsService } from '../services/api';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Activity, ShieldAlert, CheckCircle, BarChart3 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await analyticsService.getAnalytics();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;
  if (!stats) return <div className="text-center mt-5 text-white">Failed to load analytics</div>;

  const categoryData = {
    labels: stats.byCategory.map(c => c._id),
    datasets: [{
      label: 'Complaints by Category',
      data: stats.byCategory.map(c => c.count),
      backgroundColor: ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
    }]
  };

  const priorityData = {
    labels: stats.byPriority.map(p => p._id),
    datasets: [{
      data: stats.byPriority.map(p => p.count),
      backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#6B7280'], // Urgent, High, Med, Low
      borderColor: 'rgba(10,22,40,0.8)',
      borderWidth: 2,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94A3B8' } },
    },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } },
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94A3B8' } }
    }
  };

  return (
    <Container className="fade-in py-4">
      <div className="d-flex justify-content-between align-items-center mb-5 border-bottom border-light pb-3">
        <div>
          <h2 className="text-white fw-bold mb-0">System Analytics</h2>
          <p className="text-muted small mb-0">Platform-wide overview and SLA tracking</p>
        </div>
        <BarChart3 className="text-primary opacity-50" size={36} />
      </div>

      <Row className="g-4 mb-5">
        <Col md={3}>
          <Card className="glass-panel text-center h-100 p-3">
            <Card.Body>
              <Activity className="text-primary mb-3" size={32} />
              <h2 className="text-white fw-bold m-0">{stats.total}</h2>
              <p className="text-muted small text-uppercase fw-semibold mb-0">Total Issued</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="glass-panel text-center h-100 p-3">
            <Card.Body>
              <CheckCircle className="text-success mb-3" size={32} />
              <h2 className="text-white fw-bold m-0">{stats.resolved}</h2>
              <p className="text-muted small text-uppercase fw-semibold mb-0">Resolved</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="glass-panel text-center h-100 p-3">
            <Card.Body>
              <Activity className="text-warning mb-3" size={32} />
              <h2 className="text-white fw-bold m-0">{stats.pending}</h2>
              <p className="text-muted small text-uppercase fw-semibold mb-0">Pending</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="glass-panel text-center h-100 p-3 border-0 border-top border-4 border-danger">
            <Card.Body>
              <ShieldAlert className="text-danger mb-3" size={32} />
              <h2 className="text-danger fw-bold m-0">{stats.slaBreaches}</h2>
              <p className="text-muted small text-uppercase fw-semibold mb-0">SLA Breaches</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={8}>
          <Card className="glass-panel border-0">
            <Card.Header className="bg-transparent border-secondary text-white fw-bold py-3 px-4">
              Volume by Category
            </Card.Header>
            <Card.Body className="p-4" style={{ height: '350px' }}>
              <Bar data={categoryData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="glass-panel border-0 h-100">
            <Card.Header className="bg-transparent border-secondary text-white fw-bold py-3 px-4">
              Priority Distribution
            </Card.Header>
            <Card.Body className="p-4 d-flex justify-content-center align-items-center" style={{ height: '350px' }}>
              <div style={{ width: '85%', height: '85%' }}>
                <Doughnut 
                  data={priorityData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { color: '#94A3B8' } } }
                  }} 
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
