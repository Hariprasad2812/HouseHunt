import { chromium } from 'playwright-core';
const BASE='http://localhost:5173';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:960}});
const p=await c.newPage();
const url=()=>p.url().replace('http://localhost:5173','');
// login admin
await p.goto(BASE+'/login',{waitUntil:'networkidle'});
await p.locator('button',{hasText:/^Admin/}).first().click();
await p.waitForTimeout(4000);
console.log('1 admin in:',url());
// Admin visiting /tenant (role guard) should bounce to /admin
await p.goto(BASE+'/tenant',{waitUntil:'networkidle'});
await p.waitForTimeout(2000);
console.log('2 admin @ /tenant ->',url());
// public-only: admin visiting /login should bounce to /admin
await p.goto(BASE+'/login',{waitUntil:'networkidle'});
await p.waitForTimeout(2200);
console.log('3 admin @ /login ->',url());
// deep-link unauth: fresh context
const c2=await b.newContext();
const p2=await c2.newPage();
await p2.goto(BASE+'/tenant/messages',{waitUntil:'networkidle'});
await p2.waitForTimeout(2500);
console.log('4 unauth /tenant/messages ->', p2.url().replace('http://localhost:5173',''));
const state = await p2.evaluate(()=> window.history.state && window.history.state.usr ? window.history.state.usr : null).catch(()=>null);
console.log('   state.from:', JSON.stringify(state));
await b.close();
