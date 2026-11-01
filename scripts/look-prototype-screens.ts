/**
 * Safe Bobek browser QA — replaces the now-invalid six-step V3.2 cutout test.
 * The floating hoodie/jacket and both unstable wave arms are intentionally BLOCKED.
 * Command: node --import tsx scripts/look-prototype-screens.ts
 */
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, join } from 'node:path';
import { chromiumPath, startStand } from './lib/stand';

const root=process.cwd();
const require=createRequire(root+'/package.json');
const out=resolve(root,'docs/qa/bobek-stable');
const errors:string[]=[];
const check=(pass:unknown,label:string)=>{
  if(!pass)errors.push(label);
  console.log(`${pass?'OK':'FAIL'} ${label}`);
};
async function main(){
  const {chromium}=require('playwright') as typeof import('playwright');
  const stand=await startStand({ui:'dev'});
  mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({
    executablePath:chromiumPath(chromium),headless:true,
    args:['--no-sandbox','--disable-dev-shm-usage'],
  });
  try{
    const context=await browser.newContext({
      viewport:{width:390,height:844},deviceScaleFactor:2,locale:'uk-UA',
    });
    const page=await context.newPage();
    await page.goto(stand.base+'/__look-prototype');
    await page.evaluate(()=>{
      localStorage.setItem('pg_bobek_layers_preview','1');
      localStorage.setItem('pg_look_prototype_v1',JSON.stringify({
        equipment:['jacket-denim','backpack-travel'],state:'wave',art:'v3',
      }));
    });
    await page.reload();
    await page.locator('[data-bobek-coherent-preview]').waitFor();
    check(await page.locator('[data-bobek-preview-toggle]').isDisabled(),
      'unapproved whole-app preview cannot be enabled');
    check(await page.locator('[data-proto-art="v3"]').isDisabled(),
      'detached 2.5D V3.2 outfit not selectable');
    check(await page.locator('[data-proto-art="v2"]').isDisabled(),
      'older cutout wardrobe does not bypass QA gate');
    check(await page.locator('[data-proto-step="5"]').count()===0,
      'broken wave animation controls are not rendered');
    check(await page.evaluate(()=>localStorage.getItem('pg_bobek_layers_preview')===null),
      'stale persisted QA override cleared on mount');
    const coherent=page.locator('[data-bobek-coherent-preview] img');
    check(await coherent.count()===2,
      'coherent full-look front/wave character reference visible');
    const healthy=await coherent.evaluateAll(images=>images.every(img=>{
      const el=img as HTMLImageElement;
      return el.complete&&el.naturalWidth>0&&el.naturalHeight>0;
    }));
    check(healthy,'both original whole-look art assets decoded');
    check(await page.locator('[data-bobek-demo-card]').count()===1,
      'stable default preview visible instead of broken outfit');
    const redButton=page.locator('[data-bobek-v4-colorway="red"]');
    const blueButton=page.locator('[data-bobek-v4-colorway="blue"]');
    check(await redButton.count()===1&&await blueButton.count()===1,
      'V4 shows separate, explicit safe red/blue WHOLE-look options');
    check(!(await blueButton.isDisabled()),
      'pre-generated blue colorway is selectable inside QA only');
    const display=page.locator('[data-bobek-v4-display]');
    await blueButton.click();
    check(await blueButton.getAttribute('aria-pressed')==='true',
      'safe blue hoodie color selected');
    await display.waitFor();
    check((await display.getAttribute('src'))?.includes('front-blue-colorway'),
      'blue selection displays registered master instead of drifting garment layers');
    check(await display.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth===512),
      'blue colorway decodes at original character native size');
    await page.screenshot({path:join(out,'blue-whole-look-390.png'),fullPage:true});
    await redButton.click();
    check(await redButton.getAttribute('aria-pressed')==='true',
      'red approved master restored without persisting an outfit');
    check((await display.getAttribute('src'))?.includes('front-approved'),
      'red master source is restored exactly');
    for(const width of [390,320]){
      await page.setViewportSize({width,height:844});
      await page.screenshot({path:join(out,`stable-${width}.png`),fullPage:true});
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),
        `${width}px: no horizontal overflow`);
    }
    await context.close();
  }finally{
    await browser.close();
    await stand.stop();
  }
  if(errors.length)throw Error(`Bobek visual safety QA failed: ${errors.join('; ')}`);
  console.log('Bobek safety QA passed — broken layered art is unavailable.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
