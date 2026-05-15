'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Package, MapPin, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { orderService } from '@/services';
import { useToast } from '@/context/ToastContext';
import OrderTracking from '@/components/OrderTracking';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const { showToast } = useToast();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !email.trim()) return;

    setLoading(true);
    setOrder(null);
    try {
      const data = await orderService.trackGuestOrder(orderId.trim(), email.trim());
      setOrder(data);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Order not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '800px', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '700' }}>Updates</p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '600' }}>Track Your Order</h1>
        <p style={{ color: 'var(--color-muted)', marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto 0' }}>
          Enter your Order ID and the email address used during checkout to track your package in real-time.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass" 
        style={{ padding: '2rem', borderRadius: '16px', marginBottom: '3rem' }}
      >
        <form onSubmit={handleTrack} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Order ID</label>
            <input 
              type="text" 
              value={orderId} 
              onChange={(e) => setOrderId(e.target.value)} 
              placeholder="e.g. 64b9..." 
              className="input-field" 
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="you@example.com" 
              className="input-field" 
              required 
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ height: '48px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />} Track
          </button>
        </form>
      </motion.div>

      <AnimatePresence>
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <OrderTracking 
              currentStatus={order.status} 
              timeline={order.statusTimeline || []} 
              expectedDelivery={order.expectedDelivery}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div className="glass" style={{ borderRadius: '12px', padding: '1.75rem' }}>
                <h3 style={{ fontSize: '0.78rem', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={14} /> Items
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {order.orderItems.map((item: any) => (
                    <div key={item._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img src={item.image} alt={item.name} style={{ width: '50px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item.name}</h4>
                        <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>Qty: {item.qty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass" style={{ borderRadius: '12px', padding: '1.75rem' }}>
                <h3 style={{ fontSize: '0.78rem', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} /> Shipping
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', lineHeight: '1.8' }}>
                  {order.shippingAddress.address}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                  {order.shippingAddress.country}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          form { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
