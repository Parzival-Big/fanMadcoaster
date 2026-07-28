import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants';
import { sfx } from '../audio';
import { panel, pillButton, textStyle } from '../ui';

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
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x2d2438, 0.6)
      .setOrigin(0)
      .setInteractive(); // blocca gli input verso la scena sottostante

    // pannello centrale con animazione d'ingresso
    const panelW = 620;
    const panelH = 430;
    const box = this.add.container(cx, GAME_HEIGHT / 2 + 10);
    const bg = panel(this, -panelW / 2, -panelH / 2, panelW, panelH, 0xfff6ea, 0.97);

    const titleT = this.add.text(0, -panelH / 2 + 55, 'GAME OVER', textStyle(54, '#ff5a5f')).setOrigin(0.5);
    const scoreT = this.add
      .text(0, -panelH / 2 + 125, `PUNTEGGIO: ${data.score}`, textStyle(34, '#2d2438'))
      .setOrigin(0.5);
    scoreT.setStroke('#ffffff', 6);
    const statsT = this.add
      .text(0, -panelH / 2 + 172, `MONETE: ${data.coins}     RECORD: ${data.best}`, textStyle(24, '#f5a300'))
      .setOrigin(0.5);

    box.add([bg, titleT, scoreT, statsT]);

    if (data.isRecord) {
      const rec = this.add
        .text(0, -panelH / 2 + 220, '★ NUOVO RECORD! ★', textStyle(28, '#4d96ff'))
        .setOrigin(0.5);
      box.add(rec);
      this.tweens.add({ targets: rec, scale: 1.12, duration: 400, yoyo: true, repeat: -1 });
    }

    const { container: retryBtn } = pillButton(this, 0, panelH / 2 - 125, 320, 66, 0xff5a5f, 'RIGIOCA', 34);
    const { container: menuBtn } = pillButton(this, 0, panelH / 2 - 50, 220, 52, 0x4d96ff, 'MENU', 24);
    box.add([retryBtn, menuBtn]);

    box.setScale(0);
    this.tweens.add({ targets: box, scale: 1, duration: 450, ease: 'Back.easeOut' });

    retryBtn.on('pointerdown', () => {
      sfx.click();
      this.scene.stop('Game');
      this.scene.stop();
      this.scene.start('Game');
    });
    menuBtn.on('pointerdown', () => {
      sfx.click();
      this.scene.stop('Game');
      this.scene.stop();
      this.scene.start('Menu');
    });
  }
}
