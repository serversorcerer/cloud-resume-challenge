# Design System — josephaleto.io ("The Operator's Console")

Global source of truth for the site redesign. Derived from the `ui-ux-pro-max`
skill (style, color, typography, landing, ux passes) and curated against the
project brief: away from AI-generated slop, toward a professional, sleek,
recruiter-converting personal brand. Page-specific overrides live in
`design-system/pages/`.

Generated query:
`senior cloud platform engineer AI infrastructure portfolio dark technical premium high-trust recruiter-facing`

## Decision summary

The skill's raw `--design-system` default (Liquid Glass + AI-purple `#7C3AED` +
masonry Portfolio Grid) was rejected on purpose: it is the exact generic-AI
aesthetic the brief forbids. The synthesized system below uses the skill's
stronger signals instead: Dark Mode (OLED) style, the Trust & Authority +
Conversion landing pattern, and a precision dark-cinema type system.

## Pattern (landing structure)

Single-page **Trust & Authority + Conversion** funnel. NOT a portfolio gallery.

Order: Hero (value prop + availability + primary CTA) -> Live proof (real
terminal + self-shipping pipeline) -> Capabilities -> Experience / Selected work
-> Contact CTA. One unmistakable primary CTA ("Let's talk" / email) repeated at
top, mid, and end. Verification links (GitHub, LinkedIn, CV) always one click away.

## Style

Refined dark, editorial-technical. Near-black canvas, generous whitespace, real
typographic hierarchy, hairline borders. The "operator" concept is expressed
through type and the real terminal, not sci-fi cosplay. Performance and
accessibility are treated as part of the brand (skill rated Dark/OLED as
Performance: Excellent, Accessibility: WCAG AAA).

## Color (single confident accent)

| Role | Hex | Token |
|------|-----|-------|
| Canvas (base) | `#04070a` | `--bg-0` |
| Surface 1 | `#0a0f15` | `--bg-1` |
| Surface 2 | `#0e151d` | `--bg-2` |
| Text | `#eef3f8` | `--text` |
| Muted text | `#9fb0bf` | `--muted` |
| Dim text | `#6b7c8a` | `--dim` |
| Hairline | `rgba(234,242,249,0.08)` | `--line` |
| Hairline strong | `rgba(234,242,249,0.16)` | `--line-strong` |
| **Accent (signature)** | `#ff9e2c` | `--accent` / `--signal` |
| Accent soft | `#ffc279` | `--accent-soft` |
| Accent press | `#e8861a` | `--accent-press` |
| Live / OK only | `#43d6a0` | `--ok` |
| Error (terminal) | `#ff6b6b` | `--err` |

Rules:
- ONE accent (amber `#ff9e2c`) for CTAs, links, kickers, active/hover, focus.
- Green (`--ok`) is reserved strictly for genuine live/status indicators
  (pulse dots, "LIVE" label, terminal success). Never decorative.
- No purple, no second blue/cyan accent, no gradient "blobs", no glassmorphism
  for its own sake. Borders are neutral hairlines, not glowing cyan.

## Typography

- Display / headings: **Space Grotesk** (600/700), tight tracking on large sizes
  (`-0.03em` on hero display, `-0.02em` on H2).
- Body: **Inter** (400/500/600), line-height ~1.65.
- Mono / labels / telemetry / terminal: **JetBrains Mono** (400/500/700),
  uppercase + wide tracking for kickers and labels.

Scale (clamp): hero `clamp(2.7rem,7vw,5.2rem)` / H2 `clamp(2rem,4.4vw,3.1rem)` /
H3 ~1.3rem / body 1rem / label 0.72-0.8rem.

## Effects & motion (restraint)

- Easing: ease-out on enter, ease-in on exit. No linear UI transitions.
- 1-2 animated elements per viewport maximum. No animate-everything.
- All GSAP ScrollTrigger choreography gated behind `prefers-reduced-motion`.
- z-index scale: content 1-10, nav 100, skip-link 200, cursor 300, toast 400.
- Lazy-load below-the-fold media; defer non-critical JS.
- WebGL hero is cheap (capped DPR, paused off-screen) with a static fallback and
  a static frame under reduced motion. Mesh is neutral slate, signals are amber.

## Anti-patterns to avoid (from skill + brief)

- AI-purple, glassmorphism for its own sake, gradient blobs.
- Accent-color soup (the old cyan + blue + amber + green mix).
- Sci-fi HUD clutter: corner brackets, scanlines, glitch, telemetry noise.
- "Fast" janky animations; decorative infinite animations.
- Fake/rounded vanity metrics. Every claim backed by something real.
- Em-dashes in copy.

## Conversion checklist

- [ ] Above the fold (375px + 1366px): who, what, level, "open to work", one CTA.
- [ ] Primary CTA repeated top / mid / end; mailto + copy-email both work.
- [ ] Strongest proof (live terminal, self-shipping pipeline) kept high.
- [ ] GitHub / LinkedIn / CV reachable in one click.

## Accessibility / quality gates

- [ ] Body text contrast >= 4.5:1; large text >= 3:1 on dark.
- [ ] Visible focus rings (amber) on all interactive elements.
- [ ] `prefers-reduced-motion` respected end to end.
- [ ] Keyboard nav + skip-link + semantic landmarks intact.
- [ ] No horizontal scroll at 375 / 768 / 1366 / large desktop.
- [ ] SEO preserved: title, meta description, canonical, OG, Twitter, JSON-LD.
