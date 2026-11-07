import {test} from 'node:test';import assert from 'node:assert/strict';import {createGame,start,jump,step,pause,spawn,GROUND,PLAYER_X,GRAVITY,JUMP,MAX_SPEED,bestScore,saveBest} from '../game.js';
test('salto único atinge altura suficiente e retorna ao chão',()=>{const g=createGame(1);start(g);g.next=1e9;assert.equal(jump(g),true);assert.equal(jump(g),false);let min=0;for(let i=0;i<140;i++){step(g,1/120);min=Math.min(min,g.y);}assert.ok(min < -145);assert.equal(g.y,0);assert.equal(jump(g),true);});
test('coleta acontece apenas uma vez e colisão termina partida',()=>{const g=createGame(1);start(g);g.next=1e9;g.entities=[{type:'ring',x:PLAYER_X,y:GROUND-70,w:34,h:34}];step(g,1/120);step(g,1/120);assert.equal(g.score,1);g.entities=[{type:'rock',x:g.distance+PLAYER_X-10,y:GROUND-65,w:76,h:65}];step(g,1/120);assert.equal(g.mode,'over');});
test('pausa congela e reinício cria estado limpo',()=>{const g=createGame(2);start(g);step(g,.1);pause(g);const d=g.distance;step(g,1);assert.equal(g.distance,d);pause(g);step(g,.1);assert.ok(g.distance>d);const fresh=createGame(2);assert.equal(fresh.score,0);assert.equal(fresh.entities.length,0);assert.equal(fresh.distance,0);});
test('geração é reproduzível e mantém distância de recuperação',()=>{const a=createGame(42),b=createGame(42);for(let i=0;i<1000;i++){const prev=a.next;spawn(a);spawn(b);assert.ok(a.next-prev>=620);}assert.deepEqual(a.entities,b.entities);const flight=-2*JUMP/GRAVITY;assert.ok(620/MAX_SPEED>flight+0.8);assert.ok(JUMP*JUMP/(2*GRAVITY)>65);});
test('recorde tolera armazenamento indisponível e dados inválidos',()=>{const bad={getItem(){throw Error()},setItem(){throw Error()}};assert.equal(bestScore(bad),0);assert.doesNotThrow(()=>saveBest(bad,4));assert.equal(bestScore({getItem:()=>'-5'}),0);let n;saveBest({setItem:(k,v)=>n=v},7);assert.equal(n,'7');});
test('grupos variam em quantidade e posição sem invadir obstáculos',()=>{
 const g=createGame(123); const counts=new Set(), positions=new Set(), heights=new Set();
 for(let i=0;i<1000;i++){
  const obstacleX=g.next; const previous=g.entities.length;
  spawn(g);
  const group=g.entities.slice(previous); const obstacle=group[0], rings=group.slice(1);
  counts.add(rings.length);
  assert.ok(rings.length>=1 && rings.length<=6);
  for(const ring of rings){
   positions.add(obstacleX-ring.x); heights.add(GROUND-ring.y);
   assert.ok(ring.x + ring.w <= obstacle.x, 'anel não deve sobrepor o obstáculo');
   assert.ok(ring.x > obstacleX-620+105, 'anel deve ficar após o obstáculo anterior');
   assert.ok(GROUND-ring.y>=48 && GROUND-ring.y<=163, 'anel deve ficar em altura alcançável');
  }
  for(let j=1;j<rings.length;j++) assert.ok(rings[j].x-rings[j-1].x>=45);
 }
 assert.ok(counts.size>1 && positions.size>1 && heights.size>1);
});
