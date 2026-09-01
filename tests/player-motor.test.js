import test from 'node:test';
import assert from 'node:assert/strict';
import { PlayerMotor } from '../src/player/PlayerMotor.js';
import { MOVEMENT } from '../src/tuning.js';

test('grounded jump uses the iOS jump velocity', () => {
  const motor = new PlayerMotor();
  const out = motor.update(1 / 60, { x: 0, jumpPressed: true, jumpHeld: true }, { grounded: true, wallLeft: false, wallRight: false });
  assert.equal(out.vy, -MOVEMENT.jumpVelocity + MOVEMENT.gravity / 60);
});

test('dash uses the iOS dash speed and direction', () => {
  const motor = new PlayerMotor();
  const out = motor.update(1 / 60, { x: -1, dashPressed: true }, { grounded: true, wallLeft: false, wallRight: false });
  assert.equal(out.vx, -MOVEMENT.dashSpeed);
  assert.equal(out.state, 'dash');
});

test('air dash is consumed until grounded again', () => {
  const motor = new PlayerMotor();
  motor.update(1 / 60, { x: 1, dashPressed: true }, { grounded: false, wallLeft: false, wallRight: false });
  for (let i = 0; i < 60; i += 1) motor.update(1 / 60, {}, { grounded: false, wallLeft: false, wallRight: false });
  const blocked = motor.update(1 / 60, { x: 1, dashPressed: true }, { grounded: false, wallLeft: false, wallRight: false });
  assert.notEqual(blocked.state, 'dash');
  motor.update(1 / 60, {}, { grounded: true, wallLeft: false, wallRight: false });
  const restored = motor.update(1 / 60, { x: 1, dashPressed: true }, { grounded: true, wallLeft: false, wallRight: false });
  assert.equal(restored.state, 'dash');
});
