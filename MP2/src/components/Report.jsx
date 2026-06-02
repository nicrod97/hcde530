import { useMemo, useState } from 'react';
import SummaryBar from './SummaryBar.jsx';
import KanbanBoard from './KanbanBoard.jsx';
import FindingCard from './FindingCard.jsx';
import FilterBar from './FilterBar.jsx';

export default function Report({ report }) {
  const { summary, findings, persona_take, persona, _validationWarnings } = report;
  const [selectedSeverities, setSelectedSeverities] = useState(new Set());
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedEfforts, setSelectedEfforts] = useState(new Set());
  const [searchText, setSearchText] = useState('');

  const hasActiveFilters =
    selectedSeverities.size > 0 ||
    selectedCategories.size > 0 ||
    selectedEfforts.size > 0 ||
    searchText.trim().length > 0;

  const filteredFindings = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return findings.filter((finding) => {
      const severityMatch =
        selectedSeverities.size === 0 || selectedSeverities.has(finding.severity);
      const categoryMatch =
        selectedCategories.size === 0 || selectedCategories.has(finding.category);
      const effortMatch =
        selectedEfforts.size === 0 || selectedEfforts.has(finding.effort);
      const textMatch =
        !search ||
        finding.title.toLowerCase().includes(search) ||
        finding.description.toLowerCase().includes(search);

      return severityMatch && categoryMatch && effortMatch && textMatch;
    });
  }, [findings, searchText, selectedCategories, selectedEfforts, selectedSeverities]);

  function toggleInSet(setter, value) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  function clearFilters() {
    setSelectedSeverities(new Set());
    setSelectedCategories(new Set());
    setSelectedEfforts(new Set());
    setSearchText('');
  }

  return (
    <main className="flex flex-col gap-8" aria-label="Evaluation report">
      <section className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-4 flex flex-col gap-2" aria-labelledby="confidence-note-heading">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
          <span id="confidence-note-heading">
          Confidence note
          </span>
        </p>
        <p className="text-sm text-blue-900 leading-relaxed">
          This report is based on a static screenshot, so it may miss interaction-only issues
          (flows, keyboard behavior, timing, and dynamic states). Treat findings as prioritized
          guidance, then verify fixes in real usage and accessibility testing.
        </p>
        {_validationWarnings?.length > 0 && (
          <p className="text-xs text-blue-800" role="status" aria-live="polite">
            Some model output was normalized for consistency before display.
          </p>
        )}
      </section>

      {/* Persona written summary — card at top */}
      {persona_take && persona_take.trim() && (
        <section
          className="bg-white rounded-xl border border-zinc-200 px-6 py-5 flex flex-col gap-2 shadow-sm"
          aria-labelledby="persona-perspective-heading"
        >
          {persona && (
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
              <p
                id="persona-perspective-heading"
                className="text-[10px] font-bold text-violet-700 uppercase tracking-[0.2em]"
              >
                {persona} perspective
              </p>
            </div>
          )}
          <p className="text-sm text-zinc-700 leading-relaxed">{persona_take}</p>
        </section>
      )}

      {/* Sidebar layout: numerical summary left, kanban right */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-start">

        <aside className="lg:w-36 flex-shrink-0 lg:sticky lg:top-20">
          <SummaryBar summary={summary} />
        </aside>

        <section className="flex-1 min-w-0 flex flex-col gap-4" aria-labelledby="findings-heading">
          <h2 id="findings-heading" className="sr-only">Findings</h2>
          <FilterBar
            selectedSeverities={selectedSeverities}
            selectedCategories={selectedCategories}
            selectedEfforts={selectedEfforts}
            searchText={searchText}
            totalCount={findings.length}
            matchedCount={filteredFindings.length}
            onToggleSeverity={(value) => toggleInSet(setSelectedSeverities, value)}
            onToggleCategory={(value) => toggleInSet(setSelectedCategories, value)}
            onToggleEffort={(value) => toggleInSet(setSelectedEfforts, value)}
            onSearchChange={setSearchText}
            onClearAll={clearFilters}
          />
          <p className="sr-only" role="status" aria-live="polite">
            {hasActiveFilters
              ? `${filteredFindings.length} findings match current filters out of ${findings.length}.`
              : `Showing all ${findings.length} findings.`}
          </p>

          {!hasActiveFilters && <KanbanBoard findings={findings} />}

          {hasActiveFilters && (
            <div className="flex flex-col gap-3" aria-live="polite">
              {filteredFindings.length === 0 ? (
                <div
                  className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500"
                  role="status"
                >
                  No findings match current filters.
                </div>
              ) : (
                filteredFindings.map((finding) => (
                  <FindingCard key={finding.id} finding={finding} />
                ))
              )}
            </div>
          )}
        </section>

      </div>

    </main>
  );
}
