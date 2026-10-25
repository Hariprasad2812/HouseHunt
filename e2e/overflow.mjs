import { chromium } from 'playwright-core';
const BASE = 'http://localhost:5173';
const b = await chromium.launch();
const bad = [];

async function check(p, label) {
  const m = await p.evaluate(() => ({
    iw: window.innerWidth, sw: document.documentElement.scrollWidth,
    bodySw: document.body.scrollWidth,
  }));
  if (m.sw > m.iw + 1 || m.bodySw > m.iw + 1) bad.push(label + ' overflow ' + JSON.stringify(m));
  else console.log('ok  ', label);
}

async function rolePaths(label, key, paths) {
  const c = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await c.newPage();
  await p.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: new RegExp(label) }).first().click();
  await p.waitForURL('**/' + key, { timeout: 20000 });
  await p.waitForTimeout(2000);
  for (const [name, path] of paths) {
    await p.goto(BASE + '/' + key + '/' + path, { waitUntil: 'networkidle' });
    await p.waitForTimeout(2200);
    await check(p, 'm-' + key + '/' + (path || 'overview'));
  }
  await c.close();
}

await rolePaths('Tenant', 'tenant', [
  ['overview', ''], ['saved', 'saved'], ['applications', 'applications'], ['visits', 'visits'],
  ['messages', 'messages'], ['profile', 'profile'],
]);
await rolePaths('Owner', 'owner', [
  ['overview', ''], ['properties', 'properties'], ['applications', 'applications'], ['visits', 'visits'],
  ['analytics', 'analytics'], ['messages', 'messages'], ['profile', 'profile'],
]);
await rolePaths('Admin', 'admin', [
  ['overview', ''], ['listings', 'listings'], ['moderation', 'moderation'], ['users', 'users'],
  ['reports', 'reports'], ['settings', 'settings'],
]);

// mobile public pages too
const cm = await b.newContext({ viewport: { width: 390, height: 844 } });
const pm = await cm.newPage();
for (const path of ['/', '/properties', '/locations', '/explore', '/how-it-works', '/about', '/register', '/list-property', '/properties/3', '/properties/7', '/privacy']) {
  await pm.goto(BASE + path, { waitUntil: 'networkidle' }).catch(() => {});
  await pm.waitForTimeout(1200);
  await check(pm, 'm' + path);
}
await cm.close();

// desktop public pages
const cd = await b.newContext({ viewport: { width: 1440, height: 900 } });
const pd = await cd.newPage();
for (const path of ['/', '/properties', '/locations', '/explore', '/how-it-works', '/about', '/login', '/register', '/list-property', '/properties/3', '/properties/7']) {
  await pd.goto(BASE + path, { waitUntil: 'networkidle' }).catch(() => {});
  await pd.waitForTimeout(1200);
  await check(pd, 'd' + path);
}
await cd.close();
console.log(bad.length ? 'BAD: ' + bad.join(' | ') : 'no overflows anywhere');
await b.close();
process.exit(bad.length ? 2 : 0);
