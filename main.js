import {runningPose} from './animation.js';
import {W,H,GROUND,PLAYER_X,createGame,start,jump,pause,step,bestScore,saveBest} from './game.js';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),overlay=document.querySelector('#overlay'),panel=document.querySelector('#panel'),hud=document.querySelector('#hud'),action=document.querySelector('#action'),score=document.querySelector('#score'),distance=document.querySelector('#distance');
const spriteCanvas=document.createElement('canvas'); spriteCanvas.width=320; spriteCanvas.height=360;
const spriteContext=spriteCanvas.getContext('2d');
let storage; try { storage=window.localStorage; } catch { storage=null; }
let game=createGame(),images={},last=0,accumulator=0,best=bestScore(storage),ready=false;
const sources=['paisagem','anel','pedra','tronco','chao',...Array.from({length:8},(_,i)=>`thais-corrida-0${i+1}`)];
function loadImage(name){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve([name,img]);img.onerror=()=>reject(new Error(name));img.src=`assets/${name}.png`;});}
function reset(){panel.classList.remove('ending');canvas.focus({preventScroll:true});game=createGame();start(game);overlay.hidden=true;hud.hidden=false;accumulator=0;last=0;render();}
function showPause(){panel.classList.remove('opening','ending');overlay.hidden=false;panel.innerHTML='<p class="ornament" aria-hidden="true">✦ &nbsp; ✧ &nbsp; ✦</p><h2>Uma pequena pausa</h2><p class="intro">A aventura espera por você.</p><button class="primary" id="resume">Continuar</button><button class="secondary" id="restart">Recomeçar</button>';document.querySelector('#resume').onclick=resume;document.querySelector('#restart').onclick=reset;document.querySelector('#resume').focus();}
function resume(){if(game.mode!=='paused')return;pause(game);overlay.hidden=true;last=0;accumulator=0;canvas.focus({preventScroll:true});}
function togglePause(){if(game.mode==='running'){pause(game);showPause();}else if(game.mode==='paused')resume();}
function finish(){
 best=Math.max(best,game.score);saveBest(storage,best);
 panel.classList.remove('opening'); panel.classList.add('ending');
 hud.hidden=true;overlay.hidden=false;
 panel.innerHTML=`<img class="ending-character" src="assets/tela-reinicio/thais-cansada.png" alt="">
 <div class="ending-content">
  <h2 class="ending-title"><img src="assets/tela-reinicio/titulo-jornada-continua.png" alt="A jornada continua"></h2>
  <img class="ending-message" src="assets/tela-reinicio/frase-principe-jp.png" alt="Cada anel leva Thaís mais perto do príncipe JP.">
  <div class="ending-results" aria-label="Resultado da partida">
   <div class="ending-stat"><span>ANÉIS</span><strong>${game.score}</strong></div>
   <div class="ending-stat"><span>DISTÂNCIA</span><strong>${Math.floor(game.distance/10)} <small>m</small></strong></div>
   <div class="ending-stat"><span>RECORDE</span><strong>${best}</strong></div>
  </div>
  <button class="ending-again" id="again" aria-label="Jogar novamente"><span class="sr-only">Jogar novamente</span></button>
 </div>`;
 document.querySelector('#again').onclick=reset;panel.tabIndex=-1;panel.focus({preventScroll:true});
}
function draw(){
 ctx.clearRect(0,0,W,H);
 // Crop the panorama without stretching it; it is a single still plate, not parallax.
 const bg=images.paisagem, sourceWidth=bg.height*W/490;
 ctx.drawImage(bg,(bg.width-sourceWidth)/2,0,sourceWidth,bg.height,0,0,W,490);
 // The provided ground vignette forms a continuous-looking foreground. The
 // contact line sits on its dirt, not on the bottom of the source image.
 ctx.fillStyle='#70442b';ctx.fillRect(0,GROUND+16,W,H-GROUND-16);
 ctx.fillStyle='#a66e3e';ctx.fillRect(0,GROUND+4,W,20);
 const offset=(game.distance*.85)%230;
 // Extend the supplied dirt texture below the contact plane.
 for(let x=-350-offset;x<W+350;x+=230) ctx.drawImage(images.chao,210,155,270,70,x,GROUND+40,240,H-GROUND-40);
 for(let x=-350-offset;x<W+350;x+=230) ctx.drawImage(images.chao,x,GROUND-70,350,148);
 for(const e of game.entities){
  const x=e.x-game.distance;if(x < -150 || x>W+150)continue;
  const img=images[e.type==='ring'?'anel':e.type==='rock'?'pedra':'tronco'];
  ctx.drawImage(img,x,e.y,e.w,e.h);
 }
 // Blend adjacent poses on an isolated canvas so semitransparent edges remain
 // clean. The grounded baseline and jump displacement remain game coordinates.
 const pose=runningPose(game.distance);
 spriteContext.clearRect(0,0,320,360);
 spriteContext.globalCompositeOperation='source-over';
 spriteContext.globalAlpha=1-pose.blend;
 spriteContext.drawImage(images[`thais-corrida-0${pose.current}`],0,0);
 if(pose.blend>0){
  spriteContext.globalCompositeOperation='lighter';
  spriteContext.globalAlpha=pose.blend;
  spriteContext.drawImage(images[`thais-corrida-0${pose.next}`],0,0);
 }
 spriteContext.globalAlpha=1;
 spriteContext.globalCompositeOperation='source-over';
 ctx.drawImage(spriteCanvas,PLAYER_X-85,GROUND+game.y-225,200,225);
}
function render(){if(!ready)return;draw();score.textContent=game.score;distance.innerHTML=`${Math.floor(game.distance/10)} <small>m</small>`;}
function loop(t){if(!last)last=t;const elapsed=Math.min((t-last)/1000,.1);last=t;if(game.mode==='running'){accumulator+=elapsed;while(accumulator>=1/120 && game.mode==='running'){step(game,1/120);accumulator-=1/120;}if(game.mode==='over')finish();}render();requestAnimationFrame(loop);}
document.querySelector('#pause').addEventListener('click',togglePause);canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();jump(game);});window.addEventListener('keydown',e=>{if(e.code==='Escape'){if(game.mode==='running'||game.mode==='paused'){e.preventDefault();togglePause();}return;}if((e.code==='Space'||e.code==='ArrowUp')&&!e.repeat&&game.mode==='running'&&!['BUTTON','A'].includes(document.activeElement?.tagName)){e.preventDefault();jump(game);}});window.addEventListener('blur',()=>{if(game.mode==='running'){pause(game);showPause();}});document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.mode==='running'){pause(game);showPause();}});
Promise.all(sources.map(loadImage)).then(entries=>{images=Object.fromEntries(entries);ready=true;action.disabled=false;document.querySelector('#loading-status').hidden=true;if(matchMedia('(pointer: coarse)').matches)document.querySelector('#hint span').textContent='Toque na tela para pular';action.addEventListener('click',reset);requestAnimationFrame(loop);}).catch(()=>{document.querySelector('#loading-status').textContent='Não foi possível carregar o jogo. Confira os arquivos e recarregue a página.';});
