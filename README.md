<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1in1nIyxE3LLTezc5ckqgp-Z3jF1Wek56

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. (Optional but recommended) Start the included backend to enable shared server-side storage so posts are visible to everyone:
   - Start the backend: `cd server && npm install && npm start` (defaults to `http://localhost:4000`)
      - Ensure you set `GEMINI_API_KEY` in `server/.env` and `VITE_BACKEND_URL` in the client's `.env.local` (e.g., VITE_BACKEND_URL=http://localhost:4000)
       - Ensure you set `GEMINI_API_KEY` in `server/.env` and `VITE_BACKEND_URL` in the client's `.env.local` (e.g., VITE_BACKEND_URL=http://localhost:4000)
       - For secure admin access, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env` to control backend login. By default the server uses the values in `.env` example.

      Real-time updates:
      - The backend also exposes a Server-Sent Events endpoint at `/autopilot/events`. When logged-in as an admin, the frontend subscribes to this stream for real-time autopilot logs and status updates (no more polling required).
      - Make sure to set `GEMINI_API_KEY` in `.env` or `process.env` (server side) before running the backend so it can generate content automatically.
   - Set `VITE_BACKEND_URL` in `.env.local` to the backend URL if you run it elsewhere.

   When the backend is running, the UI will use it to persist and receive posts, otherwise it will continue using the browser-based SQLite DB (local only).

   Autopilot (Server-side scheduling):
   - Use the `AI Autopilot` panel to save settings and start the autopilot. When the backend is active and configured, the autopilot will run on the server and will continue generating articles in the background even if you log out of the admin UI. The server automatically schedules daily runs and respects the "articles per day" setting. Use the "إيقاف الطيار" button in the control panel to stop it.

   Persistent Admin Session:
   - The login form allows you to use the "تذكرني" (Remember me) checkbox. If checked, the admin session is saved to `localStorage`, and the admin will remain logged in after reloading the page. If not checked, the session won't be persisted and a reload will require login again.

   Security notice: This demo stores session information in `localStorage` for convenience. For production deployments, replace this with secure server-side sessions or token-based authentication (HTTP-only cookies, token expiration, refresh tokens, etc.).
3. Run the app:
   `npm run dev`
