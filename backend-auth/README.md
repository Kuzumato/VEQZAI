VEQZAI backend-auth (dev scaffold)

Purpose
- Minimal Node.js/Express auth service for local development and integration testing.
- Implements: login, logout, register (dev), forgot (token generator), reset, and /api/auth/me.
- Uses express-session with in-memory store (not for production). Session cookie is session-scoped (no maxAge) so closing the browser will drop the cookie in real browsers when using cookie-based auth.

Quick start
1. cd backend-auth
2. npm install
3. npm start

Notes for production
- Replace MemoryStore with Redis or a persistent session store.
- Set cookie.secure: true behind TLS and use a strong session secret.
- Implement rate limiting, CSRF protections, strong password rules, email provider (SendGrid/SES), and audit logging.
- Use HTTPS and set SameSite appropriately (strict/lax depending on cross-site flows).

Front-end integration notes
- The frontend can call POST /api/auth/login with JSON { username, password }.
- On successful login the server will create a session and set an HttpOnly cookie; avoid storing auth tokens in local/sessionStorage when using HttpOnly cookies.
- Use GET /api/auth/me to check authentication status from the frontend.
