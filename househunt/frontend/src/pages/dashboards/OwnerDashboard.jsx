import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  BarChart3, BedDouble, Building2, CalendarClock, Eye, FileText, Heart, LayoutGrid, MessageSquare,
  Pause, PencilLine, Play, PlusCircle, Settings, Trash2, Users,
} from 'lucide-react';
import { api } from '../../lib/api';
import { DashboardShell, StatCard, DashSection, EmptyRow } from '../../components/dash/Shell';
import ProfileSettings from '../../components/dash/ProfileSettings';
import Messenger from '../../components/dash/Messenger';
import { atWidth } from '../../lib/img';
import { inr, prettyDateTime, statusTone, typeLabel } from '../../lib/format';
import { Badge, Button, Confirm, Spinner, ErrorState, StatusBadge, useModal } from '../../components/ui';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'properties', label: 'Properties', icon: Building2 },
  { key: 'applications', label: 'Applications', icon: FileText },
  { key: 'visits', label: 'Viewing requests', icon: CalendarClock },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
  { key: 'profile', label: 'Profile & settings', icon: Settings },
];

const KEYS = ['overview', 'properties', 'applications', 'visits', 'analytics', 'messages', 'profile'];
function keyFromPath(pathname) {
  const seg = pathname.split('/')[2];
  return KEYS.includes(seg) ? seg : 'overview';
}
export default function OwnerDashboard() {
  const { pathname } = useLocation();
  const [tab, setTab] = useState(() => keyFromPath(pathname));
  useEffect(() => { const k = keyFromPath(pathname); setTab((t) => (t === k ? t : k)); }, [pathname]);
  const [data, setData] = useState(null);
  const [lists, setLists] = useState({});
  const [err, setErr] = useState('');
  const { open } = useModal();

  const loadTab = useCallback(async (key) => {
    if (key === 'overview') {
      if (!data) { try { setData(await api.get('/dashboards/owner')); } catch (e) { setErr(e.message); } }
      return;
    }
    const urls = { properties: '/owner/properties', applications: '/owner/applications', visits: '/owner/visits', analytics: '/owner/analytics' };
    const url = urls[key];
    if (!url || lists[key]) return;
    setLists((s) => ({ ...s, [key]: { loading: true } }));
    try { const items = await api.get(url); setLists((s) => ({ ...s, [key]: { items, loading: false } })); }
    catch (e) { setLists((s) => ({ ...s, [key]: { error: e.message, loading: false } })); }
  }, [data, lists]);

  useEffect(() => { loadTab(tab); }, [tab, loadTab]);

  const resetTab = (k) => { setLists((s) => ({ ...s, [k]: undefined })); setData(null); loadTab(k); };

  const closeConfirm = () => {};

  const act = async (url) => {
    try { await api.put(url); } catch { /* silent */ }
  };

  const reloadProps = () => resetTab('properties');
  const reloadApps = () => resetTab('applications');
  const reloadVisits = () => resetTab('visits');

  return (
    <DashboardShell
      roleLabel="Owner dashboard"
      items={TABS.map((t) => ({ ...t, badge: t.key === 'messages' ? (data?.unreadMessages || 0) : 0 }))}
      active={tab}
      onNav={setTab}
      accent="Portfolio"
      action={<Link to="/list-property" className="inline-flex items-center gap-2 rounded-[3px] bg-clay px-4 py-2.5 text-[12.5px] font-semibold text-white"><PlusCircle size={15} /> Add property</Link>}
    >
      {err ? <ErrorState message={err} onRetry={() => { setData(null); setErr(''); loadTab('overview'); }} />
        : tab === 'overview' && data ? <OwnerOverview data={data} go={setTab} />
        : tab === 'overview' ? <Loading />
        : tab === 'properties' && lists.properties ? <PropertiesList list={lists.properties} go={setTab} onChanged={reloadProps} act={act} />
        : tab === 'applications' && lists.applications ? <ApplicationsList list={lists.applications} onChanged={reloadApps} />
        : tab === 'visits' && lists.visits ? <VisitsList list={lists.visits} onChanged={reloadVisits} />
        : tab === 'analytics' && lists.analytics ? <AnalyticsView data={lists.analytics.items} />
        : tab === 'messages' ? <Messenger />
        : tab === 'profile' ? <ProfileSettings />
        : <Loading />}
    </DashboardShell>
  );
}

function Loading() {
  return <div className="grid min-h-[300px] place-items-center"><Spinner className="h-6 w-6 text-clay" /></div>;
}

/* --------------------------------------------------------------- overview */
function OwnerOverview({ data, go }) {
  const active = data.properties.filter((p) => p.status === 'APPROVED');
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8">
        <h1 className="u-serif text-3xl text-ink">Your portfolio</h1>
        <p className="mt-1 text-[14px] text-stone">{active.length} live listing{active.length === 1 ? '' : 's'} · {data.properties.length} total</p>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Total properties" value={data.totalProperties} icon={Building2} tone="bg-sand text-stone" />
        <StatCard label="Active listings" value={data.activeListings} icon={BedDouble} tone="bg-moss/10 text-moss" />
        <StatCard label="Total views" value={data.totalViews.toLocaleString('en-IN')} icon={Eye} tone="bg-clay-tint text-clay" />
        <StatCard label="Enquiries" value={data.enquiries + data.viewingRequests} icon={Users} tone="bg-sand text-stone" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DashSection title="Enquiries to answer" sub="Applications and viewing requests that need your attention" action={<button onClick={() => go('applications')} className="text-[12.5px] font-semibold text-clay">view all →</button>}>
          {data.recentApplications.length === 0 && data.upcomingVisits.length === 0 ? (
            <EmptyRow><p className="max-w-xs text-[14px] text-stone">Nothing waiting — new leads appear here as tenants apply.</p></EmptyRow>
          ) : (
            <div className="space-y-2.5">
              {data.recentApplications.map((a) => (
                <div key={'a' + a.id} className="flex items-center gap-3 rounded-[5px] border border-black/10 bg-white p-3.5">
                  <img src={atWidth(a.coverImage, 200)} className="h-12 w-16 rounded-[3px] object-cover" alt="" />
                  <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold text-ink">{a.applicantName} → {a.propertyTitle}</p><p className="text-[11.5px] text-stone">{inr(a.rentPerMonth)}/mo · {a.moveInDate || 'ASAP'}</p></div>
                  <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                </div>
              ))}
              {data.upcomingVisits.map((v) => (
                <div key={'v' + v.id} className="flex items-center gap-3 rounded-[5px] border border-black/10 bg-white p-3.5">
                  <img src={atWidth(v.coverImage, 200)} className="h-12 w-16 rounded-[3px] object-cover" alt="" />
                  <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold text-ink">Visit · {v.propertyTitle}</p><p className="text-[11.5px] text-stone">{prettyDateTime(v.scheduledAt)}</p></div>
                  <Badge tone={statusTone(v.status)}>{v.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </DashSection>

        <DashSection title="Live properties" action={<button onClick={() => go('properties')} className="text-[12.5px] font-semibold text-clay">manage →</button>}>
          <div className="space-y-2.5">
            {active.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-[5px] border border-black/10 bg-white p-3.5">
                <img src={atWidth(p.coverImage, 200)} className="h-12 w-16 rounded-[3px] object-cover" alt="" />
                <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold text-ink">{p.title}</p><p className="text-[11.5px] text-stone">{p.locationName} · {inr(p.rentPerMonth)}/mo</p></div>
                <div className="text-right text-[11px] text-stone"><p>{p.views} views</p><p>{p.bedrooms} bd</p></div>
              </div>
            ))}
          </div>
        </DashSection>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------ properties */
function PropertiesList({ list, onChanged, act }) {
  if (list.error) return <ErrorState message={list.error} onRetry={onChanged} />;
  const { open } = useModal();
  const props = list.items || [];
  const [busyId, setBusy] = useState('');
  const run = async (fn) => { try { await fn(); } finally { onChanged(); } };

  const toggleStatus = async (p) => {
    setBusy(p.id);
    await act(p.status === 'APPROVED' ? `/owner/properties/${p.id}/pause` : `/owner/properties/${p.id}/publish`);
    setBusy('');
    onChanged();
  };

  const del = (p) => {
    open({ id: 'del' + p.id, size: 'sm', content: (
      <Confirm
        id={'del' + p.id}
        danger
        title="Delete this listing?"
        body={`“${p.title}” and all of its enquiries will be permanently removed. This can't be undone.`}
        yesLabel="Delete listing"
        onYes={async () => { try { await api.del(`/properties/${p.id}`); } catch {} onChanged(); }}
      />
    ) });
  };

  return (
    <div>
      <DashSection title="Your listings" sub={`${props.length} properties in total — pending ones need review before going live`} />
      <div className="mt-2 overflow-x-auto rounded-[6px] border border-black/10 bg-white">
        <table className="w-full min-w-[860px] text-left text-[13px]">
          <thead className="border-b border-black/[0.07] text-[10.5px] uppercase tracking-wider text-stone-light">
            <tr>
              <th className="px-5 py-3.5">Listing</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5">Rent</th>
              <th className="px-4 py-3.5">Views</th><th className="px-4 py-3.5">Type</th><th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05]">
            {props.map((p) => (
              <tr key={p.id} className="hover:bg-paper/60">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <img src={atWidth(p.coverImage, 160)} className="h-12 w-16 rounded-[3px] object-cover" alt="" />
                    <div className="min-w-0">
                      <Link to={`/properties/${p.id}`} className="line-clamp-1 font-semibold text-ink hover:underline">{p.title}</Link>
                      <p className="text-[11.5px] text-stone">{p.locationName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3.5 font-semibold text-ink">{inr(p.rentPerMonth)}</td>
                <td className="px-4 py-3.5 text-stone">{p.views}</td>
                <td className="px-4 py-3.5 text-stone">{typeLabel(p.type)}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <IconAct title={p.status === 'APPROVED' ? 'Pause listing' : 'Submit for review'} onClick={() => run(() => toggleStatus(p))} busy={busyId === p.id}>
                      {p.status === 'APPROVED' ? <Pause size={14} /> : <Play size={14} />}
                    </IconAct>
                    <IconAct title="View on site" onClick={() => undefined}><Link to={`/properties/${p.id}`}><Building2 size={14} /></Link></IconAct>
                    <IconAct title="Delete" danger onClick={() => del(p)}><Trash2 size={14} /></IconAct>
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

const IconAct = ({ children, title, onClick, danger, busy }) => (
  <button title={title} onClick={onClick} disabled={busy} className={`grid h-8 w-8 place-items-center rounded-[4px] border border-black/10 transition-colors ${danger ? 'text-red-700 hover:bg-red-50' : 'text-stone hover:border-ink hover:text-ink'}`}>
    {children}
  </button>
);

/* ------------------------------------------------------- applications/visits */
function ApplicationsList({ list, onChanged }) {
  const [busy, setBusy] = useState('');
  const items = list.items || [];
  const set = async (a, s) => {
    setBusy(a.id + s);
    try { await api.put(`/owner/applications/${a.id}?status=${s}`); } catch {}
    setBusy(''); onChanged();
  };
  return (
    <div className="space-y-3">
      {items.length === 0 && <EmptyRow><p className="text-[15px] text-stone">No applications yet.</p></EmptyRow>}
      {items.map((a) => (
        <div key={a.id} className="flex flex-wrap items-center gap-4 rounded-[6px] border border-black/10 bg-white p-4">
          <img src={atWidth(a.coverImage, 240)} className="h-20 w-28 rounded-[4px] object-cover" alt="" />
          <div className="min-w-[220px] flex-1">
            <div className="flex items-center gap-2"><p className="font-semibold text-ink">{a.applicantName}</p><Badge tone="neutral">{a.applicantId ? 'Tenant' : ''}</Badge></div>
            <p className="mt-0.5 text-[12px] text-stone">{a.propertyTitle} · {a.locationName} · {inr(a.rentPerMonth)}/mo</p>
            <p className="mt-0.5 text-[12px] text-stone">📞 {a.applicantPhone} · ✉️ {a.applicantEmail}</p>
            {a.message && <p className="mt-1.5 line-clamp-2 max-w-2xl rounded bg-sand/70 px-3 py-2 text-[12.5px] text-coal">“{a.message}”</p>}
            {a.moveInDate && <p className="mt-1 text-[11.5px] text-stone">Move-in: {new Date(a.moveInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={statusTone(a.status)}>{a.status}</Badge>
            {a.status === 'PENDING' && (
              <>
                <Button size="sm" variant="outline" onClick={() => set(a, 'SHORTLISTED')} disabled={!!busy}>Shortlist</Button>
                <Button size="sm" variant="solid" onClick={() => set(a, 'APPROVED')} disabled={!!busy}>Approve</Button>
                <Button size="sm" variant="outline" className="text-red-700" onClick={() => set(a, 'REJECTED')} disabled={!!busy}>Reject</Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function VisitsList({ list, onChanged }) {
  const items = list.items || [];
  const set = async (v, s) => {
    try { await api.put(`/owner/visits/${v.id}?status=${s}`); } catch {}
    onChanged();
  };
  return (
    <div className="space-y-3">
      {items.length === 0 && <EmptyRow><p className="text-[15px] text-stone">No viewing requests yet.</p></EmptyRow>}
      {items.map((v) => (
        <div key={v.id} className="flex flex-wrap items-center gap-4 rounded-[6px] border border-black/10 bg-white p-4">
          <img src={atWidth(v.coverImage, 240)} className="h-16 w-24 rounded-[4px] object-cover" alt="" />
          <div className="min-w-[200px] flex-1">
            <p className="font-semibold text-ink">{v.propertyTitle}</p>
            <p className="mt-0.5 text-[12.5px] text-stone">{prettyDateTime(v.scheduledAt)} · {v.mode === 'VIDEO_CALL' ? 'Video call' : 'In person'}</p>
            {v.note && <p className="mt-1 text-[12px] italic text-stone-light">“{v.note}”</p>}
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={statusTone(v.status)}>{v.status}</Badge>
            {v.status === 'REQUESTED' && (
              <>
                <Button size="sm" variant="solid" onClick={() => set(v, 'CONFIRMED')}>Confirm</Button>
                <Button size="sm" variant="outline" className="text-red-700" onClick={() => set(v, 'CANCELLED')}>Decline</Button>
              </>
            )}
            {v.status === 'CONFIRMED' && <Button size="sm" variant="outline" onClick={() => set(v, 'COMPLETED')}>Mark completed</Button>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------- analytics */
function AnalyticsView({ data }) {
  if (!data) return <Loading />;
  const series = data.months.map((m, i) => ({ month: m, Applications: data.applications[i], 'Visit requests': data.visits[i] }));
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Total views (all time)" value={data.totalViews.toLocaleString('en-IN')} icon={Eye} tone="bg-clay-tint text-clay" />
        <StatCard label="Most viewed listing" value={<span className="u-serif text-[19px]">{data.topListingTitle.length > 18 ? data.topListingTitle.slice(0, 18) + '…' : data.topListingTitle}</span>} hint={`${data.topListingViews.toLocaleString('en-IN')} views`} icon={Building2} tone="bg-sand text-stone" />
        <StatCard label="Times favourites" value={data.totalFavorites.toLocaleString('en-IN')} icon={Heart} tone="bg-clay-tint text-clay" />
        <StatCard label="Last 6 months demand" value={data.applications.reduce((a, b) => a + b, 0) + data.visits.reduce((a, b) => a + b, 0)} icon={Users} tone="bg-moss/10 text-moss" />
      </div>

      <DashSection className="mt-8" title="Applications & visit requests" sub="Last six months, by month">
        <div className="h-[300px] rounded-[6px] border border-black/10 bg-white p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="gApp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b0562f" stopOpacity={0.25} /><stop offset="100%" stopColor="#b0562f" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(27,26,22,0.08)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6e6a5f' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#a39e91' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 4, border: '1px solid rgba(27,26,22,.12)', fontSize: 13 }} />
              <Area type="monotone" dataKey="Applications" stroke="#b0562f" strokeWidth={2} fill="url(#gApp)" />
              <Area type="monotone" dataKey="Visit requests" stroke="#5c6644" strokeWidth={2} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DashSection>
    </div>
  );
}
