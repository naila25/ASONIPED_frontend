import { useSyncExternalStore } from 'react';

export const TICKET_FIELD_PREVIEW_MAX_MOBILE = 20;
export const TICKET_FIELD_PREVIEW_MAX_DESKTOP = 40;
/** Matches Tailwind `sm` (640px): narrow viewports use the shorter preview. */
const TICKET_FIELD_PREVIEW_MQ = '(max-width: 639px)';

export function truncateTicketFieldPreview(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen).trimEnd()}...`;
}

export function useTicketFieldPreviewMax(): number {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(TICKET_FIELD_PREVIEW_MQ);
      mq.addEventListener('change', onStoreChange);
      return () => mq.removeEventListener('change', onStoreChange);
    },
    () =>
      window.matchMedia(TICKET_FIELD_PREVIEW_MQ).matches
        ? TICKET_FIELD_PREVIEW_MAX_MOBILE
        : TICKET_FIELD_PREVIEW_MAX_DESKTOP,
    () => TICKET_FIELD_PREVIEW_MAX_DESKTOP
  );
}
