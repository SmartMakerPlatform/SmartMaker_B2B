import { chromium } from 'file:///C:/Users/somed/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const verifyOnly = process.argv.includes('--verify');
const output = 'C:/repo/SmartMaker_B2B/docs/captures';
const targets = [
  ['concept-b','http://127.0.0.1:4173/concept-b/']
];
const sectionOutput = `${output}/sections`;
await mkdir(sectionOutput,{recursive:true});
const forbidden = ['2. 랜딩페이지 기획(안)','3. 교육참가 신청 페이지','랜딩페이지 제작에는, 이 이미지를 그대로 사용합시다.','<김과장 자리 번호로 변경 >','[DB table_교육 신청자 대장]','???'];
const required = ['AX를 향한 지름길..','AX 및 DX 실전 교육 안내','AX 및 DX 프로젝트 수행에 필요한 기술과','▪ 교육 참여 효과 :','■ 커리큘럼 : [ AX 및 DX 실전 능력 배양 과정 ]','AX 및 DX 실전 교육 신청하기','26년 12월 2차 (12.22~12.28)','▪ 신청자 인적사항','교육비 결제하기','→ 출장교육 신청 :'];
const normalize = (text)=>text.replace(/\s+/g,' ').trim();

for (const [name,url] of targets) {
  const desktop = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  await desktop.goto(url,{waitUntil:'load'});
  await desktop.evaluate(()=>document.fonts.ready);
  if(!verifyOnly)await desktop.screenshot({path:`${output}/${name}-desktop.png`,fullPage:true});
  const body = await desktop.locator('body').innerText();
  const broken = await desktop.locator('img').evaluateAll((images)=>images.filter((image)=>!image.complete||image.naturalWidth===0).map((image)=>image.src));
  const normalizedBody = normalize(body);
  const report = {name,missing:required.filter((text)=>!normalizedBody.includes(normalize(text))),forbidden:forbidden.filter((text)=>normalizedBody.includes(normalize(text))),broken};
  console.log(JSON.stringify(report));

  const progressStates = [];
  const benefitItems = desktop.locator('.benefit-copy article');
  for (let index=0;index<await benefitItems.count();index+=1) {
    await benefitItems.nth(index).evaluate((element)=>element.scrollIntoView({block:'center'}));
    await desktop.waitForTimeout(560);
    progressStates.push({
      step:index+1,
      active:await desktop.locator('.benefit-copy article.active').getAttribute('data-step'),
      progress:await desktop.locator('.progress').getAttribute('aria-valuenow')
    });
  }
  await benefitItems.first().evaluate((element)=>element.scrollIntoView({block:'center'}));
  await desktop.waitForTimeout(560);
  progressStates.push({
    step:'reverse',
    active:await desktop.locator('.benefit-copy article.active').getAttribute('data-step'),
    progress:await desktop.locator('.progress').getAttribute('aria-valuenow')
  });
  console.log(JSON.stringify({name:'benefits-progress',states:progressStates}));

  if(!verifyOnly)for (const point of ['p3','p4','p5','p6','p7','p8']) {
    await desktop.locator(`[data-capture-point="${point}"]`).screenshot({path:`${sectionOutput}/desktop-${point}.png`});
  }
  await desktop.close();

  const mobile = await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
  await mobile.goto(url,{waitUntil:'load'});
  await mobile.evaluate(()=>document.fonts.ready);
  if(!verifyOnly)await mobile.screenshot({path:`${output}/${name}-mobile.png`,fullPage:true});
  console.log(JSON.stringify({name:`${name}-mobile`,width:await mobile.evaluate(()=>document.documentElement.scrollWidth),viewport:390}));
  if(!verifyOnly)for (const point of ['p3','p4','p5','p6','p7','p8']) {
    await mobile.locator(`[data-capture-point="${point}"]`).screenshot({path:`${sectionOutput}/mobile-${point}.png`});
  }
  await mobile.close();
}

const root = await browser.newPage({viewport:{width:1280,height:800}});
await root.goto('http://127.0.0.1:4173/',{waitUntil:'load'});
console.log(JSON.stringify({name:'default-route',url:root.url()}));
await root.close();

const reduced = await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
await reduced.goto('http://127.0.0.1:4173/concept-b/',{waitUntil:'load'});
console.log(JSON.stringify({
  name:'reduced-motion',
  sticky:await reduced.locator('.benefit-visual').evaluate((element)=>getComputedStyle(element).position),
  progress:await reduced.locator('.progress').evaluate((element)=>getComputedStyle(element).display),
  visibleItems:await reduced.locator('.benefit-copy article').evaluateAll((items)=>items.filter((item)=>Number(getComputedStyle(item).opacity)===1).length)
}));
await reduced.close();

const noScript = await browser.newPage({viewport:{width:1440,height:1000},javaScriptEnabled:false});
await noScript.goto('http://127.0.0.1:4173/concept-b/',{waitUntil:'load'});
console.log(JSON.stringify({
  name:'javascript-disabled',
  items:await noScript.locator('.benefit-copy article').count(),
  visibleItems:await noScript.locator('.benefit-copy article').evaluateAll((items)=>items.filter((item)=>Number(getComputedStyle(item).opacity)===1).length)
}));
await noScript.close();

const compare = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
await compare.goto('http://127.0.0.1:4173/compare/',{waitUntil:'load'});
await compare.evaluate(()=>document.fonts.ready);
console.log(JSON.stringify({name:'compare',broken:await compare.locator('img').evaluateAll((images)=>images.filter((image)=>!image.complete||image.naturalWidth===0).map((image)=>image.src))}));
await compare.close();

await browser.close();
