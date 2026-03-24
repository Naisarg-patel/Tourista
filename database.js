const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'tourista.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Initialize Schema
        db.serialize(() => {
            // Cities Table
            db.run(`CREATE TABLE IF NOT EXISTS cities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                subtitle TEXT,
                image_url TEXT,
                tags TEXT
            )`);

            // Events Table
            db.run(`CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                city_id INTEGER,
                event_date TEXT,
                title TEXT,
                location TEXT,
                FOREIGN KEY(city_id) REFERENCES cities(id)
            )`);

            // Trips Table
            db.run(`CREATE TABLE IF NOT EXISTS trips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                details TEXT,
                cost TEXT,
                itinerary TEXT,
                route_data TEXT,
                map_image TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('Error creating trips table:', err.message);
                } else {
                    // Add new columns if they don't exist (for existing databases)
                    db.run(`ALTER TABLE trips ADD COLUMN userId INTEGER`, (err) => {
                        if (err && !err.message.includes('duplicate column name')) {
                            console.error('Error adding userId column:', err.message);
                        }
                    });
                    db.run(`ALTER TABLE trips ADD COLUMN itinerary TEXT`, (err) => {
                        if (err && !err.message.includes('duplicate column name')) {
                            console.error('Error adding itinerary column:', err.message);
                        }
                    });
                    db.run(`ALTER TABLE trips ADD COLUMN route_data TEXT`, (err) => {
                        if (err && !err.message.includes('duplicate column name')) {
                            console.error('Error adding route_data column:', err.message);
                        }
                    });
                    db.run(`ALTER TABLE trips ADD COLUMN map_image TEXT`, (err) => {
                        if (err && !err.message.includes('duplicate column name')) {
                            console.error('Error adding map_image column:', err.message);
                        }
                    });
                }
            });

            // Users Table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                favorites TEXT DEFAULT '[]',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Places Table
            db.run(`CREATE TABLE IF NOT EXISTS places (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT,
                rating REAL,
                latitude REAL,
                longitude REAL,
                address TEXT,
                image TEXT
            )`);

            // Reviews Table
            db.run(`CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER,
                placeId INTEGER,
                rating INTEGER,
                comment TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(userId) REFERENCES users(id),
                FOREIGN KEY(placeId) REFERENCES places(id)
            )`);

            // Check if cities are seeded
            db.get("SELECT COUNT(*) as count FROM cities", (err, row) => {
                if (err) {
                    console.error('Error counting cities', err.message);
                } else if (row.count === 0) {
                    console.log('Seeding initial data...');
                    seedData();
                }
            });
        });
    }
});

function seedData() {
    // Seed Cities
    const stmt = db.prepare(`INSERT INTO cities (name, subtitle, image_url, tags) VALUES (?, ?, ?, ?)`);
    stmt.run('Ahmedabad', 'Heritage & Modernity', 'https://images.unsplash.com/photo-1587424016739-bdabf49a8d9d?q=80&w=800&auto=format&fit=crop', 'History,Food');
    stmt.run('Gandhinagar', 'The Green Capital', 'https://images.unsplash.com/photo-1598460670397-2b7e91d84814?q=80&w=800&auto=format&fit=crop', 'Nature,Architecture');
    stmt.run('Mehsana', 'Gateway to North Gujarat', 'https://images.unsplash.com/photo-1627806509653-f728dc763071?q=80&w=800&auto=format&fit=crop', 'Culture,Temples');
    stmt.finalize();

    // Seed Events for Ahmedabad (ID 1)
    const stmtEvents = db.prepare(`INSERT INTO events (city_id, event_date, title, location) VALUES (?, ?, ?, ?)`);
    stmtEvents.run(1, 'Oct 15', 'Navratri Festival', 'Various Locations');
    stmtEvents.run(1, 'Nov 02', 'Food Market', 'Riverfront');
    stmtEvents.run(1, 'Dec 25', 'Kankaria Carnival', 'Kankaria Lake');
    stmtEvents.finalize();
}

module.exports = db;
