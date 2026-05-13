'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { authService } from '@/services';
import { Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authService.login(form.email, form.password);
      login(data);
      showToast(`Welcome back, ${data.name}!`);
      router.push('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid credentials. Please try again.';
      setError(msg);
      showToast(msg, 'error');
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
        display: 'none', // Hide on mobile
        '@media (min-width: 1024px)': { display: 'block' } 
      } as any}>
        <div style={{ 
          position: 'absolute', inset: 0, 
          backgroundImage: "url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div style={{ 
          position: 'absolute', inset: 0, 
          background: 'linear-gradient(to right, rgba(13,13,13,0.1), rgba(13,13,13,0.9))' 
        }} />
        
        {/* Floating Quote or Branding */}
        <div style={{ position: 'absolute', bottom: '10%', left: '10%', maxWidth: '400px' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.3em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>The Collection</p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: '600', color: 'white', lineHeight: '1.2' }}>
            Where <span className="text-gold">Luxury</span> Meets Everyday Elegance.
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
        zIndex: 1
      }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)', borderRadius: '50%', zIndex: -1 }} />

        <div style={{ width: '100%', maxWidth: '400px' }} className="reveal">
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <Link href="/">
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem', fontWeight: '800', letterSpacing: '0.2em' }} className="text-gold">WEARIXA</span>
            </Link>
            <div style={{ width: '40px', height: '2px', background: 'var(--color-accent)', margin: '1rem auto' }} />
          </div>

          <div className="glass" style={{ borderRadius: '20px', padding: '2.5rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: '600', marginBottom: '0.5rem' }}>Welcome Back</h1>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
              Don&apos;t have an account? <Link href="/auth/register" style={{ color: 'var(--color-accent)', fontWeight: '600' }}>Create One</Link>
            </p>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#f87171', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={14} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-accent)' }} />
                  <input 
                    className="input-field" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Enter your email" required 
                    style={{ background: 'none', border: 'none', borderBottom: '1px solid var(--color-border)', borderRadius: '0', padding: '0.75rem 0 0.75rem 2rem', width: '100%' }} autoComplete="email" 
                  />
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Password</label>
                  <Link href="/auth/forgot" style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Forgot?</Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-accent)' }} />
                  <input 
                    className="input-field" type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Enter password" required 
                    style={{ background: 'none', border: 'none', borderBottom: '1px solid var(--color-border)', borderRadius: '0', padding: '0.75rem 2rem 0.75rem 2rem', width: '100%' }} autoComplete="current-password" 
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '1.1rem', fontSize: '0.95rem', fontWeight: '700', marginTop: '1rem', letterSpacing: '0.1em' }}>
                {loading ? 'SIGNING IN...' : 'CONTINUE'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
