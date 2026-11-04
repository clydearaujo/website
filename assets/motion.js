(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  // 6. Reading progress (case-study pages) - not decorative motion, runs always
  var prog = document.querySelector('.progress div');
  if (prog) {
    var onScroll = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      prog.style.width = (max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // 5. Navigation underline follows the section in view
  var nav = document.querySelector('.nav[data-spy]');
  if (nav && hasIO) {
    var links = [].slice.call(nav.querySelectorAll('a[href^="#"]')).filter(function (a) { return !a.classList.contains('btn'); });
    var bar = document.createElement('span'); bar.className = 'nav-bar'; nav.appendChild(bar);
    var byId = {};
    links.forEach(function (a) { var id = a.getAttribute('href').slice(1); var sec = document.getElementById(id); if (sec) byId[id] = { a: a, sec: sec }; });
    var place = function (a) {
      links.forEach(function (l) { l.classList.toggle('active', l === a); });
      if (!a) { bar.style.opacity = 0; return; }
      bar.style.left = a.offsetLeft + 'px';
      bar.style.top = (a.offsetTop + a.offsetHeight - 8) + 'px';
      bar.style.width = a.offsetWidth + 'px';
      bar.style.opacity = 1;
    };
    var visible = {};
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      var current = null;
      Object.keys(byId).forEach(function (id) { if (visible[id]) current = current || byId[id].a; });
      place(current);
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(byId).forEach(function (id) { spy.observe(byId[id].sec); });
    window.addEventListener('resize', function () { place(nav.querySelector('a.active')); });
  }

  if (reduce || !hasIO) return;
  document.documentElement.classList.add('motion');

  // 1. Highlighter sweep on the hero
  var mark = document.querySelector('.mark');
  if (mark) setTimeout(function () { mark.classList.add('on'); }, 350);

  // 2. Numbers count up once, 3. verdict reveal, timeline fade-in
  var countUp = function (el) {
    var to = parseFloat(el.getAttribute('data-count'));
    var from = parseFloat(el.getAttribute('data-from') || '0');
    var dec = (el.getAttribute('data-count').split('.')[1] || '').length;
    var t0 = null, d = 900;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / d, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (from + (to - from) * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step); else el.textContent = el.getAttribute('data-count');
    };
    el.textContent = from.toFixed(dec);
    requestAnimationFrame(step);
  };
  var counters = [].slice.call(document.querySelectorAll('[data-count]'));
  counters.forEach(function (el) { el.textContent = parseFloat(el.getAttribute('data-from') || '0').toFixed((el.getAttribute('data-count').split('.')[1] || '').length); });
  document.documentElement.classList.add('tl-anim');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      if (el.hasAttribute('data-count')) countUp(el); else el.classList.add('in');
      io.unobserve(el);
    });
  }, { threshold: 0.3 });
  counters.concat([].slice.call(document.querySelectorAll('.my-verdict, .tl-item'))).forEach(function (el) { io.observe(el); });
})();
