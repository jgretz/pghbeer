interface JumpFabProps {
  onClick: () => void;
}

export function JumpFab({onClick}: JumpFabProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[200] mx-auto max-w-[600px]">
      <button
        onClick={onClick}
        className="pointer-events-auto absolute bottom-6 right-4 flex h-[54px] w-[54px] items-center justify-center rounded-2xl bg-gold-light font-display text-[17px] font-bold text-black shadow-[0_4px_16px_var(--color-shadow)] dark:bg-gold"
        aria-label="Jump to brewery by letter"
      >
        A-Z
      </button>
    </div>
  );
}
