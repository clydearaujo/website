(function () {
  var b = document.querySelector('.burger'), m = document.getElementById('site-menu');
  if (!b || !m) return;
  function set(open, focus) {
    b.setAttribute('aria-expanded', open);
    var de = document.documentElement.lang === 'de';
    b.setAttribute('aria-label', open ? (de ? 'Menü schließen' : 'Close menu') : (de ? 'Menü öffnen' : 'Open menu'));
    m.classList.toggle('open', open);
    if (open && focus) { var a = m.querySelector('a'); if (a) a.focus({ preventScroll: true }); }
  }
  b.addEventListener('click', function () { set(b.getAttribute('aria-expanded') !== 'true', true); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && b.getAttribute('aria-expanded') === 'true') { set(false); b.focus(); }
  });
  m.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  document.addEventListener('click', function (e) {
    if (b.getAttribute('aria-expanded') === 'true' && !e.target.closest('.site-header')) set(false);
  });
  var mq = window.matchMedia('(min-width: 961px)');
  var onMq = function () { if (mq.matches) set(false); };
  if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);
})();

/* DE placeholder: "coming soon" popover */
(function () {
  var t = document.querySelector('.lang-de'), p = document.getElementById('de-soon');
  if (!t || !p) return;
  var c = p.querySelector('.de-soon-close');
  function set(open, back) {
    t.setAttribute('aria-expanded', open);
    p.hidden = !open;
    if (open && c) c.focus({ preventScroll: true });
    if (!open && back) t.focus({ preventScroll: true });
  }
  t.addEventListener('click', function (e) { e.stopPropagation(); set(p.hidden); });
  if (c) c.addEventListener('click', function () { set(false, true); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !p.hidden) set(false, true); });
  document.addEventListener('click', function (e) { if (!p.hidden && !e.target.closest('.lang-wrap')) set(false); });
})();

/* Language switch: remember the choice, and on the home page keep the visitor on the same section */
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('[data-lang]');
  if (!a) return;
  try { localStorage.setItem('lang', a.getAttribute('data-lang')); } catch (err) {}
  var path = location.pathname;
  if (path !== '/' && path !== '/index.html' && path !== '/de/' && path !== '/de/index.html') return;
  var base = a.getAttribute('data-base') || a.getAttribute('href').split('#')[0];
  a.setAttribute('data-base', base);
  var id = '', secs = document.querySelectorAll('section[id]'), line = window.innerHeight * 0.35;
  for (var i = 0; i < secs.length; i++) { if (secs[i].getBoundingClientRect().top <= line) id = secs[i].id; }
  a.setAttribute('href', base + (id ? '#' + id : ''));
});
