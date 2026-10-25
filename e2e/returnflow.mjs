import { chromium } from 'playwright-core';
const BASE='http://localhost:5173';
const issues=[];
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:960}});
const p=await c.newPage();
p.on('pageerror',e=>issues.push('PAGEERROR '+e.message));
const url=()=>p.url().replace('http://localhost:5173','');

// 1) Guarded deep-link: unauth opens /tenant/messages -> login; after Tenant demo returns to messages tab
await p.goto(BASE+'/tenant/messages',{waitUntil:'networkidle'});
await p.waitForTimeout(1800);
console.log('A unauth /tenant/messages ->',url(), '(expect /login)');
await p.locator('button',{hasText:/^Tenant/}).first().click();
await p.waitForTimeout(4200);
console.log('B after tenant login ->',url(), '(expect /tenant/messages)');
if(!url().includes('/tenant/messages')) issues.push('deep-link return failed: '+url());

// 2) sign-out then property-favorite gate flow
await p.locator('button[aria-label="Sign out"]').click();
await p.waitForTimeout(1200);
await p.goto(BASE+'/properties/3',{waitUntil:'networkidle'});
await p.waitForTimeout(1200);
// unauth heart on detail page top? PropertyDetail has favorite in sticky card 'Save this home'
const heart=p.locator('button[aria-label*="Save home"], button[aria-label*="Remove from saved"]').first();
await heart.click({timeout:6000});
await p.waitForTimeout(800);
const modal=await p.getByText('Save this home').count();
console.log('C gate modal shown:',modal>0);
if(modal){
  await p.getByRole('dialog').getByRole('link',{name:'Sign in'}).first().click();
  await p.waitForTimeout(1500);
  console.log('D login url:',url());
  await p.locator('button',{hasText:/^Tenant/}).first().click();
  await p.waitForTimeout(4200);
  console.log('E after login ->',url(), '(expect /properties/3)');
  if(!url().startsWith('/properties/3')) issues.push('gate return failed: '+url());
}
console.log('\nISSUES:',issues.length?issues:'none');
await b.close();
process.exit(issues.length?2:0);
