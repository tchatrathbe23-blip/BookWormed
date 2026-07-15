import { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, BookOpen } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const OrderSuccess = () => {
  const { cartItems, removeFromCart } = useContext(CartContext);

  // Clear the cart after successful order
  useEffect(() => {
    const timer = setTimeout(() => {
      cartItems.forEach(item => removeFromCart(item.bookId));
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const orderId = `BW-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="container py-12" style={{ maxWidth: '600px', textAlign: 'center' }}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        style={{ marginBottom: '2rem' }}
      >
        <CheckCircle size={100} style={{ color: '#10B981', margin: '0 auto' }} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Order Confirmed! 🎉
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
          Your books are on their way! Check your email for the full receipt and shipping details.
        </p>

        <div className="glass rounded-2xl p-6 mb-8" style={{ textAlign: 'left' }}>
          <h3 style={{ fontWeight: '700', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Order Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Order ID</span>
              <span style={{ fontWeight: '700', color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{orderId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              <span style={{ color: '#10B981', fontWeight: '600' }}>✓ Confirmed</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Estimated Delivery</span>
              <span>3-5 Business Days</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/browse" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={16} /> Browse More Books
          </Link>
          <Link to="/feed" className="btn btn-outline">
            View Feed
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
