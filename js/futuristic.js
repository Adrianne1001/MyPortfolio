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
      '.tm-about .title, .tm-about p, .tm-social .media, ' +
      '#contact form, .title, .portfolio-subtitle, .templatemo-home p, ' +
      '.tm-home-title, .tm-home-subtitle, .tm-view-more-btn'
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
      '.work-wrapper, .portfolio-card, .tm-social .media'
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

  function boot() {
    initParticles();
    initReveal();
    initSkillBars();
    initTilt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
