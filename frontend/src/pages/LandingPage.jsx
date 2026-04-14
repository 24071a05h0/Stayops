import React, { useState, useEffect, useRef, useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import {
  Hexagon, Zap, ShieldCheck, Activity, ArrowRight,
  Users, Clock, BarChart3, Bell, Layers, ChevronLeft,
  ChevronRight, CheckCircle2, Sparkles, Building2,
  GraduationCap, UserCog, Shield
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement
);

/* ─── Dummy Analytics Data ────────────────────────────────── */
const TRENDS_DATA = {
  labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
  datasets: [
    {
      label: 'Issues Raised',
      data: [65, 59, 80, 81, 56, 55],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
      fill: true,
    },
    {
      label: 'Issues Resolved',
      data: [40, 50, 70, 75, 60, 65],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true,
    }
  ],
};

const RESOLUTION_DATA = {
  labels: ['Resolved', 'In Progress', 'Pending'],
  datasets: [{
    data: [70, 20, 10],
    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
    borderWidth: 0,
    hoverOffset: 4
  }]
};

const STAFF_PERFORMANCE_DATA = {
  labels: ['John', 'Sarah', 'Mike', 'Emma', 'David'],
  datasets: [{
    label: 'Tasks Completed',
    data: [45, 60, 38, 52, 41],
    backgroundColor: 'rgba(67, 24, 255, 0.8)',
    borderRadius: 6
  }]
};

const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { color: '#718EBF', font: { family: 'inherit', size: 12 } } } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#a3bed9' } },
    y: { grid: { color: 'rgba(226,232,248,0.5)' }, ticks: { color: '#a3bed9' }, border: { display: false } }
  }
};

const PIE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { color: '#718EBF', font: { family: 'inherit', size: 12 } } } },
  cutout: '70%',
};

/* ─── Feature slides data ──────────────────────────────────── */
const FEATURES = [
  {
    icon: <Zap size={44} />,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    title: 'Lightning-Fast Complaints',
    tagline: 'Raise. Track. Resolve.',
    desc: 'File grievances in seconds with AI-powered auto-categorization. No paperwork, no delays — just instant action.',
    image: '/slider/slide1.png'
  },
  {
    icon: <Activity size={44} />,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    title: 'Real-Time SLA Tracking',
    tagline: 'Every Second Counts.',
    desc: 'Live countdown timers with auto-escalation. Breached deadlines? Wardens and Admins are notified instantly.',
    image: '/slider/slide2.png'
  },
  {
    icon: <ShieldCheck size={44} />,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)',
    title: 'Bulletproof Accountability',
    tagline: 'Transparent. Trackable. Trustworthy.',
    desc: 'Every action is logged. Every update is tracked. Full audit trails ensure nothing slips through the cracks.',
    image: '/slider/slide3.png'
  },
  {
    icon: <Bell size={44} />,
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    title: 'Smart Notifications',
    tagline: 'Stay in the Loop.',
    desc: 'Instant push alerts for status changes, escalations, and resolutions. Never miss an update.',
    image: '/slider/slide4.png'
  },
  {
    icon: <BarChart3 size={44} />,
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.12)',
    title: 'Powerful Analytics Dashboard',
    tagline: 'Data-Driven Decisions.',
    desc: 'Visualize complaint trends, resolution rates, and staff performance with beautiful interactive charts.',
    image: '/slider/slide5.png'
  },
  {
    icon: <Layers size={44} />,
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.12)',
    title: 'Role-Based Access Control',
    tagline: 'Right View. Right Person.',
    desc: 'Students, Staff, Wardens, and Admins each get a tailored dashboard. See exactly what you need.',
    image: '/slider/slide6.png'
  },
];

const STATS = [
  { value: '98%', label: 'Resolution Rate', icon: <CheckCircle2 size={20} /> },
  { value: '4x', label: 'Faster Response', icon: <Zap size={20} /> },
  { value: '500+', label: 'Hostels on StayOps', icon: <Building2 size={20} /> },
  { value: '24/7', label: 'AI Monitoring', icon: <Sparkles size={20} /> },
];

const STEPS = [
  { num: '01', title: 'Student submits a grievance', desc: 'Quick form with AI-based category detection. Attach photos, set priority, done in under 60 seconds.' },
  { num: '02', title: 'Warden reviews & acts', desc: 'Warden sees real-time queue, assigns staff, adds notes, or resolves — all from one clean dashboard.' },
  { num: '03', title: 'Admin monitors live', desc: 'Admin oversees every hostel. Analytics surface bottlenecks. Automated SLA breach alerts keep everyone in line.' },
  { num: '04', title: 'Resolved & closed', desc: 'Students get notified, grievance is marked closed, and the full timeline is preserved for auditing.' },
];

const ROLES = [
  { icon: <GraduationCap size={32} />, role: 'Students', color: '#22c55e', desc: 'Submit complaints, track status in real-time, and rate resolutions — all from a single dashboard.' },
  { icon: <UserCog size={32} />, role: 'Wardens', color: '#f59e0b', desc: 'Manage complaint queues with SLA timers, update statuses, assign staff, and monitor resolution flow.' },
  { icon: <Shield size={32} />, role: 'Admin', color: '#ef4444', desc: 'Full control over all hostels. View analytics, manage grievances, monitor SLA, and oversee staff.' },
  { icon: <Users size={32} />, role: 'Maintenance Staff', color: '#4318FF', desc: 'Directly receive task assignments and update progress without the hassle of paperwork.' },
];

/* ─────────────────────────────────────────────────── */
const LandingPage = () => {
  const { user } = useContext(AuthContext);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [slideDirection, setSlideDirection] = useState('right');
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef(null);

  const totalSlides = FEATURES.length;

  /* Auto-play */
  useEffect(() => {
    if (isAutoPlaying) {
      timerRef.current = setInterval(() => {
        setSlideDirection('right');
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentSlide(prev => (prev + 1) % totalSlides);
          setTimeout(() => setIsAnimating(false), 50);
        }, 300);
      }, 4000);
    }
    return () => clearInterval(timerRef.current);
  }, [isAutoPlaying, totalSlides]);

  const goToSlide = (index) => {
    if (index === currentSlide) return;
    setSlideDirection(index > currentSlide ? 'right' : 'left');
    setIsAnimating(true);
    setIsAutoPlaying(false);
    setTimeout(() => {
      setCurrentSlide(index);
      setTimeout(() => setIsAnimating(false), 50);
    }, 300);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % totalSlides);
  const prevSlide = () => goToSlide((currentSlide - 1 + totalSlides) % totalSlides);

  const feature = FEATURES[currentSlide];

  return (
    <div className="fade-in" style={{ marginTop: '-1rem' }}>

      {/* ───────── HERO & SLIDER (TWO-COLUMN EFFICIENT) ───────── */}
      <section style={{
        position: 'relative',
        margin: '1rem -1rem 2rem',
        padding: '3rem 1rem 4rem',
        overflow: 'hidden',
        minHeight: 500,
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Dynamic Background Image layer for ambiance */}
        <div style={{
          position: 'absolute', inset: 0, backgroundImage: `url(${feature.image})`,
          backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.12,
          filter: 'blur(16px)', zIndex: 0, transition: 'background-image 0.5s ease-in-out'
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(237,240,255,0.92) 0%, rgba(237,240,255,0.85) 40%, rgba(237,240,255,0.98) 100%)', zIndex: 1,
        }} />

        <Container style={{ position: 'relative', zIndex: 2, maxWidth: 1100 }}>
          <Row className="align-items-center">

            {/* HERO TEXT (LEFT ON DESKTOP) */}
            <Col lg={5} className="text-center text-lg-start mb-5 mb-lg-0">
              <div style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, rgba(67,24,255,0.10), rgba(123,95,255,0.08))',
                border: '1px solid rgba(67,24,255,0.15)', borderRadius: 100,
                padding: '5px 18px', marginBottom: '1.2rem', fontSize: '0.75rem',
                fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#4318FF',
              }}>
                Next-Gen Hostel Management
              </div>

              <h1 style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 800, lineHeight: 1.15,
                color: '#1B2559', marginBottom: '1.2rem',
              }}>
                <span style={{
                  background: 'linear-gradient(135deg, #4318FF, #7B5FFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>StayOps</span>{' '}— Smart Hostel Operations
              </h1>

              <p style={{
                fontSize: '1.05rem', color: '#718EBF', lineHeight: 1.6, maxWidth: 500, margin: '0 auto',
              }} className="mx-lg-0 text-center text-lg-start">
                The complete grievance management platform for your hostel — AI automation, accountability tracking, and smart SLA analytics. <strong style={{ color: '#4318FF' }}>Built for modern hostels.</strong>
              </p>
            </Col>

            {/* SLIDER (RIGHT ON DESKTOP) */}
            <Col lg={7}>
              <div style={{ position: 'relative', padding: '0 1rem' }}>
                {/* Arrow buttons */}
                <button onClick={prevSlide} aria-label="Previous feature" style={{
                  position: 'absolute', left: -10, top: '50%', transform: 'translateY(-50%)',
                  width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.95)',
                  border: '1px solid rgba(67,24,255,0.12)', boxShadow: '0 4px 16px rgba(67,24,255,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 5,
                  color: '#4318FF',
                }}>
                  <ChevronLeft size={20} />
                </button>
                <button onClick={nextSlide} aria-label="Next feature" style={{
                  position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)',
                  width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.95)',
                  border: '1px solid rgba(67,24,255,0.12)', boxShadow: '0 4px 16px rgba(67,24,255,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 5,
                  color: '#4318FF',
                }}>
                  <ChevronRight size={20} />
                </button>

                {/* Slide card */}
                <div style={{
                  background: '#ffffff', borderRadius: 24, border: '1px solid rgba(67,24,255,0.08)',
                  boxShadow: '0 10px 40px rgba(67,24,255,0.08)', padding: 0,
                  display: 'flex', flexWrap: 'wrap',
                  alignItems: 'stretch', justifyContent: 'center', overflow: 'hidden',
                  minHeight: 340, opacity: isAnimating ? 0 : 1,
                  transform: isAnimating ? `translateX(${slideDirection === 'right' ? '20px' : '-20px'})` : 'translateX(0)',
                  transition: 'opacity 0.35s ease, transform 0.35s ease',
                  margin: '0 auto',
                  width: '100%'
                }}>
                  {/* Text Side (flex based for responsiveness) */}
                  <div style={{
                    flex: '1 1 50%', padding: '2rem 2rem 2rem 2.5rem', display: 'flex',
                    flexDirection: 'column', justifyContent: 'center', textAlign: 'left', minWidth: 260
                  }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: 16, background: feature.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: feature.color, marginBottom: '1.2rem',
                    }}>
                      {feature.icon && React.cloneElement(feature.icon, { size: 24 })}
                    </div>

                    <div style={{
                      fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: feature.color, marginBottom: 8,
                    }}>
                      {feature.tagline}
                    </div>

                    <h3 style={{
                      fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', fontWeight: 800, color: '#1B2559', margin: '0 0 0.8rem', lineHeight: 1.2
                    }}>
                      {feature.title}
                    </h3>

                    <p style={{
                      fontSize: '0.95rem', color: '#718EBF', lineHeight: 1.6, margin: 0,
                    }}>
                      {feature.desc}
                    </p>
                  </div>

                  {/* Image Side */}
                  <div style={{
                    flex: '1 1 40%', minHeight: 200, backgroundImage: `url(${feature.image})`,
                    backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative',
                  }}>
                    {/* Subtle gradient overlay to blend into the white card */}
                    <div style={{
                      position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 40%)',
                    }} />
                  </div>
                </div>

                {/* Dots indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.5rem' }}>
                  {FEATURES.map((_, i) => (
                    <button
                      key={i} onClick={() => goToSlide(i)} aria-label={`Go to feature ${i + 1}`}
                      style={{
                        width: currentSlide === i ? 24 : 8, height: 8, borderRadius: 100, border: 'none',
                        background: currentSlide === i ? 'linear-gradient(135deg, #4318FF, #7B5FFF)' : 'rgba(67,24,255,0.15)',
                        cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)', padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ───────── STATS STRIP ───────── */}
      <section style={{ padding: '2rem 1rem 4rem', textAlign: 'center' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'clamp(1.5rem, 4vw, 3.5rem)',
          flexWrap: 'wrap',
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 800,
                color: '#1B2559',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}>
                <span style={{ color: '#4318FF' }}>{s.icon}</span> {s.value}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#718EBF', fontWeight: 600, marginTop: 2 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── HOW IT WORKS ───────── */}
      <section style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(67,24,255,0.08)',
          borderRadius: 100,
          padding: '5px 18px',
          marginBottom: '0.8rem',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: '#4318FF',
        }}>
          How It Works
        </div>
        <h2 style={{
          fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
          fontWeight: 800,
          color: '#1B2559',
          marginBottom: '0.4rem',
        }}>
          Resolve grievances in <span style={{ color: '#4318FF' }}>4 steps</span>
        </h2>
        <p style={{ color: '#718EBF', maxWidth: 550, margin: '0 auto 3rem', fontSize: '1rem' }}>
          A simple, transparent process for students and staff alike
        </p>

        <Row className="g-4 justify-content-center" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {STEPS.map((step, i) => (
            <Col key={i} md={6} lg={3}>
              <div style={{
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(16px)',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.85)',
                boxShadow: '0 4px 24px rgba(67,24,255,0.06)',
                padding: '2rem 1.5rem',
                height: '100%',
                textAlign: 'left',
                position: 'relative',
                transition: 'all 0.3s ease',
              }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(67,24,255,0.14)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(67,24,255,0.06)';
                }}
              >
                <div style={{
                  fontSize: '2.2rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #4318FF, #7B5FFF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '0.8rem',
                  lineHeight: 1,
                }}>
                  {step.num}
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1B2559', marginBottom: '0.6rem' }}>
                  {step.title}
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#718EBF', lineHeight: 1.65, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            </Col>
          ))}
        </Row>
      </section>

      {/* ───────── BUILT FOR EVERY ROLE ───────── */}
      <section style={{ padding: '3rem 1rem 4rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(67,24,255,0.08)',
          borderRadius: 100,
          padding: '5px 18px',
          marginBottom: '0.8rem',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: '#4318FF',
        }}>
          Who Uses StayOps
        </div>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: '#1B2559', marginBottom: '0.3rem' }}>
          Built for <span style={{ color: '#4318FF' }}>every role</span> in your hostel
        </h2>
        <p style={{ color: '#718EBF', maxWidth: 550, margin: '0 auto 3rem' }}>
          Whether it's your hostel warden, maintenance staff, or students — StayOps gives each stakeholder tailored tools and dashboards.
        </p>

        <Row className="g-4 justify-content-center" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {ROLES.map((r, i) => (
            <Col key={i} sm={6} lg={3}>
              <div style={{
                background: 'rgba(255,255,255,0.82)',
                backdropFilter: 'blur(16px)',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.85)',
                boxShadow: '0 4px 20px rgba(67,24,255,0.06)',
                padding: '2rem 1.2rem',
                height: '100%',
                textAlign: 'center',
                transition: 'all 0.3s ease',
              }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(67,24,255,0.14)';
                  e.currentTarget.style.borderColor = `${r.color}30`;
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(67,24,255,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.85)';
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: `${r.color}14`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: r.color,
                }}>
                  {r.icon}
                </div>
                <h5 style={{ fontWeight: 700, color: '#1B2559', marginBottom: '0.5rem', fontSize: '1rem' }}>
                  {r.role}
                </h5>
                <p style={{ fontSize: '0.85rem', color: '#718EBF', lineHeight: 1.6, margin: 0 }}>
                  {r.desc}
                </p>
              </div>
            </Col>
          ))}
        </Row>
      </section>


      {/* ───────── ANALYTICS SHOWCASE ───────── */}
      <section style={{ padding: '3rem 1rem', background: 'linear-gradient(180deg, #ffffff 0%, rgba(237,240,255,0.4) 100%)' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(67,24,255,0.08)',
            borderRadius: 100,
            padding: '5px 18px',
            marginBottom: '0.8rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#4318FF',
          }}>
            Platform Intelligence
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, color: '#1B2559', marginBottom: '0.3rem' }}>
            Interactive <span style={{ color: '#4318FF' }}>Analytics</span>
          </h2>
          <p style={{ color: '#718EBF', maxWidth: 600, margin: '0 auto', fontSize: '1rem' }}>
            Visualize complaint trends, resolution rates, and staff performance with beautiful interactive charts.
          </p>
        </div>

        <Row className="g-4 justify-content-center" style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Trend Chart */}
          <Col lg={8}>
            <div style={{
              background: '#ffffff',
              borderRadius: 24, padding: '2rem',
              border: '1px solid rgba(67,24,255,0.08)',
              boxShadow: '0 12px 40px rgba(67,24,255,0.06)',
            }}>
              <h5 style={{ fontWeight: 700, color: '#1B2559', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={20} color="#4318FF" /> Complaint Trends (6 Months)
              </h5>
              <div style={{ height: 300 }}>
                <Line data={TRENDS_DATA} options={CHART_OPTIONS} />
              </div>
            </div>
          </Col>

          {/* Resolution Doughnut */}
          <Col lg={4} md={6}>
            <div style={{
              background: '#ffffff',
              borderRadius: 24, padding: '2rem',
              border: '1px solid rgba(67,24,255,0.08)',
              boxShadow: '0 12px 40px rgba(67,24,255,0.06)',
              height: '100%',
              display: 'flex', flexDirection: 'column'
            }}>
              <h5 style={{ fontWeight: 700, color: '#1B2559', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={20} color="#10b981" /> Resolution Status
              </h5>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 250 }}>
                <Doughnut data={RESOLUTION_DATA} options={PIE_OPTIONS} />
              </div>
            </div>
          </Col>

          {/* Staff Performance Bar */}
          <Col lg={12}>
            <div style={{
              background: '#ffffff',
              borderRadius: 24, padding: '2rem',
              border: '1px solid rgba(67,24,255,0.08)',
              boxShadow: '0 12px 40px rgba(67,24,255,0.06)',
            }}>
              <h5 style={{ fontWeight: 700, color: '#1B2559', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={20} color="#f59e0b" /> Top Staff Performance
              </h5>
              <div style={{ height: 260 }}>
                <Bar data={STAFF_PERFORMANCE_DATA} options={{ ...CHART_OPTIONS, maintainAspectRatio: false }} />
              </div>
            </div>
          </Col>
        </Row>
      </section>

      {/* ───────── CTA FOOTER ───────── */}
      <section style={{
        background: 'linear-gradient(135deg, #4318FF 0%, #7B5FFF 55%, #A390FF 100%)',
        borderRadius: 24,
        padding: 'clamp(2.5rem, 5vw, 4rem) 2rem',
        textAlign: 'center',
        margin: '1rem 0 3rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-40%', right: '-10%',
          width: 300, height: 300,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-30%', left: '-8%',
          width: 250, height: 250,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        <h2 style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
          fontWeight: 800,
          color: '#FFFFFF',
          marginBottom: '0.8rem',
          position: 'relative',
          zIndex: 1,
        }}>
          Ready to modernize your hostel?
        </h2>
        <p style={{
          fontSize: '1rem',
          color: 'rgba(255,255,255,0.8)',
          maxWidth: 520,
          margin: '0 auto 2rem',
          position: 'relative',
          zIndex: 1,
        }}>
          Join 500+ hostels already using StayOps to resolve grievances faster and smarter.
        </p>
        {!user ? (
          <Link to="/register" style={{
            background: '#FFFFFF',
            color: '#4318FF',
            fontWeight: 700,
            textDecoration: 'none',
            padding: '14px 40px',
            borderRadius: 14,
            fontSize: '1rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            position: 'relative',
            zIndex: 1,
            transition: 'all 0.3s ease',
          }}>
            Start for Free <ArrowRight size={18} />
          </Link>
        ) : (
          <Link to="/dashboard" style={{
            background: '#FFFFFF',
            color: '#4318FF',
            fontWeight: 700,
            textDecoration: 'none',
            padding: '14px 40px',
            borderRadius: 14,
            fontSize: '1rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            position: 'relative',
            zIndex: 1,
            transition: 'all 0.3s ease',
          }}>
            Go to Dashboard <ArrowRight size={18} />
          </Link>
        )}
      </section>
    </div>
  );
};

export default LandingPage;
