import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { Search, Loader2, BookX, Star, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CartContext } from '../context/CartContext';
import { detailCache } from '../utils/bookCache';

// Module-level cache persists across navigations
const searchCache = new Map();

// Stable placeholder so no flicker on error
const PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%231C1F2E'/%3E%3Crect x='60' y='80' width='80' height='100' rx='4' fill='%232D3748'/%3E%3Ctext x='100' y='220' text-anchor='middle' fill='%239CA3AF' font-size='12' font-family='sans-serif'%3ENo Cover%3C/text%3E%3C/svg%3E`;

const RatingStars = ({ avg }) => {
  if (!avg) return null;
  const full = Math.floor(avg);
  const half = avg - full >= 0.25;
  return (
    <span style={{ color: '#F59E0B', fontSize: '0.7rem', letterSpacing: '-1px' }}>
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
      <span style={{ color: 'var(--text-muted)', marginLeft: '3px', letterSpacing: 'normal' }}>
        {avg.toFixed(1)}
      </span>
    </span>
  );
};

const Browse = () => {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('loading'); // 'loading' | 'searching' | 'idle' | 'error'
  const [error, setError] = useState('');
  const { addToCart, isInCart } = useContext(CartContext);

  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  const fetchBooks = useCallback(async (searchQuery, showSkeleton = false) => {
    const cacheKey = searchQuery.trim().toLowerCase();

    // Hit cache instantly — no loading state needed
    if (searchCache.has(cacheKey)) {
      setBooks(searchCache.get(cacheKey));
      setStatus('idle');
      return;
    }

    // Show subtle searching state but KEEP existing books visible
    setStatus(showSkeleton ? 'loading' : 'searching');
    setError('');

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch(
        `/api/books?search=${encodeURIComponent(searchQuery)}`,
        { signal: abortRef.current.signal }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      searchCache.set(cacheKey, data);
      setBooks(data);
      setError('');

      // Pre-populate the detail cache so BookDetail pages load instantly
      data.forEach((book) => {
        if (book.id && !detailCache.has(book.id)) {
          detailCache.set(book.id, book);
        }
      });
    } catch (e) {
      if (e.name === 'AbortError') return; // cancelled — don't update state
      setError(e.message);
    } finally {
      setStatus('idle');
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchBooks(query, true);
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, []);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) {
      fetchBooks('', false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchBooks(val), 350);
  };

  // Prefetch on hover
  const prefetch = useCallback((bookId) => {
    setTimeout(async () => {
      try { await fetch(`/api/books/${bookId}`); } catch (_) {}
    }, 150);
  }, []);

  const isSearching = status === 'searching';

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Browse Books</h1>
        <p className="page-subtitle">
          Search millions of titles via Open Library — type to search instantly
        </p>
      </div>

      {/* Search Bar */}
      <div className="filters-row glass">
        <div className="search-wrapper" style={{ flex: 1, position: 'relative' }}>
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', zIndex: 1 }}>
                <Loader2 size={16} style={{ color: 'var(--accent-blue)', animation: 'spin 0.8s linear infinite' }} />
              </motion.span>
            ) : (
              <motion.span key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', zIndex: 1 }}>
                <Search size={16} style={{ color: 'var(--text-muted)' }} />
              </motion.span>
            )}
          </AnimatePresence>
          <input
            type="text"
            placeholder="Type to search... (e.g. 'Dune', 'Clean Code', 'Frank Herbert')"
            className="input-dark"
            value={query}
            onChange={handleQueryChange}
            style={{ paddingLeft: '2.5rem', width: '100%' }}
          />
        </div>
        <button className="btn btn-outline" onClick={() => { clearTimeout(debounceRef.current); fetchBooks(query); }}>
          Search
        </button>
      </div>

      {/* Result count */}
      {status === 'idle' && books.length > 0 && (
        <div style={{ marginTop: '0.75rem', marginBottom: '-0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <BookOpen size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '5px' }} />
          {books.length} result{books.length !== 1 ? 's' : ''} found
        </div>
      )}

      {error && (
        <div className="error-message" style={{ maxWidth: '560px', margin: '1.5rem auto', animation: 'none' }}>
          {error}
        </div>
      )}

      {/* Results */}
      {status === 'loading' ? (
        // First-load skeleton — stable grid, no flash
        <div className="book-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="book-card" style={{ pointerEvents: 'none' }}>
              <div className="book-cover" style={{ background: 'linear-gradient(135deg, #1C1F2E 0%, #2D3748 100%)', animation: 'pulse 1.6s ease-in-out infinite' }} />
              <div className="book-info">
                <div>
                  <div style={{ height: '1rem', background: '#2D3748', borderRadius: '4px', marginBottom: '0.5rem', width: '75%', animation: 'pulse 1.6s ease-in-out infinite' }} />
                  <div style={{ height: '0.75rem', background: '#2D3748', borderRadius: '4px', width: '55%', animation: 'pulse 1.6s ease-in-out infinite' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Results — use layout animation so existing cards don't re-animate
        <div className="book-grid" style={{ opacity: isSearching ? 0.6 : 1, transition: 'opacity 0.2s' }}>
          {books.length === 0 && !error ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              <BookX size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p>No results found. Try a different search.</p>
            </div>
          ) : (
            books.map((book, i) => (
              <motion.div
                key={book.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                style={{ position: 'relative' }}
              >
                <Link
                  to={`/book/${book.id}`}
                  className="book-card"
                  onMouseEnter={() => prefetch(book.id)}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="book-cover"
                      loading="lazy"
                      onError={e => {
                        if (e.target.src !== PLACEHOLDER) e.target.src = PLACEHOLDER;
                      }}
                      style={{ background: '#1C1F2E' }}
                    />
                    {/* Page count badge */}
                    {book.pageCount && (
                      <span style={{
                        position: 'absolute', bottom: '6px', left: '6px',
                        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                        padding: '2px 7px', borderRadius: '6px',
                        fontSize: '0.65rem', fontWeight: 600, color: '#e2e8f0',
                        display: 'flex', alignItems: 'center', gap: '3px',
                      }}>
                        <BookOpen size={10} /> {book.pageCount}p
                      </span>
                    )}
                  </div>
                  <div className="book-info">
                    <div>
                      <h3 className="book-title" title={book.title}>{book.title}</h3>
                      <p className="book-author" title={book.author}>{book.author}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {/* Open Library rating */}
                      {book.ratingsAverage ? (
                        <RatingStars avg={book.ratingsAverage} />
                      ) : null}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                          {book.publicationYear || 'Open Library'}
                        </span>
                        {book.editionCount && (
                          <span style={{
                            fontSize: '0.65rem', color: 'var(--accent-purple)', fontWeight: 600,
                            background: 'rgba(139,92,246,0.12)', padding: '1px 6px', borderRadius: '4px',
                          }}>
                            {book.editionCount} ed.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Quick Add Button — shown on hover via CSS */}
                <button
                  onClick={e => { e.preventDefault(); addToCart(book); }}
                  className="quick-add-btn"
                  style={{
                    position: 'absolute', top: '8px', right: '8px',
                    background: isInCart(book.id)
                      ? 'rgba(139,92,246,0.92)'
                      : 'rgba(59,130,246,0.9)',
                    backdropFilter: 'blur(8px)',
                    border: 'none', color: 'white',
                    borderRadius: '8px', padding: '5px 10px',
                    fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer',
                    opacity: 0, transition: 'opacity 0.18s ease',
                  }}
                >
                  {isInCart(book.id) ? '✓ Added' : '+ Add'}
                </button>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Browse;
