const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'project.db');

// Check if the database file exists
if (!fs.existsSync(dbPath)) {
    // Create the database
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error creating database:', err.message);
        } else {
            console.log('Main database created successfully.',dbPath);
            // Perform additional initialization if needed
        }
    });

    // Close the database connection
    db.close();
} else {
    console.log('Main database already exists.');
}
