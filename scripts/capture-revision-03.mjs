import { chromium } from 'file:///C:/Users/somed/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir } from 'node:fs/promises';

const url='http://127.0.0.1:4173/concept-b/';
const output='C:/repo/SmartMaker_B2B/docs/captures/revision-03';
await mkdir(output,{recursive:true});

const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors=[];
const assert=(condition,message)=>{if(!condition)errors.push(message);};
const centerElement=async(page,selector,index=0)=>{
  await page.locator(selector).nth(index).evaluate((element)=>{
    const top=element.getBoundingClientRect().top+window.scrollY-(window.innerHeight-element.clientHeight)/2;
    window.scrollTo({top,behavior:'instant'});
  });
  await page.waitForTimeout(480);
};
const p5State=(page)=>page.evaluate(()=>({
  step:document.querySelector('.benefit-copy article.active')?.dataset.step,
  image:[...document.querySelectorAll('.benefit-image')].findIndex((image)=>image.classList.contains('active')),
  progress:document.querySelector('.progress')?.getAttribute('aria-valuenow'),
  aria:document.querySelector('.progress')?.getAttribute('aria-label')
}));

const desktop=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const consoleErrors=[];
desktop.on('console',(message)=>{if(message.type()==='error')consoleErrors.push(message.text());});
desktop.on('pageerror',(error)=>consoleErrors.push(error.message));
const responses={};
desktop.on('response',(response)=>{
  const match=response.url().match(/join0[1-3]\.png$/);
  if(match)responses[match[0]]={status:response.status(),type:response.headers()['content-type']};
});
await desktop.goto(url,{waitUntil:'load'});
await desktop.evaluate(()=>document.fonts.ready);

const imageSources=await desktop.locator('.benefit-image').evaluateAll((images)=>images.map((image)=>({src:new URL(image.currentSrc).pathname,complete:image.complete,width:image.naturalWidth})));
assert(imageSources.length===3,'p5 desktop image count is not 3');
assert(imageSources.every((image)=>image.complete&&image.width>0),'p5 desktop image failed to load');
assert(imageSources.map((image)=>image.src).join('|')==='/assets/ax-education/join01.png|/assets/ax-education/join02.png|/assets/ax-education/join03.png','p5 image filenames do not match contract');

const forward=[];
for(let index=0;index<5;index+=1){
  await centerElement(desktop,'.benefit-copy article',index);
  forward.push(await p5State(desktop));
  if(index===0)await desktop.screenshot({path:`${output}/desktop-p5-start.png`});
  if(index===2)await desktop.screenshot({path:`${output}/desktop-p5-middle.png`});
  if(index===4)await desktop.screenshot({path:`${output}/desktop-p5-end.png`});
}
assert(JSON.stringify(forward.map((state)=>state.image))===JSON.stringify([0,0,1,1,2]),'p5 forward image mapping failed');
assert(JSON.stringify(forward.map((state)=>state.progress))===JSON.stringify(['20','40','60','80','100']),'p5 progress mapping failed');

const reverse=[];
for(const index of [4,3,2,1,0]){
  await centerElement(desktop,'.benefit-copy article',index);
  reverse.push(await p5State(desktop));
}
assert(JSON.stringify(reverse.map((state)=>state.image))===JSON.stringify([2,1,1,0,0]),'p5 reverse image mapping failed');
assert(JSON.stringify(reverse.map((state)=>state.progress))===JSON.stringify(['100','80','60','40','20']),'p5 reverse progress failed');

const p5VisibleText=await desktop.locator('#p5').innerText();
assert(!/(^|\s)0[1-5](\s|$)/.test(p5VisibleText),'p5 contains decorative 01-05 text');
assert(!p5VisibleText.includes('교육 문의'),'removed inquiry remains in p5');

await desktop.locator('#p6').scrollIntoViewIfNeeded();
await desktop.locator('#p6').screenshot({path:`${output}/desktop-curriculum.png`});
assert(await desktop.locator('.curriculum-table').count()===1,'curriculum semantic table missing');
assert(await desktop.locator('.curriculum-total').innerText().then((text)=>text.includes('40')),'curriculum total 40 missing');
assert(await desktop.locator('.curriculum-window img').count()===0,'old curriculum image remains');

await desktop.locator('#p7').scrollIntoViewIfNeeded();
const scheduleRadios=desktop.locator('input[name="education_schedule"]');
assert(await scheduleRadios.count()===10,'schedule radio count mismatch');
assert(await scheduleRadios.evaluateAll((radios)=>radios.every((radio)=>!radio.checked)),'schedule has an initial selection');
await desktop.locator('#p7').screenshot({path:`${output}/desktop-schedule-unselected.png`});
await scheduleRadios.nth(0).check();
await scheduleRadios.nth(0).press('ArrowDown');
assert(await scheduleRadios.nth(1).isChecked(),'schedule keyboard arrow selection failed');
assert(await desktop.evaluate(()=>window.AXEducationState.schedule==='26년 8월 2차 (8.24~8.28)'),'schedule state was not stored');
await desktop.locator('#p7').screenshot({path:`${output}/desktop-schedule-selected.png`});

await desktop.locator('#p8').scrollIntoViewIfNeeded();
await desktop.locator('#p8').screenshot({path:`${output}/desktop-form.png`});
const phone=desktop.locator('#applicant-phone');
const verification=desktop.locator('#phone-verification-button');
assert(!(await verification.isEnabled()),'phone verification starts enabled');
await phone.fill('0101234');
assert(!(await verification.isEnabled()),'phone verification enabled for invalid number');
await phone.fill('01012345678');
assert(await verification.isEnabled(),'phone verification did not enable for valid number');
await verification.click();
assert(await desktop.evaluate(()=>window.AXEducationState.phoneVerification.status==='not-configured'),'SMS boundary state is incorrect');
assert((await desktop.locator('[data-phone-verification-slot]').innerText())==='','mock SMS success text was shown');

const desktopMetrics=await desktop.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,labels:[...document.querySelectorAll('.form-fields span')].map((node)=>node.textContent.trim())}));
assert(desktopMetrics.scrollWidth===desktopMetrics.clientWidth,'desktop has unintended page-level horizontal overflow');
assert(JSON.stringify(desktopMetrics.labels)===JSON.stringify(['성 명','이메일','전화번호','회사명','부서명']),'form labels/order mismatch');
assert(consoleErrors.length===0,`browser console errors: ${consoleErrors.join(' | ')}`);
for(const name of ['join01.png','join02.png','join03.png'])assert(responses[name]?.status===200&&responses[name]?.type?.startsWith('image/png'),`${name} did not return 200 image/png`);

const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
await mobile.goto(url,{waitUntil:'load'});
await mobile.evaluate(()=>document.fonts.ready);
await mobile.locator('#p5').screenshot({path:`${output}/mobile-p5.png`});
await mobile.locator('#p6').screenshot({path:`${output}/mobile-curriculum.png`});
await mobile.locator('#p7').screenshot({path:`${output}/mobile-schedule.png`});
await mobile.locator('#p8').screenshot({path:`${output}/mobile-form.png`});
const mobileP5=await mobile.evaluate(()=>({
  sticky:getComputedStyle(document.querySelector('.benefit-visual')).display,
  progress:getComputedStyle(document.querySelector('.progress')).display,
  media:[...document.querySelectorAll('.benefit-mobile-media img')].map((image)=>new URL(image.currentSrc).pathname),
  bodyWidth:document.documentElement.scrollWidth,
  viewport:document.documentElement.clientWidth,
  tableOverflow:getComputedStyle(document.querySelector('.curriculum-table-scroll')).overflowX,
  tableW:document.querySelector('.curriculum-table').getBoundingClientRect().width,
  tableBoxW:document.querySelector('.curriculum-table-scroll').getBoundingClientRect().width
}));
assert(mobileP5.sticky==='none','mobile sticky frame is still displayed');
assert(mobileP5.progress==='none','mobile circular progress is still displayed');
assert(JSON.stringify(mobileP5.media)===JSON.stringify(['/assets/ax-education/join01.png','/assets/ax-education/join02.png','/assets/ax-education/join03.png']),'mobile image placement/count mismatch');
assert(mobileP5.bodyWidth===mobileP5.viewport,'mobile has unintended page-level horizontal overflow');
assert(['auto','scroll'].includes(mobileP5.tableOverflow)&&mobileP5.tableW>mobileP5.tableBoxW,'mobile curriculum is not user-scrollable at a readable width');

const noScript=await browser.newPage({viewport:{width:1440,height:1000},javaScriptEnabled:false});
await noScript.goto(url,{waitUntil:'load'});
assert(await noScript.locator('.benefit-copy article').evaluateAll((items)=>items.every((item)=>Number(getComputedStyle(item).opacity)===1)),'JavaScript-disabled p5 text is not fully visible');

const reduced=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
await reduced.goto(url,{waitUntil:'load'});
assert(await reduced.locator('.benefit-visual').evaluate((element)=>getComputedStyle(element).position)==='relative','reduced-motion sticky effect was not minimized');
assert(await reduced.locator('.progress').evaluate((element)=>getComputedStyle(element).display)==='none','reduced-motion progress is not minimized');

console.log(JSON.stringify({forward,reverse,imageSources,responses,desktopMetrics,mobileP5,errors},null,2));
await browser.close();
if(errors.length)process.exitCode=1;
