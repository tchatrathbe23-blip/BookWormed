const SkeletonLoader = () => {
  return (
    <div className="book-grid">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div key={i} className="book-card" style={{animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'}}>
          <div className="book-cover" style={{backgroundColor: '#2D3748'}}></div>
          <div className="book-info">
            <div>
              <div style={{height: '1.25rem', backgroundColor: '#4A5568', borderRadius: '4px', marginBottom: '0.5rem', width: '80%'}}></div>
              <div style={{height: '1rem', backgroundColor: '#4A5568', borderRadius: '4px', width: '60%'}}></div>
            </div>
            <div className="book-rating" style={{height: '1rem', backgroundColor: '#4A5568', borderRadius: '4px', width: '40%', marginTop: '1rem'}}></div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default SkeletonLoader;
