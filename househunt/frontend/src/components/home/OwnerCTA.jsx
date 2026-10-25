import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { IMG } from '../../lib/assets';
import { Reveal } from '../ui';

export default function OwnerCTA() {
  return (
    <section className="relative overflow-hidden bg-ink text-paper">
      <img src={IMG.ownerCta} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
      <div className="relative mx-auto max-w-shell px-5 py-28 lg:px-8 lg:py-36">
        <div className="max-w-2xl">
          <Reveal>
            <p className="u-eyebrow mb-5 text-clay-soft">For owners</p>
            <h2 className="u-serif text-[clamp(2.3rem,5vw,4rem)] leading-[1.02]">
              Have a property <br />to rent?
            </h2>
            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-paper/70">
              Reach people actively looking for their next home. List once, get verified quickly and
              receive quality applications — no spam, no fake calls.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/list-property"
                className="group inline-flex h-[54px] items-center gap-3 rounded-[3px] bg-clay px-9 text-[15px] font-semibold text-white transition-colors hover:bg-clay-deep"
              >
                List your property
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link to="/how-it-works" className="text-sm font-medium text-paper/80 underline-offset-4 hover:underline">
                How verification works
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
