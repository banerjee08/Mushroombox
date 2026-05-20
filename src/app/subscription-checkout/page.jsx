"use client";
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import '../checkout/Checkout.css';

const isValidPincode = (pin) => /^(11\d{4}|122\d{3}|121\d{3})$/.test(pin);

const tiersData = {
  'Healthy Living': { monthlyTotal: 1000, annualTotal: 9600 },
  'Foodie': { monthlyTotal: 1500, annualTotal: 14400 },
  'Family': { monthlyTotal: 2000, annualTotal: 19200 },
  'Gym Freaks': { monthlyTotal: 3000, annualTotal: 28800 }
};

function SubscriptionCheckoutContent() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const tierName = searchParams.get('tier') || 'Healthy Living';
  const isAnnual = searchParams.get('annual') === 'true';

  const tierInfo = tiersData[tierName] || tiersData['Healthy Living'];
  const totalAmount = isAnnual ? tierInfo.annualTotal : tierInfo.monthlyTotal;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const [paymentState, setPaymentState] = useState('idle'); // idle | processing | success
  
  const [deliveries, setDeliveries] = useState([{
    id: Date.now(),
    name: '',
    phone: '',
    address: '',
    landmark: '',
    deliveryInstructions: '',
    city: 'delhi',
    pincode: ''
  }]);

  const [startDate, setStartDate] = useState('');
  const [deliveryDay, setDeliveryDay] = useState('');

  const calculateEndDate = (startString) => {
    if (!startString) return '';
    const date = new Date(startString);
    if (isNaN(date.getTime())) return '';
    
    if (isAnnual) {
      date.setFullYear(date.getFullYear() + 1);
    } else {
      date.setDate(date.getDate() + 30);
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  useEffect(() => {
    if (profile && deliveries.length === 1 && !deliveries[0].name) {
      setDeliveries([{
        ...deliveries[0],
        name: profile.full_name || '',
        phone: profile.phone || ''
      }]);
    }
  }, [profile]);

  const updateDeliveryField = (index, field, value) => {
    setDeliveries(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addDelivery = () => {
    setDeliveries(prev => [
      ...prev,
      { id: Date.now(), name: '', phone: '', address: '', landmark: '', deliveryInstructions: '', city: 'delhi', pincode: '' }
    ]);
  };

  const removeDelivery = (index) => {
    setDeliveries(prev => prev.filter((_, i) => i !== index));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    for (const d of deliveries) {
      if (!isValidPincode(d.pincode.trim())) {
        alert(`Please enter a valid pincode within Delhi NCR coverage for ${d.name || 'recipient'} (e.g., 1100xx, 122xxx, 121xxx).`);
        return;
      }
    }

    setPaymentState('processing');

    try {
      // 1. Get the Supabase Plan ID and dummy Razorpay Plan ID mapping
      // In a real app, you would store the Razorpay Plan ID in the subscription_plans table
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('id, tier_name')
        .eq('tier_name', tierName)
        .limit(1)
        .single();
      
      if (planError || !planData) {
        throw new Error('Subscription plan not found in database.');
      }

      // ── RAZORPAY INTEGRATION ──
      // Mapping Tier + Interval to Razorpay Plan IDs (User needs to provide these)
      const planIdMapping = {
        'Healthy Living': isAnnual ? 'plan_annual_healthy' : 'plan_monthly_healthy',
        'Foodie': isAnnual ? 'plan_annual_foodie' : 'plan_monthly_foodie',
        'Family': isAnnual ? 'plan_annual_family' : 'plan_monthly_family',
        'Gym Freaks': isAnnual ? 'plan_annual_gym' : 'plan_monthly_gym'
      };

      const razorpayPlanId = planIdMapping[tierName];

      // 2. Create Subscription on backend
      const response = await fetch('/api/razorpay/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: razorpayPlanId,
          totalCount: isAnnual ? 1 : 12,
          customerDetails: {
            name: profile?.full_name || deliveries[0].name,
            email: user.email,
            contact: profile?.phone || deliveries[0].phone
          }
        }),
      });

      const { subscription_id, key_id, error: apiError } = await response.json();

      if (apiError) throw new Error(apiError);

      // 3. Open Razorpay Checkout
      const options = {
        key: key_id,
        subscription_id: subscription_id,
        name: 'Mushroombox',
        description: `${tierName} Subscription`,
        image: '/favicon.svg',
        handler: async function (response) {
          // Success! Now save to Supabase
          try {
            for (const d of deliveries) {
              // Add Address
              const { data: addressData, error: addrError } = await supabase
                .from('customer_addresses')
                .insert({
                  customer_id: user.id,
                  label: `Subscription for ${d.name}`,
                  line1: d.address,
                  line2: d.landmark || null,
                  city: d.city,
                  state: 'Delhi NCR',
                  pincode: d.pincode
                })
                .select('id')
                .single();

              if (addrError) console.error("Address Error:", addrError);

              // Add Subscription Record
              const { error: subError } = await supabase
                .from('subscriptions')
                .insert({
                  customer_id: user.id,
                  plan_id: planData.id,
                  status: 'active',
                  next_delivery_at: startDate ? new Date(startDate).toISOString() : null,
                  frequency: isAnnual ? 'annual' : 'monthly',
                  razorpay_subscription_id: subscription_id,
                  razorpay_plan_id: razorpayPlanId
                });

              if (subError) throw subError;
            }
            setPaymentState('success');
          } catch (err) {
            console.error('Database Error after payment:', err);
            alert('Payment was successful but we failed to update your account. Please contact support. Ref: ' + subscription_id);
          }
        },
        prefill: {
          name: profile?.full_name || deliveries[0].name,
          email: user.email,
          contact: profile?.phone || deliveries[0].phone
        },
        theme: { color: '#2d5a27' },
        modal: {
          ondismiss: function() {
            setPaymentState('idle');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error(error);
      alert('Subscription setup failed: ' + error.message);
      setPaymentState('idle');
    }
  };

  if (loading || !user) {
    return (
      <div className="checkout-page container" style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (paymentState === 'success') {
    return (
      <div className="checkout-page container success-view">
        <CheckCircle size={64} className="success-icon" />
        <h2>Subscription Active!</h2>
        <p>You have successfully subscribed to the <strong>{tierName}</strong> plan ({isAnnual ? 'Annual' : 'Monthly'}).</p>
        <Link href="/blog" className="btn btn-primary mt-8" style={{ marginTop: '30px' }}>Let's plan your meal with mushrooms</Link>
      </div>
    );
  }

  return (
    <div className="checkout-page container relative">
      <h1 className="checkout-title">Subscription Checkout</h1>
      
      <div className="checkout-content">
        <form id="sub-checkout-form" className="checkout-form" onSubmit={handlePayment}>
          {deliveries.map((delivery, index) => (
           <div key={delivery.id} className="form-section">
               <div className="delivery-header">
                 <h3>{deliveries.length > 1 ? `Recipient ${index + 1}` : 'Delivery Details'}</h3>
                 {deliveries.length > 1 && (
                   <button type="button" className="remove-btn-icon" onClick={() => removeDelivery(index)}>
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                   </button>
                 )}
               </div>

               <div className="form-row">
                 <div className="input-group">
                   <label className="input-label">Full Name</label>
                   <input type="text" className="input-field" required value={delivery.name} onChange={e => updateDeliveryField(index, 'name', e.target.value)} placeholder="John Doe" />
                 </div>
                 <div className="input-group">
                   <label className="input-label">Phone Number</label>
                   <input type="tel" className="input-field" required value={delivery.phone} onChange={e => updateDeliveryField(index, 'phone', e.target.value)} placeholder="9876543210" />
                 </div>
               </div>

               <div className="input-group">
                 <label className="input-label">Complete Address</label>
                 <textarea className="input-field" required rows="2" value={delivery.address} onChange={e => updateDeliveryField(index, 'address', e.target.value)} placeholder="Flat No, Building, Street, Area" />
               </div>

               <div className="input-group">
                 <label className="input-label">Nearest Landmark (Optional)</label>
                 <input type="text" className="input-field" value={delivery.landmark} onChange={e => updateDeliveryField(index, 'landmark', e.target.value)} placeholder="e.g. Near Metro Station" />
               </div>
               
               <div className="form-row">
                 <div className="input-group">
                   <label className="input-label">City</label>
                   <select className="input-field" value={delivery.city} onChange={e => updateDeliveryField(index, 'city', e.target.value)} required>
                     <option value="delhi">New Delhi</option>
                     <option value="gurgaon">Gurugram</option>
                     <option value="faridabad">Faridabad</option>
                   </select>
                 </div>
                 <div className="input-group">
                   <label className="input-label">PIN Code (e.g. 110001)</label>
                   <input type="text" className="input-field" required maxLength="6" value={delivery.pincode} onChange={e => updateDeliveryField(index, 'pincode', e.target.value)} placeholder="110001" />
                 </div>
               </div>
           </div>
          ))}

          <div className="form-section">
             <div className="delivery-header">
               <h3>Subscription Preferences</h3>
             </div>
             <div className="form-row">
               <div className="input-group">
                 <label className="input-label">Starting Date</label>
                 <input type="date" className="input-field" required min={new Date().toISOString().split('T')[0]} value={startDate} onChange={e => setStartDate(e.target.value)} />
                 {startDate && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Ending Date: <strong>{calculateEndDate(startDate)}</strong></p>}
               </div>
               <div className="input-group">
                 <label className="input-label">Preferred Delivery Day</label>
                 <select className="input-field" required value={deliveryDay} onChange={e => setDeliveryDay(e.target.value)}>
                   <option value="" disabled hidden>Choose delivery day</option>
                   <option value="Monday">Monday</option>
                   <option value="Wednesday">Wednesday</option>
                   <option value="Friday">Friday</option>
                 </select>
               </div>
             </div>
          </div>

          <div className="add-recipient-wrapper" style={{textAlign: 'center', margin: '20px 0'}}>
             <p style={{color: 'var(--color-primary-dark)', fontSize: '0.95rem', marginBottom: '12px', fontWeight: '500'}}>
               Would you like to subscribe for your loved ones?
             </p>
             <button type="button" className="btn btn-secondary add-recipient-btn" onClick={addDelivery} style={{maxWidth: '300px', margin: '0 auto'}}>
               <svg style={{marginRight: '8px'}} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> 
               Yes, Add Another Recipient
             </button>
          </div>
        </form>

        <div className="checkout-summary">
          <h3>Subscription Review</h3>
          <div className="review-item" style={{ borderBottom: 'none' }}>
            <span>{tierName} Plan {deliveries.length > 1 ? `(x${deliveries.length})` : ''}</span>
            <span>{isAnnual ? 'Annually' : 'Monthly'}</span>
          </div>
          
          <div className="review-total" style={{ borderTop: '1px dashed var(--color-border)', marginTop: '16px', paddingTop: '16px' }}>
            <span>Total Amount</span>
            <span>₹{totalAmount * deliveries.length}</span>
          </div>
          <p className="secure-badge">🔒 Secure payment powered by Razorpay (Mock)</p>

          <button
            type="submit"
            form="sub-checkout-form"
            className="btn btn-primary btn-pay"
            disabled={paymentState === 'processing'}
            style={{width: '100%', marginTop: '24px'}}
          >
            {paymentState === 'processing' ? 'Processing with Razorpay...' : `Start Subscription (₹${totalAmount * deliveries.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionCheckout() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>Loading Checkout...</div>}>
      <SubscriptionCheckoutContent />
    </Suspense>
  );
}
