const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');

const app = express();
const JWT_SECRET = 'super_secret_crownmarket_key';

app.use(cors());
app.use(bodyParser.json());

// Fallback Data for Mobile/Production Stability
const fallbackProducts = [
    {
        id: 1,
        name: 'Crown Royal Watch',
        description: 'Premium luxury timepiece with automatic movement.',
        price: 299.99,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 2,
        name: 'Diamond Minimalist Ring',
        description: 'Elegant everyday ring crafted from 18k solid gold.',
        price: 149.99,
        image: 'https://images.unsplash.com/photo-1605100804763-247f6612d540?auto=format&fit=crop&q=80&w=400'
    },
    {
        id: 3,
        name: 'Leather Crossbody Bag',
        description: 'Handcrafted leather bag with spacious compartments.',
        price: 129.99,
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=400'
    }
];

// Database Setup
const dbPath = path.join(os.tmpdir(), 'crownmarket.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    try {
        db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT UNIQUE, password TEXT)`);
        db.run(`CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, price REAL, image TEXT)`);
        
        db.get(`SELECT COUNT(*) as count FROM products`, (err, row) => {
            if (!err && row && row.count === 0) {
                const stmt = db.prepare(`INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)`);
                fallbackProducts.forEach(p => stmt.run(p.name, p.description, p.price, p.image));
                stmt.finalize();
            }
        });
    } catch (e) { console.error("DB Init Error:", e); }
});

// Products API with Safety Fallback
app.get('/api/products', (req, res) => {
    try {
        db.all(`SELECT * FROM products`, [], (err, rows) => {
            if (err || !rows || rows.length === 0) {
                return res.json(fallbackProducts);
            }
            res.json(rows);
        });
    } catch (e) {
        res.json(fallbackProducts);
    }
});

// Auth Routes (Login)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    try {
        db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
            if (err || !user) return res.status(401).json({ error: 'User not found' });
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (!isMatch) return res.status(401).json({ error: 'Invalid password' });
                const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET);
                res.json({ token, user: { id: user.id, name: user.name } });
            });
        });
    } catch (e) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = app;
