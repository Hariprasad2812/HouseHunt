import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, Filter, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { api } from '../lib/api';
import { PropertyCard, PropertySkeleton } from '../components/PropertyCard';
import { Badge, Button, CheckBox, EmptyState, ErrorState, Reveal, Select } from '../components/ui';
import { TYPE_OPTIONS, FURNISHING_OPTIONS, SORT_OPTIONS, AMENITY_CATEGORY_LABEL, AMENITY_CATEGORIES, RENT_PRESETS } from '../lib/constants';
import { inr } from '../lib/format';
import NeighbourhoodGrid from '../components/NeighbourhoodGrid';

const PAGE = 12;

function readParams(sp) {
  return {
    q: sp.get('q') || '',
    location: sp.get('location') || '',
    type: sp.get('type') || '',
    bedrooms: sp.get('bedrooms') || '',
    bathrooms: sp.get('bathrooms') || '',
    furnishing: sp.get('furnishing') || '',
    minRent: sp.get('minRent') || '',
    maxRent: sp.get('maxRent') || '',
    sort: sp.get('sort') || 'newest',
    page: Math.max(0, parseInt(sp.get('page') || '0', 10)),
    amenities: (sp.get('amenities') || '').split(',').filter(Boolean),
  };
}

export default function Properties() {
  const [sp, setSp] = useSearchParams();
  const f = useMemo(() => readParams(sp), [sp]);
  const [drawer, setDrawer] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [places, setPlaces] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    api.get('/locations').then(setPlaces).catch(() => {});
    api.get('/amenities').then(setAmenities).catch(() => {});
  }, []);

  const setParam = useCallback((patch, resetPage = true) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined || (Array.isArray(v) && v.length === 0)) next.delete(k);
      else next.set(k, Array.isArray(v) ? v.join(',') : v);
    });
    if (resetPage) next.delete('page');
    setSp(next, { replace: true });
  }, [sp, setSp]);

  const apiParams = useMemo(() => {
    const p = {
      q: f.q, location: f.location, type: f.type, bedrooms: f.bedrooms,
      bathrooms: f.bathrooms, furnishing: f.furnishing,
      minRent: f.minRent, maxRent: f.maxRent, sort: f.sort, page: f.page, size: PAGE,
    };
    if (f.amenities.length) p.amenities = f.amenities;
    return p;
  }, [f]);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError('');
    api.get('/properties', apiParams)
      .then((r) => { if (live) { setResult(r); setLoading(false); } })
      .catch((e) => { if (live) { setError(e.message); setLoading(false); } });
    return () => { live = false; };
  }, [JSON.stringify(apiParams), bump]);

  const activeCount =
    ['q', 'location', 'type', 'bedrooms', 'bathrooms', 'furnishing', 'minRent', 'maxRent'].filter((k) => f[k]).length + f.amenities.length;

  const clearAll = () => { setSp(new URLSearchParams({ sort: f.sort }), { replace: true }); };

  const locName = f.location ? (places.find((p) => p.slug === f.location)?.name || f.location) : null;

  const toggleAmenity = (id) => {
    const has = f.amenities.includes(id);
    setParam({ amenities: has ? f.amenities.filter((x) => x !== id) : [...f.amenities, id] });
  };

  const budgetLabel = useMemo(() => {
    if (!f.minRent && !f.maxRent) return 'Any budget';
    if (f.minRent && !f.maxRent) return `₹${(+f.minRent / 1000).toFixed(0)}k+`;
    if (!f.minRent && f.maxRent) return `Up to ${inr(f.maxRent)}`;
    return `${inr(f.minRent)} – ${inr(f.maxRent)}`;
  }, [f.minRent, f.maxRent]);

  const FiltersPanel = (
    <div className="space-y-8">
      {/* location */}
      <FilterGroup title="Location">
        <Select
          value={f.location}
          onChange={(v) => setParam({ location: v })}
          placeholder="All of Bengaluru"
        >
          {places.map((p) => (
            <option key={p.slug} value={p.slug}>{p.name} · {p.propertyCount || 0} homes</option>
          ))}
        </Select>
      </FilterGroup>

      {/* budget */}
      <FilterGroup title="Monthly budget">
        <div className="grid grid-cols-2 gap-2">
          {RENT_PRESETS.filter((r) => r.label !== 'Any budget').map((r) => {
            const active = String(f.minRent) === String(r.min || '') && String(f.maxRent) === String(r.max === 999999999 ? '' : r.max) || (r.min === f.minRent && (r.max >= 80000 || String(f.maxRent) === String(r.max)) && f.maxRent !== '');
            return (
              <button
                key={r.label}
                onClick={() => setParam(r.min ? { minRent: r.min, maxRent: r.max >= 999999999 ? '' : r.max } : { minRent: '', maxRent: '' })}
                className={`rounded-[3px] border px-2 py-2 text-left text-[12.5px] leading-tight transition-colors ${active ? 'border-ink bg-ink text-paper' : 'border-black/12 hover:border-black/30'}`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0} step={5000}
            value={f.minRent}
            onChange={(e) => setParam({ minRent: e.target.value })}
            placeholder="Min ₹"
            className="u-input h-9 rounded-[3px] px-2.5 text-[13px]"
          />
          <input
            type="number"
            min={0} step={5000}
            value={f.maxRent}
            onChange={(e) => setParam({ maxRent: e.target.value })}
            placeholder="Max ₹"
            className="u-input h-9 rounded-[3px] px-2.5 text-[13px]"
          />
        </div>
        <p className="mt-1 text-[11px] text-stone-light">Rent shown in ₹ / month</p>
      </FilterGroup>

      {/* type */}
      <FilterGroup title="Property type">
        <div className="grid grid-cols-2 gap-2">
          {TYPE_OPTIONS.map((t) => {
            const active = f.type === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setParam({ type: active ? '' : t.value })}
                className={`rounded-[3px] border px-2.5 py-2 text-left text-[12.5px] font-medium transition-colors ${active ? 'border-ink bg-ink text-paper' : 'border-black/12 hover:border-black/35'}`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {/* beds */}
      <FilterGroup title="Bedrooms">
        <div className="flex flex-wrap gap-2">
          {['1', '2', '3', '4'].map((b) => {
            const active = f.bedrooms === b;
            return (
              <button
                key={b}
                onClick={() => setParam({ bedrooms: active ? '' : b })}
                className={`h-8 min-w-[46px] rounded-[3px] border px-2 text-[13px] font-semibold transition-colors ${active ? 'border-ink bg-ink text-paper' : 'border-black/12 hover:border-black/35'}`}
              >
                {b === '4' ? '4+' : b}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {/* furnishing */}
      <FilterGroup title="Furnishing">
        <div className="space-y-2.5">
          {FURNISHING_OPTIONS.map((o) => (
            <CheckBox key={o.value} label={o.label} checked={f.furnishing === o.value} onChange={(v) => setParam({ furnishing: v ? o.value : '' })} />
          ))}
        </div>
      </FilterGroup>

      {/* amenities */}
      <FilterGroup title="Amenities">
        {AMENITY_CATEGORIES.map((cat) => {
          const items = amenities.filter((a) => a.category === cat);
          if (!items.length) return null;
          return (
            <div key={cat} className="mb-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide2 text-stone-light">{AMENITY_CATEGORY_LABEL[cat]}</p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
                {items.map((a) => (
                  <CheckBox key={a.id} label={a.name} checked={f.amenities.includes(String(a.id))} onChange={() => toggleAmenity(String(a.id))} />
                ))}
              </div>
            </div>
          );
        })}
      </FilterGroup>

      <button onClick={clearAll} className="w-full rounded-[3px] border border-black/15 py-2.5 text-[13px] font-semibold transition-colors hover:border-ink">
        Clear all filters
      </button>
    </div>
  );

  return (
    <div className="bg-paper pt-[68px]">
      {/* page head */}
      <section className="border-b border-black/[0.07] bg-paper">
        <div className="mx-auto max-w-shell px-5 py-10 lg:px-8 lg:py-14">
          <Reveal>
            <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide2 text-stone-light">
              <MapPin size={12} className="text-clay" /> Homes in Bengaluru
            </p>
            <h1 className="u-serif text-[clamp(1.9rem,3.4vw,2.7rem)] leading-[1.05]">
              Find somewhere that <span className="italic text-clay">fits your life.</span>
            </h1>
            <p className="mt-3 text-[15px] text-stone">
              {locName ? <>Showing homes in <strong className="text-ink">{locName}</strong></> : 'Verified rentals across Bengaluru’s best neighbourhoods.'}
            </p>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-shell px-5 pb-24 lg:px-8">
        <div className="mt-2 grid gap-10 lg:grid-cols-[290px_1fr]">
          {/* sidebar desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-[92px] max-h-[calc(100vh-120px)] overflow-y-auto pr-2 pb-10">
              <div className="mb-5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-ink">
                  <SlidersHorizontal size={14} /> Filters
                </span>
                {activeCount > 0 && <Badge tone="ok">{activeCount}</Badge>}
              </div>
              {FiltersPanel}
            </div>
          </aside>

          <div className="min-w-0">
            {/* toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-4">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setDrawer(true)}>
                  <SlidersHorizontal size={14} /> Filters {activeCount > 0 && `(${activeCount})`}
                </Button>
                <span className="text-[13px] text-stone">
                  {loading ? 'Searching…' : result ? (
                    <><span className="font-semibold text-ink">{result.totalElements}</span> {result.totalElements === 1 ? 'home' : 'homes'} {budgetLabel !== 'Any budget' && <>· <span className="text-ink">{budgetLabel}</span></>}</>
                  ) : ''}
                </span>
              </div>
              <label className="flex items-center gap-2 text-[13px] text-stone">
                <ArrowUpDown size={13} />
                <span className="hidden sm:inline">Sort</span>
                <select
                  value={f.sort}
                  onChange={(e) => setParam({ sort: e.target.value })}
                  className="cursor-pointer rounded-[3px] border border-black/12 bg-white px-2.5 py-1.5 text-[13px] font-medium text-ink outline-none focus:border-ink"
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
            </div>

            {/* active chips */}
            {(locName || activeCount > 0) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {locName && <Chip label={locName} onClear={() => setParam({ location: '' })} icon={<MapPin size={11} />} />}
                {f.type && <Chip label={TYPE_OPTIONS.find((t) => t.value === f.type)?.label} onClear={() => setParam({ type: '' })} />}
                {f.bedrooms && <Chip label={`${f.bedrooms === '4' ? '4+' : f.bedrooms} bed${f.bedrooms === '1' ? '' : 's'}`} onClear={() => setParam({ bedrooms: '' })} />}
                {f.furnishing && <Chip label={FURNISHING_OPTIONS.find((o) => o.value === f.furnishing)?.label} onClear={() => setParam({ furnishing: '' })} />}
                {(f.minRent || f.maxRent) && <Chip label={budgetLabel} onClear={() => setParam({ minRent: '', maxRent: '' })} />}
                {f.amenities.map((id) => {
                  const a = amenities.find((x) => String(x.id) === id);
                  return a ? <Chip key={id} label={a.name} onClear={() => toggleAmenity(id)} /> : null;
                })}
                {activeCount > 1 && (
                  <button onClick={clearAll} className="text-[12px] font-semibold text-clay underline-offset-2 hover:underline">Clear all</button>
                )}
              </div>
            )}

            {/* results */}
            <div className="mt-6">
              {error ? (
                <ErrorState message={error} onRetry={() => setBump((b) => b + 1)} />
              ) : loading && !result ? (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => <PropertySkeleton key={i} />)}
                </div>
              ) : result && result.content.length === 0 ? (
                <EmptyState
                  title="Nothing matches those filters yet"
                  body="Try widening the budget or dropping a filter — new homes are verified every day."
                  action={<Button onClick={clearAll}>Reset filters</Button>}
                />
              ) : (
                <>
                  <div key={bump + f.page} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {result.content.map((p, i) => (
                      <PropertyCard p={p} key={p.id} index={i} />
                    ))}
                  </div>

                  {result.totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-2">
                      <PageBtn disabled={f.page === 0} onClick={() => setParam({ page: f.page - 1 }, false)}>‹ Prev</PageBtn>
                      {pageWindow(f.page, result.totalPages).map((n) =>
                        n === null ? (
                          <span key={`g${Math.random()}`} className="px-1 text-stone-light">…</span>
                        ) : (
                          <button
                            key={n}
                            onClick={() => setParam({ page: n }, false)}
                            className={`h-9 w-9 rounded-[3px] text-[13px] font-semibold transition-colors ${n === f.page ? 'bg-ink text-paper' : 'border border-black/12 hover:border-ink'}`}
                          >
                            {n + 1}
                          </button>
                        ),
                      )}
                      <PageBtn disabled={f.page >= result.totalPages - 1} onClick={() => setParam({ page: f.page + 1 }, false)}>Next ›</PageBtn>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* neighbourhood teaser */}
      <section className="border-t border-black/[0.07] bg-white py-24">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <NeighbourhoodGrid limit={5} />
        </div>
      </section>

      {/* mobile filter drawer */}
      <AnimatePresence>
        {drawer && (
          <motion.div className="fixed inset-0 z-[115] bg-black/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {drawer && (
          <motion.div
            className="fixed inset-y-0 left-0 z-[116] flex w-[86%] max-w-sm flex-col bg-paper lg:hidden"
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
              <span className="text-sm font-bold uppercase tracking-wider">Filters</span>
              <button onClick={() => setDrawer(false)} aria-label="Close filters"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">{FiltersPanel}</div>
            <div className="border-t border-black/10 p-4">
              <Button full onClick={() => setDrawer(false)}>Show results{result ? ` (${result.totalElements})` : ''}</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterGroup({ title, children }) {
  return (
    <fieldset>
      <legend className="mb-3 text-[11px] font-bold uppercase tracking-wide2 text-ink">{title}</legend>
      {children}
    </fieldset>
  );
}

function Chip({ label, onClear, icon }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-black/12 bg-white py-1 pl-3 pr-1.5 text-[12px] font-medium text-ink">
      {icon}{label}
      <button onClick={onClear} aria-label={`Remove ${label}`} className="grid h-4 w-4 place-items-center rounded-full hover:bg-black/10"><X size={11} /></button>
    </span>
  );
}

const PageBtn = ({ children, ...rest }) => (
  <button {...rest} className={`h-9 rounded-[3px] border border-black/12 px-3.5 text-[13px] font-semibold transition-colors ${rest.disabled ? 'opacity-35' : 'hover:border-ink'}`}>
    {children}
  </button>
);

function pageWindow(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i);
  const out = [0, pages - 1];
  for (let i = Math.max(1, page - 1); i <= Math.min(pages - 2, page + 1); i++) out.push(i);
  out.sort((a, b) => a - b);
  const final = [];
  let prev = null;
  for (const n of out) {
    if (prev !== null && n - prev > 1) final.push(null);
    if (!final.includes(n)) final.push(n);
    prev = n;
  }
  return final;
}
