import { useEffect, useRef, useState } from 'react';
import LandingPage from './components/LandingPage.jsx';
import Report from './components/Report.jsx';
import { analyzeInterface } from './lib/api.js';
import { PERSONAS } from './lib/personas.js';
import './App.css';

export default function App() {
  const [status, setStatus] = useState('idle');
  const [report, setReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastMessage, setLastMessage] = useState(null);
  const [persona, setPersona] = useState(null);
  const responseRef = useRef(null);

  async function handleAnalyze(imageFile, contextText, personaKey) {
    setPersona(personaKey ?? null);
    setLastMessage({ imageUrl: URL.createObjectURL(imageFile), context: contextText });
    setStatus('loading');
    setReport(null);
    setErrorMsg('');

    try {
      const result = await analyzeInterface(imageFile, contextText, personaKey);
      setReport(result);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message ?? 'An unexpected error occurred.');
      setStatus('error');
    }
  }

  function handleNewAnalysis() {
    setStatus('idle');
    setReport(null);
    setErrorMsg('');
    setLastMessage(null);
    setPersona(null);
  }

  useEffect(() => {
    if (status === 'success' || status === 'loading') {
      responseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [status]);

  if (status === 'idle') {
    return <LandingPage onAnalyze={handleAnalyze} isLoading={false} />;
  }

  // Suppress unused-var lint — kept for potential future use
  void lastMessage;
  void persona;
  void PERSONAS;

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">EvalBridge</span>
        <div className="flex items-center gap-2">
          {status === 'success' && report && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 text-xs font-medium border border-gray-200 bg-white text-gray-700 rounded-lg px-3 py-1.5 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <DownloadIcon />
              Export report
            </button>
          )}
          <button
            onClick={handleNewAnalysis}
            className="text-xs font-medium bg-indigo-600 text-white rounded-lg px-3 py-1.5 hover:bg-indigo-500 transition-colors"
          >
            + New analysis
          </button>
        </div>
      </header>

      <div ref={responseRef} className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[360px] gap-4">
            <ThinkingDots />
            <p className="text-sm text-gray-400">Analyzing interface…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="max-w-lg mx-auto rounded-xl border border-red-200 bg-red-50 p-5 flex flex-col gap-2">
            <p className="text-sm font-semibold text-red-800">Analysis failed</p>
            <p className="text-sm text-red-700 font-mono break-all leading-relaxed">{errorMsg}</p>
            <button
              onClick={handleNewAnalysis}
              className="mt-1 self-start text-xs font-medium text-red-700 underline underline-offset-2 hover:text-red-900 transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {status === 'success' && report && <Report report={report} />}
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v13m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function ThinkingDots() {
  return (
    <div className="flex gap-1 items-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
