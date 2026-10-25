import { chromium } from 'playwright-core';
const BASE = 'http://localhost:5173';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 960 } });
await p.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 45000 });
await p.waitForTimeout(3000);
const out = await p.evaluate(() => {
  const rows = [];
  document.querySelectorAll('img').forEach((img) => {
    const m = (img.currentSrc || img.src).match(/photo-([\w-]+)/);
    if (!m) return;
    let node = img;
    const stack = [];
    for (let i = 0; i < 5 && node.parentElement; i++) {
      node = node.parentElement;
      const cls = (typeof node.className === 'string' ? node.className : '').slice(0, 70);
      stack.push(cls || node.tagName);
    }
    rows.push({ id: m[1].slice(0, 13), w: img.width, h: img.height, cls: stack[2] || '', stack: stack.join(' < ') });
  });
  return rows;
});
const counts = {};
out.forEach((r) => { counts[r.id] = (counts[r.id] || 0) + 1; });
console.log('repeated (same photo >1 on page):');
Object.entries(counts).filter(([, v]) => v > 1).forEach(([id, v]) => {
  const rows = out.filter((r) => r.id === id);
  console.log('\n', id, 'x' + v);
  rows.forEach((r) => console.log('   ', r.w + 'x' + r.h, '|', r.stack));
});
await b.close();
