import { chromium } from 'playwright-core';
const BASE = 'http://localhost:5173';
const b = await chromium.launch();
async function loginAs(label, thenNav) {
  const c = await b.newContext();
  const p = await c.newPage();
  p.on('request', (r) => { if (r.url().includes(':5173/api') && !/^\/api\/[a-zA-Z]/.test(new URL(r.url()).pathname.replace('/api','/'))) console.log('ROOTAPI REQ', r.url(), '<<from>>', r.frame().url()); });
  p.on('request', (r) => { const path = new URL(r.url()).pathname; if (path === '/api') console.log('ROOTAPI REQ', r.method(), 'from', r.frame().url()); });
  p.on('response', (r) => { if (new URL(r.url()).pathname === '/api') console.log('ROOTAPI RESP', r.status()); });
  p.on('console', (m) => { if (m.type() === 'error') console.log('CE', m.text().slice(0, 160), '@', (m.location()?.url || '').slice(0, 80)); });
  await p.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: new RegExp(label) }).first().click();
  await p.waitForURL('**/' + { Tenant: 'tenant', Owner: 'owner', Admin: 'admin' }[label], { timeout: 20000 });
  await p.waitForTimeout(3500);
  await thenNav?.(p);
  await p.waitForTimeout(2500);
  await c.close();
}
await loginAs('Tenant');
await loginAs('Owner', async (p) => { await p.getByRole('button', { name: /Messages/ }).first().click(); await p.waitForTimeout(2500); });
await loginAs('Admin', async (p) => { await p.getByRole('button', { name: /Reports & reviews/ }).first().click(); await p.waitForTimeout(2000); });
const c2 = await b.newContext();
const p2 = await c2.newPage();
p2.on('request', (r) => { if (new URL(r.url()).pathname === '/api') console.log('ROOTAPI REQ from', r.frame().url()); });
p2.on('response', (r) => { if (new URL(r.url()).pathname === '/api') console.log('ROOTAPI RESP', r.status()); });
for (const path of ['/', '/properties', '/locations', '/list-property']) { await p2.goto(BASE + path, { waitUntil: 'networkidle' }); await p2.waitForTimeout(1800); }
console.log('trace done');
await b.close();
