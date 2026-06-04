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
      <section className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface-card)] p-4 shadow-[0_3px_0_0_var(--color-surface-border)]">
        <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Recent analyses</h2>
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Your completed analyses will appear here.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--color-surface-border)] bg-[var(--color-surface-card)] p-3.5 flex flex-col gap-3 shadow-[0_3px_0_0_var(--color-surface-border)]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Recent analyses</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-[11px] font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
        >
          Clear history
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {displayedSessions.map((session) => (
          <li
            key={session.id}
            className="rounded-xl border border-[var(--color-surface-border)] p-2 flex items-center gap-2.5 bg-[var(--color-surface-soft)]"
          >
            <img
              src={session.thumbnailDataUrl || '/favicon.svg'}
              alt="Saved session screenshot preview"
              className="w-12 h-12 rounded-lg border border-[var(--color-surface-border)] object-cover flex-shrink-0 bg-[var(--color-surface-soft)]"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-[var(--color-text-primary)] truncate">
                {personaLabel(session.personaKey, session.report?.persona)}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                {formatWhen(session.createdAt)}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                {session.summary?.total ?? 0} findings, {session.summary?.critical ?? 0} critical
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onOpen(session)}
                aria-label={`Open ${sessionLabel(session)}`}
                className="text-[10px] font-semibold px-2 py-1 rounded-lg border border-[var(--color-surface-border)] bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-focus-accent)] transition-colors cursor-pointer"
              >
                Open
              </button>
              <button
                type="button"
                onClick={() => onDelete(session.id)}
                aria-label={`Delete ${sessionLabel(session)}`}
                className="text-[10px] font-semibold px-2 py-1 rounded-lg border border-red-200 bg-white text-red-500 hover:text-red-700 hover:border-red-300 transition-colors cursor-pointer"
              >
                Delete
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
            ? `Show less`
            : `Show ${allSessions.length - initialVisibleCount} more`}
        </button>
      )}
    </section>
  );
}
