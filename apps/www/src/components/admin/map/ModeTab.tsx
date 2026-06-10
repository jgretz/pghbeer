type ModeTabProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

export function ModeTab({active, onClick, children}: ModeTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium ${
        active ? 'bg-gold text-check-fg' : 'bg-surface text-text-secondary'
      }`}
    >
      {children}
    </button>
  );
}
