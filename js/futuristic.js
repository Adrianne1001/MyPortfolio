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
      '.hero-badge, .tm-home-title, .tm-home-subtitle, .hero-lead, ' +
      '.hero-cta, .hero-facts, .hero-socials, .hero-terminal, ' +
      '.about-photo, .about-text-col, .pillar, .stat, .tech-marquee, ' +
      '.section-head, .tl-item, .featured, .more-head, .project-card, ' +
      '.skill-group, .edu-card, .contact-info-card, .contact-form-card'
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

  /* ---------- 3. PROJECT FILTER ---------- */
  function initProjectFilter() {
    var buttons = document.querySelectorAll('.pf-btn');
    var cards = document.querySelectorAll('.project-card');
    if (!buttons.length || !cards.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');
        buttons.forEach(function (b) {
          b.classList.toggle('active', b === btn);
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        cards.forEach(function (card) {
          var cats = (card.getAttribute('data-cat') || '').split(' ');
          var show = filter === 'all' || cats.indexOf(filter) !== -1;
          card.classList.remove('is-entering');
          card.classList.toggle('is-hidden', !show);
          if (show) {
            // Reveal may not have fired for cards that were hidden, so show them now.
            card.classList.add('in-view');
            void card.offsetWidth; // restart the entry animation
            card.classList.add('is-entering');
          }
        });
      });
    });
  }

  /* ---------- 4. SUBTLE 3D TILT ON CARDS ---------- */
  function initTilt() {
    if (reduceMotion) return;
    // Skip on touch / no-hover devices — tilt needs a pointer.
    if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;

    var cards = document.querySelectorAll('.project-card, .pillar');
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

    var interactive = 'a, button, input, textarea, .project-card, .featured, ' +
      '.stat, .skill-chip, .terminal, .contact-socials a, .repo-item';
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
      var current = null; // nothing highlighted while on the hero
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

  /* ---------- 11. CONTACT FORM (AJAX -> Web3Forms) ---------- */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var status = document.getElementById('form-status');
    var btn = form.querySelector('.form-submit-btn');
    var label = btn ? btn.querySelector('.btn-label') : null;

    function showStatus(type, msg) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form-status show ' + type;
      if (type === 'success') {
        setTimeout(function () { status.className = 'form-status'; }, 7000);
      }
    }
    function setLoading(on) {
      if (!btn) return;
      btn.disabled = on;
      btn.classList.toggle('is-loading', on);
      if (label) label.textContent = on ? 'Sending' : 'Send Message';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Guard: friendly message if the access key hasn't been configured yet.
      var access = form.querySelector('[name="access_key"]');
      if (!access || /YOUR_WEB3FORMS_ACCESS_KEY/.test(access.value)) {
        showStatus('error', 'The form isn’t connected yet — add your Web3Forms access key in index.html. Meanwhile, email me directly at adrianne10160103@gmail.com.');
        return;
      }

      // Default subject if the visitor left it blank.
      var subject = form.querySelector('[name="subject"]');
      if (subject && !subject.value.trim()) {
        subject.value = 'New message from your portfolio';
      }

      setLoading(true);
      var data = new FormData(form);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data
      })
        .then(function (res) { return res.json().then(function (json) { return { ok: res.ok, json: json }; }); })
        .then(function (result) {
          if (result.ok && result.json.success) {
            showStatus('success', 'Thanks for reaching out! Your message has been sent — I’ll get back to you soon.');
            form.reset();
          } else {
            showStatus('error', (result.json && result.json.message) || 'Something went wrong. Please try again.');
          }
        })
        .catch(function () {
          showStatus('error', 'Network error. Please try again, or email me directly at adrianne10160103@gmail.com.');
        })
        .then(function () { setLoading(false); });
    });
  }

  /* ---------- 12. INTERACTIVE HERO TERMINAL ---------- */
  function initTerminal() {
    var body = document.getElementById('terminal-body');
    var out = document.getElementById('terminal-output');
    var input = document.getElementById('terminal-input');
    if (!body || !out || !input) return;

    var RESUME = 'https://drive.google.com/file/d/1x_7AYeGqC6qgW58LmKxmk6UZzatjEWvC/view?usp=sharing';
    var LINKS = {
      github: 'https://github.com/Adrianne1001',
      linkedin: 'https://www.linkedin.com/in/ajbasuel/',
      resume: RESUME
    };
    var SECTIONS = {
      home: 'home', about: 'about', experience: 'experience', projects: 'portfolio',
      skills: 'skills', education: 'education', contact: 'contact'
    };
    var COMMANDS = ['help', 'whoami', 'ls', 'cd', 'experience', 'projects', 'skills',
      'education', 'contact', 'resume', 'github', 'linkedin', 'clear', 'sudo hire adrianne'];

    // The JSON intro is in the HTML so it shows without JS; keep a copy to replay.
    var introJson = out.querySelector('.t-json');
    var introHTML = introJson ? introJson.innerHTML : '';
    var history = [], hIndex = 0, introDone = false, introTimer = null;

    function line(html, cls) {
      var div = document.createElement('div');
      div.className = 't-line' + (cls ? ' ' + cls : '');
      div.innerHTML = html;
      out.appendChild(div);
      body.scrollTop = body.scrollHeight;
      return div;
    }
    function echo(cmd) {
      var div = line('<span class="t-prompt">$</span>');
      div.appendChild(document.createTextNode(cmd));
    }
    function jump(name) {
      return '<button type="button" class="t-link" data-jump="' + name + '">cd ' + name + '</button>';
    }
    function scrollToSection(name) {
      var el = document.getElementById(SECTIONS[name]);
      if (!el) return false;
      var nav = document.querySelector('.sticky-navigation');
      var top = el.getBoundingClientRect().top + window.pageYOffset - (nav ? nav.offsetHeight : 70) + 1;
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      return true;
    }
    function pad(s, n) { while (s.length < n) s += ' '; return s; }

    var handlers = {
      help: function () {
        var rows = [
          ['whoami', 'quick intro'], ['experience', 'work history'], ['projects', 'featured projects'],
          ['skills', 'core stack'], ['education', 'degrees and honors'], ['contact', 'how to reach me'],
          ['resume', 'open my resume'], ['github', 'open my GitHub'], ['linkedin', 'open my LinkedIn'],
          ['ls', 'list sections'], ['cd [section]', 'jump to a section'], ['clear', 'clear the screen']
        ];
        line('<span class="t-accent">Available commands:</span>');
        rows.forEach(function (r) { line('  ' + pad(r[0], 14) + '<span class="t-dim">' + r[1] + '</span>'); });
        line('<span class="t-dim">psst: hiring? try</span> <span class="t-ok">sudo hire adrianne</span>');
      },
      whoami: function () {
        line('Adrianne John Basuel, Acumatica ERP &amp; Full-Stack Developer.');
        line('<span class="t-dim">Davao City, PH · BS CpE Summa Cum Laude · MIS in progress</span>');
        line('Led 4 developers on Acumatica ERP work for multiple clients.');
      },
      experience: function () {
        line('<span class="t-accent">2025–2026</span>  Business Application Developer <span class="t-dim">@ Infosoft</span>');
        line('<span class="t-accent">2025</span>       Freelance Software Developer <span class="t-dim">@ CLIQUEHA</span>');
        line('<span class="t-accent">2024–2025</span>  Jr. Software Developer, Automation QA <span class="t-dim">@ Infosoft</span>');
        line('<span class="t-accent">2024</span>       IT Intern, Automation QA <span class="t-dim">@ Infosoft</span>');
        line('<span class="t-dim">details:</span> ' + jump('experience'));
      },
      projects: function () {
        line('<span class="t-ok">★</span> Client Project Tracker  <span class="t-dim">Laravel + Angular, 225 tests</span>');
        line('<span class="t-ok">★</span> BentaGo                 <span class="t-dim">Flutter, offline-first, Android + Windows</span>');
        line('<span class="t-ok">★</span> NMIS RTOC XI            <span class="t-dim">Leaflet.js maps, QR, dashboards</span>');
        line('<span class="t-dim">+ 11 more:</span> ' + jump('projects'));
      },
      skills: function () {
        line('<span class="j-key">erp</span>       Acumatica Cloud ERP, Report Designer, REST/OData');
        line('<span class="j-key">backend</span>   C#, ASP.NET Core/MVC, PHP Laravel');
        line('<span class="j-key">data</span>      MSSQL, MySQL, SQLite');
        line('<span class="j-key">frontend</span>  Angular, TypeScript, Flutter, React Native');
        line('<span class="t-dim">full list:</span> ' + jump('skills'));
      },
      education: function () {
        line('MIS, University of the Immaculate Conception <span class="t-dim">(in progress, GWA 1.2)</span>');
        line('BS Computer Engineering, University of Mindanao <span class="t-ok">Summa Cum Laude</span>');
        line('<span class="t-dim">certs and honors:</span> ' + jump('education'));
      },
      contact: function () {
        line('email     <a class="t-link" href="mailto:adrianne10160103@gmail.com">adrianne10160103@gmail.com</a>');
        line('phone     +63 976 539 3504');
        line('linkedin  <a class="t-link" href="' + LINKS.linkedin + '" target="_blank" rel="noopener">linkedin.com/in/ajbasuel</a>');
        line('<span class="t-dim">or use the form:</span> ' + jump('contact'));
      },
      ls: function () {
        line(Object.keys(SECTIONS).map(function (s) { return '<span class="t-accent">' + s + '/</span>'; }).join('  '));
      },
      clear: function () { out.innerHTML = ''; }
    };
    ['resume', 'github', 'linkedin'].forEach(function (k) {
      handlers[k] = function () {
        line('<span class="t-ok">opening</span> ' + k + ' in a new tab...');
        window.open(LINKS[k], '_blank', 'noopener');
      };
    });

    function hire() {
      line('<span class="t-dim">[sudo] password for recruiter: ********</span>');
      setTimeout(function () {
        line('<span class="t-ok">✔ Access granted.</span> Great choice!');
        line('Taking you to the contact form...');
        setTimeout(function () {
          scrollToSection('contact');
          var name = document.querySelector('#contact-form [name="name"]');
          if (name) setTimeout(function () { name.focus({ preventScroll: true }); }, reduceMotion ? 0 : 700);
        }, 500);
      }, reduceMotion ? 0 : 450);
    }

    function run(raw) {
      finishIntro();
      var cmd = raw.trim();
      echo(cmd);
      if (!cmd) return;
      history.push(cmd); hIndex = history.length;
      var lower = cmd.toLowerCase().replace(/\s+/g, ' ');
      var parts = lower.split(' ');

      if (lower === 'sudo hire adrianne' || lower === 'hire adrianne' || lower === 'hire') return hire();
      if (parts[0] === 'sudo') return line('<span class="t-err">Nice try.</span> The only sudo allowed here is <span class="t-ok">sudo hire adrianne</span>');
      if (parts[0] === 'cd') {
        var target = (parts[1] || '').replace(/\/$/, '');
        if (target === '~' || target === '') target = 'home';
        if (scrollToSection(target)) return line('<span class="t-dim">→ /' + target + '</span>');
        return line('<span class="t-err">cd: no such section:</span> ' + escapeHtml(parts[1]) + ' <span class="t-dim">(try ls)</span>');
      }
      if (parts[0] === 'rm') return line('<span class="t-err">Permission denied.</span> This portfolio is in production.');
      if (handlers[parts[0]]) return handlers[parts[0]]();
      line('<span class="t-err">command not found:</span> ' + escapeHtml(parts[0]) + '. Type <span class="t-ok">help</span> to see what I can do.');
    }

    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    function finishIntro() {
      if (introDone) return;
      introDone = true;
      clearTimeout(introTimer);
      out.innerHTML = '';
      line('<span class="t-prompt">$</span>curl -s localhost:8080/api/v1/developer');
      var pre = document.createElement('pre');
      pre.className = 't-json';
      pre.innerHTML = introHTML;
      out.appendChild(pre);
      line('<span class="t-dim">Type</span> <span class="t-ok">help</span> <span class="t-dim">to explore, or tap a command below.</span>');
    }

    // Typed intro: the command types out, then the JSON response streams in.
    function playIntro() {
      if (reduceMotion || !introHTML) return finishIntro();
      out.innerHTML = '';
      var cmdLine = line('<span class="t-prompt">$</span>');
      var text = 'curl -s localhost:8080/api/v1/developer';
      var i = 0;
      function typeCmd() {
        if (introDone) return;
        cmdLine.appendChild(document.createTextNode(text.charAt(i++)));
        if (i < text.length) introTimer = setTimeout(typeCmd, 38 + Math.random() * 40);
        else introTimer = setTimeout(streamJson, 380);
      }
      function streamJson() {
        if (introDone) return;
        var pre = document.createElement('pre');
        pre.className = 't-json';
        out.appendChild(pre);
        var rows = introHTML.split('\n'), r = 0;
        (function next() {
          if (introDone) return;
          pre.innerHTML += (r ? '\n' : '') + rows[r++];
          body.scrollTop = body.scrollHeight;
          if (r < rows.length) introTimer = setTimeout(next, 90);
          else introTimer = setTimeout(function () {
            if (introDone) return;
            introDone = true;
            line('<span class="t-dim">Type</span> <span class="t-ok">help</span> <span class="t-dim">to explore, or tap a command below.</span>');
          }, 250);
        })();
      }
      // Start once the preloader is gone so the visitor actually sees it.
      introTimer = setTimeout(typeCmd, 1100);
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var v = input.value; input.value = '';
        run(v);
      } else if (e.key === 'ArrowUp') {
        if (!history.length) return;
        e.preventDefault();
        hIndex = Math.max(0, hIndex - 1);
        input.value = history[hIndex];
      } else if (e.key === 'ArrowDown') {
        if (!history.length) return;
        e.preventDefault();
        hIndex = Math.min(history.length, hIndex + 1);
        input.value = history[hIndex] || '';
      } else if (e.key === 'Tab') {
        var v2 = input.value.toLowerCase();
        if (!v2) return;
        var match = COMMANDS.filter(function (c) { return c.indexOf(v2) === 0; });
        if (match.length) { e.preventDefault(); input.value = match[0]; }
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault(); out.innerHTML = '';
      }
    });

    // Click anywhere in the terminal to type (but let links/buttons work).
    body.addEventListener('click', function (e) {
      var j = e.target.closest && e.target.closest('[data-jump]');
      if (j) { scrollToSection(j.getAttribute('data-jump')); return; }
      if (e.target.closest && e.target.closest('a, button')) return;
      if (window.getSelection && String(window.getSelection())) return; // allow copying text
      input.focus({ preventScroll: true });
    });

    document.querySelectorAll('.terminal-hints [data-cmd]').forEach(function (btn) {
      btn.addEventListener('click', function () { run(btn.getAttribute('data-cmd')); });
    });

    playIntro();
  }

  function boot() {
    initPreloader();
    initParticles();
    initReveal();
    initProjectFilter();
    initTerminal();
    initTilt();
    initScrollUI();
    initCursor();
    initCounters();
    initTyping();
    initScrollSpy();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
