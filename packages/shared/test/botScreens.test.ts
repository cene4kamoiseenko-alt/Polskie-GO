import { describe, expect, it } from 'vitest';
import { BOT_SCREENS, botScreenRoute, isBotScreen, resolveLaunchRoute, withBotScreen } from '../src';

describe('переходы из Telegram-бота (bot_screen)', () => {
  it('белый список: девять экранов + главная, всё остальное отвергается', () => {
    expect(Object.values(BOT_SCREENS).sort()).toEqual(['/', '/achievements', '/dictionary', '/grammar', '/learn', '/map', '/profile', '/quests', '/settings', '/slang']);
    for (const bad of ['premium', 'admin', '../map', '/map', 'constructor', '__proto__', 'toString', '', 'MAP']) {
      expect(isBotScreen(bad), bad).toBe(false);
      expect(botScreenRoute(bad), bad).toBeNull();
    }
    expect(botScreenRoute(null)).toBeNull();
    expect(botScreenRoute(undefined)).toBeNull();
  });

  it('?bot_screen= в адресе Mini App превращается в маршрут', () => {
    expect(resolveLaunchRoute('?bot_screen=map')).toBe('/map');
    expect(resolveLaunchRoute('?v=1&bot_screen=dictionary&x=2')).toBe('/dictionary');
    expect(resolveLaunchRoute('?bot_screen=home')).toBe('/');
    expect(resolveLaunchRoute('?bot_screen=https://evil.example')).toBeNull();
    expect(resolveLaunchRoute('?bot_screen=%2Fadmin')).toBeNull();
    expect(resolveLaunchRoute('')).toBeNull();
  });

  it('startapp=screen_<имя> (чаты без web_app-кнопок) работает; ref_, story_, premium не трогаются', () => {
    expect(resolveLaunchRoute('', 'screen_quests')).toBe('/quests');
    expect(resolveLaunchRoute('', 'screen_nope')).toBeNull();
    for (const p of ['ref_abc123', 'story_cafe', 'premium', 'lesson_1']) expect(resolveLaunchRoute('', p), p).toBeNull();
    // Параметр запроса приоритетнее, но реферальный startapp в адресе не мешает.
    expect(resolveLaunchRoute('?startapp=ref_abc&bot_screen=learn', 'ref_abc')).toBe('/learn');
  });

  it('адрес кнопки: сохраняет путь и параметры базового адреса, home без параметра, startapp не затирается', () => {
    expect(withBotScreen('https://polski.example/', 'map')).toBe('https://polski.example/?bot_screen=map');
    expect(withBotScreen('https://polski.example/app/?v=1', 'learn')).toBe('https://polski.example/app/?v=1&bot_screen=learn');
    expect(withBotScreen('https://polski.example/app', 'home')).toBe('https://polski.example/app');
    expect(withBotScreen('https://polski.example/', 'home', { startapp: 'ref_x' })).toBe('https://polski.example/?startapp=ref_x');
    expect(withBotScreen('https://polski.example/?bot_screen=old', 'quests')).toBe('https://polski.example/?bot_screen=quests');
    const url = new URL(withBotScreen('https://polski.example/app/?v=1', 'settings'));
    expect(url.searchParams.get('v')).toBe('1');
    expect(resolveLaunchRoute(url.search)).toBe('/settings');
  });
});
