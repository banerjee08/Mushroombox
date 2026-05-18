"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Trash2 } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [customDays, setCustomDays] = useState(7);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfiles();
      fetchSubscriptions();
    }
  }, [user, filter, customDays]);

  const fetchSubscriptions = async () => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans(tier_name)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setSubscriptions(data);
    }
  };

  const togglePause = async (subId, currentStatus) => {
    const action = currentStatus === 'active' ? 'pause' : 'resume';
    const newStatus = action === 'pause' ? 'paused' : 'active';
    const { error } = await supabase.rpc('toggle_subscription', {
      p_subscription_id: subId,
      p_action: action
    });
    
    if (error) {
      alert('Failed to update subscription: ' + error.message);
    } else {
      setSubscriptions(subscriptions.map(s => s.id === subId ? { ...s, status: newStatus } : s));
    }
  };

  const fetchProfiles = async () => {
    setDbLoading(true);
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

    if (filter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.gte('created_at', weekAgo.toISOString());
    } else if (filter === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      query = query.gte('created_at', monthAgo.toISOString());
    } else if (filter === 'custom') {
      const customAgo = new Date();
      customAgo.setDate(customAgo.getDate() - customDays);
      query = query.gte('created_at', customAgo.toISOString());
    }

    const { data, error } = await query;
    if (error) {
      console.error(error);
    } else {
      setProfiles(data || []);
    }
    setDbLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
    
    if (error) {
      alert('Failed to update role: ' + error.message);
    } else {
      setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole } : p));
    }
  };

  const handleDelete = async (userId, email) => {
    if (window.confirm(`Are you sure you want to delete the record for ${email}?`)) {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) {
        alert('Failed to delete: ' + error.message);
      } else {
        setProfiles(profiles.filter(p => p.id !== userId));
      }
    }
  };

  if (loading) return <div className="container" style={{padding:'40px'}}>Loading auth...</div>;
  if (!user) return <div className="container" style={{padding:'40px'}}>Please sign in.</div>;

  return (
    <div className="dashboard-page container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user.email}</p>
        <div style={{marginTop: '10px', padding: '10px', background: '#fff3cd', borderRadius: '4px', fontSize: '0.9rem'}}>
          <strong>Note:</strong> To see all users, your profile <code>role</code> must be set to <code>admin</code> in Supabase.
        </div>
      </div>

      <div className="dashboard-controls" style={{ marginBottom: '40px' }}>
        <h3>My Subscriptions</h3>
        {subscriptions.length === 0 ? (
          <p>You have no subscriptions.</p>
        ) : (
          <div className="subscriptions-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {subscriptions.filter(s => s.status === 'active' || s.status === 'paused').map(sub => (
              <div key={sub.id} style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-primary)' }}>{sub.subscription_plans?.tier_name || 'Subscription'}</h4>
                  <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>Frequency: {sub.frequency || 'Weekly'} | Status: <strong style={{ color: sub.status === 'active' ? '#4CAF50' : '#ff9800' }}>{sub.status.toUpperCase()}</strong></p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a href={`/invoice/subscription/${sub.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>Invoice</a>
                  <button 
                    className={`btn ${sub.status === 'active' ? 'btn-outline' : 'btn-primary'}`}
                    onClick={() => togglePause(sub.id, sub.status)}
                    style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                  >
                    {sub.status === 'active' ? 'Pause' : 'Resume'}
                  </button>
                </div>
              </div>
            ))}
            
            {subscriptions.filter(s => s.status === 'cancelled' || s.status === 'expired').length > 0 && (
              <>
                <h4 style={{ marginTop: '24px', color: 'var(--color-text-light)' }}>Past Subscriptions</h4>
                {subscriptions.filter(s => s.status === 'cancelled' || s.status === 'expired').map(sub => (
                  <div key={sub.id} style={{ border: '1px dashed var(--color-border)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6, background: 'var(--color-bg)' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-text-light)' }}>{sub.subscription_plans?.tier_name || 'Subscription'}</h4>
                      <p style={{ margin: 0, color: 'var(--color-text-light)', fontSize: '0.9rem' }}>Frequency: {sub.frequency || 'Weekly'} | Status: <strong>{sub.status.toUpperCase()}</strong></p>
                    </div>
                    <div>
                      <a href={`/invoice/subscription/${sub.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>Invoice</a>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {profile?.role === 'admin' && (
        <>
          <div className="dashboard-controls">
            <h3>User Registrations</h3>
        <div className="filters">
          <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('all')}>All Time</button>
          <button className={`btn ${filter === 'week' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('week')}>Last 7 Days</button>
          <button className={`btn ${filter === 'month' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('month')}>Last 30 Days</button>
          <button className={`btn ${filter === 'custom' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('custom')}>Custom</button>
          
          {filter === 'custom' && (
            <input 
              type="number" 
              value={customDays} 
              onChange={(e) => setCustomDays(Number(e.target.value))} 
              min="1"
              style={{ width: '60px', marginLeft: '10px', padding: '5px' }}
            />
          )}
        </div>
        <div className="stats">
          Total Found: <strong>{profiles.length}</strong>
        </div>
      </div>

      <div className="dashboard-table-container">
        {dbLoading ? (
          <p>Loading database records...</p>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.length === 0 ? (
                <tr><td colSpan="4" style={{textAlign: 'center'}}>No users found. (Check if you are admin)</td></tr>
              ) : (
                profiles.map(p => (
                  <tr key={p.id}>
                    <td title={p.id}>{String(p.id).substring(0,8)}...</td>
                    <td>{p.email}</td>
                    <td>
                      <select 
                        value={p.role} 
                        onChange={(e) => handleRoleChange(p.id, e.target.value)}
                        className={`role-badge ${p.role}`}
                        style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
                      >
                        <option value="customer" style={{color: '#000'}}>customer</option>
                        <option value="admin" style={{color: '#000'}}>admin</option>
                        <option value="ops" style={{color: '#000'}}>ops</option>
                      </select>
                    </td>
                    <td>{new Date(p.created_at).toLocaleString()}</td>
                    <td>
                      <button 
                        className="icon-btn delete-btn" 
                        onClick={() => handleDelete(p.id, p.email)}
                        style={{ color: '#ff4d4f', background: 'none' }}
                        title="Delete record"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      </>
      )}
    </div>
  );
}
