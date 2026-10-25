import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Building2, ChevronDown, MapPin, MoveRight, Search, SlidersHorizontal } from 'lucide-react';
import { IMG } from '../../lib/assets';
import { api } from '../../lib/api';
import { useReducedMotion } from '../ui';
import { TYPE_OPTIONS, BED_OPTIONS, RENT_PRESETS } from '../../lib/constants';

gsap.registerPlugin(ScrollTrigger);

const ease = [0.22, 1, 0.36, 1];

function MaskLine({ children, delay = 0 }) {
  return (
    <span className="block overflow-hidden pb-[0.06em] -mb-[0.06em]">
      <motion.span
        className="block will-change-transform"
        initial={{ y: '112%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 1, delay, ease }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero() {
  const reduced = useReducedMotion();
  const nav = useNavigate();
  const wrap = useRef(null);
  const imgWrap = useRef(null);
  const contentRef = useRef(null);
  const cueRef = useRef(null);

  useEffect(() => {
    if (reduced || !wrap.current) return;
    // scrub the hero as it scrolls away: image drifts, content + scroll cue recede.
    // Transform/opacity only; gsap's ScrollTrigger scrubs by scroll position (no layout thrash).
    const st = gsap.timeline({
      scrollTrigger: { trigger: wrap.current, start: 'top top', end: 'bottom top', scrub: true },
      defaults: { ease: 'none' },
    });
    if (imgWrap.current) st.to(imgWrap.current, { yPercent: 14 }, 0);
    if (contentRef.current) st.to(contentRef.current, { opacity: 0.35, yPercent: -6 }, 0);
    if (cueRef.current) st.to(cueRef.current, { opacity: 0 }, 0.02);
    return () => { st.scrollTrigger?.kill(); st.kill(); };
  }, [reduced]);

  const [q, setQ] = useState({ location: '', type: '', bedrooms: '', minRent: '', maxRent: '' });
  const pick = (k, v) => setQ((s) => ({ ...s, [k]: v || '' }));

  const doSearch = () => {
    const p = {};
    if (q.location) p.location = q.location;
    if (q.type) p.type = q.type;
    if (q.bedrooms) p.bedrooms = q.bedrooms;
    if (q.minRent) p.minRent = q.minRent;
    if (q.maxRent) p.maxRent = q.maxRent;
    nav({ pathname: '/properties', search: new URLSearchParams(p).toString() });
  };

  return (
    <section ref={wrap} className="relative flex min-h-[100svh] flex-col overflow-hidden bg-ink text-paper">
      <div ref={imgWrap} className="absolute inset-0 will-change-transform">
        <motion.img
          src={IMG.hero}
          alt=""
          fetchpriority="high"
          className="h-full w-full object-cover object-center"
          initial={reduced ? false : { scale: 1.06 }}
          animate={reduced ? undefined : { scale: [1.06, 1.13, 1.06] }}
          transition={{ duration: 34, ease: 'easeInOut', repeat: Infinity }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/75" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(27,26,22,.5) 0%, rgba(27,26,22,.12) 55%, rgba(27,26,22,.5) 100%)' }} />
      </div>

      <motion.div ref={contentRef} className="relative z-10 flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-shell flex-1 flex-col justify-center px-5 pb-8 pt-32 lg:px-8">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease }}
            className="flex items-center gap-4"
          >
            <span className="h-px w-10 bg-clay-soft" />
            <span className="text-[11px] font-bold uppercase tracking-wide3 text-paper/85">Find a place to belong</span>
          </motion.div>

          <h1 className="u-serif mt-7 max-w-4xl text-[clamp(2.7rem,6.4vw,5.4rem)] leading-[1.02] tracking-[-0.005em]">
            {reduced ? (
              <>Your next home<br /><span className="italic text-clay-soft">should feel like home.</span></>
            ) : (
              <>
                <MaskLine delay={0.26}>
                  Your next home
                </MaskLine>
                <MaskLine delay={0.4}>
                  <span className="italic text-clay-soft">should feel like home.</span>
                </MaskLine>
              </>
            )}
          </h1>

          <motion.p
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: reduced ? 0.2 : 0.55, ease }}
            className="mt-7 max-w-xl text-[16px] leading-relaxed text-paper/80 sm:text-lg"
          >
            Discover thoughtfully selected rental homes across Bengaluru — from quiet neighbourhoods
            to the heart of the city.
          </motion.p>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: reduced ? 0.25 : 0.68, ease }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <button
              onClick={() => nav('/properties')}
              className="group inline-flex h-[52px] items-center gap-3 rounded-[3px] bg-paper px-8 text-[15px] font-semibold text-ink transition-all duration-300 hover:bg-white"
            >
              Explore homes
              <motion.span
                animate={reduced ? undefined : { x: [0, 4, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex"
              >
                <MoveRight className="h-4 w-4" strokeWidth={1.8} />
              </motion.span>
            </button>
            <button
              onClick={() => nav('/list-property')}
              className="inline-flex h-[52px] items-center gap-2 rounded-[3px] border border-paper/45 px-8 text-[15px] font-semibold text-paper backdrop-blur-[2px] transition-colors hover:border-paper hover:bg-paper/10"
            >
              <Building2 className="h-4 w-4" strokeWidth={1.6} /> List your property
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, delay: reduced ? 0.3 : 0.85, ease }}
          className="relative z-20"
        >
          {!reduced && (
            <motion.div
              ref={cueRef}
              className="pointer-events-none absolute -top-20 right-8 z-10 hidden flex-col items-center gap-1 text-paper/70 xl:flex"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 1.5, duration: 0.8 } }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wide3">Scroll</span>
              <motion.span
                animate={{ y: [0, 7, 0] }}
                transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown size={18} strokeWidth={1.8} />
              </motion.span>
            </motion.div>
          )}
          <div className="mx-auto w-full max-w-shell px-0 lg:px-8">
            <div className="bg-paper text-ink shadow-[0_30px_90px_-24px_rgba(0,0,0,.85)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.15fr_1fr_1fr_.9fr_auto]">
                <FieldCell icon={<MapPin size={16} />} label="Location">
                  <LocationField onPick={(slug) => pick('location', slug)} />
                </FieldCell>
                <FieldCell icon={<Building2 size={16} />} label="Property type">
                  <PlainSelect
                    placeholder="Any type"
                    options={TYPE_OPTIONS}
                    onChange={(v) => pick('type', v)}
                  />
                </FieldCell>
                <FieldCell icon={<SlidersHorizontal size={16} />} label="Budget">
                  <PlainSelect
                    placeholder="Any budget"
                    options={RENT_PRESETS.slice(1).map((r, i) => ({ value: String(i), label: r.label }))}
                    onChange={(v) => {
                      const r = RENT_PRESETS[Number(v) + 1];
                      setQ((s) => ({ ...s, minRent: r.min, maxRent: r.max }));
                    }}
                  />
                </FieldCell>
                <FieldCell icon={<Search size={16} />} label="Bedrooms">
                  <PlainSelect placeholder="Any" options={BED_OPTIONS} onChange={(v) => pick('bedrooms', v)} />
                </FieldCell>
                <div className="hidden lg:block">
                  <button
                    onClick={doSearch}
                    className="group flex h-full items-center gap-3 bg-ink px-9 text-[15px] font-semibold text-paper transition-colors hover:bg-clay"
                  >
                    Search homes
                  </button>
                </div>
              </div>
              <button
                onClick={doSearch}
                className="flex w-full items-center justify-center gap-2 bg-ink py-4 text-[15px] font-semibold text-paper transition-colors hover:bg-clay lg:hidden"
              >
                <Search size={17} /> Search homes
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function FieldCell({ icon, label, children }) {
  return (
    <div className="flex flex-col justify-center gap-1.5 border-b border-black/10 px-5 py-4 sm:last:border-b-0 lg:border-b-0 lg:border-r lg:py-6 lg:px-7 lg:last:border-r-0">
      <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide2 text-stone-light">
        {icon} {label}
      </span>
      <div className="text-[15px]">{children}</div>
    </div>
  );
}

function PlainSelect({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = options.find((o) => String(o.value) === String(value));
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 text-left ${current ? 'font-medium text-ink' : 'text-stone-light'}`}
      >
        <span className="truncate">{current ? current.label : placeholder || 'Select'}</span>
        <ChevronDown size={15} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 max-h-64 w-56 overflow-auto rounded-[4px] border border-black/10 bg-white py-1.5 shadow-pop">
          <button
            className="block w-full px-4 py-2 text-left text-sm text-stone hover:bg-paper"
            onClick={() => { onChange(''); setOpen(false); }}
          >
            {placeholder || 'Any'}
          </button>
          {options.map((o) => (
            <button
              key={o.value}
              className={`block w-full px-4 py-2 text-left text-sm hover:bg-paper ${String(o.value) === String(value) ? 'font-semibold text-clay' : 'text-ink'}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LocationField({ onPick }) {
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [places, setPlaces] = useState([]);
  const [chosen, setChosen] = useState(null);
  const ref = useRef(null);
  useEffect(() => {
    api.get('/locations').then((d) => setPlaces(d)).catch(() => {});
  }, []);
  const list = useMemo(() => {
    if (!places.length) return [];
    return places.filter((p) => p.name.toLowerCase().includes(text.toLowerCase())).slice(0, 6);
  }, [places, text]);
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return (
    <div ref={ref} className="relative min-w-[150px]">
      <input
        value={text}
        onChange={(e) => { setText(e.target.value); setOpen(true); if (chosen) { setChosen(null); onPick(''); } }}
        onFocus={() => setOpen(true)}
        placeholder={chosen ? chosen : 'Search by area…'}
        className="w-full bg-transparent font-medium text-ink outline-none placeholder:text-stone-light"
      />
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-[4px] border border-black/10 bg-white py-1 shadow-pop">
          {list.length > 0 ? list.map((p) => (
            <button
              key={p.slug}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left hover:bg-paper"
              onClick={() => { setText(p.name); setChosen(p.name); setOpen(false); onPick(p.slug); }}
            >
              <MapPin size={14} className="text-clay" />
              <span className="text-sm font-medium text-ink">{p.name}</span>
              <span className="ml-auto text-[11px] text-stone-light">{p.propertyCount || ''}</span>
            </button>
          )) : (
            <p className="px-4 py-3 text-sm text-stone">Start typing an area…</p>
          )}
        </div>
      )}
    </div>
  );
}
