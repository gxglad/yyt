(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  var nav = $('#nav');
  var burger = $('#burger');
  var drawer = $('#drawer');
  var drawerClose = $('#drawerClose');

  function onNavScroll() {
    if (!nav) return;
    nav.classList.toggle('is-stuck', window.pageYOffset > 40);
  }

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('is-open');
    document.body.classList.add('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }

  if (burger) burger.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  $$('#drawer a').forEach(function (a) { a.addEventListener('click', closeDrawer); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  var heroBg = $('#heroBg');

  function heroParallax() {
    if (!heroBg || reduce) return;
    var y = window.pageYOffset;
    if (y < window.innerHeight * 1.4) {
      heroBg.style.transform = 'scale(1.08) translate3d(0,' + (y * 0.16).toFixed(1) + 'px,0)';
    }
  }

  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });

    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        $$('#timeline li').forEach(function (li, i) {
          setTimeout(function () { li.classList.add('is-on'); }, i * 90);
        });
        tio.disconnect();
      });
    }, { threshold: 0.2 });
    var tl = $('#timeline');
    if (tl) tio.observe(tl);
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
    $$('#timeline li').forEach(function (li) { li.classList.add('is-on'); });
  }

  var counters = $$('[data-count]');
  var counted = false;

  function runCounters() {
    if (counted) return;
    counted = true;
    counters.forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      var dur = 1300;
      var t0 = performance.now();
      (function step(now) {
        var p = clamp((now - t0) / dur, 0, 1);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * e);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      })(t0);
    });
  }

  if ('IntersectionObserver' in window && !reduce) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounters(); nio.disconnect(); }
      });
    }, { threshold: 0.25 });
    var statsBox = $('.stats');
    if (statsBox) nio.observe(statsBox);
  } else {
    runCounters();
  }

  var unroll = $('#pan');
  var band = $('#unrollBand');
  var frameBox = band ? band.querySelector('.unroll__frame') : null;
  var frames = frameBox ? [].slice.call(frameBox.children) : [];
  var capBox = $('#panCap');
  var capText = '';
  var opened = false;

  function showFrame(i) {
    frames.forEach(function (el, k) { el.classList.toggle('is-on', k === i); });
  }

  function setCap(txt) {
    if (!capBox || !txt || txt === capText) return;
    capText = txt;
    capBox.style.opacity = '0';
    setTimeout(function () {
      capBox.textContent = txt;
      capBox.style.opacity = '1';
    }, 180);
  }

  function openUnroll() {
    if (opened || !unroll || !band) return;
    opened = true;
    unroll.classList.add('is-open');
    band.style.width = '100%';

    var last = frames.length - 1;
    if (last < 1) return;
    var step = reduce ? 0 : Math.round(6000 / frames.length);
    var i = 0;
    var timer = setInterval(function () {
      i += 1;
      if (i >= last) {
        clearInterval(timer);
        showFrame(last);
        setCap(frames[last].getAttribute('data-cap'));
        return;
      }
      showFrame(i);
    }, Math.max(80, step));
  }

  if (unroll && 'IntersectionObserver' in window) {
    var uio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          openUnroll();
          uio.disconnect();
        }
      });
    }, { threshold: 0.35 });
    uio.observe(unroll);
  } else {
    openUnroll();
  }

  var walkItems = $$('.walk__it');
  var planBlocks = $$('.plan__b');
  var planDot = $('#planDot');
  var walkNo = $('#walkNo');
  var walkNm = $('#walkNm');

  function planTo(name) {
    var b = null;
    planBlocks.forEach(function (el) {
      el.classList.toggle('is-on', el.getAttribute('data-block') === name);
      if (el.getAttribute('data-block') === name) b = el;
    });
    if (!b || !planDot) return;
    planDot.setAttribute('cx', parseFloat(b.getAttribute('x')) + parseFloat(b.getAttribute('width')) - 11);
    planDot.setAttribute('cy', parseFloat(b.getAttribute('y')) + 11);
  }

  function openWalk(item, nudge) {
    walkItems.forEach(function (it) {
      var on = it === item;
      it.classList.toggle('is-open', on);
      var hd = $('.walk__hd', it);
      if (hd) hd.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    planTo(item.getAttribute('data-block'));
    var no = $('.walk__no', item);
    if (walkNo && no) walkNo.textContent = no.textContent;
    if (walkNm) walkNm.textContent = item.getAttribute('data-nm') || '';
    if (!nudge) return;
    setTimeout(function () {
      var r = item.getBoundingClientRect();
      var top = 96;
      if (r.top < top - 8 || r.bottom > window.innerHeight - 40) {
        var to = window.pageYOffset + r.top - top;
        window.scrollTo({ top: to, behavior: 'smooth' });
      }
    }, 380);
  }

  walkItems.forEach(function (item) {
    var hd = $('.walk__hd', item);
    if (!hd) return;
    hd.addEventListener('click', function () {
      if (item.classList.contains('is-open')) {
        item.classList.remove('is-open');
        hd.setAttribute('aria-expanded', 'false');
        return;
      }
      openWalk(item, true);
    });
  });

  if (walkItems.length) openWalk(walkItems[0]);

  $$('.dept__hd').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dept = btn.parentNode;
      var isOpen = dept.classList.contains('is-open');
      $$('.dept').forEach(function (d) {
        d.classList.remove('is-open');
        var h = $('.dept__hd', d);
        if (h) h.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        dept.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  var ticking = false;

  function frame() {
    ticking = false;
    onNavScroll();
    heroParallax();
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(frame);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', frame);

  frame();
})();
