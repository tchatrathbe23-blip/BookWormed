import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.2, delayChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <div className="container text-center">
      <motion.div 
        className="hero-section"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 className="hero-title" variants={itemVariants}>
          Welcome to <span className="text-gradient">BookWormed</span>
        </motion.h1>
        
        <motion.p className="hero-subtitle" variants={itemVariants}>
          Your Social Reading Platform<br/><br/>
          Powered by the Google Books API. Access millions of titles instantly. Discover books, share reviews, connect with fellow readers, and track your reading journey—all in one place.
        </motion.p>
        
        <motion.div className="hero-actions" variants={itemVariants}>
          <Link to="/browse" className="btn btn-primary">
            Start Exploring
          </Link>
          <a href="#learn-more" className="btn btn-outline">
            Learn More
          </a>
        </motion.div>

        <motion.div className="stats-grid" variants={itemVariants}>
          <div className="stat-item">
            <span className="stat-value">7M+</span>
            <span className="stat-label">Books (Open Library)</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">Real-Time</span>
            <span className="stat-label">Community Reviews</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">100%</span>
            <span className="stat-label">Free Access</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">Secure</span>
            <span className="stat-label">JWT Auth</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Learn More Section */}
      <div id="learn-more" className="py-8 text-left mt-8 mb-16 max-w-4xl mx-auto border-t border-[#2D3748] pt-16">
        <h2 className="text-3xl font-bold mb-8 text-center">How BookWormed Works</h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'}}>
          <motion.div whileHover={{ scale: 1.05 }} className="glass p-6 rounded-xl">
            <h3 className="font-bold text-xl mb-2" style={{color: 'var(--accent-blue)'}}>1. Global Catalog</h3>
            <p className="text-gray-400" style={{fontSize: '0.9rem'}}>By integrating the live Open Library API — one of the world's largest open-access book databases — you have access to over 7 million titles. Search by title, author, or keyword to instantly find your next read, completely free.</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="glass p-6 rounded-xl">
            <h3 className="font-bold text-xl mb-2" style={{color: 'var(--accent-purple)'}}>2. Active Community</h3>
            <p className="text-gray-400" style={{fontSize: '0.9rem'}}>We cache your selections into our lightning-fast backend so you can leave detailed reviews and ratings. See what other readers think before you commit.</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="glass p-6 rounded-xl">
            <h3 className="font-bold text-xl mb-2" style={{color: 'var(--accent-blue)'}}>3. Secure Platform</h3>
            <p className="text-gray-400" style={{fontSize: '0.9rem'}}>Your data is safe. We use industry-standard JWT authentication and bcrypt password hashing to ensure your privacy and security are paramount.</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="glass p-6 rounded-xl">
            <h3 className="font-bold text-xl mb-2" style={{color: 'var(--accent-purple)'}}>4. Personalized Feed</h3>
            <p className="text-gray-400" style={{fontSize: '0.9rem'}}>The interactive Feed pulls the latest reviews from the community in real-time, helping you discover hidden gems and trending masterpieces.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
