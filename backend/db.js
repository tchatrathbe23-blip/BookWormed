const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'bookwormd.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                email TEXT UNIQUE,
                password TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            
            // We use TEXT for id to support Open Library string IDs natively
            db.run(`CREATE TABLE IF NOT EXISTS books (
                id TEXT PRIMARY KEY,
                title TEXT,
                author TEXT,
                coverImage TEXT,
                genre TEXT,
                publicationYear INTEGER,
                description TEXT,
                pageCount INTEGER,
                isbn TEXT,
                publisher TEXT,
                language TEXT,
                ratingsAverage REAL,
                ratingsCount INTEGER
            )`);
            
            db.run(`CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                bookId TEXT,
                rating INTEGER,
                content TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(userId) REFERENCES users(id),
                FOREIGN KEY(bookId) REFERENCES books(id)
            )`);
            
            db.run(`CREATE TABLE IF NOT EXISTS lists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                bookId TEXT,
                listType TEXT,
                FOREIGN KEY(userId) REFERENCES users(id),
                FOREIGN KEY(bookId) REFERENCES books(id)
            )`);

            // Posts table for standalone user posts
            db.run(`CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                content TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(userId) REFERENCES users(id)
            )`);

            // Migrate existing books table: add new columns if they don't exist
            // SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we catch errors
            const newColumns = [
                ['pageCount', 'INTEGER'],
                ['isbn', 'TEXT'],
                ['publisher', 'TEXT'],
                ['language', 'TEXT'],
                ['ratingsAverage', 'REAL'],
                ['ratingsCount', 'INTEGER']
            ];

            for (const [col, type] of newColumns) {
                db.run(`ALTER TABLE books ADD COLUMN ${col} ${type}`, (err) => {
                    // Ignore "duplicate column" errors — column already exists
                    if (err && !err.message.includes('duplicate column')) {
                        console.error(`Error adding column ${col}:`, err.message);
                    }
                });
            }
        });
    }
});

module.exports = db;
