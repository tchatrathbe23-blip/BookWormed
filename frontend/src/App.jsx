import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Browse from './pages/Browse';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Register from './pages/Register';
import BookDetail from './pages/BookDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Stats from './pages/Stats';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
                <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                <Route path="/stats" element={<ProtectedRoute><Stats /></ProtectedRoute>} />
                <Route path="/book/:id" element={<ProtectedRoute><BookDetail /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>

          <Toaster
            position="bottom-right"
            toastOptions={{
              style: { background: '#1C1F2E', color: '#fff', border: '1px solid #2D3748' }
            }}
          />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
