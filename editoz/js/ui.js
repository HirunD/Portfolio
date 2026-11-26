// Reveal-on-enter, lazy looping video, CSS loops that only run on screen,
// and the screenshot preview dialog.

export function initReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
}

export function initMedia({ reduced }) {
  const load = (v) => {
    if (v.dataset.loaded) return;
    v.querySelectorAll('source[data-src]').forEach((s) => (s.src = s.dataset.src));
    v.dataset.loaded = '1';
    v.load();
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target;
        if (e.isIntersecting) {
          load(v);
          if (!reduced) v.play().catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      }
    },
    { rootMargin: '200px 0px' }
  );
  document.querySelectorAll('video.lazy-video').forEach((v) => io.observe(v));

  // CSS loops (mini web build, subtitle chips) only run while visible
  const loops = new IntersectionObserver((entries) => {
    for (const e of entries) e.target.classList.toggle('is-playing', e.isIntersecting);
  });
  document.querySelectorAll('.layer__visual').forEach((el) => loops.observe(el));
}

export function initViewer({ content, lenis }) {
  const dlg = document.querySelector('.viewer');
  if (!dlg) return;
  const title = dlg.querySelector('#viewer-title');
  const img = dlg.querySelector('img');
  const visit = dlg.querySelector('.viewer__visit');
  const tabs = [...dlg.querySelectorAll('[data-kind]')];
  const scroller = dlg.querySelector('.viewer__scroll');
  const items = content.proof.web.items;
  const base = content.site.base;
  let item = null;

  const show = (kind) => {
    tabs.forEach((t) => t.setAttribute('aria-pressed', String(t.dataset.kind === kind)));
    img.src = `${base}assets/shots/${item.shot}-${kind}.webp`;
    img.alt = `${item.name}, ${kind} screenshot`;
    img.classList.toggle('is-mobile', kind === 'mobile');
    scroller.scrollTop = 0;
  };

  document.querySelectorAll('[data-viewer]').forEach((btn) =>
    btn.addEventListener('click', () => {
      item = items[Number(btn.dataset.viewer)];
      title.textContent = item.name;
      visit.href = item.url;
      show(innerWidth < 700 ? 'mobile' : 'desktop');
      dlg.showModal();
      lenis?.stop();
    })
  );
  tabs.forEach((t) => t.addEventListener('click', () => show(t.dataset.kind)));
  dlg.querySelector('.viewer__close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => e.target === dlg && dlg.close());
  dlg.addEventListener('close', () => lenis?.start());
}
