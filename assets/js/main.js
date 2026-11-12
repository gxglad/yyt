/* =========================================================
   云探校 · 招生开放日线上展厅
   交互脚本（原生 JS，无依赖）
   ---------------------------------------------------------
   1 导航 / 抽屉
   2 首屏视差
   3 滚动入场
   4 数字滚动
   5 校园长卷
   6 八站导览（滚动叙事）
   7 系部折叠
   8 时间线
   ========================================================= */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1 导航 / 抽屉 ---------- */
  var nav = $('#nav');
  var burger = $('#burger');
  var drawer = $('#drawer');
  var drawerClose = $('#drawerClose');

  function onNavScroll() {
    if (!nav) return;
    nav.classList.toggle('is-stuck', window.pageYOffset > 40);
  }

  function openDrawer() {
    drawer.classList.add('is-open');
    document.body.classList.add('is-locked');
    burger.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    burger.setAttribute('aria-expanded', 'false');
  }

  if (burger) burger.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  $$('#drawer a').forEach(function (a) { a.addEventListener('click', closeDrawer); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  /* ---------- 2 首屏视差 ---------- */
  var heroBg = $('#heroBg');

  function heroParallax() {
    if (!heroBg || reduce) return;
    var y = window.pageYOffset;
    if (y < window.innerHeight * 1.4) {
      heroBg.style.transform = 'scale(1.08) translate3d(0,' + (y * 0.16).toFixed(1) + 'px,0)';
    }
  }

  /* ---------- 3 滚动入场 ---------- */
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
        var items = $$('#timeline li');
        items.forEach(function (li, i) {
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

  /* ---------- 4 数字滚动 ---------- */
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
        el.textContent = Math.round(target * e).toLocaleString('en-US').replace(/,/g, '');
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

  /* ---------- 5 长卷 · 卷轴拉开 ---------- */
  var unroll = $('#pan');
  var band = $('#unrollBand');
  var capBox = $('#panCap');
  var caps = [
    ['往下拉，这条长卷才展开', 'SCROLL TO UNROLL · 360 亩 · 210,000 ㎡'],
    ['三百六十亩，从校门一路铺进去', '360 MU · 210,000 ㎡ · 2024'],
    ['教学楼、实训楼、生活区，沿主路一字排开', 'RED BRICK · MAIN AXIS · CAMPUS']
  ];
  var capIdx = -1;

  function setCap(i) {
    if (i === capIdx || !capBox) return;
    capIdx = i;
    capBox.style.opacity = 0;
    setTimeout(function () {
      capBox.innerHTML = caps[i][0] + '<small>' + caps[i][1] + '</small>';
      capBox.style.opacity = 1;
    }, 160);
  }

  function unrollMove() {
    if (!unroll || !band) return;
    var r = unroll.getBoundingClientRect();
    var total = unroll.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    var p = clamp(-r.top / total, 0, 1);
    var q = clamp(p / 0.84, 0, 1);
    var e = 1 - Math.pow(1 - q, 2.2);        // 先快后慢，像真的在拉
    band.style.width = (5 + 95 * e).toFixed(2) + '%';
    setCap(p < 0.32 ? 0 : p < 0.68 ? 1 : 2);
  }

  /* ---------- 6 八站导览 ---------- */
  var stops = $('#stops');
  var stopPanels = $$('.stop');
  var segs = $$('#stopsSegs button');
  var planBlocks = $$('.plan__b');
  var planDot = $('#planDot');
  var stopsHint = $('#stopsHint');
  var stopsSticky = $('.stops__sticky');
  var stopsIdx = 0;

  function planCenter(name) {
    var b = null;
    planBlocks.forEach(function (el) { if (el.getAttribute('data-block') === name) b = el; });
    if (!b || !planDot) return;
    var cx = parseFloat(b.getAttribute('x')) + parseFloat(b.getAttribute('width')) - 11;
    var cy = parseFloat(b.getAttribute('y')) + 11;
    planDot.setAttribute('cx', cx);
    planDot.setAttribute('cy', cy);
  }

  function setStop(i) {
    if (i === stopsIdx) return;
    stopsIdx = i;
    stopPanels.forEach(function (el, k) { el.classList.toggle('is-on', k === i); });
    segs.forEach(function (el, k) {
      el.classList.toggle('is-on', k === i);
      el.classList.toggle('is-done', k < i);
    });
    planBlocks.forEach(function (el) {
      el.classList.toggle('is-on', el.getAttribute('data-block') === stopPanels[i].getAttribute('data-block'));
    });
    planCenter(stopPanels[i].getAttribute('data-block'));
  }

  // 初始化第一站
  if (planBlocks.length && stopPanels.length) {
    planBlocks.forEach(function (el) {
      el.classList.toggle('is-on', el.getAttribute('data-block') === stopPanels[0].getAttribute('data-block'));
    });
    planCenter(stopPanels[0].getAttribute('data-block'));
  }

  function stopsMove() {
    if (!stops || !stopsSticky) return;
    var h = stopsSticky.getBoundingClientRect().height || window.innerHeight;
    var total = stops.offsetHeight - h;
    if (total <= 0) return;
    var p = clamp(-stops.getBoundingClientRect().top / total, 0, 1);
    var n = stopPanels.length;
    var i = clamp(Math.floor(p * n), 0, n - 1);
    setStop(i);
    if (stopsHint) {
      stopsHint.textContent = p >= 0.985 ? '已到展厅 · 五颗心都落了地' : '向下滚动 · 第 ' + (i + 1) + ' / ' + n + ' 站';
    }
  }

  segs.forEach(function (item, i) {
    item.addEventListener('click', function () {
      if (!stops) return;
      var h = stopsSticky.getBoundingClientRect().height || window.innerHeight;
      var total = stops.offsetHeight - h;
      var y = stops.offsetTop + (i + 0.5) * (total / stopPanels.length);
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---------- 7 系部折叠 ---------- */
  $$('.dept__hd').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dept = btn.parentNode;
      var isOpen = dept.classList.contains('is-open');
      $$('.dept').forEach(function (d) {
        d.classList.remove('is-open');
        var hd = $('.dept__hd', d);
        if (hd) hd.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        dept.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- 8 年份 ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- 滚动主循环 ---------- */
  var ticking = false;

  function frame() {
    ticking = false;
    onNavScroll();
    heroParallax();
    unrollMove();
    stopsMove();
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(frame);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    stopPanels.forEach(function (el, k) { el.classList.toggle('is-on', k === stopsIdx); });
    onScroll();
  });

  frame();
})();
