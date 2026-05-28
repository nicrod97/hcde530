export default function QuickWins({ quickWins }) {
  if (!quickWins || quickWins.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-amber-500" aria-hidden="true">⚡</span>
        <h3 className="text-sm font-semibold text-amber-800">Quick wins</h3>
        <span className="ml-auto text-xs text-amber-600 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5">
          {quickWins.length}
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {quickWins.map((win) => (
          <li key={win.finding_id} className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-amber-900">{win.title}</span>
            <span className="text-xs text-amber-700 leading-relaxed">{win.why}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
