import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
import aiWorker from './aiWorker.js';
import { EventEmitter } from 'events';

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
  db.run(`
    CREATE TABLE IF NOT EXISTS autopilot (
      id INTEGER PRIMARY KEY,
      json TEXT
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      email TEXT,
      expires_at INTEGER
    );
  `);
});

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '5mb' }));

// Helpers
const makeToken = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const createSession = (email, expiresAt) => new Promise((resolve, reject) => {
  const token = makeToken();
  db.run('INSERT INTO sessions (token, email, expires_at) VALUES (?, ?, ?)', [token, email, expiresAt], function(err) {
    if (err) return reject(err);
    resolve(token);
  });
});

const destroySession = (token) => new Promise((resolve, reject) => {
  db.run('DELETE FROM sessions WHERE token = ?', [token], function(err) {
    if (err) return reject(err);
    resolve();
  });
});

const validateSession = (token) => new Promise((resolve, reject) => {
  db.get('SELECT token, email, expires_at FROM sessions WHERE token = ?', [token], (err, row) => {
    if (err) return reject(err);
    if (!row) return resolve(null);
    if (row.expires_at && Date.now() > row.expires_at) {
      // expired
      db.run('DELETE FROM sessions WHERE token = ?', [token], () => {});
      return resolve(null);
    }
    resolve({ token: row.token, email: row.email, expires_at: row.expires_at });
  });
});

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.session_id || req.header('X-Session-Token');
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    const session = await validateSession(token);
    if (!session) return res.status(401).json({ message: 'Unauthorized' });
    req.session = session;
    next();
  } catch (err) {
    console.error('Auth middleware error', err);
    return res.status(500).json({ message: 'Auth error' });
  }
};

// Cookie parser for simple cookie read
import cookieParser from 'cookie-parser';
app.use(cookieParser());
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

app.post('/posts', async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      requireAuth(req, res, (err) => { if (err) reject(err); else resolve(); });
    });
  } catch (err) { return; }
  const post = req.body;
  if (!post || !post.id) return res.status(400).json({ message: 'Invalid post payload' });
  const json = JSON.stringify(post);
  db.run('INSERT OR REPLACE INTO posts (id, date_sort, json) VALUES (?, ?, ?)', [post.id, post.date, json], function(err) {
    if (err) return res.status(500).json({ message: 'DB error', error: err.message });
    res.status(201).json({ message: 'Saved' });
  });
});

app.put('/posts/:id', async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      requireAuth(req, res, (err) => { if (err) reject(err); else resolve(); });
    });
  } catch (err) { return; }
  const id = req.params.id;
  const post = req.body;
  if (!post || !post.id) return res.status(400).json({ message: 'Invalid post payload' });
  const json = JSON.stringify(post);
  db.run('INSERT OR REPLACE INTO posts (id, date_sort, json) VALUES (?, ?, ?)', [post.id, post.date, json], function(err) {
    if (err) return res.status(500).json({ message: 'DB error', error: err.message });
    res.json({ message: 'Updated' });
  });
});

app.delete('/posts/:id', async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      requireAuth(req, res, (err) => { if (err) reject(err); else resolve(); });
    });
  } catch (err) { return; }
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

app.post('/settings', async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      requireAuth(req, res, (err) => { if (err) reject(err); else resolve(); });
    });
  } catch (err) { return; }
  const settings = req.body;
  const json = JSON.stringify(settings);
  db.run('INSERT OR REPLACE INTO settings (id, json) VALUES (1, ?)', [json], function(err) {
    if (err) return res.status(500).json({ message: 'DB error', error: err.message });
    res.json({ message: 'Saved' });
  });
});

// Autopilot endpoints
app.post('/autopilot/start', async (req, res) => {
  const settings = req.body;
  try {
    // Protect this endpoint
    await new Promise((resolve, reject) => {
      requireAuth(req, res, (err) => { if (err) reject(err); else resolve(); });
    });
    const state = await aiWorker.startAutopilot(settings);
    res.json({ message: 'Autopilot started', state });
  } catch (err) {
    res.status(500).json({ message: 'Failed to start autopilot', error: err?.message || err });
  }
});

app.post('/autopilot/stop', async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      requireAuth(req, res, (err) => { if (err) reject(err); else resolve(); });
    });
    const state = await aiWorker.stopAutopilot();
    res.json({ message: 'Autopilot stopped', state });
  } catch (err) {
    res.status(500).json({ message: 'Failed to stop autopilot', error: err?.message || err });
  }
});

app.get('/autopilot/status', async (req, res) => {
  try {
    // optional auth: status may be public, but to read server state, require auth
    await new Promise((resolve, reject) => {
      requireAuth(req, res, (err) => { if (err) reject(err); else resolve(); });
    });
    const state = await aiWorker.getStatus();
    res.json(state);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get autopilot status', error: err?.message || err });
  }
});

// init AI Worker, then start server
try {
  aiWorker.init(db);
} catch (err) {
  console.error('aiWorker.init failed:', err);
}
// setup SSE clients list and emitter
const sseClients = new Set();
const eventEmitter = new EventEmitter();
aiWorker.subscribe && aiWorker.subscribe((payload) => {
  // broadcast to clients
  [...sseClients].forEach(res => {
    try { res.write(`data: ${JSON.stringify(payload)}\n\n`); } catch(e) {}
  });
  // also log to console
  console.log('autopilot update:', payload);
  eventEmitter.emit('update', payload);
});

app.get('/autopilot/events', async (req, res) => {
  // Protected SSE endpoint
  await new Promise((resolve, reject) => {
    requireAuth(req, res, (err) => { if (err) reject(err); else resolve(); });
  }).catch(() => { return res.status(401).end(); });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send current status once
  const state = await aiWorker.getStatus();
  res.write(`data: ${JSON.stringify({ type: 'status', data: state })}\n\n`);

  // add to clients set
  sseClients.add(res);
  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Auth endpoints
app.post('/auth/login', async (req, res) => {
  const { email, password, remember } = req.body || {};
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mazadplus.com';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
  if (!email || !password) return res.status(400).json({ message: 'Missing credentials' });
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) return res.status(401).json({ message: 'Invalid credentials' });

  try {
    console.log('/auth/login request from', req.ip, req.get('origin'));
    const expiresIn = remember ? 7 * 24 * 60 * 60 * 1000 : (60 * 60 * 1000); // 7 days or 1 hour
    const expiresAt = Date.now() + expiresIn;
    const token = await createSession(email, expiresAt);
    res.cookie('session_id', token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: expiresIn });
    res.json({ message: 'Logged in', email });
  } catch (err) {
    console.error('/auth/login error:', err);
    res.status(500).json({ message: 'Failed to create session', error: err?.message || err });
  }
});

app.post('/auth/logout', async (req, res) => {
  try {
    console.log('/auth/logout request', req.ip);
    const token = req.cookies?.session_id || req.header('X-Session-Token');
    if (token) await destroySession(token);
    res.clearCookie('session_id');
    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('/auth/logout error', err);
    res.status(500).json({ message: 'Logout failed', error: err?.message || err });
  }
});

app.get('/auth/session', async (req, res) => {
  try {
    console.log('/auth/session check from', req.ip);
    const token = req.cookies?.session_id || req.header('X-Session-Token');
    if (!token) return res.json({ loggedIn: false });
    const session = await validateSession(token);
    if (!session) return res.json({ loggedIn: false });
    res.json({ loggedIn: true, email: session.email });
  } catch (err) {
    console.error('/auth/session error', err);
    res.status(500).json({ message: 'Session check failed', error: err?.message || err });
  }
});

// Debug endpoint - local or authenticated only
app.get('/debug', async (req, res) => {
  try {
    const token = req.cookies?.session_id || req.header('X-Session-Token');
    const isLocal = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
    if (!isLocal) {
      const sess = await validateSession(token);
      if (!sess) return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }

    const aiStatus = await aiWorker.getStatus().catch(() => null);
    const counts = await new Promise((resolve) => {
      db.get('SELECT (SELECT COUNT(*) FROM posts) AS posts, (SELECT COUNT(*) FROM sessions) AS sessions, (SELECT COUNT(*) FROM autopilot) AS autopilot', [], (err, r) => {
        if (err) return resolve({ posts: -1, sessions: -1, autopilot: -1 });
        resolve({ posts: r.posts, sessions: r.sessions, autopilot: r.autopilot });
      });
    });

    return res.json({ ok: true, nodeVersion: process.version, env: { GEMINI_API_KEY: !!process.env.GEMINI_API_KEY, BACKEND_PORT: process.env.BACKEND_PORT || 4000, ADMIN_EMAIL: !!process.env.ADMIN_EMAIL }, aiStatus, counts, pid: process.pid });
  } catch (err) {
    console.error('/debug error', err);
    return res.status(500).json({ ok: false, message: 'debug error', error: err?.message || err });
  }
});

// global error handler to avoid crashing and to provide better errors
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack || err);
  res.status(500).json({ message: 'Internal Server Error', error: err?.message || err });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

// Simple health-check for nginx or monitoring
app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true, pid: process.pid, uptime: process.uptime() });
});
