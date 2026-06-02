import { useEffect, useRef, useState } from 'react';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export default function Sidebar({ onAnalyze, isLoading }) {
  const [image, setImage] = useState(null); // { file, previewUrl }
  const [context, setContext] = useState('');
  const [dragOver, setDragOver] = useState(false);
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
    if (!file || !ACCEPTED_TYPES.includes(file.type)) return;
    clearImagePreview();
    const previewUrl = URL.createObjectURL(file);
    setImage({ file, previewUrl });
  }

  function handleInputChange(e) {
    handleFile(e.target.files?.[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleClick() {
    fileInputRef.current?.click();
  }

  function handleSubmit() {
    if (!image || isLoading) return;
    onAnalyze(image.file, context);
    clearImagePreview();
  }

  useEffect(() => () => {
    if (image?.previewUrl) {
      URL.revokeObjectURL(image.previewUrl);
    }
  }, [image?.previewUrl]);

  return (
    <aside className="w-full md:w-[280px] md:min-w-[280px] bg-white border-r border-gray-200 flex flex-col p-5 gap-5 md:h-screen md:sticky md:top-0 md:overflow-y-auto">
      {/* Wordmark */}
      <div className="pt-1">
        <span className="text-xl font-semibold tracking-tight text-gray-900">EvalBridge</span>
        <p className="text-xs text-gray-400 mt-0.5 leading-snug">Heuristic &amp; accessibility evaluator</p>
      </div>

      {/* Divider */}
      <hr className="border-gray-100" />

      {/* Upload zone */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Screenshot</label>
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload screenshot"
          onClick={handleClick}
          onKeyDown={(e) => e.key === 'Enter' && handleClick()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={[
            'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed cursor-pointer transition-colors select-none',
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : image
              ? 'border-gray-200 bg-gray-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100',
            image ? 'h-44' : 'h-32',
          ].join(' ')}
        >
          {image ? (
            <>
              <img
                src={image.previewUrl}
                alt="Upload preview"
                className="absolute inset-0 w-full h-full object-contain rounded-lg p-2"
              />
              <div className="absolute inset-0 rounded-lg flex items-end justify-center pb-2 opacity-0 hover:opacity-100 transition-opacity bg-white/60">
                <span className="text-xs text-gray-600 bg-white border border-gray-200 rounded px-2 py-0.5 shadow-sm">
                  Replace
                </span>
              </div>
            </>
          ) : (
            <>
              <UploadIcon />
              <p className="text-xs text-gray-500 mt-2 text-center px-4">
                Drag &amp; drop or <span className="text-gray-700 font-medium">click to select</span>
              </p>
              <p className="text-[11px] text-gray-400 mt-1">PNG, JPG, WEBP</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {/* Context input */}
      <div className="flex flex-col gap-2">
        <label htmlFor="context-input" className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Context <span className="normal-case font-normal text-gray-400">(optional)</span>
        </label>
        <input
          id="context-input"
          type="text"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g. mobile checkout flow"
          className="w-full text-sm rounded-md border border-gray-200 bg-white px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition"
        />
      </div>

      {/* Analyze button */}
      <button
        onClick={handleSubmit}
        disabled={!image || isLoading}
        className={[
          'w-full flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
          !image || isLoading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-900 text-white hover:bg-gray-700 active:bg-gray-800',
        ].join(' ')}
      >
        {isLoading ? (
          <>
            <Spinner />
            Analyzing…
          </>
        ) : (
          'Analyze interface'
        )}
      </button>

      {/* Powered by note */}
      <p className="text-[11px] text-gray-400 text-center -mt-2">Powered by Claude</p>
    </aside>
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

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
