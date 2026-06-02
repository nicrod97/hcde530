import { useState } from 'react';

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

/* Solid badge — white text on colored bg, all verified WCAG AA */
const SEVERITY_BADGE = {
  critical: 'bg-red-600 text-white',
  major:    'bg-amber-600 text-white',
  minor:    'bg-blue-600 text-white',
  cosmetic: 'bg-zinc-500 text-white',
};

const CATEGORY_TAG = {
  heuristic:      'bg-violet-50 text-violet-700',
  accessibility:  'bg-teal-50 text-teal-700',
  'best-practice':'bg-blue-50 text-blue-700',
};

const EFFORT_TAG = {
  low:    'bg-emerald-50 text-emerald-700',
  medium: 'bg-yellow-50 text-yellow-800',
  high:   'bg-rose-50 text-rose-700',
};

const REC_BORDER = {
  critical: 'border-red-300',
  major:    'border-amber-300',
  minor:    'border-blue-300',
  cosmetic: 'border-zinc-200',
};

export default function FindingCard({ finding }) {
  const { title, severity, category, heuristic, wcag, effort, description, recommendation } = finding;
  const [expanded, setExpanded] = useState(false);

  const stripeColor  = SEVERITY_STRIPE[severity]  ?? SEVERITY_STRIPE.cosmetic;
  const severityBadge = SEVERITY_BADGE[severity]  ?? SEVERITY_BADGE.cosmetic;
  const categoryTag  = CATEGORY_TAG[category]     ?? 'bg-zinc-100 text-zinc-500';
  const effortTag    = EFFORT_TAG[effort]          ?? EFFORT_TAG.medium;
  const recBorder    = REC_BORDER[severity]        ?? REC_BORDER.cosmetic;

  const heuristicName = heuristic ? HEURISTICS[heuristic] : null;

  return (
    <article className="relative bg-white rounded-xl overflow-hidden flex flex-col border border-zinc-200 hover:border-zinc-300 transition-colors">

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
        <h3 className="font-bold text-zinc-950 text-[14px] leading-snug">
          {title}
        </h3>

        {/* Heuristic — violet pill */}
        {heuristicName && (
          <div>
            <Pill className="bg-violet-50 text-violet-700">
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
            <Pill className="bg-zinc-100 text-zinc-500">{wcag}</Pill>
          )}
          <Pill className={effortTag}>effort: {effort}</Pill>
        </div>

      </div>

      {/* Expanded detail section */}
      {expanded && (
        <div className="pl-5 pr-5 pt-1 pb-5 flex flex-col gap-4 border-t border-zinc-100">
          <p className="text-sm text-zinc-600 leading-relaxed pt-3">{description}</p>

          <div className={`pl-4 py-3 border-l-2 ${recBorder} bg-zinc-50 rounded-r-lg`}>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-2">
              Recommendation
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">{recommendation}</p>
          </div>
        </div>
      )}

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="pl-5 pr-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 border-t border-zinc-200 flex items-center justify-between text-[11px] font-bold text-zinc-500 hover:text-zinc-950 transition-all cursor-pointer w-full"
      >
        <span>{expanded ? 'Hide details' : 'Show details'}</span>
        <ChevronIcon expanded={expanded} />
      </button>

    </article>
  );
}

function Pill({ children, className }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${className}`}>
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
