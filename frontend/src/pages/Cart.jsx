import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ShoppingCart, BookOpen } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const Cart = () => {
  const { cartItems, removeFromCart } = useContext(CartContext);

  const PRICE_PER_BOOK = 9.99;
  const subtotal = cartItems.length * PRICE_PER_BOOK;
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="container py-8 animate-fade-up">
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShoppingCart size={32} style={{ color: 'var(--accent-blue)' }} />
          My Reading List
        </h1>
        <p className="page-subtitle">{cartItems.length} book{cartItems.length !== 1 ? 's' : ''} saved</p>
      </div>

      {cartItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-16 text-center"
        >
          <BookOpen size={64} style={{ color: 'var(--accent-purple)', margin: '0 auto 1.5rem' }} />
          <h2 className="text-2xl font-bold mb-3">Your list is empty</h2>
          <p className="text-gray-400 mb-8">Browse the library and add books you want to read!</p>
          <Link to="/browse" className="btn btn-primary">Browse Books</Link>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
          {/* Book List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.bookId}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="glass rounded-xl p-4"
                  style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}
                >
                  <Link to={`/book/${item.bookId}`}>
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      style={{ width: '70px', height: '100px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, boxShadow: '0 4px 15px rgba(0,0,0,0.4)' }}
                      onError={e => e.target.src = 'https://via.placeholder.com/70x100?text=No+Cover'}
                    />
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link to={`/book/${item.bookId}`}>
                      <h3 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </h3>
                    </Link>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{item.author}</p>
                    <span style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--accent-purple)', padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>
                      {item.listType === 'want_to_read' ? 'Want to Read' : item.listType}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--accent-blue)', marginBottom: '0.75rem' }}>${PRICE_PER_BOOK.toFixed(2)}</p>
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item.bookId)}
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
            style={{ position: 'sticky', top: '100px' }}
          >
            <h2 style={{ fontWeight: '700', fontSize: '1.25rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              Order Summary
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal ({cartItems.length} books)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontWeight: '700', fontSize: '1.1rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent-blue)' }}>${total.toFixed(2)}</span>
              </div>
            </div>

            <Link to="/checkout" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', padding: '0.85rem', fontSize: '1rem', fontWeight: '700' }}>
              Proceed to Checkout →
            </Link>
            <Link to="/browse" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              ← Continue Browsing
            </Link>

            {/* Trust badges */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              {['🔒 Secure', '✅ Instant', '📧 Receipt'].map(b => (
                <span key={b} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b}</span>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Cart;
