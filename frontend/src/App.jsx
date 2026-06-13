import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import { Shield, Database, Lock, KeyRound, ArrowRight, Sparkles } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="page-container animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      textAlign: 'center',
      padding: '4rem 1.5rem'
    }}>
      {/* Sparkle Tag */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.4rem 0.85rem',
        borderRadius: '2rem',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-color)',
        fontSize: '0.75rem',
        fontWeight: 500,
        color: 'var(--text-secondary)',
        marginBottom: '1.75rem',
        letterSpacing: '0.02em'
      }}>
        <Sparkles size={12} style={{ color: 'var(--accent-secondary)' }} />
        Professional Authentication Architecture
      </div>

      {/* Main Title */}
      <h1 style={{
        fontFamily: 'var(--font-title)',
        fontSize: '3rem',
        fontWeight: 800,
        lineHeight: 1.15,
        letterSpacing: '-0.03em',
        maxWidth: '780px',
        marginBottom: '1.25rem'
      }}>
        Secure identity infrastructure <br/>
        <span style={{ 
          background: 'var(--accent-gradient)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>engineered for modern web apps</span>
      </h1>

      {/* Subtitle */}
      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '1rem',
        maxWidth: '560px',
        lineHeight: 1.6,
        marginBottom: '2.25rem'
      }}>
        A production-ready FastAPI & React authentication system implementing raw PyMySQL query routing, role-based access control, and auto-renewing JWT credentials.
      </p>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '4.5rem' }}>
        {isAuthenticated ? (
          <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.65rem 1.75rem' }}>
            Go to Dashboard
            <ArrowRight size={15} />
          </Link>
        ) : (
          <>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.65rem 1.75rem' }}>
              Sign In
              <ArrowRight size={15} />
            </Link>
            <Link to="/register" className="btn btn-secondary" style={{ padding: '0.65rem 1.75rem' }}>
              View Developer Demo
            </Link>
          </>
        )}
      </div>

      {/* Feature Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        width: '100%',
        maxWidth: '960px'
      }}>
        <div className="glass-panel" style={{ padding: '1.75rem', textAlign: 'left', background: 'var(--bg-secondary)' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <Database size={16} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Raw SQL Integration</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', lineHeight: 1.5 }}>
            Bypasses database ORM abstractions to perform raw SQL query operations via PyMySQL, featuring automated local SQLite fallbacks.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.75rem', textAlign: 'left', background: 'var(--bg-secondary)' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <Lock size={16} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>RBAC Framework</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', lineHeight: 1.5 }}>
            Restricts route access based on account attributes, guarding client dashboards and exposing directories to administrators.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '1.75rem', textAlign: 'left', background: 'var(--bg-secondary)' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <KeyRound size={16} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Automated Refresh</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', lineHeight: 1.5 }}>
            Keeps users authenticated by storing credentials in state and using Axios interceptors to auto-refresh tokens in background cycles.
          </p>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
