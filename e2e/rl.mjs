import { chromium } from 'playwright-core';
const BASE='http://localhost:5173';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:960}});
const p=await c.newPage();
const issues=[];
p.on('pageerror',e=>issues.push('PAGEERR '+e.message.slice(0,120)));
const url=()=>p.url().replace('http://localhost:5173','');
const u=(Date.now()%100000000)+'@test.com';

// A) guest list-property -> sign in -> tenant demo -> back to /list-property (tenant gate)
await p.goto(BASE+'/list-property',{waitUntil:'networkidle'}); await p.waitForTimeout(1200);
const g1=await p.getByRole('heading',{name:/Reach renters actively looking/i}).count();
console.log('A1 guest gate heading:',g1>0?'yes':'NO');
await p.getByRole('link',{name:/I already have one — sign in/i}).click();
await p.waitForTimeout(1200);
console.log('A2 login url:',url());
await p.locator('button',{hasText:/^Tenant/}).first().click();
await p.waitForTimeout(4500);
console.log('A3 after tenant login ->',url(),'(expect /list-property)');
const g2=await p.getByRole('heading',{name:/Listings are for owner accounts/i}).count();
console.log('A4 tenant gate again:',g2>0?'yes':'NO');
if(!url().startsWith('/list-property')) issues.push('A sign-in from lost: '+url());

// B) guest list-property -> create owner account -> owner registration -> owner wizard on list-property
await p.locator('button[aria-label="Sign out"]').first().click().catch(()=>{});
await p.waitForTimeout(900);
await p.goto(BASE+'/list-property',{waitUntil:'networkidle'}); await p.waitForTimeout(1200);
await p.getByRole('link',{name:/Create owner account/i}).click();
await p.waitForTimeout(1200);
console.log('B1 register url:',url(),'(expect /register?switch=1)');
const own=await p.getByRole('button',{name:/Owner/}).getAttribute('class');
console.log('B2 owner toggle active:',/shadow-soft/.test(own)?'yes':'no');
await p.getByPlaceholder('e.g. Ananya Rao').fill('Aarav Iyer');
await p.getByPlaceholder('you@example.com').fill(u);
await p.getByPlaceholder('+91 98XXX XXXXX').fill('+91 9876543210');
await p.getByPlaceholder('Create a password').fill('huntPass123');
await p.getByRole('button',{name:'Create owner account'}).click();
await p.waitForTimeout(5000);
console.log('B3 after owner register ->',url(),'(expect /list-property)');
const wizard=await p.getByRole('heading',{name:/Have a property to rent\?/i}).count();
console.log('B4 owner wizard shown:',wizard>0?'yes':'NO');
if(!url().startsWith('/list-property')) issues.push('B register from lost: '+url());

console.log('\nISSUES:',issues.length?issues:'none');
await b.close();
process.exit(issues.length?2:0);
