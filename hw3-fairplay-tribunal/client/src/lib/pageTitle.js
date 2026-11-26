export const SITE_NAME = 'Fair-Play Appeal Tribunal';

/**
 * Tiêu đề tab theo chuẩn "Trang · Site" (WCAG 2.4.2 Page Titled).
 * @param {...(string | undefined | null | false)} parts
 */
export function pageTitle(...parts) {
  return [...parts.filter(Boolean), SITE_NAME].join(' · ');
}
