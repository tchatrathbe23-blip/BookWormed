import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { ShoppingCart, Sun, Moon } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ThemeContext } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const cartCtx = useContext(CartContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const cartItems = cartCtx?.cartItems ?? [];

  return (
    <motion.nav 
      className="navbar glass"
      initial={{ y: -100 }}
      animate={{ 
        y: 0, 
        boxShadow: ["0px 4px 30px rgba(0,0,0,0.2)", "0px 4px 30px rgba(74, 144, 226, 0.2)", "0px 4px 30px rgba(208, 92, 227, 0.2)", "0px 4px 30px rgba(0,0,0,0.2)"] 
      }}
      transition={{ 
        y: { type: "spring", stiffness: 100, damping: 20 },
        boxShadow: { repeat: Infinity, duration: 6, ease: "easeInOut" }
      }}
    >
      <div className="container">
        <div className="flex items-center" style={{ gap: '2rem' }}>
          <Link to="/" className="nav-brand">
            <span style={{ color: 'var(--text-main)' }}>Book</span>
            <span className="text-gradient">Wormed</span>
          </Link>
          
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/browse">Books</Link>
            <Link to="/feed">Posts</Link>
            <Link to="/stats">Stats</Link>
            <Link to="/">About</Link>
          </div>
        </div>

        <div className="nav-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          {user ? (
            <>
              {/* Cart Icon */}
              <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', padding: '0.4rem' }}>
                <ShoppingCart size={20} />
                {cartItems.length > 0 && (
                  <span style={{
                    position: 'absolute', top: '-6px', right: '-6px',
                    background: 'var(--accent-blue)', color: 'white',
                    borderRadius: '50%', width: '18px', height: '18px',
                    fontSize: '0.65rem', fontWeight: '700',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)'
                  }}>
                    {cartItems.length > 9 ? '9+' : cartItems.length}
                  </span>
                )}
              </Link>
              <div className="flex items-center gap-2" style={{ gap: '0.5rem' }}>
                <div className="avatar" style={{ width: '30px', height: '30px' }}></div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Hi, @{user.username}</span>
              </div>
              <button onClick={logout} className="btn btn-outline" style={{ padding: '0.4rem 1rem' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/stats">Stats</Link>
              <Link to="/login" className="btn btn-primary">Login</Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
