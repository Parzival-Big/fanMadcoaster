// Verifica il flusso game over -> RIGIOCA -> nuova partita senza errori.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const SHOTS_DIR = process.env.SHOTS_DIR ?? '/tmp/shots';
fs.mkdirSync(SHOTS_DIR, { recursive: true });

const errors = [];
const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--window-size=1024,600']
});
const page = await browser.newPage();
await page.setViewport({ width: 1024, height: 600 });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 1200));
await page.mouse.click(512, 300); // avvia partita

// non salta mai: cade nel primo vuoto -> game over
await new Promise((r) => setTimeout(r, 15000));
await page.screenshot({ path: `${SHOTS_DIR}/07-gameover.png` });

// clic su RIGIOCA (y=400 nel mondo di gioco 960x540 scalato in 1024x600 -> ~444+offset)
// la canvas 960x540 scala a 1024x576 con offset verticale 12
await page.mouse.click(512, 12 + 400 * (576 / 540));
await new Promise((r) => setTimeout(r, 2500));
await page.screenshot({ path: `${SHOTS_DIR}/08-after-retry.png` });

console.log('JS errors:', errors.length ? errors : 'none');
await browser.close();
process.exit(errors.length ? 1 : 0);
