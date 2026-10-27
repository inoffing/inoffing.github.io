// Corre en el <head> antes de pintar: activa las animaciones solo si el usuario no pidió menos movimiento
(function(){
  var h=document.documentElement;
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  h.classList.add('m');
  try{if(!sessionStorage.getItem('io-intro')){h.classList.add('m-intro');sessionStorage.setItem('io-intro','1')}}catch(e){}
  // Red de seguridad: si motion.js no llega a correr, se muestra todo igual
  setTimeout(function(){if(!h.classList.contains('m-ready'))h.classList.remove('m','m-intro')},4000);
})();
