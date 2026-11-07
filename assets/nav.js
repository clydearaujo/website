(function () {
  var b = document.querySelector('.burger'), m = document.getElementById('site-menu');
  if (!b || !m) return;
  function set(open, focus) {
    b.setAttribute('aria-expanded', open);
    b.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
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
