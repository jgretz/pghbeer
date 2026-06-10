type ToolbarButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
};

export function ToolbarButton({onClick, children}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text"
    >
      {children}
    </button>
  );
}
