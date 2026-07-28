import Phaser from 'phaser';
import {
  CART_SCREEN_X,
  DEATH_Y,
  DOUBLE_JUMP_VELOCITY,
  GAME_WIDTH,
  GRAVITY,
  JUMP_VELOCITY,
  MAX_FALL_SPEED,
  STORAGE_BEST,
  STORAGE_COINS,
  speedAt
} from '../constants';
import { sfx } from '../audio';
import { ChunkEvent, Track } from '../track';
import { drawSkyAndHills, textStyle } from '../ui';

type ObstacleKind = 'barrier' | 'critter' | 'magnet' | 'shield';

interface Obstacle {
  sprite: Phaser.GameObjects.Image;
  kind: ObstacleKind;
}

const START_X = 100;

export class GameScene extends Phaser.Scene {
  private track!: Track;
  private trackGfx!: Phaser.GameObjects.Graphics;
  private cart!: Phaser.GameObjects.Image;
  private shieldRing!: Phaser.GameObjects.Arc;
  private burst!: Phaser.GameObjects.Particles.ParticleEmitter;

  private hillsFar!: Phaser.GameObjects.TileSprite;
  private hillsNear!: Phaser.GameObjects.TileSprite;
  private clouds: Phaser.GameObjects.Image[] = [];

  private coinsGroup: Phaser.GameObjects.Image[] = [];
  private obstacles: Obstacle[] = [];

  private cartX = START_X;
  private cartY = 400;
  private vy = 0;
  private grounded = true;
  private jumps = 0;
  private state: 'running' | 'dead' = 'running';

  private bonus = 0;
  private coinsCollected = 0;
  private magnetUntil = 0;
  private hasShield = false;

  private coinText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private magnetIcon!: Phaser.GameObjects.Image;

  constructor() {
    super('Game');
  }

  create(): void {
    // reset dello stato (la scena può essere riavviata)
    this.coinsGroup = [];
    this.obstacles = [];
    this.cartX = START_X;
    this.cartY = 400;
    this.vy = 0;
    this.grounded = true;
    this.jumps = 0;
    this.state = 'running';
    this.bonus = 0;
    this.coinsCollected = 0;
    this.magnetUntil = 0;
    this.hasShield = false;

    const bg = drawSkyAndHills(this);
    this.hillsFar = bg.hillsFar;
    this.hillsNear = bg.hillsNear;
    this.clouds = bg.clouds;

    this.trackGfx = this.add.graphics().setDepth(5);
    this.track = new Track((chunk) => this.populateChunk(chunk));

    this.cart = this.add.image(this.cartX, this.cartY, 'cart').setOrigin(0.5, 1).setDepth(10);
    this.shieldRing = this.add
      .circle(0, 0, 46)
      .setStrokeStyle(4, 0x6fc3ef, 0.9)
      .setDepth(11)
      .setVisible(false);

    this.burst = this.add.particles(0, 0, 'particle', {
      speed: { min: 120, max: 380 },
      angle: { min: 200, max: 340 },
      gravityY: 900,
      lifespan: { min: 300, max: 700 },
      scale: { start: 1, end: 0 },
      emitting: false
    });
    this.burst.setDepth(20);

    this.createHud();

    // suggerimento iniziale
    const hint = this.add
      .text(GAME_WIDTH / 2, 170, 'TOCCA PER SALTARE!', textStyle(34, '#ffffff'))
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);
    this.tweens.add({ targets: hint, alpha: 0, delay: 2200, duration: 600 });

    this.input.on('pointerdown', () => this.tryJump());
    this.input.keyboard?.on('keydown-SPACE', () => this.tryJump());
    this.input.keyboard?.on('keydown-UP', () => this.tryJump());
  }

  private createHud(): void {
    const pills = this.add.graphics().setScrollFactor(0).setDepth(99);
    pills.fillStyle(0x2d2438, 0.4);
    pills.fillRoundedRect(12, 12, 150, 46, 23);
    pills.fillRoundedRect(GAME_WIDTH - 192, 12, 180, 46, 23);

    this.add.image(38, 35, 'coin').setScrollFactor(0).setDepth(100).setScale(1.25);
    this.coinText = this.add
      .text(60, 20, '0', textStyle(28, '#ffd166'))
      .setScrollFactor(0)
      .setDepth(100);
    this.scoreText = this.add
      .text(GAME_WIDTH - 28, 20, '0', textStyle(28, '#ffffff'))
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(100);
    this.magnetIcon = this.add
      .image(GAME_WIDTH / 2, 36, 'magnet')
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(false);
  }

  private tryJump(): void {
    sfx.unlock();
    if (this.state !== 'running') return;
    if (this.grounded) {
      this.grounded = false;
      this.vy = -JUMP_VELOCITY;
      this.jumps = 1;
      sfx.jump();
      this.stretchCart();
    } else if (this.jumps === 1) {
      this.vy = -DOUBLE_JUMP_VELOCITY;
      this.jumps = 2;
      sfx.doubleJump();
      this.burst.explode(6, this.cartX, this.cartY);
      this.stretchCart();
    }
  }

  /** Allungamento cartoon in salto. */
  private stretchCart(): void {
    this.tweens.add({
      targets: this.cart,
      scaleX: 0.86,
      scaleY: 1.16,
      duration: 110,
      yoyo: true,
      ease: 'Sine.easeOut'
    });
  }

  /** Schiacciamento cartoon all'atterraggio. */
  private squashCart(): void {
    this.tweens.add({
      targets: this.cart,
      scaleX: 1.18,
      scaleY: 0.8,
      duration: 90,
      yoyo: true,
      ease: 'Sine.easeOut'
    });
  }

  update(time: number, delta: number): void {
    const dt = Math.min(delta, 50) / 1000;
    const cam = this.cameras.main;

    if (this.state === 'running') {
      this.moveCart(dt);
      this.checkCollisions(time);
    }

    // camera e parallasse
    cam.scrollX = this.cartX - CART_SCREEN_X;
    this.hillsFar.tilePositionX = cam.scrollX * 0.12;
    this.hillsNear.tilePositionX = cam.scrollX * 0.28;
    for (const c of this.clouds) {
      c.x -= 10 * dt;
      if (c.x < -80) c.x = GAME_WIDTH + 80;
    }

    // generazione/pulizia del mondo
    this.track.ensure(cam.scrollX + GAME_WIDTH + 1000);
    this.track.prune(cam.scrollX - 400);
    this.track.draw(this.trackGfx, cam.scrollX - 60, cam.scrollX + GAME_WIDTH + 60);
    this.cleanupEntities(cam.scrollX - 200);

    // magnete
    if (time < this.magnetUntil) {
      this.magnetIcon.setVisible(true);
      this.attractCoins(dt);
    } else {
      this.magnetIcon.setVisible(false);
    }

    this.shieldRing.setVisible(this.hasShield);
    this.shieldRing.setPosition(this.cart.x, this.cart.y - 26);

    this.coinText.setText(String(this.coinsCollected));
    this.scoreText.setText(String(this.currentScore()));
  }

  private currentScore(): number {
    return Math.floor((this.cartX - START_X) / 10) + this.bonus;
  }

  private moveCart(dt: number): void {
    const speed = speedAt(this.cartX - START_X);
    this.cartX += speed * dt;

    if (this.grounded) {
      const surf = this.track.heightAt(this.cartX);
      if (surf === null) {
        // corsa oltre il bordo: si comincia a cadere
        this.grounded = false;
        this.jumps = 1; // resta il doppio salto come salvataggio
        this.vy = Math.max(0, this.track.slopeAt(this.cartX - 10) * speed);
      } else {
        this.cartY = surf;
        this.cart.setRotation(Math.atan(this.track.slopeAt(this.cartX)) * 0.8);
      }
    } else {
      this.vy = Math.min(this.vy + GRAVITY * dt, MAX_FALL_SPEED);
      const prevY = this.cartY;
      this.cartY += this.vy * dt;
      this.cart.setRotation(Phaser.Math.Clamp(this.vy / 2500, -0.3, 0.4));

      const surf = this.track.heightAt(this.cartX);
      if (surf !== null && this.cartY >= surf) {
        const depth = this.cartY - surf;
        const stepAllowance = Math.max(55, this.vy * dt + 14);
        if (this.vy >= 0 && depth <= stepAllowance && prevY <= surf + stepAllowance) {
          // atterraggio pulito
          this.cartY = surf;
          this.grounded = true;
          this.jumps = 0;
          this.burst.explode(4, this.cartX, this.cartY);
          this.squashCart();
        } else {
          // schianto contro la parete di un binario più alto
          this.crash();
          return;
        }
      }

      if (this.cartY > DEATH_Y) {
        this.fellIntoPit();
        return;
      }
    }

    this.cart.setPosition(this.cartX, this.cartY + 5);
  }

  private checkCollisions(time: number): void {
    const cx = this.cartX;
    const cy = this.cartY - 26;

    for (const coin of this.coinsGroup) {
      if (!coin.active) continue;
      if (Math.abs(coin.x - cx) < 34 && Math.abs(coin.y - cy) < 40) {
        this.collectCoin(coin);
      }
    }

    for (const ob of this.obstacles) {
      const s = ob.sprite;
      if (!s.active) continue;
      const isPowerup = ob.kind === 'magnet' || ob.kind === 'shield';
      const oy = isPowerup ? s.y : s.y - s.displayHeight / 2;
      if (Math.abs(s.x - cx) > 42 || Math.abs(oy - cy) > 46) continue;

      switch (ob.kind) {
        case 'critter': {
          s.setActive(false).setVisible(false);
          this.addBonus(50, s.x, oy, '#9adcf7');
          this.burst.explode(12, s.x, oy);
          sfx.smash();
          this.cameras.main.shake(120, 0.004);
          break;
        }
        case 'barrier': {
          if (this.hasShield) {
            this.hasShield = false;
            s.setActive(false).setVisible(false);
            this.burst.explode(16, s.x, oy);
            sfx.smash();
            this.cameras.main.shake(150, 0.006);
          } else {
            this.crash();
            return;
          }
          break;
        }
        case 'magnet': {
          s.setActive(false).setVisible(false);
          this.magnetUntil = time + 8000;
          sfx.power();
          this.popup('CALAMITA!', s.x, oy - 30, '#ffd23f');
          break;
        }
        case 'shield': {
          s.setActive(false).setVisible(false);
          this.hasShield = true;
          sfx.power();
          this.popup('SCUDO!', s.x, oy - 30, '#9adcf7');
          break;
        }
      }
    }
  }

  private collectCoin(coin: Phaser.GameObjects.Image): void {
    coin.setActive(false).setVisible(false);
    this.coinsCollected += 1;
    this.bonus += 10;
    sfx.coin();
  }

  private attractCoins(dt: number): void {
    const cx = this.cartX;
    const cy = this.cartY - 26;
    for (const coin of this.coinsGroup) {
      if (!coin.active) continue;
      const dx = cx - coin.x;
      const dy = cy - coin.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 240 && dist > 1) {
        const pull = 620 * dt;
        coin.x += (dx / dist) * pull;
        coin.y += (dy / dist) * pull;
      }
    }
  }

  private addBonus(amount: number, x: number, y: number, color: string): void {
    this.bonus += amount;
    this.popup(`+${amount}`, x, y - 30, color);
  }

  private popup(text: string, x: number, y: number, color: string): void {
    const t = this.add.text(x, y, text, textStyle(24, color)).setOrigin(0.5).setDepth(50);
    this.tweens.add({
      targets: t,
      y: y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => t.destroy()
    });
  }

  private crash(): void {
    if (this.state === 'dead') return;
    this.state = 'dead';
    this.hasShield = false;
    this.shieldRing.setVisible(false);
    sfx.crash();
    this.cameras.main.shake(350, 0.012);
    this.cameras.main.flash(200, 255, 80, 60);
    this.burst.explode(24, this.cartX, this.cartY - 20);
    this.tweens.add({
      targets: this.cart,
      y: this.cart.y + 420,
      x: this.cart.x + 130,
      angle: 540,
      duration: 900,
      ease: 'Quad.easeIn'
    });
    this.time.delayedCall(1000, () => this.showGameOver());
  }

  private fellIntoPit(): void {
    if (this.state === 'dead') return;
    this.state = 'dead';
    sfx.crash();
    this.cameras.main.shake(250, 0.008);
    this.time.delayedCall(500, () => this.showGameOver());
  }

  private showGameOver(): void {
    const score = this.currentScore();
    const prevBest = Number(localStorage.getItem(STORAGE_BEST) ?? 0);
    const isRecord = score > prevBest;
    if (isRecord) {
      localStorage.setItem(STORAGE_BEST, String(score));
    }
    const totalCoins = Number(localStorage.getItem(STORAGE_COINS) ?? 0) + this.coinsCollected;
    localStorage.setItem(STORAGE_COINS, String(totalCoins));

    this.scene.pause();
    this.scene.launch('GameOver', {
      score,
      best: Math.max(score, prevBest),
      coins: this.coinsCollected,
      isRecord
    });
  }

  // ---- popolamento del mondo -------------------------------------------

  private populateChunk(chunk: ChunkEvent): void {
    if (chunk.type === 'gap') {
      this.spawnGapCoins(chunk.x0, chunk.x1, chunk.yStart, chunk.yEnd);
      return;
    }
    if (chunk.x0 < 900) return;
    if (Math.random() < 0.7) this.spawnCoinLine(chunk.x0, chunk.x1);
    if (chunk.x0 > 1600 && Math.random() < 0.6) this.spawnObstacle(chunk.x0, chunk.x1);
  }

  private spawnCoinLine(x0: number, x1: number): void {
    const n = Phaser.Math.Between(5, 8);
    const spacing = 34;
    const need = n * spacing + 120;
    if (x1 - x0 < need) return;
    const startX = Phaser.Math.Between(x0 + 60, x1 - need + 60);
    for (let i = 0; i < n; i++) {
      const x = startX + i * spacing;
      const surf = this.track.heightAt(x);
      if (surf === null) continue;
      this.addCoin(x, surf - 48);
    }
  }

  private spawnGapCoins(x0: number, x1: number, yStart: number, yEnd: number): void {
    if (Math.random() > 0.8) return;
    const n = 5;
    const peak = Math.min(yStart, yEnd) - 110;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      const x = x0 + (x1 - x0) * t;
      const base = yStart + (yEnd - yStart) * t;
      // parabola sopra il vuoto
      const y = base + (peak - base) * (1 - (2 * t - 1) * (2 * t - 1));
      this.addCoin(x, y - 40);
    }
  }

  private addCoin(x: number, y: number): void {
    const coin = this.add.image(x, y, 'coin').setDepth(8);
    this.tweens.add({
      targets: coin,
      scaleX: 0.3,
      duration: 400,
      yoyo: true,
      repeat: -1,
      delay: x % 400
    });
    this.coinsGroup.push(coin);
  }

  private spawnObstacle(x0: number, x1: number): void {
    if (x1 - x0 < 380) return;
    const ox = Phaser.Math.Between(x0 + 200, x1 - 140);
    const surf = this.track.heightAt(ox);
    if (surf === null) return;

    const roll = Math.random();
    let kind: ObstacleKind;
    if (roll < 0.55) kind = 'critter';
    else if (roll < 0.82) kind = 'barrier';
    else kind = Math.random() < 0.5 ? 'magnet' : 'shield';

    const isPowerup = kind === 'magnet' || kind === 'shield';
    const y = isPowerup ? surf - 60 : surf + 2;
    const sprite = this.add.image(ox, y, kind).setOrigin(0.5, isPowerup ? 0.5 : 1).setDepth(9);
    if (isPowerup) {
      this.tweens.add({
        targets: sprite,
        y: y - 12,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else if (kind === 'critter') {
      this.tweens.add({
        targets: sprite,
        scaleY: 0.88,
        duration: 350,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
    this.obstacles.push({ sprite, kind });
  }

  private cleanupEntities(beforeX: number): void {
    this.coinsGroup = this.coinsGroup.filter((c) => {
      if (c.x < beforeX || !c.active) {
        c.destroy();
        return false;
      }
      return true;
    });
    this.obstacles = this.obstacles.filter((o) => {
      if (o.sprite.x < beforeX || !o.sprite.active) {
        o.sprite.destroy();
        return false;
      }
      return true;
    });
  }
}
