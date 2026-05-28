import FindingCard from './FindingCard.jsx';

const COLUMNS = [
  {
    id: 'fix-now',
    label: 'Fix now',
    accent: 'border-red-400',
    badge: 'bg-red-100 text-red-700',
    header: 'text-red-700',
    filter: (f) => f.severity === 'critical' || (f.severity === 'major' && f.effort === 'low'),
  },
  {
    id: 'fix-soon',
    label: 'Fix soon',
    accent: 'border-amber-400',
    badge: 'bg-amber-100 text-amber-700',
    header: 'text-amber-700',
    filter: (f) =>
      (f.severity === 'major' && (f.effort === 'medium' || f.effort === 'high')) ||
      f.severity === 'minor',
  },
  {
    id: 'backlog',
    label: 'Backlog',
    accent: 'border-gray-300',
    badge: 'bg-gray-100 text-gray-600',
    header: 'text-gray-600',
    filter: (f) => f.severity === 'cosmetic',
  },
];

export default function KanbanBoard({ findings }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map(({ id, label, accent, badge, header, filter }) => {
        const cards = findings.filter(filter);
        return (
          <div key={id} className={`flex flex-col gap-3 border-t-2 pt-4 ${accent}`}>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${header}`}>{label}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge}`}>
                {cards.length}
              </span>
            </div>
            {cards.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No findings</p>
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
