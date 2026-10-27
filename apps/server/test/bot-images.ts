import versions from '../src/bot/image-versions.json';

/** Адрес картинки бота, как его шлёт botImageUrl: `/bot/<файл>?v=<хэш содержимого>`. */
export function versioned(origin: string, file: string): string {
  const v = (versions as Record<string, string>)[file];
  if (!v) throw new Error(`${file}: нет версии в image-versions.json`);
  return `${origin}/bot/${file}?v=${v}`;
}
