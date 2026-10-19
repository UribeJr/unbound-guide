/* Page builders. Every fact below comes from unboundwiki.com (see js/data.js header). */
(function(){
const A = k => k.includes('/') ? 'assets/' + k : WT[k];
const L = id => LOCS.find(l => l.id === id);
const ty = t => `<span class="ty" style="background:${TYPE_COLORS[t]||'#777'}">${t}</span>`;
const tys = id => (MON[id].types||[]).map(ty).join('');
const TBD = '<span class="tbd">TBD</span>';
const shot = (k, cap, n, cls='') => `<figure class="shot ${cls}">${n?`<span class="n">${n}</span>`:''}<img src="${A(k)}" alt="${cap}" loading="lazy"><figcaption>${cap}</figcaption></figure>`;
const head = (kicker, title, num) => `<div class="phead"><div class="kicker">${kicker}</div><h2>${title}</h2>${num?`<div class="num">${num}</div>`:''}</div>`;

function trainerCard(t){
  const team = t.team.map((m,i)=>`${i&&m.alt?'<span class="tm or">OR</span>':''}<div class="tm"><img src="${sprite(m.mon)}" alt=""><div><b>${MON[m.mon].name}</b><i>Lv.${m.lv}</i></div></div>`).join('');
  return `<div class="tcard"><div class="por"><img src="${A(t.sprite)}" alt="${t.name}"></div><div class="tb">
    <div class="tn"><span>${t.name}</span><span class="rw">${t.reward==='TBD'?'Prize '+TBD:'Prize '+t.reward}</span>
    <button class="tdone" data-trainer="${t.id}" title="Mark defeated">WIN</button></div>
    <div class="tnote">${t.note}</div><div class="team">${team}</div></div></div>`;
}
function itemList(items, filter){
  return `<ul class="ilist">${items.filter(filter||(()=>true)).map(it=>`<li><span class="ib ${it.hidden?'h':it.gift?'g':''}"></span><span><b>${it.name}</b>${it.hidden?'<span class="tag h">Hidden</span>':''}${it.gift?'<span class="tag g">Gift</span>':''}${it.req?`<span class="tag r">${it.req}</span>`:''}<br>${it.where}</span></li>`).join('')}</ul>`;
}
function wildTable(loc){
  return `<table class="gt"><thead><tr><th>Pokémon</th><th>Type</th><th>Time</th><th>Rate</th><th>Lv.</th><th>✓</th></tr></thead><tbody>${
    loc.wild.map(w=>{const r=parseInt(w.rate)||0;return `<tr><td><div class="mon"><img src="${sprite(w.mon)}" alt="">${MON[w.mon].name}</div></td><td>${tys(w.mon)}</td><td>${w.time}</td>
    <td><span class="rate">${w.rate}</span><div class="ratebar"><i style="width:${r}%"></i></div></td><td>${w.lv==='TBD'?TBD:w.lv}</td><td><button class="ball" data-caught="${w.mon}" title="Caught?"></button></td></tr>`}).join('')}</tbody></table>`;
}
function map(k, full, ratio, pins, ipins, cls='', style=''){
  return `<div class="map ${cls}" data-full="${A(full)}" style="aspect-ratio:${ratio};${style}"><img src="${A(k)}" alt="map">
   ${pins.map(p=>`<button class="pin" data-pin="${p.k}" style="left:${p.x}%;top:${p.y}%" title="${p.t}"></button>`).join('')}
   ${(ipins||[]).map(p=>`<button class="ipin" data-pin="${p.k}" style="left:${p.x}%;top:${p.y}%" title="${p.t} (approx.)">${p.k}</button>`).join('')}
   <span class="zoom">CLICK TO ENLARGE</span></div>`;
}
function legend(rows){
  return `<ul class="legend">${rows.map(r=>`<li data-pin="${r.k}">${r.ic?`<img src="${A(r.ic)}" alt="">`:`<span class="lt">${r.k}</span>`}<span>${r.t}</span></li>`).join('')}</ul>`;
}
const folio = (n, label) => `<div class="folio"><span>BORRIUS EXPLORER'S GUIDE · ${label}</span><b>${n}</b></div>`;

window.SECTIONS = [
  { id:'intro', short:'INTRO', name:'Intro', color:'#e8a317', loc:'shadow-base' },
  { id:'shadow-base', short:'SHADOW', name:'Shadow Base', color:'#6a3fa0', loc:'shadow-base' },
  { id:'frozen-heights', short:'FROZEN', name:'Frozen Heights', color:'#2f7fc1', loc:'frozen-heights' },
  { id:'route-1', short:'ROUTE 1', name:'Route 1', color:'#3d9a4f', loc:'route-1' },
  { id:'bellin-town', short:'BELLIN', name:'Bellin Town', color:'#d9502e', loc:'bellin-town' },
  { id:'return', short:'RETURN', name:'Return Trip', color:'#178f8f', loc:'frozen-heights' }
];

const FH_PINS=[{k:'1',x:5.2,y:9.7,t:'Shadow Base Exit'},{k:'2',x:45,y:29.2,t:"Rival's House"},{k:'3',x:39,y:47.2,t:"Professor Log's Lab"},{k:'4',x:79,y:35.8,t:'Your House'},{k:'5',x:66.5,y:59.2,t:"Neighbor's House"},
  {k:'cut',x:56.3,y:9.7,t:'Requires HM Cut'},{k:'smash',x:5.2,y:27.1,t:'Requires HM Rock Smash'},{k:'r1',x:56.2,y:95.3,t:'Route 1'}];
const R1_PINS=[{k:'1',x:67.5,y:21.8,t:'Snow-Blocked Path'},{k:'2',x:26.4,y:89.6,t:'Icicle Cave Entrance'},{k:'fh',x:42.4,y:5.8,t:'Frozen Heights'},{k:'climb',x:93.7,y:45.4,t:'Requires HM Rock Climb'},{k:'bt',x:37.6,y:97.7,t:'Bellin Town'}];
const R1_ITEMS=[{k:'A',x:21.3,y:50.3,t:'Ice Heal'},{k:'B',x:17.3,y:74.4,t:'Oran Berry (hidden)'},{k:'C',x:93,y:39,t:'Lucky Egg (Rock Climb)'}];
const BT_PINS=[{k:'1',x:13.4,y:14.2,t:'Pokémon Center'},{k:'2',x:83.3,y:17.5,t:'Sandslash Thief House'},{k:'3',x:17.7,y:57,t:'Heal Ball House'},{k:'4',x:69.8,y:75.8,t:'Pokémon Egg Gentleman'},{k:'5',x:88.4,y:66.7,t:'Poké Mart'},{k:'r1',x:48.9,y:5.3,t:'Route 1'}];
const BT_ITEMS=[{k:'A',x:90.4,y:16.3,t:'TM97 Frost Breath (Rock Climb)'}];

window.PAGES = [
/* 0 COVER */
{ sec:'intro', cover:true, html:()=>`<div class="cv">
  <div class="label"><div class="k">UNOFFICIAL FIELD GUIDE · COMPLETE EDITION</div>
   <h1><small>Pokémon Unbound</small>Trainer's<br>Journal</h1>
   <div class="sub">The whole Borrius walkthrough: Parts 1–40, all 8 gyms &amp; the post-game</div>
   <div class="owner">Trainer:<i></i></div></div>
  <div class="stamp-cover"><span>BORRIUS</span><b>${(window.BOOK&&BOOK.pages.length)||'900+'}</b><span>PAGES OF<br>NOTES</span></div>
  <div class="art"><img src="${A('01')}" alt="Pokémon Unbound start screen"></div>
  <div class="stickers"><img src="${sprite('beldum')}" alt="" style="left:6px;top:0;transform:rotate(-12deg)"><img src="${sprite('gible')}" alt="" style="left:80px;top:46px;transform:rotate(9deg)"><img src="${sprite('larvitar')}" alt="" style="left:14px;top:96px;transform:rotate(-4deg)"></div>
  <div class="bstrip">${BADGES.map(b=>badgeSVG(b.id,30,'ghost')).join('')}</div>
  <div class="bottom">Notes, maps &amp; screenshots from <b>UNBOUNDWIKI.COM</b></div>
  <div class="disc">Fan project, not affiliated with Nintendo, Game Freak, or Skeli Games; data and screenshots from unboundwiki.com.</div>
</div>`},
/* 1 INTRO */
{ sec:'intro', html:()=>`<div class="pin-in">${head('Before you begin','Welcome to<br>Borrius!','2')}
  <p style="font-size:12.5px">Part 1 runs from your escape out of a villain's warehouse to the mouth of Icicle Cave. Use the Contents page or the colored tabs to jump anywhere.</p>
  <h3 class="bar">Quick Guide</h3>
  <ol class="steps">
   <li>Choose a first Pokémon &amp; escape the Shadow Base <button class="pg" data-goto="3">P.3</button></li>
   <li>Arrive in Frozen Heights <button class="pg" data-goto="5">P.5</button></li>
   <li>Battle your Rival <button class="pg" data-goto="6">P.6</button></li>
   <li>Explore Route 1 <button class="pg" data-goto="7">P.7</button></li>
   <li>Run an errand in Bellin Town <button class="pg" data-goto="9">P.9</button></li>
   <li>Confront the Shadow Grunts <button class="pg" data-goto="11">P.11</button></li>
  </ol>
  <div class="cols" style="margin-top:14px;align-items:start">
   <div class="box tip" style="margin-top:6px"><p><b>Turn on the Real-Time Clock.</b> Outdoor areas have a day/night catching cycle.</p>
    <p style="margin:0"><b>Day</b> 5:00am – 7:59pm<br><b>Night</b> 8:00pm – 4:59am</p></div>
   ${shot('02','Lots of customization options',1,'wide')}
  </div>
  <div class="box warn" style="margin-top:18px;font-size:12.5px">For a first playthrough the wiki recommends <b>Vanilla</b> difficulty. Exp. Share applies to your whole team by default and can be switched off.</div>
  <div class="cols" style="font-size:11.5px;gap:4px 12px;margin-top:12px;border-top:2px dashed #d9cfb5;padding-top:8px">
   <div><span class="ib" style="display:inline-block;width:14px;height:14px;border-radius:50%;border:2px solid #000;background:linear-gradient(#d8352a 0 45%,#000 45% 57%,#fff 57%);vertical-align:-2px"></span> Item &nbsp; <span class="tag h">Hidden</span> <span class="tag g">Gift</span> <span class="tag r">HM</span></div>
   <div><span class="tbd">TBD</span> = not listed on the wiki yet</div>
   <div>Click a map or legend row to locate a callout</div>
   <div>Open the <b>POKéGEAR</b> to track your progress</div>
  </div>
  ${folio(2,'INTRO')}</div>`},
/* 2 SHADOW BASE */
{ sec:'shadow-base', html:()=>{const l=L('shadow-base');return `<div class="pin-in">${head('Prologue','Shadow Base','3')}
  <p>The intro covers a bit of Borrius history before a mysterious Pokémon drags you through a portal. You wake inside the base of an evil group called the <b>Shadows</b>.</p>
  <div class="cols">${shot('03','You awake in Shadow Base',1,'wide')}${shot('07','A hallway in one part of the base',2,'wide')}</div>
  <p style="margin-top:10px">Once you can move you're in what looks like a big warehouse. Walk south and east and you'll find you're not alone.</p>
  <h3 class="bar">Items</h3>
  <div class="cols c3">${shot('04','Potion',0,'msg')}${shot('05','Repel (hidden)',0,'msg')}${shot('06','Potion',0,'msg')}</div>
  <div class="cols w" style="margin-top:14px;align-items:start">${shot('08','Meeting your Rival',3,'wide')}
   <div class="box"><p style="margin:0">A rebellious red-haired youth confronts the guard at the exit, but he has no Pokémon. He's your <b>Rival</b>, and the two of you team up to escape.</p></div></div>
  ${folio(3,'SHADOW BASE')}</div>`}},
/* 3 STARTERS */
{ sec:'shadow-base', html:()=>{const l=L('shadow-base');return `<div class="pin-in">${head('Shadow Base','Pick a<br>Partner!','4')}
  <div class="cols w" style="align-items:start">${shot('09','A crate holding three Pokémon',4,'wide')}
   <p style="margin:0">No Fire/Water/Grass trio here. Your Rival leads you to a crate with three rarer picks, and he takes the one that beats yours.</p></div>
  <h3 class="bar" style="margin-top:8px">Starter Pokémon</h3>
  <div class="starters">${[['beldum','gible'],['gible','larvitar'],['larvitar','beldum']].map(([a,b])=>`<div class="starter"><img src="${sprite(a)}" alt=""><b>${MON[a].name}</b>${tys(a)}<div style="font-family:var(--px);font-size:7.5px;margin-top:4px">Lv.10</div><div class="vs">Rival takes <b>${MON[b].name}</b></div></div>`).join('')}</div>
  <h3 class="bar" style="margin-top:10px">First Battle: Double!</h3>
  ${trainerCard(l.trainers[0])}
  <div class="box tip" style="margin-top:16px;font-size:12.5px"><p style="margin:0">You and your Rival take on the Grunt's pair together. After the battle he heals your team and bolts. Follow him south to reach your hometown.</p></div>
  ${folio(4,'SHADOW BASE')}</div>`}},
/* 4 FROZEN HEIGHTS MAP */
{ sec:'frozen-heights', html:()=>`<div class="pin-in">${head('Hometown','Frozen Heights','5')}
  ${map('18','18full','1200/1163',FH_PINS,[])}
  <div class="cols" style="margin-top:12px">
   <div><h3>Points of Interest</h3>${legend([{k:'1',ic:'19',t:'Shadow Base Exit'},{k:'2',ic:'20',t:"Rival's House"},{k:'3',ic:'21',t:"Professor Log's Lab"},{k:'4',ic:'22',t:'Your House'},{k:'5',ic:'23',t:"Neighbor's House"}])}</div>
   <div><h3>Exits</h3>${legend([{k:'smash',ic:'24',t:'Requires HM Rock Smash'},{k:'cut',ic:'25',t:'Requires HM Cut'},{k:'r1',ic:'26',t:'Route 1'}])}
    <div class="box" style="margin-top:10px;padding:6px 9px;font-size:12px"><b>Item:</b> Berry Juice, in your PC at game start</div></div>
  </div>${folio(5,'FROZEN HEIGHTS')}</div>`},
/* 5 FROZEN HEIGHTS WALK */
{ sec:'frozen-heights', html:()=>{const l=L('frozen-heights');return `<div class="pin-in">${head('Frozen Heights','Rival Battle','6')}
  <div class="cols" style="align-items:start">${shot('28','You emerge onto a frozen lake',1,'wide')}
   <p style="margin:0">The tunnel exits onto an icy lake. Slide south and climb the steps to town, where your Rival is talking to <b>Professor Log</b>. He wants to show off his new partner.</p></div>
  <div style="margin-top:12px">${trainerCard(l.trainers[0])}</div>
  <h3 class="bar" style="margin-top:14px">Errands in Town</h3>
  <div class="cols" style="align-items:start">
   <div class="stack">${shot('34','Pick up a package in Bellin Town',2,'wide')}
    <p style="font-size:12.5px;margin:0">Prof. Log sends you to the Bellin Town Poké Mart and gives you a <b>Repel</b>, <b>5 Poké Balls</b> and the <b>Western Borrius Pokédex</b> (plus a spare for your Rival).</p></div>
   <div class="stack">${shot('35','Mom has some things for you too',3,'wide')}
    <p style="font-size:12.5px;margin:0">At home, Mom gives you the <b>Mission Log</b> and <b>Costume Box</b>. There's no Bag: everything goes in your <b>Cube</b>. The neighbor in the southeast house wants an <b>Antidote</b>.</p></div>
  </div>
  <div class="box warn" style="margin-top:18px;font-size:12px;padding:6px 9px">The <b>Porygon</b> in Log's Lab is a Pokémon Storage System.</div>
  ${folio(6,'FROZEN HEIGHTS')}</div>`}},
/* 6 ROUTE 1 MAP */
{ sec:'route-1', html:()=>{const l=L('route-1');return `<div class="pin-in">${head('Snowy Mountain Pass','Route 1','7')}
  <div class="r1grid" style="display:grid;grid-template-columns:286px 1fr;gap:14px;flex:1;min-height:0">
   ${map('41','41full','474/1024',R1_PINS,R1_ITEMS,'r1map','height:618px;width:286px')}
   <div class="stack">
    <h3 style="margin-top:0">Points of Interest</h3>${legend([{k:'1',ic:'19',t:'Snow-Blocked Path'},{k:'2',ic:'20',t:'Icicle Cave Entrance'}])}
    <h3>Exits</h3>${legend([{k:'fh',ic:'42',t:'Frozen Heights'},{k:'climb',ic:'43',t:'Requires HM Rock Climb'},{k:'bt',ic:'26',t:'Bellin Town'}])}
    <h3>Items</h3>${legend(R1_ITEMS.map(p=>({k:p.k,t:p.t})))}
    <div class="box" style="font-size:12px;padding:7px 9px">Lettered pins mark the item spots described on the wiki's Route 1 page (placement approx.).</div>
    <div class="box tip" style="font-size:12px;padding:7px 9px;margin-top:20px">Also here: a <b>Zygarde Cell</b> southwest of the frozen pond, once Mission #070 in Dresco Town is underway.</div>
   </div></div>${folio(7,'ROUTE 1')}</div>`}},
/* 7 ROUTE 1 DATA */
{ sec:'route-1', html:()=>{const l=L('route-1');return `<div class="pin-in">${head('Route 1','Wild Pokémon','8')}
  <p style="font-size:12.5px">All four live in <b>Long Grass</b>, day and night. The wiki doesn't list levels yet.</p>
  ${wildTable(l)}
  <div class="cols c3" style="margin-top:14px">${shot('50','Head up the slope to the SW',1)}${shot('51','The mountain path',2)}${shot('52','Icicle Cave is blocked for now',3)}</div>
  <p style="margin-top:10px">Snow blocks the main road, so a worker sends you up the <b>mountain path</b> in the southwest. Near Bellin Town an old man blocks a cave to the west. That's <b>Icicle Cave</b>, and you'll be back.</p>
  <div class="cols" style="align-items:start">
   ${itemList(l.items.slice(0,2))}
   <div class="box warn" style="margin-top:8px"><b>No trainers!</b> Route 1 has no trainer battles, so it's a safe place to catch your first team.</div>
  </div>${folio(8,'ROUTE 1')}</div>`}},
/* 8 BELLIN MAP */
{ sec:'bellin-town', html:()=>{const l=L('bellin-town');return `<div class="pin-in">${head('Small but bustling','Bellin Town','9')}
  ${map('53','53full','1024/759',BT_PINS,BT_ITEMS)}
  <div class="cols" style="margin-top:12px;align-items:start">
   <div><h3>Points of Interest</h3>${legend([{k:'1',ic:'19',t:'Pokémon Center'},{k:'2',ic:'20',t:'Sandslash Thief House'},{k:'3',ic:'21',t:'Heal Ball House'},{k:'4',ic:'22',t:'Pokémon Egg Gentleman'},{k:'5',ic:'23',t:'Poké Mart'}])}
    <h3 style="margin-top:8px">Exits</h3>${legend([{k:'r1',ic:'42',t:'Frozen Heights (via Route 1)'},{k:'icy',ic:'bt/12-pokemon-unbound-icy-hole.webp',t:'Icy Hole (requires Rock Climb)'}])}</div>
   <div><h3>Items</h3>${itemList(l.items.slice(0,3))}</div>
  </div>${folio(9,'BELLIN TOWN')}</div>`}},
/* 9 BELLIN WALK */
{ sec:'bellin-town', html:()=>{const l=L('bellin-town');return `<div class="pin-in">${head('Bellin Town','Thieves in Town','10')}
  <div class="cols" style="align-items:start">
   <div class="stack">${shot('57','An Alolan Sandslash raids the fridge',1,'wide')}
    <div class="box" style="font-size:12px"><b style="font-family:var(--px);font-size:8px;color:var(--sec)">MISSION #067: THE FOOD THIEF</b><br>Talk to the father in the NE house, then pursue the Sandslash into Icicle Cave. Reward: <b>TM56 Hone Claws</b>.</div></div>
   <div class="stack">${shot('60','This old man has a gift for you',2,'wide')}
    <div class="box" style="font-size:12px;padding:6px 8px"><b style="font-family:var(--px);font-size:8px;color:var(--sec)">GIFT EGG · ONE OF</b>
     <div style="display:flex;justify-content:space-between;margin-top:4px">${l.wild.map(w=>`<div style="text-align:center;font-family:var(--cond);font-weight:800;font-size:12px"><img src="${sprite(w.mon)}" style="width:42px;height:42px;margin:0 auto;image-rendering:pixelated" alt="">${MON[w.mon].name}<br><span style="font-family:var(--px);font-size:7px">Lv.1</span></div>`).join('')}</div></div></div>
  </div>
  <h3 class="bar" style="margin-top:10px">The Poké Mart</h3>
  <div class="cols c3">${shot('63','The Poké Mart (SE corner)',3,'wide')}${shot('64','Uh oh, another thief',4,'wide')}${shot('65','He works for the Shadows',5,'wide')}</div>
  <p style="margin-top:8px;font-size:12.5px">The thief was the Grunt from the Shadow Base. The package is now with <b>Marlon</b>, heading north of Frozen Heights.</p>
  <h3 style="margin-top:2px">Come back later (Rock Climb)</h3>
  ${trainerCard(l.trainers[0])}
  ${folio(10,'BELLIN TOWN')}</div>`}},
/* 10 RETURN */
{ sec:'return', html:()=>{const l=L('frozen-heights');return `<div class="pin-in">${head('Return to Frozen Heights','Articuno<br>Captured!','11')}
  <div class="cols">${shot('66','Marlon cuts through the tree',1)}${shot('67','Articuno is captured',2)}</div>
  <p style="margin-top:10px">On the north side of town, Marlon breaks through the Cut tree. The Shadows lure out <b>Articuno</b> and capture it, then leave a Grunt behind to deal with you. She has the package.</p>
  ${trainerCard(l.trainers[1])}
  <div class="cols c3" style="margin-top:14px">${shot('70','Package acquired, finally',3)}${shot('71','Another errand: Dresco Town',4)}${shot('72','The neighbor gives you a Gem',5)}</div>
  <p style="margin-top:10px;font-size:12.5px">The Master Balls are missing from the package. Log sends you through <b>Icicle Cave</b> to an old friend in <b>Dresco Town</b>. Give your neighbor the Antidote first: his Gem's type depends on your starter.</p>
  ${folio(11,'RETURN TRIP')}</div>`}},
/* 11 WRAP */
{ sec:'return', html:()=>`<div class="pin-in">${head('Part 1 complete','Mission Log','12')}
  <div class="box" style="padding:0;box-shadow:4px 4px 0 var(--ink)">
   <div class="mission"><span class="mn">#001</span><div><b>A Hero's Journey</b><br>Starts in Prof. Log's Lab. Finish the main story, including becoming Champion. Reward: Post-Game access.</div></div>
   <div class="mission"><span class="mn">#041</span><div><b>Neighbourly Assistance</b><br>Bring an Antidote to the old man. Reward: Psychic, Ground or Dragon Gem (by starter).</div></div>
   <div class="mission"><span class="mn">#067</span><div><b>The Food Thief</b><br>Pursue an Alolan Sandslash into Icicle Cave. Reward: TM56 Hone Claws.</div></div>
   <div class="mission"><span class="mn">#062</span><div><b>The West Borrius Pokédex</b><br>See all Pokémon in West Borrius. Reward: Catching Charm.</div></div>
   <div class="mission"><span class="mn">#069</span><div><b>The National Pokédex</b><br>Register all 809 Pokémon in the Pokédex. Reward: Original Color Magearna.</div></div>
  </div>
  <div class="cols" style="margin-top:14px;align-items:start">
   ${shot('73','Next stop: Icicle Cave',6)}
   <div class="box tip" style="margin-top:6px"><p style="margin:0"><b>Coming up in Part 2:</b> Icicle Cave &amp; Route 2. Track the Sandslash thief and push on toward Dresco Town and the <b>Leaf Badge</b>.</p></div>
  </div>
  <h3 style="margin-top:14px">Your progress (saved)</h3>
  <div id="wrapStats" class="box" style="font-family:var(--px);font-size:8px;line-height:2;box-shadow:4px 4px 0 var(--ink)"></div>
  <p class="credit" style="margin-top:12px">Walkthrough text summarized and all screenshots, maps and sprites © their creators via <a href="https://unboundwiki.com/walkthrough/part-1/" target="_blank" rel="noopener">unboundwiki.com</a>. Fan-made mockup, not affiliated with Nintendo, Game Freak or Prima.</p>
  ${folio(12,'MISSIONS')}</div>`}
];
})();
