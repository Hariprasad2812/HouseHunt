import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, MoveRight } from 'lucide-react';
import { api } from '../../lib/api';
import { atWidth } from '../../lib/img';
import { inr, typeLabel } from '../../lib/format';
import { BLR } from '../../lib/constants';
import { Skeleton, SectionHead } from '../ui';

const fmt = (rent) => {
  if (rent >= 100000) return `₹${(rent / 100000).toFixed(1)}L`;
  return `₹${Math.round(rent / 1000)}k`;
};

function Fly({ to }) {
  const map = useMap();
  const [prev, setPrev] = useState(null);
  useEffect(() => {
    if (to && to !== prev) {
      map.flyTo([to.lat, to.lng], Math.max(map.getZoom(), 13.1), { duration: 0.9 });
      setPrev(to);
    }
  }, [to, prev, map]);
  return null;
}

export default function ExploreMap({ properties: injected, defaultCenter }) {
  const [props, setProps] = useState(injected || null);
  const [active, setActive] = useState(null);
  const [hover, setHover] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (injected) return;
    api.get('/properties', { size: 30 }).then((r) => setProps(r.content)).catch(() => setProps([]));
  }, [injected]);

  useEffect(() => {
    if (injected) setProps(injected);
  }, [injected]);

  const center = defaultCenter || BLR;
  const activeItem = props?.find((p) => p.id === active) || null;

  const list = useMemo(() => (props || []).slice(0, 14), [props]);

  return (
    <section className="bg-[#221f18] py-24 lg:py-32">
      <div className="mx-auto max-w-shell px-5 lg:px-8">
        <SectionHead
          light
          eyebrow="Live listings"
          title="See where the homes are."
          lede="Every dot is a verified, available home. Select one to preview it — then take the listing for a closer look."
        />
      </div>

      <div className="mx-auto mt-12 max-w-shell px-0 lg:px-8">
        <div className="overflow-hidden bg-white lg:grid lg:grid-cols-[1.15fr_1fr]">
          {/* map */}
          <div className="relative h-[440px] w-full lg:h-[560px]">
            {!props ? (
              <Skeleton className="h-full w-full rounded-none" />
            ) : (
              <MapContainer
                ref={mapRef}
                center={[center.lat, center.lng]}
                zoom={center.zoom || 11.2}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', background: '#e7e1d4' }}
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Fly to={activeItem ? { lat: activeItem.lat, lng: activeItem.lng } : null} />
                {props.map((p) => {
                  const k = String(p.id);
                  const isOn = p.id === active || p.id === hover;
                  const icon = L.divIcon({
                    className: '',
                    html: `<button class="hh-marker ${isOn ? 'active' : ''}" data-id="${p.id}" style="white-space:nowrap">${isOn ? fmt(p.rentPerMonth) : '·'}</button>`,
                    iconSize: [36, 36],
                    iconAnchor: [18, 18],
                  });
                  return (
                    <Marker
                      key={k}
                      position={[p.lat, p.lng]}
                      icon={icon}
                      eventHandlers={{
                        click: () => setActive(p.id),
                        mouseover: () => setHover(p.id),
                        mouseout: () => setHover(null),
                      }}
                    />
                  );
                })}
              </MapContainer>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[500] flex justify-center">
              <span className="rounded-full bg-ink/90 px-4 py-1.5 text-[11px] font-medium text-paper backdrop-blur">
                Select a marker — or hover a listing on the right
              </span>
            </div>
          </div>

          {/* right: previews */}
          <div className="flex flex-col border-t border-black/10 lg:border-l lg:border-t-0">
            <div className="no-scrollbar flex-1 overflow-y-auto" style={{ maxHeight: '560px' }}>
              {!list.length ? (
                <div className="p-8 text-sm text-stone">Loading homes for the map…</div>
              ) : (
                list.map((p) => (
                  <Link
                    key={p.id}
                    to={`/properties/${p.id}`}
                    onMouseEnter={() => { setHover(p.id); setActive(p.id); }}
                    className={`flex items-center gap-4 border-b border-black/[0.07] p-4 transition-colors ${active === p.id ? 'bg-clay-tint' : 'hover:bg-paper'}`}
                  >
                    <span className="relative block h-16 w-24 shrink-0 overflow-hidden bg-sand">
                      <img src={atWidth(p.coverImage, 400)} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-clay">
                        <MapPin size={10} /> {p.locationName}
                      </span>
                      <span className="mt-0.5 block truncate text-[13.5px] font-semibold text-ink">{p.title}</span>
                      <span className="mt-1 block text-[12px] text-stone">
                        {typeLabel(p.type)} · {p.bedrooms} bd · {p.bathrooms} ba
                      </span>
                    </span>
                    <span className="u-serif text-[17px] text-ink">{inr(p.rentPerMonth)}<span className="text-[11px]">/mo</span></span>
                  </Link>
                ))
              )}
            </div>
            <div className="flex items-center justify-between border-t border-black/10 bg-paper px-5 py-4">
              <span className="text-[13px] text-stone">{list.length} homes on the map</span>
              <Link to="/properties" className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink">
                Browse all <MoveRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
