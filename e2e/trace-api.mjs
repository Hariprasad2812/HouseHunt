import { chromium } from 'playwright-core';
const BASE = 'http://localhost:5173';
const b = await chromium.launch();
const p = await b.newPage();
p.on('request', (r) => { if (r.url().endsWith(':5173/api') || r.url().includes(':5173/api?')) console.log('REQ', r.method(), r.url(), '<<from>>', r.frame().url()); });
p.on('response', (r) => { if (r.status() === 404 && r.url().includes(':5173/api')) console.log('RESP404', r.url()); });
p.on('console', (m) => {
  if (m.type() === 'error') {
    const loc = m.location();
    console.log('CONSOLEERR', m.text().slice(0, 220), '@', (loc && loc.url || '').slice(0, 90));
  }
});
// tenant session
await p.goto(BASE + '/login', { waitUntil: 'networkidle' });
await p.getByRole('button', { name: /Tenant/ }).first().click();
await p.waitForURL('**/tenant');
await p.waitForTimeout(4000);
await p.goto(BASE + '/owner', { waitUntil: 'networkidle' }).catch(() => {});
await p.waitForTimeout(2000);
// owner session
await p.goto(BASE + '/login', { waitUntil: 'networkidle' });
await p.getByRole('button', { name: /Owner/ }).first().click();
await p.waitForURL('**/owner');
await p.waitForTimeout(4000);
await p.getByRole('button', { name: /Messages/ }).first().click();
await p.waitForTimeout(3000);
await p.goto(BASE + '/admin', { waitUntil: 'networkidle' });
await p.waitForTimeout(4000);
// home (public) fresh
await p.goto(BASE + '/', { waitUntil: 'networkidle' });
await p.waitForTimeout(3000);
console.log('done');
await b.close();
