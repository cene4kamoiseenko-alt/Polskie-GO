// Disposable local D1 + real UI. Simulated speech events, not a live microphone.
import { createServer as httpServer } from 'node:http';
import { createRequire } from 'node:module';
const root=process.cwd();
const require=createRequire(root+'/package.json');
async function main(){
 const { createServer }=await import(root+'/node_modules/vite/dist/node/index.js');
 const { getEnv,login,sessionItems,correctAnswers,disposeEnv }=await import(root+'/apps/server/test/helpers.ts');
 const { chromium }=require('playwright');
 const { app,env }=await getEnv();
 const { token,call }=await login();
 await call('POST','/api/me/onboarding',{uiLanguage:'ru',selfLevel:'A0',learningGoal:'life',dailyGoalMinutes:10,reminderHour:null});
 await call('PATCH','/api/me/settings',{theme:'dark',reducedMotion:true});
 const server=httpServer(async(req,res)=>{try{const chunks=[];for await(const chunk of req)chunks.push(chunk);const response=await app.request('http://localhost:8787'+req.url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method!)?{}:{body:Buffer.concat(chunks)})},env);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch(e){res.writeHead(500);res.end('QA bridge error');}});
 await new Promise<void>(resolve=>server.listen(8787,'127.0.0.1',resolve));
 const vite=await createServer({root:root+'/apps/web',configFile:root+'/apps/web/vite.config.ts',server:{host:'127.0.0.1',port:5173,strictPort:true}});await vite.listen();
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--no-zygote','--single-process','--disable-gpu']});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844}});const errors:string[]=[];const answers:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.url().endsWith('/answer'))answers.push(r.url());});
 await page.addInitScript(({token})=>{localStorage.setItem('pg_auth',JSON.stringify({token,owner:'dev:888888',exp:Date.now()+86400000}));
 (window as any).SpeechRecognition=class {lang='';start(){(window as any).__rec=this;}stop(){this.onend?.();}abort(){}onend:any;onerror:any;onresult:any;};}, {token});
 const fs=require('fs');fs.mkdirSync('./test-results/screens',{recursive:true});
 const results:any[]=[];
 for(const width of [360,390,430]){
 await page.setViewportSize({width,height:844});await page.goto('http://127.0.0.1:5173/?devUser=888888',{waitUntil:'networkidle'});
 await page.getByText('Быстрый старт',{exact:true}).waitFor({timeout:20000});
 await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:`./test-results/screens/home-${width}.png`,fullPage:true});if(width===390)await page.screenshot({path:'./test-results/screens/home-390-viewport.png'});
 results.push({route:'/',width,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
 }
 for(const route of ['/profile','shop','/learn']){
 const url=route.startsWith('/')?route:'/'+route;
 await page.goto('http://127.0.0.1:5173'+url+'?devUser=888888',{waitUntil:'networkidle'});
 await page.screenshot({path:`./test-results/screens/${url.slice(1)}.png`,fullPage:true});
 results.push({route:url,width:430,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});
 }
 const journey=(await call('GET','/api/journey')).body;const lessonId=journey.nextLesson.id;
 const started=(await call('POST','/api/sessions',{lessonId})).body;
 const items=await sessionItems(started.sessionId);
 for(const item of items){if(item.type==='PRONUNCIATION')break;for(const answer of correctAnswers(item))await call('POST',`/api/sessions/${started.sessionId}/answer`,{key:item.key,answer});}
 await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:5173/lesson/'+lessonId+'?devUser=888888',{waitUntil:'networkidle'});
 const mic=page.getByRole('button',{name:'Нажми и говори',exact:true});await mic.waitFor({timeout:15000});
 const before=answers.length;await mic.click();await page.waitForFunction(()=>!!(window as any).__rec);
 await page.evaluate(()=>(window as any).__rec.onend());await page.getByText('Речь не распознана.',{exact:false}).waitFor();
 if(answers.length!==before)throw Error('Silence was submitted as an answer');
 await mic.click();const responsePromise=page.waitForResponse(r=>r.url().endsWith('/answer'));await page.evaluate(()=>(window as any).__rec.onresult({results:[[{transcript:'Dzień dobry'}]]}));
 const answerResponse=await responsePromise;const result=await answerResponse.json();if(!result.correct)throw Error('Recognized transcript was not accepted');await page.waitForTimeout(300);
 await page.screenshot({path:'./test-results/screens/lesson.png',fullPage:true});
 results.push({microphone:'simulated silence gives retry; transcript submitted to real local API',requests:answers.length-before});
 if(errors.length || results.some(r=>r.overflow))throw Error('Browser errors or horizontal overflow: '+JSON.stringify({results,errors}));
 fs.writeFileSync('./test-results/browser-results.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({results,errors}));
 }finally{await browser.close();await vite.close();server.close();await disposeEnv();}
}
main().catch(e=>{console.error(e);process.exit(1)});
