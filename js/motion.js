// Movimiento de inOffing. Sin librerías. Todo entra de arriba hacia abajo y solo anima opacity/transform.
(function(){
  var h=document.documentElement;
  if(!h.classList.contains('m'))return;
  h.classList.add('m-ready');

  var vh=window.innerHeight;
  var fine=window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var raf=window.requestAnimationFrame.bind(window);

  // Parte el texto en palabras dentro de una máscara, conservando los <span> internos
  function split(el){
    el.setAttribute('aria-label',el.textContent.replace(/\s+/g,' ').trim());
    var i=0;
    (function walk(n){
      Array.prototype.slice.call(n.childNodes).forEach(function(c){
        if(c.nodeType===1){walk(c);return}
        if(c.nodeType!==3||!c.textContent.trim())return;
        var f=document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(function(t){
          if(!t)return;
          if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(' '));return}
          var w=document.createElement('span');w.className='w';w.setAttribute('aria-hidden','true');
          var wi=document.createElement('span');wi.className='wi';wi.style.setProperty('--i',i++);wi.textContent=t;
          w.appendChild(wi);f.appendChild(w);
        });
        n.replaceChild(f,c);
      });
    })(el);
    el.classList.add('split-ready');
  }
  document.querySelectorAll('[data-split]').forEach(split);

  // Intro: símbolo y cortina, solo la primera visita de la sesión
  var intro=document.querySelector('[data-intro]');
  var heroDelay=120;
  if(h.classList.contains('m-intro')&&intro){
    heroDelay=2250;
    raf(function(){intro.classList.add('go')});
    var endIntro=function(){
      intro.classList.add('out');
      setTimeout(function(){h.classList.remove('m-intro')},700);
    };
    var t=setTimeout(endIntro,1750);
    intro.addEventListener('click',function(){clearTimeout(t);endIntro()});
  }else{
    h.classList.remove('m-intro');
  }
  setTimeout(function(){h.classList.add('hero-go')},heroDelay);

  // Bloques que bajan al entrar en pantalla, escalonados cuando entran juntos
  var pending=Array.prototype.slice.call(document.querySelectorAll('.reveal,[data-split]:not(h1)'));
  function show(list){
    list.forEach(function(el,k){
      if(el.classList.contains('in'))return;
      el.style.setProperty('--rd',(k*80)+'ms');
      el.classList.add('in');
    });
    pending=pending.filter(function(el){return !el.classList.contains('in')});
  }
  var io=new IntersectionObserver(function(es){
    show(es.filter(function(e){return e.isIntersecting}).map(function(e){io.unobserve(e.target);return e.target}));
  },{rootMargin:'0px 0px -8% 0px'});
  pending.forEach(function(el){io.observe(el)});

  // Red de seguridad: lo que ya quedó arriba del borde inferior se muestra aunque el observador no avise
  function sweep(){
    if(!pending.length)return;
    var tops=pending.map(function(el){return el.getBoundingClientRect().top});
    var atEnd=window.scrollY+vh>=document.documentElement.scrollHeight-4;
    show(pending.filter(function(el,k){return atEnd||tops[k]<vh}));
  }
  setTimeout(sweep,heroDelay+1200);

  // Contadores
  var cio=new IntersectionObserver(function(es){es.forEach(function(e){
    if(!e.isIntersecting)return;cio.unobserve(e.target);
    var el=e.target,to=+el.getAttribute('data-count'),suf=el.getAttribute('data-suffix')||'',t0=null;
    function step(t){t0=t0||t;var p=Math.min(1,(t-t0)/1400);el.textContent=Math.round(to*(1-Math.pow(1-p,3)))+suf;if(p<1)raf(step)}
    raf(step);
  })},{threshold:.6});
  document.querySelectorAll('[data-count]').forEach(function(el){cio.observe(el)});

  // Párrafo que se enciende con el scroll (por escalones, sin transición)
  var scrubs=[];
  document.querySelectorAll('[data-scrub]').forEach(function(el){
    split(el);
    scrubs.push({el:el,words:el.querySelectorAll('.wi'),lit:-1,on:false});
  });
  // Barra de progreso de los pasos
  var progs=[];
  document.querySelectorAll('[data-progress]').forEach(function(el){
    progs.push({el:el,steps:el.querySelectorAll('.paso'),p:-1,on:false});
  });
  var vio=new IntersectionObserver(function(es){es.forEach(function(e){
    scrubs.concat(progs).forEach(function(s){if(s.el===e.target)s.on=e.isIntersecting});
  })});
  scrubs.concat(progs).forEach(function(s){vio.observe(s.el)});

  // Menú que se esconde al bajar y vuelve al subir
  var nav=document.querySelector('[data-nav]'),menu=document.getElementById('menu');
  var navH=nav?nav.offsetHeight:0,lastY=window.scrollY;

  var ticking=false;
  function frame(){
    ticking=false;
    // Primero se lee todo
    var y=window.scrollY;
    var sr=scrubs.filter(function(s){return s.on}).map(function(s){return s.el.getBoundingClientRect()});
    var pr=progs.filter(function(s){return s.on}).map(function(s){return s.el.getBoundingClientRect()});
    // Después se escribe
    scrubs.filter(function(s){return s.on}).forEach(function(s,k){
      var r=sr[k],p=(vh*.85-r.top)/(vh*.5+r.height*.5);
      var n=Math.round(Math.max(0,Math.min(1,p))*s.words.length);
      if(n===s.lit)return;
      for(var i=0;i<s.words.length;i++)s.words[i].classList.toggle('lit',i<n);
      s.lit=n;
    });
    progs.filter(function(s){return s.on}).forEach(function(s,k){
      var r=pr[k],p=Math.max(0,Math.min(1,(vh*.8-r.top)/(r.height*.9)));
      p=Math.round(p*40)/40;
      if(p===s.p)return;s.p=p;
      s.el.style.setProperty('--p',p);
      for(var i=0;i<s.steps.length;i++)s.steps[i].classList.toggle('on',p>=i/s.steps.length+.02);
    });
    if(nav){
      var down=y>lastY,open=menu&&menu.classList.contains('open');
      nav.classList.toggle('nav-hide',down&&y>navH*2&&!open);
      lastY=y;
    }
    sweep();
  }
  function onScroll(){if(!ticking){ticking=true;raf(frame)}}
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',function(){vh=window.innerHeight;navH=nav?nav.offsetHeight:0;onScroll()});
  onScroll();

  if(!fine)return;

  // Brillo que sigue al mouse en el hero
  var glowBox=document.querySelector('[data-glow]');
  if(glowBox){
    var gq=null;
    glowBox.addEventListener('pointermove',function(e){
      if(gq)return;var cx=e.clientX,cy=e.clientY;
      gq=raf(function(){gq=null;var r=glowBox.getBoundingClientRect();
        glowBox.style.setProperty('--mx',((cx-r.left)/r.width*100).toFixed(1)+'%');
        glowBox.style.setProperty('--my',((cy-r.top)/r.height*100).toFixed(1)+'%');
      });
    });
  }

  // Botones magnéticos: se descuenta el desplazamiento ya aplicado para que no tiemblen
  document.querySelectorAll('.magnetic').forEach(function(b){
    var ox=0,oy=0;
    b.addEventListener('pointermove',function(e){
      var r=b.getBoundingClientRect();
      var cx=r.left-ox+r.width/2,cy=r.top-oy+r.height/2;
      ox=Math.max(-10,Math.min(10,(e.clientX-cx)*.25));
      oy=Math.max(-8,Math.min(8,(e.clientY-cy)*.35));
      b.style.transform='translate('+ox.toFixed(1)+'px,'+oy.toFixed(1)+'px)';
    });
    b.addEventListener('pointerleave',function(){ox=oy=0;b.style.transform=''});
  });
})();
