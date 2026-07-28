import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, STORAGE_BEST } from '../constants';
import { sfx } from '../audio';
import { drawSkyAndHills, textStyle } from '../ui';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create(): void {
    drawSkyAndHills(this);

    const cx = GAME_WIDTH / 2;

    this.add
      .text(cx, 130, 'TURBOCOASTER', textStyle(72, '#ffd23f'))
      .setOrigin(0.5)
      .setShadow(0, 6, '#00000055', 0, true, true);
    this.add
      .text(cx, 195, 'la corsa folle sulle montagne russe', textStyle(24, '#ffffff'))
      .setOrigin(0.5);

    const best = Number(localStorage.getItem(STORAGE_BEST) ?? 0);
    if (best > 0) {
      this.add.text(cx, 260, `RECORD: ${best}`, textStyle(30, '#ffffff')).setOrigin(0.5);
    }

    // carrellino decorativo che saltella
    const cart = this.add.image(cx, 340, 'cart').setScale(1.4);
    this.tweens.add({
      targets: cart,
      y: 320,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const play = this.add
      .text(cx, 440, 'TOCCA PER GIOCARE', textStyle(38, '#ffffff'))
      .setOrigin(0.5);
    this.tweens.add({
      targets: play,
      alpha: 0.35,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    this.add
      .text(cx, GAME_HEIGHT - 24, 'Tocca per saltare  •  tocca in aria per il doppio salto', textStyle(18, '#e8f6ff'))
      .setOrigin(0.5);

    this.input.once('pointerdown', () => {
      sfx.unlock();
      sfx.click();
      this.scene.start('Game');
    });
  }
}
