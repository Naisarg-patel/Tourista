const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User'); // ✅ VERY IMPORTANT

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("DB error:", err));

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ error: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        
        res.status(201).json({ message: 'User created successfully', userId: newUser._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'All fields are required' });
    
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Invalid email or password' });
        
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, favorites: user.favorites } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- User Profile Endpoints ---

// Get Profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ data: user });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Add/Remove Favorites
app.post('/api/users/favorites', authenticateToken, async (req, res) => {
    const { placeId } = req.body;
    if (!placeId) return res.status(400).json({ error: 'Place ID is required' });
    
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        if (user.favorites.includes(placeId)) {
            user.favorites = user.favorites.filter(id => id !== placeId);
        } else {
            user.favorites.push(placeId);
        }
        
        await user.save();
        res.json({ message: 'Favorites updated', favorites: user.favorites });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
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

// Geocoding proxy for OpenStreetMap Nominatim
app.get('/api/geocode', async (req, res) => {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'Query parameter q is required' });

    try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
        const geoRes = await fetch(nominatimUrl, {
            headers: { 'User-Agent': 'Tourista/1.0 (+http://localhost:3000; tourista-app)' }
        });

        if (!geoRes.ok) {
            const text = await geoRes.text().catch(() => '');
            return res.status(502).json({ error: 'Geocode upstream error', details: text });
        }

        const geoData = await geoRes.json();
        res.json(geoData);
    } catch (err) {
        console.error('Geocode proxy error', err);
        res.status(502).json({ error: 'Geocode fetch failed' });
    }
});

app.get('/api/reverse', async (req, res) => {
    const { lat, lon, zoom = 10 } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });

    try {
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=${encodeURIComponent(zoom)}`;
        const revRes = await fetch(nominatimUrl, {
            headers: { 'User-Agent': 'Tourista/1.0 (+http://localhost:3000; tourista-app)' }
        });

        if (!revRes.ok) {
            const text = await revRes.text().catch(() => '');
            return res.status(502).json({ error: 'Reverse geocode upstream error', details: text });
        }

        const revData = await revRes.json();
        res.json(revData);
    } catch (err) {
        console.error('Reverse geocode proxy error', err);
        res.status(502).json({ error: 'Reverse geocode fetch failed' });
    }
});

// ─── Overpass: in-memory result cache (5-minute TTL) ───────────────────────
const overpassCache = new Map();
const OVERPASS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function overpassCacheGet(key) {
    const entry = overpassCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > OVERPASS_CACHE_TTL) { overpassCache.delete(key); return null; }
    return entry.data;
}
function overpassCacheSet(key, data) {
    overpassCache.set(key, { data, ts: Date.now() });
}

// ─── Overpass: race all mirrors in parallel ──────────────────────────────────
const OVERPASS_ENDPOINTS = [
    'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
    // overpass.osm.ch removed — returns broken responses (timestamp "113539", 0 elements)
];

async function fetchOneOverpass(endpoint, query, timeoutMs) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const r = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'User-Agent': 'Tourista/1.0 (tourista-app)',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: 'data=' + encodeURIComponent(query),  // standard Overpass POST format
            signal: ctrl.signal
        });
        clearTimeout(timer);
        if (!r.ok) throw new Error(`HTTP ${r.status} from ${endpoint}`);

        // Read as text first — Overpass can return HTTP 200 with XML errors
        const text = await r.text();
        const trimmed = text.trimStart();

        // If response starts with '<' it's XML (error page), not JSON
        if (trimmed.startsWith('<')) {
            throw new Error(`XML response from ${endpoint} (likely rate-limited or error page)`);
        }

        // Guard: empty / whitespace response
        if (!trimmed) throw new Error(`Empty response from ${endpoint}`);

        const data = JSON.parse(text);

        // Validate: reject mirrors with broken/stale DB (bad timestamp like "113539")
        const ts = data.osm3s && data.osm3s.timestamp_osm_base;
        if (ts && !/^\d{4}-\d{2}/.test(ts)) {
            throw new Error(`Broken mirror ${endpoint} — invalid timestamp: ${ts}`);
        }

        return data;
    } catch (err) {
        clearTimeout(timer);
        throw err;
    }
}


// Overpass proxy – races all mirrors; returns first successful response
app.post('/api/overpass', express.json(), async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    console.log(`[Overpass] Query preview: ${query.replace(/\s+/g,' ').slice(0, 200)}`);

    // Serve from cache if available
    const cached = overpassCacheGet(query);
    if (cached) {
        console.log(`[Overpass] Cache hit — ${cached.elements ? cached.elements.length : 0} elements`);
        return res.json(cached);
    }

    // Race all mirrors – first to succeed wins
    const PER_MIRROR_TIMEOUT = 10000; // 10 s each
    const promises = OVERPASS_ENDPOINTS.map(ep =>
        fetchOneOverpass(ep, query, PER_MIRROR_TIMEOUT)
            .then(data => ({ ep, data }))
    );

    try {
        const { ep, data } = await Promise.any(promises);
        const count = data.elements ? data.elements.length : 0;
        console.log(`[Overpass] Success from ${ep} — ${count} elements`);
        // Only cache non-empty responses
        if (count > 0) overpassCacheSet(query, data);
        return res.json(data);
    } catch (aggErr) {
        // Promise.any rejects with AggregateError when ALL promises fail
        const details = aggErr.errors ? aggErr.errors.map(e => e.message).join(' | ') : String(aggErr);
        console.error('[Overpass] All mirrors failed:', details);
        // Returning 200 OK with an error payload to prevent red console errors in browser
        return res.json({ error: 'All Overpass mirrors failed or timed out', details });
    }
});

// Health check for Overpass mirrors
app.get('/api/overpass/health', async (req, res) => {
    const testQuery = '[out:json][timeout:5];node["amenity"="bench"](around:100,51.5,0.0);out 1;';
    const results = await Promise.allSettled(
        OVERPASS_ENDPOINTS.map(ep =>
            fetchOneOverpass(ep, testQuery, 6000).then(() => ({ ep, ok: true })).catch(e => ({ ep, ok: false, err: e.message }))
        )
    );
    res.json(results.map(r => r.value || r.reason));
});

// ─── Geo Fallback (Wikipedia + Nominatim) ────────────────────────────────────
// Used when Overpass mirrors are down. Returns basic fallback data.
const fallbackCache = new Map();

app.get('/api/nearby-places', async (req, res) => {
    const { lat, lon, category = 'attraction' } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });

    const cacheKey = `${parseFloat(lat).toFixed(3)},${parseFloat(lon).toFixed(3)}-${category}`;
    const cached = fallbackCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < 10 * 60 * 1000) {
        console.log('[Fallback] Cache hit for', cacheKey);
        return res.json(cached.data);
    }

    try {
        let elements = [];
        const isAttraction = ['all', 'attraction', 'historical', 'museum'].includes(category);
        
        if (isAttraction) {
            // Wikipedia GeoSearch for notable landmarks
            const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lon}&gsradius=10000&gslimit=30&format=json&origin=*`;
            const r = await fetch(wikiUrl, { headers: { 'User-Agent': 'Tourista/1.0' }, signal: AbortSignal.timeout(8000) });
            if (r.ok) {
                const data = await r.json();
                const places = (data.query && data.query.geosearch) || [];
                elements = places.map(p => ({
                    type: 'node', id: p.pageid, lat: p.lat, lon: p.lon,
                    tags: { name: p.title, tourism: 'attraction', wikipedia: `en:${p.title}`, description: 'From Wikipedia GeoSearch' }
                }));
            }
        } else {
            // Nominatim Free Text Search for generic businesses (cafe, mall, restaurant)
            const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(category)}+near+${lat},${lon}&format=json&limit=25`;
            const r = await fetch(nomUrl, { headers: { 'User-Agent': 'Tourista/1.0' }, signal: AbortSignal.timeout(8000) });
            if (r.ok) {
                const data = await r.json();
                elements = data.map(p => ({
                    type: p.osm_type || 'node', id: p.osm_id || Math.floor(Math.random()*100000), 
                    lat: parseFloat(p.lat), lon: parseFloat(p.lon),
                    tags: { name: p.name || p.display_name.split(',')[0], [category]: 'yes', description: 'From Nominatim Map Search' }
                }));
            }
        }

        console.log(`[Fallback] Returned ${elements.length} places for category: ${category}`);
        const result = { elements, source: isAttraction ? 'wikipedia' : 'nominatim' };
        if (elements.length > 0) fallbackCache.set(cacheKey, { data: result, ts: Date.now() });
        return res.json(result);
    } catch (err) {
        console.error('[Fallback] Failed:', err.message);
        return res.json({ elements: [], error: err.message }); // 200 OK so frontend doesn't print red logs
    }
});

// Default route to serve index.html


// Default API healthcheck route
app.get('/', (req, res) => {
    res.json({ status: 'Ok', message: 'Tourista Backend API is running successfully!' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
