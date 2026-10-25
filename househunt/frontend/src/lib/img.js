// Unsplash URLs carry a baked-in ?w=1800; this helper re-issues the request at
// an appropriate width for the context (cards vs full-bleed), and returns the
// local /uploads/… URL untouched.
export const atWidth = (url, w) => {
  if (!url) return '';
  if (/images\.unsplash\.com/.test(url) && /w=\d+/.test(url)) {
    return url.replace(/w=\d+/, `w=${w}`);
  }
  return url;
};

export const srcSet = (url, widths = [640, 1080, 1600]) => {
  if (!url || !/images\.unsplash\.com/.test(url)) return url || '';
  return widths.map((w) => `${atWidth(url, w)} ${w}w`).join(', ');
};
