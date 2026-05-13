'use client';
import { CheckCircle, Clock, Package, Truck, ShieldCheck, MapPin } from 'lucide-react';

interface TimelineStep {
  status: string;
  timestamp: string;
  message: string;
}

interface OrderTrackingProps {
  currentStatus: string;
  timeline: TimelineStep[];
  expectedDelivery?: string;
}

const STEPS = [
  { id: 'Processing', label: 'Order Placed', icon: Clock },
  { id: 'Packing', label: 'Packing', icon: Package },
  { id: 'Shipped', label: 'On the Way', icon: Truck },
  { id: 'Delivered', label: 'Delivered', icon: CheckCircle },
];

export default function OrderTracking({ currentStatus, timeline, expectedDelivery }: OrderTrackingProps) {
  // Normalize status for matching
  const normalizedStatus = currentStatus ? currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1).toLowerCase() : 'Processing';
  
  const currentIdx = STEPS.findIndex(s => s.id.toLowerCase() === normalizedStatus.toLowerCase());
  const displayIdx = currentIdx === -1 ? 0 : currentIdx; // Fallback to 0 if not found
  
  const isCancelled = normalizedStatus === 'Cancelled';

  return (
    <div className="glass reveal" style={{ borderRadius: '16px', padding: '2rem', marginBottom: '2.5rem', border: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: '600' }}>Track Order</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Real-time status of your package</p>
        </div>
        {expectedDelivery && !isCancelled && normalizedStatus !== 'Delivered' && (
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>Expected Delivery</p>
            <p style={{ fontSize: '1.25rem', fontWeight: '700' }}>{new Date(expectedDelivery).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        )}
      </div>

      {isCancelled ? (
        <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(239,68,68,0.05)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
          <p style={{ color: '#f87171', fontWeight: '600' }}>This order has been cancelled.</p>
        </div>
      ) : (
        <div style={{ position: 'relative', padding: '0 1rem' }}>
          {/* Progress Line */}
          <div style={{ 
            position: 'absolute', top: '24px', left: '1.5rem', right: '1.5rem', height: '2px', 
            background: 'var(--color-border)', zIndex: 0 
          }} />
          <div style={{ 
            position: 'absolute', top: '24px', left: '1.5rem', 
            width: `${(displayIdx / (STEPS.length - 1)) * 100}%`, 
            height: '2px', background: 'var(--color-accent)', 
            transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 0 
          }} />

          {/* Steps */}
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
            {STEPS.map((step, idx) => {
              const isCompleted = idx <= displayIdx;
              const isCurrent = idx === displayIdx;
              const Icon = step.icon;
              const timeData = timeline.find(t => t.status.toLowerCase() === step.id.toLowerCase());

              return (
                <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '80px' }}>
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '50%', 
                    background: isCompleted ? 'var(--color-accent)' : 'var(--color-surface-2)', 
                    color: isCompleted ? '#0d0d0d' : 'var(--color-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isCurrent ? '0 0 20px rgba(201,168,76,0.4)' : 'none',
                    border: isCurrent ? '3px solid white' : 'none',
                    transition: 'all 0.5s ease'
                  }}>
                    <Icon size={20} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: isCompleted ? '600' : '400', color: isCompleted ? 'var(--color-text)' : 'var(--color-muted)' }}>{step.label}</p>
                    {timeData && (
                      <p style={{ fontSize: '0.6rem', color: 'var(--color-muted)', marginTop: '4px' }}>
                        {new Date(timeData.timestamp).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Timeline List */}
      {timeline && timeline.length > 0 && (
        <div style={{ marginTop: '3.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-accent)' }}>Live Updates</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[...timeline].reverse().map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: idx === 0 ? 'var(--color-accent)' : 'var(--color-border)', marginTop: '6px' }} />
                  {idx !== timeline.length - 1 && <div style={{ width: '1px', flex: 1, background: 'var(--color-border)', margin: '4px 0' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', color: idx === 0 ? 'var(--color-text)' : 'var(--color-muted)' }}>{item.status}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', margin: '4px 0', lineHeight: '1.4' }}>{item.message}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', opacity: 0.7 }}>{new Date(item.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
