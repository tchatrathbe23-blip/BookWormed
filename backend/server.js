require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'supersecret_bookwormd_key_123';

// ─── Search Cache (10-minute TTL) ─────────────────────────────────────────────
const SEARCH_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const searchCache = new Map();

function getCachedSearch(key) {
    const entry = searchCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > SEARCH_CACHE_TTL) {
        searchCache.delete(key);
        return null;
    }
    return entry.data;
}

function setCachedSearch(key, data) {
    // Evict old entries if cache grows too large (max 200 queries)
    if (searchCache.size > 200) {
        const oldestKey = searchCache.keys().next().value;
        searchCache.delete(oldestKey);
    }
    searchCache.set(key, { data, timestamp: Date.now() });
}

// ─── Book Detail Cache (in-memory, 10-min TTL) ───────────────────────────────
const detailCache = new Map();

function getCachedDetail(key) {
    const entry = detailCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > SEARCH_CACHE_TTL) {
        detailCache.delete(key);
        return null;
    }
    return entry.data;
}

function setCachedDetail(key, data) {
    if (detailCache.size > 500) {
        const oldestKey = detailCache.keys().next().value;
        detailCache.delete(oldestKey);
    }
    detailCache.set(key, { data, timestamp: Date.now() });
}

// ─── Auth Routes ──────────────────────────────────────────────────────────────
app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'All fields are required' });
    
    const hashedPassword = bcrypt.hashSync(password, 8);
    db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`, 
        [username, email, hashedPassword], 
        function(err) {
            if (err) return res.status(400).json({ error: 'Username or email already exists' });
            const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ token, user: { id: this.lastID, username, email } });
        }
    );
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ? OR username = ?`, [email, email], (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Invalid email or password' });
        if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid email or password' });
        
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    });
});

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Failed to authenticate token' });
        req.userId = decoded.id;
        req.username = decoded.username;
        next();
    });
};

// ─── Helper: Save book to DB (upsert) ────────────────────────────────────────
function saveBookToDB(book) {
    db.run(
        `INSERT OR REPLACE INTO books (id, title, author, coverImage, genre, publicationYear, description, pageCount, isbn, publisher, language, ratingsAverage, ratingsCount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [book.id, book.title, book.author, book.coverImage, book.genre, book.publicationYear, book.description,
         book.pageCount || null, book.isbn || null, book.publisher || null, book.language || null,
         book.ratingsAverage || null, book.ratingsCount || null]
    );
}

// ─── Books API (Open Library, with caching) ──────────────────────────────────
app.get('/api/books', async (req, res) => {
    const search = req.query.search || 'programming';
    const cacheKey = search.trim().toLowerCase();

    // Check cache first
    const cached = getCachedSearch(cacheKey);
    if (cached) {
        console.log(`[CACHE HIT] Search: "${cacheKey}"`);
        return res.json(cached);
    }

    console.log(`[CACHE MISS] Fetching from Open Library: "${cacheKey}"`);
    try {
        const response = await fetch(
            `https://openlibrary.org/search.json?q=${encodeURIComponent(search)}&limit=30&fields=key,title,author_name,cover_i,subject,first_publish_year,first_sentence,number_of_pages_median,isbn,publisher,language,ratings_average,ratings_count,edition_count`
        );
        const data = await response.json();

        if (!data.docs || data.docs.length === 0) {
            setCachedSearch(cacheKey, []);
            return res.json([]);
        }

        const books = data.docs.map(doc => {
            const book = {
                id: doc.key.replace('/works/', ''),
                title: doc.title || 'Unknown Title',
                author: doc.author_name ? doc.author_name.slice(0, 2).join(', ') : 'Unknown Author',
                coverImage: doc.cover_i
                    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                    : null,
                genre: doc.subject ? doc.subject[0] : 'General',
                publicationYear: doc.first_publish_year || null,
                description: doc.first_sentence ? (Array.isArray(doc.first_sentence) ? doc.first_sentence[0] : doc.first_sentence) : 'No description available.',
                pageCount: doc.number_of_pages_median || null,
                isbn: doc.isbn ? doc.isbn[0] : null,
                publisher: doc.publisher ? doc.publisher[0] : null,
                language: doc.language ? doc.language[0] : null,
                ratingsAverage: doc.ratings_average ? Math.round(doc.ratings_average * 10) / 10 : null,
                ratingsCount: doc.ratings_count || null,
                editionCount: doc.edition_count || null
            };

            // Save to DB so add-to-list works (fixes FK constraint issue)
            saveBookToDB(book);

            return book;
        });

        setCachedSearch(cacheKey, books);
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/books/:id', async (req, res) => {
    const bookId = req.params.id;

    // Check in-memory detail cache
    const memCached = getCachedDetail(bookId);
    if (memCached) {
        console.log(`[DETAIL CACHE HIT] Book: ${bookId}`);
        return res.json(memCached);
    }

    try {
        // Check SQLite cache
        db.get('SELECT * FROM books WHERE id = ?', [bookId], async (err, cached) => {
            if (cached) {
                console.log(`[DB CACHE HIT] Book: ${bookId}`);
                setCachedDetail(bookId, cached);
                return res.json(cached);
            }

            // Fetch from Open Library Works API
            const [workRes, descRes] = await Promise.all([
                fetch(`https://openlibrary.org/works/${bookId}.json`),
                fetch(`https://openlibrary.org/works/${bookId}/editions.json?limit=1`)
            ]);

            if (!workRes.ok) return res.status(404).json({ error: 'Book not found' });

            const work = await workRes.json();

            // Get cover ID
            const coverId = work.covers && work.covers.length > 0 ? work.covers[0] : null;

            // Get description
            let description = 'No description available.';
            if (work.description) {
                description = typeof work.description === 'string'
                    ? work.description
                    : work.description.value || description;
            }

            // Get author name
            let authorName = 'Unknown Author';
            if (work.authors && work.authors.length > 0) {
                try {
                    const authorId = work.authors[0].author.key;
                    const authorRes = await fetch(`https://openlibrary.org${authorId}.json`);
                    if (authorRes.ok) {
                        const authorData = await authorRes.json();
                        authorName = authorData.name || 'Unknown Author';
                    }
                } catch (e) { /* ignore */ }
            }

            // Get edition info for extra fields
            let pageCount = null, isbn = null, publisher = null, language = null;
            try {
                if (descRes.ok) {
                    const editionData = await descRes.json();
                    if (editionData.entries && editionData.entries.length > 0) {
                        const edition = editionData.entries[0];
                        pageCount = edition.number_of_pages || null;
                        isbn = edition.isbn_13 ? edition.isbn_13[0] : (edition.isbn_10 ? edition.isbn_10[0] : null);
                        publisher = edition.publishers ? edition.publishers[0] : null;
                        language = edition.languages ? edition.languages[0]?.key?.replace('/languages/', '') : null;
                    }
                }
            } catch (e) { /* ignore */ }

            const book = {
                id: bookId,
                title: work.title || 'Unknown Title',
                author: authorName,
                coverImage: coverId
                    ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
                    : null,
                genre: work.subjects ? work.subjects[0] : 'General',
                publicationYear: work.first_publish_date
                    ? parseInt(work.first_publish_date)
                    : null,
                description,
                pageCount,
                isbn,
                publisher,
                language,
                ratingsAverage: null,
                ratingsCount: null
            };

            // Cache in memory and DB
            setCachedDetail(bookId, book);
            saveBookToDB(book);

            res.json(book);
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── Reading List (Cart) API ─────────────────────────────────────────────────
app.get('/api/list', authenticate, (req, res) => {
    db.all(`
        SELECT l.*, b.title, b.author, b.coverImage, b.genre, b.publicationYear, b.description
        FROM lists l
        JOIN books b ON l.bookId = b.id
        WHERE l.userId = ?
        ORDER BY l.id DESC
    `, [req.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/list', authenticate, (req, res) => {
    const { bookId, listType = 'want_to_read' } = req.body;
    if (!bookId) return res.status(400).json({ error: 'bookId is required' });
    db.run(`INSERT OR IGNORE INTO lists (userId, bookId, listType) VALUES (?, ?, ?)`,
        [req.userId, bookId, listType],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, userId: req.userId, bookId, listType });
        }
    );
});

app.delete('/api/list/:bookId', authenticate, (req, res) => {
    db.run(`DELETE FROM lists WHERE userId = ? AND bookId = ?`,
        [req.userId, req.params.bookId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ removed: this.changes > 0 });
        }
    );
});

// ─── Posts API (standalone user posts) ───────────────────────────────────────
app.post('/api/posts', authenticate, (req, res) => {
    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Post content is required' });
    db.run(`INSERT INTO posts (userId, content) VALUES (?, ?)`,
        [req.userId, content.trim()],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({
                id: this.lastID,
                userId: req.userId,
                username: req.username,
                content: content.trim(),
                createdAt: new Date().toISOString(),
                type: 'post'
            });
        }
    );
});

// ─── Reviews & Feed API ─────────────────────────────────────────────────────
app.get('/api/books/:bookId/reviews', (req, res) => {
    db.all(`
        SELECT r.*, u.username 
        FROM reviews r 
        JOIN users u ON r.userId = u.id 
        WHERE r.bookId = ?
        ORDER BY r.createdAt DESC
    `, [req.params.bookId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/books/:bookId/reviews', authenticate, (req, res) => {
    const { rating, content } = req.body;
    db.run(`INSERT INTO reviews (userId, bookId, rating, content) VALUES (?, ?, ?, ?)`,
        [req.userId, req.params.bookId, rating, content],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, userId: req.userId, username: req.username, bookId: req.params.bookId, rating, content, createdAt: new Date() });
        }
    );
});

// Combined feed: reviews + standalone posts, sorted by date
app.get('/api/feed', (req, res) => {
    // Get reviews
    const reviewsQuery = `
        SELECT r.id, r.userId, r.rating, r.content, r.createdAt, 
               u.username, b.title as bookTitle, b.author as bookAuthor, b.coverImage,
               'review' as type
        FROM reviews r
        JOIN users u ON r.userId = u.id
        JOIN books b ON r.bookId = b.id
    `;

    // Get posts
    const postsQuery = `
        SELECT p.id, p.userId, NULL as rating, p.content, p.createdAt, 
               u.username, NULL as bookTitle, NULL as bookAuthor, NULL as coverImage,
               'post' as type
        FROM posts p
        JOIN users u ON p.userId = u.id
    `;

    // Union and sort
    const combinedQuery = `
        SELECT * FROM (${reviewsQuery} UNION ALL ${postsQuery})
        ORDER BY createdAt DESC
        LIMIT 30
    `;

    db.all(combinedQuery, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
