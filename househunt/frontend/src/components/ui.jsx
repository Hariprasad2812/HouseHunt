import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Loader2, SearchX, WifiOff, X, Check, Star } from 'lucide-react';
import { statusTone } from '../lib/format';
import { Link } from 'react-router-dom';

/* ---------------------------------------------------------------- motion prefs */
export const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReduced());
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/* ---------------------------------------------------------------- scroll reveal */
export const Reveal = ({ children, y = 26, delay = 0, className = '', as = 'div' }) => {
  const reduced = useReducedMotion();
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </Comp>
  );
};

/* ---------------------------------------------------------------- buttons */
export function Button({
  children, variant = 'solid', size = 'md', icon, className = '', full, to, ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium tracking-[-0.01em] transition-all duration-200 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay/60 disabled:opacity-45 disabled:pointer-events-none whitespace-nowrap';
  const sizes = {
    sm: 'h-9 px-4 text-[13px]',
    md: 'h-11 px-6 text-sm',
    lg: 'h-[52px] px-8 text-[15px]',
  };
  const variants = {
    solid: 'bg-ink text-paper hover:bg-coal shadow-soft',
    accent: 'bg-clay text-white hover:bg-clay-deep shadow-soft',
    light: 'bg-white text-ink hover:bg-paper border border-black/10',
    outline: 'bg-transparent text-ink border border-black/25 hover:border-ink hover:bg-white/60',
    ghost: 'bg-transparent text-ink hover:bg-black/[0.04] px-3',
    paper: 'bg-paper text-ink hover:bg-white border border-black/10',
    ondark: 'bg-paper text-ink hover:bg-white',
  };
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${full ? 'w-full' : ''} ${className}`;
  if (to) {
    return <Link to={to} className={cls} {...rest}>{icon}{children}</Link>;
  }
  return (
    <button className={cls} {...rest}>
      {icon}{children}
    </button>
  );
}

export const ArrowLink = ({ children, to, className = '' }) => (
  <a href={to} className={`group inline-flex items-center gap-2 text-sm font-semibold text-ink ${className}`}>
    {children}
    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.8} />
  </a>
);

export const IconBtn = ({ children, label, onClick, className = '', ...rest }) => (
  <button
    aria-label={label}
    onClick={onClick}
    className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/[0.05] ${className}`}
    {...rest}
  >
    {children}
  </button>
);

/* ---------------------------------------------------------------- badges */
const toneClass = {
  ok: 'bg-moss/10 text-moss border-moss/20',
  warn: 'bg-clay-soft text-clay-deep border-clay/25',
  danger: 'bg-red-50 text-red-700 border-red-200',
  neutral: 'bg-black/[0.04] text-stone border-black/10',
};
export const Badge = ({ children, tone = 'neutral', className = '', dot }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[11px] font-semibold uppercase tracking-wider ${toneClass[tone]} ${className}`}>
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}{children}
  </span>
);

export const StatusBadge = ({ status }) => <Badge tone={statusTone(status)}>{status.replace(/_/g, ' ')}</Badge>;

export const Verified = ({ className = '', size = 12 }) => (
  <span className={`inline-flex items-center gap-1 rounded-full bg-moss/10 px-2 py-[2px] text-[10px] font-bold uppercase tracking-wider text-moss ${className}`}>
    <Check size={size} strokeWidth={3} /> Verified
  </span>
);

/* ---------------------------------------------------------------- form bits */
export const Field = ({ label, hint, error, required, children, className = '' }) => (
  <label className={`block ${className}`}>
    {label && (
      <span className="mb-1.5 flex items-baseline justify-between text-[12px] font-semibold uppercase tracking-wider text-stone">
        {label}{required && <span className="text-clay">*</span>}
        {hint && <span className="font-normal normal-case tracking-normal text-stone-light">{hint}</span>}
      </span>
    )}
    {children}
    {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
  </label>
);

export const Input = ({ className = '', ...rest }) => (
  <input className={`u-input h-11 rounded-[3px] px-3.5 ${className}`} {...rest} />
);

export const Textarea = ({ className = '', ...rest }) => (
  <textarea className={`u-input min-h-[96px] rounded-[3px] px-3.5 py-3 ${className}`} {...rest} />
);

export const Select = ({ children, className = '', placeholder, value, onChange, ...rest }) => (
  <div className={`relative ${className}`}>
    <select
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
      className={`u-input h-11 appearance-none rounded-[3px] px-3.5 pr-9 ${value ? '' : 'text-stone-light'}`}
      {...rest}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-light" />
  </div>
);

/* A select that reads like a button — used on dark backgrounds / hero search */
export const GhostSelect = ({ value, options, onChange, onOpenChange }) => (
  <div className="relative">
    <select
      value={value || ''}
      onChange={(e) => { onChange?.(e.target.value); onOpenChange?.(false); }}
      className="appearance-none cursor-pointer bg-transparent pr-5 text-sm font-medium outline-none focus:ring-0 [&>option]:text-ink"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

export const CheckBox = ({ label, checked, onChange, className = '' }) => (
  <label className={`flex cursor-pointer items-start gap-3 text-sm text-coal ${className}`}>
    <span className={`mt-[1px] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[2px] border transition-colors ${checked ? 'border-ink bg-ink text-paper' : 'border-black/25 bg-white'}`}>
      {checked && <Check size={12} strokeWidth={3} />}
    </span>
    <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span className="leading-snug">{label}</span>
  </label>
);

export const Radios = ({ name, value, onChange, options, cols = 2 }) => (
  <div className={`grid gap-2 ${cols === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
    {options.map((o) => {
      const active = value === o.value;
      return (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex items-center justify-center rounded-[3px] border px-3 py-2.5 text-sm font-medium transition-colors ${
            active ? 'border-ink bg-ink text-paper' : 'border-black/15 bg-white text-ink hover:border-black/40'
          }`}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);

export const Rating = ({ value = 0, onPick, size = 15 }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={!onPick}
          onClick={() => onPick?.(s)}
          aria-label={`${s} star`}
        >
          <Star
            size={size}
            strokeWidth={1.6}
            className={s <= value ? 'fill-clay text-clay' : 'text-black/20'}
          />
        </button>
      ))}
    </div>
  );
};

/* ---------------------------------------------------------------- feedback */
export const Spinner = ({ className = 'h-5 w-5' }) => (
  <Loader2 className={`animate-spin ${className}`} strokeWidth={2} />
);

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-[4px] bg-black/[0.07] ${className}`} />
);

export const EmptyState = ({ icon, title, body, action }) => (
  <div className="u-card flex flex-col items-center px-8 py-16 text-center">
    <div className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-sand text-stone">
      {icon || <SearchX className="h-6 w-6" strokeWidth={1.5} />}
    </div>
    <h3 className="u-serif text-2xl text-ink">{title}</h3>
    {body && <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone">{body}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export const ErrorState = ({ message = 'We could not reach the service.', onRetry, compact }) =>
  compact ? (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <WifiOff className="h-7 w-7 text-stone-light" strokeWidth={1.4} />
      <p className="max-w-xs text-sm text-stone">{message}</p>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  ) : (
    <div className="u-card flex flex-col items-center px-8 py-16 text-center">
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-full bg-sand text-clay">
        <WifiOff className="h-6 w-6" strokeWidth={1.4} />
      </div>
      <h3 className="text-xl font-semibold">Something went wrong</h3>
      <p className="mt-2 max-w-sm text-sm text-stone">{message}</p>
      {onRetry && <Button className="mt-6" variant="outline" onClick={onRetry}>Try again</Button>}
    </div>
  );

/* ---------------------------------------------------------------- modal */
const ModalCtx = createContext(null);
export const ModalRoot = ({ children }) => {
  const [modals, setModals] = useState([]);
  const open = (m) => setModals((s) => (s.some((x) => x.id === m.id) ? s : [...s, m]));
  const close = (id) => setModals((s) => s.filter((x) => x.id !== id));
  return (
    <ModalCtx.Provider value={{ open, close }}>
      {children}
      {createPortal(
        <AnimatePresence>
          {modals.map((m) => (
            <ModalShell key={m.id} onClose={() => close(m.id)} size={m.size} closable={m.closable !== false}>
              {m.content}
            </ModalShell>
          ))}
        </AnimatePresence>,
        document.body,
      )}
    </ModalCtx.Provider>
  );
};

export const useModal = () => useContext(ModalCtx);
export const ModalShell = ({ children, onClose, size = 'md', closable = true, noPad }) => {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);
  const width = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }[size] || 'max-w-xl';
  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-end justify-center overflow-y-auto bg-black/45 p-0 sm:items-center sm:p-6"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && closable && onClose?.()}
      role="dialog" aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, y: 26, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.985 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={`relative w-full rounded-t-[10px] bg-paper shadow-pop sm:rounded-[6px] ${width} ${noPad ? '' : 'p-6 sm:p-8'}`}
      >
        {closable && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/[0.05] text-ink transition-colors hover:bg-black/10"
          >
            <X size={17} />
          </button>
        )}
        {children}
      </motion.div>
    </motion.div>
  );
};

export const SectionHead = ({ eyebrow, title, lede, align = 'left', light, className = '' }) => (
  <Reveal className={className}>
    <div className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      {eyebrow && <p className={`u-eyebrow mb-4 ${light ? 'text-clay-soft' : ''}`}>{eyebrow}</p>}
      <h2 className={`u-serif text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.05] ${light ? 'text-paper' : 'text-ink'}`}>{title}</h2>
      {lede && (
        <p className={`mt-4 text-[15px] leading-relaxed sm:text-base ${light ? 'text-paper/70' : 'text-stone'}`}>{lede}</p>
      )}
    </div>
  </Reveal>
);

export const Confirm = ({ id, title, body, yesLabel = 'Confirm', danger, onYes }) => {
  const { close } = useModal();
  return (
    <div className="pt-2">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {body && <p className="mt-1.5 text-sm leading-relaxed text-stone">{body}</p>}
      <div className="mt-6 flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => close(id)}>Cancel</Button>
        <Button
          className={danger ? 'flex-1 bg-red-700 text-white hover:bg-red-800' : 'flex-1'}
          onClick={() => { close(id); onYes?.(); }}
        >
          {yesLabel}
        </Button>
      </div>
    </div>
  );
};

export const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) handler?.(); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [ref, handler]);
};
