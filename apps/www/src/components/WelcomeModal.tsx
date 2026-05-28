import {useEffect, useState} from 'react';
import {EVENT_ID} from '../lib/constants';

interface WelcomeModalProps {
  eventName?: string;
  eventDate?: string;
}

function getEventYear(dateStr?: string): number | null {
  if (!dateStr) return null;
  const year = parseInt(dateStr.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
}

export function WelcomeModal({eventName, eventDate}: WelcomeModalProps) {
  const [open, setOpen] = useState(false);
  const storageKey = `pghbeer.incompleteListNoticeSeen.${EVENT_ID}`;
  const eventYear = getEventYear(eventDate);

  useEffect(() => {
    if (localStorage.getItem(storageKey)) return;
    setOpen(true);
  }, [storageKey]);

  function dismiss() {
    localStorage.setItem(storageKey, '1');
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-overlay px-4"
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div
        className="w-full max-w-[440px] rounded-2xl bg-surface p-6 shadow-[0_4px_24px_var(--color-shadow)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 font-display text-xs font-semibold uppercase tracking-widest text-gold">
          Heads up
        </div>
        <h2
          id="welcome-title"
          className="mb-3 font-display text-xl font-bold leading-tight text-text"
        >
          {eventName || `Beers of the Burgh ${eventYear ?? ''}`}
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-text-secondary">
          The list is incomplete and will be filled out over the coming weeks as breweries confirm
          their pours.
        </p>
        <button
          onClick={dismiss}
          className="w-full rounded-xl bg-gold px-4 py-3 font-display text-sm font-semibold uppercase tracking-wide text-bg transition-all active:scale-[0.98]"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
