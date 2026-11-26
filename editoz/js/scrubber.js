// Fixed timeline scrubber: fill, playhead, running timecode, clip markers.
import { formatTimecode } from './timecode.js';

export function initScrubber({ content, barOffset }) {
  const nav = document.querySelector('.scrubber');
  const tc = nav.querySelector('.scrubber__tc');
  const clipName = nav.querySelector('.scrubber__clip');
  const fill = nav.querySelector('.scrubber__fill');
  const head = nav.querySelector('.scrubber__head');
  const track = nav.querySelector('.scrubber__track');
  const markers = [...nav.querySelectorAll('.marker')];
  const sections = [...document.querySelectorAll('.clip')];
  const { fps, durationSeconds, endLabel } = content.timeline;
  const total = fps * durationSeconds;
  const two = (n) => String(n).padStart(2, '0');

  let max = 1;
  let trackW = 0;
  let tops = []; // scroll position where each clip starts, 0–1
  let current = -1;

  function measure() {
    max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    trackW = track.clientWidth;
    tops = sections.map((s) => Math.min(1, Math.max(0, (s.getBoundingClientRect().top + scrollY - barOffset()) / max)));
    // keep markers at least one tap target apart where clips sit close together
    const GAP = 24;
    const px = tops.map((p) => p * trackW);
    for (let i = 1; i < px.length; i++) px[i] = Math.max(px[i], px[i - 1] + GAP);
    for (let i = px.length - 1; i >= 0; i--) px[i] = Math.min(px[i], (i === px.length - 1 ? trackW : px[i + 1] - GAP));
    px.forEach((x, i) => (markers[i].style.left = `${x}px`));
    tops.forEach((p, i) => {
      const tin = sections[i].querySelector('[data-tc-in]');
      if (tin) tin.textContent = `IN ${formatTimecode(Math.round(p * total), fps)}`;
    });
  }

  function update() {
    const p = Math.min(1, Math.max(0, scrollY / max));
    fill.style.transform = `scaleX(${p})`;
    head.style.transform = `translateX(${p * trackW}px)`;
    const end = p > 0.995;
    tc.textContent = end ? endLabel : formatTimecode(Math.round(p * total), fps);
    tc.classList.toggle('is-end', end);

    // a clip is "current" once its top passes 40% of the viewport
    const line = scrollY + innerHeight * 0.4;
    let idx = 0;
    sections.forEach((s, i) => {
      if (s.offsetTop <= line) idx = i;
    });
    if (end) idx = sections.length - 1;
    if (idx !== current) {
      current = idx;
      clipName.textContent = `CLIP ${two(idx)} — ${sections[idx].dataset.name}`;
      markers.forEach((m, i) => {
        m.classList.toggle('is-past', i <= idx);
        if (i === idx) m.setAttribute('aria-current', 'step');
        else m.removeAttribute('aria-current');
      });
    }
  }

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      update();
    });
  };

  measure();
  update();
  addEventListener('scroll', onScroll, { passive: true });
  new ResizeObserver(() => {
    measure();
    update();
  }).observe(document.body);
}
