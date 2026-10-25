// Editorial / marketing imagery used outside the property database.
// (Property photos are served by the API from the same Unsplash catalogue.)
const U = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=${w}`;

export const IMG = {
  hero: U('1600585154340-be6161a56a0c', 2200),
  heroFallback: U('1600585154340-be6161a56a0c', 1400),
  aboutMain: U('1512917774080-9991f1c4c750', 1800),
  authSide: U('1568605114967-8130f3a36994', 1400),
  ownerCta: U('1600596542815-ffad4c1539a9', 2000),
  listBanner: U('1613490493576-7fde63acd811', 2000),
  discover: U('1570129477492-45c003edd2be', 1800),
  interiors: U('1518780664697-55e3ad937233', 1400),
  balcony: U('1502005229762-cf1b2da7c5d6', 1400),
};
