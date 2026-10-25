import { chromium } from 'playwright-core';
const BASE='http://localhost:5173';
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1440,height:960}});
p.on('console',m=>{ if(m.type()==='error') console.log('CE',m.text().slice(0,140)); });
p.on('pageerror',e=>console.log('PAGEERR',e.message.slice(0,200)));
await p.goto(BASE+'/login',{waitUntil:'networkidle'});
await p.locator('button',{hasText:/^Tenant/}).first().click();
await p.waitForTimeout(2500);
console.log('in:',p.url());
await p.locator('button[aria-label="Sign out"]').click();
for(let i=0;i<16;i++){ await p.waitForTimeout(250); console.log('t'+(i*250)+'ms',p.url()); }
console.log('h1:', await p.locator('h1').first().textContent().catch(()=>'(none)'));
await b.close();
