import { useEffect, useRef } from 'react';

export default function SlideOverPanel({
  isOpen,
  onClose,
  title = 'Panel',
  labelledById = 'slide-over-title',
  children,
}) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={[
        'fixed inset-0 z-50 transition-opacity duration-250',
        isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
      ].join(' ')}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close recent analyses panel"
        onClick={onClose}
        className={[
          'absolute inset-0 bg-[#1e2a15]/35 transition-opacity duration-250',
          isOpen ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById}
        className={[
          'absolute bg-[#f9fff4] shadow-[0_18px_36px_rgba(42,60,27,0.18)] border-[#d8e9c8] transition-transform duration-300 ease-out',
          'w-full max-h-[82vh] bottom-0 left-0 rounded-t-3xl border-t',
          'sm:max-h-none sm:top-0 sm:right-0 sm:bottom-0 sm:left-auto sm:w-[20rem] sm:rounded-none sm:border-l sm:border-t-0',
          isOpen
            ? 'translate-y-0 sm:translate-y-0 sm:translate-x-0'
            : 'translate-y-full sm:translate-y-0 sm:translate-x-full',
        ].join(' ')}
      >
        <header className="px-4 py-3 border-b border-[#d8e9c8] flex items-center justify-between gap-3 bg-[#f4fbe9]">
          <h2 id={labelledById} className="text-sm font-bold text-[var(--color-text-primary)]">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="text-xs font-semibold rounded-lg border border-[#cfe4b5] bg-white text-[var(--color-text-muted)] px-2 py-1 hover:border-[#f97316] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-accent)] focus-visible:ring-offset-2"
          >
            Close
          </button>
        </header>
        <div className="p-3 overflow-y-auto h-[calc(82vh-53px)] sm:h-[calc(100vh-53px)]">
          {children}
        </div>
      </section>
    </div>
  );
}
