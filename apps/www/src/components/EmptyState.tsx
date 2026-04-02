interface EmptyStateProps {
  showTriedOnly: boolean;
  triedCount: number;
}

export function EmptyState({showTriedOnly, triedCount}: EmptyStateProps) {
  return (
    <div className="px-5 py-16 text-center text-[15px] leading-relaxed text-text-secondary">
      {showTriedOnly && triedCount === 0
        ? 'Nothing checked off yet.\nGet out there! \u{1F37B}'
        : 'No results found.\nTry a different search or filter.'}
    </div>
  );
}
