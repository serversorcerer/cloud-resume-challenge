// Live terminal — same API contract as before (POST {command} → text),
// evolved with agent-era commands and a cinematic boot sequence.
// Backend: API Gateway → Lambda → DynamoDB (us-east-1). Do not break it.
(() => {
  const terminalContent = document.getElementById('terminal-content');
  const terminalInput = document.getElementById('terminal-input');
  const terminalWrapper = document.getElementById('terminal');
  const terminalSuggestion = document.getElementById('terminal-suggestion');
  const typedText = document.getElementById('typedText');
  if (!terminalContent || !terminalInput || !terminalWrapper) return;

  const API_URL = window.SITE_CONFIG && window.SITE_CONFIG.TERMINAL_API_URL;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Single-accent palette: warm amber for prompts/headers, green for success only.
  const C = { ok: '#43d6a0', cyan: '#ffc279', dim: '#93a7b8', err: '#ff6b6b', signal: '#ff9e2c' };

  function scrollToBottom() {
    terminalWrapper.scrollTo({ top: terminalWrapper.scrollHeight, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  function print(text, color = C.ok, html = false) {
    const div = document.createElement('div');
    if (html) div.innerHTML = text;
    else { div.textContent = text; div.style.color = color; }
    div.style.whiteSpace = 'pre-wrap';
    terminalContent.appendChild(div);
    scrollToBottom();
    return div;
  }

  function printEcho(input) {
    const div = document.createElement('div');
    div.innerHTML = `<span style="color:${C.cyan};">$</span> <span style="color:#d8f4ff;"></span>`;
    div.querySelector('span:last-child').textContent = input;
    terminalContent.appendChild(div);
  }

  /* ---------- Boot sequence (runs once, when scrolled into view) ---------- */
  const bootLines = [
    ['[ok] mounting /dev/career …', C.dim],
    ['[ok] lambda runtime warm · api gateway nominal', C.dim],
    ['[ok] dynamodb table reachable · us-east-1', C.dim],
    ['joe@josephaleto.io · live AWS terminal', C.cyan],
    ['Type "help" to explore. Try "agents" or "status".', C.ok],
  ];
  let booted = false;

  function boot() {
    if (booted) return;
    booted = true;
    if (reducedMotion) {
      bootLines.forEach(([line, color]) => print(line, color));
      probeLatency();
      return;
    }
    let i = 0;
    (function next() {
      if (i >= bootLines.length) { probeLatency(); return; }
      const [line, color] = bootLines[i++];
      print(line, color);
      setTimeout(next, 180 + Math.random() * 220);
    })();
  }

  new IntersectionObserver(([entry], obs) => {
    if (entry.isIntersecting) { boot(); obs.disconnect(); }
  }, { threshold: 0.35 }).observe(terminalWrapper);

  // Probe immediately so the telemetry ticker has real latency without
  // waiting for the visitor to reach the terminal.
  probeLatency();

  /* ---------- Real latency probe (also feeds the footnote) ---------- */
  async function probeLatency(report = false) {
    if (!API_URL) return null;
    const t0 = performance.now();
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'motd' }),
      });
      const ms = Math.round(performance.now() - t0);
      const el = document.getElementById('apiLatency');
      if (el) el.textContent = `${ms}ms`;
      if (report) return { ok: res.ok, ms };
      return null;
    } catch {
      if (report) return { ok: false, ms: null };
      return null;
    }
  }

  /* ---------- Backend round-trip ---------- */
  async function executeCommand(cmd) {
    if (!API_URL) return 'Terminal API not configured.';
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });
      return await res.text();
    } catch (err) {
      console.error(err);
      return 'Error processing command';
    }
  }

  /* ---------- Command catalog ---------- */
  const commandList = [
    'help', 'aws s3 ls', 'view counter', 'terraform apply', 'motd', 'whoami', 'bio',
    'experience', 'skills', 'resume', 'linkedin', 'github', 'email', 'projects',
    'projects cloud-terminal', 'projects cosmos', 'projects cloud-resume', 'projects terraform',
    'stack', 'architecture', 'quote', 'offer', 'clear', 'exit', 'source code',
    'agents', 'automate', 'status', 'deploy', 'hire', 'blackjack', 'joker mode', 'professional mode',
  ];

  const openCommands = {
    'resume': 'https://josephaletoresume.s3.amazonaws.com/joseph-leto-soultions-architect.pdf',
    'linkedin': 'https://www.linkedin.com/in/joseph-leto/',
    'github': 'https://github.com/serversorcerer',
    'email': 'mailto:joe@josephaleto.io',
    'source code': 'https://github.com/serversorcerer/cloud-resume-challenge',
    'blackjack': 'https://josephaleto.io/blackjack.html',
  };

  /* ---------- New client-side commands (agent era) ---------- */
  const localCommands = {
    'agents': () => print(
`AGENT ROSTER · self-hosted, production-deployed
────────────────────────────────────────────────
  ops-gateway    self-hosted AI agent on a hardened VPS
                 discord-driven: research, jobs, server ops
  n8n-pipelines  workflow automation: research → publish → notify
  llm-tooling    least-privilege agents wired to live APIs
  this-site      the terminal you're typing into, lambda-backed

Agents with real hands: terminal, files, browser, memory.
Type "automate" for the automation story.`, C.ok),

    'automate': () => print(
`AUTOMATION DOCTRINE
────────────────────────────────────────────────
  if it happens twice     → it gets a pipeline
  security feedback       → on every change, before prod
  deployment gates        → block risk, not people
  compliance evidence     → generated, never assembled
  this site               → deploys itself on git push

Humans for judgment. Machines for repetition.`, C.ok),

    'status': async () => {
      print('probing live infrastructure…', C.dim);
      const result = await probeLatency(true);
      if (result && result.ok) {
        print(
`SYSTEM STATUS · all green
  api gateway   ONLINE   (${result.ms}ms round-trip)
  lambda        WARM
  dynamodb      REACHABLE (us-east-1)
  cloudfront    SERVING THIS PAGE
  operator      AVAILABLE FOR SENIOR ROLES`, C.ok);
      } else {
        print('api unreachable. even good systems have bad days. try again.', C.err);
      }
    },

    'hire': () => {
      print(
`HIRING JOE · quick brief
────────────────────────────────────────────────
  role targets   senior platform · ai infrastructure
                 solutions architect · automation lead
  focus          multi-account AWS · CI/CD platforms
                 AI agents with real hands
  receipts       this terminal · the pipeline that shipped it
  availability   OPEN · direct line below

  → joe@josephaleto.io`, C.signal);
      window.open('mailto:joe@josephaleto.io', '_blank');
    },

    'deploy': () => {
      const lines = [
        ['[simulation] replaying the real pipeline…', C.dim],
        ['→ git push origin main', C.cyan],
        ['→ github actions: lint ✓ · tests ✓ · audit ✓', C.cyan],
        ['→ aws s3 sync website/ s3://josephaleto.io --delete', C.cyan],
        ['→ cloudfront invalidation /* created', C.cyan],
        ['✓ deployed. this exact flow shipped the page you are reading.', C.ok],
      ];
      let i = 0;
      (function next() {
        if (i >= lines.length) return;
        const [l, c] = lines[i++];
        print(l, c);
        setTimeout(next, reducedMotion ? 0 : 320);
      })();
    },
  };

  /* ---------- Theme easter eggs (kept from v1) ---------- */
  function setAccent(cyan, bright) {
    document.documentElement.style.setProperty('--cyan', cyan);
    document.documentElement.style.setProperty('--cyan-bright', bright);
  }
  localCommands['joker mode'] = () => {
    setAccent('#ff4fd8', '#ff8ae8');
    print('Wake up, Neo… (accent: joker)', '#ff8ae8');
  };
  localCommands['professional mode'] = () => {
    setAccent('#ff9e2c', '#ffc279');
    print('Professional mode activated.', C.ok);
  };

  /* ---------- Offer flow (lead capture — unchanged contract) ---------- */
  let offerState = null;
  let offer = { name: '', email: '', company: '', message: '' };

  async function handleOfferStep(input) {
    if (offerState === 'name') {
      offer.name = input;
      offerState = 'email';
      print('Enter your email:', C.ok);
    } else if (offerState === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
        print('Invalid email. Try again:', C.err);
        return;
      }
      offer.email = input;
      offerState = 'company';
      print('Enter your company (optional):', C.ok);
    } else if (offerState === 'company') {
      offer.company = input;
      offerState = 'message';
      print('Enter your message (optional):', C.ok);
    } else if (offerState === 'message') {
      offer.message = input;
      offerState = null;
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: 'offer', ...offer }),
        });
        print(res.ok ? '✅ Offer sent! Joe will get back to you.' : await res.text(),
          res.ok ? C.ok : C.err);
      } catch {
        print('Error sending offer', C.err);
      }
    }
  }

  /* ---------- Input plumbing ---------- */
  let commandHistory = [];
  let historyIndex = -1;

  function mirror() { if (typedText) typedText.textContent = terminalInput.value; }
  function clearInput() { terminalInput.value = ''; mirror(); }

  terminalInput.addEventListener('input', () => {
    mirror();
    const val = terminalInput.value.trim().toLowerCase();
    if (!val) { terminalSuggestion.style.display = 'none'; return; }
    let matches = commandList.filter((c) => c.startsWith(val));
    if (!matches.length) matches = commandList.filter((c) => c.includes(val));
    if (matches.length && matches[0].toLowerCase() !== val) {
      terminalSuggestion.style.display = 'block';
      terminalSuggestion.textContent = matches[0];
    } else {
      terminalSuggestion.style.display = 'none';
    }
  });

  terminalInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const val = terminalInput.value.trim().toLowerCase();
      let matches = commandList.filter((c) => c.startsWith(val));
      if (!matches.length) matches = commandList.filter((c) => c.includes(val));
      if (matches.length) {
        terminalInput.value = matches[0];
        mirror();
        terminalSuggestion.style.display = 'none';
      }
      return;
    }

    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (!commandHistory.length) return;
      historyIndex = e.key === 'ArrowUp'
        ? (historyIndex <= 0 ? commandHistory.length - 1 : historyIndex - 1)
        : (historyIndex >= commandHistory.length - 1 ? 0 : historyIndex + 1);
      terminalInput.value = commandHistory[historyIndex];
      mirror();
      return;
    }

    if (e.key !== 'Enter') return;

    const input = terminalInput.value.trim();
    if (!input) return;
    terminalSuggestion.style.display = 'none';
    clearInput();
    await submit(input);
  });

  async function submit(input) {
    commandHistory.push(input);
    historyIndex = commandHistory.length;
    printEcho(input);

    const cmd = input.toLowerCase();

    // Track the command keyword only (never offer-flow free text / PII)
    if (!offerState && window.siteTrack) {
      window.siteTrack('terminal_command', { cmd: cmd.split(/\s+/)[0].slice(0, 40) });
    }

    // Mid-offer-flow input
    if (offerState) {
      if (cmd === 'clear' || cmd === 'exit') {
        offerState = null;
        offer = { name: '', email: '', company: '', message: '' };
        const resp = await executeCommand(cmd);
        if (resp === '__CLEAR__') fadeClear();
        else print(resp, C.ok);
      } else {
        await handleOfferStep(input);
      }
      scrollToBottom();
      return;
    }

    if (cmd === 'offer') {
      offerState = 'name';
      offer = { name: '', email: '', company: '', message: '' };
      print('Enter your name:', C.ok);
      return;
    }

    if (localCommands[cmd]) { await localCommands[cmd](); return; }

    if (openCommands[cmd]) {
      window.open(openCommands[cmd], '_blank', 'noopener');
      print(`Opening ${cmd}…`, C.ok);
      return;
    }

    if (cmd === 'view counter') {
      const count = document.querySelector('.counter-number')?.textContent.trim() || 'Unknown';
      print(`Total views: ${count}`, C.ok);
      return;
    }

    // Mobile architecture: render local image instead of backend text art
    if (cmd === 'architecture' && window.innerWidth < 768) {
      print('<img src="images/architecture.png" alt="Cloud architecture diagram">', C.ok, true);
      return;
    }

    // Everything else → live backend
    const resp = await executeCommand(input);
    if (resp === '__CLEAR__') { fadeClear(); return; }

    // Backend responses may contain markup (links, images) — same trust
    // model as v1: our own Lambda is the only source.
    const out = document.createElement('div');
    if (resp.includes('<img')) {
      out.innerHTML = resp;
    } else {
      out.innerHTML = `<pre>${resp}</pre>`;
    }
    out.querySelectorAll('a').forEach((a) => {
      a.target = '_blank';
      a.rel = 'noopener';
    });
    terminalContent.appendChild(out);
    scrollToBottom();
  }

  function fadeClear() {
    terminalContent.classList.add('terminal-fade');
    setTimeout(() => {
      terminalContent.innerHTML = '';
      terminalContent.classList.remove('terminal-fade');
    }, reducedMotion ? 0 : 450);
  }

  // Focus input when clicking anywhere in the terminal
  terminalWrapper.addEventListener('click', (e) => {
    if (e.target !== terminalInput) terminalInput.focus({ preventScroll: true });
  });
  terminalInput.addEventListener('focus', scrollToBottom);

  /* ---------- Attract mode: the terminal demos itself once ---------- */
  let userTouched = false;
  terminalInput.addEventListener('keydown', () => { userTouched = true; }, { once: true });
  terminalWrapper.addEventListener('pointerdown', () => { userTouched = true; }, { once: true });

  const origBoot = boot;
  boot = function bootWithAttract() {
    origBoot();
    if (reducedMotion) return;
    setTimeout(() => {
      if (userTouched || !API_URL) return;
      const demo = 'whoami';
      let i = 0;
      (function typeChar() {
        if (userTouched) { if (typedText) typedText.textContent = ''; return; }
        if (i < demo.length) {
          if (typedText) typedText.textContent = demo.slice(0, ++i);
          setTimeout(typeChar, 90 + Math.random() * 80);
        } else {
          setTimeout(() => {
            if (userTouched) { if (typedText) typedText.textContent = ''; return; }
            if (typedText) typedText.textContent = '';
            submit(demo);
          }, 350);
        }
      })();
    }, 2600);
  };
})();
