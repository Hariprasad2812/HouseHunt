import { Link } from 'react-router-dom';
import { ArrowUpRight, Facebook, Instagram, Linkedin, MapPin, Twitter } from 'lucide-react';
import { Wordmark } from './brand';

const cols = [
  {
    head: 'Discover',
    links: [
      ['Explore homes', '/properties'],
      ['Featured properties', '/properties?featured=1'],
      ['Neighbourhoods', '/locations'],
      ['How it works', '/how-it-works'],
      ['Interactive map', '/properties#map'],
    ],
  },
  {
    head: 'Owners',
    links: [
      ['List your property', '/list-property'],
      ['Owner dashboard', '/owner'],
      ['Verification process', '/how-it-works'],
      ['Pricing guide', '/about'],
    ],
  },
  {
    head: 'HouseHunt',
    links: [
      ['About us', '/about'],
      ['Contact', '/about#contact'],
      ['Support', '/about'],
      ['Privacy', '/privacy'],
      ['Terms', '/terms'],
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-black/[0.08] bg-[#221f18] text-paper">
      <div className="mx-auto max-w-shell px-5 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_2fr]">
          <div>
            <Link to="/" className="inline-block">
              <span className="u-serif text-[26px] tracking-[0.01em]">HouseHunt</span>
            </Link>
            <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-paper/55">
              Find a place worth coming home to.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-paper/15 px-3.5 py-1.5 text-[12px] text-paper/60">
              <MapPin size={13} className="text-clay-soft" /> Bengaluru, Karnataka — since 2021
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {cols.map((c) => (
              <div key={c.head}>
                <p className="text-[11px] font-bold uppercase tracking-wide3 text-paper/40">{c.head}</p>
                <ul className="mt-5 space-y-3">
                  {c.links.map(([label, to]) => (
                    <li key={label}>
                      <Link to={to} className="text-[14px] text-paper/75 transition-colors hover:text-paper">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-6 border-t border-paper/10 pt-8 sm:flex-row sm:items-center">
          <p className="text-[13px] text-paper/40">
            © {new Date().getFullYear()} HouseHunt Technologies Pvt. Ltd. — a demo experience, not a real brokerage.
          </p>
          <div className="flex items-center gap-2">
            {[Instagram, Facebook, Linkedin, Twitter].map((Ico, i) => (
              <a
                key={i}
                href="#top"
                aria-label="social link"
                onClick={(e) => e.preventDefault()}
                className="grid h-9 w-9 place-items-center rounded-full border border-paper/15 text-paper/70 transition-colors hover:border-paper hover:text-paper"
              >
                <Ico size={15} />
              </a>
            ))}
            <a
              href="https://github.com"
              aria-label="github"
              className="grid h-9 w-9 place-items-center rounded-full border border-paper/15 text-paper/70 transition-colors hover:border-paper hover:text-paper"
              onClick={(e) => e.preventDefault()}
            >
              <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
