import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BadgeCheck, Ban, Building2, CheckCircle2, ClipboardCheck, Eye, Flag, LayoutGrid, RotateCcw,
  Search, Settings, ShieldAlert, Star, Trash2, Users as UsersIcon, XCircle,
} from 'lucide-react';
import { api } from '../../lib/api';
import { DashboardShell, StatCard, DashSection, EmptyRow } from '../../components/dash/Shell';
import { atWidth } from '../../lib/img';
import { inr, shortDate, statusTone, typeLabel } from '../../lib/format';
import { Badge, Button, Confirm, ErrorState, Input, Select, Spinner, StatusBadge, useModal } from '../../components/ui';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'listings', label: 'Listings', icon: Building2 },
  { key: 'moderation', label: 'Verification', icon: ClipboardCheck },
  { key: 'users', label: 'Users', icon: UsersIcon },
  { key: 'reports', label: 'Reports & reviews', icon: Flag },
  { key: 'settings', label: 'Platform settings', icon: Settings },
];

const KEYS = ['overview', 'listings', 'moderation', 'users', 'reports', 'settings'];
function keyFromPath(pathname) {
  const seg = pathname.split('/')[2];
  return KEYS.includes(seg) ? seg : 'overview';
}
export default function AdminDashboard() {
  const { pathname } = useLocation();
  const [tab, setTab] = useState(() => keyFromPath(pathname));
  useEffect(() => { const k = keyFromPath(pathname); setTab((t) => (t === k ? t : k)); }, [pathname]);
  const [overview, setOverview] = useState(null);
  const [cache, setCache] = useState({});
  const [err, setErr] = useState('');

  useEffect(() => {
    if (tab === 'overview' && !overview) api.get('/admin/overview').then(setOverview).catch((e) => setErr(e.message));
    if (tab === 'overview') return;
    if (cache[tab]) return;
    let url;
    if (tab === 'listings') url = '/admin/properties?page=0&size=30';
    if (tab === 'moderation') url = '/admin/moderation';
    if (tab === 'users') url = '/admin/users';
    if (tab === 'reports') url = '/admin/reports/locations';
    if (!url) return;
    setCache((c) => ({ ...c, [tab]: 'loading' }));
    api.get(url).then((d) => setCache((c) => ({ ...c, [tab]: d }))).catch((e) => setCache((c) => ({ ...c, [tab]: { err: e.message } })));
  }, [tab, cache, overview]);

  const refresh = () => {
    setOverview(null);
    setCache({});
    setErr('');
  };

  return (
    <DashboardShell
      roleLabel="Admin dashboard"
      items={TABS.map((t) => ({ ...t, badge: t.key === 'moderation' && overview ? overview.pendingListings + overview.suspendedListings : 0 }))}
      active={tab}
      onNav={setTab}
      accent="Platform"
    >
      {err && !overview ? <ErrorState message={err} onRetry={refresh} />
        : tab === 'overview' && overview ? <AdminOverview o={overview} go={setTab} />
        : tab === 'overview' ? <Loading />
        : tab === 'listings' ? <Listings cache={cache.listings} refresh={refresh} />
        : tab === 'moderation' ? <Moderation cache={cache.moderation} refresh={refresh} />
        : tab === 'users' ? <Users cache={cache.users} refresh={refresh} />
        : tab === 'reports' ? <Reports cache={cache.reports} refresh={refresh} />
        : <SettingsPane />}
    </DashboardShell>
  );
}

function Loading() {
  return <div className="grid min-h-[300px] place-items-center"><Spinner className="h-6 w-6 text-clay" /></div>;
}

function AdminOverview({ o, go }) {
  const stats = [
    ['Total users', o.totalUsers], ['Tenants', o.totalTenants], ['Owners', o.totalOwners],
    ['Active listings', o.activeListings], ['Pending review', o.pendingListings, 'warn'], ['Suspended', o.suspendedListings, 'warn'],
    ['Rejected', o.rejectedListings], ['Total views', o.totalViews], ['Applications', o.totalApplications],
    ['Visits', o.totalVisits], ['Reviews', o.totalReviews], ['Reports open', o.unreadReports],
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="u-serif text-3xl text-ink">Platform at a glance</h1>
          <p className="mt-1 text-[14px] text-stone">Real-time counts across HouseHunt.</p>
        </div>
        <div className="flex items-center gap-3 rounded-[4px] border border-amber-300/40 bg-amber-50 px-4 py-2.5 text-[13px] font-semibold text-amber-800">
          <ShieldAlert size={16} />
          {o.pendingListings} listings waiting for verification
          <button onClick={() => go('moderation')} className="underline">Review</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {stats.slice(0, 8).map(([label, value, tone]) => (
          <div key={label} className="bg-white p-5" style={{ border: `1px solid ${tone === 'warn' ? 'rgba(180,83,9,.3)' : 'rgba(27,26,22,.09)'}`, borderRadius: 5 }}>
            <p className="text-[10.5px] font-bold uppercase tracking-wide2 text-stone-light">{label}</p>
            <p className="u-serif mt-1.5 text-2xl text-ink">{Number(value).toLocaleString('en-IN')}</p>
          </div>
        ))}
        {stats.slice(8).map(([label, value]) => (
          <div key={label} className="bg-sand/70 p-5" style={{ border: '1px solid rgba(27,26,22,.09)', borderRadius: 5 }}>
            <p className="text-[10.5px] font-bold uppercase tracking-wide2 text-stone-light">{label}</p>
            <p className="u-serif mt-1.5 text-2xl text-ink">{Number(value).toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[
          ['Verify new listings', 'Documents and photos need checking before they go live.', go, 'moderation', ClipboardCheck],
          ['Monitor users', 'Suspicious or abusive accounts can be suspended at any time.', go, 'users', UsersIcon],
          ['Publish health', 'Neighbourhood-level activity drives the homepage.', go, 'reports', Building2],
        ].map(([t, b, fn, k, I]) => (
          <button key={k} onClick={() => fn(k)} className="group rounded-[6px] border border-black/10 bg-white p-6 text-left transition-all hover:border-ink hover:shadow-soft">
            <I size={20} strokeWidth={1.6} className="text-clay" />
            <p className="mt-4 font-bold text-ink">{t}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-stone">{b}</p>
            <p className="mt-4 text-[13px] font-semibold text-clay opacity-0 transition-opacity group-hover:opacity-100">Open →</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ------- listings ------- */
function Listings({ cache, refresh }) {
  const [status, setStatus] = useState('PENDING');
  const { open } = useModal();
  const [pageData, setPage] = useState(cache);
  useEffect(() => {
    if (cache !== 'loading' && !(cache?.err)) setPage(cache);
  }, [cache]);

  const load = async (st) => {
    setStatus(st);
    const d = await api.get(`/admin/properties?page=0&size=40&status=${st}`).catch(() => null);
    if (d) setPage(d);
  };

  const act = async (url) => {
    try { await api.put(url); } catch {}
    load(status);
  };

  const setStatusOf = (p, s, reason, tone) => {
    open({ id: 'st' + p.id + s, size: 'sm', content: (
      <Confirm
        id={'st' + p.id + s}
        title={tone === 'ok' ? 'Approve this listing?' : s === 'REJECTED' ? 'Reject this listing?' : 'Suspend this listing?'}
        body={`“${p.title}” will be marked ${s}. ${s === 'APPROVED' ? 'It will go live immediately and notify the owner.' : s === 'SUSPENDED' ? 'It will be hidden from public search.' : 'The owner can edit and resubmit it later.'}`}
        yesLabel={s === 'APPROVED' ? 'Approve & publish' : s === 'REJECTED' ? 'Reject' : 'Suspend'}
        danger={s !== 'APPROVED'}
        onYes={() => act(`/admin/properties/${p.id}/status?status=${s}`)}
      />
    ) });
  };

  const del = (p) => {
    open({ id: 'adel' + p.id, size: 'sm', content: (
      <Confirm id={'adel' + p.id} danger title="Delete listing permanently?" body={`“${p.title}” and all related data will be removed.`} yesLabel="Delete listing"
        onYes={async () => { try { await api.del(`/admin/properties/${p.id}`); } catch {} load(status); }} />
    ) });
  };

  const list = (pageData && pageData.content) || [];
  const loading = cache === 'loading' || !pageData;
  const stale = cache && cache.content && cache.content.length !== list.length;

  return (
    <div>
      <DashSection title="All listings" sub="Approve, suspend, reject or remove any property on the platform" />
      <div className="mb-4 flex flex-wrap gap-2">
        {['PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED'].map((s) => (
          <button key={s} onClick={() => load(s)} className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${status === s ? 'border-ink bg-ink text-paper' : 'border-black/15 hover:border-ink'}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-[6px] border border-black/10 bg-white">
        <table className="w-full min-w-[980px] text-left text-[13px]">
          <thead className="border-b border-black/[0.07] text-[10.5px] uppercase tracking-wider text-stone-light">
            <tr><th className="px-5 py-3.5">Listing</th><th className="px-4 py-3.5">Location</th><th className="px-4 py-3.5">Rent</th><th className="px-4 py-3.5">Views</th><th className="px-4 py-3.5">Listed</th><th className="px-4 py-3.5 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05]">
            {loading && <tr><td colSpan={6} className="px-5 py-10 text-center text-stone">Loading listings…</td></tr>}
            {!loading && list.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-stone">No {status} listings.</td></tr>}
            {!loading && list.map((p) => (
              <tr key={p.id} className="hover:bg-paper/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img src={atWidth(p.coverImage, 140)} className="h-11 w-16 rounded-[3px] object-cover" alt="" />
                    <div className="min-w-0"><p className="line-clamp-1 font-semibold text-ink">{p.title}</p><p className="text-[11px] text-stone">{p.locationName} · {typeLabel(p.type)} · {p.bedrooms} bd</p></div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[12.5px] text-stone">{p.locationName}{p.address && p.address !== p.locationName ? ' · ' + p.address : ''}</td>
                <td className="px-4 py-3 font-semibold text-ink">{inr(p.rentPerMonth)}</td>
                <td className="px-4 py-3 text-stone">{p.views}</td>
                <td className="px-4 py-3 text-[12px] text-stone">{shortDate(p.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    {p.status === 'PENDING' && <>
                      <IconBtn2 title="Approve" good onClick={() => setStatusOf(p, 'APPROVED', '', 'ok')}><BadgeCheck size={15} /></IconBtn2>
                      <IconBtn2 title="Reject" bad onClick={() => setStatusOf(p, 'REJECTED', '', 'bad')}><XCircle size={15} /></IconBtn2>
                    </>}
                    {p.status === 'APPROVED' && <>
                      <IconBtn2 title="Feature on homepage" onClick={() => act(`/admin/properties/${p.id}/feature?featured=${!p.featured}`)}><Star size={15} className={p.featured ? 'fill-clay text-clay' : ''} /></IconBtn2>
                      <IconBtn2 title="Suspend" bad onClick={() => setStatusOf(p, 'SUSPENDED', '', 'bad')}><Ban size={15} /></IconBtn2>
                    </>}
                    {p.status === 'SUSPENDED' && <IconBtn2 title="Re-approve" good onClick={() => setStatusOf(p, 'APPROVED', '', 'ok')}><RotateCcw size={15} /></IconBtn2>}
                    <IconBtn2 title="Delete" bad onClick={() => del(p)}><Trash2 size={15} /></IconBtn2>
                    <a href={`/properties/${p.id}`} target="_blank" rel="noreferrer" className="grid h-8 w-8 place-items-center rounded-[4px] border border-black/10 text-stone hover:text-ink"><Eye size={14} /></a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const IconBtn2 = ({ children, title, good, bad, onClick }) => (
  <button title={title} onClick={onClick} className={`grid h-8 w-8 place-items-center rounded-[4px] border border-black/10 transition-colors ${good ? 'text-moss hover:border-moss hover:bg-moss/5' : bad ? 'text-red-700 hover:border-red-400 hover:bg-red-50' : 'text-stone hover:border-ink hover:text-ink'}`}>
    {children}
  </button>
);

/* -------- moderation queue -------- */
function Moderation({ cache, refresh }) {
  const { open } = useModal();
  const list = (cache && cache.content) || cache || [];
  const loading = cache === 'loading';
  const act = async (id, s) => {
    try { await api.put(`/admin/properties/${id}/status?status=${s}`); } catch {}
    refresh();
  };
  return (
    <div>
      <DashSection title="Verification queue" sub="New and resumed listings submitted by owners, waiting for your sign-off" />
      {loading ? <Loading /> : list.length === 0 ? <EmptyRow><p className="text-[15px] text-stone">Queue is clear — nice work.</p></EmptyRow> : (
        <div className="space-y-3">
          {list.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-[6px] border border-black/10 bg-white p-4">
              <img src={atWidth(p.coverImage, 240)} className="h-20 w-28 rounded-[4px] object-cover" alt="" />
              <div className="min-w-[220px] flex-1">
                <p className="font-semibold text-ink">{p.title}</p>
                <p className="mt-0.5 text-[12px] text-stone">{p.locationName} · {typeLabel(p.type)} · {p.bedrooms} bd · {inr(p.rentPerMonth)}/mo</p>
                <p className="mt-0.5 text-[11.5px] text-stone">Submitted {shortDate(p.createdAt)} · {p.verified ? 'pre-verified' : 'documents pending'}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={p.status} />
                <Button size="sm" variant="solid" onClick={() => act(p.id, 'APPROVED')}><CheckCircle2 size={14} /> Approve</Button>
                <Button size="sm" variant="outline" className="text-red-700" onClick={() => open({ id: 'r' + p.id, size: 'sm', content: (
                  <Confirm id={'r' + p.id} danger title="Reject this listing?" body={`“${p.title}” will be rejected and the owner can edit & resubmit.`} yesLabel="Reject" onYes={() => act(p.id, 'REJECTED')} />
                ) })}>Reject</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------- users ------- */
function Users({ cache, refresh }) {
  const [role, setRole] = useState('');
  const [q, setQ] = useState('');
  const [local, setLocal] = useState(null);
  useEffect(() => { if (cache !== 'loading' && cache) setLocal(cache); }, [cache]);
  const { open } = useModal();

  const load = async () => {
    const params = {};
    if (role) params.role = role;
    if (q) params.q = q;
    const d = await api.get('/admin/users', params).catch(() => null);
    if (d) setLocal(d);
  };

  const toggleActive = async (u) => {
    try { await api.put(`/admin/users/${u.id}/active?active=${!u.active}`); } catch {}
    load();
  };

  const del = (u) => {
    open({ id: 'ud' + u.id, size: 'sm', content: (
      <Confirm id={'ud' + u.id} danger title={`Delete ${u.fullName}?`} body="The account, its listings and messages will be removed permanently." yesLabel="Delete account"
        onYes={async () => { try { await api.del(`/admin/users/${u.id}`); } catch {} load(); }} />
    ) });
  };

  const users = (local && local.content) || [];

  return (
    <div>
      <DashSection title="User management" sub={`${local?.total ?? ''} registered users — tenants ${local?.tenants ?? ''}, owners ${local?.owners ?? ''}`} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-light" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…" className="pl-9" onKeyDown={(e) => e.key === 'Enter' && load()} />
        </div>
        <Select value={role} onChange={(v) => { setRole(v); setTimeout(load, 0); }} className="w-40" placeholder="All roles">
          <option value="TENANT">Tenants</option>
          <option value="OWNER">Owners</option>
          <option value="ADMIN">Admins</option>
        </Select>
        <Button variant="outline" size="sm" onClick={load}>Apply</Button>
      </div>
      <div className="overflow-x-auto rounded-[6px] border border-black/10 bg-white">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead className="border-b border-black/[0.07] text-[10.5px] uppercase tracking-wider text-stone-light">
            <tr><th className="px-5 py-3.5">User</th><th className="px-4 py-3.5">Role</th><th className="px-4 py-3.5">Contact</th><th className="px-4 py-3.5">Properties</th><th className="px-4 py-3.5">Joined</th><th className="px-4 py-3.5">State</th><th className="px-4 py-3.5 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05]">
            {users.map((u) => (
              <tr key={u.id} className={`hover:bg-paper/60 ${u.active ? '' : 'opacity-55'}`}>
                <td className="px-5 py-3">
                  <p className="font-semibold text-ink">{u.fullName} {u.verified && <Badge tone="ok">✓</Badge>}</p>
                  <p className="text-[11.5px] text-stone">{u.email}</p>
                </td>
                <td className="px-4 py-3"><Badge>{u.role}</Badge></td>
                <td className="px-4 py-3 text-stone">{u.phone}</td>
                <td className="px-4 py-3 text-stone">{u.propertyCount}</td>
                <td className="px-4 py-3 text-[12px] text-stone">{shortDate(u.createdAt)}</td>
                <td className="px-4 py-3"><StatusBadge status={u.active ? 'APPROVED' : 'SUSPENDED'} /></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Button size="sm" variant={u.active ? 'outline' : 'solid'} onClick={() => toggleActive(u)}>
                      {u.active ? 'Suspend' : 'Restore'}
                    </Button>
                    {u.role !== 'ADMIN' && <IconBtn2 bad title="Delete" onClick={() => del(u)}><Trash2 size={14} /></IconBtn2>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------- reports ------- */
function Reports({ cache, refresh }) {
  const [reviews, setReviews] = useState(null);
  useEffect(() => { api.get('/admin/reviews/pending').then(setReviews).catch(() => setReviews([])); }, []);
  const { open } = useModal();
  if (cache === 'loading') return <Loading />;
  if (cache && cache.err) return <ErrorState message={cache.err} onRetry={refresh} />;
  const moderate = async (id, approve) => {
    try { await api.put(`/admin/reviews/${id}/moderate?approve=${approve}`); } catch {}
    setReviews((s) => (s || []).filter((r) => r.id !== id));
  };
  const rows = (cache && cache.content) || cache || [];
  return (
    <div>
      <DashSection title="Marketplace report" sub="Live listings by neighbourhood and rent guidance" />
      <div className="overflow-x-auto rounded-[6px] border border-black/10 bg-white">
        <table className="w-full min-w-[560px] text-left text-[13px]">
          <thead className="border-b border-black/[0.07] text-[10.5px] uppercase tracking-wider text-stone-light">
            <tr><th className="px-5 py-3.5">Neighbourhood</th><th className="px-4 py-3.5">Active listings</th><th className="px-4 py-3.5">Typical 2BHK rent</th></tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05]">
            {rows.map((r) => (
              <tr key={r.name} className="hover:bg-paper/60">
                <td className="px-5 py-3 font-semibold text-ink">{r.name}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-sand px-2.5 py-1 text-[12px] font-semibold text-stone">{r.activeListings}</span></td>
                <td className="px-4 py-3 text-stone">{inr(r.avgRentMin)} – {inr(r.avgRentMax)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DashSection className="mt-10" title="Reviews awaiting moderation" sub="Approve reviews from verified visitors, or hide ones that break guidelines">
        <div className="space-y-3">
          {reviews === null ? <Loading /> : reviews.length === 0 ? <EmptyRow><p className="text-[14px] text-stone">No reviews pending.</p></EmptyRow> : reviews.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-4 rounded-[6px] border border-black/10 bg-white p-4">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-clay-tint text-clay"><Star size={16} className="fill-clay" /></span>
              <div className="min-w-[220px] flex-1">
                <p className="text-[13.5px] font-semibold text-ink">{'★'.repeat(r.rating)} <span className="font-normal text-stone">· by {r.authorName}</span></p>
                <p className="mt-0.5 line-clamp-2 text-[13px] text-coal">{r.comment}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="solid" onClick={() => moderate(r.id, true)}>Approve</Button>
                <Button size="sm" variant="outline" className="text-red-700" onClick={() => moderate(r.id, false)}>Hide</Button>
              </div>
            </div>
          ))}
        </div>
      </DashSection>
    </div>
  );
}

function SettingsPane() {
  return (
    <div>
      <DashSection title="Platform settings" sub="Configuration for the demo environment">
        <div className="grid grid-cols-1 gap-4 rounded-[6px] border border-black/10 bg-white p-6 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-ink">Environments</p>
            <p className="text-[12.5px] leading-relaxed text-stone">Development runs on embedded H2 in MySQL mode. For production, flip the <code className="rounded bg-sand px-1.5 py-0.5">mysql</code> profile and point it at MySQL 8 via <code className="rounded bg-sand px-1.5 py-0.5">docker-compose.yml</code>.</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-ink">Roles & permissions</p>
            <p className="text-[12.5px] leading-relaxed text-stone">TENANT, OWNER and ADMIN roles gate dashboards and API routes. Owner submissions enter the PENDING queue; only admins can approve or reject listings. Feature toggles are managed per-listing here.</p>
          </div>
        </div>
      </DashSection>
    </div>
  );
}
