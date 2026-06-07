import { useEffect, useRef, useState } from 'react';
import LandingPage from './components/LandingPage.jsx';
import Report from './components/Report.jsx';
import SessionHistory from './components/SessionHistory.jsx';
import SlideOverPanel from './components/SlideOverPanel.jsx';
import { analyzeInterface, createThumbnailDataUrl } from './lib/api.js';

const STORAGE_KEY = 'evalbridge.sessions.v1';
const MAX_SESSIONS = 25;
const LOADING_MESSAGES = [
  'Preparing screenshot for analysis',
  'Analyzing interface structure and usability',
  'Checking findings for consistency',
  'Preparing your report view',
];

function normalizeSession(session) {
  if (!session || typeof session !== 'object') return null;
  return {
    ...session,
  };
}

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeSession)
      .filter(Boolean);
  } catch {
    return [];
  }
}

export default function App() {
  const [status, setStatus] = useState('idle');
  const [report, setReport] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [sessions, setSessions] = useState(() => loadSessions().slice(0, MAX_SESSIONS));
  const [showRecentSidebar, setShowRecentSidebar] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const responseRef = useRef(null);
  const recentButtonRef = useRef(null);

  async function handleAnalyze(imageFile, contextText, personaKey) {
    const nextPersona = personaKey ?? null;
    setStatus('loading');
    setReport(null);
    setErrorMsg('');
    setLoadingMessageIndex(0);

    try {
      const result = await analyzeInterface(imageFile, contextText, personaKey);
      const sessionId = crypto.randomUUID();
      const session = {
        id: sessionId,
        createdAt: new Date().toISOString(),
        personaKey: nextPersona,
        context: contextText ?? '',
        report: result,
        summary: result.summary,
        screenshotName: imageFile.name ?? '',
        thumbnailDataUrl: null,
      };

      setSessions((prev) => [session, ...prev].slice(0, MAX_SESSIONS));
      setActiveSessionId(sessionId);
      setReport(result);
      setStatus('success');

      createThumbnailDataUrl(imageFile)
        .then((thumbnailDataUrl) => {
          setSessions((prev) =>
            prev.map((existing) =>
              existing.id === sessionId ? { ...existing, thumbnailDataUrl } : existing
            )
          );
        })
        .catch(() => {
          // keep session entry without thumbnail if generation fails
        });
    } catch (err) {
      setErrorMsg(err.message ?? 'An unexpected error occurred.');
      setStatus('error');
    }
  }

  function handleNewAnalysis() {
    setStatus('idle');
    setReport(null);
    setActiveSessionId(null);
    setErrorMsg('');
    setShowRecentSidebar(false);
  }

  useEffect(() => {
    if (status === 'success' || status === 'loading') {
      responseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [status]);

  useEffect(() => {
    if (status !== 'loading') return undefined;
    const intervalId = window.setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1400);
    return () => window.clearInterval(intervalId);
  }, [status]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
    } catch {
      // ignore persistence failures, app remains usable in-memory
    }
  }, [sessions]);

  function handleOpenSession(session) {
    setReport(session.report);
    setActiveSessionId(session.id);
    setErrorMsg('');
    setStatus('success');
  }

  function handleDeleteSession(sessionId) {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }
  }

  function handleClearHistory() {
    setSessions([]);
    setActiveSessionId(null);
  }

  function closeRecentPanel() {
    setShowRecentSidebar(false);
    window.setTimeout(() => {
      recentButtonRef.current?.focus();
    }, 0);
  }

  if (status === 'idle') {
    return (
      <LandingPage
        onAnalyze={handleAnalyze}
        isLoading={false}
        sessions={sessions}
        onOpenSession={handleOpenSession}
        onDeleteSession={handleDeleteSession}
        onClearHistory={handleClearHistory}
      />
    );
  }

  function handleExport() {
    if (!report) return;
    const { summary, findings, quick_wins } = report;
    const quickWins = Array.isArray(quick_wins) ? quick_wins : [];
    const exportDate = new Date().toLocaleString();

    const escapeHtml = (value) => String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

    const summaryCards = [
      { label: 'Total', value: summary?.total ?? 0 },
      { label: 'Critical', value: summary?.critical ?? 0 },
      { label: 'Major', value: summary?.major ?? 0 },
      { label: 'Minor', value: summary?.minor ?? 0 },
      { label: 'Cosmetic', value: summary?.cosmetic ?? 0 },
    ].map((item) => `
      <div class="summary-card">
        <p class="summary-label">${escapeHtml(item.label)}</p>
        <p class="summary-value">${escapeHtml(item.value)}</p>
      </div>
    `).join('');

    const quickWinsMarkup = quickWins.length > 0
      ? `
        <section class="panel">
          <h2>Quick Wins</h2>
          <div class="stack">
            ${quickWins.map((win) => `
              <article class="finding-item">
                <p class="finding-title">[${escapeHtml(win.finding_id)}] ${escapeHtml(win.title)}</p>
                <p class="body-text">${escapeHtml(win.why)}</p>
              </article>
            `).join('')}
          </div>
        </section>
      `
      : '';

    const findingsMarkup = findings.map((finding, index) => `
      <article class="panel finding-panel">
        <p class="finding-kicker">Finding ${index + 1}</p>
        <h3>${escapeHtml(finding.title)}</h3>
        <p class="meta">
          <strong>${escapeHtml((finding.severity || '').toUpperCase())}</strong>
          · ${escapeHtml(finding.category)}
          · ${escapeHtml(finding.effort)} effort
          · ID ${escapeHtml(finding.id)}
        </p>
        ${finding.heuristic ? `<p class="meta">Heuristic: ${escapeHtml(finding.heuristic)}</p>` : ''}
        ${finding.wcag ? `<p class="meta">WCAG: ${escapeHtml(finding.wcag)}</p>` : ''}
        <p class="section-label">Description</p>
        <p class="body-text">${escapeHtml(finding.description)}</p>
        <p class="section-label">Recommendation</p>
        <p class="body-text">${escapeHtml(finding.recommendation)}</p>
      </article>
    `).join('');

    const html = `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>CYW Report</title>
          <style>
            :root {
              --color-surface-base: #f5fbef;
              --color-surface-soft: #f7fdee;
              --color-surface-card: #ffffff;
              --color-surface-border: #d8e9c8;
              --color-text-primary: #1a1a1a;
              --color-text-secondary: #2f2f2f;
              --color-text-muted: #404040;
              --color-cta-bg: #cc4e10;
              --color-cta-shadow: #7c2d12;
              --color-cta-text: #ffffff;
            }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 32px;
              background: var(--color-surface-base);
              color: var(--color-text-primary);
              font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
              line-height: 1.45;
            }
            .container {
              max-width: 960px;
              margin: 0 auto;
              display: flex;
              flex-direction: column;
              gap: 20px;
            }
            h1, h2, h3 {
              margin: 0;
              font-family: Nunito, Inter, ui-sans-serif, system-ui, sans-serif;
              letter-spacing: -0.02em;
              color: var(--color-text-primary);
            }
            h1 { font-size: 38px; font-weight: 900; }
            h2 { font-size: 22px; font-weight: 800; }
            h3 { font-size: 18px; font-weight: 800; }
            .brand {
              display: inline-block;
              margin-bottom: 8px;
              font-size: 12px;
              font-weight: 800;
              letter-spacing: 0.14em;
              text-transform: uppercase;
              color: var(--color-text-muted);
            }
            .export-date {
              margin: 6px 0 0;
              color: var(--color-text-muted);
              font-size: 13px;
            }
            .panel {
              background: var(--color-surface-card);
              border: 1px solid var(--color-surface-border);
              border-radius: 18px;
              padding: 18px 20px;
              box-shadow: 0 3px 0 0 var(--color-surface-border);
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
              gap: 10px;
              margin-top: 14px;
            }
            .summary-card {
              border: 1px solid var(--color-surface-border);
              border-radius: 12px;
              padding: 10px 12px;
              background: var(--color-surface-soft);
            }
            .summary-label {
              margin: 0 0 4px;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.12em;
              color: var(--color-text-muted);
            }
            .summary-value {
              margin: 0;
              font-size: 24px;
              font-weight: 900;
              color: var(--color-text-primary);
              font-family: Nunito, Inter, ui-sans-serif, system-ui, sans-serif;
            }
            .stack {
              display: flex;
              flex-direction: column;
              gap: 10px;
              margin-top: 12px;
            }
            .finding-item {
              border: 1px solid var(--color-surface-border);
              border-radius: 12px;
              background: var(--color-surface-soft);
              padding: 10px 12px;
            }
            .finding-panel {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            .finding-kicker {
              margin: 0;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.12em;
              text-transform: uppercase;
              color: var(--color-cta-bg);
            }
            .finding-title {
              margin: 0 0 4px;
              font-size: 16px;
              font-weight: 800;
              color: var(--color-text-primary);
            }
            .meta {
              margin: 0;
              color: var(--color-text-muted);
              font-size: 13px;
            }
            .section-label {
              margin: 4px 0 0;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 0.12em;
              text-transform: uppercase;
              color: var(--color-text-muted);
            }
            .body-text {
              margin: 0;
              color: var(--color-text-secondary);
              font-size: 14px;
            }
            @page {
              size: auto;
              margin: 14mm;
            }
            @media print {
              body {
                padding: 0;
                background: var(--color-surface-card);
              }
              .container {
                max-width: none;
                gap: 14px;
              }
              .panel,
              .finding-item,
              .summary-card {
                break-inside: avoid;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <header>
              <span class="brand">CYW! · Check your Work</span>
              <h1>Interface Evaluation Report</h1>
              <p class="export-date">Exported ${escapeHtml(exportDate)}</p>
            </header>

            <section class="panel">
              <h2>Summary</h2>
              <div class="summary-grid">${summaryCards}</div>
            </section>

            ${quickWinsMarkup}

            <section class="stack">
              <h2>Findings</h2>
              ${findingsMarkup}
            </section>
          </div>
          <script>
            window.addEventListener('load', () => {
              setTimeout(() => {
                window.focus();
                window.print();
              }, 180);
            });
          </script>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      return;
    }

    // Popup blocked fallback: keep downloadable styled HTML.
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cyw-report.html';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" aria-busy={status === 'loading'}>
      <header className="sticky top-0 z-10 bg-white/95 border-b border-[var(--color-surface-border)] px-6 py-4 flex items-center justify-between backdrop-blur-sm shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <button
          type="button"
          onClick={handleNewAnalysis}
          aria-label="Go to landing page"
          className="text-[20px] font-black tracking-tighter leading-none text-[var(--color-text-primary)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-accent)] focus-visible:ring-offset-2 rounded-sm"
        >
          CYW!
        </button>
        <div className="flex items-center gap-2">
          {status === 'success' && report && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 text-xs font-semibold border border-[var(--color-surface-border)] bg-white text-[var(--color-text-secondary)] rounded-lg px-3 py-2 hover:border-[var(--color-focus-accent)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
            >
              <DownloadIcon />
              Export
            </button>
          )}
          {status === 'success' && sessions.length > 0 && (
            <button
              ref={recentButtonRef}
              type="button"
              onClick={() => setShowRecentSidebar((v) => !v)}
              aria-expanded={showRecentSidebar}
              aria-controls="recent-analyses-panel"
              className="text-xs font-semibold border border-[var(--color-surface-border)] bg-white text-[var(--color-text-secondary)] rounded-lg px-3 py-2 hover:border-[var(--color-focus-accent)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer"
            >
              {showRecentSidebar ? 'Hide recent' : 'Recent analyses'}
            </button>
          )}
          <button
            onClick={handleNewAnalysis}
            className="text-xs font-semibold bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] rounded-lg px-3 py-2 hover:bg-[var(--color-cta-hover)] active:translate-y-[1px] transition-all cursor-pointer shadow-[0_2px_0_0_var(--color-cta-shadow)]"
          >
            + New analysis
          </button>
        </div>
      </header>

      <main ref={responseRef} className="flex-1 w-full max-w-5xl mx-auto px-6 py-10">
        {status === 'loading' && (
          <div
            className="flex flex-col items-center justify-center min-h-[360px] gap-4"
            role="status"
            aria-live="polite"
          >
            <ThinkingDots />
            <p className="text-sm font-medium text-[var(--color-text-muted)] tracking-wide">
              {LOADING_MESSAGES[loadingMessageIndex]}
            </p>
          </div>
        )}

        {status === 'error' && (
          <div
            className="max-w-lg mx-auto rounded-2xl border border-red-200 bg-red-50/95 p-6 flex flex-col gap-2 shadow-[0_6px_16px_rgba(180,38,38,0.08)]"
            role="alert"
          >
            <p className="text-sm font-bold text-red-700">Analysis failed</p>
            <p className="text-xs text-red-600 font-mono break-all leading-relaxed">{errorMsg}</p>
            <button
              onClick={handleNewAnalysis}
              className="mt-2 self-start text-xs font-semibold text-red-700 underline underline-offset-2 hover:text-red-900 transition-colors cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {status === 'success' && report && (
          <div className="flex-1 min-w-0">
            <Report
              report={report}
            />
          </div>
        )}
      </main>

      <SlideOverPanel
        isOpen={status === 'success' && showRecentSidebar}
        onClose={closeRecentPanel}
        title="Recent analyses"
        labelledById="recent-analyses-title"
      >
        <div id="recent-analyses-panel">
          <SessionHistory
            sessions={sessions}
            onOpen={(session) => {
              handleOpenSession(session);
              closeRecentPanel();
            }}
            onDelete={handleDeleteSession}
            onClear={handleClearHistory}
            compact
          />
        </div>
      </SlideOverPanel>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v13m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ThinkingDots() {
  return (
    <div className="flex gap-1.5 items-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[var(--color-cta-bg)] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
