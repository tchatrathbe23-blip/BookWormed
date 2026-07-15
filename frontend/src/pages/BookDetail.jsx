import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';
import { detailCache } from '../utils/bookCache';

const PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%231C1F2E'/%3E%3Crect x='60' y='80' width='80' height='100' rx='4' fill='%232D3748'/%3E%3Ctext x='100' y='220' text-anchor='middle' fill='%239CA3AF' font-size='12' font-family='sans-serif'%3ENo Cover%3C/text%3E%3C/svg%3E`;

const BookDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { addToCart, isInCart } = useContext(CartContext);
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Use cache for instant re-loads
      if (detailCache.has(id)) {
        setBook(detailCache.get(id));
        setLoading(false);
      }

      try {
        const [bookRes, reviewsRes] = await Promise.all([
          fetch(`/api/books/${id}`),
          fetch(`/api/books/${id}/reviews`)
        ]);
        if (bookRes.ok) {
          const bookData = await bookRes.json();
          detailCache.set(id, bookData);
          setBook(bookData);
        }
        if (reviewsRes.ok) setReviews(await reviewsRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Log in to leave a review.'); return; }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/books/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, content })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReviews([data, ...reviews]);
      setContent('');
      setRating(5);
      toast.success('Review posted!');
    } catch (err) {
      toast.error(err.message || 'Failed to post review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !book) return <div className="container py-8"><SkeletonLoader /></div>;
  if (!book) return <div className="container py-8 text-center" style={{ color: 'var(--text-muted)' }}>Book not found.</div>;

  const inCart = isInCart(book.id);

  // Build OL star display
  const renderOlStars = () => {
    if (!book.ratingsAverage) return null;
    const full = Math.floor(book.ratingsAverage);
    const half = book.ratingsAverage - full >= 0.25;
    return (
      <span style={{ color: '#F59E0B' }}>
        {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
      </span>
    );
  };

  // Info grid items
  const infoItems = [
    book.pageCount && { label: 'Pages', value: book.pageCount.toLocaleString() },
    book.isbn && { label: 'ISBN', value: book.isbn },
    book.publisher && { label: 'Publisher', value: book.publisher },
    book.language && { label: 'Language', value: book.language.toUpperCase() },
    book.publicationYear && { label: 'Published', value: book.publicationYear },
    book.ratingsAverage && { label: 'OL Rating', value: `${book.ratingsAverage.toFixed(1)} / 5${book.ratingsCount ? ` (${book.ratingsCount.toLocaleString()})` : ''}` },
  ].filter(Boolean);

  return (
    <motion.div
      className="container py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Book Hero */}
      <div className="glass rounded-xl p-6 md:p-10 mb-8" style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
        <img
          src={book.coverImage || PLACEHOLDER}
          alt={book.title}
          style={{ width: '220px', height: '320px', objectFit: 'cover', borderRadius: '12px', flexShrink: 0, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)' }}
          onError={e => { if (e.target.src !== PLACEHOLDER) e.target.src = PLACEHOLDER; }}
        />
        <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column' }}>
          {book.genre && (
            <span style={{ fontSize: '0.75rem', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent-purple)', marginBottom: '0.75rem' }}>
              {book.genre}
            </span>
          )}
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '0.75rem' }}>{book.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            by <span style={{ color: 'var(--text-main)' }}>{book.author}</span>
            {book.publicationYear && <span> · {book.publicationYear}</span>}
          </p>

          {/* Ratings row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#F59E0B' }}>
              <span>{'★'.repeat(5)}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
            {book.ratingsAverage && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: 'rgba(245,158,11,0.1)', padding: '3px 10px', borderRadius: '8px',
                fontSize: '0.8rem',
              }}>
                {renderOlStars()}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  OL {book.ratingsAverage.toFixed(1)}{book.ratingsCount ? ` · ${book.ratingsCount.toLocaleString()} ratings` : ''}
                </span>
              </div>
            )}
          </div>

          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, flex: 1, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {book.description}
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => addToCart(book)}
              className={`btn ${inCart ? 'btn-outline' : 'btn-primary'}`}
              style={{ padding: '0.65rem 1.5rem', fontWeight: '700' }}
            >
              {inCart ? '✓ In Reading List' : '+ Want to Read'}
            </motion.button>
            {inCart && (
              <Link to="/cart" className="btn btn-outline" style={{ padding: '0.65rem 1.5rem' }}>
                View List →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Book Info Grid */}
      {infoItems.length > 0 && (
        <div className="glass rounded-xl p-6 mb-8">
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-main)' }}>Book Details</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1rem',
          }}>
            {infoItems.map((item) => (
              <div key={item.label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '12px 16px',
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-main)', wordBreak: 'break-word' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
            Community Reviews
          </h2>

          {user ? (
            <motion.form
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              onSubmit={handleReviewSubmit}
              className="glass p-5 rounded-xl mb-6"
            >
              <h3 style={{ fontWeight: '700', marginBottom: '1rem' }}>Write a Review</h3>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Rating</label>
                  <select className="input-dark" value={rating} onChange={e => setRating(Number(e.target.value))} style={{ width: '130px' }}>
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{'★'.repeat(n)} {n} Stars</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Your thoughts</label>
                <textarea
                  className="input-dark w-full" rows="3"
                  placeholder="What did you think of this book?"
                  value={content} onChange={e => setContent(e.target.value)} required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.55rem 1.5rem' }} disabled={submitting}>
                {submitting ? 'Posting...' : 'Post Review'}
              </button>
            </motion.form>
          ) : (
            <div className="glass p-5 rounded-xl mb-6 text-center">
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Log in to leave a review.</p>
              <Link to="/login" className="btn btn-outline">Log In</Link>
            </div>
          )}

          <div className="post-list">
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No reviews yet — be the first!</p>
            ) : (
              reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="post-card"
                >
                  <div className="avatar"></div>
                  <div className="post-content">
                    <div className="post-header">
                      <span className="post-author">@{review.username}</span>
                      <span className="post-meta"> · {new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style={{ color: '#F59E0B', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </div>
                    <p className="post-text">{review.content}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookDetail;
