import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './constants';

const INK_CSS = '#2d2438';

export function textStyle(size: number, color: string): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: 'Arial Black, Arial, sans-serif',
    fontSize: `${size}px`,
    color,
    stroke: INK_CSS,
    strokeThickness: Math.max(4, Math.round(size / 6))
  };
}

/** Pulsante "a pillola" stile cartoon: ombra, corpo colorato, riflesso e testo. */
export function pillButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number,
  label: string,
  fontSize: number
): { container: Phaser.GameObjects.Container; text: Phaser.GameObjects.Text } {
  const g = scene.add.graphics();
  const r = height / 2;
  // ombra
  g.fillStyle(0x2d2438, 0.45);
  g.fillRoundedRect(-width / 2 + 3, -height / 2 + 6, width, height, r);
  // contorno + corpo
  g.fillStyle(0x2d2438);
  g.fillRoundedRect(-width / 2, -height / 2, width, height, r);
  g.fillStyle(color);
  g.fillRoundedRect(-width / 2 + 4, -height / 2 + 4, width - 8, height - 8, r - 4);
  // riflesso
  g.fillStyle(0xffffff, 0.35);
  g.fillRoundedRect(-width / 2 + 14, -height / 2 + 8, width - 28, height / 4, height / 8);

  const text = scene.add.text(0, 0, label, textStyle(fontSize, '#ffffff')).setOrigin(0.5);
  const container = scene.add.container(x, y, [g, text]);
  container.setSize(width, height);
  container.setInteractive({ useHandCursor: true });
  return { container, text };
}

/** Sfondo condiviso: cielo con gradiente, sole, nuvole e colline in parallasse. */
export function drawSkyAndHills(scene: Phaser.Scene): {
  hillsFar: Phaser.GameObjects.TileSprite;
  hillsNear: Phaser.GameObjects.TileSprite;
  clouds: Phaser.GameObjects.Image[];
} {
  const sky = scene.add.graphics().setScrollFactor(0);
  sky.fillGradientStyle(0x35a7e8, 0x35a7e8, 0xbfeaff, 0xbfeaff, 1);
  sky.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  const sun = scene.add.image(GAME_WIDTH - 130, 100, 'sun').setScrollFactor(0);
  scene.tweens.add({
    targets: sun,
    angle: 360,
    duration: 60000,
    repeat: -1
  });

  const clouds: Phaser.GameObjects.Image[] = [];
  for (let i = 0; i < 5; i++) {
    const c = scene.add
      .image(Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(40, 190), 'cloud')
      .setScrollFactor(0)
      .setAlpha(0.95)
      .setScale(Phaser.Math.FloatBetween(0.6, 1.2));
    clouds.push(c);
  }

  const hillsFar = scene.add
    .tileSprite(0, GAME_HEIGHT - 220, GAME_WIDTH, 220, 'hills-far')
    .setOrigin(0)
    .setScrollFactor(0)
    .setAlpha(0.9);
  const hillsNear = scene.add
    .tileSprite(0, GAME_HEIGHT - 220, GAME_WIDTH, 220, 'hills-near')
    .setOrigin(0)
    .setScrollFactor(0);

  return { hillsFar, hillsNear, clouds };
}

/** Pannello arrotondato con contorno, per HUD e finestre di dialogo. */
export function panel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  fillColor = 0xffffff,
  fillAlpha = 0.92
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics({ x, y });
  g.fillStyle(0x2d2438, 0.5);
  g.fillRoundedRect(4, 8, width, height, 24);
  g.fillStyle(0x2d2438);
  g.fillRoundedRect(0, 0, width, height, 24);
  g.fillStyle(fillColor, fillAlpha);
  g.fillRoundedRect(5, 5, width - 10, height - 10, 19);
  return g;
}
