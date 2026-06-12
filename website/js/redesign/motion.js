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
      'pipeline: github-actions · last deploy: green',
      'iac: terraform · drift: none detected',
      'agents: 4 online · queue: empty',
      'lambda: warm · dynamodb: PAY_PER_REQUEST',
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

  /* ---------- Origin: pinned three-beat scene ---------- */
  const origin = document.querySelector('.origin');
  const beats = gsap.utils.toArray('.origin-beat');
  if (origin && beats.length === 3) {
    origin.classList.add('motion');
    gsap.set(beats, { autoAlpha: 0, y: 30 });

    gsap.timeline({
      scrollTrigger: {
        trigger: '.origin-pin',
        start: 'top top',
        end: '+=220%',
        pin: true,
        scrub: 0.6,
      },
    })
      .to(beats[0], { autoAlpha: 1, y: 0, duration: 1 })
      .to(beats[0], { autoAlpha: 0, y: -30, duration: 1 }, '+=1')
      .to(beats[1], { autoAlpha: 1, y: 0, duration: 1 })
      .to(beats[1], { autoAlpha: 0, y: -30, duration: 1 }, '+=1')
      .to(beats[2], { autoAlpha: 1, y: 0, duration: 1 })
      .to(beats[2], { scale: 1.04, duration: 1.2 });
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
