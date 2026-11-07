export const W = 1000, H = 560, GROUND = 445, PLAYER_X = 150;
export const GRAVITY = 1900, JUMP = -780, MAX_SPEED = 370;
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
export function bestScore(storage) { try { const n = Number(storage.getItem('corrida-recorde')); return Number.isSafeInteger(n) && n >= 0 ? n : 0; } catch { return 0; } }
export function saveBest(storage, n) { try { storage.setItem('corrida-recorde', String(n)); } catch {} }
export function createGame(seed = Date.now()) { return { mode:'ready', random:rng(seed), distance:0, score:0, speed:270, y:0, vy:0, entities:[], next:800, time:0 }; }
export function start(g) { g.mode = 'running'; }
export function jump(g) { if (g.mode === 'running' && g.y === 0 && g.vy === 0) { g.vy = JUMP; return true; } return false; }
export function pause(g) { if (g.mode === 'running') g.mode='paused'; else if (g.mode === 'paused') g.mode='running'; }
export function overlaps(a,b) { return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
export function spawn(g) {
 const x = g.next; const log = g.random() < .5;
 g.entities.push({type:log?'log':'rock', x, y:GROUND-(log?55:65), w:log?105:76, h:log?55:65});
 // A short accessible arc leads into each obstacle. All values are world coordinates.
 for(let i=0;i<5;i++) g.entities.push({type:'ring', x:x-230+i*57, y:GROUND-48-[0,42,74,42,0][i], w:34, h:34});
 // At top speed this gives over a second from landing to the next jump.
 g.next += 620 + g.random()*150;
}
export function step(g, dt) {
 if(g.mode !== 'running') return;
 g.time += dt; g.speed = Math.min(MAX_SPEED, 270 + g.distance/90); g.distance += g.speed*dt;
 g.y = Math.min(0, g.y + g.vy*dt + 0.5*GRAVITY*dt*dt); g.vy += GRAVITY*dt; if(g.y===0 && g.vy>0) g.vy=0;
 while(g.next < g.distance + W + 80) spawn(g);
 const player={x:PLAYER_X-20,y:GROUND+g.y-150,w:44,h:147};
 for(const e of g.entities) {
  const sx=e.x-g.distance;
  if(e.type==='ring') { if(!e.collected && overlaps(player,{x:sx+5,y:e.y+5,w:e.w-10,h:e.h-10})) { e.collected=true; g.score++; } }
  else if(overlaps(player,{x:sx+8,y:e.y+7,w:e.w-16,h:e.h-7})) { g.mode='over'; break; }
 }
 g.entities=g.entities.filter(e=>!e.collected && e.x-g.distance+e.w > -80);
}
