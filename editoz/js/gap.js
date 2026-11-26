// CLIP 01: reel → tap profile → tap link → dull link page → landing page
// assembles itself. One GSAP timeline scrubbed by the sticky section.
import { formatTimecode } from './timecode.js';

// Timeline units (not seconds). Bar offsets in styles.css match ASM + LAYERS.
const T = { taps: 2, profile: 2.85, link: 3.0, bio: 3.75, out: 5.2, site: 5.35, end: 8.4, hold: 9.6 };
const ASM = 5.4; // assembly starts
const LAYERS = { hero: 0.15, photo: 0.32, creds: 0.49, logos: 0.66, cta: 0.83 }; // fraction of assembly window
const STEP_AT = [0, T.taps, T.bio, T.out, T.end];

const compact = (v) =>
  v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${Math.round(v / 1e3)}K` : String(Math.round(v));

export function initGap({ gsap, ScrollTrigger, content, reduced }) {
  const sec = document.querySelector('.clip--gap');
  if (!sec) return;
  if (reduced) {
    sec.classList.add('gap--static');
    return;
  }
  sec.classList.add('gap--motion');

  const screen = sec.querySelector('.phone--gap .phone__screen');
  const $ = (s) => screen.querySelector(s);
  const reel = $('.scene--reel');
  const profile = $('.scene--profile');
  const bio = $('.scene--bio');
  const site = $('.scene--site');
  const touch = $('.touch');
  const ripple = touch.firstElementChild;
  const count = $('.views-count');
  const layer = (k) => site.querySelector(`[data-layer="${k}"]`);
  const steps = [...sec.querySelectorAll('.gap__step')];
  const ltc = sec.querySelector('.ltrack__tc');
  const bar = (k) => sec.querySelector(`[data-bar="${k}"]`);
  const { value, label } = content.stats.reelViews;
  const { fps } = content.timeline;

  // where to "tap", as % of the screen, measured from the real elements
  const at = (el, axis) => () => {
    const s = screen.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return axis === 'x' ? `${((r.left + r.width / 2 - s.left) / s.width) * 100}%` : `${((r.top + r.height / 2 - s.top) / s.height) * 100}%`;
  };
  const avatar = $('[data-tap="avatar"]');
  const link = $('[data-tap="link"]');

  gsap.set([profile, bio, site], { autoAlpha: 0 });
  gsap.set(touch, { autoAlpha: 0, left: '50%', top: '86%' });
  count.textContent = '0';

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
  const counter = { v: 0 };

  // 1. views tick up fast
  tl.to(counter, {
    v: value,
    duration: T.taps,
    ease: 'power3.in',
    onUpdate: () => (count.textContent = counter.v >= value * 0.999 ? label : compact(counter.v)),
  }, 0);

  // 2. thumb taps the profile avatar, cut to profile, taps the link
  const tap = (t) => {
    tl.fromTo(ripple, { scale: 1, autoAlpha: 1 }, { scale: 2.4, autoAlpha: 0, duration: 0.25, immediateRender: false }, t);
    tl.to(touch, { scale: 0.82, duration: 0.08, yoyo: true, repeat: 1, ease: 'none' }, t - 0.04);
  };
  tl.to(touch, { autoAlpha: 1, duration: 0.12 }, T.taps);
  tl.to(touch, { left: at(avatar, 'x'), top: at(avatar, 'y'), duration: 0.5, ease: 'power2.inOut' }, T.taps + 0.05);
  tap(T.taps + 0.62);
  tl.set(profile, { autoAlpha: 1 }, T.profile).set(reel, { autoAlpha: 0 }, T.profile);
  tl.to(touch, { left: at(link, 'x'), top: at(link, 'y'), duration: 0.5, ease: 'power2.inOut' }, T.link);
  tap(T.link + 0.55);

  // 3. hard cut to the dull link-in-bio page, then hold
  tl.set(bio, { autoAlpha: 1 }, T.bio).set(profile, { autoAlpha: 0 }, T.bio);
  tl.to(touch, { autoAlpha: 0, duration: 0.1 }, T.bio);

  // 4. the dull page drops out, the landing page builds layer by layer
  tl.to(bio, { autoAlpha: 0, scale: 0.92, duration: 0.25, ease: 'power2.in' }, T.out);
  tl.set(site, { autoAlpha: 1 }, T.site);
  const kids = ['nav', ...Object.keys(LAYERS)].map(layer);
  tl.set(kids, { autoAlpha: 0 }, 0);
  tl.fromTo(layer('nav'), { yPercent: -160 }, { yPercent: 0, autoAlpha: 1, duration: 0.35, ease: 'expo.out' }, ASM + 0.02);

  const win = T.end - ASM;
  const from = {
    hero: { x: -40 },
    photo: { clipPath: 'inset(0% 0% 100% 0%)', scale: 1.06 },
    creds: { y: 26 },
    logos: { x: 36 },
    cta: { scale: 0.5 },
  };
  const to = {
    hero: { x: 0 },
    photo: { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 },
    creds: { y: 0 },
    logos: { x: 0 },
    cta: { scale: 1, ease: 'back.out(2.2)' },
  };
  for (const [k, f] of Object.entries(LAYERS)) {
    const t = ASM + f * win;
    tl.fromTo(layer(k), { ...from[k], autoAlpha: 0 }, { ease: 'expo.out', ...to[k], autoAlpha: 1, duration: 0.4 }, t);
    tl.fromTo(bar(k), { scaleX: 0 }, { scaleX: 1, duration: T.end - t, ease: 'none' }, t);
  }
  tl.fromTo('.ltrack__ph', { left: '0%' }, { left: '100%', duration: win, ease: 'none' }, ASM);
  tl.to({}, { duration: T.hold - T.end }, T.end); // hold the final frame

  let step = -1;
  ScrollTrigger.create({
    trigger: sec.querySelector('.gap__sticky'),
    start: () => `top ${innerWidth >= 900 ? 52 : 0}px`,
    endTrigger: sec,
    end: 'bottom bottom',
    scrub: 0.35,
    animation: tl,
    invalidateOnRefresh: true,
    onUpdate(self) {
      const t = self.progress * tl.duration();
      const next = STEP_AT.findLastIndex((s) => t >= s);
      if (next !== step) {
        step = next;
        steps.forEach((el, i) => el.classList.toggle('is-on', i === step));
      }
      const asm = Math.min(Math.max((t - ASM) / win, 0), 1);
      ltc.textContent = formatTimecode(Math.round(asm * 4 * fps), fps);
    },
  });
  steps[0].classList.add('is-on');
}
