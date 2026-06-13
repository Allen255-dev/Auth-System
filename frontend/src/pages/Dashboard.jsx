import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, ShieldCheck, KeyRound, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { user, updateProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const updateData = {};

    if (email.trim() !== user.email) {
      updateData.email = email.trim();
    }

    if (password) {
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match');
        return;
      }
      updateData.password = password;
    }

    if (Object.keys(updateData).length === 0) {
      setErrorMsg('No changes detected to update');
      return;
    }

    setIsUpdating(true);

    try {
      await updateProfile(user.id, updateData);
      setSuccessMsg('Profile updated successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (!user) return null;

  return (
    <div className="page-container animate-fade-in">
      {/* Title block */}
      <div style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 700, marginBottom: '0.4rem', fontFamily: 'var(--font-title)' }}>
          Profile Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Configure your user preferences, profile email, and sign-in credentials.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* Profile Card */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-title)' }}>
            <User size={18} style={{ color: 'var(--accent-primary)' }} />
            Account Overview
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '0.85rem 1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <User size={16} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Username</span>
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.username}</span>
            </div>

            <div className="glass-card" style={{ padding: '0.85rem 1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail size={16} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email Address</span>
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.email}</span>
            </div>

            <div className="glass-card" style={{ padding: '0.85rem 1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {user.role === 'admin' ? <ShieldCheck size={16} style={{ color: 'var(--accent-secondary)' }} /> : <Shield size={16} style={{ color: 'var(--text-secondary)' }} />}
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Account Privilege</span>
              </div>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                textTransform: 'uppercase',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: user.role === 'admin' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                color: user.role === 'admin' ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                border: '1px solid ' + (user.role === 'admin' ? 'rgba(6, 182, 212, 0.15)' : 'var(--border-color)')
              }}>
                {user.role}
              </span>
            </div>

            <div className="glass-card" style={{ padding: '0.85rem 1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Registered On</span>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{formatDate(user.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Profile Settings Editor */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-title)' }}>
            <KeyRound size={18} style={{ color: 'var(--accent-primary)' }} />
            Update Credentials
          </h2>

          {errorMsg && (
            <div className="alert alert-error" id="dashboard_error_alert">
              <AlertTriangle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success" id="dashboard_success_alert">
              <CheckCircle size={15} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label className="form-label" htmlFor="edit_email">Email Address</label>
              <div className="input-container">
                <input
                  type="email"
                  id="edit_email"
                  className="form-input"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isUpdating}
                  required
                />
                <Mail className="input-icon" size={16} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit_password">New Password</label>
              <div className="input-container">
                <input
                  type="password"
                  id="edit_password"
                  className="form-input"
                  placeholder="Leave blank to keep current"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isUpdating}
                />
                <KeyRound className="input-icon" size={16} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label" htmlFor="edit_confirm_password">Confirm New Password</label>
              <div className="input-container">
                <input
                  type="password"
                  id="edit_confirm_password"
                  className="form-input"
                  placeholder="Verify new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isUpdating}
                />
                <KeyRound className="input-icon" size={16} />
              </div>
            </div>

            <button
              type="submit"
              id="edit_submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.65rem' }}
              disabled={isUpdating}
            >
              {isUpdating ? <span className="spinner"></span> : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
