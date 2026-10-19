/* Pixel-art badge icons (12×12), drawn as crisp SVG rects. Original fan art for the 8 Borrius badges. */
(function(){
const ART={
leaf:[
"......kk....",
".....kaak...",
"....kabaak..",
"...kabaaak..",
"..kabaaacak.",
"..kbaaacaak.",
".kbaaacaaak.",
".kaaacaaak..",
".kaacaaak...",
"..kcakkk....",
".kck........",
"kk.........."],
vision:[
"............",
"....kkkk....",
"..kkaaaakk..",
".kaabbaaaak.",
"kaabkkkkaaak",
"kabkwwkkkaak",
"kaakwkkkkcak",
"kaackkkkcaak",
".kaacccccak.",
"..kkaaaakk..",
"....kkkk....",
"............"],
wings:[
"............",
".kk......kk.",
"kbak....kabk",
"kbaak..kaabk",
"kbaaakkaaabk",
".kbaaaaaabk.",
".kcaaaaaack.",
"..kcaaaack..",
"...kcaack...",
"....kcck....",
".....kk.....",
"............"],
fall:[
".....kk.....",
"....kaak....",
".kk.kbak.kk.",
"kaakkbakkaak",
"kabbaaaaaaak",
".kabaaaaaak.",
"..kaaaaaak..",
".kaaacaaaak.",
"kaakkcckkaak",
".kk..kk..kk.",
".....kk.....",
".....kk....."],
battery:[
"....kkkk....",
"....kaak....",
"..kkkkkkkk..",
"..kbaaaaak..",
"..kbaawkak..",
"..kbawwkak..",
"..kawwwwak..",
"..kaakwwak..",
"..kaakwaak..",
"..kcaaaack..",
"..kkkkkkkk..",
"............"],
ring:[
"............",
"....kkkk....",
"..kkbbaakk..",
".kbbkkkkaak.",
".kbk....kak.",
"kbk......kak",
"kak......kck",
".kak....kck.",
".kaakkkkcck.",
"..kkaaccckk.",
"....kkkk....",
"............"],
swamp:[
".....kk.....",
"....kaak....",
"....kaak....",
"...kabaak...",
"..kabaaaak..",
"..kbaaaaak..",
".kbwaaaaaak.",
".kbaaaaaaak.",
".kaaaaaacak.",
"..kaaaacak..",
"...kkcckk...",
".....kk....."],
time:[
".kkkkkkkkkk.",
".kccccccccck",
"..kaaaaaak..",
"..kbwaaaak..",
"...kbaaak...",
"....kaak....",
"....kaak....",
"...kakbak...",
"..kaakbaak..",
"..kaaaaaak..",
".kccccccccck",
".kkkkkkkkkk."]
};
function mix(hex,t,to){ // t in 0..1 toward `to` (#fff or #000)
  const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)); const a=p(hex), b=p(to);
  return '#'+a.map((v,i)=>Math.round(v+(b[i]-v)*t).toString(16).padStart(2,'0')).join('');
}
window.mixColor=mix; window.BADGE_ART=ART;
/* mode: 'color' (default), 'mono' (single ink color, for rubber stamps), 'ghost' (empty socket) */
window.badgeSVG=function(id,size,mode,ink){
  const b=(window.BADGES||[]).find(x=>x.id===id)||{color:'#888'}; const g=ART[id]; if(!g) return '';
  const c=b.color, pal = mode==='mono' ? {k:ink||c,a:ink||c,b:'none',c:ink||c,w:'none'}
    : mode==='dim' ? {k:'rgba(255,226,180,.42)',a:'rgba(255,226,180,.13)',b:'rgba(255,226,180,.2)',c:'rgba(255,226,180,.08)',w:'rgba(255,226,180,.1)'}
    : mode==='ghost' ? {k:'rgba(0,0,0,.35)',a:'rgba(0,0,0,.14)',b:'rgba(0,0,0,.1)',c:'rgba(0,0,0,.2)',w:'rgba(0,0,0,.05)'}
    : {k:'#1d1a16',a:c,b:mix(c,.55,'#ffffff'),c:mix(c,.35,'#000000'),w:'#ffffff'};
  let r='';
  g.forEach((row,y)=>[...row].forEach((ch,x)=>{ const f=pal[ch]; if(f&&f!=='none') r+=`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${f}"/>`; }));
  return `<svg class="pxb" viewBox="0 0 12 12" width="${size}" height="${size}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
};
})();
