# EvalBridge

EvalBridge is a screenshot-based UX and accessibility evaluator built with React + Vite.
Upload an interface screenshot, choose an evaluation voice, and generate a structured report with:

- Severity-ranked findings (`critical`, `major`, `minor`, `cosmetic`)
- Category labels (`heuristic`, `accessibility`, `best-practice`)
- Estimated effort (`low`, `medium`, `high`)
- Quick wins and persona-based summary

Anthropic API calls are made through a serverless endpoint (`api/analyze.js`) so secrets stay on the server.

## Tech Stack

- React (Vite)
- Tailwind CSS
- Vercel Serverless Function (`api/analyze.js`)
- Anthropic Messages API
- Zod for model-output validation and normalization

## Project Structure

```
MP2/
  api/
    analyze.js              # Serverless API route (Anthropic proxy)
  src/
    components/             # UI building blocks
    lib/
      api.js                # Client-side image processing + API call + schema repair
      personas.js           # Persona definitions + system prompt builder
      systemPrompt.js       # Base system prompt
  README.md
```

## Getting Started (Local)

### 1) Install dependencies

```bash
npm install
```

### 2) Add environment variables

Create `MP2/.env` (or `MP2/.env.local`) with:

```env
ANTHROPIC_API_KEY=your_key_here
```

### 3) Run the app

```bash
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

## Available Scripts

- `npm run dev` - start development server
- `npm run build` - build for production
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint
- `npm run contrast:tokens` - verify core semantic color-token pairs meet WCAG AA contrast expectations

## Deployment (Vercel)

Set the following env var in your Vercel project settings:

- `ANTHROPIC_API_KEY`

Apply it to the environments you use (Production and optionally Preview), then redeploy.

## How It Works

1. User uploads an image in the client.
2. Client preprocesses/compresses image when needed.
3. Client sends payload to `/api/analyze`.
4. Serverless route calls Anthropic with system prompt + image.
5. Client validates and normalizes model JSON response (via Zod + repair logic).
6. UI renders report, filters, kanban view, and local session history.

## Notes

- `VITE_ANTHROPIC_API_KEY` is not required.
- API key should never be exposed in client-side code.
- Session history is stored locally in browser `localStorage`.

## Troubleshooting

- **`npm run dev` fails with missing `package.json`**
  - Make sure you are in the `MP2` directory before running npm commands.
- **`Missing ANTHROPIC_API_KEY on server.`**
  - Add `ANTHROPIC_API_KEY` to local `.env`/`.env.local` or Vercel env settings.
- **Model returns parsing/validation errors**
  - Retry with a clearer screenshot; low-quality images can produce weak or malformed outputs.

## Future Improvements

- Add unit tests for report normalization logic in `src/lib/api.js`
- Add endpoint hardening (payload size limits, request validation, rate limits)
- Improve keyboard and screen-reader accessibility on upload and filter controls
