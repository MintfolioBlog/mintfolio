import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadTheme, isWithin } from '../src/engine/loader.mjs';
import { resolveSettings } from '../src/engine/schema.mjs';
import { objectText } from './lib/config-source.mjs';

const aliases = { verdant: '@mintfolio/theme-verdant' };

/** @param {string} name Installed npm package or built-in theme selector. @returns {string} */
export function normalizeThemeName(name) { return Object.hasOwn(aliases, name) ? aliases[name] : name; }

/** Read package metadata without importing theme code or its configuration template. */
async function packageAt(directory) {
  try { return JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

/**
 * Theme packages may ship a commented settings template with mintfolio.configTemplate.
 * The path is relative to the owning package, checked after resolving symlinks.
 * @param {string} manifestPath Resolved theme.mjs path.
 * @returns {Promise<string|null>} Safe template filename, or generic schema generation.
 */
async function templateFor(manifestPath) {
  let directory = path.dirname(manifestPath);
  while (directory !== path.dirname(directory)) {
    const pkg = await packageAt(directory);
    if (pkg) {
      const relative = pkg.mintfolio?.configTemplate;
      if (relative === undefined) return null;
      if (typeof relative !== 'string' || !relative.startsWith('./') || !relative.endsWith('.mjs')) throw new Error('[theme:config] configTemplate must be a relative .mjs file');
      const filename = await realpath(path.resolve(directory, relative));
      if (!isWithin(filename, await realpath(directory)) || !(await stat(filename)).isFile()) throw new Error('[theme:config] Template escapes its package');
      return filename;
    }
    directory = path.dirname(directory);
  }
  return null;
}

/** Render nested values without hiding defaults or the structure of empty lists. */
function valueSource(setting, value, depth) {
  const indent = '  '.repeat(depth);
  if (setting.type === 'object') return '{\n' + schemaSource(setting.properties, { ...setting.default, ...value }, depth + 1) + '\n' + indent + '}';
  if (setting.type === 'array') {
    if (value.length) return '[\n' + value.map(item => indent + '  ' + valueSource(setting.items, item, depth + 1) + ',').join('\n') + '\n' + indent + ']';
    const example = valueSource(setting.items, setting.items.default, depth + 1);
    return '[\n' + (indent + '  ' + example + ',').split('\n').map(line => indent + '  // ' + line.slice(indent.length + 2)).join('\n') + '\n' + indent + ']';
  }
  return JSON.stringify(value);
}

/** Render every declared field with its meaning, defaults, choices and bounds. */
function schemaSource(schema, values, depth = 1) {
  const indent = '  '.repeat(depth);
  return Object.entries(schema).map(([name, setting]) => {
    const help = [setting.label, setting.description,
      '默认值：' + JSON.stringify(setting.default),
      setting.type === 'select' ? '可选值：' + setting.options.join(' / ') : null,
      setting.type === 'number' ? '范围：' + (setting.min ?? '不限') + ' 至 ' + (setting.max ?? '不限') : null,
    ].filter(Boolean).join('；').replace(/[\r\n\u2028\u2029]+/g, ' ');
    const value = Object.hasOwn(values, name) ? values[name] : setting.default;
    return indent + '// ' + help + '\n' + indent + JSON.stringify(name) + ': ' + valueSource(setting, value, depth) + ',';
  }).join('\n');
}

/** Detect omitted fields before schema defaults conceal an incomplete package template. */
function completeFields(schema, values) {
  return Object.entries(schema).every(([name, setting]) => Object.hasOwn(values, name) && completeValue(setting, values[name]));
}

function completeValue(setting, value) {
  if (setting.type === 'object') return completeFields(setting.properties, value);
  if (setting.type === 'array') return value.every(item => completeValue(setting.items, item));
  return true;
}

/**
 * Commented settings for one theme, written into theme.config.mjs as `settings`.
 * A package template is validated against the same manifest that validates host
 * edits; missing fields fall back to schema rendering while retaining template values.
 * @param {string} root Host root with installed dependencies.
 * @param {string} theme Installed package, local theme selector, or Minimal.
 * @returns {Promise<string>} Object literal source starting with `{`.
 */
export async function settingsTemplate(root, theme) {
  const active = await loadTheme({ root, theme: normalizeThemeName(theme) });
  const template = await templateFor(active.manifestPath);
  if (template) {
    const values = (await import(pathToFileURL(template).href)).default;
    const resolved = resolveSettings(active.definition, values);
    // Complete authored templates keep their comments; incomplete ones are regenerated
    // from the contract so new options cannot silently disappear from site config.
    if (completeFields(active.definition.settings, values)) return objectText(await readFile(template, 'utf8'), template);
    return `{\n${schemaSource(active.definition.settings, resolved)}\n}`;
  }
  if (!Object.keys(active.definition.settings).length) return '{}';
  return `{\n${schemaSource(active.definition.settings, active.settings)}\n}`;
}
