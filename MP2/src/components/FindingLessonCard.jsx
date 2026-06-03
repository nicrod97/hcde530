import { CATEGORY_TAG, EFFORT_TAG, FALLBACK_TAG, SEVERITY_TAG } from '../lib/tagStyles.js';

const HEURISTIC_EXPLANATIONS = {
  H1: 'Users should always know what the system is doing through clear, timely feedback.',
  H2: 'Interface language and concepts should match real-world mental models.',
  H3: 'Users need clear exits and recovery paths when they make mistakes.',
  H4: 'Patterns, labels, and interactions should stay consistent across the experience.',
  H5: 'Design should prevent errors before they happen, not only recover after.',
  H6: 'Reduce memory load by making options, states, and actions visible.',
  H7: 'Support both novice and advanced users with efficient, flexible interaction.',
  H8: 'Remove unnecessary complexity so important tasks stand out clearly.',
  H9: 'When errors occur, messaging should explain what happened and how to fix it.',
  H10: 'Provide help and guidance that is easy to find when users need it.',
};

function getWhyItMatters(finding) {
  if (finding.category === 'accessibility') {
    if (finding.severity === 'critical') {
      return 'This can block people from completing tasks and create significant accessibility compliance risk.';
    }
    return 'This creates barriers for users relying on keyboard, assistive tech, or high-contrast readability.';
  }

  if (finding.category === 'heuristic') {
    if (finding.severity === 'major' || finding.severity === 'critical') {
      return 'This likely adds confusion or friction during key tasks, increasing drop-off and user frustration.';
    }
    return 'This reduces clarity and flow quality, which can slowly hurt trust and usability.';
  }

  if (finding.severity === 'critical' || finding.severity === 'major') {
    return 'This affects core interaction quality and should be resolved to improve reliability and user confidence.';
  }

  return 'This is lower risk but still impacts perceived quality and consistency of the interface.';
}

function getRuleExplanation(finding) {
  if (finding.heuristic && HEURISTIC_EXPLANATIONS[finding.heuristic]) {
    return `${finding.heuristic}: ${HEURISTIC_EXPLANATIONS[finding.heuristic]}`;
  }

  if (finding.wcag) {
    return `${finding.wcag}: This issue maps to accessibility criteria intended to keep content perceivable, operable, and understandable for all users.`;
  }

  if (finding.category === 'best-practice') {
    return 'Best-practice guideline: This recommendation aligns with common modern UI patterns that improve consistency and ease of use.';
  }

  return 'Usability rule: The recommendation supports clearer, more predictable user interactions.';
}

function getVerificationChecklist(finding) {
  if (finding.category === 'accessibility') {
    return [
      'Test keyboard-only navigation and confirm focus remains visible.',
      'Verify labels, roles, and announcements with a screen reader.',
      'Check color contrast and state clarity in both light and dark backgrounds.',
    ];
  }

  if (finding.category === 'heuristic') {
    return [
      'Run one primary task and confirm users can complete it without hesitation.',
      'Check that system feedback appears at each key step.',
      'Try an error path and verify recovery is obvious and low effort.',
    ];
  }

  return [
    'Check the updated pattern across related screens for consistency.',
    'Validate responsive behavior at mobile and desktop widths.',
    'Confirm the change does not introduce new visual regressions.',
  ];
}

function Badge({ label, tone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone}`}>
      {label}
    </span>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-[#d8e9c8] bg-white p-4 shadow-[0_2px_0_0_#e4f0da]">
      <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{title}</h4>
      <div className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export default function FindingLessonCard({
  finding,
  findingIndex = 0,
  findingTotal = 0,
}) {
  const whyItMatters = getWhyItMatters(finding);
  const ruleExplanation = getRuleExplanation(finding);
  const verificationChecklist = getVerificationChecklist(finding);
  const findingNumberLabel = String(findingIndex + 1).padStart(2, '0');
  const severityTag = SEVERITY_TAG[finding.severity] ?? SEVERITY_TAG.cosmetic;
  const categoryTag = CATEGORY_TAG[finding.category] ?? FALLBACK_TAG;
  const effortTag = EFFORT_TAG[finding.effort] ?? EFFORT_TAG.medium;

  return (
    <article className="rounded-3xl border border-[#d8e9c8] bg-[#f7fdee] p-4 md:p-5 flex flex-col gap-4 shadow-[0_4px_0_0_#deedd0]" aria-labelledby={`lesson-title-${finding.id}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-[#fff0e6] border border-[#f6b18a] px-3 py-1.5 shadow-[0_1px_0_0_#ffd8bf]">
          <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#9a3412]">Finding</span>
          <span className="text-base leading-none font-black tabular-nums text-[#7c2d12]">
            {findingNumberLabel}
          </span>
        </div>
        <span className="text-xs font-semibold text-[var(--color-text-muted)] tabular-nums">
          {findingIndex + 1} of {Math.max(findingTotal, 1)}
        </span>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge label={finding.severity} tone={severityTag} />
            <Badge label={finding.category} tone={categoryTag} />
            <Badge label={`${finding.effort} effort`} tone={effortTag} />
          </div>
          <h3 id={`lesson-title-${finding.id}`} className="text-lg font-bold tracking-tight text-[var(--color-text-primary)]">
            {finding.title}
          </h3>
        </div>

      </header>

      <Section title="Issue">
        {finding.description}
      </Section>

      <Section title="Why it matters">
        {whyItMatters}
      </Section>

      <Section title="Rule explained">
        {ruleExplanation}
      </Section>

      <Section title="Recommendation">
        {finding.recommendation}
      </Section>

      <Section title="How to verify">
        <ul className="list-disc pl-4 flex flex-col gap-1.5">
          {verificationChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>
    </article>
  );
}
