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

const SEVERITY_BADGE = {
  critical: 'bg-red-50 text-red-700 border border-red-200',
  major: 'bg-amber-50 text-amber-700 border border-amber-200',
  minor: 'bg-blue-50 text-blue-700 border border-blue-200',
  cosmetic: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const CATEGORY_BADGE = {
  heuristic: 'bg-violet-50 text-violet-700 border border-violet-200',
  accessibility: 'bg-teal-50 text-teal-700 border border-teal-200',
  'best-practice': 'bg-sky-50 text-sky-700 border border-sky-200',
};

const EFFORT_BADGE = {
  low: 'bg-green-50 text-green-700 border border-green-200',
  medium: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  high: 'bg-rose-50 text-rose-700 border border-rose-200',
};

const REC_BORDER = {
  critical: 'border-red-300',
  major: 'border-amber-300',
  minor: 'border-blue-300',
  cosmetic: 'border-gray-300',
};

export default function FindingCard({ finding }) {
  const { title, severity, category, heuristic, wcag, effort, description, recommendation } = finding;
  const [expanded, setExpanded] = useState(false);

  const severityStyle = SEVERITY_BADGE[severity] ?? SEVERITY_BADGE.cosmetic;
  const categoryStyle = CATEGORY_BADGE[category] ?? 'bg-gray-100 text-gray-600 border border-gray-200';
  const effortStyle = EFFORT_BADGE[effort] ?? EFFORT_BADGE.medium;
  const recBorder = REC_BORDER[severity] ?? REC_BORDER.cosmetic;

  return (
    <article className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-gray-900 text-[14px] leading-snug">{title}</h3>
        <div className="flex flex-wrap gap-1.5">
          <Badge className={severityStyle}>{severity}</Badge>
          {category === 'heuristic' && heuristic
            ? <HeuristicBadge code={heuristic} className={categoryStyle} />
            : <Badge className={categoryStyle}>{category}</Badge>
          }
          {category !== 'heuristic' && heuristic && <HeuristicBadge code={heuristic} />}
          {wcag && <Badge className="bg-gray-100 text-gray-500 border border-gray-200">{wcag}</Badge>}
          <Badge className={effortStyle}>effort: {effort}</Badge>
        </div>
      </div>

      {expanded && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
          <div className={`border-l-2 ${recBorder} pl-3`}>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">
              Recommendation
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{recommendation}</p>
          </div>
        </div>
      )}

      <button
        onClick={() => setExpanded((v) => !v)}
        className="self-start inline-flex items-center gap-1.5 rounded-md bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300 transition-colors"
      >
        {expanded ? 'Hide details' : 'Show details'}
        <ChevronIcon expanded={expanded} />
      </button>
    </article>
  );
}

function HeuristicBadge({ code, className = 'bg-gray-100 text-gray-500 border border-gray-200' }) {
  const [show, setShow] = useState(false);
  const label = HEURISTICS[code];

  return (
    <span
      className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Badge className={`${className} cursor-default`}>
        Heuristic {code}
      </Badge>
      {label && show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] rounded-md bg-gray-900 px-2.5 py-1.5 text-[11px] text-white leading-snug z-10 text-center shadow-lg whitespace-normal">
          {label}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </span>
      )}
    </span>
  );
}

function ChevronIcon({ expanded }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function Badge({ children, className }) {
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${className}`}>
      {children}
    </span>
  );
}
