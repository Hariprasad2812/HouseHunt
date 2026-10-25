import { motion } from 'framer-motion';
import { Search, CalendarCheck, KeyRound } from 'lucide-react';

const STEPS = [
  {
    icon: Search, n: '01',
    title: 'Discover',
    body: 'Search verified homes and filter by your lifestyle and budget — then shortlist the ones that actually suit how you live.',
  },
  {
    icon: CalendarCheck, n: '02',
    title: 'Visit',
    body: 'Schedule a viewing in a few taps, in person or over a video call. Owners respond through HouseHunt, so you stay in control.',
  },
  {
    icon: KeyRound, n: '03',
    title: 'Move in',
    body: 'Complete the paperwork and move into your new home — with transparent terms and no brokerage surprises at the door.',
  },
];

export function StepFlow({ dark = false, tone = 'row' }) {
  return (
    <div className={tone === 'row' ? 'grid gap-10 md:grid-cols-3 md:gap-6' : 'space-y-10'}>
      {STEPS.map((s, i) => (
        <motion.div
          key={s.n}
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="flex items-center gap-5">
            <span className="u-serif text-5xl text-clay/90" aria-hidden>{s.n}</span>
            <span className={`grid h-11 w-11 place-items-center rounded-full border ${dark ? 'border-paper/25 text-paper' : 'border-black/15 text-ink'}`}>
              <s.icon size={18} strokeWidth={1.6} />
            </span>
          </div>
          <span className={`my-5 block h-px w-full ${dark ? 'bg-paper/15' : 'bg-black/10'}`} style={{ transform: 'scaleY(.5)' }} />
          <h3 className={`text-xl font-semibold tracking-[-0.01em] ${dark ? 'text-paper' : 'text-ink'}`}>{s.title}</h3>
          <p className={`mt-2.5 max-w-sm text-[15px] leading-relaxed ${dark ? 'text-paper/60' : 'text-stone'}`}>{s.body}</p>
        </motion.div>
      ))}
    </div>
  );
}

export default function HowItWorksSection() {
  return (
    <section className="border-y border-black/[0.07] bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="u-eyebrow mb-4"
          >
            How HouseHunt works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="u-serif text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.05] text-ink"
          >
            From search to keys, in three steps.
          </motion.h2>
        </div>
        <div className="mt-14">
          <StepFlow />
        </div>
      </div>
    </section>
  );
}
