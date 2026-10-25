/** Галерея станів маскота (лише для розробки: /__gallery). */
import { Beaver, type BeaverMood } from '../components/Beaver';
import { CityHero } from '../components/CityHero';

const MOODS: [BeaverMood, string][] = [
  ['wave', 'Привітання'],
  ['cheer', 'Правильно!'],
  ['sad', 'Спробуй ще'],
  ['think', 'Думає'],
  ['celebrate', 'Урок пройдено'],
  ['travel', 'Нове місто'],
  ['happy', 'happy'],
  ['surprised', 'surprised'],
  ['read', 'read'],
  ['gift', 'gift'],
  ['learn', 'learn'],
  ['sleep', 'sleep'],
  ['explain', 'explain'],
  ['music', 'music'],
  ['mic', 'mic'],
];

const COSTUMES = ['costume-barista', 'costume-chef', 'costume-conductor', 'costume-krasnal', 'costume-dragon', 'costume-artist', 'costume-winter', 'costume-syrenka'];

export default function Gallery() {
  return (
    <div className="min-h-screen bg-[var(--bg)] p-4">
      {location.search.includes('cities') && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          {['warszawa', 'krakow', 'wroclaw', 'lodz', 'katowice', 'opole', 'gdansk', 'poznan'].map((c) => (
            <div key={c} className="overflow-hidden rounded-2xl"><CityHero slug={c} color="#36B9FF" name={c} height={200} /></div>
          ))}
        </div>
      )}
      <div className="mb-4 flex items-end justify-center gap-2">
        <Beaver mood="wave" size={300} animate={false} outfit={{ BACKPACK: 'backpack-green' }} />
        <Beaver mood="think" size={150} animate={false} />
        <Beaver mood="cheer" size={150} animate={false} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {MOODS.map(([m, label]) => (
          <div key={m} className="card flex flex-col items-center p-2">
            <Beaver mood={m} size={110} animate={false} />
            <div className="text-xs font-black">{label}</div>
          </div>
        ))}
      </div>
      {/* Фірмовий образ (растр за станом) і костюми: растр та векторна запасна версія */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {MOODS.map(([m]) => (
          <div key={m} className="card flex flex-col items-center p-1">
            <Beaver mood={m} size={80} animate={false} outfit={{ JACKET: 'hoodie-red', BACKPACK: 'backpack-travel' }} />
            <div className="text-[10px] font-black">{m}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {COSTUMES.map((c) => (
          <div key={c} className="card flex flex-col items-center p-1">
            <div className="flex items-end">
              <Beaver size={90} animate={false} outfit={{ COSTUME: c, BACKPACK: 'backpack-travel' }} />
              <Beaver size={90} animate={false} vectorOnly outfit={{ COSTUME: c, BACKPACK: 'backpack-travel' }} />
            </div>
            <div className="text-[10px] font-black">{c.slice(8)}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-end gap-3">
        <Beaver mood="happy" size={40} animate={false} />
        <Beaver mood="happy" size={64} animate={false} />
        <Beaver mood="wave" size={90} animate={false} outfit={{ HAT: 'cap-green', GLASSES: 'glasses-sun' }} />
        <Beaver mood="happy" size={90} animate={false} outfit={{ JACKET: 'hoodie-red', SCARF: 'scarf-pl', BACKPACK: 'backpack-map' }} />
      </div>
    </div>
  );
}
