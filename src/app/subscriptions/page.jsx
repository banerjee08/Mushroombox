"use client";

import { useState } from 'react';
import './Subscriptions.css';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Subscriptions() {
  const [isAnnual, setIsAnnual] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleSubscribe = (tierName) => {
    if (!user) {
      router.push('/auth');
      return;
    }
    // Proceed to a dedicated subscription checkout logic
    router.push(`/subscription-checkout?tier=${encodeURIComponent(tierName)}&annual=${isAnnual}`);
  };

  const tiers = [
    {
      id: 'healthy-living',
      icon: '🌿',
      title: 'Healthy Living',
      audience: 'Singles / Couples',
      qty: '500g / occurrence',
      desc: 'Perfect for adding a healthy boost to daily meals (2-3 solid portions).',
      weeklyPrice: 250,
      monthlyTotal: 1000,
      annualTotal: 9600
    },
    {
      id: 'foodie',
      icon: '🍳',
      title: 'Foodie',
      audience: 'Culinary Explorers',
      qty: '750g / occurrence',
      desc: 'Enough to experiment with bold recipes (risottos, tacos) through the week.',
      weeklyPrice: 375,
      monthlyTotal: 1500,
      annualTotal: 14400,
      featured: true
    },
    {
      id: 'family',
      icon: '🏠',
      title: 'Family',
      audience: 'Family of 4',
      qty: '1 kg / occurrence',
      desc: 'Feeds 4 people for 2-3 dinners per week (curries, stir-fries, soups).',
      weeklyPrice: 500,
      monthlyTotal: 2000,
      annualTotal: 19200
    },
    {
      id: 'gym-freaks',
      icon: '💪',
      title: 'Gym Freaks',
      audience: 'Fitness-focused',
      qty: '1.5 kg / occurrence',
      desc: 'Serious protein. Equates to ~200g a day for post-workout meals/steaks.',
      weeklyPrice: 750,
      monthlyTotal: 3000,
      annualTotal: 28800
    }
  ];

  return (
    <div className="subscriptions-page">
      <div className="container">
        <div className="subscriptions-header">
          <h1>Fresh Mushrooms, On Your Schedule</h1>
          <p>
            Choose a lifestyle tier that fits your needs. 
            Enjoy farm-fresh oyster mushrooms delivered straight to your door with maximum flexibility.
          </p>
        </div>

        <div className="billing-toggle">
          <span className="toggle-label" style={{ opacity: isAnnual ? 0.6 : 1 }} onClick={() => setIsAnnual(false)}>Monthly</span>
          <div 
            className={`toggle-switch ${isAnnual ? 'active' : ''}`}
            onClick={() => setIsAnnual(!isAnnual)}
          ></div>
          <span className="toggle-label" style={{ opacity: !isAnnual ? 0.6 : 1 }} onClick={() => setIsAnnual(true)}>
            Annual <span className="discount-badge">20% OFF</span>
          </span>
        </div>

        <div className="tiers-grid">
          {tiers.map((tier) => (
            <div className={`tier-card ${tier.featured ? 'featured' : ''}`} key={tier.id}>
              {tier.featured && <div className="featured-badge">MOST POPULAR</div>}
              <div className="tier-icon">{tier.icon}</div>
              <h2 className="tier-title">{tier.title}</h2>
              <div className="tier-audience">{tier.audience}</div>
              
              <div className="tier-price-box">
                {isAnnual ? (
                  <>
                    <div className="price-strike">₹{tier.monthlyTotal * 12}</div>
                    <div className="tier-price">₹{tier.annualTotal} <span>/ year</span></div>
                    <p style={{ color: '#4CAF50', fontSize: '0.9rem', marginBottom: '8px' }}>You save ₹{(tier.monthlyTotal * 12) - tier.annualTotal}!</p>
                  </>
                ) : (
                  <div className="tier-price">₹{tier.monthlyTotal} <span>/ month</span></div>
                )}
              </div>

              <div className="tier-qty">Delivery: {tier.qty}</div>
              <p className="tier-desc">{tier.desc}</p>
              
              <button 
                className={`subscribe-btn ${!tier.featured ? 'secondary' : ''}`}
                onClick={() => handleSubscribe(tier.title)}
              >
                Choose {tier.title}
              </button>
            </div>
          ))}
        </div>

        <div className="frequency-section">
          <h2>Unmatched Flexibility</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '30px' }}>
            We understand that your lifestyle changes. That's why our subscriptions put you in control.
          </p>
          <div className="frequency-options">
            <div className="freq-card">
              <h3>Weekly Drops</h3>
              <p>Receive your fresh batch every single week on a designated day.</p>
            </div>
            <div className="freq-card">
              <h3>Monthly Bulk</h3>
              <p>Prefer a single large drop per month? We've got you covered.</p>
            </div>
            <div className="freq-card">
              <h3>Custom Days</h3>
              <p>Pick the exact days you want your deliveries to arrive across the month.</p>
            </div>
            <div className="freq-card">
              <h3>Pause Anytime</h3>
              <p>Going on vacation? Pause your subscription straight from your dashboard with one click.</p>
            </div>
          </div>
        </div>

        <div className="policy-section">
          <h3>Cancellation & Refund Policy</h3>
          <div className="policy-grid">
            <div className="policy-card">
              <h4>Monthly Subscribers</h4>
              <p>Cancel before the first delivery or within 3 days of purchase for a <strong>full refund</strong>. Subsequent cancellations are eligible for a pro-rata refund based on completed deliveries.</p>
            </div>
            <div className="policy-card">
              <h4>Annual Prepay</h4>
              <p>Cancel completely risk-free anytime within the first 14 days of purchase for a <strong>full/pro-rata refund</strong> depending on initial deliveries.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
