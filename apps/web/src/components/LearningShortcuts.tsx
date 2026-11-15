import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../i18n';
import { GameIcon } from './GameIcon';
import { Sheet } from './ui';
import { SectionDirectory } from './SectionDirectory';

export function LearningShortcuts() {
  const { t } = useT();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  return <>
    <div className="learning-shortcuts mx-4" data-learning-shortcuts>
      <button type="button" onClick={() => setOpen(true)}><GameIcon name="review" size={76} /><span>{t('home_practice')}</span></button>
      <button type="button" onClick={() => nav('/dictionary')}><GameIcon name="dictionary" size={76} /><span>{t('home_tile_dict')}</span></button>
      <button type="button" onClick={() => nav('/grammar')}><GameIcon name="grammar" size={76} /><span>{t('home_tile_grammar')}</span></button>
    </div>
    <Sheet open={open} onClose={() => setOpen(false)} label={t('home_practice')}><h2 className="mb-3 text-xl font-black">{t('compact_learning_tools')}</h2><SectionDirectory group="study" /></Sheet>
  </>;
}
