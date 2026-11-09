const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 960, height: 600 }, deviceScaleFactor: 1, colorScheme: 'light' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto('http://127.0.0.1:8080/', { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'section { height: 600px; min-height: 600px; padding: 48px 24px; gap: 32px; } footer { display: none; } .switch { width: 760px; }' });
    await page.waitForFunction(() => document.querySelector('gliwice-switch').gl);
    await page.getByRole('switch').click();
    await page.waitForFunction(() => document.querySelector('gliwice-switch').checked);
    await page.locator('gliwice-switch').evaluate((el) => el.jump(false));
    await page.getByRole('switch').press('ArrowRight');
    await page.waitForFunction(() => document.querySelector('gliwice-switch').position > .01);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('gliwice-switch').evaluate((el) => el.jump(true));
    assert.equal(await page.getByRole('switch').getAttribute('aria-checked'), 'true');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.locator('gliwice-switch').evaluate((el) => {
      el.jump(false);
      cancelAnimationFrame(el.raf);
      el.raf = 0;
    });
    fs.mkdirSync('capture/frames', { recursive: true });
    for (let i = 0; i < 84; i++) {
      await page.locator('gliwice-switch').evaluate((el, frame) => {
        const p = frame / 83;
        const ease = (t) => t * t * (3 - 2 * t);
        const back = p >= .58;
        el.branch = back ? 'am' : 'pm';
        el.amStart = 22;
        el.nightHour = 22;
        el.x = p < .1 ? 0 : p < .43 ? ease((p - .1) / .33) : p < .58 ? 1 : p < .92 ? 1 - ease((p - .58) / .34) : 0;
        el.lift = el.x > 0 && el.x < 1 ? .2 : 0;
        el.world.tick(1 / 12, el.hour());
        el.uploadWorld();
        el.emitScrub();
        el.draw();
      }, i);
      await page.screenshot({ path: `capture/frames/${String(i).padStart(3, '0')}.png` });
      if (i % 12 === 0) console.log(`Captured ${i + 1}/84 full-switch frames`);
    }
    assert.deepEqual(errors, [], 'no browser runtime errors');
    fs.copyFileSync('capture/frames/000.png', 'capture/preview-day.png');
    fs.copyFileSync('capture/frames/042.png', 'capture/preview-night.png');
    console.log('WebGL rendering, pointer toggle, keyboard control and reduced motion passed.');
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
