"use client";
import { useEffect, useState, use } from 'react';
import { supabase } from '../../../../supabaseClient';
import { Leaf } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';

export default function Invoice({ params }) {
  const { type, id } = use(params);
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && type && id) {
      if (type === 'subscription') {
        fetchSubscription();
      } else if (type === 'order') {
        fetchOrder();
      }
    }
  }, [user, type, id]);

  const fetchSubscription = async () => {
    const { data: sub, error } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans(tier_name)')
      .eq('id', id)
      .eq('customer_id', user?.id)
      .single();
    
    if (!error && sub) setData(sub);
    setLoading(false);
  };

  const fetchOrder = async () => {
    const { data: ord, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('customer_id', user?.id)
      .single();
    
    if (!error && ord) setData(ord);
    setLoading(false);
  };

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>Loading invoice...</div>;
  if (!data) return <div style={{padding: '50px', textAlign: 'center'}}>Invoice not found or unauthorized.</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '40px', background: '#fff', color: '#333', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Leaf size={32} color="#2D6B66" />
          <h1 style={{ margin: 0, color: '#2D6B66', fontSize: '24px', fontFamily: 'Playfair Display, serif' }}>Mushroombox</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: 0, color: '#555' }}>INVOICE</h2>
          <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: '#777' }}>
            Date: {new Date(data.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ marginBottom: '10px' }}>Billed To:</h3>
        <p style={{ margin: 0 }}>{user?.email}</p>
        <p style={{ margin: 0 }}>Customer ID: {String(user?.id).substring(0,8)}</p>
      </div>

      <div style={{ border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9f9f9', borderBottom: '1px solid #eee' }}>
            <tr>
              <th style={{ padding: '12px 15px', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '12px 15px', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                {type === 'subscription' 
                  ? `${data.subscription_plans?.tier_name || 'Service'} Subscription (${data.frequency || 'Weekly'})`
                  : `Order #${data.order_number}`
                }
              </td>
              <td style={{ padding: '15px', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                {type === 'subscription' ? 'As per plan selection' : `₹${data.total}`}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '50px', textAlign: 'center' }}>
        <button 
          onClick={() => window.print()} 
          style={{ padding: '10px 20px', background: '#2D6B66', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'inline-block' }}
          className="no-print"
        >
          Download / Print PDF
        </button>
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            .no-print { display: none !important; }
            body { background: white; }
          }
        `}} />
      </div>
    </div>
  );
}
