import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Building2, Camera, Check, CircleCheck, ClipboardList, Home, Image as ImageIcon,
  LayoutGrid, MapPin, PencilLine, UploadCloud, X,
} from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/useAuth';
import { IMG } from '../lib/assets';
import { Button, CheckBox, ErrorState, Field, Input, Radios, Select, Textarea } from '../components/ui';
import { TYPE_OPTIONS, FURNISHING_OPTIONS, AMENITY_CATEGORIES, AMENITY_CATEGORY_LABEL } from '../lib/constants';
import { inr, typeLabel } from '../lib/format';

const STEPS = [
  ['Property details', Home], ['Location', MapPin], ['Photos', Camera],
  ['Pricing', LayoutGrid], ['Amenities', CircleCheck], ['Preview', ClipboardList], ['Publish', PencilLine],
];

const DRAFT_KEY = 'hh_list_draft';

const empty = {
  title: '', type: 'APARTMENT', furnishing: 'SEMI_FURNISHED', description: '',
  locationSlug: 'indiranagar', address: '', lat: '', lng: '',
  bedrooms: 2, bathrooms: 2, balconies: 1, floorAreaSqft: 1000,
  rentPerMonth: '', deposit: '', maintenancePerMonth: 0,
  petAllowed: false, leaseTerm: '11 months', availableFrom: '', houseRules: '',
  imageUrls: [], amenityIds: [],
};

export default function ListProperty() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [f, setF] = useState(() => ({ ...empty, ...JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}') }));
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [doneId, setDoneId] = useState(null);
  const nav = useNavigate();

  const set = (patch) => { setF((s) => ({ ...s, ...patch })); localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...f, ...patch })); };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const setVal = (k) => (v) => set({ [k]: v });
  const num = (k) => (e) => set({ [k]: e.target.value === '' ? '' : Number(e.target.value) });

  const stepValid = useMemo(() => {
    switch (step) {
      case 0: return f.title.trim().length >= 12 && f.description.trim().length >= 80;
      case 1: return !!f.locationSlug && f.address.trim().length >= 4;
      case 2: return f.imageUrls.length >= 1;
      case 3: return Number(f.rentPerMonth) >= 1000;
      default: return true;
    }
  }, [step, f]);

  const next = () => { setErr(''); if (stepValid) { setStep((s) => Math.min(s + 1, 6)); } else { setErr(stepErr(step)); } };

  if (doneId) {
    return (
      <div className="bg-paper pt-[68px]">
        <div className="mx-auto max-w-2xl px-5 py-24 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-moss/10 text-moss"><Check size={28} /></div>
          <h1 className="u-serif mt-6 text-4xl text-ink">Listing submitted.</h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-stone">
            Our verification team reviews ownership documents and photos, usually within 24 hours.
            You'll be notified the moment it goes live. Until then, track it in your dashboard.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button to="/owner/properties" variant="solid">Go to my properties</Button>
            <Button to="/properties" variant="outline">Keep browsing homes</Button>
          </div>
        </div>
      </div>
    );
  }

  // gates
  if (!user) {
    return <Gate kind="guest" />;
  }
  if (user.role === 'TENANT') {
    return <Gate kind="tenant" />;
  }

  return (
    <div className="bg-paper pt-[68px]">
      {/* banner */}
      <section className="border-b border-black/[0.07] bg-[#221f18] text-paper">
        <div className="mx-auto flex max-w-shell flex-wrap items-end justify-between gap-6 px-5 py-12 lg:px-8">
          <div>
            <p className="u-eyebrow mb-3 text-clay-soft">For owners</p>
            <h1 className="u-serif text-[clamp(1.8rem,3.4vw,2.8rem)] leading-tight">Have a property to rent?</h1>
            <p className="mt-2 max-w-lg text-[14.5px] text-paper/60">
              Reach people actively looking for their next home. Most listings are verified and live within 24 hours.
            </p>
          </div>
          <div className="flex gap-6 text-center">
            {[['₹0', 'to list'], ['24h', 'verification'], ['Direct', 'owner leads']].map(([a, b]) => (
              <div key={b}><p className="u-serif text-2xl text-clay-soft">{a}</p><p className="text-[11px] uppercase tracking-wider text-paper/50">{b}</p></div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
        {/* progress */}
        <div className="mb-10 hidden items-center md:flex">
          {STEPS.map(([label, Icon], i) => (
            <div key={label} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
              <button
                onClick={() => i < step && setStep(i)}
                className={`group flex flex-col items-center gap-1.5 ${i < step ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span className={`grid h-9 w-9 place-items-center rounded-full border text-[13px] font-semibold transition-colors ${i === step ? 'border-ink bg-ink text-paper' : i < step ? 'border-moss/40 bg-moss/10 text-moss' : 'border-black/15 text-stone-light'}`}>
                  {i < step ? <Check size={15} strokeWidth={2.5} /> : i + 1}
                </span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${i === step ? 'text-ink' : 'text-stone-light'}`}>{label}</span>
              </button>
              {i < STEPS.length - 1 && <span className={`mx-3 mb-5 h-px flex-1 ${i < step ? 'bg-moss/50' : 'bg-black/10'}`} />}
            </div>
          ))}
        </div>

        {/* mobile step label */}
        <div className="mb-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-stone-light md:hidden">
          Step {step + 1} of {STEPS.length} · {STEPS[step][0]}
        </div>

        <div className="u-card rounded-[6px] p-6 sm:p-10">
          {err && <div className="mb-6 rounded-[3px] bg-red-50 px-4 py-3 text-[13px] text-red-700">{err}</div>}

          {step === 0 && (
            <Panel title="Tell us about the home" sub="These details power the search — be specific, it helps the right tenant find you.">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Listing title" required hint="e.g. 2BHK on a quiet lane, Indiranagar">
                    <Input value={f.title} onChange={(e) => setVal('title')(e.target.value)} placeholder="Short, honest and specific" />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field label="Description" required hint={f.description.length >= 80 ? `${f.description.length}/2000` : 'at least 80 characters'}>
                    <Textarea className="min-h-[140px]" value={f.description} onChange={(e) => setVal('description')(e.target.value)} placeholder="What makes this home worth renting? Light, layout, neighbours, what's nearby…" maxLength={2000} />
                  </Field>
                </div>
                <Field label="Property type" required>
                  <Select value={f.type} onChange={setVal('type')}>{TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select>
                </Field>
                <Field label="Furnishing" required>
                  <Select value={f.furnishing} onChange={setVal('furnishing')}>{FURNISHING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select>
                </Field>
                <Field label="Bedrooms" required><Input type="number" min={1} max={10} value={f.bedrooms} onChange={num('bedrooms')} /></Field>
                <Field label="Bathrooms" required><Input type="number" min={1} max={10} value={f.bathrooms} onChange={num('bathrooms')} /></Field>
                <Field label="Balconies"><Input type="number" min={0} max={8} value={f.balconies} onChange={num('balconies')} /></Field>
                <Field label="Carpet area (sq.ft)" required><Input type="number" min={100} value={f.floorAreaSqft} onChange={num('floorAreaSqft')} /></Field>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <CheckBox label="Pets allowed" checked={f.petAllowed} onChange={(v) => set({ petAllowed: v })} />
                <CheckBox label="I can offer a shorter lease" checked={false} onChange={() => {}} />
              </div>
            </Panel>
          )}

          {step === 1 && <StepLocation f={f} set={set} />}
          {step === 2 && <StepPhotos f={f} set={set} />}
          {step === 3 && <StepPricing f={f} set={set} />}
          {step === 4 && <StepAmenities f={f} set={set} />}
          {step === 5 && <StepPreview f={f} />}
          {step === 6 && (
            <StepPublish
              f={f}
              submitting={submitting}
              onSubmit={async () => {
                setSubmitting(true); setErr('');
                try {
                  const res = await api.post('/properties', {
                    ...f,
                    lat: f.lat ? Number(f.lat) : null,
                    lng: f.lng ? Number(f.lng) : null,
                    imageUrls: f.imageUrls,
                    amenityIds: f.amenityIds.map(Number),
                    availableFrom: f.availableFrom || null,
                  });
                  localStorage.removeItem(DRAFT_KEY);
                  setDoneId(res.card.id);
                } catch (e) { setErr(e.message); setSubmitting(false); }
              }}
            />
          )}

          <div className="mt-10 flex items-center justify-between border-t border-black/[0.08] pt-6">
            <Button variant="ghost" onClick={() => (step === 0 ? nav(-1) : setStep(step - 1))} icon={<ArrowLeft size={16} />}>
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>
            {step < 6 && (
              <Button variant="solid" onClick={next} icon={<ArrowRight size={16} />} className="flex-row-reverse gap-2">
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------- helper sub-components ------- */

function Panel({ title, sub, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h2 className="text-xl font-bold tracking-[-0.01em] text-ink">{title}</h2>
      <p className="mt-1 text-[13.5px] text-stone">{sub}</p>
      <div className="mt-7">{children}</div>
    </motion.div>
  );
}

function StepLocation({ f, set }) {
  const [places, setPlaces] = useState([]);
  useEffect(() => { api.get('/locations').then(setPlaces).catch(() => {}); }, []);
  return (
    <Panel title="Where is the home?" sub="Pick the neighbourhood and we'll drop a pin at its centre — adjust if needed.">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Neighbourhood" required>
          <Select value={f.locationSlug} onChange={(v) => { set({ locationSlug: v, lat: '', lng: '' }); }}>
            {places.map((p) => <option key={p.slug} value={p.slug}>{p.name} · {p.region}</option>)}
          </Select>
        </Field>
        <Field label="Street / landmark" required>
          <Input value={f.address} onChange={(e) => set({ address: e.target.value })} placeholder="e.g. 12th Main, near the temple" />
        </Field>
        <Field label="Latitude" hint="optional">
          <Input type="number" step="any" value={f.lat} onChange={(e) => set({ lat: e.target.value })} placeholder="auto" />
        </Field>
        <Field label="Longitude" hint="optional">
          <Input type="number" step="any" value={f.lng} onChange={(e) => set({ lng: e.target.value })} placeholder="auto" />
        </Field>
      </div>
      <div className="mt-5 rounded-[4px] bg-sand p-4 text-[13px] leading-relaxed text-stone">
        <b className="text-ink">Good to know:</b> homes without an accurate pin get fewer views. Leave the fields blank
        and we'll use the neighbourhood centre — you can fine-tune after publishing.
      </div>
    </Panel>
  );
}

function StepPhotos({ f, set }) {
  const [uploading, setUp] = useState(false);
  const [uerr, setUerr] = useState('');
  const [urlIn, setUrlIn] = useState('');

  const addFiles = async (files) => {
    setUp(true); setUerr('');
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 12 * 1024 * 1024) { setUerr('Each photo must be under 12 MB.'); continue; }
      try {
        const res = await api.upload('/uploads/images', file);
        set({ imageUrls: [...f.imageUrls, res.url] });
      } catch (e) { setUerr(e.message); }
    }
    setUp(false);
  };

  return (
    <Panel title="Show the real home" sub="First photo becomes the cover. 3–6 bright, wide-angle photos get the most interest.">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-[4px] border border-dashed border-black/20 bg-sand/60 px-6 py-12 text-center transition-colors hover:border-clay/60 hover:bg-clay-tint/40">
        <UploadCloud className="text-clay" size={30} strokeWidth={1.5} />
        <p className="mt-3 text-sm font-semibold text-ink">{uploading ? 'Uploading…' : 'Click to upload photos'}</p>
        <p className="mt-1 text-[12px] text-stone">JPG, PNG or WebP · up to 12 MB each · {f.imageUrls.length} uploaded</p>
        <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addFiles([...e.target.files])} />
      </label>
      {uerr && <p className="mt-2 text-[13px] text-red-600">{uerr}</p>}

      {f.imageUrls.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {f.imageUrls.map((u, i) => (
            <div key={u + i} className="group relative aspect-[4/3] overflow-hidden rounded-[4px] bg-sand">
              <img src={u} alt="" className="h-full w-full object-cover" />
              {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-paper">Cover</span>}
              <button onClick={() => set({ imageUrls: f.imageUrls.filter((_, x) => x !== i) })} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100" aria-label="Remove"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <Input value={urlIn} onChange={(e) => setUrlIn(e.target.value)} placeholder="…or paste an image URL (already hosted)" />
        <Button variant="outline" onClick={() => { if (urlIn.trim()) { set({ imageUrls: [...f.imageUrls, urlIn.trim()] }); setUrlIn(''); } }}>
          Add
        </Button>
      </div>
    </Panel>
  );
}

function StepPricing({ f, set }) {
  const rent = Number(f.rentPerMonth) || 0;
  return (
    <Panel title="Set honest numbers" sub="Transparent pricing is the #1 reason tenants choose HouseHunt listings.">
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Monthly rent (₹)" required>
          <Input type="number" min={1000} step={1000} value={f.rentPerMonth} onChange={num('rentPerMonth')} placeholder="45000" />
        </Field>
        <Field label="Security deposit (₹)" hint={rent ? `typical: ${inr(Math.round((rent * 2) / 1000) * 1000)}` : ''}>
          <Input type="number" step={1000} value={f.deposit} onChange={num('deposit')} placeholder="Auto-suggest below" />
        </Field>
        <Field label="Maintenance (₹/month)">
          <Input type="number" step={500} value={f.maintenancePerMonth} onChange={num('maintenancePerMonth')} placeholder="0 if included" />
        </Field>
      </div>
      <button type="button" onClick={() => set({ deposit: Math.round((rent * 2) / 1000) * 1000 })} className="mt-3 text-[13px] font-medium text-clay underline-offset-2 hover:underline">
        Apply “2 months of rent” suggestion
      </button>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Available from">
          <Input type="date" value={f.availableFrom} onChange={(e) => set({ availableFrom: e.target.value })} />
        </Field>
        <Field label="Lease term">
          <Select value={f.leaseTerm} onChange={setVal('leaseTerm')}>
            {['6 months', '11 months', '12 months', '24 months', 'Flexible'].map((t) => <option key={t}>{t}</option>)}
          </Select>
        </Field>
      </div>
    </Panel>
  );
}

function StepAmenities({ f, set }) {
  const [all, setAll] = useState([]);
  useEffect(() => { api.get('/amenities').then(setAll).catch(() => {}); }, []);
  const toggle = (id) => set({ amenityIds: f.amenityIds.includes(id) ? f.amenityIds.filter((x) => x !== id) : [...f.amenityIds, id] });
  return (
    <Panel title="What does the home offer?" sub="Tick everything that genuinely applies — the search filters depend on it.">
      {AMENITY_CATEGORIES.map((cat) => {
        const items = all.filter((a) => a.category === cat);
        if (!items.length) return null;
        return (
          <div key={cat} className="mb-7">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wide2 text-stone-light">{AMENITY_CATEGORY_LABEL[cat]}</p>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((a) => (
                <CheckBox key={a.id} label={a.name} checked={f.amenityIds.includes(a.id)} onChange={() => toggle(a.id)} />
              ))}
            </div>
          </div>
        );
      })}
    </Panel>
  );
}

function StepPreview({ f }) {
  const [places, setPlaces] = useState([]);
  useEffect(() => { api.get('/locations').then(setPlaces).catch(() => {}); }, []);
  const typeL = typeLabel(f.type);
  const areaName = places.find((p) => p.slug === f.locationSlug)?.name || (f.locationSlug || '').split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return (
    <Panel title="Preview your listing" sub="This is roughly how tenants will see the card.">
      <div className="overflow-hidden rounded-[4px] border border-black/10 bg-white">
        <div className="relative aspect-[16/9] bg-sand">
          {f.imageUrls[0] ? <img src={f.imageUrls[0]} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-stone-light"><ImageIcon size={30} /></div>}
          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink">{typeL}</div>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="u-serif text-xl text-ink">{f.title || 'Untitled listing'}</h3>
            <p><span className="u-serif text-2xl text-ink">{f.rentPerMonth ? inr(f.rentPerMonth) : '₹—'}</span><span className="text-[12px] text-stone">/mo</span></p>
          </div>
          <p className="mt-1 text-[13px] text-stone">{areaName} · {f.address || 'address'}</p>
          <div className="mt-3 flex gap-4 border-t border-black/[0.06] pt-3 text-[12.5px] text-stone">
            <span>{f.bedrooms} bed</span><span>{f.bathrooms} bath</span><span>{f.floorAreaSqft} sq.ft</span><span>{FURNISHING_OPTIONS.find((o) => o.value === f.furnishing)?.label}</span>
          </div>
          <p className="mt-3 text-[13.5px] leading-relaxed text-coal line-clamp-3">{f.description}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-x-8 gap-y-2 text-[13.5px] sm:grid-cols-2">
        <Stat k="Photos" v={f.imageUrls.length} />
        <Stat k="Amenities" v={f.amenityIds.length} />
        <Stat k="Deposit" v={inr(f.deposit || 0)} />
        <Stat k="Maintenance" v={inr(f.maintenancePerMonth || 0)} />
        <Stat k="Available" v={f.availableFrom || 'Immediately'} />
        <Stat k="Lease" v={f.leaseTerm} />
      </div>
    </Panel>
  );
}

function StepPublish({ f, onSubmit, submitting }) {
  const checks = [
    ['Photos are yours or you have permission to publish them', true],
    ["Rent and deposit shown here match what you'll actually ask", Number(f.rentPerMonth) > 0],
    ['The home is genuinely available (or available soon)', true],
    ["You're ready for the verification call — keep your phone reachable", true],
  ];
  return (
    <Panel title="Almost there" sub="Submit for verification. Our team reviews documents and usually approves within 24 hours.">
      <ul className="space-y-3">
        {checks.map(([label, ok]) => (
          <li key={label} className="flex items-start gap-3 rounded-[4px] bg-sand/70 px-4 py-3.5 text-[14px]">
            <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${ok ? 'bg-moss text-white' : 'bg-clay-soft text-clay-deep'}`}>
              {ok ? <Check size={12} strokeWidth={3} /> : '!'}
            </span>
            <span className={ok ? 'text-coal' : 'text-clay-deep'}>{label}</span>
          </li>
        ))}
      </ul>
      <div className="mt-7 rounded-[4px] border border-black/10 p-5 text-[13.5px] text-stone">
        <b className="text-ink">By publishing you confirm:</b> you hold the right to rent this property, all information is
        accurate, and you agree to HouseHunt's listing policy. Fake listings are removed without refund.
      </div>
      <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[13px] text-stone">You can edit everything after submitting — before <em>and</em> after approval.</div>
        <Button variant="accent" size="lg" onClick={onSubmit} disabled={submitting}>
          {submitting ? 'Submitting for review…' : <><Building2 size={17} /> Publish listing</>}
        </Button>
      </div>
    </Panel>
  );
}

function Stat({ k, v }) {
  return <div className="flex justify-between border-b border-black/[0.06] pb-1.5"><span className="text-stone-light">{k}</span><span className="font-semibold text-ink">{v}</span></div>;
}

function stepErr(step) {
  switch (step) {
    case 0: return 'Please give the listing a title (12+ characters) and a description of at least 80 characters.';
    case 1: return 'Choose a neighbourhood and add a street/landmark.';
    case 2: return 'Add at least one photo — three or more really help.';
    case 3: return 'Set a monthly rent of at least ₹1,000.';
    default: return '';
  }
}

function Gate({ kind }) {
  const { logout } = useAuth();
  const nav = useNavigate();
  // A signed-in tenant cannot reach /register (PublicOnly bounces them home), so switching
  // account types must sign them out first and then open owner registration.
  const switchToOwner = () => { logout(); nav('/register?switch=1'); };

  const ctas = kind === 'tenant'
    ? (
      <Button variant="accent" size="lg" onClick={switchToOwner}>
        <Building2 size={17} /> Create an owner account
      </Button>
    )
    : (
      <>
        <Button to="/register?switch=1" state={{ from: '/list-property' }} variant="paper" size="lg">Create owner account</Button>
        <Button
          to="/login"
          state={{ from: '/list-property' }}
          size="lg"
          variant="paper"
          style={{ background: 'transparent', borderColor: 'rgba(247,244,238,.45)', color: '#f7f4ee' }}
          className="hover:!bg-paper/10 hover:!text-paper"
        >
          I already have one — sign in
        </Button>
      </>
    );
  return (
    <div className="bg-paper pt-[68px]">
      <section className="relative overflow-hidden bg-[#221f18] text-paper">
        <img src={IMG.listBanner} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="relative mx-auto max-w-3xl px-5 py-28 text-center lg:px-8">
          <p className="u-eyebrow mb-4 text-clay-soft">List your property</p>
          <h1 className="u-serif text-[clamp(2.2rem,4.5vw,3.8rem)] leading-tight">
            {kind === 'tenant' ? 'Listings are for owner accounts.' : 'Reach renters actively looking.'}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-paper/65">
            {kind === 'tenant'
              ? 'Your current account is a tenant account. Create a free owner account (same process, two minutes) and this listing studio is all yours.'
              : 'Create a free owner account to publish your property. It takes two minutes — you can list, pause and manage everything from one dashboard.'}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {ctas}
          </div>
          {kind === 'tenant' && (
            <p className="mx-auto mt-4 max-w-md text-[12.5px] leading-relaxed text-paper/45">
              This signs you out of your tenant session first — same email & phone work for the owner account.
            </p>
          )}
          <div className="mt-14 grid gap-4 text-left sm:grid-cols-3">
            {[['₹0', 'to publish'], ['24h', 'average review'], ['Direct', 'tenant enquiries']].map(([a, b]) => (
              <div key={b} className="rounded-[4px] border border-paper/15 p-4">
                <p className="u-serif text-3xl text-clay-soft">{a}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-paper/50">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
