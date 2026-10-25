import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Building2 } from 'lucide-react';
import { api } from '../lib/api';
import { atWidth } from '../lib/img';
import { IMG } from '../lib/assets';
import { TYPE_OPTIONS } from '../lib/constants';
import { PropertyCard, PropertySkeleton } from '../components/PropertyCard';
import { Reveal, SectionHead } from '../components/ui';

export default function Explore() {
  const [newest, setNewest] = useState(null);
  const [affordable, setAffordable] = useState(null);
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    api.get('/properties', { sort: 'newest', size: 8 }).then((r) => setNewest(r.content)).catch(() => setNewest([]));
    api.get('/properties', { sort: 'price_asc', maxRent: 30000, size: 6 }).then((r) => setAffordable(r.content)).catch(() => setAffordable([]));
    Promise.all(
      TYPE_OPTIONS.map(async (t) => {
        const r = await api.get('/properties', { type: t.value, size: 1 }).catch(() => ({ totalElements: 0, content: [] }));
        return { type: t, count: r.totalElements, first: r.content[0] || null };
      }),
    ).then(setCounts).catch(() => {});
  }, []);

  return (
    <div className="bg-paper pt-[68px]">
      {/* editorial header */}
      <section className="relative overflow-hidden bg-[#1d1b16] text-paper">
        <div className="mx-auto grid max-w-shell gap-8 px-5 py-20 lg:grid-cols-12 lg:px-8 lg:py-28">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="u-eyebrow mb-5 text-clay-soft">Explore Bengaluru homes</p>
              <h1 className="u-serif text-[clamp(2.2rem,4.8vw,4rem)] leading-[1.03]">
                Rent the way this city actually lives.
              </h1>
              <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-paper/70">
                Whether it's a corner flat above a beloved dosa place or a high-rise that watches the
                lake wake up — start with what fits your month and your commute.
              </p>
            </Reveal>
          </div>
          <div className="hidden lg:col-span-5 lg:block">
            <Reveal delay={0.15}>
              <div className="relative h-64 overflow-hidden rounded-[4px]">
                <img src={IMG.discover} alt="" className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <p className="absolute bottom-4 left-5 text-sm font-semibold">10 neighbourhoods · 1 platform</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* type index */}
      <section className="mx-auto max-w-shell px-5 py-20 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="u-eyebrow mb-2">Browse by home type</p>
            <h2 className="u-serif text-3xl text-ink">What kind of home?</h2>
          </div>
          <Link to="/properties" className="u-linkline text-sm font-semibold">All homes</Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {TYPE_OPTIONS.map((t, i) => (
            <Link
              key={t.value}
              to={`/properties?type=${t.value}`}
              className="group relative block overflow-hidden rounded-[4px] bg-coal"
              style={{ aspectRatio: '3/4' }}
            >
              {counts && counts[i] && counts[i].first ? (
                <img src={atWidth(counts[i].first.coverImage, 600)} alt="" className="img-zoom h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="grid h-full place-items-center bg-sand text-stone-light"><Building2 size={26} strokeWidth={1} /></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-[10px] font-bold uppercase tracking-wider text-paper/60">{counts?.[i]?.count || ''} homes</p>
                <p className="u-serif mt-0.5 text-lg leading-tight">{t.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* newest */}
      <section className="border-t border-black/[0.07] bg-white py-20">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <SectionHead eyebrow="Fresh on HouseHunt" title="Just verified this week." lede="Listings that passed our document check in the last few days." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {!newest ? Array.from({ length: 4 }).map((_, i) => <PropertySkeleton key={i} />)
              : newest.slice(0, 4).map((p, i) => <Reveal key={p.id} delay={i * 0.06}><PropertyCard p={p} /></Reveal>)}
          </div>
        </div>
      </section>

      {/* affordable */}
      <section className="mx-auto max-w-shell px-5 py-20 lg:px-8">
        <SectionHead
          eyebrow="Friendly budgets"
          title="Warm homes under ₹30,000."
          lede="Mostly well-kept 1–2 bedroom flats in neighbourhoods that still feel like Bengaluru."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {!affordable ? Array.from({ length: 3 }).map((_, i) => <PropertySkeleton key={i} />)
            : affordable.slice(0, 3).map((p, i) => <Reveal key={p.id} delay={i * 0.07}><PropertyCard p={p} /></Reveal>)}
        </div>
        <div className="mt-10 text-center">
          <Link to="/properties?maxRent=30000" className="inline-flex items-center gap-2 rounded-[3px] border border-black/20 px-6 py-3 text-sm font-semibold transition-colors hover:border-ink">
            See all under ₹30,000 <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
