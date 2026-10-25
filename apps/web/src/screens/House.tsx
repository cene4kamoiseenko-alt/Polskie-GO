import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n';
import { useMe, useShop } from '../lib/queries';
import { Beaver } from '../components/Beaver';
import { ITEM_PICTO, PictoTile } from '../components/pictograms/Pictogram';
import { EmptyState, ScreenHeader, ScreenSkeleton } from '../components/ui';

/** Розміщення предметів у кімнаті (відсотки від ширини/висоти сцени). */
const SPOTS: Record<string, [number, number, number]> = {
  'bed-basic': [14, 70, 64], 'bed-cozy': [14, 70, 70], desk: [78, 72, 54], bookshelf: [86, 40, 56], sofa: [50, 76, 64], lamp: [66, 58, 40],
  plant: [32, 74, 42], 'rug-red': [48, 90, 70], 'poster-poland': [30, 26, 46], 'map-wall': [60, 24, 50],
  'souvenir-syrenka': [76, 46, 30], 'souvenir-dragon': [86, 46, 30], 'souvenir-krasnal': [94, 46, 30],
};

export default function HouseScreen() {
  const { t } = useT();
  const nav = useNavigate();
  const me = useMe().data;
  const shop = useShop();
  if (!me || shop.isLoading) return <ScreenSkeleton />;
  const placed = me.outfit.house;
  return (
    <div className="pb-6">
      <ScreenHeader title={t('house_title')} subtitle={me.profile.beaverName} right={<button className="chip" onClick={() => nav('/shop?house=1')}>{t('house_edit')}</button>} />
      <div className="relative mx-4 aspect-[4/3] overflow-hidden rounded-[28px] border-4 border-[#C8742E]" style={{ background: 'linear-gradient(180deg,#FFF2C8 0%,#FFE7A8 62%,#D9A066 62%,#C8742E 100%)' }}>
        {/* вікно */}
        <div className="absolute left-[44%] top-[8%] h-[26%] w-[20%] rounded-xl border-4 border-white" style={{ background: 'linear-gradient(#8FD3F5,#DFF6E8)' }}>
          <div className="absolute inset-x-0 top-1/2 h-1 bg-white" />
          <div className="absolute inset-y-0 left-1/2 w-1 bg-white" />
        </div>
        {placed.map((key) => {
          const [x, y, s] = SPOTS[key] ?? [50, 60, 40];
          return (
            <motion.div key={key} initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${x}%`, top: `${y}%`, fontSize: s }}>
              <PictoTile spec={ITEM_PICTO[key] ?? null} size={s} />
            </motion.div>
          );
        })}
        <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2">
          <Beaver size={110} outfit={me.outfit.wear} mood={new Date().getHours() >= 22 || new Date().getHours() < 6 ? 'sleep' : 'happy'} />
        </div>
      </div>
      {placed.length <= 1 && <EmptyState text={t('house_empty')} />}
    </div>
  );
}
