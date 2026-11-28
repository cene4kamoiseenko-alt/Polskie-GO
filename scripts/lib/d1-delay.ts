/**
 * Задержка каждого обращения к D1 для локальных замеров (1.0, этап 1.2): база в Miniflare отвечает за миллисекунды, а production-база
 * сейчас в Океании (~220 мс на обращение), после переезда в Европу — десятки мс. Обёртка делает локальный стенд похожим на нужный случай.
 * Обращение = all/first/run/raw у запроса или batch целиком (как в apps/server/src/db/metrics.ts).
 */
export function delayedD1(d1: D1Database, ms: number): D1Database {
  if (!ms) return d1;
  const wait = () => new Promise((r) => setTimeout(r, ms));
  const originals = new WeakMap<object, D1PreparedStatement>();
  const wrapStmt = (s: D1PreparedStatement): D1PreparedStatement => {
    const w = new Proxy(s, {
      get(t, p) {
        if (p === 'bind') return (...a: unknown[]) => wrapStmt(t.bind(...a));
        if (p === 'all' || p === 'first' || p === 'run' || p === 'raw') return async (...a: unknown[]) => (await wait(), (t[p] as (...x: unknown[]) => unknown)(...a));
        const v = Reflect.get(t, p, t);
        return typeof v === 'function' ? v.bind(t) : v;
      },
    });
    originals.set(w, s);
    return w;
  };
  return new Proxy(d1, {
    get(t, p) {
      if (p === 'prepare') return (q: string) => wrapStmt(t.prepare(q));
      if (p === 'batch') return async (list: D1PreparedStatement[]) => (await wait(), t.batch(list.map((s) => originals.get(s) ?? s)));
      const v = Reflect.get(t, p, t);
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
}
