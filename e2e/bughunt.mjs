import { chromium } from 'playwright-core';
const BASE = 'http://localhost:5173';
const issues = [];
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 1440, height: 960 } });
const p = await c.newPage();
p.on('pageerror', (e) => issues.push('PAGEERROR: ' + e.message));
p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') issues.push('CONSOLE ' + m.type().toUpperCase() + ': ' + m.text().slice(0, 220)); });
p.on('requestfailed', (r) => issues.push('REQFAIL: ' + r.url().slice(0, 140) + ' ' + (r.failure()?.errorText || '')));
p.on('response', (r) => { if (r.status() >= 400 && r.request().resourceType() !== 'image') issues.push('HTTP' + r.status() + ': ' + r.url().slice(0, 150)); });

const step = async (name, fn) => {
  try { await fn(); console.log('ok  ', name); }
  catch (e) { issues.push('STEPFAIL ' + name + ': ' + e.message.split('\n')[0]); console.log('FAIL', name); }
};

// Home: hero search flows
await p.goto(BASE + '/', { waitUntil: 'networkidle' });
await step('hero: type in location & search', async () => {
  await p.getByPlaceholder('Search by area…').click();
  await p.getByPlaceholder('Search by area…').fill('indra');
  await p.waitForTimeout(500);
  await p.locator('text=Indiranagar').first().click();
  await p.getByRole('button', { name: /Search homes/ }).last().click();
  await p.waitForURL('**/properties?**', { timeout: 15000 });
});
await step('properties: apply filters', async () => {
  await p.waitForTimeout(1200);
  // budget select inside filter drawer/panel
  const selects = p.locator('select');
  const count = await selects.count();
  for (let i = 0; i < count; i++) {
    const val = await selects.nth(i).inputValue().catch(() => null);
  }
});
await step('properties: pagination', async () => {
  const pageBtns = p.locator('button', { hasText: /^\d+$/ });
  if (await pageBtns.count() > 1) { await pageBtns.last().click(); await p.waitForTimeout(1800); }
});

// Detail interactions
await p.goto(BASE + '/properties/1', { waitUntil: 'networkidle' });
await step('detail: gallery arrows', async () => {
  await p.waitForTimeout(1000);
  const next = p.getByRole('button', { name: /next|Next|>/i }).first();
  const all = p.locator('button');
  for (let i = 0; i < all.count(); i++) {
    const label = await all.nth(i).getAttribute('aria-label').catch(() => null);
    if (label && /next/i.test(label)) { await all.nth(i).click(); break; }
  }
  await p.waitForTimeout(600);
});
await step('detail: open fullscreen gallery', async () => {
  const fs = p.locator('button[aria-label*="fullscreen" i], button[aria-label*="Fullscreen" i]').first();
  const all = p.locator('button');
  for (let i = 0; i < all.count(); i++) {
    const label = (await all.nth(i).getAttribute('aria-label').catch(() => '')) || '';
    if (/full|expand/i.test(label)) { await all.nth(i).click(); break; }
  }
  await p.waitForTimeout(700);
  const modalVisible = await p.locator('[role="dialog"], .fixed').count();
  await p.keyboard.press('Escape');
  await p.waitForTimeout(500);
  console.log('   modalElementsAtFull:', modalVisible);
});
await step('detail: unauth schedule-visit gate', async () => {
  await p.getByRole('button', { name: /Schedule a visit/ }).first().click();
  await p.waitForTimeout(800);
  const dialogs = await p.locator('.fixed.inset-0, [role="dialog"]').count();
  console.log('   gate modal open:', dialogs > 0);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
});
await step('detail: similar section cards visible', async () => {
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(2500);
  const cards = await p.locator('a[href^="/properties/"]').count();
  console.log('   links at bottom:', cards);
});

// Locations
await p.goto(BASE + '/locations', { waitUntil: 'networkidle' });
await step('locations: open details notes', async () => {
  await p.locator('details').first().click().catch(() => {});
  await p.waitForTimeout(300);
});

// Auth flow: register an account
await p.goto(BASE + '/register', { waitUntil: 'networkidle' });
await step('register: create fresh tenant', async () => {
  await p.getByRole('button', { name: /Tenant/ }).first().click();
  const uniq = 'qa' + Date.now().toString().slice(-8);
  await p.locator('input[name="fullName"], input[placeholder*="name" i]').first().fill('QA Tester');
  await p.locator('input[placeholder*="email" i], input[name="email"]').first().fill(uniq + '@qa.in');
  await p.locator('input[placeholder*="phone" i], input[name="phone"]').first().fill('+91 98765 43210');
  await p.locator('input[type="password"]').first().fill('HouseHunt@123');
  await p.getByRole('button', { name: /create account|register|sign up/i }).first().click();
  await p.waitForTimeout(2500);
  console.log('   url after register:', p.url());
  console.log('   register outcome errors:', issues.filter((i) => i.includes('HTTP') || i.includes('PAGE')).length ? 'see list' : 'clean');
});
await b.close();
console.log('\n==== ISSUES (' + issues.length + ') ====');
const seen = new Set();
for (const i of issues) { if (!seen.has(i)) { seen.add(i); console.log(i.slice(0, 240)); } }
process.exit(issues.length ? 2 : 0);
