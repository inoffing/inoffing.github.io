// Corre en el <head> antes de pintar: activa las animaciones solo si el usuario no pidió menos movimiento
(function(){
  var h=document.documentElement;

  // Al recargar (F5) o al entrar a una página, siempre arranca arriba de todo.
  // Solo se respeta un #ancla cuando se llega por un link (ej. "Ver todas las obras").
  try{history.scrollRestoration='manual'}catch(e){}
  function arriba(){
    var nav=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];
    var recarga=nav&&nav.type==='reload';
    if(location.hash&&!recarga)return;
    if(location.hash)history.replaceState(null,'',location.pathname+location.search);
    h.style.scrollBehavior='auto';window.scrollTo(0,0);h.style.scrollBehavior='';
  }
  window.addEventListener('pageshow',arriba);

  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  h.classList.add('m');
  // Intro con el logo cada vez que alguien entra desde afuera (WhatsApp, Google, un link);
  // no se repite al pasar de una página de inOffing a otra
  var interno=false;
  try{interno=!!document.referrer&&new URL(document.referrer).host===location.host}catch(e){}
  if(!interno)h.classList.add('m-intro');
  // Red de seguridad: si motion.js no llega a correr, se muestra todo igual
  setTimeout(function(){if(!h.classList.contains('m-ready'))h.classList.remove('m','m-intro')},4000);
})();
