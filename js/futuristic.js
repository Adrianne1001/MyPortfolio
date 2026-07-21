/* =====================================================================
   FUTURISTIC THEME — interactions
   1. Animated particle "constellation" canvas background
   2. Scroll-reveal for sections/cards
   3. Skill progress bars animate to their target width when in view
   Vanilla JS, no dependencies. Respects prefers-reduced-motion.
   ===================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. PARTICLE CONSTELLATION BACKGROUND ---------- */
  function initParticles() {
    if (reduceMotion) return;
    var canvas = document.getElementById('fx-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w, h, particles, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var mouse = { x: -9999, y: -9999 };

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Particle count scales with area but stays capped for performance
      var count = Math.min(90, Math.floor((w * h) / 16000));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.8 + 0.6
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // gentle mouse repulsion for interactivity
        var dxm = p.x - mouse.x, dym = p.y - mouse.y;
        var dm = dxm * dxm + dym * dym;
        if (dm < 14000) {
          var f = (14000 - dm) / 14000 * 0.6;
          p.x += (dxm / Math.sqrt(dm || 1)) * f;
          p.y += (dym / Math.sqrt(dm || 1)) * f;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 229, 255, 0.75)';
        ctx.fill();
      }
      // connective lines
      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx = particles[a].x - particles[b].x;
          var dy = particles[a].y - particles[b].y;
          var dist = dx * dx + dy * dy;
          if (dist < 15000) {
            var alpha = (1 - dist / 15000) * 0.35;
            ctx.strokeStyle = 'rgba(124, 139, 255, ' + alpha + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(step);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX; mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', function () {
      mouse.x = -9999; mouse.y = -9999;
    });
    resize();
    requestAnimationFrame(step);
  }

  /* ---------- 2. SCROLL REVEAL ---------- */
  function initReveal() {
    var targets = document.querySelectorAll(
      '.work-wrapper, .portfolio-card, #resume .col-md-6, ' +
      '.about-photo, .about-text-col, .stat, .tech-marquee, ' +
      '.contact-info-card, .contact-form-card, .section-head, ' +
      '.hero-badge, .tm-home-title, .tm-home-subtitle, ' +
      '.templatemo-home p, .hero-cta, .hero-resume, ' +
      '.skill-chips, .portfolio-subtitle'
    );
    targets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (Math.min(i % 4, 3) * 0.08) + 's';
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 3. ANIMATED SKILL BARS ---------- */
  function initSkillBars() {
    var bars = document.querySelectorAll('.progress-bar-danger');
    if (!bars.length) return;

    function fill(bar) {
      var target = bar.getAttribute('aria-valuenow');
      // CSS sets width:0 !important as the start state, so we must
      // override with !important too or the fill won't apply.
      bar.style.setProperty('width', target + '%', 'important');
    }
    if (reduceMotion || !('IntersectionObserver' in window)) {
      bars.forEach(fill);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          fill(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(function (bar) { io.observe(bar); });
  }

  /* ---------- 4. SUBTLE 3D TILT ON CARDS ---------- */
  function initTilt() {
    if (reduceMotion) return;
    // Skip on touch / no-hover devices — tilt needs a pointer.
    if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;

    var cards = document.querySelectorAll(
      '.work-wrapper, .portfolio-card'
    );
    var MAX = 7; // degrees — kept small so it reads as depth, not a gimmick

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;   // 0..1 across
        var py = (e.clientY - r.top) / r.height;   // 0..1 down
        var ry = (px - 0.5) * (MAX * 2);
        var rx = (0.5 - py) * (MAX * 2);
        card.style.transition = 'transform 0.08s linear';
        card.style.transform =
          'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' +
          ry.toFixed(2) + 'deg) translateY(-8px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
        card.style.transform = '';
      });
    });
  }

  /* ---------- 5. PRELOADER ---------- */
  function initPreloader() {
    var pre = document.getElementById('preloader');
    if (!pre) return;
    var done = false;
    function hide() { if (done) return; done = true; pre.classList.add('loaded'); }
    window.addEventListener('load', function () { setTimeout(hide, 400); });
    // Safety fallback so the page is never stuck behind the loader
    setTimeout(hide, 3500);
  }

  /* ---------- 6. SCROLL PROGRESS + BACK TO TOP ---------- */
  function initScrollUI() {
    var bar = document.getElementById('scroll-progress');
    var btt = document.getElementById('back-to-top');
    function onScroll() {
      var st = window.pageYOffset || document.documentElement.scrollTop;
      var h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var pct = h > 0 ? (st / h) * 100 : 0;
      if (bar) bar.style.width = pct + '%';
      if (btt) { if (st > 500) btt.classList.add('show'); else btt.classList.remove('show'); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (btt) btt.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 7. CUSTOM CURSOR ---------- */
  function initCursor() {
    if (reduceMotion) return;
    if (!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches)) return;
    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;
    document.body.classList.add('custom-cursor');

    var mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    });
    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    }
    loop();

    var interactive = 'a, button, input, textarea, .portfolio-card, .work-wrapper, ' +
      '.stat, .skill-chip, .carousel-btn, .carousel-dot, .contact-socials a, .repo-item';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(interactive)) ring.classList.add('grow');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(interactive)) ring.classList.remove('grow');
    });
  }

  /* ---------- 8. STAT COUNTERS ---------- */
  function initCounters() {
    var nums = document.querySelectorAll('.stat-num');
    if (!nums.length) return;
    function run(el) {
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduceMotion) { el.innerHTML = target + '<span class="suffix">' + suffix + '</span>'; return; }
      var dur = 1600, t0 = null;
      function frame(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var val = Math.floor((1 - Math.pow(1 - p, 3)) * target);
        el.innerHTML = val + '<span class="suffix">' + suffix + '</span>';
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { run(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  }

  /* ---------- 9. TYPING / ROTATING ROLES ---------- */
  function initTyping() {
    var el = document.getElementById('typed');
    if (!el) return;
    var roles = (el.getAttribute('data-roles') || '').split('|').filter(Boolean);
    if (!roles.length) return;
    if (reduceMotion) { el.textContent = roles[0]; return; }

    var i = 0, ch = 0, deleting = false;
    function tick() {
      var word = roles[i];
      if (!deleting) {
        ch++;
        if (ch > word.length) { deleting = true; el.textContent = word; setTimeout(tick, 1500); return; }
      } else {
        ch--;
        if (ch < 0) { deleting = false; i = (i + 1) % roles.length; ch = 0; }
      }
      el.textContent = word.substring(0, Math.max(ch, 0));
      setTimeout(tick, deleting ? 45 : 95);
    }
    tick();
  }

  /* ---------- 10. SCROLLSPY (accurate active nav link) ---------- */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('.main-navigation a.smoothScroll')
    );
    var map = links.map(function (a) {
      var href = a.getAttribute('href');
      var sec = href && href.charAt(0) === '#' ? document.querySelector(href) : null;
      return sec ? { a: a, li: a.parentNode, sec: sec } : null;
    }).filter(Boolean);
    if (!map.length) return;

    var nav = document.querySelector('.sticky-navigation');

    function offsetTop(el) {
      var y = 0;
      while (el) { y += el.offsetTop; el = el.offsetParent; }
      return y;
    }

    function onScroll() {
      var navH = nav ? nav.offsetHeight : 70;
      var pos = window.pageYOffset + navH + 40; // trigger just below the navbar
      var current = map[0];
      for (var i = 0; i < map.length; i++) {
        if (offsetTop(map[i].sec) <= pos) current = map[i];
      }
      // At the very bottom, always highlight the last link.
      if (window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 2) {
        current = map[map.length - 1];
      }
      map.forEach(function (m) {
        if (m === current) m.li.classList.add('active');
        else m.li.classList.remove('active');
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  }

  function boot() {
    initPreloader();
    initParticles();
    initReveal();
    initSkillBars();
    initTilt();
    initScrollUI();
    initCursor();
    initCounters();
    initTyping();
    initScrollSpy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
