const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/'))); // Serve static files from root

// --- API Endpoints ---

// Get all cities
app.get('/api/cities', (req, res) => {
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
app.get('/api/trips', (req, res) => {
    db.all("SELECT * FROM trips ORDER BY created_at DESC", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// Get a single trip by ID
app.get('/api/trips/:id', (req, res) => {
    db.get("SELECT * FROM trips WHERE id = ?", [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: "Trip not found" });
            return;
        }
        res.json({ data: row });
    });
});

// DELETE Trip
app.delete('/api/trips/:id', (req, res) => {
    db.run('DELETE FROM trips WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Deleted successfully', changes: this.changes });
    });
});

// UPDATE Trip (Specific fields, like Day-by-day Itinerary)
app.put('/api/trips/:id', (req, res) => {
    const { id } = req.params;
    const { itinerary } = req.body;

    // We can add a dynamic update here, but for now we solely need itinerary notes
    const sql = `UPDATE trips SET itinerary = ? WHERE id = ?`;

    db.run(sql, [itinerary, id], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to update trip notes' });
        }
        res.json({ message: 'Trip notes updated successfully', changes: this.changes });
    });
});

// Save a new trip
app.post('/api/trips', (req, res) => {
    const { title, details, cost, itinerary, route_data, map_image } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    // Ensure the trips table exists with the new columns
    db.run(`
        CREATE TABLE IF NOT EXISTS trips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            details TEXT,
            cost TEXT,
            itinerary TEXT,
            route_data TEXT,
            map_image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error("Error creating trips table:", err.message);
            return res.status(500).json({ error: "Failed to initialize trips table" });
        }

        db.run(
            'INSERT INTO trips (title, details, cost, itinerary, route_data, map_image) VALUES (?, ?, ?, ?, ?, ?)',
            [title, details, cost, itinerary, route_data, map_image],
            function (err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({
                    message: "Trip saved successfully",
                    data: { id: this.lastID, title, details, cost, itinerary, route_data, map_image }
                });
            }
        );
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
