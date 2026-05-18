"use client";
import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import { Leaf, Heart, Truck } from 'lucide-react';
import './Home.css';

export default function Home() {
  const featuredProduct = {
    id: '1',
    name: 'Premium Oyster Mushrooms',
    price: 250,
    image: '/images/oyster-mushroom.png',
    isAvailable: true
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-content">
          <div className="hero-text-block">
            <span className="hero-subtitle">Fresh from the farm to Delhi NCR</span>
            <h1 className="hero-title">Nature's Best, <br/> Delivered Fresh.</h1>
            <p className="hero-description">
              Elevate your meals with our premium, organic Oyster mushrooms. Grown with care, packed with nutrients.
            </p>
            <div className="hero-actions">
              <Link href="/shop" className="btn btn-primary btn-large">Shop Now</Link>
              <Link href="/about" className="btn btn-outline btn-large">Our Story</Link>
            </div>
          </div>
          <div className="hero-image-block">
            <img 
              src="/images/hero-mushroom.png" 
              alt="Fresh oyster mushrooms" 
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon"><Leaf size={32} /></div>
              <h3>100% Organic</h3>
              <p>Grown without pesticides, just pure nature and care.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Heart size={32} /></div>
              <h3>Health Forward</h3>
              <p>Rich in vitamins, antioxidants, and pure goodness for your family.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Truck size={32} /></div>
              <h3>Same Day Delivery</h3>
              <p>Harvested in the morning, on your table by evening in NCR.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Product Section */}
      <section className="featured-section">
        <div className="container">
          <h2 className="section-title text-center">Bestseller</h2>
          <div className="featured-product-wrapper">
             <div className="featured-product-card" style={{ maxWidth: '400px', margin: '0 auto' }}>
               <ProductCard {...featuredProduct} />
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
