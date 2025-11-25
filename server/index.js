import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.resolve(process.cwd(), 'server-data', 'mazadplus.db');
const PORT = process.env.BACKEND_PORT || 4000;

// Ensure server-data dir
const serverDataDir = path.resolve(process.cwd(), 'server-data');
if (!fs.existsSync(serverDataDir)) fs.mkdirSync(serverDataDir, { recursive: true });

// Initialize DB
// Initialize sqlite DB using node-sqlite3
const db = new sqlite3.Database(DB_FILE);

// Create tables
db.serialize(() => {
  db.run(`
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  date_sort TEXT,
  json TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY,
  json TEXT
);
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      json TEXT
    );
  `);
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Helpers
function rowToJson(r) {
  try { return JSON.parse(r.json); } catch (e) { return null; }
}

// Endpoints
app.get('/posts', (req, res) => {
  db.all('SELECT id, date_sort, json FROM posts ORDER BY date_sort DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err.message });
    return res.json(rows.map(r => ({ id: r.id, date_sort: r.date_sort, json: rowToJson(r) })));
  });
});

app.get('/posts/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT id, date_sort, json FROM posts WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err.message });
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json({ id: row.id, date_sort: row.date_sort, json: rowToJson(row) });
  });
});

app.post('/posts', (req, res) => {
  const post = req.body;
  if (!post || !post.id) return res.status(400).json({ message: 'Invalid post payload' });
  const json = JSON.stringify(post);
  db.run('INSERT OR REPLACE INTO posts (id, date_sort, json) VALUES (?, ?, ?)', [post.id, post.date, json], function(err) {
    if (err) return res.status(500).json({ message: 'DB error', error: err.message });
    res.status(201).json({ message: 'Saved' });
  });
});

app.put('/posts/:id', (req, res) => {
  const id = req.params.id;
  const post = req.body;
  if (!post || !post.id) return res.status(400).json({ message: 'Invalid post payload' });
  const json = JSON.stringify(post);
  db.run('INSERT OR REPLACE INTO posts (id, date_sort, json) VALUES (?, ?, ?)', [post.id, post.date, json], function(err) {
    if (err) return res.status(500).json({ message: 'DB error', error: err.message });
    res.json({ message: 'Updated' });
  });
});

app.delete('/posts/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM posts WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ message: 'DB error', error: err.message });
    res.json({ message: 'Deleted' });
  });
});

// Settings
app.get('/settings', (req, res) => {
  db.get('SELECT json FROM settings WHERE id = 1', [], (err, row) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err.message });
    if (!row) return res.json(null);
    try { res.json(JSON.parse(row.json)); } catch (e) { res.json(null); }
  });
});

app.post('/settings', (req, res) => {
  const settings = req.body;
  const json = JSON.stringify(settings);
  db.run('INSERT OR REPLACE INTO settings (id, json) VALUES (1, ?)', [json], function(err) {
    if (err) return res.status(500).json({ message: 'DB error', error: err.message });
    res.json({ message: 'Saved' });
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
