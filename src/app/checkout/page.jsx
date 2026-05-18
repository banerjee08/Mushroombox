"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, Plus, Trash2, X, ChevronDown } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Checkout.css';

// Strict regex:
// Delhi: starts with 11, exactly 6 digits: ^11\d{4}$
// Gurugram: starts with 122, exactly 6 digits: ^122\d{3}$
// Faridabad: starts with 121, exactly 6 digits: ^121\d{3}$
const isValidPincode = (pin) => /^(11\d{4}|122\d{3}|121\d{3})$/.test(pin);

export default function Checkout() {
  const { user, profile, loading } = useAuth();
  const { cartItems, clearCart, getCartTotal, updateQuantity } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const [paymentState, setPaymentState] = useState('idle'); // idle | processing | success
  const [shippingExpanded, setShippingExpanded] = useState(false);
  const [successOrders, setSuccessOrders] = useState([]);

  // Multi-delivery state
  const [deliveries, setDeliveries] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('checkoutDeliveries');
      if (saved) return JSON.parse(saved);
    }
    return [{
      id: Date.now(),
      name: profile?.full_name || '',
      phone: profile?.phone || '',
      address: '',
      city: 'delhi',
      pincode: '',
      items: {} // { [productId]: quantity }
    }];
  });

  // Save deliveries to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('checkoutDeliveries', JSON.stringify(deliveries));
  }, [deliveries]);

  // Sync zero-items deliveries and handle cart updates
  useEffect(() => {
    if (cartItems.length > 0) {
      setDeliveries(prev => {
        // Remove items from deliveries that are no longer in cart
        const cartItemIds = cartItems.map(i => i.id);
        const newDeliveries = prev.map(delivery => {
            const newItems = { ...delivery.items };
            let modified = false;
            Object.keys(newItems).forEach(productId => {
               if (!cartItemIds.includes(Number(productId))) {
                  delete newItems[productId];
                  modified = true;
               }
            });
            return modified ? { ...delivery, items: newItems } : delivery;
        });

        // Only auto-fill if it's the initial single empty delivery
        if (newDeliveries.length === 1 && Object.keys(newDeliveries[0].items).length === 0) {
           const initialItems = {};
           cartItems.forEach(item => { initialItems[item.id] = item.quantity; });
           return [{ ...newDeliveries[0], items: initialItems }];
        }
        return newDeliveries;
      });
    }
  }, [cartItems]);

  // Lead Generation Popup State
  const [showOutCoveragePopup, setShowOutCoveragePopup] = useState(false);
  const [popupData, setPopupData] = useState({ name: '', phone: '', pincode: '', wants_bulk: false, wants_subscription: false });
  const [popupSubmitted, setPopupSubmitted] = useState(false);
  const [invalidDeliveryIndex, setInvalidDeliveryIndex] = useState(null);

  // Compute unallocated items
  const getUnallocated = (productId) => {
    const totalInCart = cartItems.find(i => i.id === productId)?.quantity || 0;
    const allocated = deliveries.reduce((sum, del) => sum + (del.items[productId] || 0), 0);
    return totalInCart - allocated;
  };

  const handleUpdateDeliveryItem = (deliveryIndex, productId, delta) => {
    const unalloc = getUnallocated(productId);
    
    // If user tries to add an item but unallocated is 0, we gracefully increase the total cart size!
    if (delta > 0 && unalloc < delta) {
        const missingDelta = delta - unalloc;
        const item = cartItems.find(i => i.id === productId);
        if (item) {
            updateQuantity(productId, item.quantity + missingDelta);
        }
    }

    setDeliveries(prev => {
      const newDeliveries = [...prev];
      const delivery = { ...newDeliveries[deliveryIndex] };
      const currentQty = delivery.items[productId] || 0;
      
      const newQty = currentQty + delta;
      
      // Prevent negative
      if (newQty < 0) return prev;

      delivery.items = { ...delivery.items, [productId]: newQty };
      if (newQty === 0) delete delivery.items[productId]; // cleanup
      
      newDeliveries[deliveryIndex] = delivery;
      return newDeliveries;
    });
  };

  const handleRemoveUnallocated = () => {
     cartItems.forEach(item => {
        const assigned = deliveries.reduce((sum, d) => sum + (d.items[item.id] || 0), 0);
        if (item.quantity !== assigned) {
             updateQuantity(item.id, assigned);
        }
     });
  };

  const addDelivery = () => {
    const defaultProduct = cartItems[0];
    const newItems = {};
    if (defaultProduct) {
       newItems[defaultProduct.id] = 1;
       const unalloc = getUnallocated(defaultProduct.id);
       if (unalloc < 1) {
           updateQuantity(defaultProduct.id, defaultProduct.quantity + 1);
       }
    }

    setDeliveries(prev => [
      ...prev,
      { id: Date.now(), name: '', phone: '', address: '', city: 'delhi', pincode: '', items: newItems }
    ]);
  };

  const removeDelivery = (index) => {
    setDeliveries(prev => prev.filter((_, i) => i !== index));
    // also reset errors if removed
    if (invalidDeliveryIndex === index) setInvalidDeliveryIndex(null);
  };
  
  const updateDeliveryField = (index, field, value) => {
    setDeliveries(prev => {
      const newDeliveries = [...prev];
      newDeliveries[index] = { ...newDeliveries[index], [field]: value };
      return newDeliveries;
    });
    // Remove error highlight if they start typing again
    if (invalidDeliveryIndex === index && field === 'pincode') {
       setInvalidDeliveryIndex(null);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    // Validate if any items exist in deliveries
    const hasAnyItems = deliveries.some(d => Object.keys(d.items).length > 0);
    if (!hasAnyItems) {
      alert("Please assign products to at least one delivery address.");
      return;
    }

    // Strict Pincode Validation Loop
    let foundInvalid = false;
    for (let i = 0; i < deliveries.length; i++) {
        const d = deliveries[i];
        if (Object.keys(d.items).length > 0 && !isValidPincode(d.pincode.trim())) {
           setInvalidDeliveryIndex(i);
           setPopupData({
             name: d.name,
             phone: d.phone,
             pincode: d.pincode,
             wants_bulk: false,
             wants_subscription: false
           });
           setShowOutCoveragePopup(true);
           setPopupSubmitted(false);
           foundInvalid = true;
           break;
        }
    }
    
    if (foundInvalid) return;

    setPaymentState('processing');

    // MOCK Payment & Order Generation
    setTimeout(() => {
       const newOrders = deliveries
         .filter(d => Object.keys(d.items).length > 0)
         .map((d, index) => ({
            id: Math.floor(Math.random() * 1_000_000) + index,
            recipient: d.name,
            pincode: d.pincode
         }));
         
       setSuccessOrders(newOrders);
       setPaymentState('success');
       clearCart();
    }, 2000);
  };

  const handlePopupSubmit = async (e) => {
    e.preventDefault();
    try {
      await supabase.from('out_of_coverage_requests').insert([
        {
          name: popupData.name,
          phone: popupData.phone,
          pincode: popupData.pincode,
          wants_bulk: popupData.wants_bulk,
          wants_subscription: popupData.wants_subscription
        }
      ]);
      setPopupSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit request.");
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
        <h2>Payment Successful!</h2>
        <p>Thank you for your order. We are preparing your fresh mushrooms.</p>
        
        <div className="orders-list">
          {successOrders.map(order => (
             <div key={order.id} className="order-success-card">
               <p className="order-id">Order ID: #{order.id}</p>
               <p>Delivery to: <strong>{order.recipient}</strong> ({order.pincode})</p>
             </div>
          ))}
        </div>
        
        <Link href="/" className="btn btn-primary mt-8">Return Home</Link>
      </div>
    );
  }

  // Calculate if there are unallocated items to warn user
  const unallocatedItems = cartItems.filter(item => getUnallocated(item.id) > 0);
  
  // Build a friendly conversational message
  const totalBoxes = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const unallocatedCount = unallocatedItems.reduce((sum, item) => sum + getUnallocated(item.id), 0);
  const assignedCount = totalBoxes - unallocatedCount;

  // New transportation fee logic
  const totalCartValue = cartItems.reduce((total, item) => {
    const assignedQty = deliveries.reduce((sum, d) => sum + (d.items[item.id] || 0), 0);
    return total + (assignedQty * item.price);
  }, 0);
  
  const transportationFee = deliveries.reduce((totalFee, delivery) => {
    const deliveryValue = cartItems.reduce((val, item) => {
       const qtyAssigned = delivery.items[item.id] || 0;
       return val + (qtyAssigned * item.price);
    }, 0);
    if (deliveryValue === 0) return totalFee;
    return deliveryValue >= 500 ? totalFee : totalFee + 50;
  }, 0);
  const grandTotal = totalCartValue + transportationFee;
  const isAnyDeliveryEmpty = deliveries.some(d => Object.values(d.items).reduce((a,b)=>a+b, 0) === 0);

  let helperText = null;
  if (unallocatedCount > 0) {
    if (assignedCount === 0) {
      helperText = <span>You have {unallocatedCount} item{unallocatedCount > 1 ? 's' : ''} in your cart. Please assign {unallocatedCount > 1 ? 'them' : 'it'} for delivery.</span>;
    } else {
      const assigneeNames = deliveries
        .filter(d => Object.values(d.items).reduce((a,b)=>a+b, 0) > 0)
        .map(d => d.name.trim() || 'Someone');
      const namesStr = assigneeNames.join(' and ');
      // Scenario 2 text structure requested by User
      helperText = (
         <span>
            Will you be ordering for someone else?<br /> 
            You thought of adding {totalBoxes} item{totalBoxes > 1 ? 's' : ''}. {namesStr} will be getting {assignedCount} item{assignedCount > 1 ? 's' : ''}, what about the rest? You still have {unallocatedCount} item{unallocatedCount > 1 ? 's' : ''} left. Who'll be getting {unallocatedCount > 1 ? 'those' : 'it'}? 
            <br />
            <button type="button" onClick={handleRemoveUnallocated} className="btn-text-link mt-2" style={{color: 'var(--color-primary-dark)', background: 'none', border: 'none', padding: 0, textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem'}}>
               Actually, I don't need the extra {unallocatedCount > 1 ? 'items' : 'item'}.
            </button>
         </span>
      );
    }
  }

  if (cartItems.length === 0 && paymentState !== 'success') {
    return (
      <div className="checkout-page container" style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <h2>Your cart is empty</h2>
        <p style={{ marginTop: '10px', color: 'var(--color-text-secondary)' }}>Add some fresh mushrooms to proceed to checkout.</p>
        <Link href="/shop" className="btn btn-primary" style={{ marginTop: '20px' }}>Go to Shop</Link>
      </div>
    );
  }

  return (
    <div className="checkout-page container relative">
      <h1 className="checkout-title">Checkout</h1>
      
      {unallocatedCount > 0 && (
         <div className="unallocated-banner">
            <p>{helperText}</p>
         </div>
      )}

      <div className="checkout-content">
        <form className="checkout-form" onSubmit={handlePayment}>
          
          {deliveries.map((delivery, index) => {
             const deliveryItemsTotal = Object.values(delivery.items).reduce((a,b)=>a+b, 0);
             return (
             <div key={delivery.id} className={`form-section ${invalidDeliveryIndex === index ? 'highlight-error' : ''}`}>
               <div className="delivery-header">
                 <h3>{deliveries.length > 1 ? `Recipient ${index + 1}` : 'Delivery Details'}</h3>
                 {deliveries.length > 1 && (
                   <button type="button" className="remove-btn-icon" onClick={() => removeDelivery(index)}>
                     <Trash2 size={18} />
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

               {/* Item Allocation Block */}
               <div className="item-allocator">
                  <h4>Items for this recipient:</h4>
                  {cartItems.map(item => {
                     const qtyAssigned = delivery.items[item.id] || 0;
                     const unalloc = getUnallocated(item.id);
                     return (
                       <div key={item.id} className="allocator-row" style={{ alignItems: 'center' }}>
                         <span className="allocator-name">{item.name}</span>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <div className="quantity-controls small-qty">
                             <button 
                               type="button" 
                               className="qty-btn" 
                               onClick={() => handleUpdateDeliveryItem(index, item.id, -1)} 
                               disabled={deliveries.length === 1 ? qtyAssigned <= 1 : qtyAssigned <= 0}
                             >-</button>
                             <span className="qty-value">{qtyAssigned}</span>
                             <button type="button" className="qty-btn" onClick={() => handleUpdateDeliveryItem(index, item.id, 1)}>+</button>
                           </div>
                           {deliveries.length === 1 && (
                             <button 
                               type="button" 
                               onClick={() => updateQuantity(item.id, 0)}
                               style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: '4px', display: 'flex' }}
                               title="Remove from checkout"
                             >
                               <Trash2 size={16} />
                             </button>
                           )}
                         </div>
                       </div>
                     )
                  })}
               </div>
               
               {/* Scenario 5 dynamic empty cart block */}
               {deliveryItemsTotal === 0 && (
                  <div style={{marginTop: '10px', color: '#c62828', fontSize: '0.9rem', fontWeight: '500', background: 'rgba(198, 40, 40, 0.05)', padding: '8px', borderRadius: '4px'}}>
                    {delivery.name ? `${delivery.name} is` : "This person is"} yet to receive their fresh produce. Please assign them at least one box!
                  </div>
               )}
             </div>
             )
          })}

          <div className="add-recipient-wrapper" style={{textAlign: 'center', margin: '20px 0'}}>
             <p style={{color: 'var(--color-primary-dark)', fontSize: '0.95rem', marginBottom: '12px', fontWeight: '500'}}>
               {totalBoxes <= 1 
                  ? "Would you like to order for someone else?" 
                  : "Would you like to order for someone else or share this purchase with someone you love?"}
             </p>
             <button type="button" className="btn btn-secondary add-recipient-btn" onClick={addDelivery} style={{maxWidth: '300px', margin: '0 auto'}}>
               <Plus size={18} /> Yes, Add Another Recipient
             </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-pay"
            disabled={paymentState === 'processing' || unallocatedItems.length > 0 || isAnyDeliveryEmpty}
            style={{width: '100%', marginTop: 0}}
          >
            {paymentState === 'processing' ? 'Processing with Razorpay...' : `Pay ₹${grandTotal} via Razorpay`}
          </button>
        </form>

        <div className="checkout-summary">
          <h3>Order Review</h3>
          {cartItems.map(item => {
            const assignedQty = deliveries.reduce((sum, d) => sum + (d.items[item.id] || 0), 0);
            if (assignedQty === 0) return null;
            return (
              <div key={item.id} className="review-item">
                <span>{item.name} (x{assignedQty})</span>
                <span>₹{item.price * assignedQty}</span>
              </div>
            );
          })}
          <div className="review-item" style={{color: 'var(--color-text)', fontWeight: '500', marginTop: '10px', flexDirection: 'column', alignItems: 'stretch'}}>
             <div 
               style={{display: 'flex', justifyContent: 'space-between', cursor: deliveries.length > 1 ? 'pointer' : 'default'}} 
               onClick={() => deliveries.length > 1 && setShippingExpanded(!shippingExpanded)}
             >
               <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                 {deliveries.length > 1 && <ChevronDown size={16} style={{ transition: 'transform 0.2s', transform: shippingExpanded ? 'rotate(180deg)' : 'none' }} />}
                 Transportation Fee {deliveries.length > 1 ? `(${deliveries.length} recipients)` : ''}
               </span>
               <span>₹{transportationFee}</span>
             </div>
             {shippingExpanded && deliveries.length > 1 && (
               <div style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                 {deliveries.map((delivery, idx) => {
                    const dValue = cartItems.reduce((val, item) => val + ((delivery.items[item.id] || 0) * item.price), 0);
                    const isFree = dValue >= 500;
                    if (dValue === 0) return null; // Don't list empty ones in receipt breakdown
                    
                    const nameLabel = delivery.name ? delivery.name.trim() : `Recipient ${idx + 1}`;
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{nameLabel}</span>
                        <span>{isFree ? 'Free' : '₹50'}</span>
                      </div>
                    )
                 })}
               </div>
             )}
          </div>
          <div className="review-total">
            <span>Total Amount</span>
            <span>₹{grandTotal}</span>
          </div>
          <p className="secure-badge">🔒 Secure payment powered by Razorpay (Mock)</p>
        </div>
      </div>

      {/* Out of Coverage Popup Overlay */}
      {showOutCoveragePopup && (
         <div className="out-coverage-popup-overlay">
            <div className="popup-card">
               <button className="close-btn" onClick={() => setShowOutCoveragePopup(false)}><X size={20}/></button>
               
               {!popupSubmitted ? (
                 <>
                   <h2 className="popup-title">Outside Delivery Area</h2>
                   <p className="popup-message">
                     We know that you want to buy produce straight from the farm but allow us some time to figure out a way to reach you.
                   </p>
                   <p className="popup-sub">Please leave your details below so we can notify you!</p>
                   
                   <form onSubmit={handlePopupSubmit} className="popup-form">
                      <div className="input-group">
                        <label>Name</label>
                        <input type="text" className="input-field" required value={popupData.name} onChange={e => setPopupData({...popupData, name: e.target.value})} />
                      </div>
                      <div className="form-row">
                        <div className="input-group">
                          <label>Phone</label>
                          <input type="tel" className="input-field" required value={popupData.phone} onChange={e => setPopupData({...popupData, phone: e.target.value})} />
                        </div>
                        <div className="input-group">
                          <label>PIN Code</label>
                          <input type="text" className="input-field" required value={popupData.pincode} onChange={e => setPopupData({...popupData, pincode: e.target.value})} />
                        </div>
                      </div>
                      
                      <div className="checkbox-group mt-3">
                        <label className="checkbox-label" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                           <input type="checkbox" checked={popupData.wants_bulk} onChange={e => setPopupData({...popupData, wants_bulk: e.target.checked})} />
                           Interested in Bulk Order
                        </label>
                        <label className="checkbox-label mt-2" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                           <input type="checkbox" checked={popupData.wants_subscription} onChange={e => setPopupData({...popupData, wants_subscription: e.target.checked})} />
                           Interested in Subscriptions
                        </label>
                      </div>

                      <button type="submit" className="btn btn-primary mt-4 popup-submit-btn" style={{width: '100%'}}>Keep Me Updated</button>
                   </form>
                 </>
               ) : (
                 <div className="popup-success-view">
                   <CheckCircle size={48} className="success-icon mb-2" />
                   <h2>Thank You!</h2>
                   <p>We've recorded your interest and will reach out when we expand to {popupData.pincode}.</p>
                   <button type="button" className="btn btn-secondary mt-4" onClick={() => setShowOutCoveragePopup(false)}>Close</button>
                 </div>
               )}
            </div>
         </div>
      )}
    </div>
  );
}
