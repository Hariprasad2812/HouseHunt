import { chromium } from 'playwright-core';
const BASE='http://localhost:5173';
const b=await chromium.launch();
const issues=[];
const url=p=>p.url().replace('http://localhost:5173','');
const mk=async()=>{const c=await b.newContext({viewport:{width:1440,height:960}});const p=await c.newPage();p.on('pageerror',e=>issues.push('PAGEERR '+e.message.slice(0,120)));return p;};
const u=(Date.now()%100000000)+'@test.com';

// A guest -> sign in -> back
let p=await mk();
await p.goto(BASE+'/list-property',{waitUntil:'networkidle'}); await p.waitForTimeout(1000);
await p.getByRole('link',{name:/I already have one — sign in/i}).click();
await p.waitForTimeout(1000);
await p.locator('button',{hasText:/^Tenant/}).first().click();
await p.waitForTimeout(4000);
console.log('A sign-in return:',url(p));
if(!url(p).startsWith('/list-property')) issues.push('A '+url(p));
await p.close();

// B guest -> create owner account -> owner registration wizard returns
p=await mk();
await p.goto(BASE+'/list-property',{waitUntil:'networkidle'}); await p.waitForTimeout(1000);
await p.getByRole('link',{name:/Create owner account/i}).click();
await p.waitForTimeout(1200);
console.log('B1 on',url(p));
await p.getByPlaceholder('e.g. Ananya Rao').fill('Aarav Iyer');
await p.getByPlaceholder('you@example.com').fill(u);
await p.getByPlaceholder('+91 98XXX XXXXX').fill('+91 9876543210');
await p.getByPlaceholder('Create a password').fill('huntPass123');
await p.getByRole('button',{name:'Create owner account'}).click();
await p.waitForTimeout(5000);
console.log('B2 owner after register:',url(p),'| wizard:',await p.getByRole('heading',{name:/Have a property to rent\?/i}).count()>0?'yes':'NO');
if(!url(p).startsWith('/list-property')) issues.push('B '+url(p));
await p.close();

// C signed-in tenant -> switch-to-owner -> owner registration (no PublicOnly bounce)
p=await mk();
await p.goto(BASE+'/login',{waitUntil:'networkidle'});
await p.locator('button',{hasText:/^Tenant/}).first().click();
await p.waitForTimeout(2500);
await p.goto(BASE+'/list-property',{waitUntil:'networkidle'}); await p.waitForTimeout(1200);
const sw=await p.getByRole('button',{name:/Create an owner account/i}).count();
console.log('C1 tenant-gate switch btn:',sw>0?'yes':'NO');
await p.getByRole('button',{name:/Create an owner account/i}).click();
await p.waitForTimeout(1800);
console.log('C2 after switch ->',url(p),'(expect /register?switch=1)');
if(!url(p).startsWith('/register')) issues.push('C '+url(p));
await p.close();

console.log('\nISSUES:',issues.length?issues:'none');
await b.close();
process.exit(issues.length?2:0);
