import content from './content.js';
import { initScrubber } from './scrubber.js';
import { initGap } from './gap.js';
import { initOvernight } from './overnight.js';
import { initReveal, initMedia, initViewer } from './ui.js';

// GSAP, ScrollTrigger and Lenis are plain scripts from js/vendor/ (see index.html)
const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const barOffset = () => (innerWidth >= 900 ? 52 : 0); // desktop scrubber sits on top

let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.12 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

// in-page jumps (markers, scroll cue, skip link): snappy, then move focus
function goTo(target) {
  const done = () => target.focus({ preventScroll: true });
  if (lenis) lenis.scrollTo(target, { offset: -barOffset(), duration: 0.9, easing: (t) => 1 - Math.pow(1 - t, 4), onComplete: done });
  else {
    scrollTo({ top: target.getBoundingClientRect().top + scrollY - barOffset() });
    done();
  }
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#clip-"]');
  if (!a) return;
  const target = document.querySelector(a.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  goTo(target);
  history.replaceState(null, '', a.getAttribute('href'));
});

// hero: the only other scroll-scrubbed motion
if (!reduced) {
  gsap.timeline({ scrollTrigger: { trigger: '.clip--open', start: 'top top', end: 'bottom top', scrub: 0.3 } })
    .to('.hero__copy', { yPercent: -10, autoAlpha: 0.15, ease: 'none' }, 0)
    .to('.hero__media', { y: 80, scale: 0.94, ease: 'none' }, 0);
  gsap.from(['.hero__label', '.hero__media', '.cue'], { autoAlpha: 0, y: 16, duration: 0.4, stagger: 0.08, ease: 'expo.out' });
}

initScrubber({ content, barOffset });
initGap({ gsap, ScrollTrigger, content, reduced });
initOvernight({ gsap, content, reduced });
initMedia({ reduced });
initViewer({ content, lenis });
if (!reduced) initReveal();

const year = document.querySelector('[data-year]');
if (year) year.textContent = new Date().getFullYear();

document.fonts?.ready.then(() => ScrollTrigger.refresh());
addEventListener('load', () => ScrollTrigger.refresh());
