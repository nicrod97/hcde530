import fs from 'node:fs';
import path from 'node:path';

const CSS_PATH = path.resolve(process.cwd(), 'src/index.css');
const MIN_RATIO = 4.5;

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const value = Number.parseInt(full, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function linearize(channel) {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(foreground, background) {
  const fg = luminance(foreground);
  const bg = luminance(background);
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

function readTokens(cssContent) {
  const entries = [...cssContent.matchAll(/--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,6})\s*;/g)];
  const tokens = {};
  for (const entry of entries) {
    tokens[`--${entry[1]}`] = entry[2];
  }
  return tokens;
}

function token(tokens, name) {
  const value = tokens[name];
  if (!value) {
    throw new Error(`Missing token ${name} in src/index.css`);
  }
  return value;
}

function run() {
  const css = fs.readFileSync(CSS_PATH, 'utf8');
  const tokens = readTokens(css);

  const checks = [
    {
      label: 'Body text on base surface',
      fg: token(tokens, '--color-text-primary'),
      bg: token(tokens, '--color-surface-base'),
    },
    {
      label: 'Body text on card surface',
      fg: token(tokens, '--color-text-primary'),
      bg: token(tokens, '--color-surface-card'),
    },
    {
      label: 'Secondary text on card surface',
      fg: token(tokens, '--color-text-secondary'),
      bg: token(tokens, '--color-surface-card'),
    },
    {
      label: 'Muted text on card surface',
      fg: token(tokens, '--color-text-muted'),
      bg: token(tokens, '--color-surface-card'),
    },
    {
      label: 'Muted text on soft surface',
      fg: token(tokens, '--color-text-muted'),
      bg: token(tokens, '--color-surface-soft'),
    },
    {
      label: 'CTA text on CTA background',
      fg: token(tokens, '--color-cta-text'),
      bg: token(tokens, '--color-cta-bg'),
    },
    {
      label: 'CTA text on CTA hover',
      fg: token(tokens, '--color-cta-text'),
      bg: token(tokens, '--color-cta-hover'),
    },
    {
      label: 'CTA text on CTA press',
      fg: token(tokens, '--color-cta-text'),
      bg: token(tokens, '--color-cta-press'),
    },
  ];

  let hasFailure = false;
  for (const check of checks) {
    const ratio = contrastRatio(check.fg, check.bg);
    const pass = ratio >= MIN_RATIO;
    const status = pass ? 'PASS' : 'FAIL';
    if (!pass) hasFailure = true;
    console.log(`${check.label}: ${check.fg} on ${check.bg} = ${ratio.toFixed(2)}:1 ${status}`);
  }

  if (hasFailure) {
    process.exitCode = 1;
  }
}

run();
