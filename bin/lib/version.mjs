import { readFile } from 'node:fs/promises';
/** Read the executing package version without loading site setup, parsers or prompts. */
export async function cliVersion() {
  return JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8')).version;
}
