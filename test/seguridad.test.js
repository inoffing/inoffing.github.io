// Revisión de seguridad del sitio. Correr con: node test/seguridad.test.js
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const paginas = fs.readdirSync(raiz).filter(f => f.endsWith('.html'));
const scripts = fs.readdirSync(path.join(raiz, 'js')).filter(f => f.endsWith('.js')).map(f => 'js/' + f);
let fallas = 0;

function chequear(ok, msg) {
  console.log((ok ? '  ok   ' : '  FALLA ') + msg);
  if (!ok) fallas++;
}

for (const pag of paginas) {
  const html = fs.readFileSync(path.join(raiz, pag), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  console.log(pag);

  const csp = (html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/) || [])[1] || '';
  chequear(csp, 'tiene CSP');
  chequear(/default-src 'none'|default-src 'self'/.test(csp), "CSP con default-src restringido");
  chequear(/script-src 'self'(;|$)/.test(csp), "CSP: scripts solo propios");
  chequear(!/unsafe-eval/.test(csp) && !/script-src[^;]*unsafe-inline/.test(csp), 'CSP sin unsafe-eval ni scripts inline');
  chequear(/object-src 'none'/.test(csp) && /base-uri 'none'|base-uri 'self'/.test(csp), 'CSP con object-src y base-uri');

  const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>/g)].filter(m => !/application\/ld\+json/.test(m[1]));
  chequear(inline.length === 0, 'sin scripts inline (salvo datos JSON-LD)');
  chequear(!/\son[a-z]+\s*=/i.test(html), 'sin atributos onclick/onload');
  chequear(!/[\w.+-]+@[\w-]+\.[a-z.]{2,}/i.test(html), 'ningún mail escrito en el HTML');

  for (const m of html.matchAll(/<a\s[^>]*target="_blank"[^>]*>/g)) {
    chequear(/rel="[^"]*noopener/.test(m[0]), 'target=_blank con noopener: ' + m[0].slice(0, 60));
  }
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    const ok = /^(https:|#|mailto:|tel:)/.test(u) || (!/^[a-z]+:/i.test(u) && !u.startsWith('//'));
    if (!ok) chequear(false, 'link no permitido: ' + u);
    if (!/^[a-z#]+:|^#|^\/\//i.test(u) && !fs.existsSync(path.join(raiz, u.split(/[?#]/)[0]))) chequear(false, 'archivo inexistente: ' + u);
  }
}

console.log('js/');
for (const s of scripts) {
  const js = fs.readFileSync(path.join(raiz, s), 'utf8');
  chequear(!/\beval\s*\(|new Function\s*\(/.test(js), s + ': sin eval ni new Function');
  chequear(!/innerHTML\s*=/.test(js), s + ': sin innerHTML');
}

console.log('repo');
const secretos = /(ghp_|github_pat_|sk-[A-Za-z0-9]{20}|AIza[0-9A-Za-z_-]{30}|-----BEGIN [A-Z ]*PRIVATE KEY)/;
const textos = [...paginas, ...scripts, 'README.md'].filter(f => fs.existsSync(path.join(raiz, f)));
chequear(textos.every(f => !secretos.test(fs.readFileSync(path.join(raiz, f), 'utf8'))), 'sin tokens ni claves en el código');

console.log(fallas ? `\n${fallas} falla(s)` : '\nTodo bien');
process.exit(fallas ? 1 : 0);
