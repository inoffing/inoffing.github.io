// Corre en el <head> antes de pintar: activa las animaciones solo si el usuario no pidió menos movimiento
(function(){
  var h=document.documentElement;
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
