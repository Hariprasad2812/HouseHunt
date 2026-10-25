import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { IMG } from '../../lib/assets';
import { Wordmark } from '../brand';

const POINTS = [
  'Verified owners & real photos',
  'Free to browse, apply and visit',
  'Rent, deposit & maintenance shown upfront',
];

export default function AuthFrame({ children, subtitle }) {
  return (
    <div className="min-h-screen bg-paper pt-[68px]">
      <div className="mx-auto grid min-h-[calc(100vh-68px)] max-w-[1400px] lg:grid-cols-2">
        {/* left: editorial panel */}
        <div className="relative hidden overflow-hidden bg-coal lg:block">
          <img src={IMG.authSide} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171512] via-[#171512]/55 to-transparent" />
          <div className="relative flex h-full flex-col justify-end p-12">
            <Wordmark light />
            <blockquote className="mt-auto max-w-md">
              <p className="u-serif text-[1.9rem] leading-[1.18] text-paper">
                “We shortlisted six homes on HouseHunt on a Sunday and signed the agreement by Friday.”
              </p>
              <footer className="mt-6">
                <p className="text-sm font-semibold text-paper">Ananya & Dev</p>
                <p className="text-[13px] text-paper/55">Moved to a 2BHK in HSR Layout · 2025</p>
              </footer>
            </blockquote>
            <ul className="mt-10 space-y-2.5 border-t border-paper/15 pt-6">
              {POINTS.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-[13.5px] text-paper/80">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-clay/25 text-clay-soft"><Check size={12} strokeWidth={3} /></span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* right: form */}
        <div className="flex items-start justify-center px-5 py-14 lg:items-center lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[440px]"
          >
            <div className="lg:hidden"><Wordmark /></div>
            <h1 className="u-serif mt-8 text-4xl text-ink lg:mt-0">{subtitle}</h1>
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
