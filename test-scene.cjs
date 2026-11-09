const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const registry = new Map();
const context = vm.createContext({
  HTMLElement: class {
    attachShadow() {
      return { querySelector: () => ({ addEventListener() {} }) };
    }
  },
  customElements: {
    get: (tag) => registry.get(tag),
    define: (tag, element) => registry.set(tag, element),
  },
  matchMedia: () => ({ matches: false }),
});
context.window = context;
for (const file of ['city-switch.js', 'gliwice.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, file), 'utf8'), context, { filename: file });
}
const Switch = registry.get('gliwice-switch');
assert.ok(Switch, 'the scene registers its custom element');
const world = new Switch().world;
const daylight = new Uint8Array(world.rgba.length);
for (const hour of [12, 17, 18.5, 22, 26, 29, 31, 36]) {
  for (let frame = 0; frame < 35; frame++) world.tick(1 / 30, hour);
  assert.equal(world.rgba.length, 400 * 190 * 4);
  assert.ok(world.rgba.some((value) => value > 0), `the scene renders at ${hour}`);
  assert.ok(world.groups.length < 256);
  if (hour === 12) daylight.set(world.rgba);
  if (hour === 22) {
    assert.notDeepEqual(world.rgba, daylight, 'night changes the scene');
    assert.ok(world.levels[world.pubG] > .9, 'Beer Brothers lights up at night');
  }
}
world.startle();
world.tick(1 / 30, 18);
assert.ok(world.cat.puff > 0, 'the cat still reacts to a quick drag');
assert.ok(world.pigeons.every((bird) => bird.u < 1), 'the pigeons go up when startled');
for (let frame = 0; frame < 120; frame++) world.tick(1 / 30, 18);
assert.ok(world.pigeons.some((bird) => bird.u === 1), 'and settle again');
world.startle();
world.tick(1 / 30, 22);
assert.ok(world.pigeons.every((bird) => bird.u === 1), 'roosting pigeons stay put at night');
const frozenTime = world.t;
const flights = world.pigeons.map((bird) => bird.u + bird.wait);
world.tick(1 / 30, 14, { calm: true });
world.tick(1 / 30, 22, { calm: true });
assert.equal(world.t, frozenTime, 'reduced motion stops the scene animation');
assert.deepEqual(world.pigeons.map((bird) => bird.u + bird.wait), flights, 'and the pigeons with it');
assert.equal(world.levels[world.pubG], 1);

// Optional raw frames let the same check produce a visual preview without browser dependencies.
if (process.argv[2]) {
  for (const hour of [12, 18, 22]) {
    world.tick(0, hour, { calm: true });
    fs.writeFileSync(path.join(process.argv[2], `gliwice-${hour}.rgba`), world.rgba);
  }
}
console.log('Gliwice: day, dusk, night, dawn, pub lighting and reduced motion passed.');
