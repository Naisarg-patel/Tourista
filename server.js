const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/'))); // Serve static files from root

const JWT_SECRET = process.env.JWT_SECRET || 'tourista-super-secret-key-2026';

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token.' });
        req.user = user;
        next();
    });
};

// --- API Endpoints ---

// --- Auth Endpoints ---

// Register / Signup
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ error: 'Email already exists' });
                }
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'User created successfully', userId: this.lastID });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'All fields are required' });
    
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Invalid email or password' });
        
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, favorites: user.favorites } });
    });
});

// --- User Profile Endpoints ---

// Get Profile
app.get('/api/users/profile', authenticateToken, (req, res) => {
    db.get('SELECT id, name, email, favorites, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ data: user });
    });
});

// Add/Remove Favorites
app.post('/api/users/favorites', authenticateToken, (req, res) => {
    const { placeId } = req.body;
    if (!placeId) return res.status(400).json({ error: 'Place ID is required' });
    
    db.get('SELECT favorites FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err || !user) return res.status(500).json({ error: 'Database error' });
        let favorites = [];
        try { favorites = JSON.parse(user.favorites || '[]'); } catch(e) {}
        
        if (favorites.includes(placeId)) {
            favorites = favorites.filter(id => id !== placeId);
        } else {
            favorites.push(placeId);
        }
        
        db.run('UPDATE users SET favorites = ? WHERE id = ?', [JSON.stringify(favorites), req.user.id], function(err) {
            if (err) return res.status(500).json({ error: 'Failed to update favorites' });
            res.json({ message: 'Favorites updated', favorites });
        });
    });
});

// --- Existing Endpoints ---

// Get all cities
app.get('/api/cities', authenticateToken, (req, res) => {
    db.all("SELECT * FROM cities", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// Get all events
app.get('/api/events', (req, res) => {
    db.all("SELECT * FROM events", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// Get all saved trips
app.get('/api/trips', authenticateToken, (req, res) => {
    db.all("SELECT * FROM trips WHERE userId = ? ORDER BY created_at DESC", [req.user.id], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// Get a single trip by ID
app.get('/api/trips/:id', authenticateToken, (req, res) => {
    db.get("SELECT * FROM trips WHERE id = ? AND userId = ?", [req.params.id, req.user.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: "Trip not found or access denied" });
            return;
        }
        res.json({ data: row });
    });
});

// DELETE Trip
app.delete('/api/trips/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM trips WHERE id = ? AND userId = ?', [req.params.id, req.user.id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) return res.status(404).json({ error: 'Trip not found or unauthorized' });
        res.json({ message: 'Deleted successfully', changes: this.changes });
    });
});

// UPDATE Trip (Specific fields, like Day-by-day Itinerary)
app.put('/api/trips/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { itinerary } = req.body;

    const sql = `UPDATE trips SET itinerary = ? WHERE id = ? AND userId = ?`;

    db.run(sql, [itinerary, id, req.user.id], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to update trip notes' });
        }
        if (this.changes === 0) return res.status(404).json({ error: 'Trip not found or unauthorized' });
        res.json({ message: 'Trip notes updated successfully', changes: this.changes });
    });
});

// Save a new trip
app.post('/api/trips', authenticateToken, (req, res) => {
    const { title, details, cost, itinerary, route_data, map_image } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    db.run(`
        CREATE TABLE IF NOT EXISTS trips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            title TEXT NOT NULL,
            details TEXT,
            cost TEXT,
            itinerary TEXT,
            route_data TEXT,
            map_image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(userId) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error("Error creating trips table:", err.message);
            return res.status(500).json({ error: "Failed to initialize trips table" });
        }

        db.run(
            'INSERT INTO trips (userId, title, details, cost, itinerary, route_data, map_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, title, details, cost, itinerary, route_data, map_image],
            function (err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({
                    message: "Trip saved successfully",
                    data: { id: this.lastID, userId: req.user.id, title, details, cost, itinerary, route_data, map_image }
                });
            }
        );
    });
});

// Places Endpoint
app.get('/api/places', authenticateToken, (req, res) => {
    db.all("SELECT * FROM places", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// Default route to serve index.html
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
