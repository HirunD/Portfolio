// Pure HTML templates. tools/build.mjs runs these to write index.html, so the
// page ships pre-rendered; js/main.js only adds behaviour on top.

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

// Unfilled config values render as an obvious highlighted placeholder.
const ph = (v, label = 'X') =>
  v === null || v === undefined || v === ''
    ? `<span class="ph" title="Placeholder: set this in src/content.js">[${esc(label)}]</span>`
    : esc(v);

const fill = (tpl, map) => esc(tpl).replace(/\{(\w+)\}/g, (_, k) => (k in map ? map[k] : `{${k}}`));

const two = (n) => String(n).padStart(2, '0');

const icon = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>',
  out: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" fill="currentColor"/></svg>',
  chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" fill="currentColor"/></svg>',
  share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 5l7 7-7 7v-4c-5 0-8 1.5-10 5 1-6 4-10 10-10z" fill="currentColor"/></svg>',
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3zm4.6 12.6c-.2.6-1.1 1.1-1.6 1.2-.4 0-.9.2-3-.6-2.5-1-4.1-3.6-4.2-3.8-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.3.5-.3.6-.3h.5c.1 0 .4 0 .6.4l.8 2c.1.2.1.3 0 .5l-.4.5c-.1.2-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1.9 2 1.2 2.2 1.4.3.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l1.9.9c.2.1.4.2.4.3.1.1.1.6-.1 1.1z" fill="currentColor"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v12H3z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m3 7 9 6 9-6" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v14H4zM4 10h16M8 3v5M16 3v5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
};

export function createRenderer(c) {
  const base = c.site.base;
  const asset = (p) => `${base}assets/${p}`;

  // ── media ────────────────────────────────────────────────────────────────
  const slate = (label, kind = 'CLIP') =>
    `<div class="slate" role="img" aria-label="Placeholder: ${esc(label)}">
      <span class="slate__off">MEDIA OFFLINE</span>
      <span class="slate__file">[${kind}: ${esc(label)}]</span>
    </div>`;

  const video = (src, label, poster = src) =>
    `<video class="lazy-video" muted loop playsinline preload="none" aria-label="${esc(label)}"
      poster="${asset(`posters/${poster}.webp`)}">
      <source data-src="${asset(`video/${src}.mp4`)}" type="video/mp4">
      <source data-src="${asset(`video/${src}.webm`)}" type="video/webm">
    </video>`;

  const media = (m, kind) => (m && m.src ? video(m.src, m.label) : slate(m ? m.label : 'missing', kind));

  const phone = (inner, cls = '') =>
    `<div class="phone ${cls}"><div class="phone__screen">${inner}</div></div>`;

  const clipHead = (n, name) =>
    `<header class="clip-head" data-reveal>
      <span class="clip-head__id">CLIP ${two(n)}</span>
      <span class="clip-head__name">${esc(name)}</span>
      <span class="clip-head__tc" data-tc-in aria-hidden="true">IN --:--:--:--</span>
    </header>`;

  // ── CLIP: open ───────────────────────────────────────────────────────────
  const hero = (n) => {
    const h = c.hero;
    return `
    <div class="hero__grid wrap">
      <div class="hero__copy">
        <p class="hero__label mono"><span class="rec-dot" aria-hidden="true"></span>${esc(h.label)}</p>
        <h1 class="hero__title" id="clip-${n}-title">
          <span class="line">${esc(h.headline[0])}</span>
          <span class="line line--accent">${esc(h.headline[1])}</span>
        </h1>
        <p class="hero__sub">${esc(h.sub)}</p>
        <a class="link mono hero__home" href="${esc(c.sender.portfolio)}">${esc(c.sender.portfolio.replace(/^https?:\/\//, '').replace(/\/$/, ''))} ${icon.out}</a>
      </div>
      <div class="hero__media">
        ${phone(media(h.reel), 'phone--hero')}
        <span class="frame-tag mono" aria-hidden="true">9:16 · 25 FPS · MUTED</span>
      </div>
    </div>
    <a class="cue mono" href="#clip-01"><span class="cue__head" aria-hidden="true"></span>${esc(h.cue)} ${icon.play}</a>`;
  };

  // ── CLIP: the gap ────────────────────────────────────────────────────────
  // One phone screen with four stacked scenes; main.js scrubs between them.
  const gapScreen = () => {
    const g = c.gap;
    const s = g.site;
    return `
    <div class="scene scene--reel">
      <div class="reel-bg"><i></i><i></i><i></i></div>
      <div class="reel-sub">${g.reelCaption.map((w) => `<span>${esc(w)}</span>`).join('')}</div>
      <div class="reel-top"><span>Following</span><b>For You</b></div>
      <div class="reel-rail">
        <span class="reel-avatar" data-tap="avatar"></span>
        <span>${icon.heart}</span><span>${icon.chat}</span><span>${icon.share}</span>
      </div>
      <div class="reel-meta"><b>${esc(g.handle)}</b><i></i><i></i></div>
      <div class="reel-views">${icon.play}<span class="views-count">${esc(c.stats.reelViews.label)}</span><small>views</small></div>
    </div>
    <div class="scene scene--profile">
      <div class="pf-head"><span>‹</span><b>${esc(g.handle.replace('@', ''))}</b><span>···</span></div>
      <div class="pf-row"><span class="pf-avatar"></span>
        <span class="pf-stat"><i></i><small>posts</small></span>
        <span class="pf-stat"><i></i><small>followers</small></span>
        <span class="pf-stat"><i></i><small>following</small></span>
      </div>
      <div class="pf-bio"><i></i><i></i></div>
      <div class="pf-link" data-tap="link">🔗 ${esc(g.bioLink)}</div>
      <div class="pf-btns"><span>Follow</span><span>Message</span></div>
      <div class="pf-grid">${'<i></i>'.repeat(9)}</div>
    </div>
    <div class="scene scene--bio">
      <span class="bio-avatar"></span>
      <span class="bio-name">${esc(g.handle)}</span>
      ${g.bioButtons.map((b) => `<span class="bio-btn">${esc(b)}</span>`).join('')}
      <span class="bio-foot">free link-in-bio template</span>
    </div>
    <div class="scene scene--site">
      <div class="st-nav" data-layer="nav"><b>${esc(s.brand)}</b><span class="st-burger"><i></i><i></i></span></div>
      <div class="st-hero" data-layer="hero"><small>${esc(s.kicker)}</small><strong>${esc(s.headline)}</strong></div>
      <div class="st-photo" data-layer="photo"><span></span></div>
      <div class="st-creds" data-layer="creds">${s.creds.map((x) => `<span><i></i>${esc(x)}</span>`).join('')}</div>
      <div class="st-logos" data-layer="logos"><small>${esc(s.logosLabel)}</small><span><i></i><i></i><i></i><i></i></span></div>
      <div class="st-cta" data-layer="cta">${esc(s.cta)} →</div>
    </div>
    <div class="touch" aria-hidden="true"><i></i></div>`;
  };

  const layerTrack = () => {
    const rows = [['V5', 'CTA', 'cta'], ['V4', 'LOGOS', 'logos'], ['V3', 'CREDS', 'creds'], ['V2', 'PHOTO', 'photo'], ['V1', 'HERO', 'hero']];
    return `
    <div class="ltrack" aria-hidden="true">
      <div class="ltrack__head mono"><span>SEQ — LANDING_v1</span><span class="ltrack__tc">00:00:00:00</span></div>
      ${rows.map(([t, n, k]) => `<div class="ltrack__row"><span class="mono">${t}</span><span class="ltrack__lane"><i data-bar="${k}">${n}</i></span></div>`).join('')}
      <span class="ltrack__phwrap"><span class="ltrack__ph"></span></span>
    </div>`;
  };

  const gap = (n) => {
    const g = c.gap;
    const desc = 'Animated phone: a reel passes 53.9M views, a viewer taps the profile and the link in bio, lands on a plain link page, then a polished founder landing page builds itself layer by layer.';
    return `
    <div class="gap__sticky">
      <div class="gap__stage wrap">
        <div class="gap__copy">
          <h2 class="h2" id="clip-${n}-title">${esc(g.title)}</h2>
          <ol class="gap__steps">
            ${g.steps
              .map((st, i) => `<li class="gap__step${st.strong ? ' gap__step--strong' : ''}" data-step="${i}">${esc(st.text)}${st.note ? `<small class="mono">${esc(st.note)}</small>` : ''}</li>`)
              .join('')}
          </ol>
        </div>
        <div class="gap__device">
          <div role="img" aria-label="${esc(desc)}">${phone(gapScreen(), 'phone--gap')}</div>
          ${layerTrack()}
        </div>
      </div>
    </div>
    <div class="gap__frames wrap" aria-hidden="true">
      <p class="mono gap__frames-note">${esc(g.reducedMotionNote)}</p>
      <div class="gap__frames-row">
        ${['reel', 'bio', 'site']
          .map((k, i) => `<figure>${phone(gapScreen(), `phone--frame`).replace('class="phone ', `data-scene="${k}" class="phone `)}<figcaption class="mono">FRAME ${two(i + 1)}</figcaption></figure>`)
          .join('')}
      </div>
    </div>`;
  };

  // ── CLIP: three layers ───────────────────────────────────────────────────
  const layerVisual = (it) => {
    if (it.visual === 'web')
      return `<div class="mini-web" aria-hidden="true"><div class="mini-web__bar"><i></i><i></i><i></i></div><div class="mini-web__body"><b></b><span></span><span></span><em></em><u></u></div></div>`;
    if (it.visual === 'edit')
      return `<div class="mini-edit">${phone(media(it.video), 'phone--mini')}<span class="sub-chip" aria-hidden="true"><span>subtitles</span><span>that</span><span>pop</span></span></div>`;
    return `<div class="frame169">${media(it.video)}</div>`;
  };

  const layers = (n) => {
    const l = c.layers;
    return `
    <div class="wrap">
      <h2 class="h2" id="clip-${n}-title" data-reveal>${esc(l.title)}</h2>
      <div class="layers">
        ${l.items
          .map(
            (it) => `
          <article class="layer" data-reveal>
            <div class="layer__visual">${layerVisual(it)}</div>
            <div class="layer__body">
              <p class="layer__track mono">${esc(it.track)} <span>/ ${esc(it.name.toUpperCase())}</span></p>
              <h3 class="h3">${esc(it.name)}</h3>
              <p>${esc(it.text)}</p>
            </div>
          </article>`
          )
          .join('')}
      </div>
      <p class="tagline" data-reveal>${esc(l.tagline)}</p>
    </div>`;
  };

  // ── CLIP: proof ──────────────────────────────────────────────────────────
  const shot = (name, kind, alt) =>
    `<img src="${asset(`shots/${name}-${kind}.webp`)}" alt="${esc(alt)}" loading="lazy" decoding="async" ${kind === 'mobile' ? 'width="540" height="1170"' : 'width="960" height="600"'}>`;

  const webCard = (it, i) => `
    <article class="wcard" data-reveal>
      <button class="wcard__devices" type="button" data-viewer="${i}" aria-label="Preview ${esc(it.name)} screenshots">
        <span class="laptop"><span class="laptop__screen">${shot(it.shot, 'desktop', `${it.name} website, desktop`)}</span></span>
        <span class="phone phone--proof"><span class="phone__screen">${shot(it.shot, 'mobile', `${it.name} website, mobile`)}</span></span>
        <span class="wcard__hint mono">TAP TO SCROLL</span>
      </button>
      <h4 class="h4">${esc(it.name)}</h4>
      <p>${esc(it.text)}${it.credit ? ` <em class="credit">${esc(it.credit)}</em>` : ''}</p>
      <a class="link mono" href="${esc(it.url)}" target="_blank" rel="noopener">${esc(it.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))} ${icon.out}</a>
    </article>`;

  const motionCard = (it) => `
    <article class="mcard" data-reveal>
      <div class="frame169">${
        it.video
          ? video(it.video, it.name, it.poster)
          : it.poster
            ? `<img src="${asset(`posters/${it.poster}.webp`)}" alt="${esc(it.name)} still" loading="lazy" decoding="async" width="800" height="450">`
            : slate(it.placeholder)
      }</div>
      <h4 class="h4">${esc(it.name)}</h4>
      <p>${esc(it.text)}</p>
      ${it.url ? `<a class="link mono" href="${esc(it.url)}" target="_blank" rel="noopener">Watch ${icon.out}</a>` : ''}
    </article>`;

  const shortCard = (it) => `
    <a class="scard" href="${esc(it.url)}" target="_blank" rel="noopener" data-reveal>
      ${phone(slate(it.placeholder, 'POSTER'), 'phone--short')}
      <span class="scard__name">${esc(it.name)} ${icon.out}</span>
    </a>`;

  const proof = (n) => {
    const p = c.proof;
    return `
    <div class="wrap">
      <h2 class="h2" id="clip-${n}-title" data-reveal>${esc(p.title)}</h2>
      <div class="proof-group">
        <h3 class="proof-group__h mono" data-reveal><span>V3</span> ${esc(p.web.heading)}</h3>
        <div class="wgrid">${p.web.items.map(webCard).join('')}</div>
      </div>
      <div class="proof-group">
        <h3 class="proof-group__h mono" data-reveal><span>V2</span> ${esc(p.motion.heading)}</h3>
        <div class="mgrid">${p.motion.items.map(motionCard).join('')}</div>
      </div>
      <div class="proof-group">
        <h3 class="proof-group__h mono" data-reveal><span>V1</span> ${esc(p.shortform.heading)}</h3>
        <div class="sgrid">${p.shortform.items.map(shortCard).join('')}</div>
        <p class="proof-note" data-reveal>${esc(p.shortform.note)}</p>
      </div>
      <aside class="tools" data-reveal>
        <svg class="tools__graph" viewBox="0 0 220 120" aria-hidden="true">
          <path d="M44 30 C80 30 76 60 110 60 M44 90 C80 90 76 60 110 60 M150 60 C170 60 168 40 186 40 M150 60 C170 60 168 82 186 82" />
          <rect x="8" y="20" width="36" height="20" rx="4"/><rect x="8" y="80" width="36" height="20" rx="4"/>
          <rect x="110" y="48" width="40" height="24" rx="4" class="hot"/><rect x="186" y="30" width="28" height="20" rx="4"/><rect x="186" y="72" width="28" height="20" rx="4"/>
        </svg>
        <div>
          <p class="mono tools__label">${esc(p.tools.label)}</p>
          <p class="tools__text">${esc(p.tools.text)}</p>
        </div>
      </aside>
    </div>`;
  };

  // ── CLIP: sample (optional) ──────────────────────────────────────────────
  const sample = (n) => {
    const s = c.sample;
    const devices = s.shot
      ? `<span class="laptop"><span class="laptop__screen">${shot(s.shot, 'desktop', 'Sample founder site, desktop')}</span></span>
         <span class="phone phone--proof"><span class="phone__screen">${shot(s.shot, 'mobile', 'Sample founder site, mobile')}</span></span>`
      : `<span class="laptop"><span class="laptop__screen">${slate('sample-founder-desktop.webp', 'SHOT')}</span></span>`;
    return `
    <div class="wrap sample">
      <div data-reveal>
        <h2 class="h2" id="clip-${n}-title">${esc(s.text)}</h2>
        <a class="btn btn--ghost" href="${esc(s.url)}" target="_blank" rel="noopener">Open the sample site ${icon.out}</a>
      </div>
      <div class="sample__devices wcard__devices" data-reveal>${devices}</div>
    </div>`;
  };

  // ── CLIP: how part-time works ────────────────────────────────────────────
  const clock = (who, city) => `
    <figure class="clock" data-clock="${who}">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="46" class="clock__face"/>
        ${Array.from({ length: 12 }, (_, i) => `<line x1="50" y1="8" x2="50" y2="${i % 3 ? 12 : 15}" transform="rotate(${i * 30} 50 50)" class="clock__tick"/>`).join('')}
        <line x1="50" y1="50" x2="50" y2="28" class="clock__h"/>
        <line x1="50" y1="50" x2="50" y2="16" class="clock__m"/>
        <circle cx="50" cy="50" r="3" class="clock__pin"/>
      </svg>
      <figcaption><span class="mono clock__city">${esc(city.toUpperCase())}</span><span class="clock__time mono">--:--</span></figcaption>
    </figure>`;

  const partTime = (n) => {
    const p = c.partTime;
    const cap = c.capacity;
    const o = p.overnight;
    const words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five'];
    const rounds = cap.revisionRounds == null ? ph(null) : esc(words[cap.revisionRounds] ?? cap.revisionRounds);
    const steps = p.process.steps.map((s) => fill(s, { days: ph(cap.firstDraftDays), rounds }));
    return `
    <div class="wrap">
      <h2 class="h2" id="clip-${n}-title" data-reveal>${esc(p.title)}</h2>
      <div class="pt-cards">
        <div class="pt-card" data-reveal><p class="mono pt-label">${esc(p.dayJob.label)}</p><p>${esc(p.dayJob.text)}</p></div>
        <div class="pt-card pt-card--accent" data-reveal><p class="mono pt-label">${esc(p.capacity.label)}</p><p>${fill(p.capacity.text, { hours: ph(cap.hoursPerWeek) })}</p></div>
      </div>
      <div class="overnight" data-reveal data-overnight>
        <p class="mono pt-label">${esc(o.label)}</p>
        <p class="overnight__text">${esc(o.text)}</p>
        <div class="clocks">
          ${clock('recipient', c.recipient.city)}
          <p class="clocks__status mono" aria-live="off"><span data-status>BRIEF SENT</span></p>
          ${clock('sender', c.sender.city)}
        </div>
        <div class="ntrack" aria-hidden="true">
          <div class="ntrack__row" data-row="recipient"><span class="ntrack__name mono">${esc(c.recipient.city.toUpperCase())}</span><div class="ntrack__lane"></div></div>
          <div class="ntrack__row" data-row="sender"><span class="ntrack__name mono">${esc(c.sender.city.toUpperCase())}</span><div class="ntrack__lane"></div></div>
        </div>
        <p class="overnight__now mono" data-now>${esc(o.offsetFallback)}</p>
      </div>
      <div class="process" data-reveal>
        <p class="mono pt-label">${esc(p.process.label)}</p>
        <ol class="process__steps">${steps.map((s, i) => `<li><span class="mono">${two(i + 1)}</span>${s}</li>`).join('')}</ol>
        <p class="process__async">${esc(p.process.async)}</p>
      </div>
    </div>`;
  };

  // ── CLIP: ways to work ───────────────────────────────────────────────────
  const offers = (n) => {
    const o = c.offers;
    return `
    <div class="wrap">
      <h2 class="h2" id="clip-${n}-title" data-reveal>${esc(o.title)}</h2>
      <div class="offers">
        ${o.items
          .map(
            (it) => `
          <article class="offer" data-reveal>
            <p class="mono offer__tag"><span>${esc(it.tag)}</span><span aria-hidden="true">IN ▸ OUT</span></p>
            <h3 class="h3">${esc(it.name)}</h3>
            <p>${esc(it.text)}</p>
          </article>`
          )
          .join('')}
      </div>
      <p class="offers__note mono" data-reveal>${esc(o.note)}</p>
    </div>`;
  };

  // ── CLIP: about ──────────────────────────────────────────────────────────
  const about = (n) => {
    const a = c.about;
    const s = c.sender;
    return `
    <div class="wrap about">
      <div class="about__photo" data-reveal>
        <img src="${asset(`img/${a.photo.src}-480.webp`)}" srcset="${asset(`img/${a.photo.src}-480.webp`)} 480w, ${asset(`img/${a.photo.src}-800.webp`)} 800w"
          sizes="(min-width: 900px) 400px, 80vw" alt="${esc(a.photo.alt)}" loading="lazy" decoding="async" width="480" height="480">
        <span class="vf" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      </div>
      <div class="about__body" data-reveal>
        <h2 class="h2" id="clip-${n}-title">${esc(a.title)}</h2>
        <dl class="facts">${a.facts.map(([k, v]) => `<div><dt class="mono">${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        <p class="about__links">
          <a class="btn btn--ghost" href="${esc(s.portfolio)}" target="_blank" rel="noopener">Full portfolio ${icon.out}</a>
          <a class="btn btn--ghost" href="${esc(s.cv)}" target="_blank" rel="noopener">CV ${icon.out}</a>
        </p>
      </div>
    </div>`;
  };

  // ── CLIP: end card ───────────────────────────────────────────────────────
  const end = (n) => {
    const e = c.end;
    const s = c.sender;
    const wa = `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(e.whatsappText)}`;
    return `
    <div class="wrap endcard">
      <h2 class="endcard__title" id="clip-${n}-title" data-reveal>${esc(e.headline)}</h2>
      <div class="endcard__ctas" data-reveal>
        <a class="btn btn--primary" href="${wa}" target="_blank" rel="noopener">${icon.wa} WhatsApp</a>
        <a class="btn btn--ghost" href="mailto:${esc(s.email)}">${icon.mail} ${esc(s.email)}</a>
        ${s.booking ? `<a class="btn btn--ghost" href="${esc(s.booking)}" target="_blank" rel="noopener">${icon.cal} Book a time</a>` : ''}
      </div>
      <ul class="endcard__links mono" data-reveal>
        <li><a href="${esc(s.portfolio)}" target="_blank" rel="noopener">Portfolio</a></li>
        <li><a href="${esc(s.cv)}" target="_blank" rel="noopener">CV</a></li>
        <li><a href="${esc(s.linkedin)}" target="_blank" rel="noopener">LinkedIn</a></li>
        <li><a href="${esc(s.github)}" target="_blank" rel="noopener">GitHub</a></li>
      </ul>
      <div class="slate-end mono" aria-hidden="true">
        <span>${esc(s.name.toUpperCase())}</span><span>${esc(c.site.ogLine.toUpperCase())}</span><span data-year></span>
      </div>
      <p class="footer-note">${esc(e.footer)}</p>
    </div>`;
  };

  // ── page ─────────────────────────────────────────────────────────────────
  const sections = () => {
    const sampleOn = c.sample.enabled && !!c.sample.url;
    return [
      { key: 'open', name: c.hero.clip, html: hero },
      { key: 'gap', name: c.gap.clip, html: gap },
      { key: 'layers', name: c.layers.clip, html: layers },
      { key: 'proof', name: c.proof.clip, html: proof },
      sampleOn && { key: 'sample', name: c.sample.clip, html: sample },
      { key: 'parttime', name: c.partTime.clip, html: partTime },
      { key: 'offers', name: c.offers.clip, html: offers },
      { key: 'about', name: c.about.clip, html: about },
      { key: 'end', name: c.end.clip, html: end },
    ].filter(Boolean);
  };

  const scrubber = (list) => `
    <nav class="scrubber" aria-label="Timeline: jump to a clip">
      <div class="scrubber__meta mono">
        <span class="scrubber__rec"><span class="rec-dot" aria-hidden="true"></span>REC</span>
        <span class="scrubber__tc" aria-hidden="true">00:00:00:00</span>
        <span class="scrubber__clip" aria-hidden="true">CLIP 00 — ${esc(list[0].name)}</span>
      </div>
      <div class="scrubber__track">
        <span class="scrubber__fill" aria-hidden="true"></span>
        <span class="scrubber__head" aria-hidden="true"></span>
        <ol class="scrubber__markers">
          ${list
            .map(
              (s, i) =>
                `<li><a class="marker" href="#clip-${two(i)}" data-marker="${i}" style="left:${(i / (list.length - 1)) * 100}%"><span class="marker__n mono" aria-hidden="true">${two(i)}</span><span class="sr">Clip ${two(i)}: ${esc(s.name.toLowerCase())}</span></a></li>`
            )
            .join('')}
        </ol>
      </div>
    </nav>`;

  const viewer = () => `
    <dialog class="viewer" aria-labelledby="viewer-title" data-lenis-prevent>
      <div class="viewer__bar">
        <p class="mono" id="viewer-title"></p>
        <div class="viewer__tabs" role="group" aria-label="Screenshot size">
          <button type="button" class="mono" data-kind="mobile" aria-pressed="true">Mobile</button>
          <button type="button" class="mono" data-kind="desktop" aria-pressed="false">Desktop</button>
        </div>
        <a class="mono viewer__visit" href="${esc(c.sender.portfolio)}" target="_blank" rel="noopener">Visit ${icon.out}</a>
        <button type="button" class="viewer__close" aria-label="Close preview">×</button>
      </div>
      <div class="viewer__scroll" data-lenis-prevent><img alt="" decoding="async"></div>
    </dialog>`;

  const body = () => {
    const list = sections();
    return `
    <a class="skip" href="#clip-01">Skip to the pitch</a>
    ${scrubber(list)}
    <main>
      ${list
        .map(
          (s, i) => `
        <section class="clip clip--${s.key}" id="clip-${two(i)}" data-clip="${i}" data-name="${esc(s.name)}" aria-labelledby="clip-${two(i)}-title" tabindex="-1">
          ${clipHead(i, s.name)}
          ${s.html(two(i))}
        </section>`
        )
        .join('')}
    </main>
    ${viewer()}`;
  };

  const head = () => {
    const s = c.site;
    const og = new URL(s.ogImage, s.url).href;
    const tags = [
      `<title>${esc(s.title)}</title>`,
      `<meta name="description" content="${esc(s.description)}">`,
      s.noindex && '<meta name="robots" content="noindex, nofollow">',
      `<meta name="theme-color" content="#0B0B0C">`,
      `<link rel="canonical" href="${esc(s.url)}">`,
      `<meta property="og:type" content="website">`,
      `<meta property="og:url" content="${esc(s.url)}">`,
      `<meta property="og:title" content="${esc(s.title)}">`,
      `<meta property="og:description" content="${esc(s.description)}">`,
      `<meta property="og:image" content="${esc(og)}">`,
      `<meta property="og:image:width" content="1200">`,
      `<meta property="og:image:height" content="630">`,
      `<meta property="og:image:alt" content="${esc(s.ogLine)}">`,
      `<meta name="twitter:card" content="summary_large_image">`,
      `<meta name="twitter:title" content="${esc(s.title)}">`,
      `<meta name="twitter:description" content="${esc(s.description)}">`,
      `<meta name="twitter:image" content="${esc(og)}">`,
      `<style>:root{--accent:${esc(s.accent)}}</style>`,
      c.analytics.enabled && c.analytics.goatcounterCode
        ? `<script data-goatcounter="https://${esc(c.analytics.goatcounterCode)}.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>`
        : '',
    ];
    return tags.filter(Boolean).join('\n    ');
  };

  return { head, body, sections };
}
