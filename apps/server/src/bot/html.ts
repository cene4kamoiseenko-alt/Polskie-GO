/** Экранирование для Telegram `parse_mode=HTML`: достаточно трёх символов (https://core.telegram.org/bots/api#html-style). */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Имя пользователя для приветствия: без управляющих символов, не длиннее 64 знаков, уже экранированное. */
export function safeName(value: unknown): string {
  const cleaned = String(value ?? '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f‪-‮⁦-⁩]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return escapeHtml(Array.from(cleaned).slice(0, 64).join(''));
}
