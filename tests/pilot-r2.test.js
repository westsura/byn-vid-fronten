// Graphics test pilot-r2 (REQUEST_002): every soldier on both sides has v4-style
// frames, the fallen frames exist, and the delivered registration is consistent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { rosterFrom, pilotRole } from '../dist/src/art.js';

const P = new URL('../dist/assets/prototype/', import.meta.url);
const read = (f) => JSON.parse(readFileSync(new URL(f, P)));
const v1 = read('infantry-v1/manifest.json');
const defs = { german: read('infantry-v1/german-squad.json'), soviet: read('infantry-v1/soviet-squad.json') };
const r2 = read('request-002-v1/manifest.json').frames;
const reg = read('request-002-v1/soviet-rifleman-registration.json').frames;

// Frame keys available in pilot-r2, named faction-role-pose (as art.js maps them).
const keys = new Set([
  ...Object.keys(read('german-helmet-v2/manifest.json').frames),
  ...Object.keys(read('german-support-v1/manifest.json').frames),
  ...Object.keys(r2),
  ...Object.keys(reg).map((k) => k.replace(/^soviet-/, 'soviet-rifleman-')),
]);

for (const faction of ['german', 'soviet']) {
  test(`pilot-r2: all ${faction} soldiers have ready and prone frames`, () => {
    const roster = rosterFrom(faction, defs[faction], v1.atlases[faction]);
    for (const m of roster) {
      const role = pilotRole(faction, m);
      assert.ok(role, `${m.title} (${m.weapon}) has no pilot role`);
      for (const pose of ['ready', 'prone']) assert.ok(keys.has(`${faction}-${role}-${pose}`), `${faction}-${role}-${pose}`);
    }
  });
  test(`pilot-r2: ${faction} fallen variants a and b`, () => {
    for (const v of ['a', 'b']) {
      const d = r2[`${faction}-fallen-${v}`];
      assert.ok(d);
      assert.equal(d.pixelsPerUnit, 28);
      assert.equal(d.muzzle, null);
      const [, , w, h] = d.sourceRect;
      assert.ok(d.pivot[0] > 0 && d.pivot[0] < w && d.pivot[1] > 0 && d.pivot[1] < h);
    }
  });
}

test('pilot-r2: muzzle lies within 0.5 units of the heading line through the pivot', () => {
  for (const [k, d] of Object.entries({ ...r2, ...reg })) {
    if (!d.muzzle) continue;
    const side = (d.muzzle[1] - d.pivot[1]) / d.pixelsPerUnit;
    assert.ok(Math.abs(side) < 0.5, `${k}: ${side.toFixed(2)}`);
  }
});
