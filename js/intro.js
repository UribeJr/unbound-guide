/* Desk intro: a Three.js trainer's journal that opens into the guide.
   Three.js is loaded lazily (classic script tag, works on file://). Reduced motion or no WebGL: a flat 2D cover with a fade. */
(function(){
const G=window.__guide; if(!G) return;
const S=G.state, gs=window.gsap;
const el=document.getElementById('intro'), cv=document.getElementById('introCanvas'), flat=document.getElementById('introFlat'), hint=document.getElementById('introHint');
const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
let three=null, opened=false;

function landing(){ const p=S.page||0; G.gotoPage(p===0?1:p); }
function close(){
  if(el.hidden) return;
  const fin=()=>{ el.hidden=true; el.style.opacity=''; dispose(); G.annotateVisible&&G.annotateVisible(); };
  if(gs&&!RM) gs.to(el,{opacity:0,duration:.7,ease:'power1.out',onComplete:fin}); else { el.style.transition='opacity .4s'; el.style.opacity=0; setTimeout(fin,420); }
}
function skip(){ window.track&&track('intro_skip'); S.intro=false; G.save(); document.querySelectorAll('input[data-set="intro"]').forEach(x=>x.checked=false); close(); }
document.getElementById('introSkip').addEventListener('click',e=>{e.stopPropagation(); skip();});
document.addEventListener('keydown',e=>{ if(el.hidden) return; if(e.key==='Escape'){ e.stopPropagation(); close(); } else if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openNow(); } },true);

function flat2d(msg){
  el.classList.add('is2d'); hint.textContent=msg||'tap the journal to open it';
  const go=()=>{ if(opened) return; opened=true; window.track&&track('intro_open',{mode:'2d'}); landing();
    if(gs&&!RM) gs.to(flat,{rotationY:-70,transformOrigin:'0% 50%',opacity:0,duration:.6,ease:'power2.in',onComplete:close}); else close(); };
  flat.onclick=go; flat.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); go(); } };
}
function openNow(){ if(three) three.open(); else if(el.classList.contains('is2d')) flat.click(); }

function play(force){
  if(!force && S.intro===false) return;
  opened=false; el.hidden=false; el.style.opacity=''; el.classList.remove('is2d'); hint.textContent='click the journal to open it';
  if(document.body.classList.contains('mobile')) hint.textContent='tap the journal to open it';
  if(RM) return flat2d('reduced motion is on · tap the journal to open it');
  const go=()=>{ try{ three=build(); }catch(err){ console.warn('3D intro unavailable',err); flat2d(); } };
  if(window.THREE) go(); else { const s=document.createElement('script'); s.src='vendor/three.min.js'; s.onload=go; s.onerror=()=>flat2d(); document.head.appendChild(s); }
}
window.__intro={play};

/* ---------------- procedural canvas textures ---------------- */
function cvs(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; return [c,c.getContext('2d')]; }
function speckle(x,w,h,n,a,col){ for(let i=0;i<n;i++){ x.fillStyle=`rgba(${col},${Math.random()*a})`; x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2); } }
function woodTex(night){ const [c,x]=cvs(1024,1024);
  x.fillStyle=night?'#2a1b11':'#6e4b31'; x.fillRect(0,0,1024,1024);
  for(let i=0;i<420;i++){ const y=Math.random()*1024, a=Math.random()*.16; x.strokeStyle=Math.random()<.5?`rgba(30,15,5,${a})`:`rgba(255,220,170,${a*.5})`; x.lineWidth=.6+Math.random()*2.6; x.beginPath();
    for(let X=0;X<=1024;X+=16){ const yy=y+Math.sin(X*.006+i)*7+Math.sin(X*.021+i*3)*2; X?x.lineTo(X,yy):x.moveTo(X,yy);} x.stroke(); }
  for(let k=0;k<5;k++){ const kx=Math.random()*1024, ky=Math.random()*1024; for(let r=4;r<40;r+=3){ x.strokeStyle=`rgba(40,20,8,${.12})`; x.beginPath(); x.ellipse(kx,ky,r*2.4,r*.7,0,0,7); x.stroke(); } }
  for(let X=0;X<1024;X+=256){ x.fillStyle='rgba(0,0,0,.22)'; x.fillRect(X,0,2,1024); }
  speckle(x,1024,1024,6000,.12,'20,10,4'); return c; }
function kraftBase(x,w,h,light){ const g=x.createLinearGradient(0,0,w,h); g.addColorStop(0,light?'#d2a875':'#c89a63'); g.addColorStop(.6,light?'#b98d5b':'#a77a48'); g.addColorStop(1,'#8e6436');
  x.fillStyle=g; x.fillRect(0,0,w,h); for(let i=0;i<260;i++){ x.strokeStyle=`rgba(90,55,20,${Math.random()*.08})`; x.lineWidth=1+Math.random()*2; const X=Math.random()*w; x.beginPath(); x.moveTo(X,0); x.lineTo(X+Math.random()*12-6,h); x.stroke(); }
  speckle(x,w,h,16000,.18,'70,40,15'); speckle(x,w,h,4000,.2,'255,240,210'); }
function tape(x,cx,cy,w,h,rot){ x.save(); x.translate(cx,cy); x.rotate(rot); x.fillStyle='rgba(234,222,184,.9)'; x.fillRect(-w/2,-h/2,w,h); x.restore(); }
function pixelBadge(x,id,px,ox,oy,ghost){ const art=(window.BADGE_ART||{})[id], b=(window.BADGES||[]).find(q=>q.id===id); if(!art||!b) return;
  const mix=window.mixColor; const pal= ghost? {k:'rgba(40,22,8,.55)',a:'rgba(40,22,8,.22)',b:'rgba(40,22,8,.15)',c:'rgba(40,22,8,.32)',w:'rgba(40,22,8,.1)'}
   : {k:'#1d1a16',a:b.color,b:mix(b.color,.55,'#ffffff'),c:mix(b.color,.35,'#000000'),w:'#fff'};
  art.forEach((row,yy)=>[...row].forEach((ch,xx)=>{ if(pal[ch]){ x.fillStyle=pal[ch]; x.fillRect(ox+xx*px,oy+yy*px,px+.5,px+.5);} })); }
function coverTex(){ const W=1024,H=1376; const [c,x]=cvs(W,H); kraftBase(x,W,H);
  // label card
  x.save(); x.translate(120,190); x.rotate(-.025); x.shadowColor='rgba(0,0,0,.35)'; x.shadowBlur=18; x.shadowOffsetY=8; x.fillStyle='#fffdf6'; x.fillRect(0,0,640,430); x.shadowColor='transparent';
  x.strokeStyle='rgba(80,120,190,.25)'; x.lineWidth=2; for(let y=150;y<430;y+=44){ x.beginPath(); x.moveTo(0,y); x.lineTo(640,y); x.stroke(); }
  x.strokeStyle='rgba(192,57,43,.6)'; x.beginPath(); x.moveTo(0,104); x.lineTo(640,104); x.stroke();
  x.fillStyle='#c0392b'; x.font='22px "Press Start 2P"'; x.fillText('FIELD GUIDE',36,60);
  x.fillStyle='#1f3f7a'; x.font='700 64px Caveat'; x.fillText('Pokémon Unbound',34,180);
  x.fillStyle='#2a251f'; x.font='112px "Permanent Marker"'; x.fillText("Trainer's",30,300); x.fillText('Journal',30,408); x.restore();
  tape(x,470,190,190,52,-.06);
  // stamp
  x.save(); x.translate(820,260); x.rotate(.2); x.globalAlpha=.8; x.strokeStyle='#c0392b'; x.fillStyle='#c0392b'; x.lineWidth=7; x.beginPath(); x.arc(0,0,110,0,7); x.stroke(); x.lineWidth=3; x.beginPath(); x.arc(0,0,92,0,7); x.stroke();
  x.textAlign='center'; x.font='30px "Permanent Marker"'; x.fillText('BORRIUS',0,-34); x.font='64px "Permanent Marker"'; x.fillText(String((window.BOOK&&BOOK.pages.length)||''),0,30); x.font='24px "Permanent Marker"'; x.fillText('PAGES',0,66); x.restore();
  // badge case strip
  x.fillStyle='rgba(40,25,10,.22)'; x.fillRect(110,1110,8*86+30,110); (window.BADGES||[]).forEach((b,i)=>pixelBadge(x,b.id,6,128+i*86,1129,true));
  x.fillStyle='#2f2216'; x.font='700 46px Caveat'; x.fillText('notes & maps from unboundwiki.com',112,1290);
  // elastic band shadow line
  return c; }
function insideTex(){ const W=1024,H=1376; const [c,x]=cvs(W,H); kraftBase(x,W,H,true);
  x.fillStyle='rgba(60,35,15,.75)'; x.font='700 64px Caveat'; x.fillText('If found, please return to',110,240); x.fillText('the nearest Pokémon Center.',110,320);
  x.font='700 56px Caveat'; x.fillText('Trainer: ____________',110,470);
  x.fillStyle='rgba(255,253,246,.85)'; x.fillRect(110,900,800,360); x.strokeStyle='rgba(0,0,0,.2)'; x.strokeRect(110,900,800,360);
  x.fillStyle='rgba(60,35,15,.6)'; x.font='700 50px Caveat'; x.fillText('pocket: stickers & badge stamps',150,1000); return c; }
function pageTex(){ const W=1024,H=1376; const [c,x]=cvs(W,H); x.fillStyle='#f6eedb'; x.fillRect(0,0,W,H);
  x.fillStyle='rgba(70,58,45,.3)'; for(let y=30;y<H;y+=34) for(let X=30;X<W;X+=34){ x.beginPath(); x.arc(X,y,2,0,7); x.fill(); }
  speckle(x,W,H,9000,.1,'90,70,40');
  x.fillStyle='#2a251f'; x.font='86px "Permanent Marker"'; x.fillText('Borrius Field Notes',90,190);
  x.fillStyle='rgba(31,63,122,.85)'; x.font='700 56px Caveat'; ['Day 1: woke up in the Shadow Base?!','Rival picked the starter that beats mine…','Next stop: Frozen Heights → Route 1'].forEach((t,i)=>x.fillText(t,100,330+i*80));
  x.strokeStyle='rgba(192,57,43,.8)'; x.lineWidth=5; x.beginPath(); x.ellipse(700,800,170,120,-.1,0,6.6); x.stroke();
  x.fillStyle='rgba(192,57,43,.9)'; x.font='700 52px Caveat'; x.fillText('catch them all!',580,815); return c; }
function edgeTex(){ const [c,x]=cvs(512,64); x.fillStyle='#f3ead4'; x.fillRect(0,0,512,64); for(let y=0;y<64;y+=2){ x.fillStyle=`rgba(120,100,70,${.12+Math.random()*.12})`; x.fillRect(0,y,512,1); } return c; }
function noteTex(){ const [c,x]=cvs(512,512); x.fillStyle='#fbe983'; x.fillRect(0,0,512,512); speckle(x,512,512,3000,.08,'120,90,0');
  x.fillStyle='#2a251f'; x.font='700 68px Caveat'; x.fillText('Gym 1 → Mirskle',40,130); x.fillStyle='#c0392b'; x.font='700 60px Caveat'; x.fillText('bring Fire or',40,250); x.fillText('Flying types!',40,330);
  x.strokeStyle='#c0392b'; x.lineWidth=5; x.beginPath(); x.moveTo(40,360); x.quadraticCurveTo(220,390,420,350); x.stroke(); return c; }

/* ---------------- scene ---------------- */
function build(){
  const T=window.THREE, mobile=document.body.classList.contains('mobile'), night=!!S.night;
  const renderer=new T.WebGLRenderer({canvas:cv,antialias:!mobile,alpha:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, mobile?1:1.6)); renderer.setSize(innerWidth,innerHeight,false);
  renderer.useLegacyLights=true; renderer.outputColorSpace=T.SRGBColorSpace; renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=night?.95:1.08;
  renderer.shadowMap.enabled=!mobile; renderer.shadowMap.type=T.PCFSoftShadowMap;
  const scene=new T.Scene(); scene.background=new T.Color(night?0x0d0805:0x2a1b11); scene.fog=new T.Fog(scene.background,14,30);
  const cam=new T.PerspectiveCamera(34,innerWidth/innerHeight,.1,80);
  const tex=(c,rep)=>{ const t=new T.CanvasTexture(c); t.colorSpace=T.SRGBColorSpace; t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()); if(rep){t.wrapS=t.wrapT=T.RepeatWrapping; t.repeat.set(rep,rep);} return t; };
  const std=(o)=>new T.MeshStandardMaterial(Object.assign({roughness:.85,metalness:0},o));
  // desk
  const desk=new T.Mesh(new T.PlaneGeometry(40,40),std({map:tex(woodTex(night),4),roughness:.62}));
  desk.rotation.x=-Math.PI/2; desk.receiveShadow=true; scene.add(desk);
  // journal
  const W=3.2,D=4.3,PT=.3,CT=.05, J=new T.Group(); scene.add(J); J.rotation.y=-.08;
  const kraft=std({color:0xa77a48,roughness:.9}), kraftDark=std({color:0x8e6436,roughness:.9});
  const back=new T.Mesh(new T.BoxGeometry(W+.1,CT,D+.1),kraftDark); back.position.y=CT/2; back.castShadow=back.receiveShadow=true; J.add(back);
  const edge=std({map:tex(edgeTex())}), ptop=std({map:tex(pageTex()),roughness:.95});
  const block=new T.Mesh(new T.BoxGeometry(W-.04,PT,D-.08),[edge,edge,ptop,edge,edge,edge]); block.position.set(.02,CT+PT/2,0); block.castShadow=block.receiveShadow=true; J.add(block);
  const pivot=new T.Group(); pivot.position.set(-(W+.1)/2,CT+PT+CT/2,0); J.add(pivot);
  const coverM=[kraft,kraft,std({map:tex(coverTex()),roughness:.88}),std({map:(()=>{const t=tex(insideTex()); t.center.set(.5,.5); t.rotation=Math.PI; return t;})(),roughness:.9}),kraft,kraft];
  const cover=new T.Mesh(new T.BoxGeometry(W+.1,CT,D+.1),coverM); cover.position.x=(W+.1)/2; cover.castShadow=true; cover.receiveShadow=true; pivot.add(cover);
  // spiral rings
  const ringM=std({color:0xc9ccd1,metalness:.9,roughness:.32});
  for(let z=-D/2+.22;z<D/2-.1;z+=.26){ const r=new T.Mesh(new T.TorusGeometry(.2,.022,8,24),ringM); r.position.set(-W/2-.02,CT+PT/2+.02,z); r.castShadow=true; J.add(r); }
  // elastic band
  const bandM=std({color:0x1e1a17,roughness:.6}), band=new T.Group();
  const bt=new T.Mesh(new T.BoxGeometry(.16,.014,D+.16),bandM); bt.position.y=CT*2+PT+.008; band.add(bt);
  [-1,1].forEach(s=>{ const side=new T.Mesh(new T.BoxGeometry(.16,PT+CT*2+.02,.014),bandM); side.position.set(0,(PT+CT*2)/2,s*(D/2+.08)); band.add(side); });
  band.position.x=W/2-.5; J.add(band); band.traverse(o=>o.castShadow=true);
  // pencil
  const P=new T.Group(); const yel=std({color:0xf2b705,roughness:.55});
  const body=new T.Mesh(new T.CylinderGeometry(.075,.075,2.5,6),yel); body.rotation.z=Math.PI/2; P.add(body);
  const wood=new T.Mesh(new T.ConeGeometry(.075,.32,6),std({color:0xe2c290})); wood.rotation.z=-Math.PI/2; wood.position.x=1.41; P.add(wood);
  const lead=new T.Mesh(new T.ConeGeometry(.025,.1,6),std({color:0x333333})); lead.rotation.z=-Math.PI/2; lead.position.x=1.6; P.add(lead);
  const fer=new T.Mesh(new T.CylinderGeometry(.08,.08,.18,12),std({color:0xbfc3c8,metalness:.8,roughness:.3})); fer.rotation.z=Math.PI/2; fer.position.x=-1.33; P.add(fer);
  const er=new T.Mesh(new T.CylinderGeometry(.078,.078,.2,12),std({color:0xe88a9a})); er.rotation.z=Math.PI/2; er.position.x=-1.52; P.add(er);
  P.position.set(W/2+.95,.08,.4); P.rotation.y=1.25; P.traverse(o=>o.castShadow=true); scene.add(P);
  // Poké Ball
  const B=new T.Group(), R=.46;
  const top=new T.Mesh(new T.SphereGeometry(R,40,20,0,Math.PI*2,0,Math.PI/2),std({color:0xe3350d,roughness:.35})); B.add(top);
  const bot=new T.Mesh(new T.SphereGeometry(R,40,20,0,Math.PI*2,Math.PI/2,Math.PI/2),std({color:0xf4f1ea,roughness:.4})); B.add(bot);
  const belt=new T.Mesh(new T.CylinderGeometry(R*1.005,R*1.005,.07,40,1,true),std({color:0x1b1b1b,roughness:.5})); B.add(belt);
  const btn=new T.Mesh(new T.CylinderGeometry(.13,.13,.06,24),std({color:0xf8f6f0,roughness:.3})); btn.rotation.x=Math.PI/2; btn.position.z=R; B.add(btn);
  const ring=new T.Mesh(new T.TorusGeometry(.14,.03,10,24),std({color:0x1b1b1b})); ring.position.z=R-.005; B.add(ring);
  B.position.set(-W/2-1.25,R,1.35); B.rotation.set(.12,.7,-.15); B.traverse(o=>o.castShadow=true); scene.add(B);
  // sticky note
  const note=new T.Mesh(new T.BoxGeometry(1.15,.012,1.15),[std({color:0xf5dc66}),std({color:0xf5dc66}),std({map:tex(noteTex())}),std({color:0xf5dc66}),std({color:0xf5dc66}),std({color:0xf5dc66})]);
  note.position.set(W/2+.75,.008,-1.4); note.rotation.y=-.3; note.receiveShadow=true; scene.add(note);
  // lights: warm desk lamp + soft fill
  scene.add(new T.HemisphereLight(0xfff1dc,0x3a2414,night?.25:.55));
  const lamp=new T.SpotLight(0xffd29a,night?2.6:1.8,40,.62,.55,1.2); lamp.position.set(-5.5,10,3.5); lamp.target=J; lamp.castShadow=!mobile;
  lamp.shadow.mapSize.set(1024,1024); lamp.shadow.bias=-.0004; lamp.shadow.radius=4; scene.add(lamp);
  if(!night){ const fill=new T.DirectionalLight(0xbfd4ff,.35); fill.position.set(6,6,-4); scene.add(fill); }
  // camera framing
  const aspect=()=>innerWidth/innerHeight; const k=()=>Math.max(1,1.05/aspect());
  const fitFog=()=>{ scene.fog.near=14*k(); scene.fog.far=30*k(); }; fitFog();
  const base=new T.Vector3(.4,9.6,7.4), look=new T.Vector3(0,.2,.25);
  const camState={x:0,y:0,z:0,lx:look.x,ly:look.y,lz:look.z,k:1,idle:1};
  function placeCam(t){ const kk=k()*camState.k; cam.position.set(base.x*kk+camState.x+Math.sin(t*.23)*.28*camState.idle, base.y*kk+camState.y+Math.sin(t*.31)*.12*camState.idle, base.z*kk+camState.z);
    cam.lookAt(camState.lx,camState.ly,camState.lz); }
  // hover + click
  const ray=new T.Raycaster(), mouse=new T.Vector2(); let hover=0, hoverT=0;
  function onMove(e){ const p=e.touches?e.touches[0]:e; mouse.set(p.clientX/innerWidth*2-1,-(p.clientY/innerHeight)*2+1); ray.setFromCamera(mouse,cam); hover=ray.intersectObjects([cover,block],false).length?1:0; cv.style.cursor=hover?'pointer':'default'; }
  cv.addEventListener('pointermove',onMove);
  let lift=0; const state={opening:false};
  function open(){
    if(state.opening) return; state.opening=true; opened=true; window.track&&track('intro_open',{mode:'3d'}); hint.textContent='';
    const tl=gs.timeline({onComplete:()=>{ landing(); close(); }});
    tl.to(band.position,{x:W/2+3.2,y:.6,duration:.55,ease:'power2.in'},0).to(band.rotation,{z:-.5,duration:.55},0)
      .to(camState,{idle:0,duration:.6},0)
      .to(pivot.rotation,{z:Math.PI*.985,duration:1.45,ease:'power2.inOut'},.35)
      .to(J.rotation,{y:0,duration:1.2,ease:'power2.inOut'},.35)
      .to(camState,mobile?{k:.5,x:-.4,z:-6.9*.62,lx:0,ly:0,lz:0,duration:1.6,ease:'power2.inOut'}:{k:.62,x:-W*.55,z:-6.9*.62,lx:-W/2,ly:0,lz:0,duration:1.6,ease:'power2.inOut'},.45)
      .to(B.position,{x:-W/2-3.8,duration:1.4,ease:'power2.inOut'},.5).to(B.rotation,{y:3.2,duration:1.4,ease:'power2.inOut'},.5);
  }
  cv.onclick=open;
  let raf=0, t0=performance.now();
  function frame(now){ const t=(now-t0)/1000;
    if(!state.opening){ hoverT+= (hover-hoverT)*.08; lift=.02+.02*(Math.sin(t*1.6)+1)/2+hoverT*.11; pivot.rotation.z=lift; J.position.y=0; B.rotation.y=.7+Math.sin(t*.8)*.06; }
    placeCam(t); renderer.render(scene,cam); raf=requestAnimationFrame(frame); }
  raf=requestAnimationFrame(frame);
  function onResize(){ fitFog(); renderer.setSize(innerWidth,innerHeight,false); cam.aspect=aspect(); cam.updateProjectionMatrix(); }
  addEventListener('resize',onResize);
  return { open, dispose(){ cancelAnimationFrame(raf); removeEventListener('resize',onResize); cv.removeEventListener('pointermove',onMove); cv.onclick=null;
    scene.traverse(o=>{ if(o.geometry) o.geometry.dispose(); [].concat(o.material||[]).forEach(m=>{ if(m.map) m.map.dispose(); m.dispose(); }); });
    renderer.dispose(); } };
}
function dispose(){ if(three){ three.dispose(); three=null; } }

/* boot: wait for the journal fonts so the canvas textures use them */
if(S.intro!==false){
  el.hidden=false;
  const ready=document.fonts&&document.fonts.load ? Promise.all(['112px "Permanent Marker"','700 64px Caveat','22px "Press Start 2P"'].map(f=>document.fonts.load(f))).catch(()=>{}) : Promise.resolve();
  ready.then(()=>play());
}
})();
