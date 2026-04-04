# Multi-AI Deploy

## Features
- Paste scripts → saved into named folder
- AI auto-generates missing files (index.js, package.json, README.md)
- One-click deploy to GitHub / Render / Vercel / Supabase
- Output shows success or missing files

## Setup
1. Copy `.env.example` → `.env` and fill in your tokens.
2. Run `npm install`.
3. Start backend: `node backend/server.js` or `bash start.sh`.
4. Open `frontend/index.html` in browser.
5. Paste scripts, save file, select platform, click deploy.

## Notes
- Ensure Node.js is installed.
- GitHub deploy requires a personal access token with repo access.
