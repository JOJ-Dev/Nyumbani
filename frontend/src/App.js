import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import './styles/GlobalStyles.css';

// Make sure all components are default exports
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import RegisterPage from './pages/RegisterPage';
import PaymentForm from './pages/PaymentForm';
import LandlordDashboard from './pages/LandlordDashboard';
import TenantDashboard from './pages/TenantDashboard';
import ProfilePage from './pages/ProfilePage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Verify these are exported correctly
import PrivateRoute from './utils/PrivateRoute';
import { LandlordRoute, TenantRoute } from './utils/ProtectedRoute';

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <Header />
          <AppContent />
        </AuthProvider>
      </Router>
    </div>
  );
}

function AppContent() {
  const { user, loading, landlord, tenant } = useContext(AuthContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/payment" element={<PaymentForm />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/" element={<HomePage />} />

      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        {/* Role-based redirect */}
        <Route 
          path="/dashboard-redirect" 
          element={
            landlord ? (
              <Navigate to="/landlord-dashboard" replace />
            ) : tenant ? (
              <Navigate to="/tenant-dashboard" replace />
            ) : (
              <Navigate to="/unauthorized" replace />
            )
          } 
        />

        {/* Landlord routes */}
        <Route element={<LandlordRoute />}>
          <Route path="/landlord-dashboard" element={<LandlordDashboard />} />
        </Route>

        {/* Tenant routes */}
        <Route element={<TenantRoute />}>
          <Route path="/tenant-dashboard" element={<TenantDashboard />} />
        </Route>

        {/* Common authenticated routes */}
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function NotFoundPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ marginBottom: '2rem' }}>Page Not Found</h2>
      <p style={{ marginBottom: '2rem' }}>
        The page you're looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/" style={{
        padding: '0.5rem 1rem',
        background: '#007bff',
        color: 'white',
        borderRadius: '4px',
        textDecoration: 'none'
      }}>
        Go to Homepage
      </Link>
    </div>
  );
}

export default App;