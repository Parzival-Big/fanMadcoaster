export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

// Fisica del carrello (px, secondi)
export const GRAVITY = 2600;
export const MAX_FALL_SPEED = 1700;
export const JUMP_VELOCITY = 950;
export const DOUBLE_JUMP_VELOCITY = 850;

// Velocità orizzontale: parte lenta e cresce con la distanza
export const BASE_SPEED = 330;
export const MAX_SPEED = 720;
export const SPEED_PER_PX = 0.013;

// Limiti verticali dei binari nel mondo
export const TRACK_MIN_Y = 210;
export const TRACK_MAX_Y = 470;

// Il carrello resta a questo offset dal bordo sinistro della camera
export const CART_SCREEN_X = 230;

// Sotto questa quota il carrello è caduto nel vuoto
export const DEATH_Y = GAME_HEIGHT + 160;

export const STORAGE_BEST = 'turbocoaster-best';
export const STORAGE_COINS = 'turbocoaster-coins';

export function speedAt(distance: number): number {
  return Math.min(MAX_SPEED, BASE_SPEED + distance * SPEED_PER_PX);
}

/** Gittata orizzontale approssimativa di un salto singolo alla velocità data. */
export function jumpRange(speed: number): number {
  const airTime = (2 * JUMP_VELOCITY) / GRAVITY;
  return speed * airTime;
}
