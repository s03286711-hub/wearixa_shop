'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { settingsService } from '@/services';
import { Hammer, ShieldAlert } from 'lucide-react';

export default function MaintenanceWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    let active = true;
    const checkMaintenance = async () => {
      try {
        const data = await settingsService.getSettings();
        if (active && data) {
          setMaintenance(!!data.maintenanceMode);
        }
      } catch (err) {
        console.error('Failed to check maintenance mode status:', err);
      }
    };

    // Only run check if not on admin pages to save requests and allow admins to access settings
    if (!pathname.startsWith('/admin') && !pathname.startsWith('/auth')) {
      checkMaintenance();
      // Periodically poll every 30 seconds for live updates
      const interval = setInterval(checkMaintenance, 30000);
      return () => {
        active = false;
        clearInterval(interval);
      };
    } else {
      setMaintenance(false);
    }
  }, [pathname]);

  // If maintenance is active and user is not an admin, block access with beautiful screen
  if (maintenance && !isAdmin) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'radial-gradient(circle at center, #15151a 0%, #09090b 100%)',
        color: '#fff', fontFamily: "var(--font-heading), 'Playfair Display', serif",
        padding: '2rem', textAlign: 'center', position: 'fixed', inset: 0, zIndex: 99999
      }}>
        {/* Animated Background Gradients */}
        <div style={{
          position: 'absolute', width: '300px', height: '300px',
          background: 'rgba(201,168,76,0.1)', filter: 'blur(100px)',
          top: '20%', left: '20%', borderRadius: '50%', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', width: '350px', height: '350px',
          background: 'rgba(139,92,246,0.08)', filter: 'blur(120px)',
          bottom: '20%', right: '20%', borderRadius: '50%', pointerEvents: 'none'
        }} />

        {/* Elegant Glassmorphic Card */}
        <div className="glass" style={{
          maxWidth: '550px', padding: '3.5rem 2.5rem', borderRadius: '24px',
          background: 'rgba(17,17,21,0.7)', border: '1px solid rgba(201,168,76,0.15)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(16px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
          animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          {/* Main Icon with pulse glow */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(232,201,122,0.05))',
            border: '1px solid rgba(201,168,76,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(201,168,76,0.2)',
            marginBottom: '0.5rem', animation: 'pulseGlow 2.5s infinite alternate'
          }}>
            <Hammer size={36} color="var(--color-accent)" />
          </div>

          <span style={{
            fontFamily: 'monospace', letterSpacing: '0.25em', fontSize: '0.75rem',
            color: 'var(--color-accent)', fontWeight: 'bold', textTransform: 'uppercase'
          }}>
            SYSTEM_OFFLINE
          </span>

          <h1 style={{
            fontSize: '2.2rem', fontWeight: '800', margin: 0,
            background: 'linear-gradient(to right, #ffffff, #e8c97a)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '0.02em', lineHeight: 1.2
          }}>
            Scheduled Maintenance
          </h1>

          <p style={{
            fontSize: '0.92rem', color: 'var(--color-muted)',
            lineHeight: 1.6, margin: 0, padding: '0 10px'
          }}>
            Wearixa is currently undergoing scheduled system optimizations to serve you better. We will be back shortly with a more premium shopping experience.
          </p>

          {/* Details Row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)',
            fontFamily: 'monospace', marginTop: '0.5rem',
            background: 'rgba(255,255,255,0.02)', padding: '8px 16px',
            borderRadius: '20px', border: '1px solid rgba(255,255,255,0.04)'
          }}>
            <ShieldAlert size={12} color="#f59e0b" />
            <span>ESTIMATED DOWNTIME: &lt; 45 MIN</span>
          </div>
        </div>

        {/* CSS Animation Injector */}
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulseGlow {
            from { box-shadow: 0 0 20px rgba(201,168,76,0.15); transform: scale(0.98); }
            to { box-shadow: 0 0 35px rgba(201,168,76,0.35); transform: scale(1.02); }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
