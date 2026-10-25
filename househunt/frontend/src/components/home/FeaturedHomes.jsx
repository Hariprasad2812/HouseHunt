import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { api } from '../../lib/api';
import { atWidth } from '../../lib/img';
import { inr, typeLabel, furnLabel } from '../../lib/format';
import { SectionHead, Skeleton, Reveal } from '../ui';

export default function FeaturedHomes() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/properties/featured').then(setData).catch(() => setData([]));
  }, []);

  if (!data) {
    return (
      <section className="bg-paper py-24 lg:py-32">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <Skeleton className="h-4 w-40" /><Skeleton className="mt-4 h-10 w-2/3" />
          <div className="mt-12 grid gap-6 lg:grid-cols-2"><Skeleton className="h-[520px]" /><Skeleton className="h-[520px]" /></div>
        </div>
      </section>
    );
  }
  const [big, ...rest] = data;
  const [rightA, rightB, ...more] = rest;

  return (
    <section className="bg-paper py-24 lg:py-32">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            eyebrow="Featured homes"
            title="Homes we'd happily live in ourselves."
            lede="A shortlist our team visits, photographs and vouches for — before it ever reaches you."
            className="max-w-xl"
          />
          <Reveal delay={0.1}>
            <Link to="/properties?sort=newest" className="u-linkline inline-flex items-center gap-2 text-sm font-semibold">
              View all homes <ArrowUpRight size={15} />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-12">
          <Reveal delay={0.04} className="lg:col-span-7">
            {big && <EditorialBig p={big} />}
          </Reveal>
          <div className="grid gap-5 lg:col-span-5 lg:grid-rows-2">
            <Reveal delay={0.12} className="h-full">{rightA && <EditorialSmall p={rightA} />}</Reveal>
            <Reveal delay={0.2} className="h-full">{rightB && <EditorialSmall p={rightB} />}</Reveal>
          </div>
        </div>

        {more.length > 0 && (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((p, i) => <EditorialThin p={p} key={p.id} i={i} />)}
          </div>
        )}
      </div>
    </section>
  );
}

const Cover = ({ p, alt }) => (
  <img src={atWidth(p.coverImage, 1400)} alt={alt} className="img-zoom absolute inset-0 h-full w-full object-cover" loading="lazy" />
);

function MetaTags({ p }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink backdrop-blur">
        {p.verified ? 'Verified' : 'Checked'}
      </span>
      <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink backdrop-blur">
        {typeLabel(p.type)} · {furnLabel(p.furnishing)}
      </span>
    </div>
  );
}

function EditorialBig({ p, className = '' }) {
  return (
    <Link to={`/properties/${p.id}`} className={`group relative block min-h-[420px] overflow-hidden bg-coal sm:min-h-[520px] ${className}`}>
      <Cover p={p} alt={p.title} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/5 transition-opacity duration-500 group-hover:opacity-90" />
      <div className="absolute left-5 top-5 sm:left-6 sm:top-6"><MetaTags p={p} /></div>
      <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
        <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide2 text-paper/70">
          <MapPin size={12} /> {p.locationName} · {p.address}
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h3 className="u-serif max-w-xl text-2xl leading-tight sm:text-[2rem]">{p.title}</h3>
          <div className="text-left sm:text-right">
            <span className="u-serif text-3xl sm:text-4xl">{inr(p.rentPerMonth)}</span>
            <span className="text-sm text-paper/70"> /month</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 max-w-sm gap-2 text-sm">
          <span className="border-t border-white/25 pt-2">{p.bedrooms} bedrooms</span>
          <span className="border-t border-white/25 pt-2">{p.bathrooms} baths</span>
          <span className="border-t border-white/25 pt-2">{p.floorAreaSqft} sq.ft</span>
        </div>
        <div className="mt-5 max-h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-10 group-hover:opacity-100">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-clay-soft">
            View this home <ArrowUpRight size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function EditorialSmall({ p, className = '' }) {
  return (
    <Link to={`/properties/${p.id}`} className={`group relative block min-h-[240px] overflow-hidden bg-coal ${className}`}>
      <Cover p={p} alt={p.title} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
      <div className="absolute left-4 top-4"><span className="rounded-full bg-white/95 px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-wider text-ink">{typeLabel(p.type)}</span></div>
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <div className="translate-y-1 transition-transform duration-500 group-hover:-translate-y-1">
          <h3 className="u-serif text-xl leading-tight">{p.title}</h3>
          <p className="mt-1 text-[12px] text-paper/65">{p.locationName} · {p.bedrooms} bed · {p.bathrooms} bath · {p.floorAreaSqft} sq.ft</p>
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <span className="text-sm text-paper/70">From</span>
          <p><span className="u-serif text-2xl">{inr(p.rentPerMonth)}</span><span className="text-xs text-paper/60">/mo</span></p>
        </div>
      </div>
    </Link>
  );
}

function EditorialThin({ p, i }) {
  return (
    <Reveal delay={i * 0.08} className={i > 2 ? 'hidden sm:block lg:block' : ''}>
      <Link to={`/properties/${p.id}`} className="group flex gap-4 bg-white p-4 transition-shadow hover:shadow-soft" style={{ border: '1px solid rgba(27,26,22,0.09)', borderRadius: 4 }}>
        <span className="relative block h-28 w-36 shrink-0 overflow-hidden bg-sand">
          <img src={atWidth(p.coverImage, 600)} alt={p.title} className="img-zoom h-full w-full object-cover" loading="lazy" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col justify-between py-1">
          <span>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-light">{p.locationName}</span>
            <span className="mt-1 line-clamp-2 text-[14px] font-semibold leading-snug text-ink">{p.title}</span>
          </span>
          <span className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-bold text-ink">{inr(p.rentPerMonth)}<span className="font-normal text-stone-light">/mo</span></span>
            <span className="text-[13px] text-stone">{p.bedrooms} bd · {p.bathrooms} ba</span>
          </span>
        </span>
      </Link>
    </Reveal>
  );
}
