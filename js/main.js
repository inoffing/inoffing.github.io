(function(){
  // Mail armado acá para que no figure en el HTML y no lo levanten los bots de spam
  var MAIL=['arq','hafestudio.com.ar'].join('@');
  document.querySelectorAll('[data-mail]').forEach(function(a){
    var s=a.getAttribute('data-mail');
    a.href='mailto:'+MAIL+(s?'?subject='+encodeURIComponent(s):'');
    if(!a.hasAttribute('data-mail-keep'))a.textContent=MAIL;
  });

  document.querySelectorAll('.ad-card:not(.pend),.card-img.swap').forEach(function(c){c.addEventListener('click',function(){if(window.matchMedia('(hover: none)').matches)c.classList.toggle('show')})});
  var b=document.getElementById('burger'),m=document.getElementById('menu');
  if(b&&m){
    b.addEventListener('click',function(){var o=m.classList.toggle('open');b.setAttribute('aria-expanded',o)});
    m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){m.classList.remove('open');b.setAttribute('aria-expanded','false')})});
  }

  var f=document.getElementById('inmoForm'),op='Alquiler';
  f.querySelectorAll('.seg button').forEach(function(x){x.addEventListener('click',function(){
    f.querySelectorAll('.seg button').forEach(function(y){y.setAttribute('aria-pressed','false')});
    x.setAttribute('aria-pressed','true');op=x.dataset.v;})});
  function v(id){return document.getElementById(id).value.trim()}
  function msg(){
    var l=['Hola inOffing, les derivo un cliente.','','Agente: '+v('i-nombre')+(v('i-inmo')?' ('+v('i-inmo')+')':''),'Teléfono: '+v('i-tel'),'Operación: '+op,'Uso previsto: '+v('i-uso')];
    if(v('i-zona'))l.push('Zona: '+v('i-zona'));
    if(v('i-m2'))l.push('Superficie: '+v('i-m2'));
    if(v('i-msg'))l.push('','Comentarios: '+v('i-msg'));
    return l.join('\n');
  }
  f.addEventListener('input',function(){document.getElementById('i-mail').href='mailto:'+MAIL+'?subject='+encodeURIComponent('Derivación de cliente — inmobiliaria')+'&body='+encodeURIComponent(msg())});
  f.addEventListener('submit',function(e){
    e.preventDefault();var err=document.getElementById('i-err');
    if(!v('i-nombre')||!v('i-tel')){err.style.display='block';return}
    err.style.display='none';window.open('https://wa.me/5491159377885?text='+encodeURIComponent(msg()),'_blank','noopener');
  });
})();
