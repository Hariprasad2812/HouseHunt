import { chromium } from 'playwright-core';
const BASE='http://localhost:5173';
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1440,height:960}});
p.on('pageerror',e=>console.log('PAGEERROR',e.message));
p.on('console',m=>{if(m.type()==='error')console.log('CE',m.text().slice(0,160));});
await p.goto(BASE+'/login',{waitUntil:'networkidle'});
await p.getByRole('button',{name:'Tenant'}).first().click();
await p.waitForURL('**/tenant',{timeout:20000});
await p.waitForTimeout(2000);
const bell=p.locator('button[aria-label="Notifications"]');
try{
  await bell.click({timeout:6000});
  console.log('bell clicked');
  await p.waitForTimeout(900);
  console.log('panel text present:', await p.getByText('Notifications',{exact:true}).first().isVisible().catch(()=>false));
  const items=await p.locator('text=Mark all read').count();
  console.log('mark-all present:',items>0);
  const mn=p.getByRole('button',{name:/Mark all read/});
  if(await mn.count()){ await mn.click({timeout:4000}).catch(()=>console.log('mark-all click issue')); }
  await p.waitForTimeout(600);
}catch(e){ console.log('bell click failed:',e.message.split('\n')[0]); }
// test favourite toggle card on properties
await p.goto(BASE+'/properties',{waitUntil:'networkidle'});
await p.waitForTimeout(1500);
const heart=p.locator('button[aria-label*="Save home"], button[aria-label*="Remove from saved"]').first();
console.log('hearts on grid:',await p.locator('button[aria-label*="Save home"], button[aria-label*="Remove from saved"]').count());
await heart.click({timeout:6000}).catch(e=>console.log('heart fail',e.message.split('\n')[0]));
await p.waitForTimeout(900);
await b.close();
