/* Severity label colors verified WCAG AA on white (≥4.5:1) */
const METRICS = [
  { key: 'critical', dot: 'bg-red-500',  label: 'Critical', text: 'text-red-700'   },
  { key: 'major',    dot: 'bg-amber-500', label: 'Major',    text: 'text-amber-800' },
  { key: 'minor',    dot: 'bg-blue-500',  label: 'Minor',    text: 'text-blue-700'  },
  { key: 'cosmetic', dot: 'bg-[#b6c9a6]',  label: 'Cosmetic', text: 'text-[var(--color-text-muted)]'  },
];

export default function SummaryBar({ summary }) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-[#d8e9c8] bg-white p-4 shadow-[0_3px_0_0_#deedd0]">

      <div>
        <div className="text-4xl font-black tracking-tighter text-[var(--color-text-primary)] tabular-nums leading-none">
          {summary.total}
        </div>
        <p className="text-xs font-medium text-[var(--color-text-muted)] mt-1.5">
          finding{summary.total !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="border-t border-[#d8e9c8]" />

      <div className="flex flex-col gap-3">
        {METRICS.map(({ key, dot, label, text }) => (
          <div key={key} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
              <span className={`text-sm font-medium ${text}`}>{label}</span>
            </div>
            <span className="text-sm font-bold tabular-nums text-[var(--color-text-primary)]">
              {summary[key] ?? 0}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
