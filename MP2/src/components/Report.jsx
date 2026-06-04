import { useMemo, useRef, useState } from 'react';
import SummaryBar from './SummaryBar.jsx';
import KanbanBoard from './KanbanBoard.jsx';
import FindingCard from './FindingCard.jsx';
import FilterBar from './FilterBar.jsx';
import GuidedReview from './GuidedReview.jsx';
import { PERSONAS } from '../lib/personas.js';
import reportCharacter from '../assets/report-character.png';
import reportEndCharacter from '../assets/report-end-character.png';

export default function Report({
  report,
}) {
  const { summary, findings, persona_take, persona, _validationWarnings } = report;
  const personaLabel = persona
    ? (PERSONAS[persona]?.label || PERSONAS[persona]?.name || persona)
    : null;
  const [showBrowseReport, setShowBrowseReport] = useState(false);
  const browseReportSectionRef = useRef(null);
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

  function handleRequestBrowseReport() {
    setShowBrowseReport(true);
    window.requestAnimationFrame(() => {
      browseReportSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  return (
    <main className="flex flex-col gap-8" aria-label="Evaluation report">
      <div className="lg:flex lg:items-stretch lg:gap-8">
        <aside className="hidden lg:block lg:w-28 xl:w-32 flex-shrink-0" aria-hidden="true">
          <div className="lg:sticky lg:top-24">
            <img
              src={reportCharacter}
              alt=""
              className="pointer-events-none select-none w-full object-contain"
            />
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col gap-8">
          <section className="bg-[#eef2ff] border border-[#c9d6ff] rounded-2xl px-6 py-4 flex flex-col gap-2 shadow-[0_2px_0_0_#dbe4ff]" aria-labelledby="confidence-note-heading">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
              <span id="confidence-note-heading">
              Confidence note
              </span>
            </p>
            <p className="text-sm text-[#344584] leading-relaxed">
              This report is based on a static screenshot, so it may miss interaction-only issues
              (flows, keyboard behavior, timing, and dynamic states). Treat findings as prioritized
              guidance, then verify fixes in real usage and accessibility testing.
            </p>
            {_validationWarnings?.length > 0 && (
              <p className="text-xs text-[#3f4f8f]" role="status" aria-live="polite">
                Some model output was normalized for consistency before display.
              </p>
            )}
          </section>

          {/* Persona written summary — card at top */}
          {persona_take && persona_take.trim() && (
            <section
              className="bg-white rounded-2xl border border-[#d8e9c8] px-6 py-5 flex flex-col gap-2 shadow-[0_3px_0_0_#deedd0]"
              aria-labelledby="persona-perspective-heading"
            >
              {personaLabel && (
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                  <p
                    id="persona-perspective-heading"
                    className="text-[10px] font-bold text-[#5747b2] uppercase tracking-[0.2em]"
                  >
                    {personaLabel} perspective
                  </p>
                </div>
              )}
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{persona_take}</p>
            </section>
          )}

          {/* Guided review stays in the same sticky boundary as chair */}
          <GuidedReview
            report={report}
            onRequestBrowseReport={handleRequestBrowseReport}
          />
        </div>
      </div>

      <section
        ref={browseReportSectionRef}
        className="flex flex-col gap-4"
        style={{ scrollMarginTop: '6rem' }}
        aria-labelledby="browse-report-heading"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d8e9c8] pb-3">
          <div>
            <h2 id="browse-report-heading" className="text-lg font-bold text-[var(--color-text-primary)] tracking-tight">
              Browse full report
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Use filters and grouped views to inspect all findings.
            </p>
          </div>
          {!showBrowseReport ? (
            <button
              type="button"
              onClick={handleRequestBrowseReport}
              className="text-sm font-semibold rounded-xl bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] px-4 py-2 hover:bg-[var(--color-cta-hover)] active:translate-y-[1px] transition-all cursor-pointer shadow-[0_3px_0_0_var(--color-cta-shadow)]"
            >
              Show full report
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowBrowseReport(false)}
              className="text-xs font-semibold rounded-xl border border-[#cfe4b5] bg-white text-[var(--color-text-secondary)] px-3 py-1.5 hover:border-[#f97316] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer shadow-[0_1px_0_0_#deedd0]"
            >
              Hide full report
            </button>
          )}
        </div>

        {showBrowseReport && (
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
                      className="rounded-2xl border border-[#d8e9c8] bg-white p-6 text-sm text-[var(--color-text-muted)]"
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

              <div className="pt-3 flex justify-center">
                <img
                  src={reportEndCharacter}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none select-none w-28 md:w-32 object-contain"
                />
              </div>
            </section>

          </div>
        )}
      </section>

    </main>
  );
}
