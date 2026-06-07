import { useMemo, useState } from 'react';
import { PERSONAS } from '../lib/personas.js';

function formatWhen(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return 'Unknown time';
  }
}

function personaLabel(personaKey, reportPersona) {
  if (!personaKey || personaKey === 'base') return reportPersona || 'Base';
  return PERSONAS[personaKey]?.label || reportPersona || 'Custom';
}

export default function SessionHistory({
  sessions,
  onOpen,
  onDelete,
  onClear,
  compact = false,
  collapsedByDefault = false,
  initialVisibleCount = 5,
}) {
  const [isExpanded, setIsExpanded] = useState(() => !collapsedByDefault);

  const allSessions = useMemo(() => {
    if (!sessions) return [];
    return compact ? sessions.slice(0, 5) : sessions;
  }, [compact, sessions]);

  const shouldCollapse = collapsedByDefault && allSessions.length > initialVisibleCount;
  const displayedSessions = shouldCollapse && !isExpanded
    ? allSessions.slice(0, initialVisibleCount)
    : allSessions;

  function sessionLabel(session) {
    const persona = personaLabel(session.personaKey, session.report?.persona);
    return `${persona} analysis from ${formatWhen(session.createdAt)}`;
  }

  if (!sessions || sessions.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface-soft)] p-5">
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Recent analyses</h2>
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">
          Your completed analyses will appear here.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface-soft)] p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Recent analyses</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-[11px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
        >
          Clear all
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {displayedSessions.map((session) => (
          <li
            key={session.id}
            className="rounded-xl border border-[var(--color-surface-border)] bg-white px-3 py-2.5 flex items-center gap-3"
          >
            <img
              src={session.thumbnailDataUrl || '/favicon.svg'}
              alt=""
              aria-hidden="true"
              className="w-10 h-10 rounded-lg border border-[var(--color-surface-border)] object-cover flex-shrink-0 bg-[var(--color-surface-soft)]"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate leading-snug">
                {personaLabel(session.personaKey, session.report?.persona)}
              </p>
              <p className="text-[11px] text-[var(--color-text-muted)] truncate mt-0.5">
                {session.summary?.total ?? 0} findings · {session.summary?.critical ?? 0} critical
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] truncate mt-0.5">
                {formatWhen(session.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => onOpen(session)}
                aria-label={`Open ${sessionLabel(session)}`}
                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg bg-[var(--color-cta-bg)] text-white hover:bg-[var(--color-cta-hover)] transition-colors cursor-pointer"
              >
                Open
              </button>
              <button
                type="button"
                onClick={() => onDelete(session.id)}
                aria-label={`Delete ${sessionLabel(session)}`}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>

      {shouldCollapse && (
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="self-start text-[11px] font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
        >
          {isExpanded
            ? 'Show less'
            : `Show ${allSessions.length - initialVisibleCount} more`}
        </button>
      )}
    </section>
  );
}
