'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { CreditCard, Wallet, Smartphone, ArrowRight, Loader2, Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import PaymentForms from '@/components/PaymentForms';

function WalletContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [depositAmount, setDepositAmount] = useState('100');
  const [depositMethod, setDepositMethod] = useState('STRIPE'); // 'STRIPE', 'JAZZCASH', 'EASYPAISA'
  const [isDepositing, setIsDepositing] = useState(false);
  const [paymentData, setPaymentData] = useState<any>({});
  const [isPaymentValid, setIsPaymentValid] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return; }

    const fetchWallet = async () => {
      try {
        const { data } = await api.get('/payments/transactions');
        setBalance(data.balance);
        setTransactions(data.transactions);
      } catch (err) {
        console.error('Failed to fetch wallet data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [user, router]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPaymentValid) {
      alert('Please fill out all payment details correctly.');
      return;
    }
    setIsDepositing(true);
    try {
      const { data } = await api.post('/payments/deposit', {
        amount: Number(depositAmount),
        method: depositMethod,
        paymentDetails: paymentData // Sending the actual form data to backend
      });
      // Redirect to the mock checkout page
      window.location.href = `http://localhost:5000${data.checkoutUrl}`;
    } catch (err) {
      console.error(err);
      alert('Failed to initiate deposit');
      setIsDepositing(false);
    }
  };

  if (loading) return <div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
        <Link href="/profile" style={{ color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>&larr; Back to Profile</span>
        </Link>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', margin: 0, color: 'var(--color-accent)' }}>
          My Wallet
        </h1>
      </div>

      {searchParams.get('status') === 'COMPLETED' && (
        <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid #22c55e', color: '#22c55e', borderRadius: '8px', marginBottom: '2rem' }}>
          Payment successful! Your balance has been updated.
        </div>
      )}
      {searchParams.get('status') === 'FAILED' && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', marginBottom: '2rem' }}>
          Payment failed or was canceled.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        {/* Left Col: Transactions */}
        <div>
          <div className="glass" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--color-text)' }}>Transaction History</h2>
            
            {transactions.length === 0 ? (
              <p style={{ color: 'var(--color-muted)' }}>No transactions found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {transactions.map(txn => (
                  <div key={txn._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: txn.type === 'DEPOSIT' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: txn.type === 'DEPOSIT' ? '#22c55e' : '#ef4444' }}>
                        {txn.type === 'DEPOSIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: '600', color: 'var(--color-text)' }}>{txn.description || txn.type}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                          {new Date(txn.createdAt).toLocaleDateString()} • {txn.status}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontWeight: '600', color: txn.type === 'DEPOSIT' ? '#22c55e' : 'var(--color-text)' }}>
                        {txn.type === 'DEPOSIT' ? '+' : '-'}${txn.amount.toFixed(2)}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-muted)' }}>{txn.paymentGateway}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Balance & Deposit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Balance Card */}
          <div style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c97a)', padding: '2rem', borderRadius: '16px', color: '#0d0d0d', boxShadow: '0 10px 40px rgba(201,168,76,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>Available Balance</span>
              <Wallet size={24} />
            </div>
            <h2 style={{ fontSize: '3rem', margin: 0, fontFamily: 'var(--font-heading)', fontWeight: '400' }}>
              ${balance.toFixed(2)}
            </h2>
          </div>

          {/* Deposit Form */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} color="var(--color-accent)" /> Add Funds
            </h3>
            <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>Amount ($)</label>
                <input 
                  type="number" 
                  min="10" 
                  step="1"
                  required
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '1.2rem', padding: '0.75rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                  {[
                    { id: 'STRIPE', label: 'Credit Card', icon: CreditCard },
                    { id: 'JAZZCASH', label: 'JazzCash', icon: Smartphone },
                    { id: 'EASYPAISA', label: 'EasyPaisa', icon: Smartphone },
                  ].map(method => (
                    <div 
                      key={method.id}
                      onClick={() => setDepositMethod(method.id)}
                      style={{ 
                        padding: '1rem', border: `1px solid ${depositMethod === method.id ? 'var(--color-accent)' : 'var(--color-border)'}`, 
                        borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem',
                        background: depositMethod === method.id ? 'rgba(201,168,76,0.1)' : 'transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <method.icon size={20} color={depositMethod === method.id ? 'var(--color-accent)' : 'var(--color-muted)'} />
                      <span style={{ color: depositMethod === method.id ? 'var(--color-text)' : 'var(--color-muted)' }}>{method.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <PaymentForms 
                method={depositMethod.toLowerCase()} 
                onChange={(data, valid) => { setPaymentData(data); setIsPaymentValid(valid); }} 
              />

              <button type="submit" disabled={isDepositing || !isPaymentValid} className="btn-primary" style={{ marginTop: '1rem', padding: '1rem', display: 'flex', justifyContent: 'center' }}>
                {isDepositing ? <Loader2 className="animate-spin" /> : `Deposit $${depositAmount}`}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: '8rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></div>}>
      <WalletContent />
    </Suspense>
  );
}
