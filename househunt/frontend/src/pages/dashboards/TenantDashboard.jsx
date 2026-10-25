import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarClock, FileText, Heart, Home as HomeIcon, LayoutGrid, MessageSquare, Settings, User, MapPin, Clock, XCircle, ArrowUpRight,
} from 'lucide-react';
import { api } from '../../lib/api';
import { DashboardShell, StatCard, DashSection, EmptyRow } from '../../components/dash/Shell';
import ProfileSettings from '../../components/dash/ProfileSettings';
import Messenger from '../../components/dash/Messenger';
import { PropertyCard } from '../../components/PropertyCard';
import { atWidth } from '../../lib/img';
import { inr, prettyDateTime, statusTone, titleCase, typeLabel } from '../../lib/format';
import { Badge, Button, Spinner, ErrorState } from '../../components/ui';
import { useAuth } from '../../lib/useAuth';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'saved', label: 'Saved homes', icon: Heart },
  { key: 'applications', label: 'Applications', icon: FileText },
  { key: 'visits', label: 'Visits', icon: CalendarClock },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
  { key: 'profile', label: 'Profile & settings', icon: Settings },
];

const KEYS = ['overview', 'saved', 'applications', 'visits', 'messages', 'profile'];
function keyFromPath(pathname) {
  const seg = pathname.split('/')[2];
  return KEYS.includes(seg) ? seg : 'overview';
}
export default function TenantDashboard() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [tab, setTab] = useState(() => keyFromPath(pathname));
  useEffect(() => { const k = keyFromPath(pathname); setTab((t) => (t === k ? t : k)); }, [pathname]);
  const [data, setData] = useState(null);
  const [lists, setLists] = useState({});
  const [loadErr, setLoadErr] = useState('');
  const [busy, setBusy] = useState('');

  const loadTab = useCallback(async (key) => {
    if (key === 'overview') {
      if (!data) {
        try { setData(await api.get('/dashboards/tenant')); } catch (e) { setLoadErr(e.message); }
      }
      return;
    }
    const urls = { saved: '/users/favorites', applications: '/applications', visits: '/visits' };
    const url = urls[key];
    if (!url || lists[key]) return;
    try {
      setLists((s) => ({ ...s, [key]: { loading: true } }));
      const res = await api.get(url);
      setLists((s) => ({ ...s, [key]: { items: res, loading: false } }));
    } catch (e) {
      setLists((s) => ({ ...s, [key]: { error: e.message, loading: false } }));
    }
  }, [data, lists]);

  useEffect(() => { loadTab(tab); }, [tab, loadTab]);

  const reload = async () => {
    setData(null); setLists({}); setLoadErr('');
    setTab('overview');
  };

  const act = async (url, thenReload) => {
    setBusy(url);
    try { await api.put(url); } catch { /* toastless for brevity */ }
    setBusy('');
    thenReload();
  };

  const go = (key) => setTab(key);

  return (
    <DashboardShell
      roleLabel="Tenant dashboard"
      items={TABS.map((t) => ({ ...t, badge: t.key === 'messages' ? (data?.unreadMessages || 0) : 0 }))}
      active={tab}
      onNav={go}
      accent="Good to see you"
      action={tab === 'overview' ? <Link to="/properties" className="hidden items-center gap-2 rounded-[3px] bg-ink px-4 py-2.5 text-[12.5px] font-semibold text-paper sm:inline-flex"><HomeIcon size={15} /> Find homes</Link> : null}
    >
      {loadErr ? (
        <ErrorState message={loadErr} onRetry={reload} />
      ) : tab === 'overview' && data ? (
        <Overview data={data} go={go} />
      ) : tab === 'overview' && !data ? (
        <Loading />
      ) : tab === 'saved' || tab === 'applications' || tab === 'visits' ? (
        <ListViews tab={tab} lists={lists} busy={busy} act={act} go={go} reloadTab={() => setLists((s) => ({ ...s, [tab]: undefined }))} />
      ) : tab === 'messages' ? (
        <Messenger />
      ) : tab === 'profile' ? (
        <ProfileSettings />
      ) : null}

      {/* quick actions strip for mobile */}
      {tab === 'overview' && data && (
        <div className="mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar sm:hidden">
          {[
            ['saved', `${data.savedCount} saved`, Heart],
            ['applications', `${data.applicationsCount} applications`, FileText],
            ['visits', `${data.visitsCount} visits`, CalendarClock],
          ].map(([k, l, I]) => (
            <button key={k} onClick={() => go(k)} className="flex shrink-0 items-center gap-2 rounded-full border border-black/12 bg-white px-4 py-2 text-[12.5px] font-semibold">
              <I size={14} className="text-clay" /> {l}
            </button>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}

const LoadState = 'loading';
function Loading() {
  return <div className="grid min-h-[300px] place-items-center"><Spinner className="h-6 w-6 text-clay" /></div>;
}

/* ------------------------------------------------------------- overview */
function Overview({ data, go }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="u-serif text-3xl text-ink">Good to see you, {data.welcomeName}.</h1>
          <p className="mt-1 text-[14px] text-stone">Here's what's happening with your home hunt today.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Saved homes" value={data.savedCount} icon={Heart} tone="bg-clay-tint text-clay" />
        <StatCard label="Applications" value={data.applicationsCount} icon={FileText} tone="bg-sand text-stone" />
        <StatCard label="Upcoming visits" value={data.visitsCount} icon={CalendarClock} tone="bg-moss/10 text-moss" />
        <StatCard label="Unread messages" value={data.unreadMessages} icon={MessageSquare} tone="bg-sand text-stone" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DashSection title="Upcoming visits" action={data.upcomingVisits?.length > 0 ? <Link to="/tenant" className="text-[12.5px] font-semibold text-clay">manage</Link> : null}>
          {data.upcomingVisits.length === 0 ? (
            <MiniEmpty icon={<CalendarClock size={18} />} text="No visits booked yet — schedule one from any home you like." action={<Link to="/properties">Browse homes</Link>} />
          ) : (
            <div className="space-y-2.5">
              {data.upcomingVisits.map((v) => <VisitRow key={v.id} v={v} />)}
            </div>
          )}
        </DashSection>

        <DashSection title="Recent applications" action={<button onClick={() => go('applications')} className="text-[12.5px] font-semibold text-clay">all →</button>}>
          {data.recentApplications.length === 0 ? (
            <MiniEmpty icon={<FileText size={18} />} text="Nothing applied to yet." action={<Link to="/properties">Start looking</Link>} />
          ) : (
            <div className="space-y-2.5">
              {data.recentApplications.map((a) => <ApplicationRow key={a.id} a={a} />)}
            </div>
          )}
        </DashSection>
      </div>

      {data.savedHomes.length > 0 && (
        <DashSection className="mt-10" title="Your shortlist" sub="The homes you've saved — they're waiting." action={<button onClick={() => go('saved')} className="text-[12.5px] font-semibold text-clay">view all →</button>}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.savedHomes.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        </DashSection>
      )}

      {data.recommended.length > 0 && (
        <DashSection className="mt-10" title="Recommended for you" sub="Based on what you've saved and applied to.">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.recommended.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        </DashSection>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------- lists */
function ListViews({ tab, lists, busy, act, go }) {
  const list = lists[tab];
  if (!list || list.loading) return <Loading />;
  if (list.error) return <ErrorState message={list.error} onRetry={() => go('overview')} />;
  const items = list.items || [];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{titleCase(tab)}</h1>
          <p className="text-[13px] text-stone">{items.length} item{items.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      {tab === 'saved' && (
        items.length === 0 ? (
          <EmptyRow><div><p className="text-[15px] font-semibold text-ink">No saved homes yet</p><p className="mt-1 text-[13px] text-stone">Tap the ♥ on any listing to keep it here.</p></div></EmptyRow>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
        )
      )}

      {tab === 'visits' && (
        items.length === 0 ? (
          <EmptyRow><p className="text-[15px] text-stone">You haven't requested any visits yet.</p></EmptyRow>
        ) : (
          <div className="space-y-3">
            {items.map((v) => (
              <div key={v.id} className="flex flex-wrap items-center gap-4 rounded-[5px] border border-black/10 bg-white p-4">
                <Link to={`/properties/${v.propertyId}`} className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-[3px] bg-sand"><img src={atWidth(v.coverImage, 300)} className="h-full w-full object-cover" alt="" /></Link>
                <div className="min-w-[160px] flex-1">
                  <Link to={`/properties/${v.propertyId}`} className="font-semibold text-ink hover:underline">{v.propertyTitle}</Link>
                  <p className="mt-0.5 flex items-center gap-1 text-[12px] text-stone"><MapPin size={11} /> {v.propertyLocation} · {inr(v.rentPerMonth)}/mo</p>
                  <p className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-ink"><Clock size={12} /> {prettyDateTime(v.scheduledAt)} <span className="capitalize text-stone-light">· {titleCase(v.mode)}</span></p>
                </div>
                <Badge tone={statusTone(v.status)}>{v.status}</Badge>
                {(v.status === 'REQUESTED' || v.status === 'CONFIRMED') && (
                  <Button variant="outline" size="sm" onClick={() => act(`/visits/${v.id}/status?status=CANCELLED`, reloadTab)} disabled={busy === `/visits/${v.id}`}>
                    <XCircle size={13} /> Cancel
                  </Button>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'applications' && (
        items.length === 0 ? (
          <EmptyRow><p className="text-[15px] text-stone">You haven't applied anywhere yet — your next home is waiting.</p></EmptyRow>
        ) : (
          <div className="space-y-3">
            {items.map((a) => <ApplicationRow key={a.id} a={a} wide />)}
          </div>
        )
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------- rows */
function VisitRow({ v }) {
  return (
    <div className="flex items-center gap-3.5 rounded-[5px] border border-black/10 bg-white p-3.5">
      <Link to={`/properties/${v.propertyId}`} className="relative block h-16 w-24 shrink-0 overflow-hidden rounded-[3px] bg-sand"><img src={atWidth(v.coverImage, 260)} alt="" loading="lazy" className="h-full w-full object-cover" /></Link>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-semibold text-ink">{v.propertyTitle}</p>
        <p className="mt-0.5 text-[11.5px] text-stone">{prettyDateTime(v.scheduledAt)}</p>
      </div>
      <Badge tone={statusTone(v.status)}>{v.status}</Badge>
    </div>
  );
}

function ApplicationRow({ a, wide }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-[5px] border border-black/10 bg-white p-4">
      <Link to={`/properties/${a.propertyId}`} className="relative block h-16 w-24 shrink-0 overflow-hidden rounded-[3px] bg-sand sm:h-20 sm:w-28"><img src={atWidth(a.coverImage, 260)} alt="" loading="lazy" className="h-full w-full object-cover" /></Link>
      <div className="min-w-[170px] flex-1">
        <Link to={`/properties/${a.propertyId}`} className="font-semibold text-ink hover:underline">{a.propertyTitle}</Link>
        <p className="mt-0.5 text-[12px] text-stone">{a.locationName} · {inr(a.rentPerMonth)}/mo{wide && <> · applied {new Date(a.createdAt).toLocaleDateString('en-IN')}</>}</p>
        {a.message && wide && <p className="mt-1 line-clamp-2 max-w-xl text-[12.5px] text-stone-light">{a.message}</p>}
      </div>
      <Badge tone={statusTone(a.status)}>{a.status}</Badge>
    </div>
  );
}

function MiniEmpty({ icon, text, action }) {
  return (
    <div className="rounded-[5px] border border-dashed border-black/15 bg-white/60 p-6 text-center">
      <span className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full bg-sand text-stone">{icon}</span>
      <p className="text-[13px] text-stone">{text}</p>
      {action && <div className="mt-3 text-[13px] font-semibold text-clay">{action}</div>}
    </div>
  );
}
