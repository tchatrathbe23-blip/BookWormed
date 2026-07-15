import { useContext, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenText, Sparkles, Layers3, BookMarked } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Stats = () => {
  const { user } = useContext(AuthContext);
  const { cartItems, fetchCart } = useContext(CartContext);

  useEffect(() => {
    if (user) fetchCart();
  }, [fetchCart, user]);

  const summary = useMemo(() => {
    const genreCounts = cartItems.reduce((acc, item) => {
      const genre = item.genre || 'General';
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});

    const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0];
    const latestBook = cartItems[0];
    const mostRecentYear = cartItems
      .map((item) => item.publicationYear)
      .filter(Boolean)
      .sort((a, b) => b - a)[0];

    return {
      totalBooks: cartItems.length,
      genres: Object.keys(genreCounts).length,
      topGenre: topGenre ? topGenre[0] : 'General',
      topGenreCount: topGenre ? topGenre[1] : 0,
      latestBook: latestBook?.title || 'No books added yet',
      mostRecentYear: mostRecentYear || '—'
    };
  }, [cartItems]);

  return (
    <div className="container py-8">
      <div className="stats-shell">
        <section className="stats-hero glass">
          <div>
            <span className="stats-eyebrow">Reading Intelligence</span>
            <h1 className="stats-title">Your reading journey, distilled.</h1>
            <p className="stats-subtitle">
              Track the books you care about, discover your favorite genres, and keep your list feeling curated and intentional.
            </p>
          </div>
          <div className="stats-badge">
            <Sparkles size={16} style={{ marginRight: '0.4rem' }} />
            Premium overview
          </div>
        </section>

        {cartItems.length === 0 ? (
          <div className="empty-state glass">
            <BookMarked size={28} style={{ marginBottom: '0.75rem' }} />
            <h2 style={{ marginBottom: '0.5rem' }}>Your stats are ready once you add books</h2>
            <p>Start building your reading list to unlock your personalized dashboard.</p>
            <Link to="/browse" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Explore books
            </Link>
          </div>
        ) : (
          <>
            <div className="stats-grid-cards">
              <div className="stat-card">
                <div className="stat-label">Total books</div>
                <div className="stat-value">{summary.totalBooks}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Genres explored</div>
                <div className="stat-value">{summary.genres}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Favorite genre</div>
                <div className="stat-value">{summary.topGenre}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Latest milestone</div>
                <div className="stat-value">{summary.mostRecentYear}</div>
              </div>
            </div>

            <section className="stats-panel glass">
              <div className="flex items-center" style={{ gap: '0.75rem', marginBottom: '0.5rem' }}>
                <BookOpenText size={20} color="var(--accent-blue)" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Snapshot</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                You are currently curating <strong>{summary.totalBooks}</strong> books, with the strongest pull toward <strong>{summary.topGenre}</strong> ({summary.topGenreCount} titles). The most recent standout on your list is <strong>{summary.latestBook}</strong>.
              </p>
            </section>

            <section className="stats-panel glass">
              <div className="flex items-center" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Layers3 size={20} color="var(--accent-purple)" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Genre mix</h2>
              </div>
              <div className="genre-list">
                {Object.entries(cartItems.reduce((acc, item) => {
                  const genre = item.genre || 'General';
                  acc[genre] = (acc[genre] || 0) + 1;
                  return acc;
                }, {})).map(([genre, count]) => (
                  <span key={genre} className="genre-pill">
                    {genre} · {count}
                  </span>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Stats;
