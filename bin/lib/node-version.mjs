import { readFileSync } from 'node:fs';
import semver from 'semver';

/** Supported patched Node release lines; package metadata is the single policy source. */
export const NODE_VERSION_RANGE = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')).engines.node;

/**
 * Reject runtimes missing the October 2026 Node security fixes before any command work.
 * @param {string} [version] Node version; defaults to the executing runtime.
 * @returns {void} Throws with upgrade guidance when the version is unsupported.
 */
export function assertSupportedNode(version = process.versions.node) {
  if (!semver.satisfies(version, NODE_VERSION_RANGE)) {
    throw new Error('需要已修复安全漏洞的 Node.js（' + NODE_VERSION_RANGE + '）；当前 ' + version + '。建议升级到 Node.js 24.22.1 或更高的 24.x 版本。');
  }
}
