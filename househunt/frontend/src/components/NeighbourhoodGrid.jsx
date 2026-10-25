import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { api } from '../lib/api';
import { atWidth } from '../lib/img';
import { inr } from '../lib/format';
import { Skeleton, Reveal } from './ui';

export default function NeighbourhoodGrid({ limit = 10, showHead = true, className = '' }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/locations').then(setData).catch(() => setData([]));
  }, []);

  if (!data) {
    return (
      <div className={`grid gap-3 ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] w-full" />)}
      </div>
    );
  }

  const list = data.slice(0, limit);

  return (
    <section id="neighbourhoods" className={className}>
      {showHead && (
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal className="max-w-xl">
            <p className="u-eyebrow mb-4">Neighbourhoods</p>
            <h2 className="u-serif text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.05] text-ink">
              Explore Bengaluru <br className="hidden sm:block" /> by neighbourhood.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link to="/locations" className="u-linkline inline-flex items-center gap-2 pb-1 text-sm font-semibold">
              Every area, mapped <ArrowUpRight size={15} />
            </Link>
          </Reveal>
        </div>
      )}

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {list.map((l, i) => (
          <Reveal key={l.slug} delay={Math.min(i * 0.05, 0.4)}>
            <Link
              to={`/properties?location=${l.slug}`}
              className="group relative block overflow-hidden bg-coal"
              style={{ aspectRatio: '4 / 5', borderRadius: 4 }}
            >
              <img
                src={atWidth(l.imageUrl, 640)}
                alt={`Homes in ${l.name}`}
                loading="lazy"
                className="img-zoom absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-500 group-hover:from-black/80" />
              <div className="absolute left-3 top-3 text-[10px] font-bold tracking-widest text-white/70">
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <div className="translate-y-0 transition-transform duration-500 group-hover:-translate-y-1">
                  <div className="flex items-center gap-1.5 text-[12px] text-paper/80">
                    <MapPin size={11} /> {l.region || 'Bengaluru'}
                  </div>
                  <h3 className="u-serif mt-1 text-xl leading-tight sm:text-2xl">{l.name}</h3>
                  <div className="mt-1 overflow-hidden text-[12px]">
                    <p className="flex translate-y-0 items-center gap-2 transition-transform duration-500 group-hover:-translate-y-4">
                      <span className="text-paper/70">{inr(l.avgRentMin)}–{inr(l.avgRentMax)} avg rent</span>
                    </p>
                    <p className="flex translate-y-0 items-center gap-1 font-semibold text-clay-soft opacity-0 transition-all duration-500 group-hover:-translate-y-4 group-hover:opacity-100">
                      {l.propertyCount} homes to rent <ArrowUpRight size={12} />
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
