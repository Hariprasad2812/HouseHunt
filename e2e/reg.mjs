import { chromium } from 'playwright-core';
const BASE='http://localhost:5173';
const issues=[];
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1440,height:960}});
p.on('pageerror',e=>issues.push('PAGEERROR '+e.message));
p.on('console',m=>{ if(m.type()==='error') issues.push('CE '+m.text().slice(0,200)); });
p.on('requestfailed',r=>issues.push('REQFAIL '+r.url().slice(0,140)));
p.on('response',r=>{ if(r.status()>=400 && r.request().resourceType()!=='image') issues.push('HTTP'+r.status()+' '+r.url().slice(0,140)); });

await p.goto(BASE+'/register',{waitUntil:'networkidle'});
await p.waitForTimeout(1200);
await p.screenshot({path:'/home/user/e2e/shots/reg-full.png'});

// 1) basic form client validation attempt - click create with empty to see behavior
const createBtn = p.getByRole('button',{name:/Create/});
console.log('create button count:',await createBtn.count(), 'text:', (await p.locator('button').allInnerTexts()).map(t=>t.trim().slice(0,30)).filter(t=>/create/i.test(t)).join(' | '));

// 2) fill correctly and submit
const uniq='qa'+Date.now().toString().slice(-7);
await p.getByPlaceholder('e.g. Ananya Rao').fill('QA Tester');
await p.getByPlaceholder('you@example.com').fill(uniq+'@qa.in');
await p.getByPlaceholder('+91 98XXX XXXXX').fill('+91 9876543210');
await p.getByPlaceholder('Create a password').fill('HouseHunt@123');
console.log('filled; toggling role to Owner first then back Tenant? no, keep Tenant');
await p.screenshot({path:'/home/user/e2e/shots/reg-filled.png'});
await createBtn.first().click();
await p.waitForTimeout(4000);
console.log('url after submit:', p.url().replace('http://localhost:5173',''));
const body=await p.locator('body').innerText().catch(()=> '');
console.log('landed on tenant dash?', p.url().includes('/tenant'));
if(!p.url().includes('/tenant')) issues.push('register submit did not redirect to /tenant');

// 3) server accepts? check we can logout
if(p.url().includes('/tenant')){
  const so=p.getByRole('button',{name:/Sign out/});
  console.log('sign-out present:', await so.count()>0);
}

// check the auth panel & form geometry overlap
await p.goto(BASE+'/register',{waitUntil:'networkidle'});
await p.waitForTimeout(800);
const geom=await p.evaluate(()=>{
  const out=[];
  document.querySelectorAll('input,label,button,select').forEach(el=>{
    const r=el.getBoundingClientRect(); const s=getComputedStyle(el);
    if(r.width===0||r.height===0) return;
    // detect text clipped: if input scrollWidth>clientWidth and overflow hidden? 
  });
  // detect any element sticking beyond its section container horizontally
  const vw=window.innerWidth;
  document.querySelectorAll('*').forEach(el=>{ const r=el.getBoundingClientRect(); if(r.right>vw+2){ const c=el.className&&el.className.baseVal!==undefined?el.className.baseVal:el.className; out.push((el.tagName+' '+String(c).slice(0,60)).trim()); } });
  return {overflowEls:out.slice(0,8), vw};
});
console.log('register overflow els:',JSON.stringify(geom));
// reduce-motion snapshot for sanity
console.log('\n==== ISSUES ('+issues.length+') ====');
for(const i of issues) console.log(i.slice(0,220));
await b.close();
