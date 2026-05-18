"use client";
import { ShoppingBag } from 'lucide-react';
import './ProductCard.css';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function ProductCard({ id, name, price, image, isAvailable }) {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(id);

  return (
    <div className="product-card">
      <Link href={`/product/${id}`} className="product-image-container" style={{display: 'block'}}>
        <img src={image} alt={name} className="product-image" />
        {!isAvailable && <span className="badge out-of-stock">Sold Out</span>}
      </Link>
      <div className="product-info">
        <Link href={`/product/${id}`} style={{textDecoration: 'none', color: 'inherit'}}>
          <h3 className="product-name">{name}</h3>
        </Link>
        <p className="product-price">₹{price}</p>
        
        {quantity > 0 ? (
          <div className="qty-stepper">
            <button className="qty-btn" onClick={() => updateQuantity(id, quantity - 1)}>−</button>
            <span className="qty-count">{quantity}</span>
            <button className="qty-btn" onClick={() => updateQuantity(id, quantity + 1)}>+</button>
          </div>
        ) : (
          <button 
            className={`btn ${isAvailable ? 'btn-primary' : 'btn-secondary'} add-to-cart-btn`} 
            disabled={!isAvailable}
            onClick={() => addToCart({ id, name, price, image, isAvailable }, 1)}
          >
            <ShoppingBag size={18} />
            {isAvailable ? 'Add to Cart' : 'Out of Stock'}
          </button>
        )}
      </div>
    </div>
  );
}
