import { chromium } from 'playwright-core';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
const BASE='http://localhost:5173';
const b=await chromium.launch();
const issues=[];
const p=await b.newPage({viewport:{width:390,height:844}});
p.on('pageerror',e=>issues.push('PAGEERROR '+e.message));
p.on('console',m=>{ if(m.type()==='error') issues.push('CE '+m.text().slice(0,180)); });
await p.goto(BASE+'/register',{waitUntil:'networkidle'});
await p.waitForTimeout(1400);
await p.screenshot({path:'/tmp/regm.png'});
const geom=await p.evaluate(()=>{
  const vw=window.innerWidth, out={vw,overflow:[],blank:[]};
  document.querySelectorAll('*').forEach(el=>{const r=el.getBoundingClientRect(); if(r.right>vw+2){const c=el.className&&el.className.baseVal!==undefined?el.className.baseVal:el.className;out.overflow.push(el.tagName+' '+String(c).slice(0,50));}});
  return out;
});
console.log('mobile overflow:',geom.overflow.length?geom.overflow.slice(0,6):'none');
// elements below fold? The auth split - is form accessible without scroll? measure card top
const cardTop=await p.evaluate(()=>{ const f=document.querySelector('form'); if(!f) return null; return {top:Math.round(f.getBoundingClientRect().top), bottom:Math.round(f.getBoundingClientRect().bottom), vh:innerHeight}; });
console.log('form bounds:',JSON.stringify(cardTop));

// check label/field vertical overlap by comparing rectangles of each field label+input pairs
const ov=await p.evaluate(()=>{
  const rects=[];
  document.querySelectorAll('input, button, select').forEach((el,i)=>{
    const r=el.getBoundingClientRect();
    rects.push({i, tag:el.tagName, top:r.top, bottom:r.bottom, text:(el.value||el.placeholder||'').slice(0,18)});
  });
  rects.sort((a,b)=>a.top-b.top);
  const clashes=[];
  for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
    const a=rects[i],b=rects[j];
    const overlapH=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
    if(overlapH>2 && overlapH < Math.min(a.bottom-a.top,b.bottom-b.top)*0.5) clashes.push([i,j,Math.round(overlapH)]);
  }
  return {rects,clashes:clashes.slice(0,10)};
});
console.log('vertical clashes:',ov.clashes.length?JSON.stringify(ov.clashes):'none');

// OCR mobile to see if text intact
const r=execSync(`tesseract /tmp/regm.png - --psm 6 2>/dev/null`,{encoding:'utf8'});
const need=['Create','account','Tenant','Owner','Full','Email','Phone','Password','name','example'];
const missing=need.filter(w=>!new RegExp(w,'i').test(r));
console.log('OCR mobile text ok? missing words:',missing.length?missing:'none');
writeFileSync('/tmp/regm.txt',r);
console.log('---- OCR preview ----'); console.log(r.split('\n').filter(l=>l.trim()).slice(0,14).join('\n'));
await b.close();
