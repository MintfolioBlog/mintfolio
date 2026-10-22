import assert from 'node:assert/strict';
import test from 'node:test';
import { assertSupportedNode, NODE_VERSION_RANGE } from '../bin/lib/node-version.mjs';

test('Node security floor accepts patched supported release lines', () => {
  for (const version of ['22.23.4', '22.24.0', '24.22.1', '24.23.0', '26.12.1', '26.13.0']) {
    assert.doesNotThrow(() => assertSupportedNode(version), version);
  }
  assert.equal(typeof NODE_VERSION_RANGE, 'string');
});

test('Node security floor rejects vulnerable newer majors and unsupported lines', () => {
  for (const version of ['20.20.0', '22.23.3', '23.11.0', '24.19.0', '24.22.0', '25.9.0', '26.12.0', '24.22.1-rc.1', 'invalid']) {
    assert.throws(() => assertSupportedNode(version), /需要已修复安全漏洞的 Node.js/, version);
  }
});
