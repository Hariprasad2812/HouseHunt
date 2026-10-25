export const inr = (n) =>
  n == null ? '—' : '₹' + Number(n).toLocaleString('en-IN');

export const compact = (n) =>
  n == null ? '0' : Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

export const shortDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const shortDateNoYear = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const timeAgo = (iso) => {
  if (!iso) return '';
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return shortDate(iso);
};

export const titleCase = (s = '') =>
  s.toLowerCase().split(/[\s_-]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export const sentence = (s = '') => (s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()).trim();

export const typeLabel = (t = '') =>
  ({ APARTMENT: 'Apartment', INDEPENDENT_HOUSE: 'Independent House', VILLA: 'Villa', STUDIO: 'Studio', PENTHOUSE: 'Penthouse', SERVICE_APARTMENT: 'Service Apartment' }[t] || t);

export const furnLabel = (f = '') =>
  ({ FURNISHED: 'Fully furnished', SEMI_FURNISHED: 'Semi furnished', UNFURNISHED: 'Unfurnished' }[f] || f);

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

export const prettyDateTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  });
};

export const localToISO = (d) => {
  if (!d) return null;
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
};

export const statusTone = (status = '') =>
  ({
    APPROVED: 'ok', ACTIVE: 'ok', CONFIRMED: 'ok', SHORTLISTED: 'ok', COMPLETED: 'ok',
    PENDING: 'warn', REQUESTED: 'warn',
    SUSPENDED: 'danger', REJECTED: 'danger', CANCELLED: 'danger', WITHDRAWN: 'neutral', RENTED: 'neutral',
  })[status] || 'neutral';

export const PLURAL = {
  APARTMENT: 'Apartments', INDEPENDENT_HOUSE: 'Independent houses', VILLA: 'Villas',
  STUDIO: 'Studios', PENTHOUSE: 'Penthouses', SERVICE_APARTMENT: 'Service apartments',
};
