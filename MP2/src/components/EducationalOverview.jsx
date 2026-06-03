const SEVERITY_WEIGHT = {
  critical: 4,
  major: 3,
  minor: 2,
  cosmetic: 1,
};

function getInterpretation(summary) {
  const critical = summary.critical ?? 0;
  const major = summary.major ?? 0;
  const total = summary.total ?? 0;

  if (total === 0) {
    return 'No findings were detected in this screenshot. You can still review the confidence note and validate interactions in real usage.';
  }

  if (critical > 0) {
    return 'This interface has high-risk issues that likely block users. Start with critical findings before refining lower-severity improvements.';
  }

  if (major > 0) {
    return 'The biggest opportunities are usability and accessibility friction points. Fixing major findings first should noticeably improve task success.';
  }

  return 'Most findings are lower severity quality improvements. Prioritize consistency and polish while validating core flows remain usable.';
}

function getTopFindings(findings) {
  return [...findings]
    .sort((a, b) => {
      const severityDelta = (SEVERITY_WEIGHT[b.severity] ?? 0) - (SEVERITY_WEIGHT[a.severity] ?? 0);
      if (severityDelta !== 0) return severityDelta;
      const effortA = a.effort === 'low' ? 0 : a.effort === 'medium' ? 1 : 2;
      const effortB = b.effort === 'low' ? 0 : b.effort === 'medium' ? 1 : 2;
      return effortA - effortB;
    })
    .slice(0, 3);
}

function MetricCard({ label, value, tone }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 flex flex-col gap-1 shadow-[0_2px_0_0_#deedd0] ${tone}`}>
      <span className="text-[10px] uppercase tracking-[0.16em] font-bold">{label}</span>
      <span className="text-2xl font-black tracking-tight tabular-nums">{value}</span>
    </div>
  );
}

export default function EducationalOverview({ summary, findings }) {
  const topFindings = getTopFindings(findings);
  const interpretation = getInterpretation(summary);

  return (
    <section className="flex flex-col gap-5" aria-labelledby="overview-heading">
      <div className="flex flex-col gap-2">
        <h3 id="overview-heading" className="text-lg font-bold text-[var(--color-text-primary)] tracking-tight">
          Overview of your results
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          {interpretation}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard label="Total" value={summary.total ?? 0} tone="border-[#d8e9c8] bg-[#f4fbe9] text-[var(--color-text-secondary)]" />
        <MetricCard label="Critical" value={summary.critical ?? 0} tone="border-red-200 bg-red-50 text-red-700" />
        <MetricCard label="Major" value={summary.major ?? 0} tone="border-amber-200 bg-amber-50 text-amber-800" />
        <MetricCard label="Minor" value={summary.minor ?? 0} tone="border-blue-200 bg-blue-50 text-blue-700" />
        <MetricCard label="Cosmetic" value={summary.cosmetic ?? 0} tone="border-[#d8e9c8] bg-white text-[var(--color-text-secondary)]" />
      </div>

      <div className="rounded-2xl border border-[#d8e9c8] bg-[#f7fdee] p-4 flex flex-col gap-3 shadow-[0_2px_0_0_#deedd0]">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
          Top priorities
        </p>
        {topFindings.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            No findings to prioritize. Continue to recap for validation guidance.
          </p>
        ) : (
          <ol className="flex flex-col gap-2 list-decimal list-inside">
            {topFindings.map((finding) => (
              <li key={finding.id} className="text-sm text-[var(--color-text-secondary)]">
                <span className="font-semibold text-[var(--color-text-primary)]">{finding.title}</span>
                <span className="ml-2 text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                  {finding.severity} · {finding.effort} effort
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
