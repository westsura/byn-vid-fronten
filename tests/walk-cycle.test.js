// Walk-cycle pilot (REQUEST_003): manifest consistency and the distance counter
// that drives the frames.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sim, state, player, run } from './helpers.js';

const m = JSON.parse(readFileSync(new URL('../dist/assets/prototype/walk-pilot-v1/manifest.json', import.meta.url)));

test('walk manifest: 8 frames, 28 px/unit, fixed pivot, helmet and muzzle', () => {
  const a = m.animations['german-rifleman-walk'];
  assert.equal(a.frames.length, 8);
  assert.equal(a.drive, 'distance');
  assert.ok(a.cycleDistanceUnits >= 20 && a.cycleDistanceUnits <= 28);
  const f0 = m.frames[a.frames[0]];
  for (const k of a.frames) {
    const f = m.frames[k];
    assert.equal(f.pixelsPerUnit, 28);
    assert.deepEqual(f.pivot, f0.pivot);
    assert.deepEqual(f.helmetCenter, f0.helmetCenter);
    assert.deepEqual(f.muzzle, f0.muzzle);
  }
});

test('walked distance grows with movement and stops when the squad stops or the game is paused', () => {
  sim.reset();
  sim.select(0);
  const s = player();
  const m0 = s.men[1];
  const start = { x: m0.x, y: m0.y, w: m0.walked };
  sim.issue(s.x + 120, s.y);
  run(40);
  const moved = Math.hypot(m0.x - start.x, m0.y - start.y);
  const walked = m0.walked - start.w;
  assert.ok(walked >= moved - 1e-6, `walked ${walked} < moved ${moved}`);
  assert.ok(walked < moved * 1.5 + 5, `walked ${walked} much larger than moved ${moved}`);
  state.paused = true;
  const w = m0.walked;
  sim.step(0.05);
  assert.equal(m0.walked, w);
  state.paused = false;
  run(400);
  const w2 = m0.walked;
  run(20);
  assert.ok(!m0.moving);
  assert.equal(m0.walked, w2);
});
