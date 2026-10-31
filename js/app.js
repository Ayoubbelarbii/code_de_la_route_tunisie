(function () {
  'use strict';
  var KEY = 'tn-code-route-done';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable */ }
  }

  var done = load();

  function markUI() {
    var links = document.querySelectorAll('[data-lesson]');
    for (var i = 0; i < links.length; i++) {
      var n = parseInt(links[i].getAttribute('data-lesson'), 10);
      if (!n) continue;
      var isDone = done.indexOf(n) !== -1;
      if (links[i].classList.contains('card')) links[i].classList.toggle('is-done', isDone);
      if (links[i].classList.contains('side-link')) links[i].classList.toggle('is-done', isDone);
    }
  }

  /* ---------- drawer ---------- */
  var drawer = document.getElementById('drawer');
  var menuBtn = document.querySelector('.menu-btn');
  function openDrawer() {
    if (!drawer) return;
    drawer.hidden = false;
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
    var first = drawer.querySelector('a');
    if (first) first.focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.hidden = true;
    if (menuBtn) { menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.focus(); }
  }
  if (menuBtn) menuBtn.addEventListener('click', openDrawer);
  if (drawer) {
    drawer.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close')) closeDrawer();
    });
    // reflect the current lesson / done state inside the drawer too
    var cur = parseInt(document.body.getAttribute('data-lesson') || '0', 10);
    var dl = drawer.querySelectorAll('.side-link');
    for (var i = 0; i < dl.length; i++) {
      if (parseInt(dl[i].getAttribute('data-lesson'), 10) === cur) {
        dl[i].classList.add('is-current');
        dl[i].setAttribute('aria-current', 'page');
      }
    }
  }

  /* ---------- lightbox ---------- */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img');
    var lastFocus = null;
    var closeLb = function () {
      lb.hidden = true;
      if (lastFocus) lastFocus.focus();
    };
    document.addEventListener('click', function (e) {
      var fig = e.target.closest ? e.target.closest('.article .fig') : null;
      if (fig) {
        var img = fig.querySelector('img');
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt;
        lastFocus = document.activeElement;
        lb.hidden = false;
        lb.querySelector('.lb-x').focus();
      } else if (!lb.hidden && !(e.target === lbImg)) {
        closeLb();
      } else if (!lb.hidden && e.target === lbImg) {
        closeLb();
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (lb && !lb.hidden) { lb.hidden = true; return; }
    if (drawer && !drawer.hidden) closeDrawer();
  });

  /* ---------- reading progress ---------- */
  var bar = document.getElementById('bar');
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = Math.min(100, Math.max(0, p)) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  /* ---------- done button (lesson page) ---------- */
  var doneBtn = document.getElementById('doneBtn');
  var current = parseInt(document.body.getAttribute('data-lesson') || '0', 10);
  if (doneBtn && current) {
    var txt = doneBtn.querySelector('.done-txt');
    var render = function () {
      var isDone = done.indexOf(current) !== -1;
      doneBtn.setAttribute('aria-pressed', isDone ? 'true' : 'false');
      txt.textContent = isDone ? 'تم إتمام هذا الدرس' : 'أتممت هذا الدرس';
    };
    doneBtn.addEventListener('click', function () {
      var idx = done.indexOf(current);
      if (idx === -1) done.push(current); else done.splice(idx, 1);
      save(done);
      render();
      markUI();
    });
    render();
  }

  /* ---------- home: resume hint ---------- */
  var resume = document.getElementById('resume');
  if (resume) {
    var total = parseInt(document.body.getAttribute('data-total') || '0', 10);
    var count = done.filter(function (n) { return n >= 1 && n <= total; }).length;
    if (count > 0) {
      var next = 1;
      for (var n = 1; n <= total; n++) { if (done.indexOf(n) === -1) { next = n; break; } }
      resume.hidden = false;
      if (count >= total) {
        resume.textContent = 'أتممت جميع الدروس — أحسنت!';
      } else {
        var pad = next < 10 ? '0' + next : '' + next;
        resume.innerHTML = 'أتممت ' + count + ' من ' + total + ' — <a href="lesson-' + pad + '.html">تابع من الدرس ' + next + '</a>';
      }
    }
  }

  markUI();
})();
