'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { Lock, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://wearixa-cryptic-nexus-01.up.railway.app/api';
      const response = await fetch(`${baseUrl}/auth/reset-password/${params.token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to reset password');
      }

      showToast('Password reset successfully! Please login.', 'success');
      router.push('/auth/login');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
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
          backgroundImage: "url('https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1926&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div style={{ 
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(to right, rgba(13,13,13,0.1), rgba(13,13,13,0.9))' 
        }} />
        
        <div style={{ position: 'absolute', bottom: '10%', left: '10%', maxWidth: '400px', zIndex: 2 }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Secure Recovery</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 300, color: '#fff', lineHeight: 1.2, fontFamily: 'var(--font-heading)' }}>
            Reclaim your access.
          </h2>
        </div>
      </div>

      {/* ── Right Side: Reset Form ── */}
      <div style={{ 
        flex: '1', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '3rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(201, 168, 76, 0.1)', marginBottom: '1.5rem' }}>
              <Sparkles size={24} color="var(--color-accent)" />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#fff', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
              Set New Password
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
              Enter your new password below.
            </p>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '2.5rem',
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {error && (
                <div style={{ padding: '0.8rem', background: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center', border: '1px solid rgba(255, 68, 68, 0.2)' }}>
                  {error}
                </div>
              )}

              {/* Password Input */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>
                  New Password
                </label>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '0 1rem',
                  transition: 'border-color 0.3s ease',
                }}>
                  <Lock size={18} color="rgba(255,255,255,0.3)" style={{ marginRight: '10px' }} />
                  <input 
                    type="password"
                    placeholder="Enter new password"
                    required
                    style={{
                      background: 'transparent !important',
                      border: 'none',
                      width: '100%',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none',
                      padding: '0.9rem 0',
                      WebkitBoxShadow: '0 0 0 30px transparent inset !important',
                    }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>
                  Confirm Password
                </label>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '0 1rem',
                  transition: 'border-color 0.3s ease',
                }}>
                  <Lock size={18} color="rgba(255,255,255,0.3)" style={{ marginRight: '10px' }} />
                  <input 
                    type="password"
                    placeholder="Confirm new password"
                    required
                    style={{
                      background: 'transparent !important',
                      border: 'none',
                      width: '100%',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none',
                      padding: '0.9rem 0',
                      WebkitBoxShadow: '0 0 0 30px transparent inset !important',
                    }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? 'transparent' : 'var(--color-accent)',
                  color: loading ? 'var(--color-accent)' : '#000',
                  border: loading ? '1px solid var(--color-accent)' : 'none',
                  padding: '1rem',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  marginTop: '1rem',
                  textTransform: 'uppercase',
                }}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

            </form>
          </div>
        </div>
      </div>
      
      {/* Responsive adjustments */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 900px) {
          .auth-visual-side { display: none !important; }
        }
      `}} />
    </div>
  );
}
