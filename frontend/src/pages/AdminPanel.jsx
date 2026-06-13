import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Users, Shield, UserCheck, UserX, Trash2, ShieldAlert, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const AdminPanel = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionUserId, setActionUserId] = useState(null); // Tracking which user is undergoing updates

  const fetchUsers = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await axiosInstance.get('/users/list');
      setUsers(response.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to fetch users list');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (user) => {
    if (user.id === currentUser.id) {
      setErrorMsg("You cannot deactivate your own administrator account");
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setActionUserId(user.id);

    try {
      const updatedUser = await axiosInstance.put(`/users/update/${user.id}`, {
        is_active: !user.is_active
      });
      
      setUsers(users.map(u => u.id === user.id ? updatedUser.data : u));
      setSuccessMsg(`Status for user "${user.username}" updated successfully`);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || `Failed to update status for ${user.username}`);
    } finally {
      setActionUserId(null);
    }
  };

  const handleToggleRole = async (user) => {
    if (user.id === currentUser.id) {
      setErrorMsg("You cannot demote yourself from administrator role");
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setActionUserId(user.id);

    const newRole = user.role === 'admin' ? 'user' : 'admin';

    try {
      const updatedUser = await axiosInstance.put(`/users/update/${user.id}`, {
        role: newRole
      });
      
      setUsers(users.map(u => u.id === user.id ? updatedUser.data : u));
      setSuccessMsg(`Role of user "${user.username}" updated to ${newRole}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || `Failed to change role for ${user.username}`);
    } finally {
      setActionUserId(null);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.id === currentUser.id) {
      setErrorMsg("You cannot delete your own administrator account");
      return;
    }

    if (!window.confirm(`Are you absolutely sure you want to delete user "${user.username}"? This action is permanent.`)) {
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setActionUserId(user.id);

    try {
      await axiosInstance.delete(`/users/delete/${user.id}`);
      setUsers(users.filter(u => u.id !== user.id));
      setSuccessMsg(`User "${user.username}" deleted successfully`);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || `Failed to delete user ${user.username}`);
    } finally {
      setActionUserId(null);
    }
  };

  // Metrics
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const activeCount = users.filter(u => u.is_active).length;
  const regularCount = totalUsers - adminCount;

  return (
    <div className="page-container animate-fade-in">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, marginBottom: '0.4rem', fontFamily: 'var(--font-title)' }}>
            User Directory
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage permission attributes, toggle user activation states, and view system analytics.
          </p>
        </div>
        <button 
          onClick={fetchUsers} 
          className="btn btn-secondary" 
          style={{ padding: '0.5rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}
          disabled={isLoading}
        >
          <RefreshCw size={14} className={isLoading ? 'spinner' : ''} />
          Refresh
        </button>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
            <Users size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 500 }}>Total Users</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.1 }}>{isLoading ? '...' : totalUsers}</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--accent-secondary)' }}>
            <Shield size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 500 }}>Admins</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.1 }}>{isLoading ? '...' : adminCount}</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
            <UserCheck size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 500 }}>Active</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.1 }}>{isLoading ? '...' : activeCount}</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
            <Users size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 500 }}>Standard</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.1 }}>{isLoading ? '...' : regularCount}</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-error" id="admin_error_alert">
          <AlertTriangle size={15} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success" id="admin_success_alert">
          <CheckCircle size={15} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Users List Table Container */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
          <div className="spinner" style={{ width: '2rem', height: '2rem', color: 'var(--accent-primary)' }}></div>
        </div>
      ) : users.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          No registered users located in directory.
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>ID</th>
                <th>Identity</th>
                <th>Email Address</th>
                <th>System Role</th>
                <th>Account Status</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr 
                  key={user.id} 
                  style={{
                    opacity: actionUserId === user.id ? 0.6 : 1,
                  }}
                >
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600 }}>#{user.id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.username}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td>
                    <button
                      id={`toggle_role_${user.id}`}
                      onClick={() => handleToggleRole(user)}
                      disabled={user.id === currentUser.id || actionUserId !== null}
                      className="btn"
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: user.role === 'admin' ? 'rgba(79, 70, 229, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        color: user.role === 'admin' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        border: '1px solid ' + (user.role === 'admin' ? 'rgba(79, 70, 229, 0.15)' : 'var(--border-color)'),
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                        cursor: (user.id === currentUser.id) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {user.role}
                    </button>
                  </td>
                  <td>
                    <button
                      id={`toggle_active_${user.id}`}
                      onClick={() => handleToggleActive(user)}
                      disabled={user.id === currentUser.id || actionUserId !== null}
                      className="btn"
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: user.is_active ? 'var(--success-bg)' : 'var(--error-bg)',
                        color: user.is_active ? 'var(--success)' : 'var(--error)',
                        border: '1px solid ' + (user.is_active ? 'var(--success-border)' : 'var(--error-border)'),
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                        cursor: (user.id === currentUser.id) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {user.is_active ? (
                        <>
                          <UserCheck size={11} />
                          Active
                        </>
                      ) : (
                        <>
                          <UserX size={11} />
                          Deactive
                        </>
                      )}
                    </button>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      id={`delete_user_${user.id}`}
                      onClick={() => handleDeleteUser(user)}
                      disabled={user.id === currentUser.id || actionUserId !== null}
                      className="btn btn-danger"
                      style={{
                        padding: '0.35rem',
                        borderRadius: 'var(--radius-sm)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title={user.id === currentUser.id ? "Cannot delete self" : "Delete User"}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
