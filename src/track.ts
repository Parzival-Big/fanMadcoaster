import Phaser from 'phaser';
import {
  GAME_HEIGHT,
  TRACK_MIN_Y,
  TRACK_MAX_Y,
  jumpRange,
  speedAt
} from './constants';

/** Tratto rettilineo (eventualmente in pendenza) di binario. */
export interface Segment {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

/** Evento generato durante la creazione del percorso, usato per popolare monete/ostacoli. */
export type ChunkEvent =
  | { type: 'run'; x0: number; x1: number }
  | { type: 'gap'; x0: number; x1: number; yStart: number; yEnd: number };

export class Track {
  segments: Segment[] = [];
  private genX = 0;
  private lastY = 400;

  constructor(private onChunk: (chunk: ChunkEvent) => void) {
    // piattaforma iniziale sicura
    this.addSegment(-400, 900, 400, 400);
    this.genX = 900;
  }

  private addSegment(x0: number, x1: number, y0: number, y1: number): void {
    this.segments.push({ x0, x1, y0, y1 });
    this.lastY = y1;
  }

  /** Quota del binario alla coordinata x, oppure null se lì c'è un vuoto. */
  heightAt(x: number): number | null {
    for (const s of this.segments) {
      if (x >= s.x0 && x <= s.x1) {
        const t = (x - s.x0) / (s.x1 - s.x0);
        return s.y0 + (s.y1 - s.y0) * t;
      }
    }
    return null;
  }

  /** Pendenza (dy/dx) alla coordinata x; 0 se nel vuoto. */
  slopeAt(x: number): number {
    for (const s of this.segments) {
      if (x >= s.x0 && x <= s.x1) {
        return (s.y1 - s.y0) / (s.x1 - s.x0);
      }
    }
    return 0;
  }

  /** Genera percorso finché non copre almeno untilX. */
  ensure(untilX: number): void {
    while (this.genX < untilX) {
      if (Math.random() < 0.55 || this.genX < 1500) {
        this.generateRun();
      } else {
        this.generateGap();
      }
    }
  }

  private generateRun(): void {
    const startX = this.genX;
    const parts = Phaser.Math.Between(2, 4);
    for (let i = 0; i < parts; i++) {
      const len = Phaser.Math.Between(180, 340);
      const dy = Phaser.Math.Between(-70, 70);
      const y1 = Phaser.Math.Clamp(this.lastY + dy, TRACK_MIN_Y, TRACK_MAX_Y);
      this.addSegment(this.genX, this.genX + len, this.lastY, y1);
      this.genX += len;
    }
    this.onChunk({ type: 'run', x0: startX, x1: this.genX });
  }

  private generateGap(): void {
    const speed = speedAt(this.genX);
    const range = jumpRange(speed);
    const yStart = this.lastY;

    const dyChoices = [-130, -70, 0, 60, 130];
    const dy = dyChoices[Phaser.Math.Between(0, dyChoices.length - 1)];
    const yEnd = Phaser.Math.Clamp(yStart + dy, TRACK_MIN_Y, TRACK_MAX_Y);

    // se il binario di arrivo è più in alto serve il doppio salto: vuoto più corto
    const climbing = yEnd < yStart - 20;
    const factor = climbing
      ? Phaser.Math.FloatBetween(0.3, 0.42)
      : Phaser.Math.FloatBetween(0.38, 0.6);
    const gapLen = Math.round(range * factor);

    const gapX0 = this.genX;
    this.genX += gapLen;
    this.onChunk({ type: 'gap', x0: gapX0, x1: this.genX, yStart, yEnd });

    // tratto di atterraggio pianeggiante, abbastanza lungo da riprendersi
    const landLen = Phaser.Math.Between(320, 520);
    this.addSegment(this.genX, this.genX + landLen, yEnd, yEnd);
    this.genX += landLen;
    this.onChunk({ type: 'run', x0: this.genX - landLen, x1: this.genX });
  }

  /** Elimina i segmenti ormai fuori schermo a sinistra. */
  prune(beforeX: number): void {
    this.segments = this.segments.filter((s) => s.x1 >= beforeX);
  }

  /** Disegna i segmenti visibili: rotaie, traversine e piloni di sostegno. */
  draw(g: Phaser.GameObjects.Graphics, viewX0: number, viewX1: number): void {
    g.clear();
    for (const s of this.segments) {
      if (s.x1 < viewX0 || s.x0 > viewX1) continue;
      const slope = (s.y1 - s.y0) / (s.x1 - s.x0);
      const yAt = (x: number) => s.y0 + (x - s.x0) * slope;

      // piloni
      g.fillStyle(0x4a3524, 0.9);
      const firstPillar = Math.ceil(s.x0 / 96) * 96;
      for (let px = firstPillar; px < s.x1; px += 96) {
        g.fillRect(px - 4, yAt(px) + 6, 8, GAME_HEIGHT - yAt(px));
      }

      // traversine
      g.fillStyle(0x6b4a2f);
      for (let tx = s.x0 + 10; tx < s.x1 - 4; tx += 26) {
        g.fillRect(tx - 3, yAt(tx) - 2, 7, 14);
      }

      // rotaie (doppia linea stile montagne russe)
      g.lineStyle(5, 0x8a5a33);
      g.lineBetween(s.x0, s.y0, s.x1, s.y1);
      g.lineStyle(5, 0x8a5a33);
      g.lineBetween(s.x0, s.y0 + 12, s.x1, s.y1 + 12);
      g.lineStyle(2, 0xd9a55f);
      g.lineBetween(s.x0, s.y0 - 2, s.x1, s.y1 - 2);
    }
  }
}
