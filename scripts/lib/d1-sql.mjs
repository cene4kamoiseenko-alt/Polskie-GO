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

/** Предел длины инструкции D1 — 100 000 байт; с запасом. */
export const STATEMENT_LIMIT = 90_000;
const HEX_CHUNK = 80_000; // символов hex (= 40 КБ данных), ASCII
const TEXT_CHUNK_BYTES = 60_000;

/** Значения VALUES(...) верхнего уровня: строки '…' (с ''), двоичные X'…', числа, NULL. */
function splitValues(body) {
  const out = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (q) {
      cur += ch;
      if (ch === "'") {
        if (body[i + 1] === "'") cur += body[++i];
        else q = false;
      }
      continue;
    }
    if (ch === "'") {
      q = true;
      cur += ch;
    } else if (ch === ',') {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

/** Колонки первичного ключа из CREATE TABLE (на уровне колонки или таблицы). */
export function primaryKey(createSql) {
  const table = /PRIMARY\s+KEY\s*\(([^)]+)\)/i.exec(createSql);
  if (table) return table[1].split(',').map((c) => unquote(c.trim()));
  const col = createSql.split('\n').find((l) => /\bPRIMARY\s+KEY\b/i.test(l));
  const m = col && /^\s*([`"[]?\w+[`"\]]?)/.exec(col);
  return m ? [unquote(m[1])] : [];
}

/** Строка '…' → части, каждая не длиннее TEXT_CHUNK_BYTES в UTF-8, без разрыва суррогатных пар; снова в виде литералов. */
function textChunks(literal) {
  const text = literal.slice(1, -1).replaceAll("''", "'");
  const parts = [];
  let cur = '';
  let bytes = 0;
  for (const ch of text) {
    const b = Buffer.byteLength(ch);
    if (bytes + b > TEXT_CHUNK_BYTES) {
      parts.push(cur);
      cur = '';
      bytes = 0;
    }
    cur += ch;
    bytes += b;
  }
  if (cur) parts.push(cur);
  return parts.map((p) => `'${p.replaceAll("'", "''")}'`);
}

/**
 * INSERT длиннее предела D1 (найдено на копии production: аудио 86 КБ в tts_cache → инструкция 172 КБ): самое длинное значение
 * заменяется пустым, затем дописывается по частям UPDATE … SET col = col || часть WHERE <первичный ключ>. Байты те же
 * (двоичное — через CAST … AS BLOB). Триггеры при загрузке ещё не созданы (их ставит d1-import-order в конце), поэтому UPDATE их не будит.
 */
export function splitLongInsert(stmt, createSql) {
  if (Buffer.byteLength(stmt) <= STATEMENT_LIMIT) return [stmt];
  const m = /^INSERT\s+INTO\s+([`"[]?\w+[`"\]]?)\s*\(([^)]*)\)\s*VALUES\s*\(([\s\S]*)\)\s*;?\s*$/i.exec(stmt);
  if (!m) throw new Error(`длинная инструкция не похожа на INSERT … VALUES(…): ${stmt.slice(0, 80)}`);
  const table = m[1];
  const cols = m[2].split(',').map((c) => c.trim());
  const vals = splitValues(m[3]);
  if (cols.length !== vals.length) throw new Error(`${table}: колонок ${cols.length}, значений ${vals.length}`);
  const pk = primaryKey(createSql ?? '');
  if (!pk.length) throw new Error(`${table}: длинная строка, а первичного ключа нет — разбить нельзя`);
  const where = pk
    .map((k) => {
      const i = cols.findIndex((c) => unquote(c) === k);
      if (i < 0) throw new Error(`${table}: нет колонки ключа ${k}`);
      return `"${k}" = ${vals[i]}`;
    })
    .join(' AND ');
  const updates = [];
  const build = () => `INSERT INTO ${table} (${cols.join(',')}) VALUES(${vals.join(',')});`;
  while (Buffer.byteLength(build()) > STATEMENT_LIMIT) {
    let at = -1;
    for (let i = 0; i < vals.length; i++) if (/^(X)?'/i.test(vals[i]) && (at < 0 || vals[i].length > vals[at].length)) at = i;
    if (at < 0 || vals[at].length < 3) throw new Error(`${table}: не удаётся уложить строку в предел`);
    const col = cols[at];
    if (pk.includes(unquote(col))) throw new Error(`${table}: слишком длинный первичный ключ`);
    const v = vals[at];
    if (/^X'/i.test(v)) {
      const hex = v.slice(2, -1);
      vals[at] = "X''";
      for (let i = 0; i < hex.length; i += HEX_CHUNK) updates.push(`UPDATE ${table} SET ${col} = CAST(${col} || X'${hex.slice(i, i + HEX_CHUNK)}' AS BLOB) WHERE ${where};`);
    } else {
      vals[at] = "''";
      for (const part of textChunks(v)) updates.push(`UPDATE ${table} SET ${col} = ${col} || ${part} WHERE ${where};`);
    }
  }
  return [build(), ...updates];
}
