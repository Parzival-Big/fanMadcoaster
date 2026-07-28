import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, STORAGE_BEST } from '../constants';
import { sfx } from '../audio';
import { drawSkyAndHills, pillButton, textStyle } from '../ui';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create(): void {
    drawSkyAndHills(this);

    const cx = GAME_WIDTH / 2;

    // titolo a due righe di colore con rimbalzo d'ingresso
    const title = this.add
      .text(cx, 125, 'TURBOCOASTER', {
        ...textStyle(74, '#ffd166'),
        strokeThickness: 14
      })
      .setOrigin(0.5)
      .setShadow(0, 8, '#2d243866', 0, true, true)
      .setScale(0);
    this.tweens.add({
      targets: title,
      scale: 1,
      duration: 600,
      ease: 'Back.easeOut'
    });
    this.tweens.add({
      targets: title,
      y: 118,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 600
    });

    this.add
      .text(cx, 192, 'la corsa folle sulle montagne russe', textStyle(24, '#ffffff'))
      .setOrigin(0.5);

    const best = Number(localStorage.getItem(STORAGE_BEST) ?? 0);
    if (best > 0) {
      this.add.text(cx, 248, `★ RECORD: ${best} ★`, textStyle(28, '#ffd166')).setOrigin(0.5);
    }

    // carrellino decorativo che saltella
    const cart = this.add.image(cx, 335, 'cart').setScale(1.5);
    this.tweens.add({
      targets: cart,
      y: 313,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const { container: playBtn } = pillButton(this, cx, 435, 400, 74, 0xff5a5f, 'GIOCA!', 40);
    this.tweens.add({
      targets: playBtn,
      scale: 1.05,
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add
      .text(
        cx,
        GAME_HEIGHT - 22,
        'Tocca per saltare  •  tocca in aria per il doppio salto',
        textStyle(18, '#e8f6ff')
      )
      .setOrigin(0.5);

    const start = () => {
      sfx.unlock();
      sfx.click();
      this.scene.start('Game');
    };
    playBtn.on('pointerdown', start);
    this.input.once('pointerdown', start);
  }
}
