import { ATTACK } from '../tuning.js';

export class AttackController {
  constructor() {
    this.attackRemaining = 0;
    this.cooldownRemaining = 0;
    this.currentDirection = 'horizontal';
  }

  get isAttacking() {
    return this.attackRemaining > 0;
  }

  get isHitboxActive() {
    if (!this.isAttacking) return false;
    const elapsed = ATTACK.attackDuration - this.attackRemaining;
    return elapsed >= ATTACK.hitboxStart && elapsed <= ATTACK.hitboxEnd;
  }

  tryStart(direction = 'horizontal') {
    if (this.cooldownRemaining > 0) return false;
    this.currentDirection = direction;
    this.attackRemaining = ATTACK.attackDuration;
    this.cooldownRemaining = ATTACK.cooldownDuration;
    return true;
  }

  update(dt) {
    if (!(dt > 0)) return;
    this.attackRemaining = Math.max(0, this.attackRemaining - dt);
    this.cooldownRemaining = Math.max(0, this.cooldownRemaining - dt);
  }

  reset() {
    this.attackRemaining = 0;
    this.cooldownRemaining = 0;
    this.currentDirection = 'horizontal';
  }
}
