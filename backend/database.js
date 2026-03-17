const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');

// On Vercel, we must use /tmp for writable files
const dbPath = process.env.VERCEL 
    ? path.join(os.tmpdir(), 'crownmarket.db') 
    : path.resolve(__dirname, 'crownmarket.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`);

        // Products Table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            image TEXT
        )`);

        // Orders Table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total_price REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);

        // Seed Products if empty
        db.get(`SELECT COUNT(*) as count FROM products`, (err, row) => {
            if (!err && row.count === 0) {
                const stmt = db.prepare(`INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)`);
                stmt.run('Crown Royal Watch', 'Premium luxury timepiece with automatic movement and sapphire crystal glass.', 299.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400');
                stmt.run('Diamond Minimalist Ring', 'Elegant everyday ring crafted from 18k solid gold with a conflict-free diamond.', 149.99, 'https://images.unsplash.com/photo-1605100804763-247f6612d540?auto=format&fit=crop&q=80&w=400');
                stmt.run('Leather Crossbody Bag', 'Genuine handcrafted leather bag with spacious compartments and brass fittings.', 129.99, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=400');
                stmt.run('Classic Aviator Sunglasses', 'Polarized UV protection sunglasses with a lightweight titanium frame.', 89.99, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=400');
                stmt.finalize();
                console.log('Seeded initial products');
            }
        });
    });
}

module.exports = db;
