const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the SQLite database
const databasePath = path.join(__dirname, 'database.sqlite'); // Adjust the path as needed

// Function to open the database
const openDatabase = () => new sqlite3.Database(databasePath);

const startServer = () => {
  const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/save-code-data') {
      let body = '';

      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        const { code, name } = JSON.parse(body);

        const db = openDatabase();

        db.run(`INSERT INTO Tree (area, name) VALUES (?, ?)`, [code, name], function (err) {
          if (err) {
            console.error('Error inserting data:', err.message);
            db.close();
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error inserting data' }));
            return;
          }

          db.all("SELECT * FROM Tree", (err, rows) => {
            if (err) {
              console.error('Error fetching data from Tree table:', err.message);
              db.close();
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Error fetching data' }));
              return;
            }

            db.close();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, rows }));
          });
        });
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  server.listen(8000, () => {
    console.log('Server listening on port 8000');
  });
};

module.exports = startServer;
