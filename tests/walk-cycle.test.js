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

const m2 = JSON.parse(readFileSync(new URL('../dist/assets/prototype/walk-v2-layers/manifest.json', import.meta.url)));

test('walk v2: three layers per frame, planted leg left in 0-3 and right in 4-7', () => {
  const a = m2.animations['german-rifleman-walk'];
  assert.equal(a.frames.length, 8);
  a.frames.forEach((k, i) => {
    const f = m2.frames[k];
    assert.deepEqual(Object.keys(f.layers).sort(), ['leg-left', 'leg-right', 'upper']);
    assert.deepEqual(f.pivot, [600, 390]);
    assert.equal(f.plantedLeg, i < 4 ? 'left' : 'right');
    // muzzle within 1 unit of the ready muzzle (helmet correction 2: [1115, 400])
    assert.ok(Math.abs(f.muzzle[0] - 1115) / 28 <= 1 && Math.abs(f.muzzle[1] - 400) / 28 <= 1, k);
  });
});

test('walk v2: with the engine shift the planted foot stays put on the ground during each stance', () => {
  const a = m2.animations['german-rifleman-walk'];
  const c = a.cycleDistanceUnits;
  const per = c / a.frames.length;
  for (const stance of [0, 1]) {
    const ground = [];
    for (let d = stance * c / 2; d < (stance + 1) * c / 2 - 1e-9; d += 0.25) {
      const i = Math.floor(d / per);
      const f = m2.frames[a.frames[i]];
      const within = d - i * per; // same rule as art.js walkFrame
      ground.push(d + (f.plantedFoot[0] - f.pivot[0]) / f.pixelsPerUnit - within);
    }
    const spread = Math.max(...ground) - Math.min(...ground);
    assert.ok(spread < 0.01, `stance ${stance}: foot moves ${spread} units`);
  }
});
