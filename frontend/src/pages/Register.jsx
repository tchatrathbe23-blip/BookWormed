import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(username, email, password);
      toast.success('Account created successfully!');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <div className="auth-container animate-fade-up">
      <div className="auth-card">
        <h1 className="auth-title">Join BookWormed</h1>
        <p className="auth-subtitle">Create an account to start tracking and reviewing books</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="input-dark" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="input-dark" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="input-dark" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{marginTop: '1rem', padding: '0.75rem'}}>
            Create Account
          </button>
        </form>

        <p className="text-center mt-8" style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>
          Already have an account? <Link to="/login" style={{color: 'var(--accent-blue)'}}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
