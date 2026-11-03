/**
 * Готовые образы Бобека — товар гардероба (владелец 2026-11-02: «вместо вещей продавать готовые образы, отсортировать по редкости: простые, яркие и самые крутые;
 * цены по образу, не супер дешёвые; можно польские названия уровней»). Устройство и правила — docs/OUTFITS.md.
 *
 * Образ = нарисованное сочетание вещей из `LOOK_VARIANTS` (картинка уже есть). В каталоге это предмет слота `OUTFIT`: покупка списывает цену образа и выдаёт
 * недостающие вещи набора (`source: 'outfit'`), надевание ставит ровно эти вещи. Отдельно вещи наборов больше не продаются (`outfit_only`).
 * Уровни — польские места по возрастанию: `rare` = Osiedle (простые), `epic` = Starówka (яркие), `legendary` = Wawel (самые крутые). Цельные костюмы
 * (`COSTUME`) — тоже готовые образы, их уровень и цена — в `COSTUME_PRICES` (gamification.ts).
 *
 * Цены — моё решение по словам владельца; доход активного игрока — примерно 80–100 Złotki в день (уроки, задания дня, миссии), то есть Osiedle — 2–3 дня,
 * Starówka — около недели, Wawel — 1,5–2 недели. Менять — здесь (и для уже выложенного на прод — охраняемым UPDATE в seed).
 */
import { LOOK_VARIANTS } from '@polski-go/shared';

export type OutfitTier = 'rare' | 'epic' | 'legendary';

export type Outfit = {
  /** Slug предмета каталога: `outfit-<id образа>`. */
  slug: string;
  /** Id образа в LOOK_VARIANTS (имя картинки). */
  variant: string;
  /** Название по-польски (одинаково во всех языках интерфейса: приложение учит польскому). */
  name: string;
  tier: OutfitTier | 'common';
  price: number;
  /** Вещи набора (slug = asset_key), как в LOOK_VARIANTS. Худи в набор не входит: резолвер рисует его сам, когда куртки нет. */
  items: readonly string[];
  /** На картинке видно красное худи (все образы `hoodie-…`). */
  hoodie: boolean;
  /** Стартовый образ «Мандрівник» (худи + рюкзак): есть у всех без покупки. */
  starter?: true;
};

type Row = [variant: string, name: string, tier: OutfitTier, price: number];

/** Порядок строк = порядок в гардеробе внутри уровня. */
const ROWS: readonly Row[] = [
  // Osiedle — простые: худи или куртка и одна-две вещи
  ['hoodie-cap', 'Na luzie', 'rare', 250],
  ['hoodie-glasses', 'Mól książkowy', 'rare', 250],
  ['hoodie-scarf', 'Kibic', 'rare', 250],
  ['hoodie-cap-pack', 'Na wycieczkę', 'rare', 280],
  ['hoodie-glasses-pack', 'Student', 'rare', 280],
  ['hoodie-scarf-pack', 'Kibic w drodze', 'rare', 280],
  ['denim', 'Dżinsowy klasyk', 'rare', 300],
  ['rain', 'Deszczowy dzień', 'rare', 300],
  ['denim-pack', 'Dżins w podróży', 'rare', 320],
  ['rain-pack', 'Szlak w deszczu', 'rare', 320],
  // Starówka — яркие: два-три акцента, куртки с головными уборами, зимние сочетания
  ['hoodie-cap-glasses', 'Miejski luzak', 'epic', 450],
  ['hoodie-cap-scarf', 'Na mecz', 'epic', 450],
  ['hoodie-glasses-scarf', 'Pan profesor', 'epic', 450],
  ['denim-glasses', 'Dżins i okulary', 'epic', 450],
  ['denim-cap', 'Dżins z czapką', 'epic', 450],
  ['rain-glasses', 'Mżawka', 'epic', 450],
  ['rain-cap', 'Pod chmurką', 'epic', 450],
  ['denim-beanie', 'Jesień w mieście', 'epic', 480],
  ['rain-beanie', 'Listopadowa szaruga', 'epic', 480],
  ['hoodie-cap-glasses-pack', 'Turysta', 'epic', 500],
  ['hoodie-cap-scarf-pack', 'Wyjazd na mecz', 'epic', 500],
  ['hoodie-glasses-scarf-pack', 'Erasmus', 'epic', 500],
  ['hoodie-denim-cap-glasses', 'Warstwy na Starówce', 'epic', 600],
  // Wawel — самые крутые: полные комплекты
  ['hoodie-cap-glasses-scarf', 'Patriota', 'legendary', 900],
  ['hoodie-rain-glasses-pack', 'Mazury w deszczu', 'legendary', 900],
  ['denim-beanie-glasses-pack', 'Jesienny podróżnik', 'legendary', 1000],
  ['rain-beanie-glasses-pack', 'Wyprawa w Bieszczady', 'legendary', 1000],
  ['hoodie-denim-cap-glasses-pack', 'Dżinsowa wyprawa', 'legendary', 1000],
  ['hoodie-rain-cap-glasses-pack', 'Tatry w deszczu', 'legendary', 1000],
  ['hoodie-cap-glasses-scarf-pack', 'Pełen ekwipunek', 'legendary', 1100],
];

const variantItems = (id: string): readonly string[] => {
  const v = LOOK_VARIANTS.list.find((x) => x.id === id);
  if (!v) throw new Error(`outfits: образа ${id} нет в LOOK_VARIANTS`);
  return v.items;
};

/** Стартовый образ «Мандрівник»: худи и рюкзак путешественника. Не продаётся, есть у всех. */
export const STARTER_OUTFIT = 'outfit-hoodie-pack';

export const OUTFITS: readonly Outfit[] = [
  { slug: STARTER_OUTFIT, variant: 'hoodie-pack', name: 'Podróżnik', tier: 'common', price: 0, items: variantItems('hoodie-pack'), hoodie: true, starter: true },
  ...ROWS.map(([variant, name, tier, price]): Outfit => ({ slug: `outfit-${variant}`, variant, name, tier, price, items: variantItems(variant), hoodie: variant.startsWith('hoodie') })),
];

export const OUTFIT_BY_SLUG: ReadonlyMap<string, Outfit> = new Map(OUTFITS.map((o) => [o.slug, o]));

/** Вещи, которые есть только в составе образов: отдельно их не продают (иначе набор собирался бы дешевле образа). */
export const OUTFIT_COMPONENTS: ReadonlySet<string> = new Set(OUTFITS.flatMap((o) => o.items));

/**
 * Сняты с продажи (владелец 2026-11-03: «костюмы повторяются в магазине, хотя названия разные»): картинки почти совпадают с парой —
 * «Красный стритстайл» ≈ «Стритстайл», «Пуховик с красной шапкой» ≈ «Снежный пуховик», «Пальто с мехом» ≈ «Дафлкот».
 * В магазине их нет; кто уже купил — видит и надевает как раньше. Покупка — 409 `retired`.
 */
export const RETIRED_LOOKS: ReadonlySet<string> = new Set(['costume-street-red', 'costume-puffer-stripes', 'costume-sherpa']);

