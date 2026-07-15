const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'bookwormd.sqlite');

if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(err.message);
        return;
    }
    
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        
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

        db.run(`CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            content TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(userId) REFERENCES users(id)
        )`);

        const books = [
            ["google-1", "Clean Code", "Robert C. Martin", "https://covers.openlibrary.org/b/id/8536128-L.jpg", "Computer Science", 2008, "A Handbook of Agile Software Craftsmanship.", 464, "9780132350884", "Prentice Hall", "eng", 4.2, 1250],
            ["google-2", "Dune", "Frank Herbert", "https://covers.openlibrary.org/b/id/13247076-L.jpg", "Sci-Fi", 1965, "A sprawling epic of interstellar politics and ecology on the desert planet Arrakis.", 688, "9780441013593", "Ace Books", "eng", 4.5, 8420],
            ["google-3", "1984", "George Orwell", "https://covers.openlibrary.org/b/id/12693836-L.jpg", "Classics", 1949, "A dystopian social science fiction novel.", 328, "9780451524935", "Signet Classic", "eng", 4.4, 12500]
        ];

        const stmt = db.prepare("INSERT INTO books (id, title, author, coverImage, genre, publicationYear, description, pageCount, isbn, publisher, language, ratingsAverage, ratingsCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        for (const book of books) {
            stmt.run(...book);
        }
        stmt.finalize();

        const pwd = bcrypt.hashSync('test1234', 8);
        db.run("INSERT INTO users (username, email, password) VALUES ('demo_user', 'demo@bookwormd.com', ?)", [pwd], function() {
            const userId = this.lastID;
            db.run("INSERT INTO reviews (userId, bookId, rating, content) VALUES (?, 'google-1', 5, 'An absolute must-read for any software engineer. It completely changed how I approach writing code.')", [userId]);
            db.run("INSERT INTO reviews (userId, bookId, rating, content) VALUES (?, 'google-2', 4, 'The world-building is unparalleled, though the pacing can be slow at times. Truly an epic masterpiece.')", [userId]);
            db.run("INSERT INTO reviews (userId, bookId, rating, content) VALUES (?, 'google-3', 5, 'Chillingly prescient. A classic that remains terrifyingly relevant today.')", [userId]);
            db.run("INSERT INTO posts (userId, content) VALUES (?, 'Just finished reading Clean Code — every developer should read this! The chapter on meaningful names alone is worth the price. 📚')", [userId]);
            db.run("INSERT INTO posts (userId, content) VALUES (?, 'Looking for sci-fi recommendations similar to Dune. Any suggestions? 🚀')", [userId]);
        });
    });
});

setTimeout(() => {
    console.log("Database seeded successfully!");
    process.exit(0);
}, 2000);
