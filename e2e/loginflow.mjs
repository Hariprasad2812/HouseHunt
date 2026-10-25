import { chromium } from 'playwright-core';
const BASE='http://localhost:5173';
const issues=[];
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:960}});
const p=await c.newPage();
p.on('pageerror',e=>issues.push('PAGEERROR '+e.message));
p.on('console',m=>{ if(m.type()==='error') issues.push('CE '+m.text().slice(0,180)); });
p.on('response',r=>{ if(r.status()>=400 && r.request().resourceType()==='fetch') issues.push('HTTP'+r.status()+' '+r.url().slice(0,120)); });
const goLogin=async()=>{ await p.goto(BASE+'/login',{waitUntil:'networkidle'}); await p.waitForTimeout(600); };
const log=(m)=>console.log('  ·',m);

await goLogin();
// 1. wrong credentials
await p.getByPlaceholder('you@example.com').fill('tenant@househunt.in');
await p.getByPlaceholder('••••••••').fill('WRONG-pass');
await p.getByRole('button',{name:/Sign in/}).click();
await p.waitForTimeout(1500);
log('wrong-pw stays on login:', p.url().includes('/login'), '| error shown:', (await p.locator('body').innerText()).includes('Invalid') || (await p.locator('body').innerText()).match(/email|password|invalid/i)? 'yes':'no');

// 2. each demo one-tap
for (const [label,path] of [['Tenant','/tenant'],['Owner','/owner'],['Admin','/admin']]){
  await goLogin();
  await p.locator('button',{hasText:new RegExp('^'+label) }).first().click();
  await p.waitForTimeout(4000);
  const url=p.url().replace('http://localhost:5173','');
  log(label+' demo -> '+url+' (expect '+path+')', url.startsWith(path)||url===path);
  if(!url.startsWith(path)) issues.push(label+' demo landed on '+url);
  // verify session really that role by reading sidebar title text
  const body=await p.locator('body').innerText();
  const okRole = label==='Admin'? /Platform|Admin dashboard/.test(body) : label==='Owner'? /Portfolio|Owner dashboard/.test(body) : /Good to see you|Tenant dashboard/.test(body);
  log('  role surface correct:', okRole);
  if(!okRole) issues.push(label+' role mismatch');
  // sign out via sidebar/topbar
  const so=p.locator('button[aria-label="Sign out"]');
  if(await so.count()){ await so.click(); await p.waitForTimeout(1500); log('  signed out ->', p.url().replace('http://localhost:5173','')); }
}

// 3. form login as tenant with remember
await goLogin();
await p.getByPlaceholder('you@example.com').fill('tenant@househunt.in');
await p.getByPlaceholder('••••••••').fill('HouseHunt@123');
await p.getByRole('button',{name:/Sign in/}).click();
await p.waitForURL('**/tenant',{timeout:20000});
log('manual login lands /tenant');

// 4. Already-authed hitting /login should bounce to their dashboard (PublicOnly)
await p.goto(BASE+'/login',{waitUntil:'networkidle'});
await p.waitForTimeout(2500);
const after=p.url().replace('http://localhost:5173','');
log('authed user visiting /login ->', after, '(expect /tenant)');
if(!after.startsWith('/tenant')) issues.push('PublicOnly bounce failed: '+after);

// 5. Protected deep-link login redirect should preserve intent? check current impl
await p.goto(BASE+'/',{waitUntil:'networkidle'});
// sign out
await p.goto(BASE+'/tenant/messages',{waitUntil:'networkidle'}).catch(()=>{});
await p.waitForTimeout(1500);
const redir=p.url().replace('http://localhost:5173','');
log('unauthenticated deep-link /tenant/messages ->', redir, '(expect /login)');

console.log('\n==== ISSUES ('+issues.length+') ====');
for(const i of issues) console.log(i.slice(0,200));
await b.close();
process.exit(issues.length?2:0);
