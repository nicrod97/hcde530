import { useEffect, useRef, useState } from 'react';
import SessionHistory from './SessionHistory.jsx';
import { PERSONAS } from '../lib/personas.js';

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
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10 lg:gap-12 items-start">
        <div className="w-full max-w-[560px] flex flex-col gap-12">

        {/* Wordmark */}
        <div>
          <h1 className="text-[52px] font-black tracking-tighter text-zinc-950 leading-none">
            EvalBridge
          </h1>
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-zinc-400 mt-3">
            Heuristic &amp; accessibility evaluator
          </p>
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
              'relative rounded-xl border cursor-pointer transition-all select-none overflow-hidden',
              dragOver
                ? 'border-zinc-900 bg-zinc-50'
                : image
                ? 'border-zinc-200 bg-white'
                : 'border-zinc-200 bg-white hover:border-zinc-400',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2',
              image ? 'h-52' : 'h-36',
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
                  <span className="text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg px-3 py-1 shadow-sm">
                    Replace image
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <UploadIcon />
                <p className="text-sm text-zinc-500">
                  Drop or <span className="text-zinc-950 font-semibold">click to upload</span>
                </p>
                <p id="upload-help" className="text-[11px] text-zinc-400 font-mono">PNG · JPG · WEBP</p>
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
            className={['flex flex-col gap-3 transition-opacity', step2Active ? 'opacity-100' : 'opacity-35 pointer-events-none'].join(' ')}
            disabled={!step2Active}
          >
            <StepLabel number={2} label="Choose evaluation voice" active={step2Active} />

            <legend className="sr-only">Choose evaluation voice</legend>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Evaluation voice">
              <PersonaPill
                label="Base"
                description="No specific voice — plain neutral recommendations."
                selected={persona === null}
                onClick={() => setPersona(null)}
              />
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
              <p className="text-xs text-zinc-500 leading-relaxed">{PERSONAS[persona]?.description}</p>
            )}
          </fieldset>

          {/* Analyze button */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleAnalyzeClick}
              disabled={!image || isLoading}
              className={[
                'w-full rounded-xl py-3.5 text-sm font-semibold tracking-wide transition-all',
                !image || isLoading
                  ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  : 'bg-zinc-950 text-white hover:bg-zinc-800 cursor-pointer',
              ].join(' ')}
            >
              {isLoading ? 'Analyzing…' : 'Analyze interface'}
            </button>
          </div>
        </div>

        <div className="w-full border-t border-zinc-200 pt-6 lg:border-t-0 lg:pt-0 lg:border-l lg:border-zinc-200 lg:pl-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-3">
            Recent analyses
          </p>
          <SessionHistory
            sessions={sessions}
            onOpen={onOpenSession}
            onDelete={onDeleteSession}
            onClear={onClearHistory}
            collapsedByDefault
            initialVisibleCount={3}
          />
        </div>
      </div>
    </div>
  );
}

function StepLabel({ number, label, active }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[11px] text-zinc-400 tabular-nums select-none">
        0{number}
      </span>
      <span className={['text-sm font-medium', active ? 'text-zinc-950' : 'text-zinc-400'].join(' ')}>
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
        'rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer border',
        selected
          ? 'bg-zinc-950 text-white border-zinc-950'
          : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-950 hover:text-zinc-950',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-zinc-400" aria-hidden="true">
      <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 9l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
