import { chromium } from 'playwright-core';
const BASE='http://localhost:5173';
const b=await chromium.launch();

// motion check (default)
const c=await b.newContext({viewport:{width:1440,height:960}});
const p=await c.newPage();
await p.goto(BASE+'/',{waitUntil:'networkidle'});
await p.waitForTimeout(1200);
const t1=await p.evaluate(()=>{const im=document.querySelector('section img');return im?getComputedStyle(im).transform:'none';});
await p.waitForTimeout(1600);
const t2=await p.evaluate(()=>{const im=document.querySelector('section img');return im?getComputedStyle(im).transform:'none';});
console.log('hero img transform t1:',t1.slice(0,60));
console.log('hero img transform t2:',t2.slice(0,60));
console.log('photo drifting:', t1!==t2);
const overflow=await p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
console.log('home overflow px:',overflow);

// reduced-motion
const cr=await b.newContext({viewport:{width:1440,height:960},reducedMotion:'reduce'});
const pr=await cr.newPage();
await pr.goto(BASE+'/',{waitUntil:'networkidle'});
await pr.waitForTimeout(1200);
const rt1=await pr.evaluate(()=>{const im=document.querySelector('section img');return im?getComputedStyle(im).transform:'none';});
await pr.waitForTimeout(1500);
const rt2=await pr.evaluate(()=>{const im=document.querySelector('section img');return im?getComputedStyle(im).transform:'none';});
console.log('reduced-motion drift same:', rt1===rt2, rt1==='none'||rt1==='none'?rt1:'has-transform');
const lines=await pr.evaluate(()=>document.querySelectorAll('h1 .block').length);
console.log('reduced-motion mask blocks:',lines,'(0 expected)');

// property detail quick overflow
await p.goto(BASE+'/properties/1',{waitUntil:'networkidle'});
await p.waitForTimeout(1500);
const od=await p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
console.log('detail overflow px:',od);
await p.screenshot({path:'/home/user/e2e/shots/home-anim.png'});
await b.close();
