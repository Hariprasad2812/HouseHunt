import { Link } from 'react-router-dom';

export const LogoMark = ({ className = 'h-8 w-8' }) => (
  <span className={`grid place-items-center ${className}`} aria-hidden>
    <svg viewBox="0 0 32 32" fill="none" className="h-full w-full">
      <rect x="1" y="1" width="30" height="30" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 24V11.5L16 6.5l7 5V24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      <path d="M13.5 24v-6h5v6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M11.5 13.5h2M18.5 13.5h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  </span>
);

export const Wordmark = ({ light, className = 'text-[17px]' }) => (
  <Link to="/" className="group inline-flex items-center gap-2.5">
    <LogoMark className={`h-[30px] w-[30px] transition-colors ${light ? 'text-paper' : 'text-ink'}`} />
    <span className={`flex flex-col leading-none ${className}`}>
      <span className={`u-serif tracking-[0.02em] ${light ? 'text-paper' : 'text-ink'}`}>HouseHunt</span>
      <span className={`mt-[3px] text-[8.5px] font-semibold uppercase tracking-wide3 ${light ? 'text-paper/60' : 'text-stone-light'}`}>
        Bengaluru
      </span>
    </span>
  </Link>
);

export const BrandFooter = ({ light }) => (
  <div className="flex flex-col gap-4">
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className={`h-9 w-9 ${light ? 'text-paper' : 'text-ink'}`} />
      <span className={`u-serif text-2xl ${light ? 'text-paper' : 'text-ink'}`}>HouseHunt</span>
    </span>
    <p className={`max-w-xs text-sm leading-relaxed ${light ? 'text-paper/60' : 'text-stone'}`}>
      Find a place worth coming home to.
    </p>
  </div>
);
