import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin, TrainFront } from 'lucide-react';
import { api } from '../lib/api';
import { atWidth } from '../lib/img';
import { inr } from '../lib/format';
import { Skeleton, Reveal } from '../components/ui';

export default function Locations() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/locations').then(setData).catch(() => setData([]));
  }, []);

  const [active, setActive] = useState(null);

  return (
    <div className="bg-paper pt-[68px]">
      <section className="mx-auto max-w-shell px-5 pb-6 pt-12 lg:px-8 lg:pt-20">
        <Reveal>
          <p className="u-eyebrow mb-4">Bengaluru, area by area</p>
          <h1 className="u-serif max-w-3xl text-[clamp(2.1rem,4.6vw,3.9rem)] leading-[1.03] text-ink">
            Ten neighbourhoods. <span className="italic text-clay">Ten different lives.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-stone">
            Every part of this city rents differently. We've walked these streets, priced the market
            and written honest notes so you can choose a home — and a life — that fits.
          </p>
        </Reveal>
      </section>

      {/* hero card list */}
      <section className="mx-auto max-w-shell px-5 py-8 lg:px-8">
        {!data ? (
          <div className="grid gap-4 lg:grid-cols-3"><Skeleton className="h-72" /><Skeleton className="h-72" /><Skeleton className="h-72" /></div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {data.map((l, i) => (
              <Reveal key={l.slug} delay={Math.min(i * 0.06, 0.35)}>
                <Link
                  to={`/properties?location=${l.slug}`}
                  className="group block overflow-hidden bg-coal"
                  onMouseEnter={() => setActive(l.slug)}
                  style={{ borderRadius: 4 }}
                >
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <img src={atWidth(l.imageUrl, 900)} alt={`${l.name} homes`} className="img-zoom h-full w-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                  <div className="bg-white p-5 transition-colors group-hover:bg-clay-tint">
                    <div className="flex items-baseline justify-between">
                      <h2 className="u-serif text-2xl text-ink">{l.name}</h2>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-clay">{l.propertyCount} homes</span>
                    </div>
                    <p className="mt-1 text-[12px] font-semibold uppercase tracking-wider text-stone-light">{l.region}</p>
                    <div className="mt-3 flex items-center gap-3 text-[12.5px] text-stone">
                      <span>avg rent</span>
                      <span className="font-semibold text-ink">{inr(l.avgRentMin)}–{inr(l.avgRentMax)}</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* editorial area notes */}
      <section className="mx-auto max-w-shell px-5 py-16 lg:px-8">
        <Reveal>
          <h2 className="u-serif text-3xl text-ink">Notes from the ground</h2>
        </Reveal>
        <div className="mt-8 space-y-3">
          {(data || []).map((l, i) => (
            <Reveal key={l.slug} delay={i * 0.03}>
              <details className="group border border-black/[0.1] bg-white transition-colors open:bg-white hover:border-black/25" style={{ borderRadius: 4 }}>
                <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-5">
                  <span className="u-serif text-2xl text-clay/70">{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <b className="u-serif text-xl text-ink">{l.name}</b>
                      <span className="rounded-full bg-sand px-2 py-[2px] text-[10px] font-bold uppercase tracking-wider text-stone">{l.region}</span>
                    </span>
                    <span className="mt-1 block text-[12.5px] text-stone">{l.propertyCount} verified homes · {inr(l.avgRentMin)} – {inr(l.avgRentMax)}/mo</span>
                  </span>
                  <ArrowUpRight className="transition-transform group-open:rotate-45" size={18} />
                </summary>
                <div className="border-t border-black/[0.07] px-5 py-5 pl-16">
                  <p className="max-w-2xl text-[14.5px] leading-relaxed text-coal">{l.description}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link to={`/properties?location=${l.slug}`} className="rounded-[3px] bg-ink px-5 py-2.5 text-[13px] font-semibold text-paper transition-colors hover:bg-coal">Browse homes</Link>
                    <span className="inline-flex items-center gap-2 rounded-[3px] border border-black/12 px-4 py-2.5 text-[12.5px] text-stone">
                      <TrainFront size={14} /> Metro &amp; bus connectivity vary — filter by your commute
                    </span>
                  </div>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </section>

      {/* light CTA */}
      <section className="border-t border-black/[0.07] bg-white">
        <div className="mx-auto flex max-w-shell flex-col items-start justify-between gap-6 px-5 py-16 sm:flex-row sm:items-center lg:px-8">
          <div>
            <h2 className="u-serif text-3xl text-ink">Not sure where to start?</h2>
            <p className="mt-2 text-[15px] text-stone">Tell us your work address and budget — we'll point you to the right side of town.</p>
          </div>
          <Link to="/properties" className="inline-flex items-center gap-2 rounded-[3px] bg-ink px-7 py-3.5 text-sm font-semibold text-paper">
            <MapPin size={16} /> Explore all homes
          </Link>
        </div>
      </section>
    </div>
  );
}
