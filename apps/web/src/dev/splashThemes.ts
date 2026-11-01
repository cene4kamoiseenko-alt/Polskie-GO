/** Dev-темы экрана загрузки (`?splash=sunset|adventure`). Подключается только из lib/splashArt.ts за `import.meta.env.DEV`: в сборку не попадает. */
import adventureBg640 from './splash-themes/adventure/bg@640.webp';
import adventureBg from './splash-themes/adventure/bg.webp';
import adventureBobek from './splash-themes/adventure/bobek.webp';
import adventureLogo from './splash-themes/adventure/logo.webp';
import sunsetBg640 from './splash-themes/sunset/bg@640.webp';
import sunsetBg from './splash-themes/sunset/bg.webp';
import sunsetBobek from './splash-themes/sunset/bobek.webp';
import sunsetLogo from './splash-themes/sunset/logo.webp';
import { ROYAL_ART, type SplashArt, type SplashTheme } from '../lib/splashArt';

export function devSplashArt(theme: SplashTheme): SplashArt {
  if (theme === 'sunset') return { theme, bg: sunsetBg, bg640: sunsetBg640, bobek: sunsetBobek, logo: sunsetLogo };
  if (theme === 'adventure') return { theme, bg: adventureBg, bg640: adventureBg640, bobek: adventureBobek, logo: adventureLogo };
  return ROYAL_ART;
}
