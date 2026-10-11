/**
 * Validate a site-owned icon URL without reading a file or fetching the network.
 * @param {unknown} value Root-relative public path or absolute HTTP(S) URL.
 * @returns {string|undefined} Trimmed URL; omitted or blank values request the theme default.
 * @throws {Error} Unsupported URL scheme, relative path, or malformed value.
 */
export function normalizeFavicon(value) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new Error('[mintfolio:config] site.favicon must be a string');
  const icon = value.trim();
  if (!icon) return undefined;
  if (/[\\\u0000-\u0020\u007f]/u.test(icon)) throw new Error('[mintfolio:config] site.favicon contains invalid URL characters');
  if (icon.startsWith('/') && !icon.startsWith('//')) {
    const url = new URL(icon, 'https://mintfolio.invalid');
    return url.pathname + url.search + url.hash;
  }
  try {
    const url = new URL(icon);
    if (/^https?:\/\//i.test(icon) && ['http:', 'https:'].includes(url.protocol)) return icon;
  } catch { /* Return one actionable configuration error below. */ }
  throw new Error('[mintfolio:config] site.favicon must be a root-relative path or an absolute HTTP(S) URL');
}
