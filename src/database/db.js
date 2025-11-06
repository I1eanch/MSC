const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const dbPath = process.env.DATABASE_PATH || './data/videos.db';
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error('Error opening database:', err);
  } else {
    logger.info('Connected to SQLite database');
  }
});

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'trainer',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) logger.error('Error creating users table:', err);
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS videos (
          id TEXT PRIMARY KEY,
          user_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          original_filename TEXT NOT NULL,
          s3_key TEXT NOT NULL,
          s3_bucket TEXT NOT NULL,
          file_size INTEGER,
          duration REAL,
          status TEXT DEFAULT 'uploaded',
          mediaconvert_job_id TEXT,
          output_formats TEXT,
          thumbnail_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) logger.error('Error creating videos table:', err);
      });

      db.run(`
        CREATE TABLE IF NOT EXISTS video_outputs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          video_id TEXT NOT NULL,
          format TEXT NOT NULL,
          resolution TEXT NOT NULL,
          s3_key TEXT NOT NULL,
          s3_bucket TEXT NOT NULL,
          cloudfront_url TEXT,
          file_size INTEGER,
          bitrate INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (video_id) REFERENCES videos(id)
        )
      `, (err) => {
        if (err) {
          logger.error('Error creating video_outputs table:', err);
          reject(err);
        } else {
          logger.info('Database tables initialized');
          resolve();
        }
      });
    });
  });
};

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

module.exports = {
  db,
  initDatabase,
  query,
  run,
  get
};
