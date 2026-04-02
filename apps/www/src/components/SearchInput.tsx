interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function SearchInput({value, onChange, onClear}: SearchInputProps) {
  return (
    <div className="mb-4 flex h-11 items-center rounded-xl border-[1.5px] border-border bg-bg px-3.5 transition-colors">
      <span className="mr-2.5 text-[15px] text-text-muted">{'\u{1F50D}'}</span>
      <input
        type="text"
        placeholder="Search beers, styles, breweries..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-[15px] text-text outline-none placeholder:text-text-muted"
      />
      {value && (
        <button
          onClick={onClear}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-text-muted text-[13px] text-surface"
          aria-label="Clear search"
        >
          {'\u00D7'}
        </button>
      )}
    </div>
  );
}
