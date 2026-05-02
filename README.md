<div align="center">

<img src="./assets/logo.png" alt="ContextLens Logo" width="360" />

# ContextLens

### AI-Powered Contextual PDF Reader

*Highlight any word. Understand it in context. Instantly.*

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](#contributing)

</div>

---

## What is ContextLens?

Reading a dense research paper, legal brief, or medical article and hitting a term you don't understand is a flow-killer. You open a new tab, search the term, get a generic Wikipedia definition — and by the time you're back, you've lost the thread.

**ContextLens fixes this.** Upload any PDF, highlight any word or phrase, and get an instant AI-generated explanation rooted in *that document's specific context* — not a dictionary entry, not a generic summary, but a tailored answer to: *"what does this term mean in this paper?"*

```
"synaptic plasticity" in a neuroscience paper  ≠  "synaptic plasticity" in a pop-science blog
```

ContextLens knows the difference.

---

## Features at a Glance

| Feature | Description |
|---|---|
| 📄 **PDF Upload & Render** | Drag-and-drop any PDF. Renders all pages in a scrollable reader |
| 🖊️ **Highlight → Explain** | Select any text; a draggable floating popup streams a context-aware AI explanation with a one-click copy button |
| 🧠 **Document-Aware AI** | Explanations are grounded in the paper's subject matter, not generic definitions |
| 💬 **Follow-up Questions** | Continue the conversation about any definition without losing context |
| 🔀 **4 AI Providers** | Claude, Gemini, GPT-4o-mini, OpenRouter — switch anytime; use the server's key or supply your own per provider |
| 📚 **Session History** | All lookups shown in a right-hand sidebar; click any entry to jump the PDF to that exact page |
| 🔐 **Google OAuth Login** | Sign in to unlock persistent sessions saved across devices |
| 🗂️ **Resume Past Papers** | Pick up where you left off on any previously uploaded document |
| ⚡ **Streaming Responses** | AI text streams in real-time via Server-Sent Events — no waiting for full responses |
| 🎨 **Polished UI** | Animated page transitions, cursor torch glow, book-flip hero, floating definition popup |

---

## Architecture

```
┌──────────────────────┐         ┌──────────────────────┐
│   React Frontend     │ ◄─────► │   Express Backend    │
│   (Vite + Tailwind)  │  REST   │   (Node.js)          │
│   PDF Viewer         │  SSE    │   Rate Limiting      │
│   AI Popup / Panel   │         │   JWT Auth           │
└──────────────────────┘         └──────────┬───────────┘
                                             │
                   ┌────────────────────────┬┴────────────────────────┐
                   │                        │                         │
            ┌──────▼──────┐        ┌────────▼───────┐        ┌───────▼──────┐
            │   MongoDB    │        │  AI Providers  │        │ Google OAuth │
            │  Sessions +  │        │  Claude/Gemini │        │  (Passport)  │
            │   Lookups    │        │  OpenAI/Router │        └──────────────┘
            └─────────────┘        └────────────────┘
```

### Frontend Component Tree

```
App.jsx
├── AuthProvider              ← Google OAuth, JWT management
├── TransitionProvider        ← Page navigation state
└── AppContent
    ├── LandingPage
    │   ├── LandingNav
    │   ├── HeroSection       ← Book flip canvas, mouse glow
    │   ├── HowItWorks
    │   ├── FeatureCards
    │   ├── UserPapers        ← Recent sessions (authenticated)
    │   ├── CTABanner
    │   └── Footer
    └── ReaderPage
        ├── ReaderTopBar      ← Provider selector, API key modal
        ├── PDFUploadZone     ← Drag-drop upload, session resume
        ├── PDFViewer         ← react-pdf, text selection detection
        ├── DefinitionPopup   ← Floating popup, real-time streaming
        └── DefinitionPanel   ← Lookup history sidebar
```

### Provider Adapter Pattern

Each AI provider lives in its own file under `server/providers/`. Adding a new provider requires exactly two things: a new file and one line in the registry.

```
server/providers/
├── index.js          ← Registry: { claude, gemini, openai, openrouter }
├── prompt.js         ← Shared prompt template (single source of truth)
├── claude.js         ← Anthropic SDK
├── gemini.js         ← Google Generative AI SDK
├── openai.js         ← OpenAI SDK (gpt-4o-mini)
└── openrouter.js     ← OpenAI SDK pointed at openrouter.ai
```

To add a new provider: create `server/providers/<name>.js` and register it in `index.js`.

---

## Tech Stack

### Frontend

| Library | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tooling |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Page transitions, scroll reveals, popup animations |
| react-pdf | PDF rendering and text layer extraction |

### Backend

| Library | Purpose |
|---|---|
| Node.js + Express | HTTP server and API routing |
| MongoDB + Mongoose | Persistent storage for sessions and lookups |
| Passport.js + Google OAuth 2.0 | Authentication strategy |
| JWT (jsonwebtoken) | Stateless session tokens (30-day expiry) |
| Server-Sent Events (SSE) | Real-time streaming of AI responses |
| Helmet + CORS + express-rate-limit | Security hardening |

### AI SDKs

| SDK | Model |
|---|---|
| `@anthropic-ai/sdk` | `claude-sonnet-4-20250514` |
| `@google/generative-ai` | `gemini-2.0-flash` |
| `openai` | `gpt-4o-mini` |
| `openai` (OpenRouter base URL) | Any model on OpenRouter |

---

## How It Works

### The Core Loop

```
1. User uploads PDF
        │
        ▼
2. PDF renders via react-pdf
        │
        ▼
3. User highlights text
        │
        ▼
4. useTextSelection hook fires
   → extracts: highlighted phrase
   → extracts: ±300 chars surrounding context
   → extracts: page number, document title
        │
        ▼
5. POST /api/define (SSE)
   → backend selects provider (claude/gemini/openai/openrouter)
   → builds context-aware prompt
   → streams response back chunk by chunk
        │
        ▼
6. DefinitionPopup renders streaming text in real time
        │
        ▼
7. User can ask a follow-up question
   → same flow, previousExplanation appended to prompt
        │
        ▼
8. If authenticated: lookup is saved to MongoDB automatically
```

### The AI Prompt

Every provider uses the same prompt template from `server/providers/prompt.js`:

```
You are helping a reader understand a complex document.

Document: "${documentTitle}"
Page ${pageNumber} context: "${surrounding}"

The reader highlighted: "${highlighted}"

In 2–4 sentences, explain what "${highlighted}" means specifically
within this document's context and subject matter. Do not give a
generic dictionary definition. Ground your explanation in how the
term is being used here.
```

This is why ContextLens explanations feel different from a dictionary — the model sees the surrounding 300 characters and the document title before generating its answer.

---

## Authentication Flow

ContextLens uses **Google OAuth 2.0 → JWT → localStorage**. Here's the step-by-step:

```
1. User clicks "Sign in with Google"
        │
        ▼
2. Frontend redirects to GET /api/auth/google
   (Passport.js initiates Google OAuth flow)
        │
        ▼
3. User approves on Google's consent screen
        │
        ▼
4. Google redirects to GET /api/auth/google/callback
   Passport verifies and finds/creates User in MongoDB
        │
        ▼
5. Server signs a JWT:
   jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
        │
        ▼
6. Server redirects to: ${APP_URL}?token=<JWT>
        │
        ▼
7. Frontend AuthContext catches `token` from URL query params
   → stores in localStorage as `cl_token`
   → calls GET /api/auth/me with Bearer token to hydrate user state
   → removes token from URL (replaceState)
        │
        ▼
8. All subsequent requests include:
   Authorization: Bearer <token>
   authMiddleware.js verifies JWT on protected routes (/api/history/*)
        │
        ▼
9. On logout: localStorage token cleared, user state reset
```

**What authentication unlocks:**
- Lookups saved to MongoDB automatically after each definition
- Sessions created per document — resume reading later
- "Your Papers" section on the landing page with recent documents
- Full lookup history with follow-up threads, all returned per session

**Without authentication:** ContextLens works fully. In-session history is stored in React state, all 4 AI providers work, follow-ups work. Auth is purely for persistence.

---

## API Reference

### `POST /api/define`

Stream a context-aware AI explanation via Server-Sent Events.

**Rate limit:** 30 requests / 15 minutes per IP

**Request body:**

```json
{
  "highlighted": "synaptic plasticity",
  "surrounding": "...recent advances have shown that synaptic plasticity plays a central role...",
  "documentTitle": "Nature Reviews Neuroscience 2024",
  "pageNumber": 3,
  "provider": "claude",
  "apiKey": "sk-ant-...",
  "model": null,
  "followUp": "Can you explain how this differs from neurogenesis?",
  "previousExplanation": "Synaptic plasticity in this paper refers to..."
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `highlighted` | string | ✅ | The selected text |
| `surrounding` | string | ✅ | ±300 chars of context around the selection |
| `documentTitle` | string | ✅ | PDF filename or metadata title |
| `pageNumber` | number | ✅ | Current page number |
| `provider` | string | ✅ | `claude` \| `gemini` \| `openai` \| `openrouter` |
| `apiKey` | string | ❌ | User's own key; falls back to server env key if absent |
| `model` | string | ❌ | Optional; OpenRouter has a default if omitted. Use to override (e.g. `mistralai/mistral-7b-instruct`) |
| `followUp` | string | ❌ | Follow-up question; requires `previousExplanation` |
| `previousExplanation` | string | ❌ | Prior AI response included for follow-up context |

**Response:** `text/event-stream`

```
data: In this paper, synaptic
data:  plasticity refers to the brain's
data:  ability to strengthen or weaken...
data: [DONE]
```

---

### Auth Routes

**Rate limit:** 20 requests / 15 minutes per IP

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/auth/google` | ❌ | Initiate Google OAuth flow |
| GET | `/api/auth/google/callback` | ❌ | OAuth callback; redirects to frontend with JWT |
| GET | `/api/auth/me` | ✅ Bearer | Get authenticated user profile |

---

### History Routes

All routes require `Authorization: Bearer <token>`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/history/sessions` | List all sessions for authenticated user |
| POST | `/api/history/sessions` | Create or retrieve a session by `documentTitle` |
| PATCH | `/api/history/sessions/:id` | Update `lastPage` for a session |
| GET | `/api/history/sessions/:id/lookups` | Get all lookups for a session |
| POST | `/api/history/sessions/:id/lookups` | Save a new definition lookup |
| PATCH | `/api/history/sessions/:id/lookups/:lookupId` | Append follow-up Q&A to a lookup |

---

### Health Check

| Method | Endpoint | Response |
|---|---|---|
| GET | `/api/health` | `{ "ok": true }` |

---

## Database Models

### `User`

```js
{
  googleId: String,    // Google OAuth subject ID
  email: String,
  name: String,
  avatar: String,      // Google profile photo URL
  createdAt: Date
}
```

### `PaperSession`

```js
{
  userId: ObjectId,        // ref: User
  documentTitle: String,
  lastPage: Number,        // for resume functionality
  lookupCount: Number,     // denormalized count for quick display
  createdAt: Date,
  updatedAt: Date
}
```

### `DefinitionLookup`

```js
{
  userId: ObjectId,          // ref: User
  sessionId: ObjectId,       // ref: PaperSession
  highlighted: String,       // the selected phrase
  explanation: String,       // full AI response
  pageNumber: Number,
  surrounding: String,       // context window sent to AI
  provider: String,          // which AI provider was used
  model: String,             // specific model identifier
  followUps: [{
    question: String,
    answer: String
  }],
  createdAt: Date
}
```

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- At least one AI provider API key
- *(Optional)* Google Cloud Console project for OAuth

### 1. Clone the repository

```bash
git clone https://github.com/vineet-channe/ContextLens.git
cd ContextLens
```

### 2. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
cp client/.env.example client/.env
```

Fill in `.env`:

```env
# AI Providers — at least one required
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIza...
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-...

# Server
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
APP_URL=http://localhost:5173
SERVER_URL=http://localhost:3001

# MongoDB (required for auth + history; core features work without it)
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/contextlens

# Google OAuth (optional — only required if you want login/persistence)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# JWT — generate a secure secret:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=
```

Fill in `client/.env`:

```env
# Leave empty for local dev — Vite proxies /api to localhost:3001 automatically
# Set to your deployed backend URL in production (e.g. https://your-api.com)
VITE_API_BASE_URL=
```

### 4. Set up Google OAuth *(optional)*

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
4. Copy Client ID and Secret into `.env`
5. Also set `JWT_SECRET` in `.env` — it **must** be a non-empty value or `jwt.sign` will throw at login time:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

### 5. Run the application

**Terminal 1 — Server:**

```bash
cd server
npm run dev     # node --watch index.js on port 3001
```

**Terminal 2 — Client:**

```bash
cd client
npm run dev     # Vite dev server on port 5173
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deployment

### Backend — Render / Railway / Fly.io

```bash
# Start command
npm start    # node index.js

# Health check endpoint
GET /api/health  →  { "ok": true }
```

Set all server environment variables in your hosting dashboard. Ensure `CLIENT_ORIGIN` is set to your deployed frontend URL (no trailing slash).

### Frontend — Vercel / Netlify

```bash
# Build command
npm run build

# Output directory
dist/
```

Set `VITE_API_BASE_URL` to your deployed backend URL.

After deploying, update your Google Cloud Console OAuth credentials to include the production callback URL: `https://your-api.com/api/auth/google/callback`

---

## Rate Limiting

| Scope | Limit |
|---|---|
| Global (all routes) | 200 requests / 15 min per IP |
| `POST /api/define` | 30 requests / 15 min per IP |
| `GET /api/auth/*` | 20 requests / 15 min per IP |

Users who provide their own API key via the in-app modal are still subject to server-side rate limits, but their key is passed directly to the provider — server-side quota is not consumed.

---

## Project Structure

```
ContextLens/
├── .env.example
├── client/
│   ├── .env.example
│   ├── vite.config.js
│   └── src/
│       ├── components/
│       │   ├── landing/
│       │   │   ├── LandingNav.jsx
│       │   │   ├── HeroSection.jsx        ← Book flip canvas + mouse glow
│       │   │   ├── HowItWorks.jsx
│       │   │   ├── FeatureCards.jsx
│       │   │   ├── UserPapers.jsx         ← Authenticated session history
│       │   │   ├── CTABanner.jsx
│       │   │   └── Footer.jsx
│       │   ├── reader/
│       │   │   ├── ReaderTopBar.jsx       ← Provider selector + API key modal
│       │   │   ├── PDFUploadZone.jsx      ← Drag-drop upload
│       │   │   ├── PDFViewer.jsx          ← react-pdf + selection detection
│       │   │   ├── DefinitionPopup.jsx    ← Floating streaming popup
│       │   │   ├── DefinitionPanel.jsx    ← History sidebar
│       │   │   └── ProviderSelector.jsx
│       │   └── shared/
│       │       ├── PageTransition.jsx     ← Fade overlay between pages
│       │       └── LoadingDots.jsx
│       ├── context/
│       │   ├── AuthContext.jsx            ← Google OAuth + JWT state
│       │   └── TransitionContext.jsx      ← Page navigation state
│       ├── hooks/
│       │   ├── useTextSelection.js        ← Highlight detection + context extraction
│       │   ├── useContextDefinition.js    ← API call + streaming state
│       │   ├── useApiKeys.js              ← localStorage key management
│       │   ├── usePaperHistory.js         ← Session + lookup persistence
│       │   ├── useMouseGlow.js            ← Cursor torch effect (landing only)
│       │   ├── useMagneticText.js         ← Headline magnetic pull (landing only)
│       │   └── useCursorTrail.js          ← Gold particle trail (landing only)
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   └── ReaderPage.jsx
│       └── styles/
│           └── globals.css                ← CSS variables, fonts, scrollbar
└── server/
    ├── index.js                           ← Express app, middleware, routes
    ├── middleware/
    │   └── authMiddleware.js              ← JWT verification
    ├── models/
    │   ├── User.js
    │   ├── PaperSession.js
    │   └── DefinitionLookup.js
    ├── providers/
    │   ├── index.js                       ← Provider registry
    │   ├── prompt.js                      ← Shared prompt template
    │   ├── claude.js
    │   ├── gemini.js
    │   ├── openai.js
    │   └── openrouter.js
    ├── routes/
    │   ├── auth.js                        ← Google OAuth, /me
    │   ├── define.js                      ← SSE streaming endpoint
    │   └── history.js                     ← Sessions + lookups CRUD
```

---

## Adding a New AI Provider

1. Create `server/providers/<name>.js` using the same CommonJS pattern all existing providers use:

```js
'use strict'

const { buildPrompt } = require('./prompt')

async function getDefinition(payload, res) {
  const apiKey = payload.apiKey || process.env.<NAME>_API_KEY
  if (!apiKey) throw new Error('<NAME>_API_KEY is not configured.')

  const prompt = buildPrompt(payload)

  // Initialize your SDK; stream chunks back via:
  // res.write(`data: ${chunkText}\n\n`)
}

module.exports = { getDefinition }
```

2. Register it in `server/providers/index.js`:

```js
const { getDefinition: <name> } = require('./<name>')
const providers = { claude, gemini, openai, openrouter, <name> }
```

3. Add `<NAME>_API_KEY=` to both `.env` and `.env.example`.

The `/api/define` route and rate limiting already handle any registered provider automatically.

---

## Bring Your Own Key (BYOK)

Every AI provider supports two key sources — the server's env key and a user-supplied key. The lookup order is:

```
request.apiKey  →  process.env.<PROVIDER>_API_KEY  →  throw (unconfigured)
```

**How it works in the UI:**

1. In the reader, click the key icon next to the provider selector to open the API key modal
2. Enter your key for the active provider (Claude, Gemini, OpenAI, or OpenRouter)
3. The key is saved to `localStorage` under `cl_apikey_<provider>` — scoped per provider, never sent to the server except as part of the definition request
4. Every `/api/define` call includes the key in the request body; the server uses it for that request only and never persists it
5. Clear the key at any time from the same modal; the server env key takes over again

**When no server env key is set and no user key is provided, the request throws and the user sees an error.**
For a self-hosted deployment without any env keys configured, users must always supply their own key.

---

## Security Notes

- API keys provided by users are never stored server-side — they are used once per request and discarded
- User-supplied keys stored client-side live only in `localStorage` on the user's own machine
- JWT tokens expire after 30 days; re-login is required after expiry
- All routes are protected by Helmet security headers and CORS restricted to `CLIENT_ORIGIN`
- MongoDB credentials should use a dedicated Atlas user with read/write access to the `contextlens` database only

---

## Contributing

Pull requests are welcome. For significant changes, please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

[MIT](LICENSE)

---

<div align="center">
  <sub>Built with Claude, Gemini, GPT-4o-mini & OpenRouter</sub>
</div>
