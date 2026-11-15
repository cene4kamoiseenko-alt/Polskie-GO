import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n';
import { useJourney } from '../lib/queries';
import { cityArtImage } from '../lib/assets';
import { HouseCard } from '../components/HouseCard';
import { SectionDirectory } from '../components/SectionDirectory';
import { Sheet } from '../components/ui';
import { TopStats, PassCard } from './Home';
import { GameIcon } from '../components/GameIcon';

export default function WorldScreen() {
  const { t } = useT();
  const nav = useNavigate();
  const journey = useJourney();
  const [directory, setDirectory] = useState(false);
  const city = journey.data?.cities.find(city => city.id === journey.data?.currentCityId);
  const art = cityArtImage(city?.slug ?? 'warszawa');
  return <div className="space-y-4 pb-4" data-world-screen>
    <TopStats compact />
    <header className="compact-heading mx-4"><div><h1>{t('world_title')}</h1><p className="muted mt-1 text-sm font-bold">{t('world_subtitle')}</p></div><button type="button" onClick={() => setDirectory(true)}>{t('home_all_sections')}</button></header>
    <button type="button" className="world-map-card mx-4" onClick={() => nav('/map')} data-world-map>
      {art && <img src={art.src} srcSet={art.srcSet} sizes="(min-width:576px) 544px,calc(100vw - 32px)" alt="" decoding="async" />}
      <span><span className="compact-kicker">{t('nav_map')}</span><strong>{city?.namePl ?? 'Warszawa'}</strong><b>{t('compact_open_map')} →</b></span>
    </button>
    <HouseCard />
    <PassCard />
    <div className="world-shortcuts mx-4">
      <button type="button" onClick={() => nav('/life')}><GameIcon name="city" size={42} /><strong>{t('home_tile_life')}</strong></button>
      <button type="button" onClick={() => nav('/shop')}><GameIcon name="wardrobe" size={42} /><strong>{t('home_shop')}</strong></button>
      <button type="button" onClick={() => nav('/passport')}><GameIcon name="diary" size={42} /><strong>{t('home_passport')}</strong></button>
    </div>
    <Sheet open={directory} onClose={() => setDirectory(false)} label={t('home_all_sections')}><SectionDirectory /></Sheet>
  </div>;
}
