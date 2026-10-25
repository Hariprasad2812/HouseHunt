import { chromium } from 'playwright-core';
const BASE='http://localhost:5173';
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1440,height:960}});
p.on('pageerror',e=>console.log('PAGEERROR',e.message));
p.on('console',m=>{if(m.type()==='error')console.log('CE',m.text().slice(0,200));});
await p.goto(BASE+'/register',{waitUntil:'networkidle'});
await p.waitForTimeout(1500);
console.log('register URL:',p.url());
const btns=await p.locator('button').all();
for(const bt of btns.slice(0,20)){
  const vis=await bt.isVisible().catch(()=>false);
  const txt=(await bt.innerText().catch(()=>'' )).trim().slice(0,40);
  if(vis&&txt) console.log('btn:',JSON.stringify(txt));
}
console.log('--- tenant dash bell ---');
await p.goto(BASE+'/login',{waitUntil:'networkidle'});
await p.getByRole('button',{name:'Tenant'}).first().click();
await p.waitForURL('**/tenant',{timeout:20000});
await p.waitForTimeout(2500);
const bell=p.locator('[aria-label="Notifications"]');
console.log('bell count:',await bell.count(),'visible:',await bell.first().isVisible().catch(()=>false));
console.log('body has "Notifications":',(await p.locator('body').innerText()).includes('Notifications'));
const errs=await p.evaluate(()=>document.title);
console.log('title:',errs);
await b.close();
