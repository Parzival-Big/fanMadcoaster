import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './constants';

export function textStyle(size: number, color: string): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: 'Arial Black, Arial, sans-serif',
    fontSize: `${size}px`,
    color,
    stroke: '#1c3550',
    strokeThickness: Math.max(3, Math.round(size / 8))
  };
}

/** Sfondo condiviso: cielo a fasce, nuvole e colline in parallasse. */
export function drawSkyAndHills(scene: Phaser.Scene): {
  hillsFar: Phaser.GameObjects.TileSprite;
  hillsNear: Phaser.GameObjects.TileSprite;
  clouds: Phaser.GameObjects.Image[];
} {
  const skyTop = scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x2a9fd8).setOrigin(0);
  const skyBottom = scene.add
    .rectangle(0, GAME_HEIGHT * 0.45, GAME_WIDTH, GAME_HEIGHT * 0.55, 0x7fd0ef)
    .setOrigin(0);
  skyTop.setScrollFactor(0);
  skyBottom.setScrollFactor(0);

  const clouds: Phaser.GameObjects.Image[] = [];
  for (let i = 0; i < 5; i++) {
    const c = scene.add
      .image(Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(40, 200), 'cloud')
      .setScrollFactor(0)
      .setAlpha(0.9)
      .setScale(Phaser.Math.FloatBetween(0.7, 1.3));
    clouds.push(c);
  }

  const hillsFar = scene.add
    .tileSprite(0, GAME_HEIGHT - 220, GAME_WIDTH, 220, 'hills-far')
    .setOrigin(0)
    .setScrollFactor(0)
    .setAlpha(0.85);
  const hillsNear = scene.add
    .tileSprite(0, GAME_HEIGHT - 220, GAME_WIDTH, 220, 'hills-near')
    .setOrigin(0)
    .setScrollFactor(0);

  return { hillsFar, hillsNear, clouds };
}
