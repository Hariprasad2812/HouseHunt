import { chromium } from 'playwright-core';

const BASE = 'http://localhost:5173';
const errors = [];
const consoleLogs = [];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('console', (m) => {
  const t = m.type();
  if (t === 'error') consoleLogs.push('CONSOLE ' + m.text().slice(0, 300));
});
page.on('requestfailed', (r) => consoleLogs.push('REQFAIL ' + r.url().slice(0, 150) + ' ' + (r.failure()?.errorText || '')));
page.on('response', (r) => {
  const st = r.status();
  const t = r.request().resourceType();
  if (st >= 500) consoleLogs.push('HTTP' + st + ' ' + r.url().slice(0, 160));
  else if (st >= 400 && ['fetch', 'xhr', 'document', 'script', 'stylesheet'].includes(t)) consoleLogs.push('HTTP' + st + '(' + t + ') ' + r.url().slice(0, 160));
});

async function nav(path, name, waitFor) {
  try {
    await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 });
    if (waitFor) await page.waitForSelector(waitFor, { timeout: 15000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: '/home/user/e2e/shots/' + name + '.png', fullPage: false });
    console.log('OK   ', path);
  } catch (e) {
    errors.push('NAVFAIL ' + path + ': ' + e.message.split('\n')[0]);
    console.log('FAIL ', path, e.message.split('\n')[0]);
  }
}

const scrollBottom = async () => {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(900);
};

// Public pages
await nav('/', 'home');
await scrollBottom();
await page.screenshot({ path: '/home/user/e2e/shots/home-bottom.png' });
await nav('/properties', 'properties');
await page.waitForSelector('a[href^="/properties/"]', { timeout: 20000 }).catch(()=>{});
await nav('/locations', 'locations', 'text=Indiranagar');
await nav('/explore', 'explore', 'text=Apartments');
await nav('/how-it-works', 'how-it-works');
await nav('/about', 'about', 'text=About HouseHunt');
await nav('/properties/1', 'property-detail', 'text=Schedule');
await page.screenshot({ path: '/home/user/e2e/shots/property-detail-full.png', fullPage: true });
await nav('/privacy', 'legal', 'text=Privacy policy');

// tenant login -> dashboard
await nav('/login', 'login', 'text=Demo accounts');
await page.screenshot({ path: '/home/user/e2e/shots/login.png' });
// click the tenant demo button
await page.getByRole('button', { name: /Tenant/ }).first().click();
await page.waitForURL('**/tenant', { timeout: 20000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: '/home/user/e2e/shots/tenant-dash.png', fullPage: true });

async function clickNav(label) {
  await page.getByRole('button', { name: label, exact: false }).first().click();
  await page.waitForTimeout(2200);
}

await clickNav('Saved homes');
await page.screenshot({ path: '/home/user/e2e/shots/tenant-saved.png' });
await clickNav('Applications');
await page.screenshot({ path: '/home/user/e2e/shots/tenant-apps.png' });
await clickNav('Visits');
await page.screenshot({ path: '/home/user/e2e/shots/tenant-visits.png' });
await clickNav('Messages');
await page.screenshot({ path: '/home/user/e2e/shots/tenant-messages.png' });
await clickNav('Profile & settings');
await page.screenshot({ path: '/home/user/e2e/shots/tenant-profile.png' });

// owner login
await page.getByRole('button', { name: /Sign out/ }).click();
await page.waitForURL('**/', { timeout: 15000 });
await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.getByRole('button', { name: /Owner/ }).first().click();
await page.waitForURL('**/owner', { timeout: 20000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: '/home/user/e2e/shots/owner-dash.png', fullPage: true });
await clickNav('Properties');
await page.screenshot({ path: '/home/user/e2e/shots/owner-properties.png', fullPage: true });
await clickNav('Applications');
await page.screenshot({ path: '/home/user/e2e/shots/owner-applications.png' });
await clickNav('Viewing requests');
await page.screenshot({ path: '/home/user/e2e/shots/owner-visits.png' });
await clickNav('Analytics');
await page.waitForTimeout(3000);
await page.screenshot({ path: '/home/user/e2e/shots/owner-analytics.png', fullPage: true });

// admin login
await page.getByRole('button', { name: /Sign out/ }).click();
await page.waitForURL('**/', { timeout: 15000 });
await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.getByRole('button', { name: /Admin/ }).first().click();
await page.waitForURL('**/admin', { timeout: 20000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: '/home/user/e2e/shots/admin-dash.png', fullPage: true });
await clickNav('Listings');
await page.screenshot({ path: '/home/user/e2e/shots/admin-listings.png', fullPage: true });
await clickNav('Verification');
await page.screenshot({ path: '/home/user/e2e/shots/admin-moderation.png', fullPage: true });
await clickNav('Users');
await page.screenshot({ path: '/home/user/e2e/shots/admin-users.png', fullPage: true });
await clickNav('Reports & reviews');
await page.waitForTimeout(1500);
await page.screenshot({ path: '/home/user/e2e/shots/admin-reports.png', fullPage: true });

// mobile checks
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
mob.on('pageerror', (e) => errors.push('MOB PAGEERROR: ' + e.message));
mob.on('console', (m) => { if (m.type() === 'error') consoleLogs.push('MOB ' + m.text().slice(0, 200)); });
await mob.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 45000 });
await mob.waitForTimeout(1500);
await mob.screenshot({ path: '/home/user/e2e/shots/m-home.png' });
const w = await mob.evaluate(() => ({ sw: window.innerWidth, scroll: document.documentElement.scrollWidth }));
if (w.scroll > w.sw + 1) errors.push('MOBILE HORIZONTAL OVERFLOW home: ' + JSON.stringify(w));
await mob.goto(BASE + '/properties', { waitUntil: 'networkidle', timeout: 45000 });
await mob.waitForTimeout(1500);
const w2 = await mob.evaluate(() => ({ sw: window.innerWidth, scroll: document.documentElement.scrollWidth }));
if (w2.scroll > w2.sw + 1) errors.push('MOBILE HORIZONTAL OVERFLOW properties: ' + JSON.stringify(w2));
await mob.screenshot({ path: '/home/user/e2e/shots/m-properties.png' });
await mob.goto(BASE + '/properties/2', { waitUntil: 'networkidle', timeout: 45000 });
await mob.waitForTimeout(1500);
const w3 = await mob.evaluate(() => ({ sw: window.innerWidth, scroll: document.documentElement.scrollWidth }));
if (w3.scroll > w3.sw + 1) errors.push('MOBILE HORIZONTAL OVERFLOW detail: ' + JSON.stringify(w3));
await mob.screenshot({ path: '/home/user/e2e/shots/m-detail.png' });
// open mobile menu
await mob.goto(BASE + '/about', { waitUntil: 'networkidle', timeout: 45000 });
await mob.waitForTimeout(1000);
await mob.getByRole('button', { name: /Menu/i }).first().click();
await mob.waitForTimeout(700);
await mob.screenshot({ path: '/home/user/e2e/shots/m-menu.png' });
await mob.close();

// 404 route
await nav('/nope-not-a-page', 'notfound', 'text=404');
await page.close();

console.log('\n==== console/page errors (' + consoleLogs.length + ') ====');
const seen = new Set();
for (const e of consoleLogs) { if (!seen.has(e)) { seen.add(e); console.log(e); } }
console.log('\n==== hard errors (' + errors.length + ') ====');
for (const e of errors) console.log(e);
await browser.close();
process.exit(errors.length || consoleLogs.some((c) => c.startsWith('PAGEERROR') || c.startsWith('HTTP5')) ? 2 : 0);
