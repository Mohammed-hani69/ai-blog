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
   - Set `VITE_BACKEND_URL` in `.env.local` to the backend URL if you run it elsewhere.

   When the backend is running, the UI will use it to persist and receive posts, otherwise it will continue using the browser-based SQLite DB (local only).
3. Run the app:
   `npm run dev`
