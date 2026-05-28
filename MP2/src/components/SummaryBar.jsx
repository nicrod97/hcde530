const METRICS = [
  {
    key: 'critical',
    label: 'Critical',
    bg: 'bg-red-50',
    border: 'border-red-200',
    count: 'text-red-700',
    label_color: 'text-red-500',
  },
  {
    key: 'major',
    label: 'Major',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    count: 'text-amber-700',
    label_color: 'text-amber-500',
  },
  {
    key: 'minor',
    label: 'Minor',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    count: 'text-blue-700',
    label_color: 'text-blue-500',
  },
  {
    key: 'cosmetic',
    label: 'Cosmetic',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    count: 'text-gray-700',
    label_color: 'text-gray-500',
  },
];

export default function SummaryBar({ summary }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-lg font-semibold text-gray-900">Report</h2>
        <span className="text-sm text-gray-400">{summary.total} finding{summary.total !== 1 ? 's' : ''}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {METRICS.map(({ key, label, bg, border, count, label_color }) => (
          <div
            key={key}
            className={`rounded-lg border ${border} ${bg} px-4 py-3 flex flex-col gap-0.5`}
          >
            <span className={`text-2xl font-bold tabular-nums ${count}`}>{summary[key] ?? 0}</span>
            <span className={`text-xs font-medium ${label_color}`}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
