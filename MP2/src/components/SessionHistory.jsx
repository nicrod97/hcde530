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

  if (!sessions || sessions.length === 0) {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-900">Recent analyses</h2>
        <p className="mt-2 text-xs text-zinc-500">
          Your completed analyses will appear here.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-3.5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-900">Recent analyses</h2>
        <button
          type="button"
          onClick={onClear}
          className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          Clear history
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {displayedSessions.map((session) => (
          <li
            key={session.id}
            className="rounded-lg border border-zinc-200 p-2 flex items-center gap-2.5"
          >
            <img
              src={session.thumbnailDataUrl}
              alt="Saved session screenshot preview"
              className="w-12 h-12 rounded-md border border-zinc-200 object-cover flex-shrink-0 bg-zinc-100"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-zinc-800 truncate">
                {personaLabel(session.personaKey, session.report?.persona)}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">
                {formatWhen(session.createdAt)}
              </p>
              <p className="text-[10px] text-zinc-600 mt-0.5">
                {session.summary?.total ?? 0} findings, {session.summary?.critical ?? 0} critical
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onOpen(session)}
                className="text-[10px] font-semibold px-2 py-1 rounded-md border border-zinc-300 text-zinc-600 hover:text-zinc-900 hover:border-zinc-500 transition-colors cursor-pointer"
              >
                Open
              </button>
              <button
                type="button"
                onClick={() => onDelete(session.id)}
                className="text-[10px] font-semibold px-2 py-1 rounded-md border border-red-200 text-red-500 hover:text-red-700 hover:border-red-300 transition-colors cursor-pointer"
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
          className="self-start text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
        >
          {isExpanded
            ? `Show less`
            : `Show ${allSessions.length - initialVisibleCount} more`}
        </button>
      )}
    </section>
  );
}
