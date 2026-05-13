'use client';
import { useEffect, useState } from 'react';
import { orderService } from '@/services';
import LoadingSpinner from '@/components/LoadingSpinner';
import { CheckCircle, Truck, Package, Clock, ShieldCheck, XCircle } from 'lucide-react';

const STATUS_OPTIONS = ['Processing', 'Packing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    orderService.getAllOrders().then(setOrders).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await orderService.updateStatus(id, newStatus);
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeliveryUpdate = async (id: string, date: string) => {
    try {
      const order = orders.find(o => o._id === id);
      await orderService.updateStatus(id, order.status, date);
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const markPaid = async (id: string) => {
    await orderService.updateToPaid(id, { id: 'manual', status: 'COMPLETED', update_time: new Date().toISOString() });
    fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processing': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)', icon: <Clock size={12} /> };
      case 'Packing': return { bg: 'rgba(167, 139, 250, 0.1)', text: '#a78bfa', border: 'rgba(167, 139, 250, 0.3)', icon: <Package size={12} /> };
      case 'Shipped': return { bg: 'rgba(251, 191, 36, 0.1)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)', icon: <Truck size={12} /> };
      case 'Delivered': return { bg: 'rgba(74, 222, 128, 0.1)', text: '#4ade80', border: 'rgba(74, 222, 128, 0.3)', icon: <CheckCircle size={12} /> };
      case 'Cancelled': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)', icon: <XCircle size={12} /> };
      default: return { bg: 'rgba(156, 163, 175, 0.1)', text: '#9ca3af', border: 'rgba(156, 163, 175, 0.3)', icon: <Clock size={12} /> };
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: '600' }}>Orders Management</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', marginTop: '4px' }}>Manage lifecycle and fulfillment for {orders.length} orders</p>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.01)' }}>
                  {['Order ID', 'Customer', 'Total', 'Payment', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', color: 'var(--color-muted)', fontWeight: '500', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => {
                  const s = getStatusColor(order.status || 'Processing');
                  return (
                    <tr key={order._id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '1.25rem' }}>
                        <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: '600' }}>#{order._id.slice(-8).toUpperCase()}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: '4px' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td style={{ padding: '1.25rem' }}>
                        <p style={{ fontWeight: '500' }}>{order.user?.name || 'Guest User'}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{order.user?.email || ''}</p>
                      </td>
                      <td style={{ padding: '1.25rem', fontWeight: '700', color: 'var(--color-accent)', fontSize: '0.95rem' }}>${order.totalPrice.toFixed(2)}</td>
                      <td style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '600', background: order.isPaid ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)', color: order.isPaid ? '#4ade80' : '#f87171', border: `1px solid ${order.isPaid ? 'rgba(74,222,128,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                          {order.isPaid ? <ShieldCheck size={12} /> : <Clock size={12} />}
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '600', background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
                          {s.icon}
                          {order.status || 'Processing'}
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '180px' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <select 
                              value={order.status || 'Processing'} 
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              style={{ 
                                background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', 
                                color: 'var(--color-text)', fontSize: '0.8rem', padding: '6px 10px', borderRadius: '6px', outline: 'none', cursor: 'pointer', flex: 1 
                              }}
                            >
                              {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            {!order.isPaid && (
                              <button onClick={() => markPaid(order._id)} style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', textDecoration: 'underline' }}>
                                Paid
                              </button>
                            )}
                          </div>
                          
                          <div style={{ padding: '8px 12px', background: 'rgba(201,168,76,0.05)', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.2)' }}>
                             <label style={{ fontSize: '0.65rem', color: 'var(--color-accent)', textTransform: 'uppercase', display: 'block', marginBottom: '4px', fontWeight: '700', letterSpacing: '0.05em' }}>Delivery Date</label>
                             <input 
                               type="date" 
                               value={order.expectedDelivery ? new Date(order.expectedDelivery).toISOString().split('T')[0] : ''}
                               onChange={(e) => handleDeliveryUpdate(order._id, e.target.value)}
                               style={{ 
                                 background: 'none', border: 'none', color: 'white', fontSize: '0.85rem', padding: '0', outline: 'none', width: '100%', cursor: 'pointer' 
                               }} 
                             />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {orders.length === 0 && <p style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-muted)' }}>No orders have been placed yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
