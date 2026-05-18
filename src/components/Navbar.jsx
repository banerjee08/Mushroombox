"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Menu, User, Leaf, LogOut, ChevronDown, Package, Settings } from 'lucide-react';
import './Navbar.css';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { getCartCount } = useCart();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const closeTimerRef = useRef(null);

  const handleMouseEnterMenu = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  const handleMouseLeaveMenu = () => {
    closeTimerRef.current = setTimeout(() => setDropdownOpen(false), 200);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleScroll = () => {
      if (dropdownOpen) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await signOut();
    router.push('/');
  };

  const firstName = profile?.full_name
    ? profile.full_name.split(' ')[0]
    : user?.email?.split('@')[0];

  return (
    <header className="navbar">
      <div className="container nav-content">
        <Link href="/" className="nav-logo">
          <Leaf size={24} className="logo-icon" />
          Mushroombox
        </Link>
        
        <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : 'desktop-only'}`}>
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/shop" className="nav-link">Shop</Link>
          <Link href="/subscriptions" className="nav-link">Subscriptions</Link>
          <Link href="/about" className="nav-link">Our Story</Link>
          <Link href="/blog" className="nav-link">Blog</Link>
        </nav>

        <div className="nav-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {profile?.role === 'admin' ? (
                <div className="user-menu-wrapper" ref={userMenuRef} style={{ position: 'relative' }}
                  onMouseEnter={handleMouseEnterMenu}
                  onMouseLeave={handleMouseLeaveMenu}
                >
                  <button
                    className="user-menu-trigger"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '14px' }}
                  >
                    <User size={18} />
                    Admin
                    <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
                  </button>

                  {dropdownOpen && (
                    <div className="user-dropdown" style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      background: 'var(--color-surface)', borderRadius: '10px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)', minWidth: '180px',
                      zIndex: 1100, overflow: 'hidden'
                    }}>
                      <Link href="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', textDecoration: 'none', color: 'var(--color-text-primary)', fontSize: '14px' }}>
                        <Package size={16} /> Dashboard
                      </Link>
                      <Link href="/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', textDecoration: 'none', color: 'var(--color-text-primary)', fontSize: '14px' }}>
                        <Settings size={16} /> Settings
                      </Link>
                      <button className="dropdown-logout" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', width: 'calc(100% - 8px)', background: 'none', border: 'none', cursor: 'pointer', color: '#e53935', fontSize: '14px', borderTop: '1px solid var(--color-border)' }}>
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="user-menu-wrapper" ref={userMenuRef} style={{ position: 'relative' }}
                  onMouseEnter={handleMouseEnterMenu}
                  onMouseLeave={handleMouseLeaveMenu}
                >
                  <button
                    className="user-menu-trigger"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '14px' }}
                  >
                    <User size={18} />
                    Hi, {firstName}
                    <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
                  </button>

                  {dropdownOpen && (
                    <div className="user-dropdown" style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      background: 'var(--color-surface)', borderRadius: '10px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)', minWidth: '160px',
                      zIndex: 1100, overflow: 'hidden'
                    }}>
                      <Link href="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', textDecoration: 'none', color: 'var(--color-text-primary)', fontSize: '14px' }}>
                        <Package size={16} /> Orders
                      </Link>
                      <Link href="/subscriptions" className="dropdown-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', textDecoration: 'none', color: 'var(--color-text-primary)', fontSize: '14px' }}>
                        <Leaf size={16} /> Subscriptions
                      </Link>
                      <Link href="/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', textDecoration: 'none', color: 'var(--color-text-primary)', fontSize: '14px' }}>
                        <Settings size={16} /> Settings
                      </Link>
                      <button className="dropdown-logout" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', width: 'calc(100% - 8px)', background: 'none', border: 'none', cursor: 'pointer', color: '#e53935', fontSize: '14px', borderTop: '1px solid var(--color-border)' }}>
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              )}

              {profile?.role !== 'admin' && (
                <Link href="/cart" className="icon-btn cart-btn" aria-label="Cart">
                  <ShoppingBag size={20} />
                  <span className="cart-badge">{getCartCount()}</span>
                </Link>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth" className="icon-btn" aria-label="User Account">
                <User size={20} />
              </Link>
              <Link href="/cart" className="icon-btn cart-btn" aria-label="Cart">
                <ShoppingBag size={20} />
                <span className="cart-badge">{getCartCount()}</span>
              </Link>
            </>
          )}

          <button className="icon-btn mobile-menu-btn mobile-only" aria-label="Menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}

