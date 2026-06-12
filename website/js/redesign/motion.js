// Motion system — GSAP + ScrollTrigger scene direction.
// Everything is progressive enhancement: without JS (or with reduced motion)
// the page is fully readable; this file only adds choreography.
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Telemetry ticker (cheap, runs even without GSAP) ---------- */
  const telemetry = document.getElementById('telemetryLine');
  if (telemetry && !reducedMotion) {
    const lines = [
      'region: us-east-1 · edge: cloudfront · state: nominal',
      'pipeline: github-actions · deploys on merge',
      'iac: terraform · everything reviewable',
      'lambda: warm · dynamodb: pay-per-request',
    ];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % lines.length;
      telemetry.style.opacity = '0';
      setTimeout(() => {
        telemetry.textContent = lines[i];
        telemetry.style.opacity = '0.85';
      }, 300);
    }, 4200);
    telemetry.style.transition = 'opacity 0.3s ease';
  }

  /* ---------- Custom cursor ---------- */
  const dot = document.getElementById('cursorDot');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (dot && finePointer && !reducedMotion) {
    document.body.classList.add('has-cursor');
    let x = 0, y = 0, cx = 0, cy = 0;
    window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
    (function follow() {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      dot.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(follow);
    })();
    document.querySelectorAll('a, button, .chip, #terminal').forEach((el) => {
      el.addEventListener('pointerenter', () => dot.classList.add('on-link'));
      el.addEventListener('pointerleave', () => dot.classList.remove('on-link'));
    });
  }

  /* ---------- Telemetry ticker: real data only, items appear as they load ---------- */
  const tickerTrack = document.getElementById('tickerTrack');
  if (tickerTrack) {
    // Duplicate items first so the -50% translate loops seamlessly;
    // setTick() updates every copy by class, so late data lands in both halves.
    if (!reducedMotion) tickerTrack.innerHTML += tickerTrack.innerHTML;

    const setTick = (name, text) => {
      document.querySelectorAll(`[data-tick="${name}"]`).forEach((el) => {
        el.textContent = text;
        el.classList.remove('tick-pending');
      });
    };

    // Visitors + latency are produced by other modules; poll briefly until present
    const sync = setInterval(() => {
      const visitors = document.querySelector('.counter-number')?.textContent.trim();
      const latency = document.getElementById('apiLatency')?.textContent.trim();
      if (visitors && visitors !== '—') setTick('visitors', `visitors: ${visitors}`);
      if (latency && latency.includes('ms')) setTick('latency', `api latency: ${latency}`);
    }, 1200);
    setTimeout(() => clearInterval(sync), 30000);

    // Last deploy + pipeline state straight from the GitHub API (public, unauthenticated)
    fetch('https://api.github.com/repos/serversorcerer/cloud-resume-challenge/commits/main')
      .then((r) => r.json())
      .then((data) => {
        const when = new Date(data?.commit?.committer?.date);
        if (!isNaN(when)) {
          const hrs = Math.max(0, Math.round((Date.now() - when) / 36e5));
          setTick('deploy', `last deploy: ${hrs < 1 ? '<1h' : hrs < 48 ? hrs + 'h' : Math.round(hrs / 24) + 'd'} ago`);
        }
      })
      .catch(() => {});

    fetch('https://api.github.com/repos/serversorcerer/cloud-resume-challenge/actions/runs?branch=main&per_page=1')
      .then((r) => r.json())
      .then((data) => {
        const run = data?.workflow_runs?.[0];
        if (run?.conclusion === 'success') setTick('pipeline', 'pipeline: green');
        else if (run?.status === 'in_progress') setTick('pipeline', 'pipeline: deploying');
      })
      .catch(() => {});
  }

  /* ---------- Copy email + toast ---------- */
  const copyBtn = document.getElementById('copyEmail');
  const toast = document.getElementById('toast');
  if (copyBtn && toast) {
    let toastTimer;
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('joe@josephaleto.io');
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
      } catch {
        window.location.href = 'mailto:joe@josephaleto.io';
      }
    });
  }

  /* ---------- Pipeline final state under reduced motion ---------- */
  if (reducedMotion || typeof gsap === 'undefined') {
    document.querySelectorAll('.pipe-stage').forEach((s) => s.classList.add('lit'));
    const pulse = document.getElementById('pipePulse');
    if (pulse) pulse.style.strokeDashoffset = '0';
  }

  /* ---------- Nav hide-on-scroll ---------- */
  const nav = document.getElementById('hudNav');
  if (nav) {
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      const yNow = window.scrollY;
      nav.classList.toggle('nav-hidden', yNow > lastY && yNow > 140);
      lastY = yNow;
    }, { passive: true });
  }

  if (reducedMotion || typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Split helper (SplitText is a paid plugin — this is ours) ---------- */
  function splitWords(el) {
    const segments = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = segments
      .map((seg) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = seg;
        const words = (tmp.textContent || '').trim().split(/\s+/);
        // Preserve <em> highlighting by re-wrapping word-by-word
        const emText = (tmp.querySelector('em')?.textContent || '').trim();
        const emWords = new Set(emText.split(/\s+/).filter(Boolean));
        const inner = words
          .map((w) => {
            const word = `<span class="split-word">${w}&nbsp;</span>`;
            return emWords.has(w.replace(/[.,]/g, '')) || emWords.has(w)
              ? `<em>${word}</em>`
              : word;
          })
          .join('');
        return `<span class="split-line">${inner}</span>`;
      })
      .join('');
    return el.querySelectorAll('.split-word');
  }

  /* ---------- Hero intro ---------- */
  const heroTitle = document.querySelector('.hero-title[data-split]');
  if (heroTitle) {
    const words = splitWords(heroTitle);
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.status-chip', { y: 18, autoAlpha: 0, duration: 0.6, delay: 0.15 })
      .from(words, { yPercent: 110, duration: 0.9, stagger: 0.05 }, '-=0.25')
      .from('.hero-sub', { y: 24, autoAlpha: 0, duration: 0.7 }, '-=0.45')
      .from('.hero-ctas .btn', { y: 20, autoAlpha: 0, duration: 0.55, stagger: 0.1 }, '-=0.4')
      .from('.hero-meta li', { y: 14, autoAlpha: 0, duration: 0.45, stagger: 0.07 }, '-=0.35')
      .from('.scroll-cue', { autoAlpha: 0, duration: 0.6 }, '-=0.2');
  }

  /* ---------- Section headline splits ---------- */
  document.querySelectorAll('h2[data-split]').forEach((h2) => {
    const words = splitWords(h2);
    gsap.from(words, {
      yPercent: 110,
      duration: 0.7,
      stagger: 0.04,
      ease: 'power3.out',
      scrollTrigger: { trigger: h2, start: 'top 82%' },
    });
  });

  /* ---------- Generic rises + cards ---------- */
  document.querySelectorAll('[data-anim="rise"]').forEach((el) => {
    if (el.closest('.hero')) return; // hero handled by intro timeline
    gsap.from(el, {
      y: 26, autoAlpha: 0, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  document.querySelectorAll('.build-grid, .work-grid, .skill-clusters').forEach((grid) => {
    gsap.from(grid.querySelectorAll('[data-anim="card"]'), {
      y: 36, autoAlpha: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: grid, start: 'top 80%' },
    });
  });

  /* ---------- Operator section: rule rows cascade in ---------- */
  const ruleRows = gsap.utils.toArray('.rules-list li');
  if (ruleRows.length) {
    gsap.from(ruleRows, {
      x: 26, autoAlpha: 0, duration: 0.55, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: '.origin-rules', start: 'top 80%' },
    });
  }

  /* ---------- Experience spine draw + items ---------- */
  const spine = document.getElementById('spineLine');
  if (spine) {
    gsap.fromTo(spine,
      { scaleY: 0, transformOrigin: 'top' },
      {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.timeline', start: 'top 75%', end: 'bottom 60%', scrub: 0.5 },
      });
  }
  document.querySelectorAll('[data-anim="t-item"]').forEach((item) => {
    gsap.from(item, {
      x: -30, autoAlpha: 0, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: item, start: 'top 82%' },
    });
  });

  /* ---------- Pipeline: pulse travels the pipe, stages light up ---------- */
  const pipePulse = document.getElementById('pipePulse');
  if (pipePulse) {
    const stages = gsap.utils.toArray('.pipe-stage');
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.pipe-wrap',
        start: 'top 78%',
        end: 'bottom 45%',
        scrub: 0.6,
      },
    });
    tl.to(pipePulse, { strokeDashoffset: 0, ease: 'none', duration: 1 });
    stages.forEach((stage, i) => {
      tl.add(() => stage.classList.toggle('lit', tl.progress() >= i / (stages.length - 1) - 0.01),
        (i / (stages.length - 1)) * 0.98);
    });
    // Ensure final state when scrolled fully past
    ScrollTrigger.create({
      trigger: '.pipe-wrap',
      start: 'bottom 45%',
      onEnter: () => stages.forEach((s) => s.classList.add('lit')),
    });
  }

  /* ---------- Terminal shell reveal ---------- */
  const shell = document.getElementById('terminalShell');
  if (shell) {
    gsap.from(shell, {
      y: 50, autoAlpha: 0, scale: 0.985, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: shell, start: 'top 80%' },
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer) {
    document.querySelectorAll('[data-magnetic]').forEach((btn) => {
      const strength = 18;
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const mx = ((e.clientX - r.left) / r.width - 0.5) * strength;
        const my = ((e.clientY - r.top) / r.height - 0.5) * strength;
        gsap.to(btn, { x: mx, y: my, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('pointerleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.45, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }
})();
