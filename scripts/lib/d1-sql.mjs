/**
 * Разбор выгрузки D1 (`wrangler d1 export`) для переезда базы (docs/OPERATIONS_RU.md, раздел 3а):
 * общий для d1-import-order.mjs (перестановка выгрузки) и d1-dump-diff.mjs (сверка старой и новой базы).
 */

/** Разбить SQL на инструкции: ; вне строк и имён; у CREATE TRIGGER — только после END. */
export function splitSql(text) {
  const out = [];
  let cur = '';
  let q = null; // ' " `
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    cur += ch;
    if (q) {
      if (ch === q) {
        if (q === "'" && text[i + 1] === "'") {
          cur += text[++i];
          continue;
        }
        q = null;
      }
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      q = ch;
      continue;
    }
    if (ch === ';') {
      const s = cur.trim();
      if (/^CREATE\s+TRIGGER/i.test(s) && !/\bEND\s*;$/i.test(s)) continue;
      out.push(s);
      cur = '';
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter((s) => s && s !== ';');
}

/** Имя без кавычек: "users", `users`, [users] → users. */
export const unquote = (n) => n.replace(/^[`"[]|[`"\]]$/g, '');

/** Вид инструкции и её объект: таблица у CREATE TABLE и INSERT, имя у индекса и триггера. */
export function classify(s) {
  let m;
  if (/^PRAGMA\b/i.test(s)) return { kind: 'pragma', name: '' };
  if ((m = s.match(/^CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"[]?\w+[`"\]]?)/i))) return { kind: 'table', name: unquote(m[1]) };
  if ((m = s.match(/^INSERT\s+INTO\s+([`"[]?\w+[`"\]]?)/i))) return { kind: 'insert', name: unquote(m[1]) };
  if ((m = s.match(/^CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"[]?\w+[`"\]]?)/i))) return { kind: 'index', name: unquote(m[1]) };
  if ((m = s.match(/^CREATE\s+TRIGGER\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"[]?\w+[`"\]]?)/i))) return { kind: 'trigger', name: unquote(m[1]) };
  return { kind: 'other', name: '' };
}
