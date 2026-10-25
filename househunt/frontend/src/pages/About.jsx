import { Link } from 'react-router-dom';
import { MapPin, Mail, Clock3, Coffee } from 'lucide-react';
import { IMG } from '../lib/assets';
import { Reveal } from '../components/ui';

const VALUES = [
  { n: '01', t: 'We walk the homes', b: 'Every listing is either visited or photographed by someone on our team. If a flat’s "huge balcony" turns out to be a ledge, we say so.' },
  { n: '02', t: 'We price like renters', b: 'We publish the rent, deposit and maintenance a landlord actually asks for — not the "starting from" number that vanishes on the phone.' },
  { n: '03', t: 'We favour calm', b: 'Fast-moving product design hides nothing and shouts nothing. The interface is quiet because the decision is already big enough.' },
];

const DIFF = [
  ['Photos from site visits', 'No developer renders.'],
  ['Owners answer directly', 'You see who owns the home.'],
  ['Rent & deposit upfront', 'Compare honestly.'],
  ['Visits on your schedule', 'In person or video call.'],
];

export default function About() {
  return (
    <div className="bg-paper pt-[68px]">
      <section className="mx-auto max-w-shell px-5 pt-16 lg:px-8 lg:pt-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="u-eyebrow mb-4">About HouseHunt</p>
            <h1 className="u-serif text-[clamp(2.3rem,4.6vw,4rem)] leading-[1.02] text-ink">
              A Bangalore rental market <span className="italic text-clay">people can trust.</span>
            </h1>
            <div className="mt-7 space-y-4 text-[15px] leading-relaxed text-stone">
              <p>
                HouseHunt started in 2021, in a Koramangala flat with a broken geyser and a landlord
                who answered every call. We kept asking a simple question: why is finding a home in
                this city — with its 14 million people and world-class energy — still such a lottery?
              </p>
              <p>
                So we built a rental platform the way serious products get built: verified listings
                instead of reposted screenshots, real photos instead of builder renders, and owners
                who actually answer. Today HouseHunt helps people find homes across ten
                neighbourhoods — from Indiranagar's garden lanes to the tech corridors of Whitefield
                and Electronic City.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="grid grid-cols-2 gap-3">
              <img src={IMG.aboutMain} alt="Bengaluru home" className="col-span-2 aspect-[16/10] w-full rounded-[4px] object-cover" loading="lazy" />
              <img src={IMG.interiors} alt="" className="aspect-square w-full rounded-[4px] object-cover" loading="lazy" />
              <img src={IMG.balcony} alt="" className="aspect-square w-full rounded-[4px] object-cover" loading="lazy" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* numbers strip */}
      <section className="mt-20 border-y border-black/[0.08] bg-[#221f18]">
        <div className="mx-auto grid max-w-shell grid-cols-2 gap-y-10 px-5 py-14 text-paper sm:grid-cols-4 lg:px-8">
          {[['10', 'neighbourhoods'], ['23+', 'live listings'], ['0', 'brokerage charged'], ['3 min', 'avg. first reply']].map(([n, l]) => (
            <Reveal key={l} className="text-center">
              <p className="u-serif text-5xl text-clay-soft">{n}</p>
              <p className="mt-2 text-[12px] font-semibold uppercase tracking-wider text-paper/50">{l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-shell px-5 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="u-eyebrow mb-3">What guides us</p>
            <h2 className="u-serif text-3xl text-ink">Design is trust.</h2>
            <p className="mt-3 max-w-md text-[15px] text-stone">Three principles sit under everything we ship:</p>
            <div className="mt-8 space-y-8">
              {VALUES.map((v) => (
                <div key={v.n} className="grid grid-cols-[44px_1fr] gap-4">
                  <span className="u-serif text-2xl text-clay">{v.n}</span>
                  <div>
                    <h3 className="font-semibold text-ink">{v.t}</h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-stone">{v.b}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="border-l border-black/10 pl-8">
              <p className="u-eyebrow mb-3">How we differ</p>
              <h2 className="u-serif text-3xl text-ink">The small things that add up.</h2>
              <ul className="mt-8 space-y-4">
                {DIFF.map(([a, b]) => (
                  <li key={a} className="flex items-baseline gap-3 text-[15px]">
                    <span className="h-px w-5 shrink-0 translate-y-[-4px] bg-clay" />
                    <div><span className="font-semibold text-ink">{a}</span><span className="text-stone"> — {b}</span></div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* contact */}
      <section id="contact" className="border-t border-black/[0.07] bg-white py-20">
        <div className="mx-auto grid max-w-shell gap-10 px-5 lg:grid-cols-3 lg:px-8">
          <Reveal>
            <h2 className="u-serif text-3xl text-ink">Talk to a human.</h2>
            <p className="mt-3 max-w-sm text-[15px] text-stone">Support, partnerships or press — we answer like landlords should.</p>
            <Link to="mailto:hello@househunt.in" className="u-linkline mt-6 inline-flex items-center gap-2 font-semibold text-ink">
              <Mail size={16} /> hello@househunt.in
            </Link>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="flex items-start gap-4">
              <MapPin className="mt-1 text-clay" size={18} />
              <div>
                <h3 className="font-semibold text-ink">The office</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-stone">12th Main Road, Indiranagar<br />Bengaluru 560008, Karnataka</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="flex items-start gap-4">
              <Clock3 className="mt-1 text-clay" size={18} />
              <div>
                <h3 className="font-semibold text-ink">Reach us</h3>
                <p className="mt-1 flex items-center gap-2 text-[14px] text-stone"><Coffee size={14} /> Mon–Sat, 9:30am – 7:30pm</p>
                <p className="mt-1 text-[13px] text-stone-light">Visits to listings run all week.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
