/**
 * Sanitizes URLs to protect against javascript: or data: XSS link injection.
 * Only http:, https:, relative paths (/), and anchors (#) are permitted.
 */
export function safeHref(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed;
    }
    return '#';
  } catch {
    // Relative URL or in-page anchor
    if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
      return trimmed;
    }
    return '#';
  }
}
