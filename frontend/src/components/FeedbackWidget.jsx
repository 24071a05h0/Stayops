import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { MessageSquarePlus, CheckCircle2, X } from 'lucide-react';

const FeedbackWidget = () => {
  const [show, setShow] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setStatus('submitting');
    // Mock API call delay
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        setShow(false);
        setFeedback('');
        setStatus('idle');
      }, 2000);
    }, 800);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setShow(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 1040,
          background: 'linear-gradient(135deg, #4318FF, #7B5FFF)',
          color: '#fff',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          boxShadow: '0 8px 30px rgba(67, 24, 255, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(67, 24, 255, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(67, 24, 255, 0.4)';
        }}
        title="Send Feedback"
      >
        <MessageSquarePlus size={26} strokeWidth={2.5} />
      </button>

      {/* Feedback Modal */}
      <Modal show={show} onHide={() => { if(status !== 'submitting') setShow(false); }} centered backdrop="static" keyboard={status !== 'submitting'}>
        <div style={{ padding: '2rem', position: 'relative' }}>
          {status !== 'submitting' && status !== 'success' && (
            <button 
              onClick={() => setShow(false)}
              style={{
                position: 'absolute', top: '1.2rem', right: '1.2rem',
                background: 'rgba(0,0,0,0.04)', border: 'none',
                width: 30, height: 30, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#718EBF', cursor: 'pointer', transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
            >
              <X size={16} />
            </button>
          )}

          {status === 'success' ? (
            <div className="text-center py-4 fade-in">
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <CheckCircle2 size={32} color="#10b981" />
              </div>
              <h4 style={{ fontWeight: 800, color: '#1B2559', marginBottom: '0.5rem' }}>Thanks for reaching out!</h4>
              <p style={{ color: '#718EBF', fontSize: '0.95rem' }}>Your feedback helps us make StayOps better.</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: '12px', background: 'rgba(67,24,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquarePlus size={20} color="#4318FF" />
                </div>
                <h4 style={{ fontWeight: 800, color: '#1B2559', margin: 0, fontSize: '1.4rem' }}>Feedback</h4>
              </div>
              <p style={{ color: '#718EBF', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Found a bug? Have a suggestion? We'd love to hear your thoughts on how to improve StayOps.
              </p>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Tell us what you think..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                    style={{
                      padding: '1rem', borderRadius: 14, border: '1.5px solid rgba(226,232,248,0.8)',
                      fontSize: '0.95rem', background: '#fafbff', color: '#1B2559',
                      resize: 'none', outline: 'none'
                    }}
                    onFocus={e => e.target.style.borderColor = '#4318FF'}
                    onBlur={e => e.target.style.borderColor = 'rgba(226,232,248,0.8)'}
                  />
                </Form.Group>
                
                <Button 
                  type="submit" 
                  disabled={status === 'submitting' || !feedback.trim()}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 12,
                    background: 'linear-gradient(135deg, #4318FF, #7B5FFF)', border: 'none',
                    fontWeight: 700, fontSize: '1rem',
                    boxShadow: '0 8px 24px rgba(67, 24, 255, 0.25)',
                    opacity: (status === 'submitting' || !feedback.trim()) ? 0.7 : 1
                  }}
                >
                  {status === 'submitting' ? 'Sending...' : 'Send Feedback'}
                </Button>
              </Form>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default FeedbackWidget;
