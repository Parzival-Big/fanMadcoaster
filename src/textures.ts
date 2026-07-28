import Phaser from 'phaser';

/**
 * Tutte le grafiche del gioco sono disegnate a runtime con l'API Graphics:
 * zero file immagine, zero asset di terze parti.
 */
export function generateTextures(scene: Phaser.Scene): void {
  makeCart(scene);
  makeCoin(scene);
  makeBarrier(scene);
  makeCritter(scene);
  makeMagnet(scene);
  makeShield(scene);
  makeParticle(scene);
  makeCloud(scene);
  makeHills(scene, 'hills-far', 0x3d8f6b, 120, 60);
  makeHills(scene, 'hills-near', 0x2e6e51, 170, 95);
}

function gfx(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  return scene.make.graphics({ x: 0, y: 0 }, false);
}

function makeCart(scene: Phaser.Scene): void {
  const g = gfx(scene);
  // ruote
  g.fillStyle(0x2b2b33);
  g.fillCircle(17, 42, 9);
  g.fillCircle(51, 42, 9);
  g.fillStyle(0x8a8a99);
  g.fillCircle(17, 42, 4);
  g.fillCircle(51, 42, 4);
  // passeggero (testa con casco)
  g.fillStyle(0xf2c094);
  g.fillCircle(36, 12, 9);
  g.fillStyle(0x2f6fce);
  g.fillRect(26, 0, 20, 9);
  g.fillStyle(0x1c1c24);
  g.fillRect(38, 10, 3, 3);
  // corpo del carrello
  g.fillStyle(0xd9342b);
  g.fillRoundedRect(2, 14, 64, 26, 7);
  g.fillStyle(0xa32620);
  g.fillRoundedRect(2, 31, 64, 9, { tl: 0, tr: 0, bl: 7, br: 7 });
  g.fillStyle(0xffd23f);
  g.fillRect(2, 26, 64, 4);
  g.generateTexture('cart', 68, 52);
  g.destroy();
}

function makeCoin(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(0xb8860b);
  g.fillCircle(12, 12, 11);
  g.fillStyle(0xffd23f);
  g.fillCircle(12, 12, 9);
  g.fillStyle(0xffea90);
  g.fillCircle(9, 9, 3);
  g.fillStyle(0xdca90e);
  g.fillRect(10, 7, 4, 10);
  g.generateTexture('coin', 24, 24);
  g.destroy();
}

function makeBarrier(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(0x8c2f22);
  g.fillRoundedRect(0, 0, 46, 42, 6);
  g.fillStyle(0xc44432);
  g.fillRoundedRect(3, 3, 40, 36, 5);
  // punto esclamativo
  g.fillStyle(0xffe28a);
  g.fillRoundedRect(19, 8, 8, 17, 3);
  g.fillCircle(23, 32, 4);
  g.generateTexture('barrier', 46, 42);
  g.destroy();
}

function makeCritter(scene: Phaser.Scene): void {
  const g = gfx(scene);
  // zampe
  g.fillStyle(0x3d7dc4);
  g.fillCircle(12, 31, 4);
  g.fillCircle(30, 31, 4);
  // corpo tondo
  g.fillStyle(0x6fc3ef);
  g.fillCircle(21, 18, 15);
  g.fillStyle(0x9adcf7);
  g.fillCircle(21, 23, 9);
  // occhi
  g.fillStyle(0xffffff);
  g.fillCircle(15, 14, 5);
  g.fillCircle(27, 14, 5);
  g.fillStyle(0x1c1c24);
  g.fillCircle(16, 14, 2);
  g.fillCircle(28, 14, 2);
  g.generateTexture('critter', 42, 36);
  g.destroy();
}

function makeMagnet(scene: Phaser.Scene): void {
  const g = gfx(scene);
  // bolla
  g.fillStyle(0xffffff, 0.35);
  g.fillCircle(19, 19, 18);
  g.lineStyle(2, 0xffffff, 0.8);
  g.strokeCircle(19, 19, 18);
  // magnete a ferro di cavallo
  g.lineStyle(8, 0xd9342b);
  g.beginPath();
  g.arc(19, 17, 9, Math.PI, 0, false);
  g.strokePath();
  g.fillStyle(0xd9342b);
  g.fillRect(6, 17, 8, 8);
  g.fillRect(24, 17, 8, 8);
  g.fillStyle(0xe9e9f2);
  g.fillRect(6, 23, 8, 5);
  g.fillRect(24, 23, 8, 5);
  g.generateTexture('magnet', 38, 38);
  g.destroy();
}

function makeShield(scene: Phaser.Scene): void {
  const g = gfx(scene);
  // bolla
  g.fillStyle(0xffffff, 0.35);
  g.fillCircle(19, 19, 18);
  g.lineStyle(2, 0xffffff, 0.8);
  g.strokeCircle(19, 19, 18);
  // scudo
  g.fillStyle(0x2f6fce);
  g.fillTriangle(9, 12, 29, 12, 19, 30);
  g.fillRect(9, 8, 20, 8);
  g.fillStyle(0x9adcf7);
  g.fillTriangle(13, 14, 25, 14, 19, 25);
  g.fillRect(13, 11, 12, 5);
  g.generateTexture('shield', 38, 38);
  g.destroy();
}

function makeParticle(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(0xffffff);
  g.fillRect(0, 0, 8, 8);
  g.generateTexture('particle', 8, 8);
  g.destroy();
}

function makeCloud(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(0xffffff, 0.92);
  g.fillEllipse(35, 32, 62, 30);
  g.fillEllipse(70, 26, 66, 34);
  g.fillEllipse(100, 34, 52, 26);
  g.generateTexture('cloud', 130, 52);
  g.destroy();
}

function makeHills(
  scene: Phaser.Scene,
  key: string,
  color: number,
  baseY: number,
  amplitude: number
): void {
  const width = 512;
  const height = 220;
  const g = gfx(scene);
  g.fillStyle(color);
  g.beginPath();
  g.moveTo(0, height);
  for (let x = 0; x <= width; x += 8) {
    // due sinusoidi con periodo che divide la larghezza => texture tileable
    const y =
      baseY -
      amplitude * 0.6 * Math.sin((x / width) * Math.PI * 4) -
      amplitude * 0.4 * Math.sin((x / width) * Math.PI * 8 + 1.3);
    g.lineTo(x, y);
  }
  g.lineTo(width, height);
  g.closePath();
  g.fillPath();
  g.generateTexture(key, width, height);
  g.destroy();
}
