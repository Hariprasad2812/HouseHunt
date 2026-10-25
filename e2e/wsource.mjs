import { chromium } from 'playwright-core';
const BASE='http://localhost:5173';
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1440,height:960}});
p.on('console',(m)=>{ if(m.type()==='warning'||m.type()==='error'){ const loc=m.location(); console.log('['+m.type().toUpperCase()+']', m.text().slice(0,130),'@',(loc?.url||'').replace('http://localhost:5173','')); }});
p.on('pageerror',(e)=>console.log('PAGEERROR',e.message));
// hero
await p.goto(BASE+'/',{waitUntil:'networkidle'});
await p.waitForTimeout(2500);
await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
await p.waitForTimeout(1500);
// explore / detail with maps
await p.goto(BASE+'/explore',{waitUntil:'networkidle'});
await p.waitForTimeout(2000);
await p.goto(BASE+'/properties/1',{waitUntil:'networkidle'});
await p.waitForTimeout(3000);
console.log('--- done ---');
await b.close();
