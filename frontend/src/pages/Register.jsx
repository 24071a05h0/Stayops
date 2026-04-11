import React, { useState, useContext } from 'react';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', role: 'Student', roomNumber: '', block: 'A' 
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="fade-in d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Card className="glass-panel border-0 w-100 p-4 mt-4" style={{ maxWidth: '600px' }}>
        <div className="text-center mb-4">
          <UserPlus size={40} className="text-primary mb-2" />
          <h2 className="fw-bold text-white">Join StayOps</h2>
          <p className="text-muted small">Create your account to manage operations</p>
        </div>
        
        {error && <Alert variant="danger" className="py-2 border-0 bg-danger text-white bg-opacity-25">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-light small fw-semibold">Full Name</Form.Label>
                <Form.Control 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-light small fw-semibold">Email address</Form.Label>
                <Form.Control 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-light small fw-semibold">Password</Form.Label>
                <Form.Control 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="text-light small fw-semibold">Role</Form.Label>
                <Form.Select 
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="Student">Student</option>
                  <option value="Staff">Staff</option>
                  <option value="Warden">Warden</option>
                  <option value="Admin">Admin</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {formData.role === 'Student' && (
            <Row className="fade-in">
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="text-light small fw-semibold">Room Number</Form.Label>
                  <Form.Control 
                    type="text" 
                    required={formData.role === 'Student'}
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="text-light small fw-semibold">Block</Form.Label>
                  <Form.Select 
                    value={formData.block}
                    onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                  >
                    <option value="A">Block A</option>
                    <option value="B">Block B</option>
                    <option value="C">Block C</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}

          <Button variant="primary" type="submit" className="w-100 py-2 fw-bold mt-2" disabled={loading}>
            {loading ? 'Registering...' : 'Create Account'}
          </Button>
        </Form>
        <div className="text-center mt-4 text-muted small">
          Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Sign In</Link>
        </div>
      </Card>
    </Container>
  );
};

export default Register;
