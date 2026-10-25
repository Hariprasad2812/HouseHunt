// Contextual "nearby" hints shown on a property page. These are editorial
// guides by neighbourhood (walk/min or drive) rather than live POI queries.
export const NEARBY = {
  indiranagar: [
    { name: 'Metro · Indiranagar (Purple Line)', drive: '2 min', walk: '8 min' },
    { name: '100 Feet Road cafés & restaurants', drive: '3 min', walk: '10 min' },
    { name: 'Commercial Street & MG Road', drive: '12 min' },
    { name: 'Bengaluru International Airport', drive: '55 min' },
  ],
  koramangala: [
    { name: 'Metro · Koramangala (future Yellow Line)', drive: '4 min' },
    { name: 'Forum Mall & Sony World Junction', drive: '5 min', walk: '12 min' },
    { name: 'Many of Bengaluru’s best restaurants', drive: '3 min', walk: '8 min' },
    { name: 'Bengaluru International Airport', drive: '58 min' },
  ],
  'hsr-layout': [
    { name: 'HSR 27th Main cafés', drive: '2 min', walk: '7 min' },
    { name: 'Agara Lake walking trail', drive: '6 min', walk: '15 min' },
    { name: 'Sarjapur Road tech offices', drive: '12 min' },
    { name: 'Bengaluru International Airport', drive: '62 min' },
  ],
  whitefield: [
    { name: 'ITPL & International Tech Park', drive: '4 min' },
    { name: 'Whitefield Main Road market', drive: '6 min' },
    { name: 'Nallurhalli lake', drive: '8 min' },
    { name: 'Kadugodi metro (Purple Line)', drive: '10 min' },
  ],
  bellandur: [
    { name: 'Outer Ring Road offices', drive: '3 min' },
    { name: 'Sarjapur Road & HSR', drive: '8 min' },
    { name: 'Bellandur lake promenade', drive: '5 min' },
    { name: 'Bengaluru International Airport', drive: '55 min' },
  ],
  'electronic-city': [
    { name: 'Infosys / Wipro campus gates', drive: '2 min', walk: '6 min' },
    { name: 'Electronic City Phase 1 & 2 connector', drive: '5 min' },
    { name: 'Bommasandra metro (Yellow Line)', drive: '8 min' },
    { name: 'Central Bengaluru (MG Road)', drive: '45 min' },
  ],
  jayanagar: [
    { name: 'Metro · Jayanagar (Green Line)', drive: '3 min', walk: '9 min' },
    { name: 'Jayanagar 4th Block park', drive: '2 min', walk: '6 min' },
    { name: 'South End Circle & RV Road', drive: '6 min' },
    { name: 'Bengaluru International Airport', drive: '60 min' },
  ],
  'jp-nagar': [
    { name: 'Metro · JP Nagar (Green Line)', drive: '2 min', walk: '6 min' },
    { name: '24th Main / 100 ft Road market', drive: '4 min' },
    { name: 'Jayanagar & South End', drive: '10 min' },
    { name: 'Bengaluru International Airport', drive: '62 min' },
  ],
  yelahanka: [
    { name: 'Hebbal & Manyata Tech Park', drive: '15 min' },
    { name: 'Yelahanka New Town market', drive: '5 min' },
    { name: 'Nitte Meenakshi campus', drive: '6 min' },
    { name: 'Bengaluru International Airport', drive: '25 min' },
  ],
  hebbal: [
    { name: 'Manyata Tech Park', drive: '3 min' },
    { name: 'Hebbal lake & flyover district', drive: '2 min', walk: '8 min' },
    { name: 'Metro · Hebbal (Blue Line, upcoming)', drive: '5 min' },
    { name: 'Bengaluru International Airport', drive: '35 min' },
  ],
};

export const nearFor = (slug) => NEARBY[slug] || NEARBY.indiranagar;
