import { CITY_CONTENT } from '../apps/server/src/content/seed';
import { VOCAB } from '../apps/server/src/content/vocab';
import { SLANG } from '../apps/server/src/content/slang';
import { ITEMS } from '../apps/server/src/content/gamification';
import { writeFileSync } from 'node:fs';
const exercises: any[]=[];
const cities=CITY_CONTENT.map(c=>{ const ls=c.routes.flatMap(r=>r.lessons); for(const l of ls) for(const [i,e] of l.exercises.entries()) exercises.push({lesson:l.slug,index:i,...e}); return {city:c.city, routes:c.routes.filter(r=>r.lessons.some(l=>!l.kind||l.kind==='LESSON')).length,lessons:ls.length, exercises:ls.reduce((n,l)=>n+l.exercises.length,0),short:ls.filter(l=>l.exercises.length<15).map(l=>[l.slug,l.exercises.length]), details:c.routes.map(r=>({route:r.slug,lessons:r.lessons.map(l=>({slug:l.slug,n:l.exercises.length,types:new Set(l.exercises.map(e=>e.type)).size}))}))};});
const groups=new Map<string,any[]>();
for(const e of exercises){ const sig=JSON.stringify({type:e.type,data:e.data}); const a=groups.get(sig)||[];a.push({lesson:e.lesson,index:e.index});groups.set(sig,a); }
const duplicates=[...groups.values()].filter(a=>a.length>1);
const result={cities,vocab:VOCAB.length,slang:SLANG.length,items:ITEMS.map(i=>({slug:i.slug,price:i.price,rewardOnly:i.rewardOnly})),duplicateGroups:duplicates.length,duplicateExtra:duplicates.reduce((n,g)=>n+g.length-1,0),duplicates,odd:exercises.filter(e=>e.type==='ODD_ONE_OUT'),exercises};
writeFileSync(process.argv[2]||'/tmp/content-audit.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({cities:cities.map(({details,...c})=>c),vocab:result.vocab,slang:result.slang,duplicates:result.duplicateGroups,extra:result.duplicateExtra},null,2));
