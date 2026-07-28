// Test automatico: apre il gioco, gioca una partita simulando i tocchi
// e verifica che non ci siano errori JavaScript.
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
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
});

await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: `${SHOTS_DIR}/01-menu.png` });

// avvia la partita
await page.mouse.click(512, 300);
await new Promise((r) => setTimeout(r, 1200));
await page.screenshot({ path: `${SHOTS_DIR}/02-game-start.png` });

// gioca ~25 secondi saltando a intervalli pseudo-casuali
const start = Date.now();
let shots = 3;
while (Date.now() - start < 25000) {
  await page.mouse.click(512, 300);
  if (Math.random() < 0.5) {
    await new Promise((r) => setTimeout(r, 180));
    await page.mouse.click(512, 300); // doppio salto
  }
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 700));
  if (shots <= 5 && Date.now() - start > (shots - 2) * 6000) {
    await page.screenshot({ path: `${SHOTS_DIR}/0${shots}-gameplay.png` });
    shots++;
  }
}

// smette di saltare: prima o poi cade in un vuoto -> game over
await new Promise((r) => setTimeout(r, 12000));
await page.screenshot({ path: `${SHOTS_DIR}/06-late.png` });

// stato della scena per capire se siamo al game over
const sceneInfo = await page.evaluate(() => {
  const game = window.Phaser ? undefined : undefined;
  return document.querySelector('canvas') ? 'canvas-ok' : 'no-canvas';
});

console.log('scene:', sceneInfo);
console.log('JS errors:', errors.length ? errors : 'none');
await browser.close();
process.exit(errors.length ? 1 : 0);
