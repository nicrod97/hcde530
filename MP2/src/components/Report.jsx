import SummaryBar from './SummaryBar.jsx';
import KanbanBoard from './KanbanBoard.jsx';

export default function Report({ report }) {
  const { summary, findings, persona_take, persona } = report;

  return (
    <div className="flex flex-col gap-6">
      {/* Persona banner */}
      {persona_take && persona_take.trim() && (
        <div className="border-l-4 border-indigo-400 bg-indigo-50 px-5 py-4 rounded-r-xl">
          {persona && (
            <p className="text-[11px] font-semibold text-indigo-400 uppercase tracking-widest mb-1.5">
              {persona}
            </p>
          )}
          <p className="text-sm text-indigo-900 leading-relaxed italic">{persona_take}</p>
        </div>
      )}

      {/* Summary bar */}
      <SummaryBar summary={summary} />

      {/* Kanban board */}
      <KanbanBoard findings={findings} />

    </div>
  );
}
