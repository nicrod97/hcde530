import FindingCard from './FindingCard.jsx';

const COLUMNS = [
  {
    id: 'fix-now',
    label: 'Fix now',
    accent: 'border-red-300',
    badge: 'bg-red-50 text-red-700',
    header: 'text-[var(--color-text-primary)]',
    filter: (f) => f.severity === 'critical' || (f.severity === 'major' && f.effort === 'low'),
  },
  {
    id: 'fix-soon',
    label: 'Fix soon',
    accent: 'border-amber-300',
    badge: 'bg-amber-50 text-amber-800',
    header: 'text-[var(--color-text-primary)]',
    filter: (f) =>
      (f.severity === 'major' && (f.effort === 'medium' || f.effort === 'high')) ||
      f.severity === 'minor',
  },
  {
    id: 'backlog',
    label: 'Backlog',
    accent: 'border-[#d8e9c8]',
    badge: 'bg-[#f1f7e9] text-[var(--color-text-muted)]',
    header: 'text-[var(--color-text-primary)]',
    filter: (f) => f.severity === 'cosmetic',
  },
];

export default function KanbanBoard({ findings }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {COLUMNS.map(({ id, label, accent, badge, header, filter }) => {
        const cards = findings.filter(filter);
        return (
          <div key={id} className={`flex flex-col gap-3 border-t-2 pt-4 rounded-2xl bg-[#fcfff9] px-3 pb-3 ${accent}`}>
            <div className="flex items-center gap-2.5 pb-1">
              <span className={`text-sm font-bold tracking-tight ${header}`}>{label}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${badge}`}>
                {cards.length}
              </span>
            </div>
            {cards.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)] font-mono">— no findings</p>
            ) : (
              cards.map((finding) => (
                <FindingCard key={finding.id} finding={finding} />
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}
