import { useEffect, useRef, useState } from 'react';
import LandingPage from './components/LandingPage.jsx';
import Report from './components/Report.jsx';
import SessionHistory from './components/SessionHistory.jsx';
import SlideOverPanel from './components/SlideOverPanel.jsx';
import { analyzeInterface, createThumbnailDataUrl } from './lib/api.js';
import './App.css';

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
    const lines = [];
    lines.push('EVALBRIDGE REPORT');
    lines.push('=================');
    lines.push('');
    lines.push('SUMMARY');
    lines.push('-------');
    lines.push(`Total findings: ${summary.total}`);
    lines.push(`  Critical: ${summary.critical}`);
    lines.push(`  Major:    ${summary.major}`);
    lines.push(`  Minor:    ${summary.minor}`);
    lines.push(`  Cosmetic: ${summary.cosmetic}`);
    lines.push('');
    if (quick_wins && quick_wins.length > 0) {
      lines.push('QUICK WINS');
      lines.push('----------');
      quick_wins.forEach((win) => {
        lines.push(`[${win.finding_id}] ${win.title}`);
        lines.push(`  ${win.why}`);
      });
      lines.push('');
    }
    lines.push('FINDINGS');
    lines.push('--------');
    findings.forEach((f, i) => {
      lines.push(`${i + 1}. [${f.severity.toUpperCase()}] ${f.title}`);
      lines.push(`   ID: ${f.id} | Category: ${f.category} | Effort: ${f.effort}`);
      if (f.heuristic) lines.push(`   Heuristic: ${f.heuristic}`);
      if (f.wcag) lines.push(`   WCAG: ${f.wcag}`);
      lines.push('');
      lines.push('   Description:');
      lines.push(`   ${f.description}`);
      lines.push('');
      lines.push('   Recommendation:');
      lines.push(`   ${f.recommendation}`);
      lines.push('');
      lines.push('---');
      lines.push('');
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'evalbridge-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-base)] flex flex-col" aria-busy={status === 'loading'}>
      <header className="sticky top-0 z-10 bg-[#f9fff4]/95 border-b border-[var(--color-surface-border)] px-6 py-4 flex items-center justify-between backdrop-blur-sm">
        <span className="text-sm font-extrabold tracking-tight text-[var(--color-text-primary)]">EvalBridge</span>
        <div className="flex items-center gap-2">
          {status === 'success' && report && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 text-xs font-semibold border border-[#cfe4b5] bg-white text-[var(--color-text-secondary)] rounded-xl px-3 py-1.5 hover:border-[#f97316] hover:text-[var(--color-text-primary)] transition-all cursor-pointer shadow-[0_1px_0_0_#d9ebc9]"
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
              className="text-xs font-semibold border border-[#cfe4b5] bg-white text-[var(--color-text-secondary)] rounded-xl px-3 py-1.5 hover:border-[#f97316] hover:text-[var(--color-text-primary)] transition-all cursor-pointer shadow-[0_1px_0_0_#d9ebc9]"
            >
              {showRecentSidebar ? 'Hide recent analyses' : 'Show recent analyses'}
            </button>
          )}
          <button
            onClick={handleNewAnalysis}
            className="text-xs font-semibold bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] rounded-xl px-3 py-1.5 hover:bg-[var(--color-cta-hover)] active:translate-y-[1px] transition-all cursor-pointer shadow-[0_3px_0_0_var(--color-cta-shadow)]"
          >
            + New analysis
          </button>
        </div>
      </header>

      <main ref={responseRef} className="flex-1 w-full max-w-6xl mx-auto px-6 py-10">
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
