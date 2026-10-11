import assert from 'node:assert/strict';
import test from 'node:test';
import { defineSiteConfig } from '@mintfolio/core/config';
import { normalizeFavicon } from '../src/shared/favicon.mjs';
import { configSchema } from '../bin/lib/config.mjs';
import { runtime } from './helpers/runtime.mjs';

test('favicon configuration preserves intentional defaults and rejects ambiguous or executable URLs', async () => {
  for (const empty of [undefined, '', '   ']) assert.equal(normalizeFavicon(empty), undefined);
  assert.equal(normalizeFavicon(' /favicon.ico?v=2 '), '/favicon.ico?v=2');
  assert.equal(normalizeFavicon('/icons/../favicon.svg'), '/favicon.svg');
  assert.equal(normalizeFavicon('https://cdn.example/icon.png'), 'https://cdn.example/icon.png');
  for (const invalid of [null, 42, {}, './favicon.ico', '//cdn.example/icon.svg', 'javascript:alert(1)', 'data:image/svg+xml,example', 'https:example.com/icon.ico', '/bad icon.ico']) {
    assert.throws(() => defineSiteConfig({ site: { title: 'Example', url: 'https://example.test', favicon: invalid } }), /site.favicon/);
  }
  assert.ok((await configSchema('', 'site')).site.includes('favicon'));
});

test('site favicon reaches all page metadata with exactly one deployment prefix', async t => {
  const active = { definition: { manifest: { id: 'test' }, capabilities: {} }, settings: {} };
  for (const [favicon, expected] of [['/favicon.ico?v=2', '/notes/favicon.ico?v=2'], ['/notes/icon.svg', '/notes/icon.svg'], ['https://cdn.example/icon.png', 'https://cdn.example/icon.png'], ['', undefined]]) {
    const host = await runtime(t, { favicon });
    const { createThemeContext } = await host.load('src/engine/context.ts');
    const theme = await createThemeContext(active);
    assert.equal(theme.site.favicon, expected);
    const { homePage, archivePage, aboutPage, notFoundPage } = await host.load('src/server/pages.ts');
    for (const page of [await homePage(theme), await archivePage(theme), aboutPage(theme), notFoundPage(theme)]) assert.equal(page.seo.favicon, expected);
    const { pageSeo } = await host.load('src/server/seo.ts');
    const locked = { id: 'locked', url: '/notes/blog/locked', title: 'Locked', description: 'Safe', protected: true, tags: [], category: { id: 'Notes', label: 'Notes', url: '/notes/categories/Notes' }, publishedAt: '2020-01-01T00:00:00Z' };
    assert.equal(pageSeo(theme.site, locked.title, locked.description, locked.url, locked).favicon, expected);
  }
});
