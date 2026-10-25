import { afterAll, describe, expect, it } from 'vitest';
import { disposeEnv, login } from './helpers';

afterAll(disposeEnv);

describe('Налаштування: підказка вимови', () => {
  it('типово «просто», змінюється на IPA чи «сховати», інше значення відхиляється', async () => {
    const { call } = await login();
    expect((await call('GET', '/api/me')).body.settings.pronHint).toBe('simple');
    expect((await call('PATCH', '/api/me/settings', { pronHint: 'ipa' })).body.settings.pronHint).toBe('ipa');
    expect((await call('PATCH', '/api/me/settings', { pronHint: 'off' })).body.settings.pronHint).toBe('off');
    expect((await call('PATCH', '/api/me/settings', { pronHint: 'cyrillic' })).status).toBe(400);
    expect((await call('GET', '/api/me')).body.settings.pronHint).toBe('off');
  });
});
