import {useState, useEffect, useRef, type RefObject} from 'react';

// Hysteresis gap (px) between the hide and show trigger lines. Must exceed the
// FilterSummary bar height (~45px). Toggling the summary resizes the sticky
// header, which shifts the sentinel in flow; without a gap larger than that
// shift the sentinel re-crosses a single trigger line and the toggle
// oscillates (visible jitter near the top of the list).
const SHOW_LINE = 72;

export function useFiltersVisible(sentinelRef: RefObject<HTMLDivElement | null>) {
  const [visible, setVisible] = useState(true);
  const visibleRef = useRef(true);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Hide once the sentinel passes the viewport top.
    const hideObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && visibleRef.current) {
          visibleRef.current = false;
          setVisible(false);
        }
      },
      {threshold: 0, rootMargin: '0px'},
    );

    // Show only once the sentinel comes SHOW_LINE px back into view — the gap
    // absorbs the header-resize shift so the two toggles can't feed each other.
    const showObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visibleRef.current) {
          visibleRef.current = true;
          setVisible(true);
        }
      },
      {threshold: 0, rootMargin: `-${SHOW_LINE}px 0px 0px 0px`},
    );

    hideObserver.observe(sentinel);
    showObserver.observe(sentinel);
    return () => {
      hideObserver.disconnect();
      showObserver.disconnect();
    };
  }, [sentinelRef]);

  return visible;
}
