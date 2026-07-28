/**
 * Effetti sonori sintetizzati con WebAudio: nessun file audio,
 * quindi nessun asset di terze parti e bundle leggerissimo.
 */
class Sfx {
  private ctx: AudioContext | null = null;

  /** Da chiamare su un input utente per sbloccare l'audio su iOS/Android. */
  unlock(): void {
    const ctx = this.ensure();
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume();
    }
  }

  private ensure(): AudioContext | null {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    return this.ctx;
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    freqEnd?: number,
    delay = 0
  ): void {
    const ctx = this.ensure();
    if (!ctx || ctx.state === 'suspended') return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, freqEnd), t0 + duration);
    }
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  jump(): void {
    this.tone(300, 0.18, 'square', 0.12, 620);
  }

  doubleJump(): void {
    this.tone(420, 0.16, 'square', 0.12, 820);
  }

  coin(): void {
    this.tone(1180, 0.07, 'triangle', 0.16);
    this.tone(1570, 0.12, 'triangle', 0.14, undefined, 0.06);
  }

  smash(): void {
    this.tone(160, 0.2, 'sawtooth', 0.2, 60);
    this.tone(900, 0.08, 'square', 0.08, 400);
  }

  power(): void {
    this.tone(520, 0.09, 'triangle', 0.14);
    this.tone(660, 0.09, 'triangle', 0.14, undefined, 0.08);
    this.tone(880, 0.14, 'triangle', 0.14, undefined, 0.16);
  }

  crash(): void {
    this.tone(220, 0.5, 'sawtooth', 0.24, 40);
    this.tone(90, 0.6, 'square', 0.18, 30, 0.05);
  }

  click(): void {
    this.tone(700, 0.06, 'square', 0.1);
  }
}

export const sfx = new Sfx();
