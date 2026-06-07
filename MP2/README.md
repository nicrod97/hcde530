# Check your Work!

Check your Work! is a web tool that reviews interface screenshots for usability and accessibility issues. It uses AI to generate structured findings, then presents results in a learning-first guided walkthrough (overview -> finding lessons -> recap), with an optional full report for detailed inspection. The tool is designed for designers, UX researchers, students, and product teams who want quick, actionable feedback on UI quality.

## Live Tool (Public URL)

Use the deployed app here: [https://mp2-nico2323-projects.vercel.app](https://mp2-nico2323-projects.vercel.app)

## Who It Is For

- UX/UI designers reviewing mockups before handoff
- Researchers and students learning how to interpret usability/accessibility findings
- Product teams who need prioritized fix recommendations from a screenshot

## What the Tool Produces

- Severity-ranked findings (`critical`, `major`, `minor`, `cosmetic`)
- Category labels (`heuristic`, `accessibility`, `best-practice`)
- Estimated effort (`low`, `medium`, `high`)
- Guided walkthrough: overview -> finding-by-finding lessons -> recap action plan
- Optional full report with filters and kanban grouping for exhaustive review

## How to Use (Live)

1. Open the public URL.
2. Upload a screenshot (`png`, `jpg`, `jpeg`, or `webp`).
3. Choose an evaluation voice/persona (optional).
4. Run analysis and review the guided walkthrough first.
5. Open **Browse full report** if you want the full kanban/filtered view.

## Run Locally

From the `MP2` directory:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add env var in `.env` or `.env.local`:
   ```env
   ANTHROPIC_API_KEY=your_key_here
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```
4. Open the local URL shown by Vite (usually `http://localhost:5173`).

## Technical Notes

- Anthropic requests are sent through a Vercel serverless API route: `api/analyze.js`.
- `ANTHROPIC_API_KEY` is configured as a secret environment variable in Vercel and is never exposed in client-side code.
- To replicate this project locally or deploy your own copy, you must provide your own Anthropic API key in `.env`/`.env.local` (local) or Vercel environment settings (hosted).
- Model responses are validated/normalized with Zod-based repair logic before rendering.
- Session history is stored locally in browser `localStorage`.

## Troubleshooting

- **`npm run dev` fails with missing `package.json`**
  - Run commands from the `MP2` directory.
- **`Missing ANTHROPIC_API_KEY on server.`**
  - Add `ANTHROPIC_API_KEY` to local env files or Vercel environment settings.
- **Model output fails validation or looks incomplete**
  - Retry with a clearer, higher-resolution screenshot.
