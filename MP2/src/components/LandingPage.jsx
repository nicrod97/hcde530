import { useEffect, useRef, useState } from 'react';
import SessionHistory from './SessionHistory.jsx';
import { PERSONAS } from '../lib/personas.js';
import landingCharacter from '../assets/landing-character.png';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export default function LandingPage({
  onAnalyze,
  isLoading,
  sessions = [],
  onOpenSession,
  onDeleteSession,
  onClearHistory,
}) {
  const [image, setImage] = useState(null);
  const [persona, setPersona] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  function clearImagePreview() {
    setImage((prev) => {
      if (prev?.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return null;
    });
  }

  function handleFile(file) {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError('Unsupported file type. Please upload PNG, JPG, or WEBP.');
      return;
    }
    setUploadError('');
    clearImagePreview();
    setImage({ file, previewUrl: URL.createObjectURL(file) });
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  function handleAnalyzeClick() {
    if (!image || isLoading) return;
    onAnalyze(image.file, '', persona);
    clearImagePreview();
  }

  useEffect(() => () => {
    if (image?.previewUrl) {
      URL.revokeObjectURL(image.previewUrl);
    }
  }, [image?.previewUrl]);

  const step2Active = !!image;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-12 lg:gap-14 items-start">
        <div className="w-full">
          <div className="w-full max-w-[520px] flex flex-col gap-10">

        {/* Wordmark */}
        <div className="flex flex-col gap-4">
          <span className="inline-flex items-center self-start rounded-full bg-[var(--color-surface-soft)] border border-[var(--color-surface-border)] px-3 py-1 text-[10px] font-bold tracking-[0.18em] uppercase text-[var(--color-text-muted)]">
            AI-powered · Free
          </span>
          <div>
            <h1 className="text-[48px] font-black tracking-tighter text-[var(--color-text-primary)] leading-[1.05]">
              Check your Work!
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-3 leading-relaxed">
              Upload any UI screenshot and get a structured accessibility &amp; heuristic evaluation in seconds.
            </p>
          </div>
        </div>

        {/* Step 1 — Upload */}
        <div className="flex flex-col gap-3">
          <StepLabel number={1} label="Upload a screenshot" active />

          <button
            type="button"
            aria-label="Upload screenshot"
            aria-describedby="upload-help upload-error"
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={[
              'relative rounded-2xl border-2 cursor-pointer transition-all select-none overflow-hidden',
              dragOver
                ? 'border-[#f97316] bg-orange-50'
                : image
                ? 'border-[var(--color-surface-border)] bg-white'
                : 'border-dashed border-[var(--color-surface-border)] bg-[var(--color-surface-soft)] hover:border-[var(--color-focus-accent)] hover:bg-orange-50/40',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-accent)] focus-visible:ring-offset-2',
              image ? 'h-52' : 'h-40',
            ].join(' ')}
          >
            {image ? (
              <>
                <img
                  src={image.previewUrl}
                  alt="Upload preview"
                  className="absolute inset-0 w-full h-full object-contain p-3"
                />
                <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 hover:opacity-100 transition-opacity bg-white/90">
                  <span className="text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-card)] border border-[var(--color-surface-border)] rounded-xl px-3 py-1 shadow-sm">
                    Replace image
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <UploadIcon />
                <p className="text-sm text-[var(--color-text-muted)]">
                  Drop or <span className="text-[var(--color-text-primary)] font-semibold">click to upload</span>
                </p>
                <p id="upload-help" className="text-[11px] text-[var(--color-text-muted)] font-mono">PNG · JPG · WEBP</p>
              </div>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <p
            id="upload-error"
            role="status"
            aria-live="polite"
            className={['text-xs', uploadError ? 'text-red-600' : 'sr-only'].join(' ')}
          >
            {uploadError || ' '}
          </p>
        </div>

          {/* Step 2 — Persona */}
          <fieldset
            className={['flex flex-col gap-3 transition-opacity', step2Active ? 'opacity-100' : 'opacity-40 pointer-events-none'].join(' ')}
            disabled={!step2Active}
          >
            <StepLabel number={2} label="Choose evaluation voice" active={step2Active} />
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Personas adjust the tone and perspective of your recommendations.
            </p>

            <legend className="sr-only">Choose evaluation voice</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Evaluation voice">
              {Object.entries(PERSONAS).map(([key, p]) => (
                <PersonaPill
                  key={key}
                  label={p.label}
                  description={p.description}
                  selected={persona === key}
                  onClick={() => setPersona(key)}
                />
              ))}
            </div>

            {persona && (
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{PERSONAS[persona]?.description}</p>
            )}
          </fieldset>

          {/* Analyze button */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleAnalyzeClick}
              disabled={!image || isLoading}
              className={[
                'w-full rounded-xl py-4 text-sm font-bold tracking-wide transition-all',
                !image || isLoading
                  ? 'bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] cursor-not-allowed border border-[var(--color-surface-border)]'
                  : 'bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] hover:bg-[var(--color-cta-hover)] active:translate-y-[1px] cursor-pointer shadow-[0_3px_0_0_var(--color-cta-shadow)]',
              ].join(' ')}
            >
              {isLoading ? 'Analyzing…' : 'Analyze interface'}
            </button>
          </div>
          </div>
        </div>

        <div className="w-full border-t border-[var(--color-surface-border)] pt-8 lg:border-t-0 lg:pt-0 flex flex-col gap-8">
          <SessionHistory
            sessions={sessions}
            onOpen={onOpenSession}
            onDelete={onDeleteSession}
            onClear={onClearHistory}
            collapsedByDefault
            initialVisibleCount={3}
          />
          <div className="hidden lg:flex justify-center pt-2">
            <img
              src={landingCharacter}
              alt=""
              aria-hidden="true"
              className="pointer-events-none select-none w-32 object-contain opacity-90"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepLabel({ number, label, active }) {
  return (
    <div className="flex items-center gap-3">
      <span className={[
        'w-6 h-6 rounded-full text-[10px] font-black tabular-nums flex items-center justify-center flex-shrink-0',
        active
          ? 'bg-[var(--color-cta-bg)] text-white'
          : 'bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] border border-[var(--color-surface-border)]',
      ].join(' ')}>
        {number}
      </span>
      <span className={['text-sm font-semibold tracking-tight', active ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'].join(' ')}>
        {label}
      </span>
    </div>
  );
}

function PersonaPill({ label, selected, onClick }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={[
        'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border',
        selected
          ? 'bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] border-[var(--color-cta-bg)]'
          : 'bg-white text-[var(--color-text-muted)] border-[var(--color-surface-border)] hover:border-[var(--color-focus-accent)] hover:text-[var(--color-text-primary)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-accent)] focus-visible:ring-offset-2',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--color-text-muted)]" aria-hidden="true">
      <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 9l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
