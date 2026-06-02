const SEVERITIES = ['critical', 'major', 'minor', 'cosmetic'];
const CATEGORIES = ['heuristic', 'accessibility', 'best-practice'];
const EFFORTS = ['low', 'medium', 'high'];

function toTitle(value) {
  return value.replace('-', ' ');
}

function FilterChip({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer',
        active
          ? 'bg-zinc-950 text-white border-zinc-950'
          : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-950 hover:text-zinc-950',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function FilterGroup({ label, options, selected, onToggle }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-zinc-500">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((value) => (
          <FilterChip
            key={value}
            active={selected.has(value)}
            label={toTitle(value)}
            onClick={() => onToggle(value)}
          />
        ))}
      </div>
    </div>
  );
}

export default function FilterBar({
  selectedSeverities,
  selectedCategories,
  selectedEfforts,
  searchText,
  totalCount,
  matchedCount,
  onToggleSeverity,
  onToggleCategory,
  onToggleEffort,
  onSearchChange,
  onClearAll,
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-zinc-900">Filter findings</p>
        <div className="flex items-center gap-3">
          <p className="text-xs text-zinc-500 tabular-nums">
            {matchedCount} of {totalCount} findings
          </p>
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            Clear all
          </button>
        </div>
      </div>

      <input
        type="text"
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search findings..."
        className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <FilterGroup
          label="Severity"
          options={SEVERITIES}
          selected={selectedSeverities}
          onToggle={onToggleSeverity}
        />
        <FilterGroup
          label="Category"
          options={CATEGORIES}
          selected={selectedCategories}
          onToggle={onToggleCategory}
        />
        <FilterGroup
          label="Effort"
          options={EFFORTS}
          selected={selectedEfforts}
          onToggle={onToggleEffort}
        />
      </div>
    </div>
  );
}
