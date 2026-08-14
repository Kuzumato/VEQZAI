// Minimal auth scaffold for local development
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const app = express();
app.use(bodyParser.json());

// DEV: memory stores (not for production)
const users = {}; // username -> { id, username, passwordHash }
const resetTokens = {}; // token -> { userId, expires }
const characters = {}; // userId -> character[]

// create demo user: admin / 12345
(async function createDemo() {
  const hash = await bcrypt.hash('12345', 10);
  users['admin'] = { id: 'user_demo', username: 'admin', passwordHash: hash };
})();

app.use(session({
  genid: () => uuidv4(),
  secret: 'dev-secret-please-change',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // set to true when using HTTPS
    sameSite: 'lax' // production: consider 'strict'
    // NOTE: no maxAge here -> session cookie (browser session scoped)
  }
}));

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const user = users[username];
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });

  // create session
  req.session.userId = user.id;
  req.session.username = user.username;
  return res.json({ success: true });
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'logout failed' });
    res.clearCookie('connect.sid');
    return res.json({ success: true });
  });
});

// POST /api/auth/forgot  (generate token and "send" email - dev: console)
app.post('/api/auth/forgot', (req, res) => {
  const { username } = req.body || {};
  if (!username) return res.status(400).json({ error: 'username required' });
  const user = users[username];
  if (!user) return res.status(200).json({ success: true }); // do not reveal existence

  const token = uuidv4();
  resetTokens[token] = { userId: user.id, expires: Date.now() + 1000 * 60 * 30 }; // 30m
  // DEV: log reset link
  console.log(`Password reset link (DEV): http://localhost:3000/reset-password.html?token=${token}`);
  return res.json({ success: true });
});

// POST /api/auth/reset
app.post('/api/auth/reset', async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).json({ error: 'token and password required' });
  const entry = resetTokens[token];
  if (!entry || entry.expires < Date.now()) return res.status(400).json({ error: 'invalid or expired token' });

  // find user by id
  const user = Object.values(users).find(u => u.id === entry.userId);
  if (!user) return res.status(400).json({ error: 'invalid token' });

  user.passwordHash = await bcrypt.hash(password, 10);
  delete resetTokens[token];
  return res.json({ success: true });
});

// GET /api/auth/me
app.get('/api/auth/me', (req, res) => {
  if (!req.session || !req.session.userId) return res.status(401).json({ authenticated: false });
  return res.json({ authenticated: true, userId: req.session.userId, username: req.session.username });
});

// simple register endpoint for testing
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  if (users[username]) return res.status(400).json({ error: 'username exists' });
  const id = 'user_' + Date.now();
  const passwordHash = await bcrypt.hash(password, 10);
  users[username] = { id, username, passwordHash };
  return res.json({ success: true, userId: id });
});

// POST /api/characters/save
app.post('/api/characters/save', (req, res) => {
  const payload = req.body || {};
  const userId = payload.userId || (req.session && req.session.userId);
  if (!userId) return res.status(401).json({ error: 'userId required' });

  const character = {
    ...payload,
    id: payload.id || 'character_' + Date.now(),
    userId,
    updatedAt: new Date().toISOString()
  };

  const userCharacters = characters[userId] || [];
  const existingIndex = userCharacters.findIndex(item => item.id === character.id);
  if (existingIndex >= 0) {
    userCharacters[existingIndex] = character;
  } else {
    userCharacters.unshift(character);
  }
  characters[userId] = userCharacters;

  return res.json({ success: true, characterId: character.id });
});

// GET /api/characters/user/:userId
app.get('/api/characters/user/:userId', (req, res) => {
  const userId = req.params.userId;
  return res.json({ characters: characters[userId] || [] });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Auth scaffold running on http://localhost:${port}`));
