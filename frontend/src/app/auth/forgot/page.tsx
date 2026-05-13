'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send reset email');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0d0d0d', overflow: 'hidden' }}>
      
      {/* ── Left Side: Immersive Visuals ── */}
      <div style={{ 
        flex: '1.2', 
        position: 'relative', 
        display: 'flex',
        background: '#0d0d0d',
      }} className="auth-visual-side">
        <div style={{ 
          position: 'absolute', inset: 0, 
          backgroundImage: "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div style={{ 
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(to right, rgba(13,13,13,0.1), rgba(13,13,13,0.9))' 
        }} />
        
        <div style={{ position: 'absolute', bottom: '10%', left: '10%', maxWidth: '400px', zIndex: 2 }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Account Recovery</p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: '600', color: 'white', lineHeight: '1.2' }}>
            Don't Worry, We'll Get You <span className="text-gold">Back</span> In.
          </h2>
        </div>
      </div>

      {/* ── Right Side: Form ── */}
      <div style={{ 
        flex: '1', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '2rem',
        position: 'relative',
        zIndex: 5,
        background: '#0d0d0d',
      }}>
        <div style={{ position: 'absolute', bottom: '20%', right: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)', borderRadius: '50%', zIndex: -1 }} />

        <div style={{ width: '100%', maxWidth: '400px' }} className="reveal">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <Link href="/">
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem', fontWeight: '800', letterSpacing: '0.2em' }} className="text-gold">WEARIXA</span>
            </Link>
            <div style={{ width: '40px', height: '2px', background: 'var(--color-accent)', margin: '1rem auto' }} />
          </div>

          <div className="glass" style={{ borderRadius: '20px', padding: '2.5rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>Forgot Password?</h1>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
              Enter your email and we'll send you a link to reset your password.
            </p>

            {success ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' 
                }}>
                  <Send size={24} style={{ color: '#4ade80' }} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Reset Link Sent!</h3>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                  Please check your inbox at <strong>{email}</strong> for instructions.
                </p>
                <Link href="/auth/login" className="btn-primary" style={{ display: 'block', padding: '1rem', textAlign: 'center' }}>
                  BACK TO SIGN IN
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.8rem' }}>
                    {error}
                  </div>
                )}

                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Email Address</label>
                  <div style={{ 
                    position: 'relative', 
                    display: 'flex', 
                    alignItems: 'center', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '0 1rem',
                    transition: 'all 0.3s ease'
                  }}>
                    <Mail size={18} style={{ color: 'var(--color-accent)', marginRight: '0.75rem', opacity: 0.8 }} />
                    <input 
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="Enter your email" required 
                      style={{ background: 'transparent', border: 'none', width: '100%', color: 'white', fontSize: '0.9rem', outline: 'none', padding: '0.9rem 0', WebkitBoxShadow: '0 0 0 1000px rgba(13,13,13,0) inset', WebkitTextFillColor: 'white' }} autoComplete="email" 
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '0.9rem', fontWeight: '700', marginTop: '0.5rem', letterSpacing: '0.1em' }}>
                  {loading ? 'SENDING LINK...' : 'SEND RESET LINK'}
                </button>

                <Link href="/auth/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  <ArrowLeft size={14} /> Back to Login
                </Link>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
