#!/usr/bin/env node
/**
 * Замер задержки базы D1 на production (1.0, этап 1.1): один и тот же способ до и после переезда в Европу.
 * GET /api/health N раз подряд; health сам меряет один запрос Worker → D1 (edge.d1.ms) и сообщает регион базы.
 * Печатает p50/p95/p99 для edge.d1.ms и полного ответа (с сетью до клиента), регион базы и точку входа Cloudflare.
 *
 *   node scripts/d1-latency.mjs [https://polskie-go.cene4kamoiseenko.workers.dev] [N=20]
 * Только чтение: health ничего не пишет. Результат «до/после» — в docs/OPERATIONS_RU.md, раздел 3а.
 */
const base = (process.argv[2] ?? 'https://polskie-go.cene4kamoiseenko.workers.dev').replace(/\/$/, '');
const n = Math.max(3, Number(process.argv[3] ?? 20));

const pct = (xs, p) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)];
};

const d1 = [];
const total = [];
const regions = new Set();
const colos = new Set();
let migration = null;
for (let i = 0; i < n; i++) {
  const t0 = performance.now();
  const res = await fetch(`${base}/api/health`, { headers: { 'cache-control': 'no-store' } });
  const body = await res.json();
  total.push(Math.round(performance.now() - t0));
  if (!res.ok) throw new Error(`health ${res.status}`);
  d1.push(body.edge?.d1?.ms ?? NaN);
  regions.add(body.edge?.d1?.region ?? '?');
  colos.add(body.edge?.colo ?? '?');
  migration = body.migration;
}
// Первый запрос часто попадает на холодный изолят — в процентили он входит, отдельно показан как «первый».
const row = (name, xs) => `${name.padEnd(14)} p50 ${String(pct(xs, 50)).padStart(5)} мс   p95 ${String(pct(xs, 95)).padStart(5)} мс   p99 ${String(pct(xs, 99)).padStart(5)} мс   первый ${xs[0]} мс`;
console.log(`${base}  ×${n}  ${new Date().toISOString()}`);
console.log(`база: регион ${[...regions].join(',')}, вход Cloudflare: ${[...colos].join(',')}, миграция ${migration}`);
console.log(row('Worker → D1', d1));
console.log(row('ответ целиком', total));
