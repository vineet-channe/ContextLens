# ContextLens

An AI-powered PDF reader that streams contextual definitions of highlighted text using Claude, Gemini, or OpenAI.

**Status:** Open source, MIT License. Deployable to Vercel (frontend) + Render/Railway (backend).

## Architecture

This project has two deployable apps:

- `client` (Vite + React static frontend)
- `server` (Express API)

## 1. Local Production Test

From project root:

```bash
cd server && npm install
cd ../client && npm install
```

Run API:

```bash
cd server
cp ../.env.example ../.env
npm start
```

Run frontend with API base URL:

```bash
cd client
cp .env.example .env
# Set VITE_API_BASE_URL in client/.env to http://localhost:3001
npm run dev
```

## 2. Deploy Server (Render/Railway/Fly)

Deploy `server` as a Node service.

Build command:

```bash
npm install
```

Start command:

```bash
npm start
```

Required environment variables:

- `ANTHROPIC_API_KEY` (optional if not using Claude)
- `GEMINI_API_KEY` (optional if not using Gemini)
- `OPENROUTER_API_KEY` (optional if not using OpenRouter)
- `PORT` (platform usually provides this automatically)
- `CLIENT_ORIGIN` (frontend domain, or comma-separated domains)
- `APP_URL` (public frontend URL)

Health check path:

- `/api/health`

## 3. Deploy Client (Vercel/Netlify)

Deploy `client` as a static site.

Build command:

```bash
npm run build
```

Output directory:

- `dist`

Required frontend environment variable:

- `VITE_API_BASE_URL` = your deployed API base URL
  - Example: `https://contextlens-api.onrender.com`

## 4. Wire Up CORS Correctly

On the server deployment, set `CLIENT_ORIGIN` to your frontend URL.

Examples:

```env
CLIENT_ORIGIN=https://contextlens.vercel.app
```

or multiple domains:

```env
CLIENT_ORIGIN=https://contextlens.vercel.app,https://www.contextlens.ai
```

## 5. Smoke Test After Deploy

1. Open frontend URL.
2. Upload a PDF.
3. Highlight a term and request a definition.
4. Confirm streaming output appears.
5. Confirm API health endpoint returns `{ "ok": true }`.

## 6. Optional: Single-Service Deployment

If you want one deploy target, you can also serve the built `client/dist` from Express in `server/index.js`. Current setup is optimized for separate frontend + backend deploys.

## Local Development

Clone and run locally:

```bash
git clone <repo-url>
cd ContextLens

# Install dependencies
cd server && npm install
cd ../client && npm install

# Set up environment
cp .env.example ../.env
# Edit ../.env with your API keys (ANTHROPIC_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY, or OPENROUTER_API_KEY)

# Run backend (from server/)
npm start

# In another terminal, run frontend (from client/)
VITE_API_BASE_URL=http://localhost:3001 npm run dev
```

## Contributing

Contributions welcome! Fork, branch, and open a PR.

## License

MIT — see [LICENSE](LICENSE)
