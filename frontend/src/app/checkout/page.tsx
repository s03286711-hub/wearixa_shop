'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { orderService, promoService, cashbackService } from '@/services';
import api from '@/services/api';
import { MapPin, CreditCard, CheckCircle, ArrowRight, Wallet, Smartphone, Tag, Loader2 } from 'lucide-react';
import PaymentForms from '@/components/PaymentForms';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = ['Shipping', 'Payment', 'Confirm'];

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cartItems, totalPrice, totalShipping, clearCart } = useCart();
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [shipping, setShipping] = useState({ address: '', city: '', postalCode: '', country: '' });
  const [payment, setPayment] = useState({ method: 'stripe' });
  const [paymentData, setPaymentData] = useState<any>({});
  const [isPaymentValid, setIsPaymentValid] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoApplied, setPromoApplied] = useState<{ code: string; discount: number; message: string } | null>(null);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    if (user) {
      api.get('/payments/transactions')
         .then(res => setWalletBalance(res.data.balance))
         .catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user === null) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={32} /></div>;
  if (!user) return null;

  // Pricing
  const subtotal = totalPrice - totalShipping;
  const shippingCost = subtotal > 100 ? 0 : 12.99;
  const promoDiscount = promoApplied?.discount || 0;
  const tax = (subtotal - promoDiscount) * 0.08;
  const grandTotal = Math.max(0, subtotal - promoDiscount + shippingCost + tax);
  const walletCashback = payment.method === 'wallet' ? Math.round(grandTotal * 0.05 * 100) / 100 : 0;

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        orderItems: cartItems.map(i => ({ name: i.title, qty: i.qty, image: i.image, price: i.price, product: i._id })),
        shippingAddress: shipping,
        paymentMethod: payment.method,
        paymentData: payment.method !== 'wallet' && payment.method !== 'cod' ? paymentData : {},
        taxPrice: tax,
        shippingPrice: shippingCost,
        totalPrice: grandTotal,
      };
      const created = await orderService.create(orderData);
      setOrderId(created._id);

      // If promo was applied, mark it as used
      if (promoApplied) {
        try { await promoService.use(promoApplied.code); } catch(e) { /* non-critical */ }
      }

      // If paid with wallet, trigger cashback
      if (payment.method === 'wallet') {
        try {
          const cb = await cashbackService.process(grandTotal);
          if (cb.cashback > 0) {
            showToast(`🎉 $${cb.cashback.toFixed(2)} cashback added to your wallet!`, 'success');
          }
        } catch(e) { /* non-critical */ }
      }

      showToast('Order placed successfully!', 'success');
      clearCart();
      setStep(2);
    } catch (err: any) {
      console.error(err);
      showToast(err?.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { marginBottom: '1rem' };
  const labelStyle = { display: 'block', fontSize: '0.78rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase' as const, marginBottom: '0.5rem' };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '900px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Secure</p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '600' }}>Checkout</h1>
      </div>

      {/* Only show steps and grid if order hasn't been placed yet */}
      {!orderId ? (
        <>
          {/* Step indicator */}
          <div className="checkout-steps" style={{ display: 'flex', alignItems: 'center', marginBottom: '3rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i <= step ? 'var(--color-accent)' : 'var(--color-surface)',
                  border: `1px solid ${i <= step ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  color: i <= step ? '#0d0d0d' : 'var(--color-muted)', fontWeight: '700', fontSize: '0.85rem',
                  transition: 'all 0.3s', flexShrink: 0,
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="step-text" style={{ marginLeft: '8px', fontSize: '0.85rem', color: i === step ? 'var(--color-text)' : 'var(--color-muted)', whiteSpace: 'nowrap' }}>{s}</span>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: '1px', background: i < step ? 'var(--color-accent)' : 'var(--color-border)', margin: '0 1rem', transition: 'background 0.3s' }} />
                )}
              </div>
            ))}
          </div>

          <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
            {/* Main form */}
            <div>
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div 
                    key="step0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass" style={{ borderRadius: '12px', padding: '2rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.75rem' }}>
                      <MapPin size={20} style={{ color: 'var(--color-accent)' }} />
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem' }}>Shipping Address</h2>
                    </div>
                    <div style={inputStyle}><label style={labelStyle}>Street Address</label><input className="input-field" value={shipping.address} onChange={e => setShipping(s => ({ ...s, address: e.target.value }))} placeholder="123 Fashion Avenue" required /></div>
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={inputStyle}><label style={labelStyle}>City</label><input className="input-field" value={shipping.city} onChange={e => setShipping(s => ({ ...s, city: e.target.value }))} placeholder="New York" required /></div>
                      <div style={inputStyle}><label style={labelStyle}>Postal Code</label><input className="input-field" value={shipping.postalCode} onChange={e => setShipping(s => ({ ...s, postalCode: e.target.value }))} placeholder="10001" required /></div>
                    </div>
                    <div style={inputStyle}><label style={labelStyle}>Country</label><input className="input-field" value={shipping.country} onChange={e => setShipping(s => ({ ...s, country: e.target.value }))} placeholder="United States" required /></div>
                    <button onClick={() => { if (Object.values(shipping).every(v => v)) setStep(1); }} className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      Continue to Payment <ArrowRight size={16} />
                    </button>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass" style={{ borderRadius: '12px', padding: '2rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.75rem' }}>
                      <CreditCard size={20} style={{ color: 'var(--color-accent)' }} />
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem' }}>Payment Method</h2>
                    </div>
                    {[
                      { id: 'wallet', name: 'Wearixa Digital Wallet', desc: `Available Balance: $${walletBalance?.toFixed(2) || '0.00'}`, icon: Wallet },
                      { id: 'stripe', name: 'Credit / Debit Card', desc: 'Visa, Mastercard, Amex via Stripe', icon: CreditCard },
                      { id: 'jazzcash', name: 'JazzCash Mobile Wallet', desc: 'Pay instantly via JazzCash', icon: Smartphone },
                      { id: 'easypaisa', name: 'EasyPaisa', desc: 'Pay instantly via EasyPaisa', icon: Smartphone },
                      { id: 'cod', name: 'Cash on Delivery', desc: 'Pay when you receive', icon: CheckCircle },
                    ].map((m) => {
                      const disabled = m.id === 'wallet' && (walletBalance === null || walletBalance < grandTotal);
                      return (
                        <div key={m.id} style={{ marginBottom: '0.75rem' }}>
                          <label style={{
                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '8px',
                            border: `1px solid ${payment.method === m.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                            background: payment.method === m.id ? 'rgba(201,168,76,0.05)' : 'transparent',
                            cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.3s',
                            opacity: disabled ? 0.5 : 1
                          }}>
                            <input type="radio" name="payment" value={m.id} disabled={disabled} checked={payment.method === m.id} onChange={() => setPayment({ method: m.id })} style={{ accentColor: 'var(--color-accent)' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                                <m.icon size={16} />
                              </div>
                              <div>
                                <p style={{ fontWeight: '600', fontSize: '0.9rem', margin: 0, color: disabled && m.id === 'wallet' ? '#ef4444' : 'var(--color-text)' }}>
                                  {m.name} {disabled && m.id === 'wallet' && '(Insufficient)'}
                                </p>
                                <p style={{ color: 'var(--color-muted)', fontSize: '0.78rem', margin: 0 }}>
                                  {m.desc}
                                </p>
                              </div>
                            </div>
                          </label>
                          {payment.method === m.id && m.id !== 'wallet' && m.id !== 'cod' && (
                            <PaymentForms 
                              method={m.id} 
                              onChange={(data, valid) => { setPaymentData(data); setIsPaymentValid(valid); }} 
                            />
                          )}
                        </div>
                      );
                    })}
                    <div className="checkout-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button onClick={() => setStep(0)} className="btn-outline" style={{ flex: 1 }}>Back</button>
                      <button 
                        onClick={() => {
                          if (payment.method !== 'wallet' && payment.method !== 'cod' && !isPaymentValid) {
                            showToast('Please fill out all payment details correctly.', 'error');
                            return;
                          }
                          setStep(2);
                        }} 
                        className="btn-primary" 
                        style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        Review Order <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass" style={{ borderRadius: '12px', padding: '2rem' }}
                  >
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', marginBottom: '1.5rem' }}>Order Review</h2>
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-surface-2)', borderRadius: '8px' }}>
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Shipping to</p>
                      <p style={{ fontSize: '0.9rem' }}>{shipping.address}, {shipping.city}, {shipping.postalCode}, {shipping.country}</p>
                    </div>
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-surface-2)', borderRadius: '8px' }}>
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Payment</p>
                      <p style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>{payment.method}</p>
                    </div>
                    <div className="checkout-actions" style={{ display: 'flex', gap: '1rem' }}>
                      <button onClick={() => setStep(1)} className="btn-outline" style={{ flex: 1 }}>Back</button>
                      <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {loading ? 'Placing Order...' : 'Place Order'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order summary sidebar */}
            <div className="glass" style={{ borderRadius: '12px', padding: '1.75rem', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1.25rem' }}>Your Order</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', maxHeight: '240px', overflowY: 'auto' }}>
                {cartItems.map(item => (
                  <div key={item._id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '64px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, background: 'var(--color-surface-2)' }}>
                      <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.82rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>x{item.qty}</p>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-accent)', flexShrink: 0 }}>${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              {/* Promo Code Section */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--color-accent)', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: '600' }}>Promo Code</p>
                {promoApplied ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1rem', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag size={14} style={{ color: '#4ade80' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4ade80' }}>{promoApplied.code}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>−${promoApplied.discount.toFixed(2)}</span>
                    </div>
                    <button onClick={() => { setPromoApplied(null); setPromoCode(''); setPromoError(''); }}
                      style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '0.75rem' }}>Remove</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input className="input-field" value={promoCode} onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                        placeholder="Enter code" style={{ fontSize: '0.85rem', flex: 1 }} />
                      <button onClick={async () => {
                        if (!promoCode.trim()) return;
                        setPromoLoading(true); setPromoError('');
                        try {
                          const result = await promoService.validate(promoCode, subtotal);
                          setPromoApplied({ code: result.code, discount: result.discount, message: result.message });
                          showToast(result.message, 'success');
                        } catch (err: any) {
                          setPromoError(err?.response?.data?.message || 'Invalid code');
                        } finally { setPromoLoading(false); }
                      }} disabled={promoLoading} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {promoLoading ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                    {promoError && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.4rem' }}>{promoError}</p>}
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[['Subtotal', `$${subtotal.toFixed(2)}`], ['Shipping', shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`], ['Tax', `$${tax.toFixed(2)}`]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--color-muted)' }}>{l}</span>
                    <span>{v}</span>
                  </div>
                ))}
                {promoApplied && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: '#4ade80' }}>Discount</span>
                    <span style={{ color: '#4ade80' }}>−${promoApplied.discount.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--color-accent)' }}>${grandTotal.toFixed(2)}</span>
                </div>
                {walletCashback > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '0.5rem 0.75rem', background: 'rgba(201,168,76,0.08)', borderRadius: '6px', marginTop: '0.5rem' }}>
                    <span style={{ color: 'var(--color-accent)' }}>🎉 Wallet Cashback (5%)</span>
                    <span style={{ color: 'var(--color-accent)', fontWeight: '600' }}>+${walletCashback.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Order success screen */
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="glass" style={{ borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}
        >
          <CheckCircle size={64} style={{ color: '#4ade80', margin: '0 auto 2rem' }} />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.25rem', marginBottom: '1rem' }}>Order Placed!</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Thank you for your purchase.</p>
          <p style={{ color: 'var(--color-accent)', fontSize: '0.95rem', fontWeight: '600', marginBottom: '2.5rem' }}>Order ID: {orderId}</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => router.push('/orders')} className="btn-primary">View My Orders</button>
            <button onClick={() => router.push('/shop')} className="btn-outline">Continue Shopping</button>
          </div>
        </motion.div>
      )}
      <style>{`
        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
          .checkout-grid > div { min-width: 0 !important; }
          .form-grid-2 { grid-template-columns: 1fr !important; }
          .step-text { display: none !important; }
          .checkout-actions { flex-direction: column-reverse !important; gap: 0.75rem !important; }
        }
      `}</style>
    </div>
  );
}
