import {useState, useEffect, type RefObject} from 'react';

export function useFiltersVisible(sentinelRef: RefObject<HTMLDivElement | null>) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      {threshold: 0, rootMargin: '-1px 0px 0px 0px'},
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelRef]);

  return visible;
}
