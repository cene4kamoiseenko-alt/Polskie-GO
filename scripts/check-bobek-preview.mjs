/**
 * Run with: node --import tsx scripts/check-bobek-preview.mjs
 * Browser storage is not required: tests the pure snapshot parser.
 * This file is intentionally outside the Cloudflare Worker TS project.
 */
import assert from 'node:assert/strict';
import { readBobekPreviewEquipment } from '../apps/web/src/lib/bobekPreview.ts';

const snapshot = (flag, equipment) => `${flag}\n${JSON.stringify({ equipment })}`;
assert.equal(readBobekPreviewEquipment(''), null);
assert.equal(readBobekPreviewEquipment(snapshot('0', ['jacket-denim'])), null);
assert.deepEqual(readBobekPreviewEquipment('1\n'), ['hoodie-red', 'backpack-travel']);
assert.deepEqual(readBobekPreviewEquipment('1\ninvalid-json'), ['hoodie-red', 'backpack-travel']);
assert.deepEqual(readBobekPreviewEquipment('1\n{"equipment":"invalid"}'), ['hoodie-red', 'backpack-travel']);
assert.deepEqual(readBobekPreviewEquipment(snapshot('1', [])), []);
assert.deepEqual(
  readBobekPreviewEquipment(snapshot('1', ['backpack-travel', 'jacket-denim', 'cap-red', 'glasses-round', ...Array(500).fill('unknown'), 12, null])),
  ['backpack-travel', 'jacket-denim', 'cap-red', 'glasses-round'],
);
console.log('Bobek QA preview: 7 snapshot checks passed; no server equipment mutations.');
