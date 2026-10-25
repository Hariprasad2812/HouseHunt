import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, LogOut, Menu as MenuIcon, PlusCircle, Settings, X } from 'lucide-react';
import { Wordmark } from '../brand';
import { useAuth } from '../../lib/useAuth';
import { api } from '../../lib/api';
import { initials, timeAgo } from '../../lib/format';
import { IconBtn, Spinner, useOnClickOutside } from '../ui';

export function StatCard({ label, value, hint, icon: Icon, tone = '' }) {
  return (
    <div className="bg-white p-5" style={{ border: '1px solid rgba(27,26,22,.09)', borderRadius: 5 }}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wide2 text-stone-light">{label}</p>
        {Icon && <span className={`grid h-8 w-8 place-items-center rounded-full ${tone}`}><Icon size={15} strokeWidth={1.8} /></span>}
      </div>
      <p className="u-serif mt-2 text-3xl text-ink">{value}</p>
      {hint && <p className="mt-1 text-[12px] text-stone-light">{hint}</p>}
    </div>
  );
}

function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(null);
  const { notifBadge } = useAuth();
  const ref = useRef(null);
  useOnClickOutside(ref, () => setOpen(false));
  useEffect(() => {
    if (open && items === null) {
      api.get('/notifications').then(setItems).catch(() => setItems([]));
    }
  }, [open, items]);
  const markAll = async () => {
    try { await api.put('/notifications/read-all'); setItems((s) => s?.map((n) => ({ ...n, read: true }))); } catch { /* noop */ }
  };
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="relative grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-black/[0.05]" aria-label="Notifications">
        <Bell size={18} strokeWidth={1.7} />
        {notifBadge > 0 && (
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-clay px-1 text-[9.5px] font-bold text-white">{notifBadge}</span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            className="absolute right-0 top-[52px] z-40 w-[min(92vw,380px)] overflow-hidden rounded-[6px] border border-black/10 bg-white shadow-pop"
          >
            <div className="flex items-center justify-between border-b border-black/[0.07] px-4 py-3">
              <p className="text-sm font-bold text-ink">Notifications</p>
              <button onClick={markAll} className="text-[11.5px] font-semibold text-clay">Mark all read</button>
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {!items ? (
                <div className="grid place-items-center py-10"><Spinner className="h-5 w-5 text-clay" /></div>
              ) : items.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-stone">You're all caught up.</p>
              ) : (
                items.map((n) => (
                  <div key={n.id} className={`flex gap-3 border-b border-black/[0.05] px-4 py-3.5 ${n.read ? '' : 'bg-clay-tint/50'}`}>
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-black/15' : 'bg-clay'}`} />
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-semibold text-ink">{n.title}</p>
                      {n.body && <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-relaxed text-stone">{n.body}</p>}
                      <p className="mt-1 text-[10.5px] uppercase tracking-wider text-stone-light">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DashboardShell({ roleLabel, items, active, onNav, accent = 'Overview', action, children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [drawer, setDrawer] = useState(false);
  const ActiveIcon = items.find((i) => i.key === active)?.icon;

  const logoutUser = () => { logout(); nav('/'); };

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-6 pt-6"><Wordmark /></div>
      <p className="px-5 pb-2 text-[10px] font-bold uppercase tracking-wide3 text-stone-light">{roleLabel}</p>
      <nav className="flex-1 space-y-0.5 px-3">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => { onNav(it.key); setDrawer(false); }}
            className={`flex w-full items-center gap-3 rounded-[4px] px-3 py-2.5 text-left text-[13.5px] font-medium transition-colors ${active === it.key ? 'bg-ink text-paper' : 'text-stone hover:bg-black/[0.05] hover:text-ink'}`}
          >
            <it.icon size={17} strokeWidth={1.7} />
            <span className="flex-1">{it.label}</span>
            {it.badge > 0 && (
              <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold ${active === it.key ? 'bg-clay text-white' : 'bg-clay/15 text-clay-deep'}`}>{it.badge}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="border-t border-black/[0.07] p-3">
        <Link to="/" className="flex items-center gap-3 rounded-[4px] px-3 py-2 text-[13px] text-stone hover:bg-black/[0.04]">← Back to site</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto flex max-w-[1440px]">
        {/* desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-black/[0.07] bg-white lg:block">{Sidebar}</aside>

        {/* main */}
        <div className="min-w-0 flex-1">
          {/* topbar */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-black/[0.07] bg-paper/95 px-5 backdrop-blur lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button className="grid h-10 w-10 place-items-center rounded-[4px] hover:bg-black/[0.05] lg:hidden" onClick={() => setDrawer(true)} aria-label="Menu"><MenuIcon size={19} /></button>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-bold text-ink">{ActiveIcon ? <span className="inline-flex items-center gap-2"><ActiveIcon size={16} className="text-clay" strokeWidth={1.8} /> {active === 'overview' ? accent : items.find((i) => i.key === active)?.label || accent}</span> : accent}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {action}
              <NotificationsBell />
              {(() => {
                const t = items.some((i) => i.key === 'profile') ? 'profile' : items.some((i) => i.key === 'settings') ? 'settings' : null;
                return t ? (
                  <button onClick={() => { onNav(t); setDrawer(false); }} className="hidden h-10 w-10 place-items-center rounded-full transition-colors hover:bg-black/[0.05] sm:grid" aria-label="Settings"><Settings size={18} strokeWidth={1.7} /></button>
                ) : null;
              })()}
              <div className="hidden items-center gap-2.5 border-l border-black/10 pl-3 sm:flex">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-clay text-[12px] font-bold text-white">{initials(user?.fullName)}</span>
                <div className="leading-tight">
                  <p className="text-[13px] font-semibold text-ink">{user?.fullName}</p>
                  <p className="text-[11px] capitalize text-stone-light">{roleLabel.replace('Dashboard', '').trim()}</p>
                </div>
                <button onClick={logoutUser} aria-label="Sign out" className="grid h-8 w-8 place-items-center rounded-full text-stone hover:bg-black/[0.05] hover:text-clay"><LogOut size={15} /></button>
              </div>
            </div>
          </header>

          <div className="px-5 py-7 lg:px-8 lg:py-9">{children}</div>
        </div>
      </div>

      {/* mobile sidebar */}
      <AnimatePresence>
        {drawer && <motion.div className="fixed inset-0 z-[100] bg-black/40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {drawer && (
          <motion.aside
            className="fixed inset-y-0 left-0 z-[101] w-[280px] bg-white lg:hidden"
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'tween', duration: 0.3 }}
          >
            <button className="absolute right-3 top-4 grid h-9 w-9 place-items-center" onClick={() => setDrawer(false)} aria-label="Close"><X size={18} /></button>
            {Sidebar}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

export const DashSection = ({ title, sub, action, children, className = '' }) => (
  <section className={className}>
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold tracking-[-0.01em] text-ink">{title}</h2>
        {sub && <p className="mt-0.5 text-[13px] text-stone">{sub}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

export const EmptyRow = ({ children }) => (
  <div className="grid place-items-center rounded-[5px] border border-dashed border-black/15 bg-white/60 px-6 py-14 text-center">{children}</div>
);
