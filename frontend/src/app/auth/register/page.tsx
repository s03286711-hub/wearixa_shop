'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { authService } from '@/services';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      const data = await authService.register(form.name, form.email, form.password);
      login(data);
      showToast('Account created successfully! Welcome to Wearixa.');
      router.push('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally { setLoading(false); }
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
          backgroundImage: "url('https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div style={{ 
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(to right, rgba(13,13,13,0.1), rgba(13,13,13,0.9))' 
        }} />
        
        <div style={{ position: 'absolute', bottom: '10%', left: '10%', maxWidth: '400px', zIndex: 2 }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Join the house</p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: '600', color: 'white', lineHeight: '1.2' }}>
            Elevate Your <span className="text-gold">Wardrobe</span> with Wearixa.
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

          <div className="glass" style={{ borderRadius: '20px', padding: '2rem 2.5rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>Create Account</h1>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Already a member? <Link href="/auth/login" style={{ color: 'var(--color-accent)', fontWeight: '600' }}>Sign In</Link>
            </p>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#f87171', fontSize: '0.8rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Full Name</label>
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
                  <User size={16} style={{ color: 'var(--color-accent)', marginRight: '0.75rem', opacity: 0.8, flexShrink: 0 }} />
                  <input 
                    type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Enter your name" required 
                    style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '0.9rem', color: 'white', outline: 'none', padding: '0.75rem 0' }} 
                  />
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Email Address</label>
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
                  <Mail size={16} style={{ color: 'var(--color-accent)', marginRight: '0.75rem', opacity: 0.8, flexShrink: 0 }} />
                  <input 
                    type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Enter your email" required 
                    style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '0.9rem', color: 'white', outline: 'none', padding: '0.75rem 0' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Password</label>
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
                    <Lock size={16} style={{ color: 'var(--color-accent)', marginRight: '0.75rem', opacity: 0.8, flexShrink: 0 }} />
                    <input 
                      type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="••••••" required 
                      style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '0.9rem', color: 'white', outline: 'none', padding: '0.75rem 0' }} 
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Confirm</label>
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
                    <Lock size={16} style={{ color: 'var(--color-accent)', marginRight: '0.75rem', opacity: 0.8, flexShrink: 0 }} />
                    <input 
                      type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                      placeholder="••••••" required 
                      style={{ background: 'transparent', border: 'none', width: '100%', fontSize: '0.9rem', color: 'white', outline: 'none', padding: '0.75rem 0' }} 
                    />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '0.9rem', fontWeight: '700', marginTop: '1.5rem', letterSpacing: '0.1em' }}>
                {loading ? 'CREATING ACCOUNT...' : 'REGISTER NOW'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
