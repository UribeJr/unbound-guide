/* The Professor — AI help chat inside the PokéGear (uses /api/professor; needs the hosted site). */
(function(){
  var WEB = /^https?:$/.test(location.protocol);
  var log = []; // {who:'you'|'prof', text, sources, resting}
  var busy = false;
  var CHIPS = ['Which starters can I get?', 'Next gym team?', 'Where do I catch ___?'];
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function G(){ return window.__guide; }
  function progress(){
    var S=G().state, badges=(window.BADGES||[]).filter(function(b){return S.badges[b.id];}).length;
    var next=Math.min(badges+1,8);
    return { badges: badges, diff: (S.diff&&S.diff[next])||'Vanilla', page: S.page|0 };
  }
  function fmt(t){
    var max=(G()&&G().N)||926;
    return esc(t).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>')
      .replace(/\[?\b[pP]\.\s?(\d{1,3})\]?/g,function(m,n){ n=+n; return n<max?'<a class="pcite" href="#" data-goto="'+n+'" title="Jump to page '+n+'">p.'+n+'</a>':m; })
      .replace(/\n/g,'<br>');
  }
  function srcs(list){
    if(!list||!list.length) return '';
    return '<div class="psrc">'+list.map(function(s){return '<a class="pcite" href="#" data-goto="'+s.p+'" title="'+esc(s.t)+'">p.'+s.p+'</a>';}).join(' ')+'</div>';
  }
  function bubbles(){
    if(!log.length) return '<div class="pmsg prof"><b>PROF.</b>Hello, trainer! Ask me anything this journal covers — routes, gyms, trainers, items or where to catch a Pokémon. I\'ll point you to the right page.</div>';
    return log.map(function(m){
      return '<div class="pmsg '+m.who+(m.resting?' resting':'')+'"><b>'+(m.who==='you'?'YOU':'PROF.')+'</b>'+(m.who==='you'?esc(m.text):fmt(m.text))+(m.who==='prof'?srcs(m.sources):'')+'</div>';
    }).join('')+(busy?'<div class="pmsg prof typing"><b>PROF.</b><span class="dots"><i></i><i></i><i></i></span></div>':'');
  }
  function html(){
    if(!WEB) return '<div class="empty">THE PROFESSOR NEEDS<br>THE ONLINE GUIDE</div><p class="gdisc">The AI help chat only works on the hosted site. Open <a class="gearlink" href="https://unbound-guide.vercel.app" target="_blank" rel="noopener">unbound-guide.vercel.app</a> to ask the Professor.</p>';
    var p=progress();
    return '<div class="prof"><div class="plog" id="plog" aria-live="polite">'+bubbles()+'</div>'+
      '<div class="pchips">'+CHIPS.map(function(c){return '<button type="button" class="pchip" data-pchip="'+esc(c)+'">'+esc(c)+'</button>';}).join('')+'</div>'+
      '<form class="pform" id="pform" autocomplete="off"><input id="pq" maxlength="300" placeholder="Ask the Professor…" aria-label="Ask the Professor"'+(busy?' disabled':'')+'><button class="chk" type="submit"'+(busy?' disabled':'')+'>ASK</button></form>'+
      '<p class="pnote">'+p.badges+' BADGE'+(p.badges===1?'':'S')+' · ANSWERS FROM THIS GUIDE ONLY · AI CAN BE WRONG</p></div>';
  }
  function refresh(){ var b=document.getElementById('gbody'); if(!b||!b.querySelector('.prof')) return; b.innerHTML=html(); mount(); }
  function mount(){
    var l=document.getElementById('plog'); if(l) l.scrollTop=l.scrollHeight;
    var f=document.getElementById('pform'); if(!f) return;
    f.onsubmit=function(e){ e.preventDefault(); ask(document.getElementById('pq').value); };
  }
  function ask(q){
    q=String(q||'').trim(); if(!q||busy) return;
    if(q.indexOf('___')>=0){ var i=document.getElementById('pq'); if(i){ i.value=q.replace('___?',''); i.focus(); } return; }
    var p=progress(); log.push({who:'you',text:q}); busy=true; refresh();
    window.track&&track('professor_ask',{badges:p.badges,chip:CHIPS.indexOf(q)>=0,len:q.length});
    fetch('/api/professor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q:q,badges:p.badges,diff:p.diff,page:p.page})})
      .then(function(r){ return r.json().catch(function(){ return {ok:false,resting:true,answer:"The Professor's resting right now. Try again in a bit!"}; }); })
      .then(function(j){ log.push({who:'prof',text:j.answer||j.error||'Hmm, something went wrong.',sources:j.sources||[],resting:!!j.resting}); })
      .catch(function(){ log.push({who:'prof',text:"The Professor's resting (no connection). Try again in a bit!",sources:[],resting:true}); })
      .then(function(){ busy=false; if(log.length>40) log=log.slice(-40); refresh(); var i=document.getElementById('pq'); if(i&&!document.body.classList.contains('mobile')) i.focus(); });
  }
  document.addEventListener('click',function(e){
    var c=e.target.closest&&e.target.closest('[data-pchip]'); if(c){ e.preventDefault(); return ask(c.dataset.pchip); }
    var a=e.target.closest&&e.target.closest('.pcite'); if(a){ e.preventDefault(); if(document.body.classList.contains('mobile')) G().openGear(false); }
    var fb=e.target.closest&&e.target.closest('#profFab'); if(fb){ var S=G().state; S.tab='prof'; G().save(); G().openGear(true); G().renderGear&&G().renderGear(); }
  },true);
  if(!WEB){ var hideFab=function(){ var f=document.getElementById('profFab'); if(f) f.hidden=true; }; document.readyState==='loading'?document.addEventListener('DOMContentLoaded',hideFab):hideFab(); }
  window.Professor={html:html,mount:mount,ask:ask};
})();
