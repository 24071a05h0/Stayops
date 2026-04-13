import React, { useState, useContext } from 'react';
import { Container, Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="fade-in d-flex align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
      <Card className="glass-panel border-0 w-100 p-4" style={{ maxWidth: '450px' }}>
        <div className="text-center mb-4">
          <LogIn size={40} className="text-primary mb-2" />
          <h2 className="fw-bold text-white">Welcome Back</h2>
          <p className="text-muted small">Access your StayOps dashboard</p>
        </div>
        
        {error && <Alert variant="danger" className="py-2 border-0 bg-danger text-white bg-opacity-25">{error}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="text-light small fw-semibold">Email address</Form.Label>
            <Form.Control 
              type="email" 
              className="py-2"
              placeholder="name@example.com" 
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="text-light small fw-semibold">Password</Form.Label>
            <InputGroup>
              <Form.Control 
                type={showPassword ? "text" : "password"} 
                className="py-2"
                placeholder="Enter your password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ borderRight: 'none' }}
              />
              <Button 
                variant="outline-secondary" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  background: '#fff', 
                  border: 'var(--bs-border-width) solid var(--bs-border-color)',
                  borderLeft: 'none',
                  display: 'flex', alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} color="#6c757d" /> : <Eye size={18} color="#6c757d" />}
              </Button>
            </InputGroup>
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 py-2 fw-bold" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </Form>
        <div className="text-center mt-4 text-muted small">
          Don't have an account? <Link to="/register" className="text-primary fw-bold text-decoration-none">Create one</Link>
        </div>
      </Card>
    </Container>
  );
};

export default Login;
