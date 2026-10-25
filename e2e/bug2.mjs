import { chromium } from 'playwright-core';
const BASE='http://localhost:5173';
const issues=[];
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1440,height:960}});
p.on('pageerror',(e)=>issues.push('PAGEERROR: '+e.message));
p.on('console',(m)=>{ if(m.type()==='error') issues.push('CONSOLE ERR: '+m.text().slice(0,200)); });
p.on('requestfailed',(r)=>issues.push('REQFAIL '+r.url().slice(0,120)));
const step=async(name,fn)=>{ try{ await fn(); console.log('ok  ',name);}catch(e){ issues.push('FAIL '+name+': '+e.message.split('\n')[0]); console.log('FAIL',name,e.message.split('\n')[0]); }};

// ---- hero search precise
await p.goto(BASE+'/',{waitUntil:'networkidle'});
await step('hero location autocomplete + search',async()=>{
  const input=p.getByPlaceholder('Search by area…');
  await input.click(); await input.fill('kor');
  await p.waitForTimeout(600);
  const opt=p.locator('button',{hasText:/Koramangala/}).first();
  await opt.click();
  await p.waitForTimeout(300);
  // click the DESKTOP search button (visible)
  const sb=p.getByRole('button',{name:'Search homes',exact:false});
  const n=await sb.count();
  let clicked=false;
  for(let i=0;i<n;i++){ if(await sb.nth(i).isVisible().catch(()=>false)){ await sb.nth(i).click(); clicked=true; break; } }
  console.log('   search button visible&clicked:',clicked);
  await p.waitForTimeout(2500);
  console.log('   final url:',p.url().replace('http://localhost:5173',''));
  if(!p.url().includes('/properties?')) issues.push('hero search did not navigate');
  // results should be Koramangala cards
  await p.waitForTimeout(1500);
  const cards=p.locator('a[href^="/properties/"]');
  console.log('   result cards:',await cards.count());
  const txt=await p.locator('body').innerText();
  console.log('   page mentions Koramangala:',txt.includes('Koramangala'));
});

// ---- register flow
await p.goto(BASE+'/register',{waitUntil:'networkidle'});
await step('register tenant + auto-login redirect',async()=>{
  await p.getByRole('button',{name:'Tenant'}).first().click();
  const u='qa'+Date.now().toString().slice(-7);
  await p.getByPlaceholder('e.g. Ananya Rao').fill('QA Tester');
  await p.getByPlaceholder('you@example.com').fill(u+'@qa.in');
  await p.getByPlaceholder('+91 98XXX XXXXX').fill('+91 98765 43210');
  await p.getByPlaceholder('Create a password').fill('HouseHunt@123');
  await p.getByRole('button',{name:/Create account/}).first().click();
  await p.waitForTimeout(3500);
  console.log('   url after register:',p.url().replace('http://localhost:5173',''));
  const body=await p.locator('body').innerText().catch(()=> '');
  if(!/tenant|dashboard|saved homes/i.test(body) && p.url().includes('/register')) issues.push('register did not move on');
});

// ---- login as owner; dashboards interactions
await p.goto(BASE+'/login',{waitUntil:'networkidle'});
await step('owner login → applications shortlist action',async()=>{
  await p.getByRole('button',{name:/Owner/}).first().click();
  await p.waitForURL('**/owner',{timeout:20000});
  await p.waitForTimeout(2500);
  // open Applications
  await p.locator('button',{hasText:'Applications'}).first().click();
  await p.waitForTimeout(1800);
  const btns=p.getByRole('button',{name:/Shortlist/});
  if(await btns.count()>0){
    await btns.first().click();
    await p.waitForTimeout(1800);
    console.log('   shortlist worked (no error):', !issues.some(i=>i.includes('PAGEERROR')));
    await p.screenshot({path:'/home/user/e2e/shots/bug-owner-apps.png'});
  } else { console.log('   no PENDING applications left to shortlist'); }
});

// ---- tenant dashboard notifications bell
await p.goto(BASE+'/login',{waitUntil:'networkidle'});
await step('tenant: notifications bell opens + mark read',async()=>{
  await p.getByRole('button',{name:/Tenant/}).first().click();
  await p.waitForURL('**/tenant',{timeout:20000});
  await p.waitForTimeout(2000);
  const bell=p.locator('button[aria-label="Notifications"]');
  if(await bell.count()){ await bell.click(); await p.waitForTimeout(1200);
    const panel=await p.getByText(/Notifications/).count();
    console.log('   notifications panel:',panel>0);
    const mr=p.getByRole('button',{name:/Mark all read/});
    if(await mr.count()){ await mr.click(); await p.waitForTimeout(800); }
  } else issues.push('no notifications bell found');
});

await b.close();
console.log('\n==== ISSUES ('+issues.length+') ====');
for(const i of issues) console.log(i.slice(0,200));
process.exit(issues.length?2:0);
