import { buildSystemPrompt } from '../src/lib/personas.js';

const MODEL = 'claude-opus-4-5';
const MAX_TOKENS = 3000;
const getEnv = (key) =>
  typeof globalThis?.process !== 'undefined' ? globalThis.process.env?.[key] : undefined;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = getEnv('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY on server.' });
  }

  const { imageBase64, imageMediaType, contextText = '', personaKey = null } = req.body ?? {};
  if (!imageBase64 || !imageMediaType) {
    return res.status(400).json({ error: 'Missing required image payload fields.' });
  }

  const userContent = [
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: imageMediaType,
        data: imageBase64,
      },
    },
    {
      type: 'text',
      text: contextText.trim()
        ? `Context: ${contextText.trim()}\n\nAnalyze this interface and return the evaluation JSON.`
        : 'Analyze this interface and return the evaluation JSON.',
    },
  ];

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'interleaved-thinking-2025-05-14',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: buildSystemPrompt(personaKey),
        messages: [{ role: 'user', content: userContent }],
      }),
    });

    const responseText = await upstream.text();
    if (!upstream.ok) {
      let detail = `HTTP ${upstream.status}`;
      try {
        const parsed = JSON.parse(responseText);
        detail = parsed?.error?.message ?? detail;
      } catch {
        // keep fallback message
      }
      return res.status(upstream.status).json({ error: detail });
    }

    try {
      const parsed = JSON.parse(responseText);
      return res.status(200).json(parsed);
    } catch {
      return res.status(502).json({ error: 'Upstream returned non-JSON response.' });
    }
  } catch {
    return res.status(502).json({ error: 'Failed to reach Anthropic API.' });
  }
}
