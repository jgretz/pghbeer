import {useEffect} from 'react';
import type {ReactNode} from 'react';

export type ModalOverlayProps = {
  onClose: () => void;
  labelledBy?: string;
  children: ReactNode;
};

// Shared fixed overlay for admin modals. Closes on Escape and on backdrop
// click (clicks on the panel itself are ignored via the target/currentTarget
// check, so no stopPropagation is needed on children).
export function ModalOverlay({onClose, labelledBy, children}: ModalOverlayProps) {
  useEffect(
    function () {
      function onKey(e: KeyboardEvent) {
        if (e.key === 'Escape') onClose();
      }
      document.addEventListener('keydown', onKey);
      return function () {
        document.removeEventListener('keydown', onKey);
      };
    },
    [onClose],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
}
