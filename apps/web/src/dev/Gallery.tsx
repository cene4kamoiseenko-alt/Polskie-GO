/** Галерея станів маскота (лише для розробки: /__gallery). */
import { Beaver, type BeaverMood } from '../components/Beaver';

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

export default function Gallery() {
  return (
    <div className="min-h-screen bg-[var(--bg)] p-4">
      <div className="grid grid-cols-3 gap-3">
        {MOODS.map(([m, label]) => (
          <div key={m} className="card flex flex-col items-center p-2">
            <Beaver mood={m} size={110} animate={false} />
            <div className="text-xs font-black">{label}</div>
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
