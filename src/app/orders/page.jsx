"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function Orders() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [orderLimit, setOrderLimit] = useState(10);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, orderLimit]);

  const fetchOrders = async () => {
    setDbLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(orderLimit);

    if (error) {
      console.error(error);
    } else {
      setOrders(data || []);
    }
    setDbLoading(false);
  };

  if (loading) return <div className="container" style={{padding:'80px 20px'}}>Loading auth...</div>;
  if (!user) return <div className="container" style={{padding:'80px 20px'}}>Please sign in to view your orders.</div>;

  const activeStatuses = ['pending', 'confirmed', 'packed', 'out_for_delivery'];
  const activeOrders = orders.filter(o => activeStatuses.includes(o.status));
  const pastOrders = orders.filter(o => !activeStatuses.includes(o.status));

  return (
    <div className="container" style={{ padding: '40px 20px', minHeight: '60vh' }}>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>My Orders</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>Track your active deliveries and order history.</p>

      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label style={{ fontWeight: 500 }}>Show:</label>
        <select 
          className="input-field" 
          value={orderLimit} 
          onChange={(e) => setOrderLimit(Number(e.target.value))}
          style={{ width: '100px', cursor: 'pointer' }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        <span style={{ color: 'var(--color-text-light)' }}> recent orders</span>
      </div>

      {dbLoading ? (
        <p>Loading your orders...</p>
      ) : orders.length === 0 ? (
        <p>You have no orders yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {activeOrders.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '16px', color: 'var(--color-primary)' }}>Active Orders</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeOrders.map(order => (
                  <div key={order.id} style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface)' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-primary)' }}>Order #{order.order_number}</h4>
                      <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                        Placed: {new Date(order.created_at).toLocaleDateString()} | 
                        Total: <strong>₹{order.total}</strong> | 
                        Status: <strong style={{ color: '#4CAF50' }}>{order.status.toUpperCase()}</strong>
                      </p>
                    </div>
                    <div>
                      <a href={`/invoice/order/${order.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>Invoice</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastOrders.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '16px', color: 'var(--color-text-light)' }}>Past Orders</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pastOrders.map(order => (
                  <div key={order.id} style={{ border: '1px dashed var(--color-border)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6, background: 'var(--color-bg)' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-text-light)' }}>Order #{order.order_number}</h4>
                      <p style={{ margin: 0, color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                        Placed: {new Date(order.created_at).toLocaleDateString()} | 
                        Total: <strong>₹{order.total}</strong> | 
                        Status: <strong>{order.status.toUpperCase()}</strong>
                      </p>
                    </div>
                    <div>
                      <a href={`/invoice/order/${order.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>Invoice</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
