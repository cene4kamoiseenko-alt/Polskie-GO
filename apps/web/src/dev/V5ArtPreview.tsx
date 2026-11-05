/**
 * Bobek V5 standalone front-IDLE art fit preview.
 * This intentionally does NOT replace the app's approved legacy Beaver and
 * does not read, write or mutate the user's paid wardrobe.
 */
import { useState } from 'react';
const sprites=import.meta.glob('./bobek-v5/*.webp',{eager:true,import:'default'}) as Record<string,string>;
type Look='body'|'composite-red'|'composite-denim';
const url=(name:Look)=>sprites[`./bobek-v5/${name}.webp`];
const required:Look[]=['body','composite-red','composite-denim'];
const ready=required.every(n=>Boolean(url(n)));

export default function V5ArtPreview(){
  const [look,setLook]=useState<Look>('composite-red');
  return <section className="card mt-3 p-3" data-bobek-v5-preview aria-label="Bobek V5 — одна геометрія тіла">
    <h2 className="text-sm font-bold">Bobek V5 · Спільне тіло, окремий одяг</h2>
    <p className="mt-1 text-xs">
      Перевірка нової системи: базове тіло та два різні костюми відмальовані
      на одній сітці 1024×1024, без незалежного масштабування деталей.
      Це експериментальний front-idle, не затверджений преміальний 2.5D-риг.
    </p>
    <div className="mt-2 grid grid-cols-3 gap-2">
      {([
        ['body','Тіло'],
        ['composite-red','Худі PL'],
        ['composite-denim','Джинсова куртка'],
      ] as const).map(([id,label])=><button key={id}
        className="btn btn-ghost min-h-11 text-xs"
        data-bobek-v5-choice={id}
        aria-pressed={look===id}
        disabled={!ready}
        onClick={()=>setLook(id)}
      >{label}</button>)}
    </div>
    {ready ? <figure className="mt-2 flex flex-col items-center rounded-xl bg-white/80 p-2">
      <img src={url(look)} alt={look==='body'?'Бобек без одягу':look==='composite-red'?'Бобек у червоному худі PL':'Бобек у синій джинсовій куртці'}
        className="w-full max-w-[290px]" loading="lazy" data-bobek-v5-image/>
      <figcaption className="mt-1 text-center text-xs">
        {look==='body'?'Експериментальна база без одягу':look==='composite-red'?'Худі PL, окремі зареєстровані шари':'Куртка, інший крій та той самий центр тіла'}
      </figcaption>
    </figure> : <p className="mt-2 text-xs text-coral">
      Потрібно виконати npm run bobek:v5:generate перед збіркою клієнта.
    </p>}
    <p className="mt-2 text-xs text-coral">
      Обмеження: нова основа відрізняється від затвердженого персонажа;
      освітлення, мордочка, шви та рукави потребують художньої перевірки.
      Анімація і реальний магазин тут вимкнені.
    </p>
  </section>;
}
