import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="grid min-h-[80vh] place-items-center bg-paper px-5 pt-[68px]">
      <div className="text-center">
        <p className="u-serif text-[7rem] leading-none text-sand sm:text-[10rem]">404</p>
        <h1 className="u-serif -mt-4 text-3xl text-ink sm:text-4xl">This street doesn't exist.</h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-stone">
          The page you're after may have been moved, or the listing was rented out and taken down.
          Either way, the rest of Bengaluru is still here.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/properties" className="inline-flex h-12 items-center gap-2 rounded-[3px] bg-ink px-7 text-sm font-semibold text-paper hover:bg-coal">
            Browse homes
          </Link>
          <Link to="/" className="inline-flex h-12 items-center gap-2 rounded-[3px] border border-black/20 px-7 text-sm font-semibold hover:border-ink">
            <ArrowLeft size={15} /> Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
