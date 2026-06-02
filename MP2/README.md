# EvalBridge (Vite + Vercel API Route)

EvalBridge calls Anthropic through a serverless endpoint at `api/analyze.js`.
The browser does not send the Anthropic key directly.

## Environment Variables

### Vercel (required)

Set this in your Vercel project settings:

- `ANTHROPIC_API_KEY=<your key>`

Apply it to at least Production (and Preview if needed), then redeploy.

### Local development

For local `npm run dev`, make sure your environment provides:

- `ANTHROPIC_API_KEY=<your key>`

You can place it in `.env` or `.env.local` in the `MP2` directory.

## Notes

- `VITE_ANTHROPIC_API_KEY` is no longer required for deployed usage.
- Client-side image preprocessing is still used; only the model call moved server-side.
