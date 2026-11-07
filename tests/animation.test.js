import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runningPose, RUN_SEQUENCE, STRIDE_LENGTH } from '../animation.js';
test('ciclo de corrida fecha sem pausa duplicada e responde à distância',()=>{
 assert.deepEqual(runningPose(0),runningPose(STRIDE_LENGTH));
 assert.equal(runningPose(0).current,1);
 assert.equal(runningPose(STRIDE_LENGTH * 3 / RUN_SEQUENCE.length).current,4);
 const before=runningPose(STRIDE_LENGTH * (RUN_SEQUENCE.length - .01) / RUN_SEQUENCE.length);
 assert.equal(before.next,1); assert.ok(before.blend > .99);
});
