"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ChevronLeft } from 'lucide-react';
import './Cart.css';
import { useCart } from '../../context/CartContext';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const subtotal = getCartTotal();
  const router = useRouter();

  return (
    <div className="cart-page container">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <button className="back-btn" onClick={() => router.push('/shop')} style={{ marginBottom: 0, marginRight: '20px' }}>
          <ChevronLeft size={20} /> Back
        </button>
        <h1 className="cart-title" style={{ marginBottom: 0 }}>Your Cart</h1>
      </div>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty.</p>
          <Link href="/shop" className="btn btn-primary mt-4">Continue Shopping</Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <Link href={`/product/${item.id}`}>
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                </Link>
                <div className="cart-item-details">
                  <Link href={`/product/${item.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                    <h3>{item.name}</h3>
                  </Link>
                  <p className="cart-item-price">₹{item.price}</p>
                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                      <Trash2 size={18} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span className="text-free" style={{fontSize: '0.9rem', color: 'var(--color-primary-dark)'}}>Calculated at checkout</span>
            </div>
            <div className="summary-total">
              <span>Estimated Total</span>
              <span>₹{subtotal}</span>
            </div>
            
            <Link href="/checkout" className="btn btn-primary btn-checkout">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
