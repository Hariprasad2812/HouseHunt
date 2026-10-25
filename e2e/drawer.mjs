import { chromium } from 'playwright-core';
const BASE='http://localhost:5173';
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:390,height:844}});
const p=await c.newPage();
await p.goto(BASE+'/login',{waitUntil:'networkidle'});
await p.getByRole('button',{name:'Owner'}).first().click();
await p.waitForURL('**/owner'); await p.waitForTimeout(2000);
const menu=p.getByRole('button',{name:/Menu/});
if(await menu.isVisible().catch(()=>false)){
  await menu.click(); await p.waitForTimeout(600);
  const drawer=p.locator('aside.fixed').last();
  console.log('drawer visible:', await drawer.isVisible());
  await p.getByRole('button',{name:'Analytics'}).first().click();
  await p.waitForTimeout(2500);
  console.log('recharts on page after tab:', await p.locator('.recharts-responsive-container').count()>0 || await p.getByText('Applications & visit requests').count()>0);
  await p.screenshot({path:'/home/user/e2e/shots/m-owner-analytics.png'});
} else { console.log('menu not visible — issue'); }
await b.close();
