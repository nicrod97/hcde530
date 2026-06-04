import { useState } from 'react';
import { CATEGORY_TAG, EFFORT_TAG, FALLBACK_TAG, SEVERITY_TAG } from '../lib/tagStyles.js';

const HEURISTICS = {
  H1: 'Visibility of System Status',
  H2: 'Match Between System and the Real World',
  H3: 'User Control and Freedom',
  H4: 'Consistency and Standards',
  H5: 'Error Prevention',
  H6: 'Recognition Rather Than Recall',
  H7: 'Flexibility and Efficiency of Use',
  H8: 'Aesthetic and Minimalist Design',
  H9: 'Help Users Recognize, Diagnose, and Recover from Errors',
  H10: 'Help and Documentation',
};

const SEVERITY_STRIPE = {
  critical: 'bg-red-500',
  major:    'bg-amber-500',
  minor:    'bg-blue-500',
  cosmetic: 'bg-zinc-300',
};

const REC_BORDER = {
  critical: 'border-red-300',
  major:    'border-amber-300',
  minor:    'border-blue-300',
  cosmetic: 'border-zinc-200',
};

export default function FindingCard({ finding }) {
  const { id, title, severity, category, heuristic, wcag, effort, description, recommendation } = finding;
  const [expanded, setExpanded] = useState(false);

  const stripeColor  = SEVERITY_STRIPE[severity]  ?? SEVERITY_STRIPE.cosmetic;
  const severityBadge = SEVERITY_TAG[severity]  ?? SEVERITY_TAG.cosmetic;
  const categoryTag  = CATEGORY_TAG[category]     ?? FALLBACK_TAG;
  const effortTag    = EFFORT_TAG[effort]          ?? EFFORT_TAG.medium;
  const recBorder    = REC_BORDER[severity]        ?? REC_BORDER.cosmetic;

  const heuristicName = heuristic ? HEURISTICS[heuristic] : null;
  const detailsId = `finding-details-${id}`;
  const titleId = `finding-title-${id}`;

  return (
    <article
      className="relative bg-white rounded-2xl overflow-hidden flex flex-col border border-[#d8e9c8] hover:border-[#b8d99a] transition-colors shadow-[0_3px_0_0_#deedd0]"
      aria-labelledby={titleId}
    >

      {/* Left severity stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${stripeColor}`} />

      {/* Main content */}
      <div className="pl-5 pr-5 pt-4 pb-4 flex flex-col gap-2.5">

        {/* Severity badge — primary signal */}
        <div>
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${severityBadge}`}>
            {severity.charAt(0).toUpperCase() + severity.slice(1)}
          </span>
        </div>

        {/* Title — dominant */}
        <h3 id={titleId} className="font-bold text-[var(--color-text-primary)] text-base leading-snug">
          {title}
        </h3>

        {/* Heuristic — violet pill */}
        {heuristicName && (
          <div>
            <Pill className={CATEGORY_TAG.heuristic}>
              {heuristic} · {heuristicName}
            </Pill>
          </div>
        )}

        {/* Secondary metadata — pill tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {category !== 'heuristic' && (
            <Pill className={categoryTag}>{category}</Pill>
          )}
          {wcag && (
            <Pill className="border border-[#d8e9c8] bg-[#f1f7e9] text-[var(--color-text-muted)]">{wcag}</Pill>
          )}
          <Pill className={effortTag}>effort: {effort}</Pill>
        </div>

      </div>

      {/* Expand toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={detailsId}
        className="pl-5 pr-4 py-2.5 bg-[#f4fbe9] hover:bg-[#e9f6dd] border-t border-[#d8e9c8] flex items-center justify-between text-[11px] font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer w-full"
      >
        <span>{expanded ? 'Hide details' : 'Show details'}</span>
        <ChevronIcon expanded={expanded} />
      </button>

      {/* Expanded detail section */}
      <div id={detailsId} hidden={!expanded}>
        {expanded && (
          <section className="pl-5 pr-5 pt-1 pb-5 flex flex-col gap-4 border-t border-[#e2efd7]" aria-label={`Details for ${title}`}>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed pt-3">{description}</p>

            <section className={`pl-4 py-3 border-l-2 ${recBorder} bg-[#f7fdee] rounded-r-xl`} aria-label="Recommendation">
              <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.15em] mb-2">
                Recommendation
              </p>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{recommendation}</p>
            </section>
          </section>
        )}
      </div>

    </article>
  );
}

function Pill({ children, className }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${className}`}>
      {children}
    </span>
  );
}

function ChevronIcon({ expanded }) {
  return (
    <svg
      width="11" height="11" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
