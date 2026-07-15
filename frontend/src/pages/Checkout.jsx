import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Lock, ChevronRight } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const Checkout = () => {
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=details, 2=payment
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', address: '', city: '', zip: '',
    cardNumber: '', expiry: '', cvv: '', cardName: ''
  });

  const PRICE_PER_BOOK = 9.99;
  const subtotal = cartItems.length * PRICE_PER_BOOK;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const formatCard = (val) => val.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19);
  const formatExpiry = (val) => val.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2200));
    navigate('/order-success');
  };

  const inputClass = "input-dark w-full";

  return (
    <div className="container py-8 animate-fade-up" style={{ maxWidth: '1000px' }}>
      <h1 className="page-title mb-2">Checkout</h1>

      {/* Step Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        {['Shipping', 'Payment'].map((label, i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '700', fontSize: '0.8rem',
              background: step > i ? 'var(--accent-blue)' : step === i + 1 ? 'var(--accent-purple)' : 'var(--bg-card)',
              border: `2px solid ${step >= i + 1 ? 'var(--accent-blue)' : 'var(--border-color)'}`,
              transition: 'all 0.3s'
            }}>
              {i + 1}
            </div>
            <span style={{ fontSize: '0.85rem', color: step === i + 1 ? 'white' : 'var(--text-muted)', fontWeight: step === i + 1 ? '600' : '400' }}>{label}</span>
            {i < 1 && <ChevronRight size={14} style={{ color: 'var(--border-color)' }} />}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6">
              <h2 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Shipping Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Full Name</label>
                  <input name="name" className={inputClass} value={form.name} onChange={handleChange} placeholder="John Doe" required />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Email Address</label>
                  <input name="email" type="email" className={inputClass} value={form.email} onChange={handleChange} placeholder="john@example.com" required />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Street Address</label>
                  <input name="address" className={inputClass} value={form.address} onChange={handleChange} placeholder="123 Book Street" required />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input name="city" className={inputClass} value={form.city} onChange={handleChange} placeholder="Mumbai" required />
                </div>
                <div className="form-group">
                  <label className="form-label">ZIP Code</label>
                  <input name="zip" className={inputClass} value={form.zip} onChange={handleChange} placeholder="400001" required />
                </div>
              </div>
              <button type="button" className="btn btn-primary w-full mt-4" style={{ padding: '0.85rem' }} onClick={() => setStep(2)}>
                Continue to Payment →
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6">
              <h2 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={20} style={{ color: 'var(--accent-blue)' }} /> Payment Details
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Lock size={12} /> Your payment info is encrypted and secure
              </p>

              {/* Card Preview */}
              <motion.div
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem',
                  fontFamily: 'monospace', position: 'relative', overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }}></div>
                <div style={{ position: 'absolute', bottom: '-30px', right: '30px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }}></div>
                <p style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '1rem', letterSpacing: '2px' }}>BOOKWORMED PREMIUM</p>
                <p style={{ fontSize: '1.2rem', letterSpacing: '3px', marginBottom: '1rem' }}>
                  {form.cardNumber || '•••• •••• •••• ••••'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.65rem', opacity: 0.7 }}>CARD HOLDER</p>
                    <p style={{ fontSize: '0.9rem' }}>{form.cardName || 'YOUR NAME'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.65rem', opacity: 0.7 }}>EXPIRES</p>
                    <p style={{ fontSize: '0.9rem' }}>{form.expiry || 'MM/YY'}</p>
                  </div>
                </div>
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Name on Card</label>
                  <input name="cardName" className={inputClass} value={form.cardName} onChange={handleChange} placeholder="John Doe" required />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Card Number</label>
                  <input name="cardNumber" className={inputClass} value={form.cardNumber}
                    onChange={e => setForm({ ...form, cardNumber: formatCard(e.target.value) })}
                    placeholder="1234 5678 9012 3456" maxLength={19} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input name="expiry" className={inputClass} value={form.expiry}
                    onChange={e => setForm({ ...form, expiry: formatExpiry(e.target.value) })}
                    placeholder="MM/YY" maxLength={5} required />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV</label>
                  <input name="cvv" type="password" className={inputClass} value={form.cvv}
                    onChange={e => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                    placeholder="•••" maxLength={3} required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-outline" style={{ padding: '0.85rem', flex: '0 0 auto' }} onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button type="submit" className="btn btn-primary w-full" style={{ padding: '0.85rem', fontSize: '1rem', fontWeight: '700', position: 'relative' }} disabled={processing}>
                  {processing ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <span className="spinner"></span> Processing...
                    </span>
                  ) : (
                    `Pay $${total.toFixed(2)}`
                  )}
                </button>
              </div>

              {/* Payment Methods */}
              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                {['Visa', 'Mastercard', 'Amex', 'PayPal'].map(m => (
                  <span key={m} style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m}</span>
                ))}
              </div>
            </motion.div>
          )}
        </form>

        {/* Order Summary Sidebar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-5" style={{ position: 'sticky', top: '100px' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
            Order Summary
          </h3>
          <div style={{ maxHeight: '250px', overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {cartItems.map(item => (
              <div key={item.bookId} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <img src={item.coverImage} alt={item.title} style={{ width: '40px', height: '55px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} onError={e => e.target.src = 'https://via.placeholder.com/40x55'} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '600', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.author?.slice(0, 25)}</p>
                </div>
                <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--accent-blue)' }}>${PRICE_PER_BOOK.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span><span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tax</span><span>${tax.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              <span>Total</span><span style={{ color: 'var(--accent-blue)', fontSize: '1.1rem' }}>${total.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;
