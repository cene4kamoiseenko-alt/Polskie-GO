import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT, type TKey } from '../i18n';
import { GameIcon, type IconName } from './GameIcon';

type Group = 'study' | 'world' | 'rewards' | 'profile';
const SECTIONS: { group: Group; icon: IconName; title: TKey; path: string }[] = [
  { group: 'study', icon: 'lessons', title: 'nav_learn', path: '/learn' },
  { group: 'study', icon: 'review', title: 'home_review_words', path: '/practice/REVIEW' },
  { group: 'study', icon: 'mistakes', title: 'home_fix_mistakes', path: '/practice/MISTAKES' },
  { group: 'study', icon: 'timer', title: 'home_five', path: '/practice/FIVE_MIN' },
  { group: 'study', icon: 'speed', title: 'home_speed', path: '/practice/SPEED' },
  { group: 'study', icon: 'dictionary', title: 'home_tile_dict', path: '/dictionary' },
  { group: 'study', icon: 'grammar', title: 'home_tile_grammar', path: '/grammar' },
  { group: 'study', icon: 'story', title: 'home_tile_slang', path: '/slang' },
  { group: 'study', icon: 'exam', title: 'home_tile_exams', path: '/exams' },
  { group: 'world', icon: 'map', title: 'nav_map', path: '/map' },
  { group: 'world', icon: 'house', title: 'home_tile_house', path: '/house' },
  { group: 'world', icon: 'city', title: 'home_tile_life', path: '/life' },
  { group: 'world', icon: 'wardrobe', title: 'home_shop', path: '/shop' },
  { group: 'world', icon: 'diary', title: 'profile_diary', path: '/diary' },
  { group: 'world', icon: 'map', title: 'home_passport', path: '/passport' },
  { group: 'rewards', icon: 'quests', title: 'nav_quests', path: '/quests' },
  { group: 'rewards', icon: 'rewards', title: 'pass_title', path: '/pass' },
  { group: 'rewards', icon: 'rewards', title: 'home_achievements', path: '/achievements' },
  { group: 'profile', icon: 'profile', title: 'nav_profile', path: '/profile' },
  { group: 'profile', icon: 'friends', title: 'home_leaderboard', path: '/social' },
  { group: 'profile', icon: 'premium', title: 'home_tile_premium', path: '/premium' },
  { group: 'profile', icon: 'settings', title: 'profile_settings', path: '/settings' },
];
const GROUP_LABEL: Record<Group, TKey> = { study: 'nav_learn', world: 'nav_world', rewards: 'nav_quests', profile: 'nav_profile' };

/** One directory for every existing destination, with localized search. No duplicate feature state. */
export function SectionDirectory({ group }: { group?: Group }) {
  const { t } = useT();
  const nav = useNavigate();
  const [search, setSearch] = useState('');
  const query = search.trim().toLocaleLowerCase();
  const entries = SECTIONS.filter(entry => (!group || entry.group === group) && (group !== 'study' || entry.path !== '/learn') && (!query || t(entry.title).toLocaleLowerCase().includes(query)));
  return <div className={`section-directory ${group === 'study' ? 'is-practice' : ''}`} data-section-directory>
    <label className="directory-search"><span className="sr-only">{t('compact_search')}</span><input type="search" placeholder={t('compact_search')} value={search} onChange={event => setSearch(event.target.value)} /></label>
    {(['study', 'world', 'rewards', 'profile'] as Group[]).map(key => {
      const items = entries.filter(entry => entry.group === key);
      return items.length ? <section key={key} className="directory-group">
        <h3>{t(GROUP_LABEL[key])}</h3>
        <div className="directory-grid">{items.map(entry => <button key={entry.path} type="button" data-destination={entry.path} onClick={() => nav(entry.path)}>
          <GameIcon name={entry.icon} size={group === 'study' ? 80 : 52} className="directory-art" /><span className="directory-title">{t(entry.title)}</span><span className="directory-chevron" aria-hidden="true">›</span>
        </button>)}</div>
      </section> : null;
    })}
    {!entries.length && <p className="muted py-8 text-center" role="status">{t('compact_no_results')}</p>}
  </div>;
}
