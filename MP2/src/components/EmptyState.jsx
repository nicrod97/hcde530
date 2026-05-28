// Static empty state shown before any analysis has run.
// Includes a fake placeholder finding card to illustrate the report format.

const SEVERITY_STYLES = {
  critical: 'bg-red-50 text-red-700 border border-red-200',
  major: 'bg-amber-50 text-amber-700 border border-amber-200',
  minor: 'bg-blue-50 text-blue-700 border border-blue-200',
  cosmetic: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const PLACEHOLDER_FINDING = {
  title: 'Low contrast text on primary action button',
  severity: 'major',
  category: 'accessibility',
  wcag: 'WCAG 1.4.3',
  heuristic: 'H8',
  effort: 'low',
  description:
    'The "Submit" button uses a light gray label (#9ca3af) on a white background, yielding a contrast ratio of approximately 2.3:1 — well below the WCAG AA minimum of 4.5:1 for normal text.',
  recommendation:
    'Change the button label color to at least #6b7280 on white (4.6:1) or use the brand primary color with sufficient contrast. Consider also adding a visible border to reinforce affordance.',
};

export default function EmptyState() {
  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      {/* Hero copy */}
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Upload a screenshot to get started
        </h1>
        <p className="text-gray-500 text-[15px] leading-relaxed">
          EvalBridge analyzes any digital interface — web, mobile, or prototype — and returns a
          structured report of heuristic violations and accessibility issues, each with a specific
          recommendation.
        </p>
        <div className="flex flex-wrap gap-4 mt-1">
          {[
            ['🔍', "Nielsen’s 10 heuristics"],
            ['♿', 'WCAG 2.1 / 2.2 checks'],
            ['⚡', 'Quick wins highlighted'],
            ['📄', 'Exportable plain-text report'],
          ].map(([icon, label]) => (
            <span key={label} className="flex items-center gap-1.5 text-sm text-gray-500">
              <span>{icon}</span>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Example card */}
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Example finding
        </p>
        <div className="bg-white rounded-lg border border-gray-200 p-5 flex flex-col gap-3">
          {/* Header row */}
          <div className="flex flex-col gap-2">
            <span className="font-semibold text-gray-900 text-[15px]">{PLACEHOLDER_FINDING.title}</span>
            <div className="flex flex-wrap gap-1.5">
              <Badge className={SEVERITY_STYLES[PLACEHOLDER_FINDING.severity]}>
                {PLACEHOLDER_FINDING.severity}
              </Badge>
              <Badge className="bg-gray-100 text-gray-600 border border-gray-200">
                {PLACEHOLDER_FINDING.category}
              </Badge>
              <Badge className="bg-gray-100 text-gray-500 border border-gray-200">
                {PLACEHOLDER_FINDING.heuristic}
              </Badge>
              <Badge className="bg-gray-100 text-gray-500 border border-gray-200">
                {PLACEHOLDER_FINDING.wcag}
              </Badge>
              <Badge className="bg-gray-100 text-gray-500 border border-gray-200">
                effort: {PLACEHOLDER_FINDING.effort}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed">{PLACEHOLDER_FINDING.description}</p>

          {/* Recommendation */}
          <div className="border-l-2 border-gray-300 pl-3">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">
              Recommendation
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{PLACEHOLDER_FINDING.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, className }) {
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${className}`}>
      {children}
    </span>
  );
}
