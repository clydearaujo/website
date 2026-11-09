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

  // 1b. Hero word roll: the page text holds only "customer"; the other words are
  // added for the animation (aria-hidden) and removed again when it ends.
  var roll = document.querySelector('.roll');
  if (roll) {
    var last = roll.lastElementChild;
    (roll.getAttribute('data-words') || '').split(' ').filter(Boolean).forEach(function (w) {
      var sp = document.createElement('span'); sp.textContent = w; sp.setAttribute('aria-hidden', 'true'); roll.insertBefore(sp, last);
    });
    var words = [].slice.call(roll.children), k = 0;
    var setW = function (i) { roll.style.width = words[i].offsetWidth + 'px'; };
    var done = function () { words.forEach(function (w) { if (w !== last) roll.removeChild(w); }); roll.style.width = ''; };
    words[0].classList.add('on'); setW(0);
    var nextWord = function () { words[k].classList.remove('on'); k++; words[k].classList.add('on'); setW(k); if (k < words.length - 1) setTimeout(nextWord, 240); else setTimeout(done, 400); };
    setTimeout(nextWord, 900);
  }

  // 2. Numbers count up once, 3. verdict reveal, timeline fade-in
  // The real figure always stays in the page text; the count-up is drawn on top via ::after (data-show).
  var countUp = function (el) {
    var to = parseFloat(el.getAttribute('data-count'));
    var from = parseFloat(el.getAttribute('data-from') || '0');
    var dec = (el.getAttribute('data-count').split('.')[1] || '').length;
    var t0 = null, d = 900;
    el.__done = true;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / d, 1), e = 1 - Math.pow(1 - p, 3);
      el.setAttribute('data-show', (from + (to - from) * e).toFixed(dec));
      if (p < 1) requestAnimationFrame(step); else { el.classList.remove('counting'); el.removeAttribute('data-show'); }
    };
    requestAnimationFrame(step);
  };
  var counters = [].slice.call(document.querySelectorAll('[data-count]'));
  counters.forEach(function (el) {
    el.style.setProperty('--c', getComputedStyle(el).color);
    el.setAttribute('data-show', parseFloat(el.getAttribute('data-from') || '0').toFixed((el.getAttribute('data-count').split('.')[1] || '').length));
    el.classList.add('counting');
  });
  document.documentElement.classList.add('tl-anim');
  // Observe each stat block (not the inline span), so the count starts when the block is on screen
  var blocks = [];
  counters.forEach(function (el) { var b = el.closest('.proof > div, .results > div') || el.parentElement; if (blocks.indexOf(b) < 0) blocks.push(b); });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      if (el.classList.contains('my-verdict') || el.classList.contains('tl-item')) el.classList.add('in');
      else [].slice.call(el.querySelectorAll('[data-count]')).forEach(countUp);
      io.unobserve(el);
    });
  }, { threshold: 0, rootMargin: '0px 0px -5% 0px' });
  blocks.concat([].slice.call(document.querySelectorAll('.my-verdict, .tl-item'))).forEach(function (el) { io.observe(el); });
  // Safety net: any figure that never started counting shows its final value
  setTimeout(function () { counters.forEach(function (el) { if (!el.__done) { el.classList.remove('counting'); el.removeAttribute('data-show'); } }); }, 4000);
})();

/* Copy email address */
document.querySelectorAll('[data-copy]').forEach(function(b){
  b.addEventListener('click',function(){
    var t=b.getAttribute('data-copy'),s=b.parentNode.querySelector('.copy-status');
    var de=document.documentElement.lang==='de';function done(){b.textContent=de?'Kopiert':'Copied';if(s)s.textContent=de?'E-Mail-Adresse kopiert':'Email address copied';setTimeout(function(){b.textContent=de?'Kopieren':'Copy';if(s)s.textContent='';},2500);}
    if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(t).then(done,function(){fallback();});}else{fallback();}
    function fallback(){var r=document.createRange(),el=document.getElementById('contact-email');if(!el)return;r.selectNodeContents(el);var sel=getSelection();sel.removeAllRanges();sel.addRange(r);try{document.execCommand('copy');done();}catch(e){}}
  });
});

/* Option 3 ticker: cycles data types in a fixed-width monospace slot, ends on the final word */
(function(){var t=document.querySelector('.tick-slot');if(!t||!document.documentElement.classList.contains('motion'))return;
var ws=(t.getAttribute('data-words')||'').split(' ').filter(Boolean),fin=t.getAttribute('data-final'),i=0;
var show=function(w){t.classList.remove('fade');void t.offsetWidth;t.textContent=w;t.classList.add('fade');};
show(ws[0]);var go=function(){i++;if(i<ws.length){show(ws[i]);setTimeout(go,520);}else{show(fin);}};setTimeout(go,900);})();
