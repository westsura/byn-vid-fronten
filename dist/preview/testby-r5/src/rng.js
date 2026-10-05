// Seeded LCG so battles and tests are reproducible.
let seed = 12345;
export function seedRandom(value) {
  seed = value >>> 0;
}
export function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}
