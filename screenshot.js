/* Screenshot each demo site's home page into assets/shots/<slug>.jpg for the hub cards.
   Usage:  SHOT_BASE=http://localhost:8099 node screenshot.js [slug ...] */
const { chromium } = require('/Users/dissu/Documents/PP/labs/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const ROOT = '/Users/dissu/Documents/PP/labs/pranny-repo/the-rounds-studio';
const BASE = process.env.SHOT_BASE || 'http://localhost:8099';

(async () => {
  const projects = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects.json'), 'utf8'));
  const outDir = path.join(ROOT, 'assets', 'shots');
  fs.mkdirSync(outDir, { recursive: true });
  const only = process.argv.slice(2);
  const list = only.length ? projects.filter(p => only.includes(p.slug)) : projects;
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const results = { ok: [], fail: [] };
  for (const p of list) {
    const page = await ctx.newPage();
    try {
      await page.goto(`${BASE}/${p.slug}/`, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: path.join(outDir, p.slug + '.jpg'), type: 'jpeg', quality: 82 });
      results.ok.push(p.slug); console.log('shot  ✓', p.slug);
    } catch (e) { results.fail.push(p.slug); console.log('shot  ✗', p.slug, '-', e.message.split('\n')[0]); }
    await page.close();
  }
  await browser.close();
  console.log(`\nDone: ${results.ok.length} ok, ${results.fail.length} failed`);
  if (results.fail.length) console.log('Failed:', results.fail.join(', '));
})().catch(e => { console.error(e); process.exit(1); });
