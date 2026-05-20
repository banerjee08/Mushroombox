"use client";
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import './Auth.css';

export default function Auth() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // which secondary method is expanded: null | 'email' | 'phone'
  const [expanded, setExpanded] = useState(null);

  // Email auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // Phone auth state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [authLoading, setAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      const redirect = searchParams.get('redirect');
      if (redirect === 'checkout') {
        router.push('/cart');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router, searchParams]);

  const resetMessages = () => { setErrorMsg(''); setSuccessMsg(''); };

  const toggleExpanded = (method) => {
    setExpanded(prev => prev === method ? null : method);
    resetMessages();
    setOtpSent(false);
  };

  // ── Google ───────────────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`
        }
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg('Google sign-in failed. Please check your Supabase configuration.');
    }
  };

  // ── Email / Password ─────────────────────────────────────────────────────────
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    resetMessages();
    setAuthLoading(true);

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      if (signUpError) {
        if (signUpError.message.includes('User already registered') || signUpError.message.includes('already exists')) {
          setErrorMsg('This email is already registered. Please Sign In instead.');
          setIsSignUp(false);
        } else {
          setErrorMsg(signUpError.message);
        }
      } else {
        setSuccessMsg('Account created! Check your email for a confirmation link.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMsg("Account not found or incorrect password. Don't have an account? Click \"Sign up\" below!");
        } else {
          setErrorMsg(error.message);
        }
      }
    }
    setAuthLoading(false);
  };

  // ── Phone / OTP ──────────────────────────────────────────────────────────────
  const formatPhone = (raw) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length === 12) return '+' + digits;
    if (digits.length === 10) return '+91' + digits;
    return '+' + digits;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    resetMessages();
    setAuthLoading(true);
    const formattedPhone = formatPhone(phone);
    const { error } = await supabase.auth.signInWithOtp({ 
      phone: formattedPhone,
      options: {
        shouldCreateUser: true,
        channel: 'sms'
      }
    });
    if (error) {
      setErrorMsg(error.message);
    } else {
      setOtpSent(true);
      setSuccessMsg(`OTP sent to ${formattedPhone}. Please check your SMS.`);
    }
    setAuthLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    resetMessages();
    setAuthLoading(true);
    const formattedPhone = formatPhone(phone);
    const { error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: 'sms',
    });
    if (error) {
      setErrorMsg(error.message);
    }
    setAuthLoading(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="auth-page container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome to Mushroombox 🍄</h1>
        <p className="auth-subtitle">Fresh Oyster Mushrooms, delivered to your door.</p>

        {/* Error / Success messages */}
        {errorMsg && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid #ef9a9a' }}>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid #a5d6a7' }}>
            {successMsg}
          </div>
        )}

        {/* ── PRIMARY: Google Sign-In ── */}
        <button className="btn google-btn google-btn-primary" onClick={handleGoogleLogin}>
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="22" height="22" />
          Continue with Google
        </button>

        <div className="divider"><span>or use another method</span></div>

        {/* ── SECONDARY: Email / Password ── */}
        <div className="auth-accordion">
          <button
            className="auth-accordion-header"
            onClick={() => toggleExpanded('email')}
          >
            <span>📧 {expanded === 'email' ? '▲' : '▼'} Email & Password</span>
          </button>
          {expanded === 'email' && (
            <div className="auth-accordion-body">
              <form className="auth-form" onSubmit={handleEmailAuth}>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); resetMessages(); }}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Password</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); resetMessages(); }}
                    required
                  />
                </div>
                <button className="btn btn-primary login-btn" disabled={authLoading}>
                  {authLoading ? 'Authenticating...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </button>
              </form>
              <p className="auth-footer">
                {isSignUp ? (
                  <>Already have an account? <Link href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(false); resetMessages(); }}>Sign in</Link></>
                ) : (
                  <>Don't have an account? <Link href="#" onClick={(e) => { e.preventDefault(); setIsSignUp(true); resetMessages(); }}>Sign up</Link></>
                )}
              </p>
            </div>
          )}
        </div>

        {/* ── SECONDARY: Phone OTP ── */}
        <div className="auth-accordion">
          <button
            className="auth-accordion-header"
            onClick={() => toggleExpanded('phone')}
          >
            <span>📱 {expanded === 'phone' ? '▲' : '▼'} Sign in with Phone OTP</span>
          </button>
          {expanded === 'phone' && (
            <div className="auth-accordion-body">
              {!otpSent ? (
                <form className="auth-form" onSubmit={handleSendOtp}>
                  <div className="input-group">
                    <label className="input-label">Mobile Number</label>
                    <input
                      type="tel"
                      className="input-field"
                      placeholder="9876543210 or +919876543210"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); resetMessages(); }}
                      required
                    />
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      India numbers: enter 10 digits, country code (+91) is added automatically.
                    </p>
                  </div>
                  <button className="btn btn-primary login-btn" disabled={authLoading}>
                    {authLoading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form className="auth-form" onSubmit={handleVerifyOtp}>
                  <div className="input-group">
                    <label className="input-label">Enter OTP</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="6-digit code"
                      value={otp}
                      maxLength={6}
                      onChange={(e) => { setOtp(e.target.value); resetMessages(); }}
                      required
                      autoFocus
                    />
                  </div>
                  <button className="btn btn-primary login-btn" disabled={authLoading}>
                    {authLoading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '14px', marginTop: '8px' }}
                    onClick={() => { setOtpSent(false); setOtp(''); resetMessages(); }}
                  >
                    ← Change number
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
