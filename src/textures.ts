import Phaser from 'phaser';

/**
 * Tutte le grafiche del gioco sono disegnate a runtime con l'API Graphics:
 * zero file immagine, zero asset di terze parti.
 *
 * Stile "fumetto moderno": contorni scuri spessi, palette satura,
 * forme tondeggianti e luci/ombre a due toni.
 */

export const INK = 0x2d2438; // colore dei contorni, un viola quasi nero

export function generateTextures(scene: Phaser.Scene): void {
  makeCart(scene);
  makeCoin(scene);
  makeBarrier(scene);
  makeCritter(scene);
  makeMagnet(scene);
  makeShield(scene);
  makeParticle(scene);
  makeCloud(scene);
  makeSun(scene);
  makeHills(scene, 'hills-far', 0x6fdc8c, 0x9bf0b0, 120, 60);
  makeHills(scene, 'hills-near', 0x3fae6a, 0x64cf8c, 170, 95);
}

function gfx(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  return scene.make.graphics({ x: 0, y: 0 }, false);
}

function makeCart(scene: Phaser.Scene): void {
  const g = gfx(scene);

  // --- contorni (disegnati per primi, leggermente più grandi) ---
  g.fillStyle(INK);
  g.fillCircle(18, 44, 12); // ruota sx
  g.fillCircle(54, 44, 12); // ruota dx
  g.fillCircle(38, 13, 12); // testa
  g.fillRoundedRect(0, 14, 72, 32, 10); // corpo

  // --- ruote ---
  g.fillStyle(0x453a52);
  g.fillCircle(18, 44, 9);
  g.fillCircle(54, 44, 9);
  g.fillStyle(0xf7f4ef);
  g.fillCircle(18, 44, 4);
  g.fillCircle(54, 44, 4);

  // --- passeggero: faccia felice con casco ---
  g.fillStyle(0xffd8b0);
  g.fillCircle(38, 13, 9);
  g.fillStyle(0x4d96ff);
  g.fillRoundedRect(28, 1, 20, 9, { tl: 8, tr: 8, bl: 0, br: 0 });
  g.fillStyle(INK);
  g.fillCircle(41, 12, 1.8); // occhio
  g.fillStyle(0xffffff);
  g.fillCircle(42, 11, 0.8);

  // --- corpo del carrello: rosso candy con pancia più chiara ---
  g.fillStyle(0xff5a5f);
  g.fillRoundedRect(3, 17, 66, 26, 8);
  g.fillStyle(0xd63e56);
  g.fillRoundedRect(3, 33, 66, 10, { tl: 0, tr: 0, bl: 8, br: 8 });
  g.fillStyle(0xffd166);
  g.fillRoundedRect(3, 27, 66, 5, 2);
  // riflesso glossy
  g.fillStyle(0xff8fa3, 0.85);
  g.fillRoundedRect(8, 20, 26, 6, 3);

  g.generateTexture('cart', 72, 56);
  g.destroy();
}

function makeCoin(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(INK);
  g.fillCircle(14, 14, 13);
  g.fillStyle(0xffc93c);
  g.fillCircle(14, 14, 10.5);
  g.fillStyle(0xf5a300);
  g.fillCircle(14, 14, 7.5);
  // stellina al centro
  g.fillStyle(0xffe58a);
  fillStar(g, 14, 14, 5, 6.5, 3);
  // riflesso
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(9, 9, 2.4);
  g.generateTexture('coin', 28, 28);
  g.destroy();
}

function makeBarrier(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(INK);
  g.fillRoundedRect(0, 0, 50, 46, 10);
  g.fillStyle(0xff6b35);
  g.fillRoundedRect(3.5, 3.5, 43, 39, 8);
  g.fillStyle(0xd94f1e);
  g.fillRoundedRect(3.5, 26, 43, 16.5, { tl: 0, tr: 0, bl: 8, br: 8 });
  // riflesso
  g.fillStyle(0xff9a6b, 0.9);
  g.fillRoundedRect(8, 7, 16, 5, 2.5);
  // punto esclamativo
  g.fillStyle(0xfff3e0);
  g.fillRoundedRect(21, 9, 8, 17, 4);
  g.fillCircle(25, 34, 4.5);
  g.generateTexture('barrier', 50, 46);
  g.destroy();
}

function makeCritter(scene: Phaser.Scene): void {
  const g = gfx(scene);
  // contorni
  g.fillStyle(INK);
  g.fillCircle(13, 33, 6); // zampa sx
  g.fillCircle(31, 33, 6); // zampa dx
  g.fillCircle(22, 19, 17.5); // corpo

  // zampe
  g.fillStyle(0x3d7dc4);
  g.fillCircle(13, 33, 3.8);
  g.fillCircle(31, 33, 3.8);

  // corpo tondo azzurro con pancia chiara
  g.fillStyle(0x5fc8f5);
  g.fillCircle(22, 19, 15);
  g.fillStyle(0xbdeafd);
  g.fillEllipse(22, 26, 18, 12);

  // occhioni da cartone
  g.fillStyle(0xffffff);
  g.fillCircle(15.5, 14, 5.6);
  g.fillCircle(28.5, 14, 5.6);
  g.fillStyle(INK);
  g.fillCircle(17, 14.5, 2.6);
  g.fillCircle(30, 14.5, 2.6);
  g.fillStyle(0xffffff);
  g.fillCircle(18, 13.5, 1);
  g.fillCircle(31, 13.5, 1);

  // guanciotte e sorriso
  g.fillStyle(0xff8fa3, 0.8);
  g.fillCircle(12, 21, 2.6);
  g.fillCircle(32, 21, 2.6);
  g.lineStyle(2, INK);
  g.beginPath();
  g.arc(22, 20, 4, 0.25 * Math.PI, 0.75 * Math.PI);
  g.strokePath();

  g.generateTexture('critter', 44, 40);
  g.destroy();
}

function makeMagnet(scene: Phaser.Scene): void {
  const g = gfx(scene);
  bubble(g, 21, 21, 20);
  // magnete a ferro di cavallo con contorno
  g.lineStyle(11, INK);
  g.beginPath();
  g.arc(21, 19, 9, Math.PI, 0, false);
  g.strokePath();
  g.lineStyle(7, 0xff5a5f);
  g.beginPath();
  g.arc(21, 19, 9, Math.PI, 0, false);
  g.strokePath();
  g.fillStyle(INK);
  g.fillRect(6.5, 18, 11, 12);
  g.fillRect(24.5, 18, 11, 12);
  g.fillStyle(0xff5a5f);
  g.fillRect(8.5, 19, 7, 7);
  g.fillRect(26.5, 19, 7, 7);
  g.fillStyle(0xf7f4ef);
  g.fillRect(8.5, 24, 7, 4.5);
  g.fillRect(26.5, 24, 7, 4.5);
  g.generateTexture('magnet', 42, 42);
  g.destroy();
}

function makeShield(scene: Phaser.Scene): void {
  const g = gfx(scene);
  bubble(g, 21, 21, 20);
  // scudo con contorno
  g.fillStyle(INK);
  g.fillRoundedRect(8, 7, 26, 14, { tl: 7, tr: 7, bl: 0, br: 0 });
  g.fillTriangle(8, 18, 34, 18, 21, 36);
  g.fillStyle(0x4d96ff);
  g.fillRoundedRect(10.5, 9.5, 21, 11, { tl: 5, tr: 5, bl: 0, br: 0 });
  g.fillTriangle(10.5, 17, 31.5, 17, 21, 32.5);
  g.fillStyle(0xbdeafd);
  g.fillRoundedRect(13.5, 12, 7, 7, 2);
  g.generateTexture('shield', 42, 42);
  g.destroy();
}

/** Bolla bianca semitrasparente con bordo, comune ai power-up. */
function bubble(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number): void {
  g.fillStyle(0xffffff, 0.4);
  g.fillCircle(x, y, r);
  g.lineStyle(3, 0xffffff, 0.95);
  g.strokeCircle(x, y, r);
  g.fillStyle(0xffffff, 0.7);
  g.fillCircle(x - r * 0.4, y - r * 0.45, r * 0.18);
}

function makeParticle(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(0xffffff);
  g.fillCircle(5, 5, 5);
  g.generateTexture('particle', 10, 10);
  g.destroy();
}

function makeCloud(scene: Phaser.Scene): void {
  const g = gfx(scene);
  // contorno morbido
  g.fillStyle(0xffffff, 0.55);
  g.fillEllipse(37, 34, 70, 36);
  g.fillEllipse(74, 27, 74, 40);
  g.fillEllipse(105, 36, 60, 32);
  // corpo
  g.fillStyle(0xffffff);
  g.fillEllipse(37, 34, 62, 30);
  g.fillEllipse(74, 27, 66, 34);
  g.fillEllipse(105, 36, 52, 26);
  // pancia leggermente azzurra
  g.fillStyle(0xd6f0fb, 0.8);
  g.fillEllipse(72, 42, 80, 14);
  g.generateTexture('cloud', 140, 58);
  g.destroy();
}

function makeSun(scene: Phaser.Scene): void {
  const size = 120;
  const c = size / 2;
  const g = gfx(scene);
  // raggi
  g.fillStyle(0xffe17d, 0.9);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const x1 = c + Math.cos(a - 0.12) * 34;
    const y1 = c + Math.sin(a - 0.12) * 34;
    const x2 = c + Math.cos(a + 0.12) * 34;
    const y2 = c + Math.sin(a + 0.12) * 34;
    const x3 = c + Math.cos(a) * 56;
    const y3 = c + Math.sin(a) * 56;
    g.fillTriangle(x1, y1, x2, y2, x3, y3);
  }
  // disco
  g.fillStyle(0xffd166);
  g.fillCircle(c, c, 34);
  g.fillStyle(0xffe17d);
  g.fillCircle(c, c, 27);
  g.fillStyle(0xfff3c4, 0.95);
  g.fillCircle(c - 9, c - 9, 8);
  g.generateTexture('sun', size, size);
  g.destroy();
}

function makeHills(
  scene: Phaser.Scene,
  key: string,
  color: number,
  rimColor: number,
  baseY: number,
  amplitude: number
): void {
  const width = 512;
  const height = 220;
  const g = gfx(scene);

  const yAt = (x: number) =>
    baseY -
    amplitude * 0.6 * Math.sin((x / width) * Math.PI * 4) -
    amplitude * 0.4 * Math.sin((x / width) * Math.PI * 8 + 1.3);

  g.fillStyle(color);
  g.beginPath();
  g.moveTo(0, height);
  for (let x = 0; x <= width; x += 8) {
    g.lineTo(x, yAt(x));
  }
  g.lineTo(width, height);
  g.closePath();
  g.fillPath();

  // bordo luminoso lungo il profilo, per un look più "disegnato"
  g.lineStyle(7, rimColor);
  g.beginPath();
  g.moveTo(0, yAt(0));
  for (let x = 8; x <= width; x += 8) {
    g.lineTo(x, yAt(x));
  }
  g.strokePath();

  g.generateTexture(key, width, height);
  g.destroy();
}

/** Stella a `points` punte riempita col fillStyle corrente. */
function fillStar(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  points: number,
  outer: number,
  inner: number
): void {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  g.fillPoints(pts, true);
}
