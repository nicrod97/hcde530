function bucketForFinding(finding) {
  if (finding.severity === 'critical' && (finding.effort === 'low' || finding.effort === 'medium')) {
    return 'doNow';
  }
  if (finding.severity === 'critical') {
    return 'doNow';
  }
  if (finding.severity === 'major') {
    return 'doNext';
  }
  return 'later';
}

function Section({ title, subtitle, items }) {
  return (
    <section className="rounded-2xl border border-[#d8e9c8] bg-white p-4 flex flex-col gap-2 shadow-[0_2px_0_0_#deedd0]">
      <div>
        <h4 className="text-base font-bold text-[var(--color-text-primary)]">{title}</h4>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No items in this bucket yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((finding) => (
            <li key={finding.id} className="rounded-xl border border-[#d8e9c8] bg-[#fcfff9] p-2.5">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">{finding.title}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 uppercase tracking-wide">
                {finding.severity} · {finding.effort} effort
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function GuidedRecap({
  findings,
  onRequestBrowseReport,
}) {
  const grouped = findings.reduce(
    (acc, finding) => {
      const bucket = bucketForFinding(finding);
      acc[bucket].push(finding);
      return acc;
    },
    { doNow: [], doNext: [], later: [] }
  );

  return (
    <section className="flex flex-col gap-5" aria-labelledby="guided-recap-heading">
      <header className="flex flex-col gap-1">
        <h3 id="guided-recap-heading" className="text-lg font-bold tracking-tight text-[var(--color-text-primary)]">
          Prioritized action plan
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)]">
          This roadmap is generated from all findings in your report.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Section
          title="Do now"
          subtitle="Highest urgency fixes to reduce immediate risk."
          items={grouped.doNow}
        />
        <Section
          title="Do next"
          subtitle="Important improvements after urgent blockers."
          items={grouped.doNext}
        />
        <Section
          title="Later"
          subtitle="Lower-risk polish and consistency improvements."
          items={grouped.later}
        />
      </div>

      <div className="rounded-2xl border border-[#c9d6ff] bg-[#eef2ff] p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-[0_2px_0_0_#dbe4ff]">
        <p className="text-sm text-[#404f95]">
          Want to inspect every finding in detail? Open the full report with filters and kanban grouping.
        </p>
        <button
          type="button"
          onClick={onRequestBrowseReport}
          className="self-start md:self-auto text-sm font-semibold rounded-xl bg-[var(--color-cta-bg)] text-[var(--color-cta-text)] px-3 py-2 hover:bg-[var(--color-cta-hover)] active:translate-y-[1px] transition-all cursor-pointer shadow-[0_3px_0_0_var(--color-cta-shadow)]"
        >
          Browse full report
        </button>
      </div>
    </section>
  );
}
