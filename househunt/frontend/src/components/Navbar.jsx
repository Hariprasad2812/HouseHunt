import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LogOut, Menu, PlusCircle, X } from 'lucide-react';
import { Wordmark } from './brand';
import { useAuth } from '../lib/useAuth';
import { initials } from '../lib/format';
import { useOnClickOutside } from './ui';

const NAV = [
  { to: '/explore', label: 'Explore' },
  { to: '/properties', label: 'Properties' },
  { to: '/locations', label: 'Locations' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/about', label: 'About' },
];

export function Navbar() {
  const { user, logout, home } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [drop, setDrop] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  const ref = useRef(null);
  useOnClickOutside(ref, () => setDrop(false));

  const overHero = loc.pathname === '/' && !scrolled && !open && !menu;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false); setMenu(false); setDrop(false);
  }, [loc.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const textCls = overHero ? 'text-paper' : 'text-ink';

  const handleLogout = () => { logout(); nav('/'); };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[90] transition-all duration-500 ${
          overHero
            ? 'bg-transparent'
            : scrolled
              ? 'border-b border-black/[0.08] bg-paper/90 backdrop-blur-md shadow-[0_1px_0_rgba(27,26,22,0.02)]'
              : 'border-b border-black/[0.06] bg-paper'
        }`}
      >
        <div className="mx-auto flex h-[68px] max-w-shell items-center justify-between px-5 lg:px-8">
          <div className={`${textCls} transition-colors duration-500`}><Wordmark light={overHero} /></div>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
            {NAV.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `u-linkline text-[13.5px] font-medium tracking-[-0.005em] transition-colors ${textCls} ${isActive ? 'active' : 'opacity-75 hover:opacity-100'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {!user ? (
              <>
                <Link to="/list-property" className={`u-linkline text-[13.5px] font-semibold ${textCls}`}>
                  List your property
                </Link>
                <Link
                  to="/login"
                  className={`text-[13.5px] font-medium transition-colors ${textCls} opacity-80 hover:opacity-100`}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className={`inline-flex h-10 items-center rounded-[3px] px-5 text-[13.5px] font-semibold transition-colors ${
                    overHero ? 'bg-paper text-ink hover:bg-white' : 'bg-ink text-paper hover:bg-coal'
                  }`}
                >
                  Get started
                </Link>
              </>
            ) : (
              <>
                {(user.role === 'OWNER' || user.role === 'ADMIN') && (
                  <Link
                    to="/list-property"
                    className="inline-flex h-10 items-center gap-2 rounded-[3px] border border-clay/30 bg-clay-tint px-4 text-[13.5px] font-semibold text-clay-deep transition-colors hover:bg-clay hover:text-white"
                  >
                    <PlusCircle size={15} /> List property
                  </Link>
                )}
                <div className="relative" ref={ref}>
                  <button
                    onClick={() => setDrop((v) => !v)}
                    className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-black/[0.05] ${textCls}`}
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-clay text-[12px] font-bold text-white">
                      {initials(user.fullName)}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </button>
                  <AnimatePresence>
                    {drop && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.16 }}
                        className="absolute right-0 top-[52px] w-60 overflow-hidden rounded-[6px] border border-black/10 bg-white py-2 shadow-lift"
                      >
                        <div className="border-b border-black/[0.06] px-4 pb-2.5 pt-1">
                          <p className="text-sm font-semibold text-ink">{user.fullName}</p>
                          <p className="mt-0.5 text-xs text-stone">{user.email}</p>
                          <span className="mt-2 inline-flex items-center rounded-full bg-sand px-2 py-[2px] text-[10px] font-bold uppercase tracking-wider text-stone">
                            {user.role}
                          </span>
                        </div>
                        <Link to={home} className="block px-4 py-2.5 text-sm text-ink hover:bg-paper">
                          {user.role === 'ADMIN' ? 'Admin dashboard' : user.role === 'OWNER' ? 'Owner dashboard' : 'My dashboard'}
                        </Link>
                        <Link to="/profile" className="block px-4 py-2.5 text-sm text-ink hover:bg-paper">Profile &amp; settings</Link>
                        <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-clay-deep hover:bg-paper">
                          <LogOut size={14} /> Sign out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          <button
            className={`grid h-10 w-10 place-items-center lg:hidden ${textCls}`}
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" strokeWidth={1.6} />
          </button>
        </div>
      </header>

      {/* mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[110] bg-paper lg:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex h-[68px] items-center justify-between border-b border-black/[0.08] px-5">
              <Wordmark />
              <button className="grid h-10 w-10 place-items-center" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 px-5 pt-8" aria-label="Mobile">
              {NAV.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
                >
                  <NavLink
                    to={l.to}
                    className={({ isActive }) =>
                      `u-serif block border-b border-black/[0.06] py-4 text-3xl ${isActive ? 'text-clay' : 'text-ink'}`
                    }
                  >
                    {l.label}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
            <div className="mt-auto grid grid-cols-1 gap-3 px-5 pb-10 pt-8">
              {user ? (
                <>
                  <Link to={home} className="flex h-12 items-center justify-center rounded-[3px] bg-ink text-sm font-semibold text-paper">
                    Go to dashboard
                  </Link>
                  <Link to="/list-property" className="flex h-12 items-center justify-center rounded-[3px] border border-black/20 text-sm font-semibold">
                    List your property
                  </Link>
                  <button onClick={handleLogout} className="flex h-12 items-center justify-center gap-2 text-sm font-medium text-stone">
                    <LogOut size={15} /> Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/list-property" className="flex h-12 items-center justify-center rounded-[3px] border border-black/20 text-sm font-semibold">
                    List your property
                  </Link>
                  <Link to="/register" className="flex h-12 items-center justify-center rounded-[3px] bg-ink text-sm font-semibold text-paper">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
