import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Lock } from 'lucide-react';

interface PaymentFormsProps {
  method: string;
  onChange: (data: any, isValid: boolean) => void;
}

export default function PaymentForms({ method, onChange }: PaymentFormsProps) {
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [mobileData, setMobileData] = useState({ phone: '', cnic: '' });

  useEffect(() => {
    if (method === 'stripe' || method === 'card') {
      const isValid = cardData.number.length >= 15 && cardData.expiry.length === 5 && cardData.cvv.length >= 3;
      onChange(cardData, isValid);
    } else if (method === 'jazzcash' || method === 'easypaisa') {
      const isValid = mobileData.phone.length >= 11;
      onChange(mobileData, isValid);
    } else {
      onChange({}, true); // Wallet or COD is always valid without extra input
    }
  }, [cardData, mobileData, method]);

  if (method === 'wallet' || method === 'cod') return null;

  return (
    <div style={{ marginTop: '1rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
      
      {(method === 'stripe' || method === 'card') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
            <Lock size={14} /> <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Secure Card Payment</span>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.4rem' }}>Card Number</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="0000 0000 0000 0000" 
                maxLength={19}
                className="input-field" 
                value={cardData.number}
                onChange={e => setCardData(prev => ({ ...prev, number: e.target.value.replace(/\D/g, '') }))}
                style={{ paddingLeft: '2.5rem' }}
              />
              <CreditCard size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.4rem' }}>Expiry Date</label>
              <input 
                type="text" 
                placeholder="MM/YY" 
                maxLength={5}
                className="input-field"
                value={cardData.expiry}
                onChange={e => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length >= 3) val = val.slice(0,2) + '/' + val.slice(2);
                  setCardData(prev => ({ ...prev, expiry: val }));
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.4rem' }}>CVV</label>
              <input 
                type="password" 
                placeholder="123" 
                maxLength={4}
                className="input-field"
                value={cardData.cvv}
                onChange={e => setCardData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.4rem' }}>Name on Card</label>
            <input 
              type="text" 
              placeholder="John Doe" 
              className="input-field"
              value={cardData.name}
              onChange={e => setCardData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
        </div>
      )}

      {(method === 'jazzcash' || method === 'easypaisa') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
            <Smartphone size={14} /> <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{method === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'} Mobile Account</span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.4rem' }}>Mobile Number</label>
            <input 
              type="text" 
              placeholder="03XX XXXXXXX" 
              maxLength={11}
              className="input-field"
              value={mobileData.phone}
              onChange={e => setMobileData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
            />
          </div>

          {method === 'jazzcash' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.4rem' }}>CNIC (Last 6 Digits) - Optional</label>
              <input 
                type="text" 
                placeholder="123456" 
                maxLength={6}
                className="input-field"
                value={mobileData.cnic}
                onChange={e => setMobileData(prev => ({ ...prev, cnic: e.target.value.replace(/\D/g, '') }))}
              />
            </div>
          )}
          
          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
            Please ensure your mobile account is active. You will receive an authorization prompt on your mobile phone to complete the transaction.
          </p>
        </div>
      )}

    </div>
  );
}
