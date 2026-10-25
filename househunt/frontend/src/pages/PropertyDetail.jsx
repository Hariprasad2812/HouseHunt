import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, Bath, BedDouble, Building2, CalendarDays, Check, ChevronLeft, ChevronRight,
  Expand, FileText, Heart, KeyRound, MapPin, MessageCircle, Phone, Ruler, ShieldCheck,
  Sofa, StickyNote, Waves, Wifi, X,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/useAuth';
import { atWidth } from '../lib/img';
import { inr, furnLabel, shortDate, timeAgo, prettyDateTime, typeLabel, initials, sentence } from '../lib/format';
import { nearFor } from '../lib/nearby';
import { PropertyCard, FavoriteHeart } from '../components/PropertyCard';
import { Badge, Button, ErrorState, Field, Input, ModalShell, Rating, Reveal, Skeleton, StatusBadge, Textarea, useModal, Verified } from '../components/ui';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { AMENITY_CATEGORY_LABEL } from '../lib/constants';


export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [full, setFull] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [sim, setSim] = useState([]);
  const nav = useNavigate();
  const { pathname } = useLocation();
  const { open } = useModal();

  useEffect(() => {
    let live = true;
    setLoading(true); setError(''); window.scrollTo(0, 0);
    api.get(`/properties/${id}`)
      .then(async (data) => {
        if (!live) return;
        setD(data);
        setLoading(false);
        api.get(`/properties/${id}/reviews`).then(setReviews).catch(() => {});
        api.get('/properties', { location: data.card.locationSlug, size: 4 }).then((r) => setSim(r.content.filter((x) => x.id !== data.card.id))).catch(() => {});
      })
      .catch((e) => { if (live) { setError(e.message); setLoading(false); } });
    return () => { live = false; };
  }, [id]);

  const stepImg = useCallback((dir) => {
    setActiveImg((i) => (i + dir + (d ? d.imageUrls.length : 1)) % (d ? d.imageUrls.length : 1));
  }, [d]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') stepImg(-1);
      if (e.key === 'ArrowRight') stepImg(1);
      if (e.key === 'Escape') setFull(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stepImg]);

  if (loading) return <DetailSkeleton />;
  if (error) {
    return (
      <div className="mx-auto max-w-shell px-5 pt-32 pb-24 lg:px-8">
        <ErrorState message={error} onRetry={() => nav(0)} />
      </div>
    );
  }
  if (!d) return null;

  const { card, owner, amenities, description, reviews: reviewSummary } = d;

  const openAuth = (action) => {
    open({ id: 'reqlogin', size: 'sm', content: (
      <div className="pt-1">
        <h3 className="text-xl font-semibold">Sign in to continue</h3>
        <p className="mt-2 text-sm leading-relaxed text-stone">Create a free account to apply, schedule visits and message {owner.fullName.split(' ')[0]} directly.</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link to="/login" state={{ from: pathname }} className="flex h-11 items-center justify-center rounded-[3px] bg-ink text-sm font-semibold text-paper">Sign in</Link>
          <Link to="/register" state={{ from: pathname }} className="flex h-11 items-center justify-center rounded-[3px] border border-black/20 text-sm font-semibold">Create account</Link>
        </div>
      </div>
    ) });
  };

  return (
    <div className="bg-paper pt-[68px]">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        {/* breadcrumb */}
        <nav className="flex items-center gap-2 py-5 text-[13px] text-stone">
          <Link to="/properties" className="hover:text-ink">Homes</Link>
          <span>/</span>
          <Link to={`/properties?location=${card.locationSlug}`} className="hover:text-ink">{card.locationName}</Link>
          <span>/</span>
          <span className="truncate text-ink">{card.title}</span>
        </nav>

        {/* gallery */}
        <Gallery
          images={d.imageUrls}
          active={activeImg}
          setActive={setActiveImg}
          onStep={stepImg}
          full={full}
          setFull={setFull}
        />

        {/* title band */}
        <Reveal delay={0.06} className="mt-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {card.verified && <Verified size={13} />}
              <Badge>{typeLabel(card.type)}</Badge>
              {card.featured && <Badge tone="warn">Featured</Badge>}
            </div>
            <h1 className="u-serif mt-4 text-[clamp(1.7rem,3vw,2.6rem)] leading-[1.08] text-ink">{card.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-[15px] text-stone">
              <MapPin size={15} className="text-clay" /> {card.locationName}, {card.address} — {card.locationSlug && <Link to={`/properties?location=${card.locationSlug}`} className="u-linkline text-ink">see more in {card.locationName}</Link>}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 border-y border-black/10 py-5">
              <Fact icon={<BedDouble size={17} />} k="Bedrooms" v={card.bedrooms} />
              <Fact icon={<Bath size={17} />} k="Bathrooms" v={card.bathrooms} />
              <Fact icon={<Ruler size={17} />} k="Area" v={`${card.floorAreaSqft} sq.ft`} />
              <Fact icon={<Sofa size={17} />} k="Furnishing" v={sentence(furnLabel(card.furnishing))} />
            </div>
            <p className="mt-6 text-[15px] leading-relaxed text-coal">{description}</p>
          </div>

          {/* sticky price / contact */}
          <aside>
            <div className="lg:sticky lg:top-24">
              <div className="u-card rounded-[5px] p-6">
                <p className="flex items-end gap-1.5">
                  <span className="u-serif text-[2.1rem] leading-none text-ink">{inr(card.rentPerMonth)}</span>
                  <span className="pb-1 text-sm text-stone">/month</span>
                </p>
                <p className="mt-1.5 text-[12.5px] text-stone">
                  Deposit {inr(card.deposit)} · Maintenance {inr(d.maintenancePerMonth)}
                </p>
                <div className="mt-5 space-y-2.5">
                  <Button variant="accent" full size="lg" onClick={() => (user ? openVisit(d, open, owner) : openAuth())}>
                    <CalendarDays size={16} /> Schedule a visit
                  </Button>
                  <Button variant="solid" full onClick={() => (user ? openApply(d, open, owner, user) : openAuth())}>
                    <FileText size={16} /> Apply to rent
                  </Button>
                  <Button variant="outline" full onClick={() => (user ? openContact(d, open, owner) : openAuth())}>
                    <MessageCircle size={16} /> Contact owner
                  </Button>
                </div>
                <div className="mt-5 flex items-center justify-between rounded-[4px] bg-sand px-4 py-3">
                  <span className="flex items-center gap-2 text-[13px] font-medium text-coal">Save this home</span>
                  <FavoriteHeart property={{ ...card, favorited: card.favorited }} size={18} />
                </div>
                <p className="mt-4 flex items-start gap-2 text-[11.5px] leading-relaxed text-stone">
                  <ShieldCheck size={14} className="mt-0.5 shrink-0 text-moss" />
                  No brokerage. You deal directly with the verified owner through HouseHunt.
                </p>
              </div>

              {/* owner card */}
              <div className="mt-4 flex items-center gap-4 bg-[#221f18] p-5 text-paper">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-clay text-sm font-bold">
                  {initials(owner.fullName)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{owner.fullName}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[12px] text-paper/55">
                    {owner.verified && <Check size={11} className="text-clay-soft" />} Verified owner · Bengaluru
                  </p>
                  <p className="text-[11px] text-paper/40">Member since {shortDate(owner.memberSince)}</p>
                </div>
                <a href={`tel:${owner.phone}`} className="grid h-10 w-10 place-items-center rounded-full border border-paper/25 text-paper transition-colors hover:bg-paper hover:text-ink" aria-label="Call owner">
                  <Phone size={15} />
                </a>
              </div>
            </div>
          </aside>
          </div>
        </Reveal>

        {/* amenities + rules + map */}
        <Reveal delay={0.1} className="mt-16">
          <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionTitle>Amenities</SectionTitle>
            <div className="mt-5 grid gap-4">
              {Object.entries(groupAmenities(amenities)).map(([cat, items]) => (
                <div key={cat}>
                  <p className="text-[11px] font-bold uppercase tracking-wide2 text-stone-light">{AMENITY_CATEGORY_LABEL[cat] || cat}</p>
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    {items.map((a) => (
                      <div key={a.id} className="flex items-center gap-2.5 rounded-[3px] border border-black/[0.08] bg-white px-3 py-2.5 text-[13.5px]">
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-sand text-clay"><Check size={13} strokeWidth={2.5} /></span>
                        {a.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <SectionTitle className="mt-14">House rules &amp; lease</SectionTitle>
            <div className="mt-4 space-y-3 rounded-[4px] border border-black/[0.08] bg-white p-5 text-[14px] leading-relaxed text-coal">
              <p>{d.houseRules}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-black/[0.06] pt-4 text-[13px] text-stone">
                <span className="flex items-center gap-1.5"><KeyRound size={13} /> {card.furnishing === 'FURNISHED' ? 'Fully' : card.furnishing === 'SEMI_FURNISHED' ? 'Semi-' : 'Not '}furnished</span>
                <span className="flex items-center gap-1.5"><CalendarDays size={13} /> Available from {d.availableFrom ? shortDate(d.availableFrom) : 'now'}</span>
                <span className="flex items-center gap-1.5"><FileText size={13} /> {d.leaseTerm || '11 months'} lease</span>
                <span className="flex items-center gap-1.5"><Heart size={13} /> {card.type === 'INDEPENDENT_HOUSE' || card.type === 'VILLA' ? 'Pets generally welcome' : d.petAllowed ? 'Pet friendly' : 'Pets on request'}</span>
              </div>
            </div>

            <SectionTitle className="mt-14">Location</SectionTitle>
            <p className="mt-2 text-[14px] text-stone">{card.locationName}, {card.address} — a guide to what's around this {typeLabel(card.type).toLowerCase()}</p>
            <div className="mt-5 h-72 overflow-hidden rounded-[4px] border border-black/10">
              <LocationMap lat={card.lat} lng={card.lng} name={card.locationName} />
            </div>
            <ul className="mt-5 divide-y divide-black/[0.06] border-y border-black/[0.08]">
              {nearFor(card.locationSlug).map((n) => (
                <li key={n.name} className="flex items-center justify-between gap-4 py-3 text-[13.5px]">
                  <span className="text-coal">{n.name}</span>
                  <span className="shrink-0 text-[12px] text-stone-light">
                    {n.walk ? <>walk {n.walk} · </> : ''}{n.drive} drive
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* right column content: extras, reviews */}
          <div>
            <SectionTitle>Property details</SectionTitle>
            <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-black/[0.08] bg-black/[0.06]">
              {[
                ['Property type', typeLabel(card.type)],
                ['Bedrooms', `${card.bedrooms}`],
                ['Bathrooms', `${card.bathrooms}`],
                ['Carpet area', `${card.floorAreaSqft} sq.ft`],
                ['Furnishing', furnLabel(card.furnishing)],
                ['Deposit', inr(card.deposit)],
                ['Maintenance', inr(d.maintenancePerMonth)],
                ['Lease term', d.leaseTerm || '11 months'],
                ['Available from', d.availableFrom ? shortDate(d.availableFrom) : 'Immediately'],
                ['Listing views', `${card.views} this month`],
              ].map(([k, v]) => (
                <div key={k} className="bg-white px-4 py-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-light">{k}</p>
                  <p className="mt-1 text-[13.5px] font-medium text-ink">{v}</p>
                </div>
              ))}
            </div>

            <SectionTitle className="mt-12">Reviews</SectionTitle>
            <div className="mt-4 flex flex-wrap items-center gap-5">
              <span className="u-serif text-5xl text-ink">{reviewSummary.rating ? Number(reviewSummary.rating).toFixed(1) : '—'}</span>
              <div>
                <Rating value={Math.round(reviewSummary.rating)} size={18} />
                <p className="mt-1 text-[13px] text-stone">{reviewSummary.count} verified review{reviewSummary.count === 1 ? '' : 's'}</p>
              </div>
            </div>

            <ReviewForm propertyId={card.id} onAdd={(r) => setReviews((s) => [r, ...s])} />

            <div className="mt-6 space-y-4">
              {reviews.length === 0 && <p className="text-sm text-stone">No published reviews yet. Be the first after your visit.</p>}
              {reviews.map((r) => (
                <div key={r.id} className="rounded-[4px] border border-black/[0.08] bg-white p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-sand text-[12px] font-bold text-ink">{initials(r.authorName)}</span>
                    <div className="flex-1">
                      <p className="text-[13.5px] font-semibold text-ink">{r.authorName}</p>
                      <Rating value={r.rating} size={12} />
                    </div>
                    <span className="text-[11.5px] text-stone-light">{timeAgo(r.createdAt)}</span>
                  </div>
                  <p className="mt-3 text-[14px] leading-relaxed text-coal">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        </Reveal>

        {/* similar */}
        {sim.length > 0 && (
          <div className="mt-20 border-t border-black/[0.08] py-12">
            <div className="flex items-end justify-between">
              <div>
                <p className="u-eyebrow mb-2">More in {card.locationName}</p>
                <h2 className="u-serif text-3xl text-ink">You may also like</h2>
              </div>
              <Link to={`/properties?location=${card.locationSlug}`} className="text-sm font-semibold u-linkline">View all</Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sim.slice(0, 3).map((p) => <PropertyCard key={p.id} p={p} />)}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {full && (
          <FullscreenGallery images={d.imageUrls} active={activeImg} onStep={stepImg} onClose={() => setFull(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- gallery ---------------- */
function Gallery({ images, active, setActive, onStep, full, setFull }) {
  const [hover, setHover] = useState(false);
  return (
    <div className="relative overflow-hidden rounded-[4px] bg-coal" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="relative aspect-[16/9] w-full sm:aspect-[21/10]">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.img
            key={active}
            src={atWidth(images[active], 1800)}
            alt=""
            initial={{ opacity: 0, scale: 1.015 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        <div className={`absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-3 transition-opacity duration-300 ${hover || full ? 'opacity-100' : 'opacity-0'}`}>
          <button onClick={() => onStep(-1)} aria-label="Previous photo" className="grid h-11 w-11 place-items-center rounded-full bg-white/95 text-ink shadow-soft transition-transform hover:scale-105"><ChevronLeft size={20} /></button>
          <button onClick={() => onStep(1)} aria-label="Next photo" className="grid h-11 w-11 place-items-center rounded-full bg-white/95 text-ink shadow-soft transition-transform hover:scale-105"><ChevronRight size={20} /></button>
        </div>
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <span className="rounded-full bg-ink/70 px-3 py-1 text-[11px] font-semibold text-paper backdrop-blur">{active + 1} / {images.length}</span>
          <button onClick={() => setFull(true)} aria-label="Fullscreen" className="grid h-9 w-9 place-items-center rounded-full bg-ink/70 text-paper backdrop-blur transition-colors hover:bg-ink"><Expand size={15} /></button>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto bg-[#171612] p-2 no-scrollbar">
        {images.map((u, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`relative h-16 w-24 shrink-0 overflow-hidden transition-all ${i === active ? 'ring-2 ring-clay ring-offset-1 ring-offset-[#171612]' : 'opacity-60 hover:opacity-100'}`}
          >
            <img src={atWidth(u, 320)} alt="" loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function FullscreenGallery({ images, active, onStep, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col bg-[#0d0c0a] text-paper"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      role="dialog" aria-modal="true" aria-label="Photo gallery"
    >
      <div className="flex items-center justify-between px-5 py-4">
        <span className="text-sm font-semibold tracking-wider">{active + 1} / {images.length}</span>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-paper/50">← → to navigate · esc to close</span>
          <button onClick={onClose} aria-label="Close gallery" className="grid h-10 w-10 place-items-center rounded-full border border-paper/20 transition-colors hover:bg-paper hover:text-ink"><X size={18} /></button>
        </div>
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-6">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.img
            key={active}
            src={atWidth(images[active], 2200)}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="max-h-full max-w-full object-contain"
          />
        </AnimatePresence>
        <button onClick={() => onStep(-1)} className="absolute left-4 grid h-12 w-12 place-items-center rounded-full bg-paper/10 backdrop-blur transition-colors hover:bg-paper hover:text-ink" aria-label="Previous"><ChevronLeft size={22} /></button>
        <button onClick={() => onStep(1)} className="absolute right-4 grid h-12 w-12 place-items-center rounded-full bg-paper/10 backdrop-blur transition-colors hover:bg-paper hover:text-ink" aria-label="Next"><ChevronRight size={22} /></button>
      </div>
    </motion.div>
  );
}

/* ---------------- facts & helpers ---------------- */
const Fact = ({ icon, k, v }) => (
  <div className="flex items-center gap-2.5">
    <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-clay" style={{ border: '1px solid rgba(27,26,22,.08)' }}>{icon}</span>
    <div><p className="text-[10.5px] font-semibold uppercase tracking-wider text-stone-light">{k}</p><p className="text-[14px] font-semibold text-ink">{v}</p></div>
  </div>
);

const SectionTitle = ({ children, className = '' }) => (
  <h2 className={`flex items-center gap-3 text-[15px] font-bold uppercase tracking-wide2 text-ink ${className}`}>
    {children}<span className="h-px flex-1 bg-black/[0.1]" />
  </h2>
);

function groupAmenities(list = []) {
  const groups = {};
  list.forEach((a) => {
    (groups[a.category] = groups[a.category] || []).push(a);
  });
  return groups;
}

function LocationMap({ lat, lng, name }) {
  const icon = L.divIcon({ className: '', html: '<span class="hh-marker active">‹</span>', iconSize: [36, 36], iconAnchor: [18, 18] });
  if (!lat || !lng) return <div className="grid h-full place-items-center text-sm text-stone">Map unavailable</div>;
  return (
    <MapContainer center={[lat, lng]} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
      <TileLayer attribution="OSM" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]} icon={icon} />
    </MapContainer>
  );
}

/* ---------------- action modals ---------------- */
function openVisit(property, open, owner) {
  const d = property;
  open({
    id: 'visit', size: 'md',
    content: <VisitForm d={d} owner={owner} onDone={() => {}} />,
  });
}

function VisitForm({ d, onDone }) {
  const { close } = useModal();
  const [at, setAt] = useState('');
  const [mode, setMode] = useState('IN_PERSON');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const submit = async () => {
    if (!at) return setErr('Please pick a date and time.');
    setBusy(true); setErr(''); setMsg('');
    try {
      const iso = new Date(at);
      const res = await api.post(`/properties/${d.card.id}/visits`, {
        propertyId: d.card.id, scheduledAt: iso.toISOString(), mode, note,
      });
      setMsg(`Request sent. The owner will confirm your visit on ${prettyDateTime(res.scheduledAt)}.`);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  return (
    <div className="pt-1">
      <p className="u-eyebrow mb-2">Visit request</p>
      <h3 className="u-serif text-3xl text-ink">Schedule a visit</h3>
      <p className="mt-2 text-sm text-stone">{d.card.title} · {d.card.locationName}</p>
      <div className="mt-6 space-y-4">
        <Field label="Date & time" required>
          <Input type="datetime-local" value={at} min={new Date(Date.now() + 3600e3).toISOString().slice(0, 16)} onChange={(e) => setAt(e.target.value)} />
        </Field>
        <Field label="Visit mode">
          <div className="grid grid-cols-2 gap-2">
            {[['IN_PERSON', 'In person'], ['VIDEO_CALL', 'Video call']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => setMode(v)} className={`rounded-[3px] border px-3 py-2.5 text-sm font-medium ${mode === v ? 'border-ink bg-ink text-paper' : 'border-black/12 hover:border-black/30'}`}>{l}</button>
            ))}
          </div>
        </Field>
        <Field label="Anything the owner should know? (optional)">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. I'll be reaching from work around then…" />
        </Field>
        {err && <p className="text-[13px] text-red-600">{err}</p>}
        {msg && <p className="rounded-[3px] bg-moss/10 px-3.5 py-3 text-[13px] text-moss">{msg}</p>}
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Button variant="accent" full onClick={submit} disabled={busy || !!msg}>
          {busy ? 'Sending…' : 'Request visit'}
        </Button>
        {msg && <Button variant="outline" onClick={() => close('visit')}>Close</Button>}
      </div>
      <p className="mt-3 text-[11.5px] text-stone">Free of charge · No commitment · Cancellable anytime</p>
    </div>
  );
}

function openApply(property, open, owner, user) {
  open({
    id: 'apply', size: 'md',
    content: <ApplyForm d={property} owner={owner} user={user} onDone={() => {}} />,
  });
}

function ApplyForm({ d, onDone }) {
  const { close } = useModal();
  const [msg, setMsg] = useState('');
  const [date, setDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const submit = async () => {
    setBusy(true); setErr('');
    try {
      await api.post(`/properties/${d.card.id}/applications`, { propertyId: d.card.id, message: msg, moveInDate: date || null });
      setDone(true);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  return (
    <div className="pt-1">
      <p className="u-eyebrow mb-2">Rental application</p>
      <h3 className="u-serif text-3xl text-ink">Apply for this home</h3>
      <p className="mt-2 text-sm text-stone">{d.card.title} · {inr(d.card.rentPerMonth)}/month</p>
      {!done ? (
        <>
          <div className="mt-6 space-y-4">
            <Field label="Introduce yourself to the owner" required hint={`max 2,000 chars · as ${''}`}>
              <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Work profile, family size, expected move-in month, and anything you'd like them to know about you as a tenant…" maxLength={2000} />
            </Field>
            <Field label="Preferred move-in date">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            {err && <p className="text-[13px] text-red-600">{err}</p>}
          </div>
          <div className="mt-6">
            <Button variant="accent" full size="lg" onClick={submit} disabled={busy}>{busy ? 'Submitting…' : 'Submit application'}</Button>
            <p className="mt-3 text-center text-[11.5px] text-stone">The owner reviews applications directly — expect a response within a day.</p>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-[4px] bg-moss/10 p-6 text-center">
          <p className="text-2xl">✓</p>
          <h4 className="mt-2 text-lg font-semibold text-ink">Application submitted</h4>
          <p className="mt-1 text-sm text-stone">We've notified the owner. Track its status anytime in your dashboard → Applications.</p>
          <div className="mt-5 flex justify-center"><Button variant="solid" onClick={() => close('apply')}>Done</Button></div>
        </div>
      )}
    </div>
  );
}

function openContact(property, open, owner) {
  open({
    id: 'contact', size: 'md',
    content: <ContactForm d={property} owner={owner} />,
  });
}

function ContactForm({ d, owner }) {
  const { close } = useModal();
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const submit = async () => {
    if (msg.trim().length < 10) return setErr('Write at least a sentence so the owner can help.');
    setBusy(true); setErr('');
    try {
      await api.post('/messages', { recipientId: owner.id, propertyId: d.card.id, body: msg });
      setDone(true);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  return (
    <div className="pt-1">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-clay text-sm font-bold text-white">{initials(owner.fullName)}</span>
        <div>
          <p className="font-semibold text-ink">{owner.fullName}</p>
          <p className="text-[12px] text-stone">{owner.verified ? 'Verified owner' : 'Owner'} · Bengaluru</p>
        </div>
        <a href={`tel:${owner.phone}`} className="ml-auto inline-flex items-center gap-2 rounded-full border border-black/15 px-3.5 py-2 text-[12.5px] font-semibold text-ink hover:border-ink">
          <Phone size={13} /> Call
        </a>
      </div>
      <p className="mt-5 text-sm text-stone">Ask about availability, lease terms, deposits or anything on the listing. Messages stay in your dashboard.</p>
      {!done ? (
        <>
          <Textarea className="mt-4" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={`Hi ${owner.fullName.split(' ')[0]}, I saw your listing "${d.card.title}"…`} maxLength={3000} />
          {err && <p className="mt-2 text-[13px] text-red-600">{err}</p>}
          <Button className="mt-4" variant="solid" full size="lg" onClick={submit} disabled={busy}>{busy ? 'Sending…' : 'Send message'}</Button>
        </>
      ) : (
        <div className="mt-5 rounded-[4px] bg-moss/10 p-5 text-center">
          <p className="text-sm font-semibold text-moss">Message sent to {owner.fullName.split(' ')[0]}. Watch your dashboard → Messages.</p>
          <Button className="mt-4" variant="outline" onClick={() => close('contact')}>Done</Button>
        </div>
      )}
    </div>
  );
}

function ReviewForm({ propertyId, onAdd }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');
  const submit = async () => {
    if (!user) return;
    try {
      await api.post(`/properties/${propertyId}/reviews`, { rating, comment });
      setSent(true);
      setComment('');
    } catch (e) { setErr(e.message); }
  };
  if (!user) {
    return <Link to="/login" state={{ from: pathname }} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-clay u-linkline">Sign in to leave a review</Link>;
  }
  if (sent) return <p className="mt-5 rounded-[3px] bg-moss/10 px-4 py-3 text-[13px] text-moss">Thanks! Your review is awaiting moderation and will appear shortly.</p>;
  return (
    <div className="mt-6 rounded-[4px] border border-black/[0.08] bg-white p-5">
      <p className="text-sm font-semibold text-ink">Visited this home? Tell us about it.</p>
      <div className="mt-3 flex items-center gap-3">
        <Rating value={rating} onPick={setRating} size={20} />
        <span className="text-[12px] text-stone-light">{['', 'Terrible', 'Poor', 'Okay', 'Good', 'Excellent'][rating]}</span>
      </div>
      <Textarea className="mt-3" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What was the flat, the owner and the paperwork really like?" maxLength={2000} />
      {err && <p className="mt-2 text-[13px] text-red-600">{err}</p>}
      <Button className="mt-3" variant="outline" size="sm" onClick={submit} disabled={comment.trim().length < 20}>
        Submit review
      </Button>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-shell px-5 pt-[120px] pb-24 lg:px-8">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="mt-6 aspect-[21/10] w-full" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div><Skeleton className="h-10 w-3/4" /><Skeleton className="mt-4 h-5 w-1/2" /><Skeleton className="mt-6 h-40 w-full" /></div>
        <div><Skeleton className="h-[430px] w-full" /></div>
      </div>
    </div>
  );
}
