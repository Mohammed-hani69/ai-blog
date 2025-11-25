import { GoogleGenAI } from '@google/genai';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';

// NOTE: This module implements a very small autopilot scheduler for the server.
// It persists state in the server's SQLite DB and uses the Google GenAI SDK to
// generate content.

let dbRef = null;
let timer = null;
let isRunning = false;
const eventEmitter = new EventEmitter();

const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY for server-side AI generation');
  return new GoogleGenAI({ apiKey });
};

const safeParse = (text) => {
  if (!text || typeof text !== 'string') return null;
  // Try to find JSON block
  const m = text.match(/```json\s*([\s\S]*?)\s*```/);
  let jsonString = null;
  if (m) jsonString = m[1];
  if (!jsonString) {
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1 && first < last) jsonString = text.substring(first, last + 1);
  }
  if (!jsonString) return null;
  try { return JSON.parse(jsonString); } catch (e) { return null; }
};

const runAIAnalyze = async (settings) => {
  const ai = getAIClient();
  const prompt = `Act as a professional SEO trend analyst. Analyze current trends for niche: "${settings.niche}". Use keywords: "${settings.keywords}". Return JSON: {"topic":"","analysis":""}`;
  const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  const data = safeParse(res.text);
  return data || { topic: settings.niche, analysis: "Generated topic" };
};

const runAIGenerateArticle = async (topic, settings) => {
  const ai = getAIClient();
  const prompt = `Write a long form blog post about: "${topic}" in ${settings.language}. Return JSON {title, content, excerpt, tags, category, imagePrompt}`;
  const res = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
  const data = safeParse(res.text);
  return data || { title: topic, content: `<p>${topic}</p>`, excerpt: '', tags: [], category: 'عام', imagePrompt: `A cinematic photo of ${topic}` };
};

const generateBlogImage = async (imagePrompt, quality) => {
  // For server, fallback to placeholder if no image generation supported
  try {
    const ai = getAIClient();
    // Try flash image
    const res = await ai.models.generateContent({ model: 'gemini-2.5-flash-image', contents: { parts: [{ text: imagePrompt }] }, config: { imageConfig: { aspectRatio: '16:9' } } });
    for (const c of res.candidates || []) {
      for (const p of c?.content?.parts || []) {
        if (p.inlineData) return `data:${p.inlineData.mimeType};base64,${p.inlineData.data}`;
      }
    }
  } catch (e) {
    // Ignore error and fallback
  }
  return `https://picsum.photos/seed/${Date.now()}/800/450`;
};

// Helpers for DB operations
const readAutopilotRow = () => new Promise((resolve, reject) => {
  dbRef.get('SELECT json FROM autopilot WHERE id = 1', [], (err, row) => {
    if (err) return reject(err);
    if (!row) return resolve(null);
    try { resolve(JSON.parse(row.json)); } catch (e) { resolve(null); }
  });
});

const saveAutopilotRow = (obj) => new Promise((resolve, reject) => {
  const json = JSON.stringify(obj);
  dbRef.run('INSERT OR REPLACE INTO autopilot (id, json) VALUES (1, ?)', [json], function(err) {
    if (err) return reject(err);
    resolve();
  });
  // emit state update
  eventEmitter.emit('update', obj);
});

const scheduleNext = async () => {
  if (timer) clearTimeout(timer);
  const state = await readAutopilotRow();
  if (!state || !state.running) return; // nothing to schedule

  // Reset articlesGeneratedToday if date changed
  const today = new Date().toISOString().slice(0,10);
  if (state.lastRunDate !== today) state.articlesGeneratedToday = 0;

  if (state.articlesGeneratedToday >= state.articlesPerDay) {
    // schedule at next midnight
    const msUntilMidnight = (() => {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      return next.getTime() - now.getTime();
    })();
    state.nextRunTs = Date.now() + msUntilMidnight;
    await saveAutopilotRow(state);
    timer = setTimeout(scheduleNext, msUntilMidnight + 1000);
    return;
  }

  const intervalMs = Math.floor((24 * 60 * 60 * 1000) / state.articlesPerDay);
  const nextTs = (state.nextRunTs && state.nextRunTs > Date.now()) ? state.nextRunTs : Date.now() + 5000; // immediate small delay
  const wait = Math.max(0, nextTs - Date.now());
  timer = setTimeout(async () => {
    // Run one generation job
    try {
      await runJob();
    } catch (err) {
      console.error('Autopilot job failed', err);
    }
    // Update next run time
    const st = await readAutopilotRow();
    st.nextRunTs = Date.now() + intervalMs;
    await saveAutopilotRow(st);
    // Schedule next
    scheduleNext();
  }, wait);
};

const runJob = async () => {
  const state = await readAutopilotRow();
  if (!state || !state.running) return;

  // Reset daily count if needed
  const today = new Date().toISOString().slice(0,10);
  if (state.lastRunDate !== today) state.articlesGeneratedToday = 0;

  // pick topic and generate
  const aiTrend = await runAIAnalyze(state.settings);
  const article = await runAIGenerateArticle(aiTrend.topic, state.settings);
  const imageUrl = await generateBlogImage(article.imagePrompt, state.settings.imageQuality || '1K');

  const post = {
    id: Date.now().toString(),
    title: article.title || aiTrend.topic,
    excerpt: article.excerpt || '',
    content: article.content || `<p>${aiTrend.topic}</p>`,
    imageUrl,
    author: 'AutoBlog AI',
    date: new Date().toLocaleDateString('ar-EG'),
    tags: article.tags || [],
    category: article.category || 'عام',
    status: state.settings?.autoPublish ? 'published' : 'draft',
    views: 0,
    comments: [],
    trafficSources: { search: 0, social: 0, direct: 0, referral: 0 }
  };

  // Save post into DB
  await new Promise((resolve, reject) => {
    const json = JSON.stringify(post);
    dbRef.run('INSERT OR REPLACE INTO posts (id, date_sort, json) VALUES (?, ?, ?)', [post.id, post.date, json], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  // Update state
  state.articlesGeneratedToday = (state.articlesGeneratedToday || 0) + 1;
  state.lastRunDate = today;
  state.logs = state.logs || [];
  state.logs.push({ timestamp: new Date().toISOString(), message: `Published: ${post.title}` });
  await saveAutopilotRow(state);
  eventEmitter.emit('update', state);
};

export const init = (db) => {
  dbRef = db;
  // Ensure autopilot table exists
  dbRef.serialize(() => {
    dbRef.run(`CREATE TABLE IF NOT EXISTS autopilot (id INTEGER PRIMARY KEY, json TEXT)`);
    // Attempt to load state and if running schedule
    dbRef.get('SELECT json FROM autopilot WHERE id = 1', [], (err, row) => {
      if (err) return console.error('Autopilot load error', err);
      if (!row) return;
      try {
        const state = JSON.parse(row.json);
        if (state && state.running) {
          // schedule
          scheduleNext();
        }
      } catch (e) { }
    });
  });
};

export const subscribe = (cb) => {
  eventEmitter.on('update', cb);
  return () => eventEmitter.off('update', cb);
};

export const startAutopilot = async (settings) => {
  const initial = {
    running: true,
    settings: settings,
    articlesPerDay: settings.articlesPerDay || 1,
    articlesGeneratedToday: 0,
    lastRunDate: null,
    nextRunTs: Date.now() + 2000,
    logs: []
  };
  await saveAutopilotRow(initial);
  scheduleNext();
  return initial;
};

export const stopAutopilot = async () => {
  if (timer) { clearTimeout(timer); timer = null; }
  const row = await readAutopilotRow();
  if (!row) return { running: false };
  row.running = false;
  row.nextRunTs = null;
  await saveAutopilotRow(row);
  return row;
};

export const getStatus = async () => {
  const s = await readAutopilotRow();
  return s || { running: false };
};

export default { init, startAutopilot, stopAutopilot, getStatus };
