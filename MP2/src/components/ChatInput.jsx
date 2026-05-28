import { useRef, useState } from 'react';

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export default function ChatInput({
  onAnalyze,
  isLoading,
  context: controlledContext,
  onContextChange,
}) {
  const isControlled = controlledContext !== undefined;
  const [internalContext, setInternalContext] = useState('');
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  const context = isControlled ? controlledContext : internalContext;
  const setContext = isControlled ? onContextChange : setInternalContext;

  function handleFile(file) {
    if (!file || !ACCEPTED_TYPES.includes(file.type)) return;
    setImage({ file, previewUrl: URL.createObjectURL(file) });
  }

  function handlePaste(e) {
    const file = Array.from(e.clipboardData.files).find((f) => ACCEPTED_TYPES.includes(f.type));
    if (file) handleFile(file);
  }

  function handleSubmit() {
    if (!image || isLoading) return;
    onAnalyze(image.file, context);
    setImage(null);
    setContext('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {image && (
        <div className="px-4 pt-3">
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1.5">
            <img src={image.previewUrl} alt="Attached" className="h-8 w-8 object-cover rounded" />
            <span className="text-xs text-gray-600 max-w-[140px] truncate">{image.file.name}</span>
            <button
              onClick={() => setImage(null)}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 px-3 py-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors mb-0.5"
          aria-label="Attach screenshot"
          title="Attach screenshot"
        >
          <PaperclipIcon />
        </button>

        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={image ? 'Add context (optional)…' : 'Attach a screenshot to analyze…'}
          rows={1}
          className="flex-1 resize-none text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none leading-relaxed py-1.5 max-h-32 overflow-y-auto"
        />

        <button
          onClick={handleSubmit}
          disabled={!image || isLoading}
          className={[
            'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors mb-0.5',
            !image || isLoading
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-700',
          ].join(' ')}
          aria-label="Analyze"
        >
          {isLoading ? <SmallSpinner /> : <ArrowUpIcon />}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

function PaperclipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}

function SmallSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
