import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE } from '../utils/apiBase';
import toast from 'react-hot-toast';

const PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='300' viewBox='0 0 200 300'%3E%3Crect width='200' height='300' fill='%231C1F2E'/%3E%3Crect x='60' y='80' width='80' height='100' rx='4' fill='%232D3748'/%3E%3Ctext x='100' y='220' text-anchor='middle' fill='%239CA3AF' font-size='12' font-family='sans-serif'%3ENo Cover%3C/text%3E%3C/svg%3E`;

const Feed = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/feed`)
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error('Failed to load feed');
      });
  }, []);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    const text = postContent.trim();
    if (!text) return;
    if (!user) { toast.error('Log in to create a post.'); return; }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create post');

      // Instant feedback — prepend the new post
      setPosts(prev => [data, ...prev]);
      setPostContent('');
      toast.success('Post published!');
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const renderFeedItem = (item) => {
    if (item.type === 'post') {
      return (
        <motion.div
          key={`post-${item.id}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="post-card"
        >
          <div className="avatar"></div>
          <div className="post-content">
            <div className="post-header">
              <span className="post-author">@{item.username}</span>
              <span className="post-meta"> · {new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="post-text">{item.content}</p>
          </div>
        </motion.div>
      );
    }

    // type === 'review' (or default)
    return (
      <motion.div
        key={`review-${item.id}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="post-card"
      >
        <img
          src={item.coverImage || PLACEHOLDER}
          alt={item.bookTitle}
          className="post-cover"
          onError={(e) => { if (e.target.src !== PLACEHOLDER) e.target.src = PLACEHOLDER; }}
        />
        <div className="post-content">
          <div className="post-header">
            <span className="post-author">@{item.username}</span>
            <span className="post-meta">reviewed · {new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
          <h3 className="post-book-title">{item.bookTitle}</h3>
          <p className="post-book-author">by {item.bookAuthor}</p>
          <div className="book-rating mb-2">
            {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)} <span>({item.rating}/5)</span>
          </div>
          <p className="post-text">{item.content}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="container py-8 animate-fade-up feed-container">
      <div className="page-header">
        <h1 className="page-title">Posts & Reviews</h1>
        <p className="page-subtitle">Share your thoughts and see what your friends are reading</p>
      </div>

      {/* Create Post */}
      {user ? (
        <form onSubmit={handlePostSubmit} className="create-post glass" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <div className="avatar" style={{ flexShrink: 0, marginTop: '4px' }}></div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's on your mind? Share a thought, recommendation, or reading update..."
              className="input-dark"
              rows="2"
              style={{ resize: 'vertical', minHeight: '44px', width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !postContent.trim()}
                style={{
                  padding: '0.45rem 1.25rem', fontSize: '0.8rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '6px',
                  opacity: (!postContent.trim() || submitting) ? 0.5 : 1,
                }}
              >
                {submitting ? (
                  <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Posting...</>
                ) : (
                  <><Send size={14} /> Post</>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="create-post glass" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="avatar" style={{ flexShrink: 0 }}></div>
          <input
            type="text"
            placeholder="Log in to create a post..."
            className="input-dark"
            disabled
            style={{ flex: 1, opacity: 0.5, cursor: 'not-allowed' }}
          />
        </div>
      )}

      <h2 className="mb-4 flex items-center" style={{ fontSize: '1.25rem', fontWeight: 'bold', gap: '0.5rem' }}>
        <span>📚</span> Recent Activity
      </h2>

      {loading ? (
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Loading feed...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 glass" style={{ borderRadius: '12px', color: 'var(--text-muted)' }}>No recent posts to show.</div>
      ) : (
        <AnimatePresence>
          <div className="post-list">
            {posts.map(item => renderFeedItem(item))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Feed;
