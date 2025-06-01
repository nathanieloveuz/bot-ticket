const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const DB_PATH = path.join(__dirname, 'ticket.db');

const db = new sqlite3.Database(DB_PATH);

// INIT TABLE
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    rating INTEGER NOT NULL,
    text TEXT,
    createdAt INTEGER
  )`);
});

module.exports = {
  // Create new review
  createReview: (userId, rating, text) => {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      db.run(
        `INSERT INTO reviews (userId, rating, text, createdAt)
         VALUES (?, ?, ?, ?)`,
        [userId, rating, text, now],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  },

  // Get latest N reviews (default: 5)
  getLatestReviews: (limit = 5) => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM reviews ORDER BY createdAt DESC LIMIT ?`,
        [limit],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }
};
