import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { API_BASE } from '../utils/apiBase';
import toast from 'react-hot-toast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchCart = useCallback(async () => {
    if (!user) { setCartItems([]); return; }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/api/list`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setCartItems(await res.json());
    } catch (e) { console.error(e); }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (book) => {
    if (!user) { toast.error('Log in to save books!'); return; }
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookId: book.id })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await fetchCart();
      toast.success(`"${book.title}" added to your list!`, { icon: '📚' });
    } catch (e) {
      toast.error(e.message || 'Already in your list!');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (bookId) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE}/api/list/${bookId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setCartItems(prev => prev.filter(i => i.bookId !== bookId));
      toast.success('Removed from list');
    } catch (e) { toast.error('Failed to remove'); }
  };

  const isInCart = (bookId) => cartItems.some(i => i.bookId === bookId);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, isInCart, fetchCart, loading }}>
      {children}
    </CartContext.Provider>
  );
};
