/**
 * Прототипні WebP завантажуються окремим Vite чанком.
 * Production не імпортує їх до ввімкнення QA-перегляду.
 */
const files = import.meta.glob('./look-proto/**/*.webp', { eager: true, import: 'default' }) as Record<string, string>;

export function protoAssetUrl(key: string, width: number): string | null {
  if (!key.startsWith('proto/') || key.includes('..')) return null;
  const path = key.replace(/^proto\//, './look-proto/');
  if (width <= 512 && files[`${path}@512.webp`]) return files[`${path}@512.webp`];
  return files[`${path}.webp`] ?? files[`${path}@512.webp`] ?? null;
}
