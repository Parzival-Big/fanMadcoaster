import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants';
import { sfx } from '../audio';
import { textStyle } from '../ui';

interface GameOverData {
  score: number;
  best: number;
  coins: number;
  isRecord: boolean;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver');
  }

  create(data: GameOverData): void {
    const cx = GAME_WIDTH / 2;

    this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0a1f33, 0.72)
      .setOrigin(0)
      .setInteractive(); // blocca gli input verso la scena sottostante

    this.add.text(cx, 110, 'GAME OVER', textStyle(64, '#ff6b5e')).setOrigin(0.5);

    this.add.text(cx, 205, `PUNTEGGIO: ${data.score}`, textStyle(36, '#ffffff')).setOrigin(0.5);
    this.add
      .text(cx, 258, `MONETE: ${data.coins}     RECORD: ${data.best}`, textStyle(26, '#ffd23f'))
      .setOrigin(0.5);

    if (data.isRecord) {
      const rec = this.add
        .text(cx, 315, 'NUOVO RECORD!', textStyle(30, '#9adcf7'))
        .setOrigin(0.5);
      this.tweens.add({ targets: rec, scale: 1.15, duration: 400, yoyo: true, repeat: -1 });
    }

    const retry = this.add
      .text(cx, 400, 'RIGIOCA', textStyle(42, '#ffffff'))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    const menu = this.add
      .text(cx, 465, 'MENU', textStyle(28, '#c9e6f7'))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({ targets: retry, alpha: 0.4, duration: 600, yoyo: true, repeat: -1 });

    retry.on('pointerdown', () => {
      sfx.click();
      this.scene.stop('Game');
      this.scene.stop();
      this.scene.start('Game');
    });
    menu.on('pointerdown', () => {
      sfx.click();
      this.scene.stop('Game');
      this.scene.stop();
      this.scene.start('Menu');
    });
  }
}
