import test from 'node:test';
import assert from 'node:assert/strict';
import { AttackController } from '../src/combat/AttackController.js';

test('attack hitbox is active only in the original 0.05-0.13 second window', () => {
  const attack = new AttackController();
  assert.equal(attack.tryStart('horizontal'), true);
  assert.equal(attack.isHitboxActive, false);
  attack.update(0.05);
  assert.equal(attack.isHitboxActive, true);
  attack.update(0.081);
  assert.equal(attack.isHitboxActive, false);
});

test('attack cannot restart during cooldown', () => {
  const attack = new AttackController();
  assert.equal(attack.tryStart(), true);
  assert.equal(attack.tryStart(), false);
  attack.update(0.32);
  assert.equal(attack.tryStart(), true);
});
