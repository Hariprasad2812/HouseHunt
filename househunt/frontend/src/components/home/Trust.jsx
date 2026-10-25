import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BadgeCheck, Camera, Handshake, MapPinned, MessageSquareText, ReceiptIndianRupee, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { useReducedMotion, Reveal } from '../ui';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  { icon: BadgeCheck, title: 'Verified listings', body: 'Every home is checked against ownership documents before it appears on HouseHunt.' },
  { icon: ReceiptIndianRupee, title: 'Transparent pricing', body: 'Rent, deposit and maintenance shown upfront. No hidden brokerage at the door.' },
  { icon: Camera, title: 'Real property photos', body: 'Photographs are taken on-site by our team — never borrowed from a developer brochure.' },
  { icon: MapPinned, title: 'Neighbourhood information', body: 'Schools, commute times and weekend spots — the context that decides if a home works.' },
  { icon: MessageSquareText, title: 'Secure communication', body: 'Chat and scheduling happen inside HouseHunt, keeping your number private until you share it.' },
  { icon: ShieldCheck, title: 'No fake listings', body: 'Suspicious activity is flagged and removed. Listings that don’t verify don’t ship.' },
];

function Counter({ to, suffix = '', decimals = 0 }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      el.textContent = (to).toLocaleString('en-IN') + suffix;
      return;
    }
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: to,
      duration: 1.6,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate: () => {
        el.textContent = obj.v.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
      },
    });
    return () => { tween.kill(); };
  }, [to, suffix, decimals, reduced]);
  return <span ref={ref}>0</span>;
}

export default function Trust() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    (async () => {
      const [props, locs] = await Promise.all([
        api.get('/properties', { size: 1 }).catch(() => null),
        api.get('/locations').catch(() => null),
      ]);
      setStats({
        homes: props?.totalElements || 0,
        areas: locs?.length || 10,
      });
    })();
  }, []);

  return (
    <section className="bg-paper py-24 lg:py-32">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="u-eyebrow mb-4">The HouseHunt standard</p>
              <h2 className="u-serif text-[clamp(2rem,4vw,3.3rem)] leading-[1.02] text-ink">
                Better homes.<br />Fewer surprises.
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-stone">
                Renting in Bengaluru is rarely about the flat itself — it's about the landlord, the
                deposit, the fine print and whether the photos are real. We rebuilt that experience
                from the ground up.
              </p>
              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-black/10 pt-8">
                <div>
                  <p className="u-serif text-4xl text-ink sm:text-5xl">
                    {stats ? <Counter to={stats.homes} /> : '—'}
                  </p>
                  <p className="mt-1.5 text-[12px] font-semibold uppercase tracking-wider text-stone-light">Verified homes</p>
                </div>
                <div>
                  <p className="u-serif text-4xl text-ink sm:text-5xl">
                    {stats ? <Counter to={stats.areas} /> : '—'}
                  </p>
                  <p className="mt-1.5 text-[12px] font-semibold uppercase tracking-wider text-stone-light">Neighbourhoods</p>
                </div>
                <div>
                  <p className="u-serif text-4xl text-ink sm:text-5xl"><Counter to={100} suffix="%" /></p>
                  <p className="mt-1.5 text-[12px] font-semibold uppercase tracking-wider text-stone-light">Photos on-site</p>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-px overflow-hidden sm:grid-cols-2" style={{ background: 'rgba(27,26,22,0.1)' }}>
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={i * 0.06} className="bg-paper">
                  <div className="group h-full bg-white p-7 transition-colors duration-300 hover:bg-clay-tint" style={{ borderBottom: '1px solid rgba(27,26,22,0.06)' }}>
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-black/10 text-ink transition-colors group-hover:border-clay group-hover:text-clay">
                      <f.icon size={18} strokeWidth={1.6} />
                    </span>
                    <h3 className="mt-5 text-[16px] font-semibold text-ink">{f.title}</h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-stone">{f.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
