import { motion } from 'framer-motion';
import Hero from '../components/home/Hero';
import FeaturedHomes from '../components/home/FeaturedHomes';
import Trust from '../components/home/Trust';
import HowItWorksSection from '../components/home/HowItWorks';
import NeighbourhoodGrid from '../components/NeighbourhoodGrid';
import ExploreMap from '../components/home/ExploreMap';
import OwnerCTA from '../components/home/OwnerCTA';

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Hero />

      {/* trusted-by strip */}
      <section className="border-b border-black/[0.07] bg-white">
        <div className="mx-auto flex max-w-shell flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-6 text-[12px] font-semibold uppercase tracking-wide2 text-stone-light lg:px-8">
          <span className="text-clay">Trusted by renters moving to</span>
          <span>· Koramangala</span><span>· Indiranagar</span><span>· HSR Layout</span><span>· Whitefield</span><span>· Bellandur</span><span className="hidden sm:inline">· &amp; beyond</span>
        </div>
      </section>

      <FeaturedHomes />
      <Trust />
      <HowItWorksSection />
      <div className="mx-auto max-w-shell px-5 py-24 lg:px-8 lg:py-32"><NeighbourhoodGrid /></div>
      <ExploreMap />
      <OwnerCTA />
    </motion.div>
  );
}
