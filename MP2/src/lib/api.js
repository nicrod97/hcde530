import { z } from 'zod';

const MAX_PX = 3000;
const THUMBNAIL_MAX_EDGE = 320;
const THUMBNAIL_QUALITY = 0.7;
const SEVERITIES = ['critical', 'major', 'minor', 'cosmetic'];
const CATEGORIES = ['heuristic', 'accessibility', 'best-practice'];
const EFFORTS = ['low', 'medium', 'high'];

const findingSchema = z.object({
  id: z.coerce.number().int().nonnegative(),
  title: z.string().min(1),
  category: z.enum(CATEGORIES),
  severity: z.enum(SEVERITIES),
  description: z.string().min(1),
  recommendation: z.string().min(1),
  effort: z.enum(EFFORTS),
  heuristic: z.string().min(1).optional(),
  wcag: z.string().min(1).optional(),
});

const quickWinSchema = z.object({
  finding_id: z.coerce.number().int().nonnegative(),
  title: z.string().min(1),
  why: z.string().min(1),
});

const reportSchema = z.object({
  persona: z.string().min(1),
  summary: z.object({
    critical: z.coerce.number().int().nonnegative(),
    major: z.coerce.number().int().nonnegative(),
    minor: z.coerce.number().int().nonnegative(),
    cosmetic: z.coerce.number().int().nonnegative(),
    total: z.coerce.number().int().nonnegative(),
  }),
  findings: z.array(findingSchema),
  quick_wins: z.array(quickWinSchema),
  persona_take: z.string(),
});

function asNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function normaliseEnum(value, allowedValues) {
  const normalized = asNonEmptyString(value)?.toLowerCase();
  return normalized && allowedValues.includes(normalized) ? normalized : null;
}

function computeSummaryFromFindings(findings) {
  const summary = { critical: 0, major: 0, minor: 0, cosmetic: 0, total: findings.length };
  findings.forEach((finding) => {
    if (summary[finding.severity] !== undefined) {
      summary[finding.severity] += 1;
    }
  });
  return summary;
}

function normalizeFinding(rawFinding, index, warnings, strict = false) {
  if (!rawFinding || typeof rawFinding !== 'object') {
    warnings.push(`Dropped finding ${index + 1}: invalid object shape.`);
    return null;
  }

  const title = asNonEmptyString(rawFinding.title);
  const description = asNonEmptyString(rawFinding.description);
  const recommendation = asNonEmptyString(rawFinding.recommendation);
  const category = normaliseEnum(rawFinding.category, CATEGORIES) ?? 'best-practice';
  const severity = normaliseEnum(rawFinding.severity, SEVERITIES) ?? 'minor';
  const effort = normaliseEnum(rawFinding.effort, EFFORTS) ?? 'medium';

  if (!title || !description || !recommendation) {
    warnings.push(`Dropped finding ${index + 1}: missing core fields (title/description/recommendation).`);
    return null;
  }

  const id = Number.isFinite(Number(rawFinding.id)) ? Number(rawFinding.id) : index + 1;
  const finding = {
    id,
    title,
    category,
    severity,
    description,
    recommendation,
    effort,
  };

  const heuristic = asNonEmptyString(rawFinding.heuristic);
  if (heuristic) finding.heuristic = heuristic;

  const wcag = asNonEmptyString(rawFinding.wcag);
  if (wcag) finding.wcag = wcag;

  if (strict) {
    // Strict pass trims any finding that still has implausible ID values.
    if (!Number.isInteger(finding.id) || finding.id < 0) {
      warnings.push(`Dropped finding ${index + 1}: invalid id in strict validation.`);
      return null;
    }
  }

  return finding;
}

function normalizeQuickWins(rawQuickWins, validFindingIds, warnings) {
  if (!Array.isArray(rawQuickWins)) {
    if (rawQuickWins !== undefined) {
      warnings.push('quick_wins was not an array and was reset to [].');
    }
    return [];
  }

  return rawQuickWins
    .map((rawWin, idx) => {
      if (!rawWin || typeof rawWin !== 'object') {
        warnings.push(`Dropped quick_wins item ${idx + 1}: invalid object.`);
        return null;
      }
      const findingId = Number(rawWin.finding_id);
      const title = asNonEmptyString(rawWin.title);
      const why = asNonEmptyString(rawWin.why);
      if (!Number.isInteger(findingId) || !title || !why) {
        warnings.push(`Dropped quick_wins item ${idx + 1}: missing/invalid fields.`);
        return null;
      }
      if (!validFindingIds.has(findingId)) {
        warnings.push(`Dropped quick_wins item ${idx + 1}: finding_id ${findingId} not in findings.`);
        return null;
      }
      return { finding_id: findingId, title, why };
    })
    .filter(Boolean);
}

function normalizeReportPayload(rawReport, { strict = false } = {}) {
  const warnings = [];
  const source = rawReport && typeof rawReport === 'object' ? rawReport : {};
  const findingsSource = Array.isArray(source.findings) ? source.findings : [];

  if (!Array.isArray(source.findings)) {
    warnings.push('findings was not an array and was reset to [].');
  }

  const findings = findingsSource
    .map((finding, idx) => normalizeFinding(finding, idx, warnings, strict))
    .filter(Boolean);

  const validFindingIds = new Set(findings.map((finding) => finding.id));
  const quickWins = normalizeQuickWins(source.quick_wins, validFindingIds, warnings);

  const computedSummary = computeSummaryFromFindings(findings);
  const providedSummary = source.summary && typeof source.summary === 'object'
    ? source.summary
    : null;

  if (!providedSummary) {
    warnings.push('summary missing or invalid; recomputed from findings.');
  } else {
    const providedTotal = Number(providedSummary.total);
    if (!Number.isFinite(providedTotal) || providedTotal !== computedSummary.total) {
      warnings.push('summary total did not match findings; recomputed summary.');
    }
  }

  const persona = asNonEmptyString(source.persona) ?? 'Standard';
  const personaTake = asNonEmptyString(source.persona_take) ?? '';

  return {
    report: {
      persona,
      summary: computedSummary,
      findings,
      quick_wins: quickWins,
      persona_take: personaTake,
    },
    warnings,
  };
}

function validateAndRepairReport(parsedJson) {
  const firstPass = normalizeReportPayload(parsedJson, { strict: false });
  const firstValidation = reportSchema.safeParse(firstPass.report);
  if (firstValidation.success) {
    return {
      report: firstValidation.data,
      warnings: firstPass.warnings,
    };
  }

  const secondPass = normalizeReportPayload(parsedJson, { strict: true });
  const secondValidation = reportSchema.safeParse(secondPass.report);
  if (secondValidation.success) {
    return {
      report: secondValidation.data,
      warnings: [
        ...firstPass.warnings,
        'Applied stricter fallback normalization to recover model output.',
        ...secondPass.warnings,
      ],
    };
  }

  const firstIssue = secondValidation.error?.issues?.[0];
  const detail = firstIssue
    ? `${firstIssue.path.join('.') || 'root'}: ${firstIssue.message}`
    : 'unknown validation issue';
  throw new Error(`Model output failed schema validation (${detail}).`);
}

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

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
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
 * Creates a compressed thumbnail data URL for local session history storage.
 *
 * @param {File} imageFile
 * @returns {Promise<string>} data URL
 */
export async function createThumbnailDataUrl(imageFile) {
  const dataUrl = await fileToDataUrl(imageFile);
  const img = new Image();

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = dataUrl;
  });

  const { naturalWidth: w, naturalHeight: h } = img;
  if (!w || !h) return dataUrl;

  const scale = Math.min(1, THUMBNAIL_MAX_EDGE / Math.max(w, h));
  const targetW = Math.max(1, Math.round(w * scale));
  const targetH = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  canvas.getContext('2d').drawImage(img, 0, 0, targetW, targetH);

  return canvas.toDataURL('image/jpeg', THUMBNAIL_QUALITY);
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
  const { base64: imageBase64, mediaType: rawMediaType } = await fileToBase64(imageFile);
  const imageMediaType = normaliseMediaType(rawMediaType);

  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageBase64,
      imageMediaType,
      contextText,
      personaKey,
    }),
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const parsed = await response.json();
      detail = parsed?.error ?? detail;
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

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('API returned non-JSON content. Check your system prompt.');
  }

  const { report, warnings } = validateAndRepairReport(parsed);
  if (warnings.length > 0) {
    return { ...report, _validationWarnings: warnings };
  }
  return report;
}
