import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner, ListGroup } from 'react-bootstrap';
import { Bell, Check, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { notificationService } from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationService.getAll();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container className="fade-in py-4 dashboard-container-mobile" style={{ maxWidth: '800px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to="/dashboard" className="text-muted text-decoration-none small d-flex align-items-center gap-1">
          &larr; Back to Dashboard
        </Link>
      </div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5 border-bottom border-light pb-3">
        <div>
          <h2 className="text-white fw-bold mb-0">Notifications</h2>
          <p className="text-muted small mb-0">Stay updated on your complaint statuses</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          {notifications.some(n => !n.isRead) && (
            <button onClick={markAllAsRead} className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2 rounded-pill px-3">
              <Check size={16} /> Mark all as read
            </button>
          )}
          <Bell className="text-primary opacity-50" size={32} />
        </div>
      </div>

      <Card className="glass-panel border-0">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
          ) : notifications.filter(n => !n.isRead).length === 0 ? (
            <div className="text-center p-5 text-muted d-flex flex-column align-items-center gap-3">
              <Bell size={40} className="opacity-25" />
              <span>You're all caught up!</span>
            </div>
          ) : (
            <ListGroup variant="flush" className="bg-transparent">
              {notifications.filter(n => !n.isRead).map(n => (
                <ListGroup.Item 
                  key={n._id} 
                  className={`bg-transparent border-secondary p-4 d-flex justify-content-between align-items-start gap-4 ${n.isRead ? 'opacity-50' : ''}`}
                >
                  <div className="d-flex gap-3">
                    <div className={`mt-1 rounded-circle p-2 ${n.isRead ? 'bg-secondary bg-opacity-25' : 'bg-primary bg-opacity-25'}`}>
                      <Info size={20} className={n.isRead ? 'text-muted' : 'text-primary'} />
                    </div>
                    <div>
                      <p className={`mb-1 ${n.isRead ? 'text-muted' : 'text-white fw-semibold'}`}>{n.message}</p>
                      <small className="text-muted">{new Date(n.createdAt).toLocaleString()}</small>
                    </div>
                  </div>
                  {!n.isRead && (
                    <button onClick={() => markAsRead(n._id)} className="btn btn-sm btn-outline-secondary rounded-circle p-2 flex-shrink-0" title="Mark as read">
                      <Check size={16} />
                    </button>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Notifications;
