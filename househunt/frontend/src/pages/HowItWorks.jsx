import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ShieldCheck, Clock3, BadgeIndianRupee, KeyRound } from 'lucide-react';
import { StepFlow } from '../components/home/HowItWorks';
import { Reveal, SectionHead } from '../components/ui';

const FAQS = [
  {
    q: 'Is HouseHunt really free for tenants?',
    a: 'Yes. Browsing, shortlisting, applying, scheduling visits and messaging owners are all free. Owners pay only when we help them get a verified listing in front of the right tenants.',
  },
  {
    q: 'How are listings verified?',
    a: 'Every owner submits ownership proof and a live phone number. Our team cross-checks documents, calls to confirm, and in many cases visits the home before a listing goes live. Anything we can’t verify doesn’t ship.',
  },
  {
    q: 'Can I sign a lease through HouseHunt?',
    a: 'Agreements are signed directly between you and the owner (often on registered leave-and-license terms). HouseHunt provides the transparent checklist — rent, deposit, notice period and maintenance — so nothing is left vague.',
  },
  {
    q: 'What about the deposit?',
    a: 'Deposits are agreed between you and the owner, and we show them upfront on every listing so you can compare apples to apples. Typical Bangalore deposits run 2–6 months of rent depending on furnishing.',
  },
  {
    q: 'What happens if a listing is fake?',
    a: 'We remove it immediately and refund any owner fees involved. Our moderation queue and post-visit reviews make fake listings very short-lived.',
  },
];

export default function HowItWorks() {
  const [open, setOpen] = useState(0);
  return (
    <div className="bg-paper pt-[68px]">
      <section className="mx-auto max-w-shell px-5 pb-10 pt-16 lg:px-8 lg:pt-24">
        <Reveal className="max-w-3xl">
          <p className="u-eyebrow mb-4">How it works</p>
          <h1 className="u-serif text-[clamp(2.3rem,5vw,4.2rem)] leading-[1.02] text-ink">
            A calmer way to find <span className="italic text-clay">your next address.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-stone">
            Searching Bangalore’s rental market usually means fighting WhatsApp groups, ghost listings
            and agents who quote a different price on the phone. We built the opposite.
          </p>
        </Reveal>
      </section>

      <section className="border-y border-black/[0.07] bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-shell px-5 lg:px-8">
          <StepFlow />
        </div>
      </section>

      <section className="mx-auto max-w-shell px-5 py-20 lg:px-8">
        <SectionHead eyebrow="Built on trust" title="What you can expect at each step" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [ShieldCheck, 'Identity checks', 'Every listing and every owner passes a document check before going live.'],
            [Clock3, 'Fast responses', 'Owners answer applications and visit requests through the platform — usually within a day.'],
            [BadgeIndianRupee, 'Honest money', 'Rent, deposit, maintenance and notice period are stated before you visit. No last-minute surprises.'],
            [KeyRound, 'You choose the end', 'If you like the home, you deal directly with the owner. No brokerage, ever.'],
          ].map(([Icon, t, b], i) => (
            <Reveal key={t} delay={i * 0.07}>
              <div className="h-full bg-white p-6" style={{ border: '1px solid rgba(27,26,22,0.09)', borderRadius: 4 }}>
                <Icon size={20} strokeWidth={1.5} className="text-clay" />
                <h3 className="mt-4 font-semibold text-ink">{t}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-stone">{b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-black/[0.07] bg-white py-20">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <SectionHead eyebrow="Questions" title="Good questions, honest answers" align="center" className="mx-auto" />
          <div className="mt-10 space-y-2">
            {FAQS.map((f, i) => (
              <div key={i} className="overflow-hidden rounded-[4px] border border-black/10 bg-paper">
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-semibold text-ink">{f.q}</span>
                  <ChevronDown className={`shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
                </button>
                {open === i && (
                  <p className="border-t border-black/[0.07] px-5 py-4 text-[14px] leading-relaxed text-stone">{f.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-shell px-5 py-24 lg:px-8">
        <Reveal className="flex flex-col items-start justify-between gap-6 rounded-[6px] bg-[#221f18] p-8 text-paper sm:flex-row sm:items-center lg:p-12">
          <div>
            <h2 className="u-serif text-3xl lg:text-4xl">Ready when you are.</h2>
            <p className="mt-2 text-[15px] text-paper/60">Two minutes of searching beats an afternoon of calls.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/properties" className="inline-flex h-12 items-center rounded-[3px] bg-paper px-7 text-sm font-semibold text-ink hover:bg-white">Start exploring</Link>
            <Link to="/list-property" className="inline-flex h-12 items-center rounded-[3px] border border-paper/30 px-7 text-sm font-semibold text-paper hover:bg-paper/10">I’m an owner</Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
