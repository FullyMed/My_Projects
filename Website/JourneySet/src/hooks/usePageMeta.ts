import { useEffect } from 'react';

/**
 * Sets document.title and the <meta name="description"> content for as long as
 * the calling component is mounted, restoring the previous values on unmount.
 * The app is a client-rendered SPA with no SSR, so this is the only way to get
 * per-route meta without adding a head-management dependency.
 */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta?.getAttribute('content') ?? '';
    meta?.setAttribute('content', description);

    return () => {
      document.title = previousTitle;
      meta?.setAttribute('content', previousDescription);
    };
  }, [title, description]);
}
