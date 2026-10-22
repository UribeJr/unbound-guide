/* Pokémon Unbound Explorer's Guide: book engine (complete edition).
   950 pages; only the leaves near the open spread exist in the DOM. */
(function(){
const KEY='unbound-guide-v1';
const S=Object.assign({caught:{},items:{},trainers:{},badges:{},diff:{},page:0,loc:'route-1',sync:true,tab:'wild',night:false,intro:true},JSON.parse(localStorage.getItem(KEY)||'{}'));
if(!S.diff) S.diff={};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}};
const $=(q,el=document)=>el.querySelector(q), $$=(q,el=document)=>[...el.querySelectorAll(q)];
const B=window.BOOK, PD=window.PD||{}, BP=B.pages, N=BP.length, LEAVES=Math.ceil(N/2);
const CH=B.chapters.map((c,k)=>Object.assign({},c,{page:k===0?2:c.page, short:['FROZEN','CINDER','VALLEY','FALLSHORE','THUNDER','ANTISIS','SEAPORT','MAGNOLIA','LEAGUE','POSTGAME'][k]||c.name}));
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let mobile=null, spread=0, mp=0, busy=false;
const G=window.gsap||null; if(G&&window.DrawSVGPlugin) G.registerPlugin(DrawSVGPlugin);
const RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
document.body.classList.toggle('night',!!S.night);

/* ---------- journal decoration: tape, rotations, sketches, wear ---------- */
function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0)/4294967295;}
function rnd(seed){let x=Math.floor(hash(seed)*2147483646)+1;return()=>(x=x*16807%2147483647)/2147483647;}
function isLight(el){const m=getComputedStyle(el).backgroundColor.match(/\d+/g); if(!m) return false; const [r,g,b]=m.map(Number); return (0.299*r+0.587*g+0.114*b)/255>0.62;}
function decorate(el,i){
  $$('.shot',el).forEach((f,k)=>{const r=hash(i+'s'+k);
    f.style.setProperty('--r',((r-.5)*3.2).toFixed(2)+'deg'); f.style.setProperty('--d',(1+r*2.5).toFixed(1)+'px');
    f.style.setProperty('--tr',((hash(k+'t'+i)-.5)*8).toFixed(1)+'deg'); if(r>.74) f.classList.add('tl'); else if(r<.16) f.classList.add('tr');});
  $$('.map',el).forEach((m,k)=>m.style.setProperty('--r',((hash(i+'m'+k)-.5)*1.1).toFixed(2)+'deg'));
  $$('[data-caught]',el).forEach(b=>{const card=b.closest('.wcard,.tm,tr'); if(!card) return; const k=b.dataset.caught; card.dataset.k=k;
    const im=card.querySelector('img'); if(im){ im.classList.add('sp-ink'); card.style.setProperty('--sr',((hash(k+'|'+i)-.5)*22).toFixed(1)+'deg'); }});
  if(!el.classList.contains('cover')){
    if(hash('ring'+i)<.07){ const w=document.createElement('div'); w.className='wear-ring'; const r=rnd('rp'+i);
      w.style.left=(r()*360+40)+'px'; w.style.top=(r()<.5? r()*120+60 : r()*140+480)+'px'; el.appendChild(w); }
    if(hash('corner'+i)<.22){ const w=document.createElement('div'); w.className='wear-corner'; if(i%2) {w.style.right='auto';w.style.left='0';w.style.transform='scaleX(-1)';} el.appendChild(w); }
  }
}
function fixPills(el){ $$('.ty:not(.chk2)',el).forEach(t=>{ t.classList.add('chk2'); if(isLight(t)) t.classList.add('lt'); }); }

/* hand-drawn SVG strokes (seeded wobble, with pen overshoot) */
function circlePath(cx,cy,rx,ry,seed){ const r=rnd(seed); const n=26, start=r()*Math.PI*2, turns=1.12+r()*.12; let d='';
  for(let k=0;k<=n;k++){ const t=start+turns*Math.PI*2*k/n, j=1+(r()-.5)*.09+(k/n)*.06;
    const x=cx+Math.cos(t)*rx*j, y=cy+Math.sin(t)*ry*j; d+=(k?' L':'M')+x.toFixed(1)+','+y.toFixed(1); } return d; }
function linePath(w,seed){ const r=rnd(seed); let d=`M2,${(4+r()*2).toFixed(1)}`; const n=6;
  for(let k=1;k<=n;k++){ d+=` Q${(w*(k-.5)/n).toFixed(1)},${(2+r()*5).toFixed(1)} ${(w*k/n).toFixed(1)},${(3+r()*3).toFixed(1)}`; } return d; }
function arrowPath(x1,y1,x2,y2,seed){ const r=rnd(seed); const mx=(x1+x2)/2+(r()-.5)*30, my=(y1+y2)/2-20-r()*14;
  const a=Math.atan2(y2-my,x2-mx), h=9; return `M${x1},${y1} Q${mx.toFixed(1)},${my.toFixed(1)} ${x2},${y2} M${(x2-h*Math.cos(a-.5)).toFixed(1)},${(y2-h*Math.sin(a-.5)).toFixed(1)} L${x2},${y2} L${(x2-h*Math.cos(a+.5)).toFixed(1)},${(y2-h*Math.sin(a+.5)).toFixed(1)}`; }
function svgEl(cls,x,y,w,h,d){ const s=document.createElementNS('http://www.w3.org/2000/svg','svg'); s.setAttribute('class','ann '+cls); s.setAttribute('viewBox',`0 0 ${w} ${h}`);
  s.style.cssText=`left:${x}px;top:${y}px;width:${w}px;height:${h}px`; [].concat(d).forEach(dd=>{const p=document.createElementNS('http://www.w3.org/2000/svg','path'); p.setAttribute('d',dd); s.appendChild(p);}); return s; }
function annotate(pg){
  if(!pg||pg.dataset.ann) return []; pg.dataset.ann=1; fixPills(pg); const out=[]; const i=pg.dataset.index;
  $$('.shot .n',pg).forEach((n,k)=>{ const s=svgEl('red',-19,-19,42,42,circlePath(21,21,17,16,i+'n'+k)); n.parentNode.appendChild(s); out.push(s); });
  $$('.u-sec span',pg).forEach((sp,k)=>{ const w=Math.min(sp.offsetWidth+10,480); if(w<20) return; const s=svgEl('sec',sp.offsetLeft-4,sp.offsetTop+sp.offsetHeight-3,w,10,linePath(w-4,i+'u'+k)); sp.parentNode.appendChild(s); out.push(s); });
  $$('.phead .num',pg).forEach((n,k)=>{ const s=svgEl('sec',n.offsetLeft-8,n.offsetTop-6,68,64,circlePath(34,32,29,26,i+'c'+k)); n.parentNode.appendChild(s); out.push(s); });
  $$('.quick h3.bar',pg).forEach((h,k)=>{ const s=svgEl('red',h.offsetLeft+h.offsetWidth+8,h.offsetTop-6,40,34,'M20,3 L24,14 L36,14 L26,21 L30,32 L20,25 L10,32 L14,21 L4,14 L16,14 Z'); h.parentNode.appendChild(s); out.push(s); });
  $$('.map',pg).forEach((m,k)=>{
    const pins=$$('.pin',m); if(pins.length){ pins.forEach((p,j)=>{ const x=parseFloat(p.style.left)/100*m.offsetWidth, y=parseFloat(p.style.top)/100*m.offsetHeight;
        const s=svgEl('red',x-20,y-19,40,38,circlePath(20,19,16,15,i+'p'+j)); m.appendChild(s); out.push(s); }); return; }
    const um=m.closest('.u-map'), lg=um&&um.querySelector('.u-leg'); if(!lg) return;
    const tall=um.classList.contains('tall');
    if(tall){ const x1=m.offsetLeft+m.offsetWidth-10, y1=m.offsetTop+28; const s=svgEl('pencil',x1,y1-24,46,36,arrowPath(2,30,40,8,i+'a'+k)); um.appendChild(s); out.push(s); }
    else { const x1=m.offsetLeft+m.offsetWidth+6, y1=m.offsetTop+m.offsetHeight-40; if(x1+40<um.offsetWidth){ const s=svgEl('pencil',x1,y1,44,52,arrowPath(4,2,18,48,i+'a'+k)); um.appendChild(s); out.push(s);
        const t=document.createElement('span'); t.className='annote'; t.textContent='map key'; t.style.left=(x1+6)+'px'; t.style.top=(y1-20)+'px'; t.style.transform='rotate(-6deg)'; um.appendChild(t);} }
  });
  return out;
}
function drawIn(svgs){ if(!svgs.length) return; const paths=svgs.flatMap(s=>[...s.querySelectorAll('path')]);
  if(!G||RM||!window.DrawSVGPlugin){ return; }
  G.fromTo(paths,{drawSVG:'0%'},{drawSVG:'100%',duration:.55,ease:'power1.inOut',stagger:.06,delay:.25}); }
function annotateVisible(){ const idx= mobile? [mp] : [2*spread-1,2*spread];
  idx.forEach(i=>{ const pg=document.querySelector(mobile?`.mpage[data-i="${i}"] .page`:`.leaf .page[data-index="${i}"]`); if(pg) drawIn(annotate(pg)); }); }


/* ---------- locations (Part 1 hand-made + generated) ---------- */
const P1=(window.LOCS||[]).map(l=>Object.assign({},l,{p1:true,part:1}));
const GEN=B.locs.map(l=>Object.assign({},l,{gen:true}));
const ALL=[...P1,...GEN], BYID={}; ALL.forEach(l=>BYID[l.id]=l);
const nonEmpty=l=>l.wild.length+l.items.length+l.trainers.length>0;
const LIST=ALL.filter(l=>l.p1||nonEmpty(l));
const chOfPart=n=>B.chapters.findIndex(c=>c.parts.includes(n));
function syncLoc(id){
  let l=BYID[id]; if(!l) return null;
  if(l.gen && !nonEmpty(l)){ // fall back to the nearest earlier section of the same part that has data
    const i=GEN.indexOf(l); for(let j=i-1;j>=0&&GEN[j].part===l.part;j--) if(nonEmpty(GEN[j])) return GEN[j].id;
    for(let j=i+1;j<GEN.length&&GEN[j].part===l.part;j++) if(nonEmpty(GEN[j])) return GEN[j].id;
  }
  return id;
}

/* ---------- page rendering ---------- */
const secOfHand=i=>SECTIONS.find(s=>s.id===PAGES[i].sec);
function endPage(i){
  return `<div class="pin-in gen endpg"><div class="phead"><div class="kicker">The end of the walkthrough</div><h2>Thanks for Playing!</h2></div>
  <p>That's every one of the 40 walkthrough parts on unboundwiki.com, from the Shadow Base escape to the Ruins of Void and saving Mom, plus all eight Borrius gym spreads.</p>
  <div class="box"><b>Your file:</b><div id="wrapStats" style="font-family:var(--px);font-size:8px;line-height:2;margin-top:6px"></div></div>
  <h3 class="bar">Credits</h3>
  <p class="credit">Walkthrough text, maps, screenshots, sprites and gym data © <a href="https://unboundwiki.com/walkthrough/" target="_blank" rel="noopener">unboundwiki.com</a>, credited and linked back to the wiki. Pokémon Unbound is a fan game by Skeli. Pokémon © Nintendo / Game Freak / Creatures. This is an unofficial fan guide.</p>
  <p class="credit">Professor avatar: Professor Oak trainer front pic from Pokémon FireRed/LeafGreen, via the <a href="https://github.com/pret/pokefirered/blob/master/graphics/trainers/front_pics/professor_oak_front_pic.png" target="_blank" rel="noopener">pret/pokefirered</a> decompilation (© Nintendo / Game Freak / Creatures).</p>
  <p class="credit">Data rules: only what the wiki prints is shown. Anything it leaves out is marked <span class="tbd">TBD</span>.</p>
  <p class="disc">Fan project, not affiliated with Nintendo, Game Freak, or Skeli Games; data and screenshots from <a href="https://unboundwiki.com/walkthrough/" target="_blank" rel="noopener">unboundwiki.com</a>.</p>
  <p><a class="report" href="https://github.com/UribeJr/unbound-guide/issues/new" target="_blank" rel="noopener">✎ Report an error / wrong data</a></p>
  ${R.folio(i,'THE END')}</div>`;
}
function pageInfo(i){
  const d=BP[i]; if(!d) return {html:'',color:'#1b2a4a',cls:'blank'};
  const ch=B.chapters[d.c]||B.chapters[0];
  switch(d.t){
    case 'h': { const p=PAGES[d.i]; return {html:p.html(),color:secOfHand(d.i).color,cls:p.cover?'cover':'',loc:secOfHand(d.i).loc}; }
    case 'toc': return {html:R.contents(Object.assign({},B,{chapters:CH}),i),color:'#e8a317',cls:'toc-page'};
    case 'f': { const part=PD[d.p]; if(!part) return {html:`<div class="pin-in"><p>Part ${d.p} data missing.</p></div>`,color:ch.color};
                return {html:R.flowPage(d,part,ch,i),color:ch.color,loc:d.loc}; }
    case 'note': return {html:R.notePage(PD[d.p],ch,i),color:ch.color};
    case 'gl': { const g=B.gyms[d.g]; return {html:R.gymLeft(g,ch,i),color:ch.color,cls:'gympg'}; }
    case 'gr': { const g=B.gyms[d.g]; return {html:R.gymRight(g,ch,i,S.diff[g.no]||'Vanilla'),color:ch.color,cls:'gympg'}; }
    case 'end': return {html:endPage(i),color:ch.color};
  }
  return {html:'',color:'#1b2a4a'};
}
function pageEl(i){
  const info=pageInfo(i), d=document.createElement('div');
  d.className='page '+(info.cls||''); d.style.setProperty('--sec',info.color); d.dataset.index=i;
  d.innerHTML=info.html; decorate(d,i); return d;
}
function pageLoc(i){ const d=BP[i]; if(!d) return null; if(d.t==='h') return secOfHand(d.i).loc; if(d.t==='f') return d.loc; if(d.t==='note') return null; return null; }
function chapterOf(i){ const d=BP[Math.max(0,Math.min(N-1,i))]; return d? d.c : 0; }

/* ---------- desktop book (virtualized) ---------- */
const WIN_BACK=3, WIN_FWD=2;
function zFor(l,flipped){return flipped? l+1 : 2*LEAVES-l;}
function makeLeaf(l){
  const leaf=document.createElement('div'); leaf.className='leaf'; leaf.dataset.leaf=l;
  [['front',2*l],['back',2*l+1]].forEach(([side,i])=>{
    const f=document.createElement('div'); f.className='face '+side;
    if(i<N) f.appendChild(pageEl(i)); else f.innerHTML='<div class="page" style="background:#1b2a4a"></div>';
    f.insertAdjacentHTML('beforeend',`<div class="shade"></div><button class="corner" data-dir="${side==='front'?1:-1}" aria-label="${side==='front'?'Next page':'Previous page'}"></button>`);
    leaf.appendChild(f);
  });
  return leaf;
}
function setLeaf(lf,fl){ lf.classList.toggle('flipped',fl); if(G) G.set(lf,{rotationY:fl?-180:0,transformOrigin:'0% 50%',force3D:true}); else lf.style.transform=fl?'rotateY(-180deg)':''; }
function ensureLeaves(lo,hi,flippedBelow){
  const book=$('#book');
  for(let l=Math.max(0,lo);l<=Math.min(LEAVES-1,hi);l++){
    if(book.querySelector(`.leaf[data-leaf="${l}"]`)) continue;
    const lf=makeLeaf(l), fl=l<flippedBelow;
    setLeaf(lf,fl); lf.style.zIndex=zFor(l,fl); book.appendChild(lf);
  }
  syncMarks();
}
function prune(){
  $$('#book .leaf').forEach(lf=>{const l=+lf.dataset.leaf; if(l<spread-WIN_BACK||l>spread+WIN_FWD) lf.remove();});
}
function buildDesktop(){
  const book=$('#book');
  book.innerHTML='<div class="endpaper left"><div class="found">If found, please return to<br>the nearest Pokémon Center.<br><br>Trainer: ______________</div><div class="peek"><i>Gym 1 · Mirskle</i><i>bring Fire / Flying!</i></div><div class="pocket"><em>stickers &amp; stamps</em></div></div><div class="endpaper right"><span>THE END<br>THANKS FOR<br>READING</span></div><div class="edgeL"></div><div class="edgeR"></div><div class="spiral"></div><div class="ctabs" id="ctabs"></div>';
  $('#ctabs').innerHTML=CH.map((c,k)=>`<button class="ctab r" data-ch="${k}" style="--tc:${c.color};top:${34+k*72}px" title="${esc(c.name)}"><span>${esc(c.short)}</span></button>`).join('');
  ensureLeaves(spread-WIN_BACK,spread+WIN_FWD,spread);
  afterNav(); requestAnimationFrame(annotateVisible);
}
function setSpread(s,animate=true){
  s=Math.max(0,Math.min(LEAVES,s));
  if(s===spread){ afterNav(); return; }
  if(!animate){ spread=s; $$('#book .leaf').forEach(l=>l.remove()); ensureLeaves(s-WIN_BACK,s+WIN_FWD,s); afterNav(); annotateVisible(); return; }
  let from=spread;
  const dir=s>from?1:-1;
  // long jumps: teleport to 2 leaves short of the target, then riffle the last two
  if(Math.abs(s-from)>2){ from=s-2*dir; spread=from; $$('#book .leaf').forEach(l=>l.remove()); ensureLeaves(from-WIN_BACK,from+WIN_FWD,from); }
  ensureLeaves(Math.min(from,s)-WIN_BACK,Math.max(from,s)+WIN_FWD,from);
  const order=[]; if(dir>0) for(let l=from;l<s;l++) order.push(l); else for(let l=from-1;l>=s;l--) order.push(l);
  spread=s; busy=true;
  const get=l=>$(`#book .leaf[data-leaf="${l}"]`);
  const done=(lf,l,k)=>{lf.classList.remove('anim'); lf.style.zIndex=zFor(l,dir>0); if(k===order.length-1){busy=false; prune(); annotateVisible();}};
  order.forEach((l,k)=>{
    const lf=get(l); if(!lf){ if(k===order.length-1) busy=false; return; }
    lf.style.zIndex=3*LEAVES+k; lf.classList.add('anim'); lf.classList.toggle('flipped',dir>0);
    if(!G){ lf.style.transition='transform .9s'; lf.style.transform=dir>0?'rotateY(-180deg)':''; setTimeout(()=>done(lf,l,k),920); return; }
    const D=RM?0.01:0.95, pages=$$('.face > .page',lf), shades=$$('.shade',lf), b=dir>0?-1:1;
    G.timeline({delay:RM?0:k*0.14,onComplete:()=>{G.set(pages,{clearProps:'transform'}); done(lf,l,k);}})
     .to(lf,{rotationY:dir>0?-180:0,duration:D,ease:'power2.inOut'},0)
     .to(pages,{skewY:2.6*b,scaleX:.955,duration:D/2,ease:'sine.out'},0)
     .to(pages,{skewY:0,scaleX:1,duration:D/2,ease:'sine.in'},D/2)
     .fromTo(shades,{opacity:0},{opacity:1,duration:D/2,ease:'sine.out'},0)
     .to(shades,{opacity:0,duration:D/2,ease:'sine.in'},D/2);
  });
  afterNav();
}
function updateChrome(){
  if(mobile) return;
  const left=spread*2-1, right=spread*2;
  const cur=spread===0?-1:chapterOf(right<N?right:left);
  $$('#ctabs .ctab').forEach(t=>{const k=+t.dataset.ch, onLeft=spread>0&&k<=cur;
    t.classList.toggle('l',onLeft); t.classList.toggle('r',!onLeft); t.classList.toggle('cur',k===cur);});
  const f=spread/LEAVES, max=14;
  $('#book').style.setProperty('--el',Math.round(2+f*max)+'px'); $('#book').style.setProperty('--er',Math.round(2+(1-f)*max)+'px');
  $('.edgeL').style.display=spread===0?'none':''; $('.edgeR').style.display=spread>=LEAVES?'none':'';
}

/* ---------- mobile book (only current ±1 page in the DOM) ---------- */
function mEnsure(lo,hi){
  const mb=$('#mbook');
  for(let i=Math.max(0,lo);i<=Math.min(N-1,hi);i++){
    if(mb.querySelector(`.mpage[data-i="${i}"]`)) continue;
    const m=document.createElement('div'); m.className='mpage'+(i%2?' even':''); m.dataset.i=i; m.style.zIndex=N-i;
    m.classList.toggle('gone',i<mp); if(G) G.set(m,{rotationY:i<mp?-115:0,transformOrigin:'0% 50%'}); else m.style.transform=i<mp?'rotateY(-115deg)':'';
    m.appendChild(pageEl(i)); mb.appendChild(m);
  }
  syncMarks();
}
function buildMobile(){
  $('#mbook').innerHTML=''; mEnsure(mp-1,mp+1);
  $('#chips').innerHTML=CH.map((c,k)=>`<button style="--tc:${c.color}" data-ch="${k}">${k+1}. ${esc(c.name)}</button>`).join('')+
    B.gyms.map(g=>`<button style="--tc:#333" data-goto="${g.page}">★ ${esc(g.leader)}</button>`).join('');
  setMobile(mp,false);
}
function setMobile(p,animate=true){
  p=Math.max(0,Math.min(N-1,p));
  const far=Math.abs(p-mp)>1; const old=mp;
  if(far||!animate){ mp=p; $('#mbook').innerHTML=''; mEnsure(p-1,p+1); }
  else { mEnsure(Math.min(old,p)-1,Math.max(old,p)+1); mp=p; }
  $$('.mpage').forEach(m=>{
    const i=+m.dataset.i, wasGone=m.classList.contains('gone'), gone=i<p;
    m.classList.toggle('gone',gone);
    if(animate && !far && wasGone!==gone){ m.classList.add('flipping');
      if(G){ const pg=m.querySelector('.page'), D=RM?0.01:0.72;
        G.timeline({onComplete:()=>{m.classList.remove('flipping'); G.set(pg,{clearProps:'transform'});}})
         .to(m,{rotationY:gone?-115:0,duration:D,ease:'power2.inOut'},0)
         .to(pg,{skewY:gone?-3:3,scaleX:.95,duration:D/2,ease:'sine.out'},0).to(pg,{skewY:0,scaleX:1,duration:D/2,ease:'sine.in'},D/2);
      } else { m.style.transition='transform .7s'; m.style.transform=gone?'rotateY(-115deg)':''; setTimeout(()=>m.classList.remove('flipping'),720); }
    } else if(G) G.set(m,{rotationY:gone?-115:0}); else m.style.transform=gone?'rotateY(-115deg)':'';
    m.classList.toggle('hidden',i<p-1||i>p+1);
  });
  clearTimeout(setMobile.t); setMobile.t=setTimeout(()=>$$('.mpage').forEach(m=>{const i=+m.dataset.i; if(i<mp-1||i>mp+1) m.remove();}),760);
  const cur=$(`.mpage[data-i="${p}"] .page`); if(cur) cur.scrollTop=0;
  afterNav(); requestAnimationFrame(annotateVisible);
}

/* ---------- shared nav ---------- */
function curPage(){ return mobile? mp : (spread===0?0:Math.min(N-1,2*spread-1)); }
function go(dir){ if(mobile) setMobile(mp+dir); else if(!busy) setSpread(spread+dir); }
function gotoPage(i){ i=Math.max(0,Math.min(N-1,i)); if(mobile) setMobile(i); else if(!busy) setSpread(i===0?0:Math.floor((i+1)/2)); }
function afterNav(){
  const p=curPage(); S.page=p;
  const ps = mobile? `PAGE ${p}` : (spread===0?'COVER':(2*spread<N?`PAGES ${2*spread-1}–${2*spread}`:`PAGE ${2*spread-1}`));
  $('#pgind').textContent=ps+' / '+(N-1);
  $('#prev').disabled = mobile? mp===0 : spread===0;
  $('#next').disabled = mobile? mp===N-1 : spread===LEAVES;
  const vis = mobile? [p] : [2*spread, 2*spread-1].filter(i=>i>=0&&i<N);
  if(S.sync){ for(const i of vis){ const l=pageLoc(i); if(l&&BYID[l]){ S.loc=syncLoc(l); break; } } }
  renderGear();
  const ch=chapterOf(p);
  $$('#chips button[data-ch]').forEach(b=>b.classList.toggle('on',+b.dataset.ch===ch));
  const on=$('#chips button.on'); if(on&&mobile) on.scrollIntoView({inline:'center',block:'nearest'});
  $$('#badgestrip .btab.ch').forEach(b=>b.querySelector('small').textContent=CH[ch].short);
  updateChrome();
  save();
}

/* ---------- POKéGEAR ---------- */
function locSelectHTML(){
  let h='', lastCh=-2;
  LIST.forEach(l=>{ const c=l.p1?0:chOfPart(l.part);
    if(c!==lastCh){ if(lastCh!==-2) h+='</optgroup>'; h+=`<optgroup label="Ch.${c+1} ${esc(B.chapters[c].name)}">`; lastCh=c; }
    h+=`<option value="${l.id}">P${l.part} · ${esc(l.name)}</option>`; });
  return h+'</optgroup>';
}
function renderGear(){
  let loc=BYID[S.loc]; if(!loc){ loc=LIST[0]; S.loc=loc.id; }
  const sub = loc.p1 ? loc.sub : `Part ${loc.part} · ${B.chapters[chOfPart(loc.part)].name}`;
  $('#locName').innerHTML=`${esc(loc.name.toUpperCase())}<small>${esc(sub)}</small>`;
  const sel=$('#locSel'); if(sel){ if(!sel.options.length) sel.innerHTML=locSelectHTML(); sel.value=LIST.includes(loc)?loc.id:''; }
  $('#syncChk').checked=S.sync;
  $$('.gtabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===S.tab));
  const body=$('#gbody'); let h='';
  const prog=(a,b,label)=>`<div class="prog"><span>${label} ${a}/${b}</span><div class="pb"><i style="width:${b?a/b*100:0}%"></i></div></div>`;
  if(S.tab==='wild'){
    if(loc.p1){
      const list=loc.wild;
      h+=prog(list.filter(w=>S.caught[w.mon]).length,list.length,'CAUGHT');
      h+= list.length? list.map(w=>{const m=MON[w.mon],c=!!S.caught[w.mon];return `<div class="grow2 ${c?'done':''}"><img class="sp" src="${sprite(w.mon)}" alt=""><div class="gi"><b>${m.dex?'#'+String(m.dex).padStart(3,'0')+' ':''}${m.name.toUpperCase()}</b>${(m.types||[]).join(' / ')||'Type: see wiki'} · ${w.method}<small>${w.time} · Rate ${w.rate} · Lv. ${w.lv}${w.note?' · '+w.note:''}</small>${m.abilities?`<small>Abilities: ${m.abilities.join(', ')}</small>`:''}</div><button class="chk" data-caught="${w.mon}" aria-label="caught">${c?'✓':''}</button></div>`}).join('')
        : `<div class="empty">NO WILD POKéMON<br>RECORDED HERE</div>`;
    } else {
      const seen={}, list=loc.wild.filter(w=>{const k=w.key+'|'+w.label; if(seen[k]) return false; return seen[k]=true;});
      const keys=[...new Set(list.map(w=>w.key))];
      h+=prog(keys.filter(k=>S.caught[k]).length,keys.length,'CAUGHT');
      h+= list.length? list.map(w=>{const c=!!S.caught[w.key];return `<div class="grow2 ${c?'done':''}">${w.img?`<img class="sp" src="${w.img}" alt="" loading="lazy">`:''}<div class="gi"><b>${esc(w.name.toUpperCase())}</b>${esc(w.label||'Wild')}${w.x?' · '+esc(w.x):''}<small>Rate <span class="tbd">TBD</span> · Lv. ${w.lv?esc(w.lv):'<span class="tbd">TBD</span>'}</small></div><button class="chk" data-caught="${w.key}" aria-label="caught">${c?'✓':''}</button></div>`}).join('')
        : `<div class="empty">NO WILD POKéMON<br>LISTED FOR THIS SECTION</div>`;
    }
  } else if(S.tab==='items'){
    h+=prog(loc.items.filter(i=>S.items[i.id]).length,loc.items.length,'FOUND');
    h+=loc.items.length? loc.items.map(it=>{const c=!!S.items[it.id];return `<div class="grow2 ${c?'done':''}"><div class="gi"><b>${(it.name||'').toUpperCase()}${it.hidden?' (HIDDEN)':''}</b>${it.req?`Needs: ${it.req} · `:''}${it.gift?'Gift · ':''}${it.where||''}</div><button class="chk" data-item="${it.id}">${c?'✓':''}</button></div>`}).join('')
      : `<div class="empty">NO ITEMS LISTED<br>FOR THIS SECTION</div>`;
  } else if(S.tab==='trainers'){
    h+=prog(loc.trainers.filter(t=>S.trainers[t.id]).length,loc.trainers.length,'DEFEATED');
    h+= loc.trainers.length? loc.trainers.map(t=>{const c=!!S.trainers[t.id];
        const team= loc.p1? t.team.map(m=>MON[m.mon].name+' Lv.'+m.lv).join(t.team[0].alt?' / ':', ') : esc(t.team);
        const small= loc.p1? `<small>Prize: ${t.reward} · ${t.note}</small>` : `<small>Prize: <span class="tbd">TBD</span></small>`;
        return `<div class="grow2 ${c?'done':''}"><div class="gi"><b>${esc(t.name.toUpperCase())}</b>${team}${small}</div><button class="chk" data-trainer="${t.id}">${c?'✓':''}</button></div>`}).join('')
      : `<div class="empty">NO TRAINERS LISTED<br>FOR THIS SECTION</div>`;
  } else if(S.tab==='prof'){
    h+=window.Professor?Professor.html():'';
  } else if(S.tab==='settings'){
    const tg=(set,label,sub)=>`<div class="setrow"><div><span class="pbt-l">${label}</span><small>${sub}</small></div><label class="pbt"><input type="checkbox" data-set="${set}" ${S[set]?'checked':''} aria-label="${label}"><span class="pbt-track" aria-hidden="true"><span class="pbt-knob"></span></span></label></div>`;
    h+=tg('night','NIGHT MODE','Desk-lamp lighting for late-night grinding.')+tg('sync','FOLLOW BOOK PAGE','The PokéGear jumps to the section you are reading.')+tg('intro','DESK INTRO','Show the 3D journal on the desk when the guide opens.')+
      `<div class="setrow"><div><span class="pbt-l">REPLAY INTRO</span><small>Watch the journal open again.</small></div><button class="chk" id="replayIntro" style="width:auto;padding:0 10px;font-size:8px">PLAY</button></div>`+
      `<div class="setrow"><div><span class="pbt-l">FOUND A MISTAKE?</span><small>Wrong data, missing item or typo? Tell us on GitHub.</small></div><a class="chk gearlink" href="https://github.com/UribeJr/unbound-guide/issues/new" target="_blank" rel="noopener">REPORT</a></div>`+
      `<p class="gdisc">Fan project, not affiliated with Nintendo, Game Freak, or Skeli Games; data and screenshots from unboundwiki.com.</p>`;
  } else {
    const n=BADGES.filter(b=>S.badges[b.id]).length;
    h+=prog(n,8,'BADGES');
    h+=`<div class="badgegrid">${BADGES.map((b,i)=>`<button class="bslot ${S.badges[b.id]?'on':''}" style="--bc:${b.color}" data-badge="${b.id}"><div class="bi">${badgeSVG(b.id,30,S.badges[b.id]?'color':'ghost')}</div><b>${b.name.toUpperCase()}</b>${b.leader}<br><span style="opacity:.75">${b.type}</span></button>`).join('')}</div>
      <p style="font-size:11px;margin:10px 2px 0;line-height:1.3">Tap a badge to mark it earned. Use the badge tabs under the book to open each leader's spread.</p>`;
  }
  body.innerHTML=h;
  if(S.tab==='prof'&&window.Professor) Professor.mount();
  syncMarks();
}
let STAT=null;
function syncMarks(){
  $$('[data-caught]').forEach(b=>b.classList.toggle('on',!!S.caught[b.dataset.caught]));
  $$('[data-k]').forEach(c=>c.classList.toggle('caught',!!S.caught[c.dataset.k]));
  $$('.icard[data-item],.ipin[data-item]').forEach(b=>{const on=!!S.items[b.dataset.item]; b.classList.toggle('on',on);
    const mk=b.querySelector('.chkmk'); if(on&&!mk&&b.classList.contains('icard')){ const s=svgEl('red chkmk',0,0,44,36,'M5,19 C9,23 12,27 15,31 C20,20 29,9 40,3'); s.removeAttribute('style'); s.setAttribute('class','ann red chkmk'); b.appendChild(s);} else if(!on&&mk) mk.remove(); });
  $$('.tdone').forEach(b=>{const on=!!S.trainers[b.dataset.trainer];b.classList.toggle('on',on);b.textContent=on?'BEATEN!':'WIN?';});
  $$('.btab[data-badge]').forEach(b=>b.classList.toggle('earned',!!S.badges[b.dataset.badge]));
  $$('.bcase').forEach(c=>{const on=!!S.badges[c.dataset.bcase]; c.classList.toggle('earned',on); const bt=c.querySelector('.stampbtn'); if(bt) bt.textContent=on?'Earned ✓ (undo)':'Stamp it in!';});
  $$('[data-mini]').forEach(m=>m.classList.toggle('on',!!S.badges[m.dataset.mini]));
  const ws=$$('#wrapStats'); if(!ws.length) return;
  if(!STAT){ const mons=new Set(); P1.forEach(l=>l.wild.forEach(w=>mons.add(w.mon))); GEN.forEach(l=>l.wild.forEach(w=>mons.add(w.key)));
    STAT={mons:[...mons],items:ALL.flatMap(l=>l.items.map(i=>i.id)),trs:ALL.flatMap(l=>l.trainers.map(t=>t.id))}; }
  ws.forEach(el=>el.innerHTML=`POKéMON CAUGHT ${STAT.mons.filter(m=>S.caught[m]).length}/${STAT.mons.length}<br>ITEMS FOUND ${STAT.items.filter(i=>S.items[i]).length}/${STAT.items.length}<br>TRAINERS BEATEN ${STAT.trs.filter(t=>S.trainers[t]).length}/${STAT.trs.length}<br>BADGES ${BADGES.filter(b=>S.badges[b.id]).length}/8`);
}
function openGear(open){ const g=$('#gear'); const was=g.classList.contains('open'); g.classList.toggle('open',open??!was); if(!was&&g.classList.contains('open')&&window.track) track('pokegear_open',{tab:S.tab}); $('#gearBtn').setAttribute('aria-expanded',g.classList.contains('open')); }
function rerenderPage(i){ $$(`.page[data-index="${i}"]`).forEach(el=>{el.innerHTML=pageInfo(i).html;}); syncMarks(); }

/* ---------- stickers & stamps ---------- */
const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.bottom>0&&r.top<innerHeight;};
function popSticker(k,on){
  if(!G||RM) return;
  $$('[data-k]').filter(c=>c.dataset.k===k).forEach(card=>{ const im=card.querySelector('img.sp-ink'); if(!im||!vis(im)) return;
    const sr=parseFloat(card.style.getPropertyValue('--sr'))||-6;
    if(on){ G.timeline({onComplete:()=>G.set(im,{clearProps:'transform,opacity'})})
        .fromTo(im,{scale:2.6,y:-46,rotation:sr-34,opacity:0},{scale:.96,y:0,rotation:sr,opacity:1,duration:.24,ease:'power3.in'})
        .to(im,{scaleX:1.28,scaleY:.9,duration:.06,ease:'none'})
        .to(im,{scale:1.1,duration:.55,ease:'elastic.out(1.1,.32)'});
      G.fromTo(card,{x:-2.5,rotation:-1},{x:0,rotation:0,duration:.45,ease:'elastic.out(1,.3)',delay:.24,clearProps:'transform'});
      for(let q=0;q<7;q++){ const sp=document.createElement('i'); sp.className='spark'; card.appendChild(sp); const a=q/7*Math.PI*2;
        G.fromTo(sp,{x:0,y:0,scale:1,opacity:1},{x:Math.cos(a)*34,y:Math.sin(a)*30,scale:.2,opacity:0,duration:.55,delay:.26,ease:'power2.out',onComplete:()=>sp.remove()}); }
    } else G.fromTo(im,{y:-12,rotation:sr+20},{y:0,rotation:0,duration:.35,ease:'power2.out',clearProps:'transform'});
  });
}
function stampBadge(id,on){
  $$(`.bcase[data-bcase="${id}"]`).forEach(c=>{ if(!G||RM||!vis(c)) return; const st=c.querySelector('.stamp'), bf=c.querySelector('.bfull'), pg=c.closest('.page');
    if(on){ G.timeline({onComplete:()=>G.set([st,bf],{clearProps:'all'})})
        .fromTo(st,{scale:3,rotation:-34,opacity:0},{scale:.9,rotation:-12,opacity:.95,duration:.28,ease:'power4.in'})
        .fromTo(pg,{y:0},{y:3,duration:.05,yoyo:true,repeat:1,ease:'none',clearProps:'transform'},'>-0.02')
        .to(st,{scale:1,duration:.35,ease:'back.out(3)'},'<')
        .fromTo(bf,{scale:.2,opacity:0},{scale:1,opacity:1,duration:.5,ease:'back.out(2.6)'},'<');
    } else G.fromTo(st,{opacity:.9},{opacity:0,scale:1.15,duration:.35,clearProps:'all'});
  });
}

/* ---------- layout ---------- */
function layout(){
  const m = window.innerWidth<820 || (window.innerWidth<1000 && window.innerHeight>window.innerWidth);
  if(m!==mobile){
    const p=mobile===null? Math.min(N-1,S.page||0) : curPage();
    mobile=m; document.body.classList.toggle('mobile',m);
    if(m){ mp=p; $('#book').innerHTML=''; buildMobile(); }
    else { spread=p===0?0:Math.floor((p+1)/2); $('#mbook').innerHTML=''; buildDesktop(); }
  }
  if(!mobile){
    const st=$('#stage'), w=st.offsetWidth, h=st.offsetHeight;
    const sc=Math.min((window.innerWidth-40)/w,(window.innerHeight-54-64-20)/h,1.25);
    st.style.setProperty('--scale',sc);
  }
}

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  let t=e.target.closest('button,[data-full],.legend li');
  if(!t && e.target.matches && e.target.matches('img.sp-ink')){ const c=e.target.closest('[data-k]'); t=c&&c.querySelector('[data-caught]'); }
  if(!t) return;
  if(t.id==='prev') return go(-1);
  if(t.id==='next') return go(1);
  if(t.id==='gearBtn'||t.id==='gearClose') return openGear();
  if(t.classList.contains('corner')) return go(+t.dataset.dir);
  if(t.dataset.ch!==undefined){ window.track&&track('chapter_jump',{chapter:CH[+t.dataset.ch].name}); return gotoPage(CH[+t.dataset.ch].page); }
  if(t.dataset.goto!==undefined) return gotoPage(+t.dataset.goto);
  if(t.dataset.gym&&t.dataset.diff){ const g=B.gyms.find(x=>x.no==t.dataset.gym); S.diff[g.no]=t.dataset.diff; save(); return rerenderPage(g.page+1); }
  if(t.dataset.caught){ const k=t.dataset.caught; S.caught[k]=!S.caught[k]; save(); renderGear(); window.track&&track('caught_toggle',{pokemon:k,caught:!!S.caught[k]}); return popSticker(k,S.caught[k]); }
  if(t.dataset.item){ S.items[t.dataset.item]=!S.items[t.dataset.item]; save(); renderGear(); if(S.items[t.dataset.item]&&G&&!RM) $$(`.icard[data-item="${t.dataset.item}"] .chkmk path`).forEach(p=>G.fromTo(p,{drawSVG:'0%'},{drawSVG:'100%',duration:.35,ease:'power2.out'})); return; }
  if(t.dataset.trainer){ const k=t.dataset.trainer; S.trainers[k]=!S.trainers[k]; save(); renderGear(); if(S.trainers[k]&&G&&!RM) $$(`.tdone[data-trainer="${k}"]`).forEach(b=>G.fromTo(b,{scale:2.2,opacity:0,rotation:-25},{scale:1,opacity:1,rotation:-8,duration:.3,ease:'back.out(3)',clearProps:'transform,opacity'})); return; }
  if(t.dataset.stamp){ const id=t.dataset.stamp; S.badges[id]=!S.badges[id]; save(); renderGear(); window.track&&track('badge_stamp',{badge:id,earned:!!S.badges[id]}); return stampBadge(id,S.badges[id]); }
  if(t.id==='replayIntro'){ openGear(false); return window.__intro&&window.__intro.play(true); }
  if(t.dataset.badge && t.classList.contains('bslot')){ S.badges[t.dataset.badge]=!S.badges[t.dataset.badge]; save(); return renderGear(); }
  if(t.classList.contains('btab')){ if(t.dataset.badge){ const i=BADGES.findIndex(b=>b.id===t.dataset.badge); gotoPage(B.gyms[i].page);} else gotoPage(1); return; }
  if(t.dataset.tab){ S.tab=t.dataset.tab; save(); return renderGear(); }
  if(t.dataset.loc){ const i=Math.max(0,LIST.findIndex(l=>l.id===S.loc)); S.loc=LIST[(i+(+t.dataset.loc)+LIST.length)%LIST.length].id; S.sync=false; save(); return renderGear(); }
  if(t.classList.contains('pin')||t.classList.contains('ipin')||t.matches('.legend li')){ flash(t); if(!t.matches('.legend li')) e.stopPropagation(); return; }
  if(t.dataset.full){ const lb=$('#lightbox'); const inl=t.querySelector('img');
    $('img',lb).src = (window.LITE && inl) ? inl.getAttribute('src') : t.dataset.full; lb.classList.add('open'); window.track&&track('map_lightbox',{page:S.page}); return; }
});
function flash(t){
  const page=t.closest('.page'), k=t.dataset.pin; if(!page||!k) return;
  $$('.hot',page).forEach(x=>x.classList.remove('hot'));
  $$(`[data-pin="${k}"]`,page).forEach(x=>x.classList.add('hot'));
  clearTimeout(flash.t); flash.t=setTimeout(()=>$$('.hot',page).forEach(x=>x.classList.remove('hot')),2200);
}
document.addEventListener('mouseover',e=>{const li=e.target.closest('.legend li[data-pin]'); if(li){const page=li.closest('.page');$$(`[data-pin="${li.dataset.pin}"]`,page).forEach(x=>x.classList.add('hot'));}});
document.addEventListener('mouseout',e=>{const li=e.target.closest('.legend li[data-pin]'); if(li){const page=li.closest('.page');$$(`[data-pin="${li.dataset.pin}"]`,page).forEach(x=>x.classList.remove('hot'));}});
document.addEventListener('change',e=>{
  const inp=e.target; if(!inp.matches||!inp.matches('.pbt input')) return;
  const set=inp.dataset.set||(inp.id==='syncChk'?'sync':null);
  if(set){ S[set]=inp.checked; save(); $$(`input[data-set="${set}"]`).forEach(x=>x.checked=inp.checked); if(set==='sync'){$('#syncChk').checked=inp.checked; afterNav();} if(set==='night'){ document.body.classList.toggle('night',inp.checked); window.track&&track('night_mode',{on:inp.checked}); } }
  const tr=inp.parentNode.querySelector('.pbt-track'), kn=tr&&tr.querySelector('.pbt-knob');
  if(G&&!RM&&tr){ G.fromTo(tr,{rotation:0},{keyframes:[{rotation:-10,duration:.07},{rotation:8,duration:.1},{rotation:-4,duration:.1},{rotation:0,duration:.14}],clearProps:'transform'});
    G.fromTo(kn,{scaleX:1.35,scaleY:.75},{scale:1,duration:.6,ease:'elastic.out(1.2,.3)',delay:.12,clearProps:'transform'}); }
});
$$('input[data-set]').forEach(x=>x.checked=!!S[x.dataset.set]);
/* subtle parallax on taped items */
let pmx=0,pmy=0,praf=0;
document.addEventListener('mousemove',e=>{ if(mobile||RM) return; pmx=(e.clientX/innerWidth-.5)*2; pmy=(e.clientY/innerHeight-.5)*2;
  if(!praf) praf=requestAnimationFrame(()=>{praf=0; const b=$('#book'); if(b){b.style.setProperty('--mx',pmx.toFixed(3)); b.style.setProperty('--my',pmy.toFixed(3));}}); });
$('#locSel').addEventListener('change',e=>{ if(!e.target.value) return; S.loc=e.target.value; S.sync=false; save(); renderGear(); });
$('#lightbox').addEventListener('click',()=>$('#lightbox').classList.remove('open'));
$('#resetBtn').addEventListener('click',()=>{ if(confirm('Reset all saved progress?')){ S.caught={};S.items={};S.trainers={};S.badges={}; save(); renderGear(); }});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){ $('#lightbox').classList.remove('open'); openGear(false); return; }
  if(e.target.closest&&e.target.closest('select,input')) return;
  if(e.key==='ArrowRight') go(1); else if(e.key==='ArrowLeft') go(-1);
  else if(e.key==='Home') gotoPage(0); else if(e.key==='End') gotoPage(N-1);
  else if(e.key==='Escape'){ $('#lightbox').classList.remove('open'); openGear(false); }
  else if(e.key.toLowerCase()==='g') openGear();
});
let tx=null,ty0=null;
document.addEventListener('touchstart',e=>{ if(!e.target.closest('#mbook')) return; tx=e.touches[0].clientX; ty0=e.touches[0].clientY; },{passive:true});
document.addEventListener('touchend',e=>{ if(tx===null) return; const dx=e.changedTouches[0].clientX-tx, dy=e.changedTouches[0].clientY-ty0; tx=null; if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5) go(dx<0?1:-1); });

/* badge strip: contents tab + 8 gym badges (each opens the leader's spread) */
$('#badgestrip').innerHTML=`<button class="btab ch" title="Contents"><span class="bico"></span><span>Contents<small>Frozen Hts.</small></span></button>`+
  BADGES.map((b,i)=>`<button class="btab" style="--bc:${b.color}" data-badge="${b.id}" title="${b.name}: ${b.leader} (${b.type}). Opens the gym spread, p.${B.gyms[i].page}."><span class="bico"><span class="g">${badgeSVG(b.id,22,'dim')}</span><span class="c">${badgeSVG(b.id,22)}</span></span><span>${b.name.replace(' Badge','')}<small>${b.gym}</small></span></button>`).join('');

window.addEventListener('resize',layout);
layout();
window.__guide={go,gotoPage,setSpread,openGear,renderGear,state:S,N,book:B,save,annotateVisible};
})();
