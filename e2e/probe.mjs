import { chromium } from 'playwright-core';
const BASE = 'http://localhost:5173';
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: 390, height: 844 } });
const p = await c.newPage();
await p.goto(BASE + '/login', { waitUntil: 'networkidle' });
await p.getByRole('button', { name: 'Tenant' }).first().click();
await p.waitForURL('**/tenant');
await p.waitForTimeout(2200);
const out = await p.evaluate(() => {
  const vw = window.innerWidth;
  const bad = [];
  document.querySelectorAll('*').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.right > vw + 1) {
      const cls = (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className) || '';
      bad.push({ tag: el.tagName, cls: String(cls).slice(0, 90), right: Math.round(r.right), w: Math.round(r.width), text: (el.textContent || '').trim().slice(0, 40) });
    }
  });
  // collapse duplicates by tag+cls
  const seen = new Map();
  for (const x of bad) { const k = x.tag + '|' + x.cls; if (!seen.has(k)) seen.set(k, x); }
  return [...seen.values()].slice(0, 25);
});
console.log(JSON.stringify(out, null, 1));
await b.close();
