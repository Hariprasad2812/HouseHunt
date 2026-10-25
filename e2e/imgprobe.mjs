import { chromium } from 'playwright-core';
const BASE = 'http://localhost:5173';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 960 } });
const dup = [];
p.on('response', async (r) => {
  if (r.request().resourceType() === 'image') {
    const url = r.url();
    if (r.status() !== 200) dup.push('IMG HTTP' + r.status() + ' ' + url.slice(0, 120));
  }
});
p.on('pageerror', (e) => dup.push('PAGEERROR ' + e.message));
p.on('console', (m) => { if (m.type() === 'error') dup.push('CE ' + m.text().slice(0, 160)); });

await p.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 45000 });
await p.waitForTimeout(3000);

const report = await p.evaluate(() => {
  const srcs = [...document.querySelectorAll('img')].map((i) => i.currentSrc || i.src).filter(Boolean);
  const photo = (u) => { const m = u.match(/photo-([\w-]+)/); return m ? m[1] : u; };
  const counts = {};
  for (const s of srcs) { const k = photo(s); counts[k] = (counts[k] || 0) + 1; }
  const byId = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return { total: srcs.length, distinct: Object.keys(counts).length, topRepeats: byId.slice(0, 10) };
});
console.log('HOMEPAGE images:', JSON.stringify(report));
const featured = await p.locator('img').evaluateAll((imgs) => imgs.map((i) => (i.currentSrc || i.src).match(/photo-([\w-]+)/)?.[1]).filter(Boolean));
console.log('featured-region imgs (whole page):', featured.length, 'unique', new Set(featured).size);
await p.screenshot({ path: '/home/user/e2e/shots/home.png' });
// full page too
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await p.waitForTimeout(2500);
const srcs2 = await p.evaluate(() => [...document.querySelectorAll('img')].map((i) => (i.currentSrc || i.src).match(/photo-([\w-]+)/)?.[1]).filter(Boolean));
const c2 = {};
for (const s of srcs2) c2[s] = (c2[s] || 0) + 1;
const top2 = Object.entries(c2).sort((a, b) => b[1] - a[1]).slice(0, 8);
console.log('FULL-PAGE repeats:', JSON.stringify(top2));
await p.screenshot({ path: '/home/user/e2e/shots/home-bottom.png' });

// properties page grid
await p.goto(BASE + '/properties', { waitUntil: 'networkidle', timeout: 45000 });
await p.waitForTimeout(2000);
const grid = await p.evaluate(() => [...document.querySelectorAll('img')].map((i) => (i.currentSrc || i.src).match(/photo-([\w-]+)/)?.[1]).filter(Boolean));
const cg = {}; for (const s of grid) cg[s] = (cg[s] || 0) + 1;
console.log('RESULTS grid: cards-imgs', grid.length, 'unique', new Set(grid).size, 'repeats', Object.entries(cg).sort((a,b)=>b[1]-a[1]).slice(0,5));

// locations
await p.goto(BASE + '/locations', { waitUntil: 'networkidle', timeout: 45000 });
await p.waitForTimeout(1500);
console.log('IMAGE ERRORS / console:', dup.length ? dup.slice(0, 12) : 'NONE');
await b.close();
