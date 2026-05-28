import { buildSystemPrompt } from './personas.js';

const MAX_PX = 7900; // stay under Anthropic's 8000px limit

/**
 * Converts a File object to a base64 string, resizing if either dimension
 * exceeds MAX_PX. Returns { base64, mediaType }.
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const { naturalWidth: w, naturalHeight: h } = img;

        if (w <= MAX_PX && h <= MAX_PX) {
          resolve({ base64: reader.result.split(',')[1], mediaType: file.type });
          return;
        }

        const scale = Math.min(MAX_PX / w, MAX_PX / h);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

        // Always output JPEG for resized images to keep size reasonable
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve({ base64: dataUrl.split(',')[1], mediaType: 'image/jpeg' });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Normalises browser MIME types to the subset Anthropic's API accepts.
 */
function normaliseMediaType(mimeType) {
  const map = {
    'image/jpeg': 'image/jpeg',
    'image/jpg': 'image/jpeg',
    'image/png': 'image/png',
    'image/webp': 'image/webp',
    'image/gif': 'image/gif',
  };
  return map[mimeType] ?? 'image/jpeg';
}

/**
 * Calls the Anthropic Messages API with the uploaded image and optional context.
 * Returns the parsed JSON report object.
 *
 * @param {File} imageFile
 * @param {string} contextText
 * @returns {Promise<object>} parsed report
 */
export async function analyzeInterface(imageFile, contextText = '', personaKey = null) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Missing VITE_ANTHROPIC_API_KEY. Add it to your .env file and restart the dev server.'
    );
  }

  const { base64: imageBase64, mediaType: rawMediaType } = await fileToBase64(imageFile);
  const imageMediaType = normaliseMediaType(rawMediaType);

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

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'interleaved-thinking-2025-05-14',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 4000,
      system: buildSystemPrompt(personaKey),
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let detail = `HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      detail = parsed?.error?.message ?? detail;
    } catch {
      // leave detail as-is
    }
    throw new Error(detail);
  }

  const data = await response.json();

  // Find the first text content block
  const textBlock = data.content?.find((block) => block.type === 'text');
  if (!textBlock) {
    throw new Error('No text content block in API response.');
  }

  // Strip markdown fences if the model wrapped the JSON anyway
  const raw = textBlock.text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('API returned non-JSON content. Check your system prompt.');
  }
}
