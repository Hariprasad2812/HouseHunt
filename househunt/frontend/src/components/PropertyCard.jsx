import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bath, BedDouble, Heart, MapPin, Ruler, ShowerHead } from 'lucide-react';
import { atWidth } from '../lib/img';
import { inr, typeLabel, furnLabel } from '../lib/format';
import { api } from '../lib/api';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/useAuth';
import { useReducedMotion, Verified, useModal } from './ui';

export function FavoriteHeart({ property, size = 19, className = '', onToggle }) {
  const { user } = useAuth();
  const { open, close } = useModal();
  const { pathname } = useLocation();
  const [fav, setFav] = useState(property?.favorited);
  const [busy, setBusy] = useState(false);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      open({
        id: 'login', size: 'sm',
        content: (
          <div className="pt-2">
            <h3 className="text-xl font-semibold">Save this home</h3>
            <p className="mt-2 text-sm text-stone">Sign in to build a shortlist and pick up where you left off.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/login" state={{ from: pathname }} className="flex-1"><button onClick={() => close('login')} className="h-11 w-full rounded-[3px] bg-ink text-sm font-semibold text-paper">Sign in</button></Link>
              <Link to="/register" state={{ from: pathname }} className="flex-1"><button onClick={() => close('login')} className="h-11 w-full rounded-[3px] border border-black/20 text-sm font-semibold">Create account</button></Link>
            </div>
          </div>
        ),
      });
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const res = await api.post(`/properties/${property.id}/favorite`);
      setFav(res.favorited);
      onToggle?.(res.favorited);
    } finally { setBusy(false); }
  };

  return (
    <button
      onClick={toggle}
      aria-label={fav ? 'Remove from saved homes' : 'Save home'}
      className={`grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur transition-all hover:scale-105 ${className}`}
    >
      <Heart
        size={size}
        strokeWidth={1.7}
        className={`transition-colors ${fav ? 'fill-clay text-clay' : ''}`}
      />
    </button>
  );
}

export function PropertyCard({ p, index = 0, tall, className = '' }) {
  const reduced = useReducedMotion();
  const meta = [
    { icon: BedDouble, label: `${p.bedrooms} BD` },
    { icon: ShowerHead, label: `${p.bathrooms} BA` },
    { icon: Ruler, label: `${p.floorAreaSqft} sq.ft` },
  ];
  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.65, delay: Math.min((index || 0) * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex flex-col overflow-hidden bg-white transition-all duration-300 hover:-translate-y-[3px] hover:shadow-lift ${className}`}
      style={{ border: '1px solid rgba(27,26,22,0.09)', borderRadius: 4 }}
    >
      <Link to={`/properties/${p.id}`} className="relative block overflow-hidden bg-sand" aria-label={p.title}>
        <img
          src={atWidth(p.coverImage, 900)}
          alt={p.title}
          loading="lazy"
          className={`img-zoom h-full w-full object-cover ${tall ? 'aspect-[4/3]' : 'aspect-[4/3]'}`}
        />
        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/45 via-transparent to-black/10 opacity-60 transition-opacity duration-500 group-hover:opacity-30" />
        <div className="absolute left-3 top-3 z-[3] flex items-center gap-2">
          {p.verified && <Verified className="bg-white/95 backdrop-blur" />}
          {p.furnishing === 'FURNISHED' && (
            <span className="rounded-full bg-white/90 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wider text-ink backdrop-blur">
              {furnLabel(p.furnishing)}
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3 z-[3]">
          <span className="sr-only">{p.favorited ? 'Saved' : 'Save'}</span>
          <FavoriteHeart property={p} />
        </div>
        <div className="absolute inset-x-0 bottom-0 z-[3] flex items-end justify-between p-4">
          <div className="translate-y-0 transition-transform duration-500 group-hover:-translate-y-1">
            <p className="text-[13px] font-semibold text-white drop-shadow">{typeLabel(p.type)}</p>
            <h3 className="u-serif mt-0.5 max-w-[85%] text-xl leading-snug text-white drop-shadow">{p.title}</h3>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <div className="flex items-center gap-1.5 text-[13px] text-stone">
          <MapPin size={13} className="shrink-0 text-clay" strokeWidth={2} />
          <span className="truncate">{p.locationName} · {p.address}</span>
        </div>
        <div className="mt-3 flex items-center gap-3 border-b border-black/[0.07] pb-3">
          {meta.map((m) => (
            <span key={m.label} className="flex items-center gap-1.5 text-[12.5px] font-medium text-coal">
              <m.icon size={14} strokeWidth={1.7} className="text-stone" /> {m.label}
            </span>
          ))}
        </div>
        <div className="mt-3.5 flex items-end justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-light">Rent</p>
          <p className="text-right">
            <span className="u-serif text-[22px] leading-none text-ink">{inr(p.rentPerMonth)}</span>
            <span className="text-[12px] text-stone"> /month</span>
          </p>
        </div>
        <Link
          to={`/properties/${p.id}`}
          className="mt-4 flex h-10 items-center justify-center rounded-[3px] border border-black/15 text-[13px] font-semibold transition-colors hover:border-ink hover:bg-ink hover:text-paper"
        >
          View property
        </Link>
      </div>
    </motion.article>
  );
}

export const PropertySkeleton = ({ tall }) => (
  <div className="overflow-hidden rounded-[4px] bg-white p-0" style={{ border: '1px solid rgba(27,26,22,0.09)' }}>
    <div className={`animate-pulse bg-black/[0.07] ${tall ? 'aspect-[4/3]' : 'aspect-[4/3]'}`} />
    <div className="space-y-3 p-5">
      <div className="h-3 w-1/2 animate-pulse rounded bg-black/[0.07]" />
      <div className="h-5 w-3/4 animate-pulse rounded bg-black/[0.07]" />
      <div className="h-3 w-2/3 animate-pulse rounded bg-black/[0.07]" />
      <div className="h-9 w-full animate-pulse rounded bg-black/[0.07]" />
    </div>
  </div>
);
