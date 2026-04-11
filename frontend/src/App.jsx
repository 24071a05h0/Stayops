import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages to create later
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import WardenDashboard from './pages/WardenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ComplaintTracker from './pages/ComplaintTracker';
import Notifications from './pages/Notifications';
import { AuthContext } from './context/AuthContext';

const AppContent = () => {
  return (
    <div className="d-flex flex-column min-vh-100 position-relative z-1">
      <Navbar />
      <main className="flex-grow-1 container pb-5 position-relative z-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/complaint/:id" element={<ProtectedRoute><ComplaintTracker /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// Router to handle role-based dashboard rendering
const DashboardRouter = () => {
  const { user } = React.useContext(AuthContext);
  if (!user) return null;
  switch (user.role) {
    case 'Student': return <StudentDashboard />;
    case 'Staff': return <StaffDashboard />;
    case 'Warden': return <WardenDashboard />;
    case 'Admin': return <AdminDashboard />;
    default: return <StudentDashboard />;
  }
};

export default App;
