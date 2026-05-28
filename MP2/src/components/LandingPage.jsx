import { useRef, useState } from 'react';
import { PERSONAS } from '../lib/personas.js';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export default function LandingPage({ onAnalyze, isLoading }) {
  const [image, setImage] = useState(null);
  const [persona, setPersona] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  function handleFile(file) {
    if (!file || !ACCEPTED_TYPES.includes(file.type)) return;
    setImage({ file, previewUrl: URL.createObjectURL(file) });
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  const step2Active = !!image;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg flex flex-col gap-10">

        {/* Wordmark */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">EvalBridge</h1>
          <p className="text-gray-500 mt-1.5 text-[15px]">
            Heuristic &amp; accessibility evaluator
          </p>
        </div>

        {/* Step 1 — Upload */}
        <div className="flex flex-col gap-3">
          <StepLabel number={1} label="Upload a screenshot" active />

          <div
            role="button"
            tabIndex={0}
            aria-label="Upload screenshot"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            className={[
              'relative rounded-2xl border-2 border-dashed cursor-pointer transition-colors select-none overflow-hidden',
              dragOver
                ? 'border-gray-400 bg-gray-100'
                : image
                ? 'border-gray-200 bg-white'
                : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50',
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
                <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 hover:opacity-100 transition-opacity bg-white/60">
                  <span className="text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-1 shadow-sm">
                    Replace image
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <UploadIcon />
                <p className="text-sm text-gray-500">
                  Drag &amp; drop or <span className="font-medium text-gray-700">click to select</span>
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, WEBP</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        {/* Step 2 — Persona */}
        <div className={['flex flex-col gap-3 transition-opacity', step2Active ? 'opacity-100' : 'opacity-40 pointer-events-none'].join(' ')}>
          <StepLabel number={2} label="Choose evaluation voice" active={step2Active} />

          <div className="flex flex-wrap gap-2">
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
            <p className="text-xs text-gray-400 leading-relaxed">{PERSONAS[persona]?.description}</p>
          )}
        </div>

        {/* Analyze button */}
        <button
          onClick={() => onAnalyze(image.file, '', persona)}
          disabled={!image || isLoading}
          className={[
            'w-full rounded-xl py-3 text-sm font-medium transition-colors',
            !image || isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-700',
          ].join(' ')}
        >
          {isLoading ? 'Analyzing…' : 'Analyze interface'}
        </button>

        <p className="text-xs text-gray-400 text-center -mt-6">Powered by Claude</p>
      </div>
    </div>
  );
}

function StepLabel({ number, label, active }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className={[
        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0',
        active ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400',
      ].join(' ')}>
        {number}
      </span>
      <span className={['text-sm font-medium', active ? 'text-gray-900' : 'text-gray-400'].join(' ')}>
        {label}
      </span>
    </div>
  );
}

function PersonaPill({ label, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        selected
          ? 'bg-gray-900 text-white border-gray-900'
          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function UploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400" aria-hidden="true">
      <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 9l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
