import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, LayoutDashboard, User, Users } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      backgroundColor: 'rgba(9, 9, 11, 0.75)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={20} style={{ color: 'var(--accent-primary)' }} />
          <Link to="/" style={{
            textDecoration: 'none',
            fontFamily: 'var(--font-title)',
            fontWeight: 700,
            fontSize: '1.2rem',
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center'
          }}>
            Identity<span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>Pro</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: isActive('/dashboard') ? 'var(--text-primary)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'var(--transition-fast)'
              }}>
                <LayoutDashboard size={15} />
                Dashboard
              </Link>

              {user?.role === 'admin' && (
                <Link to="/admin" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: isActive('/admin') ? 'var(--text-primary)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  transition: 'var(--transition-fast)'
                }}>
                  <Users size={15} />
                  Admin Panel
                </Link>
              )}

              <div style={{
                height: '14px',
                width: '1px',
                backgroundColor: 'var(--border-color)'
              }} />

              {/* User Avatar & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <User size={13} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>{user?.username}</span>
                  <span style={{
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: user?.role === 'admin' ? 'var(--accent-secondary)' : 'var(--text-muted)',
                    letterSpacing: '0.02em'
                  }}>
                    {user?.role}
                  </span>
                </div>
              </div>

              <button onClick={handleLogout} className="btn btn-secondary" style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <LogOut size={12} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{
                color: isActive('/login') ? 'var(--text-primary)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'var(--transition-fast)'
              }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
              }}>
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
