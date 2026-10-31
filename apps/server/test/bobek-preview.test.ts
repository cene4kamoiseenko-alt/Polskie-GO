import { describe, expect, it } from 'vitest';
import { readBobekPreviewEquipment } from '../../web/src/lib/bobekPreview';

describe('Bobek preview is local, opt-in and bounded', () => {
  it('never modifies the default experience unless QA is enabled', () => {
    expect(readBobekPreviewEquipment('')).toBeNull();
    expect(readBobekPreviewEquipment('0\n{"equipment":["jacket-denim"]}')).toBeNull();
  });

  it('starts with the signature outfit if storage is missing or corrupted', () => {
    expect(readBobekPreviewEquipment('1\n')).toEqual(['hoodie-red', 'backpack-travel']);
    expect(readBobekPreviewEquipment('1\n{invalid')).toEqual(['hoodie-red', 'backpack-travel']);
    expect(readBobekPreviewEquipment('1\n{"equipment":"invalid"}')).toEqual(['hoodie-red', 'backpack-travel']);
  });

  it('restores real prototype item ids and rejects unknown or huge arrays', () => {
    const allowed = ['backpack-travel', 'jacket-denim', 'cap-red', 'glasses-round'];
    const snapshot = '1\n' + JSON.stringify({ equipment: [...allowed, ...Array(1000).fill('not-an-item'), 16, { id: 'fake' }] });
    expect(readBobekPreviewEquipment(snapshot)).toEqual(allowed);
  });

  it('preserves an intentionally empty preview (signature defaults are provided by resolveLook)', () => {
    expect(readBobekPreviewEquipment('1\n{"equipment":[]}')).toEqual([]);
  });
});
